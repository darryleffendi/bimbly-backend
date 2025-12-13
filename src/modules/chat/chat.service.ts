import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import {
  ConversationResponseDto,
  ConversationCreateResponseDto,
} from './dto/conversation-response.dto';
import {
  MessageResponseDto,
  MessageListResponseDto,
} from './dto/message-response.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getConversations(userId: string): Promise<ConversationResponseDto[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let conversations: Conversation[];
    const isStudent = user.userType === 'student';

    if (isStudent) {
      conversations = await this.conversationRepository.find({
        where: { studentId: userId },
        relations: ['tutor'],
        order: { lastMessageAt: 'DESC' },
      });
    } else if (user.userType === 'tutor') {
      conversations = await this.conversationRepository.find({
        where: { tutorId: userId },
        relations: ['student'],
        order: { lastMessageAt: 'DESC' },
      });
    } else {
      return [];
    }

    const results: ConversationResponseDto[] = [];

    for (const conv of conversations) {
      const lastReadAt = isStudent ? conv.studentLastReadAt : conv.tutorLastReadAt;
      const unreadCount = await this.getUnreadCount(conv.id, userId, lastReadAt);
      const participant = isStudent ? conv.tutor : conv.student;
      results.push(new ConversationResponseDto(conv, participant, unreadCount));
    }

    return results;
  }

  async getOrCreateConversation(
    userId: string,
    participantId: string,
  ): Promise<ConversationCreateResponseDto> {
    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const participant = await this.userRepository.findOne({
      where: { id: participantId },
    });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (currentUser.userType === participant.userType) {
      throw new BadRequestException(
        'Cannot create conversation between users of the same type',
      );
    }

    let studentId: string;
    let tutorId: string;

    if (currentUser.userType === 'student') {
      studentId = userId;
      tutorId = participantId;
    } else {
      studentId = participantId;
      tutorId = userId;
    }

    let conversation = await this.conversationRepository.findOne({
      where: { studentId, tutorId },
      relations: ['student', 'tutor'],
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        studentId,
        tutorId,
      });
      conversation = await this.conversationRepository.save(conversation);
      conversation = await this.conversationRepository.findOne({
        where: { id: conversation.id },
        relations: ['student', 'tutor'],
      });
    }

    return new ConversationCreateResponseDto(conversation!, participant);
  }

  async getConversationById(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['student', 'tutor'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.studentId !== userId && conversation.tutorId !== userId) {
      throw new ForbiddenException('You are not a participant of this conversation');
    }

    return conversation;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<MessageListResponseDto> {
    await this.getConversationById(conversationId, userId);

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const messageDtos = messages.map(
      (msg) => new MessageResponseDto(msg, msg.sender.fullName),
    );

    return new MessageListResponseDto(messageDtos, total, page, limit);
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<MessageResponseDto> {
    const conversation = await this.getConversationById(conversationId, senderId);

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      messageText: text,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.updateConversationLastMessage(
      conversationId,
      text,
      savedMessage.createdAt,
    );

    return new MessageResponseDto(savedMessage, sender!.fullName);
  }

  async updateConversationLastMessage(
    conversationId: string,
    text: string,
    createdAt: Date,
  ): Promise<void> {
    const preview = text.length > 200 ? text.substring(0, 197) + '...' : text;

    await this.conversationRepository.update(conversationId, {
      lastMessagePreview: preview,
      lastMessageAt: createdAt,
    });
  }

  async isUserParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      return false;
    }

    return conversation.studentId === userId || conversation.tutorId === userId;
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUnreadCount(
    conversationId: string,
    recipientId: string,
    lastReadAt: Date | null,
  ): Promise<number> {
    if (!lastReadAt) {
      return 0;
    }

    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.senderId != :recipientId', { recipientId })
      .andWhere('message.createdAt > :lastReadAt', { lastReadAt })
      .getCount();
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversationById(conversationId, userId);
    const updateField =
      conversation.studentId === userId
        ? 'studentLastReadAt'
        : 'tutorLastReadAt';

    await this.conversationRepository.update(conversationId, {
      [updateField]: new Date(),
    });
  }
}
