import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAssignment, QuizAssignmentStatus } from './entities/quiz-assignment.entity';
import { QuizTemplate } from '../quiz-templates/entities/quiz-template.entity';
import { StudentAnswer } from '../student-answers/entities/student-answer.entity';
import { CreateQuizAssignmentDto } from './dto/create-quiz-assignment.dto';
import { CompleteGradingDto } from './dto/complete-grading.dto';

@Injectable()
export class QuizAssignmentsService {
  constructor(
    @InjectRepository(QuizAssignment)
    private quizAssignmentsRepository: Repository<QuizAssignment>,
    @InjectRepository(QuizTemplate)
    private quizTemplatesRepository: Repository<QuizTemplate>,
    @InjectRepository(StudentAnswer)
    private studentAnswersRepository: Repository<StudentAnswer>,
  ) {}

  async create(tutorId: string, createDto: CreateQuizAssignmentDto): Promise<QuizAssignment> {
    const template = await this.quizTemplatesRepository.findOne({
      where: { id: createDto.quizTemplateId },
    });

    if (!template) {
      throw new NotFoundException('Quiz template not found');
    }

    const assignment = this.quizAssignmentsRepository.create({
      ...createDto,
      tutorId,
      assignedAt: new Date(),
      status: QuizAssignmentStatus.ASSIGNED,
    });

    return this.quizAssignmentsRepository.save(assignment);
  }

  async findAllByStudent(studentId: string): Promise<QuizAssignment[]> {
    return this.quizAssignmentsRepository.find({
      where: { studentId },
      relations: ['quizTemplate'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findAllByTutor(tutorId: string): Promise<QuizAssignment[]> {
    return this.quizAssignmentsRepository.find({
      where: { tutorId },
      relations: ['quizTemplate', 'student'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<QuizAssignment> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id },
      relations: ['quizTemplate'],
    });

    if (!assignment) {
      throw new NotFoundException('Quiz assignment not found');
    }

    return assignment;
  }

  async startQuiz(id: string, studentId: string): Promise<QuizAssignment> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id, studentId },
    });

    if (!assignment) {
      throw new NotFoundException('Quiz assignment not found');
    }

    if (assignment.status !== QuizAssignmentStatus.ASSIGNED) {
      throw new BadRequestException('Quiz has already been started');
    }

    if (assignment.deadline && new Date() > new Date(assignment.deadline)) {
      throw new BadRequestException('Quiz deadline has passed');
    }

    assignment.startedAt = new Date();
    assignment.status = QuizAssignmentStatus.IN_PROGRESS;

    return this.quizAssignmentsRepository.save(assignment);
  }

  async submitQuiz(id: string, studentId: string): Promise<QuizAssignment> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id, studentId },
    });

    if (!assignment) {
      throw new NotFoundException('Quiz assignment not found');
    }

    if (assignment.status === QuizAssignmentStatus.SUBMITTED || assignment.status === QuizAssignmentStatus.GRADED) {
      throw new BadRequestException('Quiz has already been submitted');
    }

    assignment.submittedAt = new Date();
    assignment.status = QuizAssignmentStatus.SUBMITTED;

    return this.quizAssignmentsRepository.save(assignment);
  }

  async updateScore(id: string, score: number): Promise<QuizAssignment> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Quiz assignment not found');
    }

    assignment.score = score;
    assignment.status = QuizAssignmentStatus.GRADED;

    return this.quizAssignmentsRepository.save(assignment);
  }

  async completeGrading(id: string, tutorId: string, completeGradingDto: CompleteGradingDto): Promise<QuizAssignment> {
    const assignment = await this.quizAssignmentsRepository.findOne({
      where: { id, tutorId },
    });

    if (!assignment) {
      throw new ForbiddenException('You can only grade your own assignments');
    }

    for (const gradeInput of completeGradingDto.grades) {
      const answer = await this.studentAnswersRepository.findOne({
        where: { assignmentId: id, questionIndex: gradeInput.questionIndex },
      });

      if (!answer) {
        throw new NotFoundException(`Answer for question ${gradeInput.questionIndex} not found`);
      }

      if (answer.questionType === 'essay') {
        if (gradeInput.pointsEarned > answer.questionPoints) {
          throw new BadRequestException(`Points earned cannot exceed question points for question ${gradeInput.questionIndex}`);
        }

        answer.pointsEarned = gradeInput.pointsEarned;
        answer.isCorrect = gradeInput.pointsEarned === answer.questionPoints;
        answer.tutorFeedback = gradeInput.tutorFeedback;

        await this.studentAnswersRepository.save(answer);
      }
    }

    const allAnswers = await this.studentAnswersRepository.find({
      where: { assignmentId: id },
    });

    const totalPoints = allAnswers.reduce((sum, a) => sum + a.questionPoints, 0);
    const earnedPoints = allAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    assignment.score = Math.round(score * 100) / 100;
    assignment.status = QuizAssignmentStatus.GRADED;

    return this.quizAssignmentsRepository.save(assignment);
  }
}
