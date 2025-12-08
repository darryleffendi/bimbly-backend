import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateQuizAssignmentDto {
  @IsUUID()
  quizTemplateId: string;

  @IsUUID()
  studentId: string;

  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}
