import { notificationRepository } from '../repositories/notification.repository';
import { groupRepository } from '../repositories/group.repository';
import { INotification, ICreateNotificationDTO, NotificationType } from '../interfaces/notification.interface';
import { getPaginationOptions, buildPaginationMeta, getSkip } from '../utils/pagination';
import { PaginatedResult } from '../types/common.types';

export class NotificationService {
  async createNotification(data: ICreateNotificationDTO): Promise<INotification> {
    return notificationRepository.create(data);
  }

  async getNotifications(
    userId: string,
    queryPage?: string,
    queryLimit?: string
  ): Promise<PaginatedResult<INotification> & { unreadCount: number }> {
    const { page, limit } = getPaginationOptions(queryPage, queryLimit);
    const skip = getSkip(page, limit);

    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUser(userId, skip, limit),
      notificationRepository.countUnread(userId),
    ]);

    // Count all (approximation using skip+limit pattern)
    const total = notifications.length + skip;

    return {
      data: notifications,
      pagination: buildPaginationMeta(total, page, limit),
      unreadCount,
    };
  }

  async markRead(notificationId: string, userId: string): Promise<INotification | null> {
    return notificationRepository.markRead(notificationId, userId);
  }

  async markAllRead(userId: string): Promise<void> {
    return notificationRepository.markAllRead(userId);
  }

  async notifyGroupMembers(
    groupId: string,
    excludeUserId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const group = await groupRepository.findById(groupId);
    if (!group) return;

    const memberIds = group.members
      .filter((m) => m.isActive && m.userId.toString() !== excludeUserId)
      .map((m) => m.userId.toString());

    await Promise.allSettled(
      memberIds.map((userId) =>
        notificationRepository.create({ userId, type, title, message, data })
      )
    );
  }
}

export const notificationService = new NotificationService();
