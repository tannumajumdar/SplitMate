import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { connectDB } from './config/database';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { logger } from './utils/logger';
import routes from './routes/index';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  env.frontendUrl,
  'https://splitmate.vercel.app',
].filter(Boolean);

const createApp = (): Application => {
  const app = express();

  // ─── Trust proxy (must be first for rate-limiter / IP detection) ─
  app.set('trust proxy', 1);

  // ─── Security ───────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.isProduction,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) and listed origins
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(mongoSanitize());
  app.use(globalRateLimiter);

  // ─── Request parsing ────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.cookie.secret));
  app.use(compression());

  // ─── Logging ────────────────────────────────────────────────────
  if (env.nodeEnv !== 'test') {
    app.use(
      morgan('combined', {
        stream: { write: (message) => logger.http(message.trim()) },
        skip: (req) => req.url === '/' || req.url === '/api/health',
      })
    );
  }

  // ─── API Documentation ──────────────────────────────────────────
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'SplitMate API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  // ─── Root route — responds instantly, no DB required ────────────
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'SplitMate Backend Running',
      version: '1.0.0',
    });
  });

  // ─── /api/health — DB-aware, no version prefix ──────────────────
  app.get('/api/health', (_req: Request, res: Response) => {
    const state = mongoose.connection.readyState;
    const dbStatus = state === 1 ? 'Connected' : state === 2 ? 'Connecting' : 'Disconnected';
    res.json({
      status: 'OK',
      database: dbStatus,
      server: 'Running',
      timestamp: new Date().toISOString(),
    });
  });

  // ─── DB connect middleware — runs before every versioned API call ─
  // connectDB() is idempotent: cached promise, re-used on warm invocations.
  app.use(async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await connectDB();
      next();
    } catch {
      res.status(503).json({ success: false, message: 'Database unavailable. Try again shortly.' });
    }
  });

  // ─── Versioned API Routes ────────────────────────────────────────
  app.use(`/api/${env.apiVersion}`, routes);

  // ─── Error Handling ─────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
