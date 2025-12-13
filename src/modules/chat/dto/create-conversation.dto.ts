import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty()
  participantId: string;
}
