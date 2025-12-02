import { IsUUID, IsInt, IsString, Min } from 'class-validator';

export class SaveAnswerDto {
  @IsUUID()
  assignmentId: string;

  @IsInt()
  @Min(0)
  questionIndex: number;

  @IsString()
  studentAnswer: string;
}
