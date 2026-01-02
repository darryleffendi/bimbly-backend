import { IsArray, ValidateNested, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GradeAnswerInput {
  @IsNumber()
  @Min(0)
  questionIndex: number;

  @IsNumber()
  @Min(0)
  pointsEarned: number;

  @IsString()
  @IsOptional()
  tutorFeedback?: string;
}

export class CompleteGradingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeAnswerInput)
  grades: GradeAnswerInput[];
}
