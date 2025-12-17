import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  title: string;
  body: string;
  type: 'error' | 'warning' | 'info' | 'success' | 'booking' | 'payment' | 'quiz' | 'message' | 'review';
  hasRead: boolean;
  createdAt: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.title = notification.title;
    this.body = notification.body;
    this.type = notification.type;
    this.hasRead = notification.hasRead;
    this.createdAt = notification.createdAt;
  }
}

export class NotificationListResponseDto {
  data: NotificationResponseDto[];
  meta: {
    total: number;
    unreadCount: number;
  };

  constructor(
    notifications: NotificationResponseDto[],
    total: number,
    unreadCount: number,
  ) {
    this.data = notifications;
    this.meta = {
      total,
      unreadCount,
    };
  }
}
