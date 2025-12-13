import { Message } from '../entities/message.entity';

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  createdAt: Date;

  constructor(message: Message, senderName: string) {
    this.id = message.id;
    this.conversationId = message.conversationId;
    this.senderId = message.senderId;
    this.senderName = senderName;
    this.messageText = message.messageText;
    this.createdAt = message.createdAt;
  }
}

export class MessageListResponseDto {
  data: MessageResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };

  constructor(
    messages: MessageResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = messages;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }
}
