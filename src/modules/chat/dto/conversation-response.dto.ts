import { Conversation } from '../entities/conversation.entity';
import { User } from '../../users/entities/user.entity';

export class ParticipantDto {
  id: string;
  name: string;
  userType: string;
  profileImageUrl: string | null;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.fullName;
    this.userType = user.userType;
    this.profileImageUrl = user.profileImageUrl || null;
  }
}

export class LastMessageDto {
  text: string;
  senderId: string;
  createdAt: Date;

  constructor(text: string, senderId: string, createdAt: Date) {
    this.text = text;
    this.senderId = senderId;
    this.createdAt = createdAt;
  }
}

export class ConversationResponseDto {
  id: string;
  participant: ParticipantDto;
  lastMessage: LastMessageDto | null;
  lastMessageAt: Date | null;
  unreadCount: number;

  constructor(
    conversation: Conversation,
    participant: User,
    lastMessageSenderId?: string,
  ) {
    this.id = conversation.id;
    this.participant = new ParticipantDto(participant);
    this.lastMessage = conversation.lastMessagePreview
      ? new LastMessageDto(
          conversation.lastMessagePreview,
          lastMessageSenderId || '',
          conversation.lastMessageAt || new Date(),
        )
      : null;
    this.lastMessageAt = conversation.lastMessageAt;
    this.unreadCount = 0;
  }
}

export class ConversationCreateResponseDto {
  id: string;
  studentId: string;
  tutorId: string;
  participant: ParticipantDto;
  createdAt: Date;

  constructor(conversation: Conversation, participant: User) {
    this.id = conversation.id;
    this.studentId = conversation.studentId;
    this.tutorId = conversation.tutorId;
    this.participant = new ParticipantDto(participant);
    this.createdAt = conversation.createdAt;
  }
}
