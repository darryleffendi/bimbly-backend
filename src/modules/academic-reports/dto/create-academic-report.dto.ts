import { IsUUID, IsInt, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAcademicReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  grade: number;

  @IsUUID()
  subjectId: string;

  @IsObject()
  subtopicScores: Record<string, number>;
}
