import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getGroupAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query as Record<string, string>;
  const data = await analyticsService.getGroupAnalytics(
    req.params.groupId,
    req.userId!,
    year ? parseInt(year, 10) : undefined,
    month ? parseInt(month, 10) : undefined
  );
  ApiResponse.success(res, data);
});

export const getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { year, month } = req.query as Record<string, string>;
  const data = await analyticsService.getUserAnalytics(
    req.userId!,
    year ? parseInt(year, 10) : undefined,
    month ? parseInt(month, 10) : undefined
  );
  ApiResponse.success(res, data);
});
