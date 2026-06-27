import { Request, Response } from 'express';
import { Rating } from '../models/Rating.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const submitRating = asyncHandler(async (req: Request, res: Response) => {
  const { rating, review } = req.body as { rating: number; review?: string };

  if (!rating || rating < 1 || rating > 5) throw ApiError.badRequest('Rating must be between 1 and 5');

  // Upsert: one rating per user
  const doc = await Rating.findOneAndUpdate(
    { userId: req.userId },
    { rating, review: review?.trim() || undefined },
    { upsert: true, new: true }
  );

  ApiResponse.success(res, { rating: doc }, 'Rating submitted. Thank you!');
});

export const getMyRating = asyncHandler(async (req: Request, res: Response) => {
  const rating = await Rating.findOne({ userId: req.userId }).lean();
  ApiResponse.success(res, { rating });
});
