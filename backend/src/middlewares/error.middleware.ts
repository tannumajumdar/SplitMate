import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === 11000) {
    const field = Object.keys((err as Record<string, Record<string, unknown>>).keyValue ?? {})[0];
    error = ApiError.conflict(`${field ?? 'Field'} already exists`);
  }

  // Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = ApiError.unprocessable('Validation failed', errors);
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err instanceof jwt.TokenExpiredError) {
    error = ApiError.unauthorized('Token expired');
  }

  if (error instanceof ApiError) {
    if (!error.isOperational || error.statusCode >= 500) {
      logger.error(`[${req.method}] ${req.path}`, { message: error.message, stack: error.stack });
    }
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors.length ? error.errors : undefined,
      ...(env.isDevelopment && { stack: error.stack }),
    });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: env.isProduction ? 'Internal server error' : err.message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};
