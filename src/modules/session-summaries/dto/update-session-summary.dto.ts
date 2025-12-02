import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSessionSummaryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  strengths?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  areasForImprovement?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  homeworkAssigned?: string;

  @IsString()
  @IsOptional()
  nextSessionPlan?: string;
}
