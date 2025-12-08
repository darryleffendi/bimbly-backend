import { IsObject } from 'class-validator';

export class UpdateAcademicReportDto {
  @IsObject()
  subtopicScores: Record<string, number>;
}
