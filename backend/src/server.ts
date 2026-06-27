import 'dotenv/config';
import { env } from './config/env';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { initFirebase } from './config/firebase';
import { logger } from './utils/logger';
import createApp from './app';

const bootstrap = async (): Promise<void> => {
  await connectDB();
  await connectRedis();
  initFirebase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`SplitMate API running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API Docs: http://localhost:${env.port}/api-docs`);
  });

  // ─── Graceful shutdown ──────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/database');
      await disconnectDB();
      logger.info('Server closed.');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
};

bootstrap().catch((err) => {
  logger.error('Bootstrap failed:', err);
  process.exit(1);
});
