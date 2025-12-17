import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationListResponseDto } from './dto/notification-response.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @CurrentUser() user: { id: string },
  ): Promise<NotificationListResponseDto> {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: { id: string },
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Post('mark-as-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @CurrentUser() user: { id: string },
    @Body() markAsReadDto: MarkAsReadDto,
  ): Promise<void> {
    await this.notificationsService.markAsRead(
      user.id,
      markAsReadDto.notificationIds,
    );
  }
}
