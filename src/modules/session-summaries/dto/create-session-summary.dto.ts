import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSessionSummaryDto {
  @IsUUID()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  strengths: string;

  @IsString()
  @IsNotEmpty()
  areasForImprovement: string;

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
