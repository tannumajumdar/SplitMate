import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await notificationService.getNotifications(req.userId!, page, limit);
  ApiResponse.success(res, { notifications: result.data, unreadCount: result.unreadCount, pagination: result.pagination });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markRead(req.params.notificationId, req.userId!);
  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, { notification });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.userId!);
  ApiResponse.noContent(res);
});
