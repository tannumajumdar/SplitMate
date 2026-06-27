import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import type { UpdateProfileInput } from '../validators/auth.validator';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.userId!);
  ApiResponse.success(res, { user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as UpdateProfileInput;
  const user = await userService.updateProfile(req.userId!, data);
  ApiResponse.success(res, { user }, 'Profile updated');
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const user = await userService.uploadAvatar(
    req.userId!,
    req.file.buffer,
    req.file.mimetype
  );
  ApiResponse.success(res, { user }, 'Avatar updated');
});

export const deleteAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.deleteAvatar(req.userId!);
  ApiResponse.success(res, { user }, 'Avatar removed');
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length < 2)
    throw ApiError.badRequest('Query must be at least 2 characters');
  const users = await userService.searchUsers(q.trim());
  ApiResponse.success(res, { users });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.userId!);
  res.clearCookie('refreshToken');
  ApiResponse.noContent(res);
});
