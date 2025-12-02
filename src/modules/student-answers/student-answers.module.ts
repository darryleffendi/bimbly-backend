import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentAnswersController } from './student-answers.controller';
import { StudentAnswersService } from './student-answers.service';
import { StudentAnswer } from './entities/student-answer.entity';
import { GradingService } from './grading.service';
import { QuizAssignmentsModule } from '../quiz-assignments/quiz-assignments.module';
import { QuizTemplatesModule } from '../quiz-templates/quiz-templates.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudentAnswer]), QuizAssignmentsModule, QuizTemplatesModule],
  controllers: [StudentAnswersController],
  providers: [StudentAnswersService, GradingService],
  exports: [TypeOrmModule],
})
export class StudentAnswersModule {}
