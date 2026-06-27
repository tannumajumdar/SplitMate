import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User.model';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : (req.cookies?.accessToken as string | undefined);

    if (!token) throw ApiError.unauthorized('Access token required');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select('-__v');

    if (!user || !user.isActive) throw ApiError.unauthorized('User not found or inactive');

    req.user = user;
    req.userId = user._id.toString();
    next();
  }
);

export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.userId);
        if (user?.isActive) {
          req.user = user;
          req.userId = user._id.toString();
        }
      } catch {
        // Non-blocking for optional auth
      }
    }
    next();
  }
);
