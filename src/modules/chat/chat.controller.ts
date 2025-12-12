import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  ConversationResponseDto,
  ConversationCreateResponseDto,
} from './dto/conversation-response.dto';
import {
  MessageResponseDto,
  MessageListResponseDto,
} from './dto/message-response.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getConversations(
    @CurrentUser() user: { id: string },
  ): Promise<{ data: ConversationResponseDto[] }> {
    const conversations = await this.chatService.getConversations(user.id);
    return { data: conversations };
  }

  @Post()
  async createConversation(
    @CurrentUser() user: { id: string },
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ConversationCreateResponseDto> {
    return this.chatService.getOrCreateConversation(
      user.id,
      createConversationDto.participantId,
    );
  }

  @Get(':id/messages')
  async getMessages(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ): Promise<MessageListResponseDto> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);

    return this.chatService.getMessages(
      conversationId,
      user.id,
      pageNum,
      limitNum,
    );
  }

  @Post(':id/messages')
  async sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    return this.chatService.createMessage(
      conversationId,
      user.id,
      sendMessageDto.text,
    );
  }
}
