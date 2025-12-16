import { IsString, IsInt, Min, Max, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreateAcademicReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  grade: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  subject: string;

  @IsObject()
  subtopicScores: Record<string, number>;
}
