import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizTemplatesController } from './quiz-templates.controller';
import { QuizTemplatesService } from './quiz-templates.service';
import { QuizTemplate } from './entities/quiz-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizTemplate])],
  controllers: [QuizTemplatesController],
  providers: [QuizTemplatesService],
  exports: [TypeOrmModule],
})
export class QuizTemplatesModule {}
