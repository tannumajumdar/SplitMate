import { Notification } from '../models/Notification.model';
import { INotification, ICreateNotificationDTO } from '../interfaces/notification.interface';

export class NotificationRepository {
  async create(data: ICreateNotificationDTO): Promise<INotification> {
    const notification = new Notification(data);
    return notification.save();
  }

  async findByUser(userId: string, skip = 0, limit = 20): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false }).exec();
  }

  async markRead(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).exec();
  }

  async markAllRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    ).exec();
  }

  async deleteOld(userId: string, beforeDate: Date): Promise<void> {
    await Notification.deleteMany({ userId, createdAt: { $lt: beforeDate } }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
