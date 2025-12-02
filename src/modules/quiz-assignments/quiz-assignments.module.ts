import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAssignmentsController } from './quiz-assignments.controller';
import { QuizAssignmentsService } from './quiz-assignments.service';
import { QuizAssignment } from './entities/quiz-assignment.entity';
import { QuizTemplatesModule } from '../quiz-templates/quiz-templates.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAssignment]), QuizTemplatesModule],
  controllers: [QuizAssignmentsController],
  providers: [QuizAssignmentsService],
  exports: [TypeOrmModule, QuizAssignmentsService],
})
export class QuizAssignmentsModule {}
