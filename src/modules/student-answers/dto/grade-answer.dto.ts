import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class GradeAnswerDto {
  @IsNumber()
  @Min(0)
  pointsEarned: number;

  @IsString()
  @IsOptional()
  tutorFeedback?: string;
}
