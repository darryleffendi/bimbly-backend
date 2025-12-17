import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import {
  NotificationResponseDto,
  NotificationListResponseDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    type: 'error' | 'warning' | 'info' | 'success' | 'booking' | 'payment' | 'quiz' | 'message' | 'review',
  ): Promise<void> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      type,
      hasRead: false,
    });

    await this.notificationRepository.save(notification);
  }

  async getUserNotifications(userId: string): Promise<NotificationListResponseDto> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const total = notifications.length;
    const unreadCount = notifications.filter((n) => !n.hasRead).length;

    const notificationDtos = notifications.map(
      (n) => new NotificationResponseDto(n),
    );

    return new NotificationListResponseDto(notificationDtos, total, unreadCount);
  }

  async markAsRead(
    userId: string,
    notificationIds?: string[],
  ): Promise<void> {
    if (notificationIds && notificationIds.length > 0) {
      const notifications = await this.notificationRepository.find({
        where: {
          id: In(notificationIds),
          userId,
        },
      });

      if (notifications.length === 0) {
        throw new NotFoundException('No notifications found');
      }

      await this.notificationRepository.update(
        {
          id: In(notificationIds),
          userId,
        },
        {
          hasRead: true,
          readAt: new Date(),
        },
      );
    } else {
      await this.notificationRepository.update(
        { userId, hasRead: false },
        {
          hasRead: true,
          readAt: new Date(),
        },
      );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, hasRead: false },
    });
  }
}
