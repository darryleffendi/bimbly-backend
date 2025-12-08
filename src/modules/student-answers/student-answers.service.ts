import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentAnswer } from './entities/student-answer.entity';
import { QuizAssignment } from '../quiz-assignments/entities/quiz-assignment.entity';
import { QuizTemplate } from '../quiz-templates/entities/quiz-template.entity';
import { QuizAssignmentsService } from '../quiz-assignments/quiz-assignments.service';
import { GradingService } from './grading.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';

@Injectable()
export class StudentAnswersService {
  constructor(
    @InjectRepository(StudentAnswer)
    private studentAnswersRepository: Repository<StudentAnswer>,
    @InjectRepository(QuizAssignment)
    private quizAssignmentsRepository: Repository<QuizAssignment>,
    @InjectRepository(QuizTemplate)
    private quizTemplatesRepository: Repository<QuizTemplate>,
    private quizAssignmentsService: QuizAssignmentsService,
    private gradingService: GradingService,
  ) {}

  async saveAnswer(studentId: string, saveDto: SaveAnswerDto): Promise<StudentAnswer> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id: saveDto.assignmentId, studentId },
      relations: ['quizTemplate'],
    });

    if (!assignment) {
      throw new NotFoundException('Quiz assignment not found');
    }

    const template = assignment.quizTemplate;
    const question = template.questions[saveDto.questionIndex];

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    let answer = await this.studentAnswersRepository.findOne({
      where: {
        assignmentId: saveDto.assignmentId,
        questionIndex: saveDto.questionIndex,
      },
    });

    if (!answer) {
      answer = this.studentAnswersRepository.create({
        assignmentId: saveDto.assignmentId,
        questionIndex: saveDto.questionIndex,
        questionText: question.questionText,
        questionType: question.questionType,
        questionChoices: question.choices,
        correctAnswer: question.answerText,
        questionPoints: question.points,
        studentAnswer: saveDto.studentAnswer,
        pointsEarned: 0,
      });
    } else {
      answer.studentAnswer = saveDto.studentAnswer;
    }

    answer = this.gradingService.autoGrade(answer);

    return this.studentAnswersRepository.save(answer);
  }

  async getAnswersByAssignment(assignmentId: string): Promise<StudentAnswer[]> {
    return this.studentAnswersRepository.find({
      where: { assignmentId },
      order: { questionIndex: 'ASC' },
    });
  }

  async gradeEssay(assignmentId: string, questionIndex: number, tutorId: string, gradeDto: GradeAnswerDto): Promise<StudentAnswer> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id: assignmentId, tutorId },
    });

    if (!assignment) {
      throw new ForbiddenException('You can only grade your own assignments');
    }

    const answer = await this.studentAnswersRepository.findOne({
      where: { assignmentId, questionIndex },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.questionType !== 'essay') {
      throw new ForbiddenException('Can only manually grade essay questions');
    }

    if (gradeDto.pointsEarned > answer.questionPoints) {
      throw new ForbiddenException('Points earned cannot exceed question points');
    }

    answer.pointsEarned = gradeDto.pointsEarned;
    answer.isCorrect = gradeDto.pointsEarned === answer.questionPoints;
    answer.tutorFeedback = gradeDto.tutorFeedback;

    const savedAnswer = await this.studentAnswersRepository.save(answer);
    await this.calculateAndUpdateScore(assignmentId);

    return savedAnswer;
  }

  async calculateAndUpdateScore(assignmentId: string): Promise<void> {
    const answers = await this.studentAnswersRepository.find({
      where: { assignmentId },
    });

    const totalPoints = answers.reduce((sum, a) => sum + a.questionPoints, 0);
    const earnedPoints = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    const allGraded = answers.every(a => a.questionType !== 'essay' || a.isCorrect !== null);

    await this.quizAssignmentsService.updateScore(assignmentId, Math.round(score * 100) / 100);
  }
}
