import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { logger } from './utils/logger';
import routes from './routes/index';

const createApp = (): Application => {
  const app = express();

  // ─── Security ───────────────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: env.isProduction,
    })
  );

  app.use(
    cors({
      origin: env.isProduction
        ? [env.frontendUrl]
        : ['http://localhost:5173', 'http://localhost:5174', env.frontendUrl],
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
        skip: (req) => req.url === '/api/v1/health',
      })
    );
  }

  // ─── Trust proxy (for rate limiter behind reverse proxy) ────────
  if (env.isProduction) app.set('trust proxy', 1);

  // ─── API Documentation ──────────────────────────────────────────
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'SplitMate API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  // ─── Routes ─────────────────────────────────────────────────────
  app.use(`/api/${env.apiVersion}`, routes);

  // ─── Error Handling ─────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
