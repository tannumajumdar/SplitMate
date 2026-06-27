import mongoose, { Schema } from 'mongoose';
import { INotification, NotificationType } from '../interfaces/notification.interface';

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'expense_added', 'expense_updated', 'expense_deleted',
        'settlement_created', 'settlement_completed', 'settlement_reminder',
        'group_invitation', 'group_joined', 'group_left', 'monthly_summary',
      ] as NotificationType[],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete (ret as Record<string, unknown>).__v; return ret; } },
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90-day TTL

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
