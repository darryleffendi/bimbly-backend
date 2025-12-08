import { Injectable } from '@nestjs/common';
import { StudentAnswer } from './entities/student-answer.entity';

@Injectable()
export class GradingService {
  gradeMultipleChoice(studentAnswer: string, correctAnswer: string, points: number): { isCorrect: boolean; pointsEarned: number } {
    const isCorrect = studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      pointsEarned: isCorrect ? points : 0,
    };
  }

  gradeShortAnswer(studentAnswer: string, correctAnswer: string, points: number): { isCorrect: boolean; pointsEarned: number } {
    const isCorrect = studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    return {
      isCorrect,
      pointsEarned: isCorrect ? points : 0,
    };
  }

  autoGrade(answer: StudentAnswer): StudentAnswer {
    if (!answer.studentAnswer) {
      return answer;
    }

    if (answer.questionType === 'multiple_choice') {
      const result = this.gradeMultipleChoice(answer.studentAnswer, answer.correctAnswer, answer.questionPoints);
      answer.isCorrect = result.isCorrect;
      answer.pointsEarned = result.pointsEarned;
    } else if (answer.questionType === 'short_answer') {
      const result = this.gradeShortAnswer(answer.studentAnswer, answer.correctAnswer, answer.questionPoints);
      answer.isCorrect = result.isCorrect;
      answer.pointsEarned = result.pointsEarned;
    }

    return answer;
  }
}
