import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    activeConversation?: string;
  };
}

interface JoinConversationPayload {
  conversationId: string;
}

interface SendMessagePayload {
  conversationId: string;
  text: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
      : 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const cookies = client.handshake.headers.cookie;
      const token = this.extractTokenFromCookies(cookies);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.email})`,
      );
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}`, error);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  private extractTokenFromCookies(cookieString?: string): string | null {
    if (!cookieString) return null;
    const cookies = cookieString.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    return cookies['access_token'] || null;
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userEmail = client.data?.user?.email || 'unknown';
    this.logger.log(`Client disconnected: ${client.id} (User: ${userEmail})`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationPayload,
  ) {
    const userId = client.data.user.id;
    const { conversationId } = data;

    const isParticipant = await this.chatService.isUserParticipant(
      conversationId,
      userId,
    );

    if (!isParticipant) {
      client.emit('error', {
        message: 'You are not a participant of this conversation',
      });
      return { status: 'error', message: 'Not authorized' };
    }

    client.join(conversationId);
    client.data.activeConversation = conversationId;

    await this.chatService.markAsRead(conversationId, userId);

    this.logger.log(
      `User ${client.data.user.email} joined conversation ${conversationId}`,
    );

    return { status: 'joined', conversationId };
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinConversationPayload,
  ) {
    const { conversationId } = data;
    client.leave(conversationId);
    client.data.activeConversation = undefined;

    this.logger.log(
      `User ${client.data.user.email} left conversation ${conversationId}`,
    );

    return { status: 'left', conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessagePayload,
  ) {
    const userId = client.data.user.id;
    const { conversationId, text } = data;

    if (!text || text.trim().length === 0) {
      client.emit('error', { message: 'Message text is required' });
      return { status: 'error', message: 'Message text is required' };
    }

    if (text.length > 2000) {
      client.emit('error', { message: 'Message is too long (max 2000 chars)' });
      return { status: 'error', message: 'Message too long' };
    }

    try {
      const message = await this.chatService.createMessage(
        conversationId,
        userId,
        text.trim(),
      );

      this.server.to(conversationId).emit('message_received', message);

      const conversation =
        await this.chatService.getConversationById(conversationId, userId);
      const recipientId =
        conversation.studentId === userId
          ? conversation.tutorId
          : conversation.studentId;

      const recipientSocket = this.findSocketByUserId(recipientId);
      const isRecipientViewing =
        recipientSocket?.data.activeConversation === conversationId;

      if (!isRecipientViewing && recipientSocket) {
        const lastReadAt =
          conversation.studentId === recipientId
            ? conversation.studentLastReadAt
            : conversation.tutorLastReadAt;
        const unreadCount = await this.chatService.getUnreadCount(
          conversationId,
          recipientId,
          lastReadAt,
        );
        recipientSocket.emit('unread_update', { conversationId, unreadCount });
        recipientSocket.emit('conversation_update', {
          conversationId,
          lastMessage: {
            text: message.messageText,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
        });
      }

      this.logger.log(
        `Message sent in conversation ${conversationId} by ${client.data.user.email}`,
      );

      return { status: 'sent', message };
    } catch (error) {
      this.logger.error('Error sending message', error);
      client.emit('error', { message: 'Failed to send message' });
      return { status: 'error', message: 'Failed to send message' };
    }
  }

  private findSocketByUserId(userId: string): AuthenticatedSocket | undefined {
    const sockets = this.server.sockets.sockets;
    for (const [, socket] of sockets) {
      const authSocket = socket as AuthenticatedSocket;
      if (authSocket.data?.user?.id === userId) {
        return authSocket;
      }
    }
    return undefined;
  }
}
