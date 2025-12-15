import { IsUUID, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  quizTemplateId?: string;

  @IsDateString()
  @IsOptional()
  quizDeadline?: string;

  @IsString()
  @IsOptional()
  nextSessionPlan?: string;
}
