import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsString()
  @IsIn(['multiple_choice', 'essay', 'short_answer'])
  questionType: 'multiple_choice' | 'essay' | 'short_answer';

  @IsArray()
  @IsOptional()
  choices?: string[];

  @IsString()
  @IsNotEmpty()
  answerText: string;

  @IsInt()
  @Min(1)
  points: number;
}

export class CreateQuizTemplateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsArray()
  @IsInt({ each: true })
  gradeLevels: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
