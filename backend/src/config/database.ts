import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const mongooseOptions: mongoose.ConnectOptions = {
  autoIndex: env.isDevelopment,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
};

// Cached promise — reused across warm serverless invocations so we never
// open a second connection while one is already in flight or established.
let connectionPromise: Promise<void> | null = null;

export const connectDB = async (): Promise<void> => {
  if (!env.db.uri) {
    throw new Error(
      'MONGODB_URI is not configured. Go to Vercel Dashboard → your project → Settings → Environment Variables and add MONGODB_URI with your MongoDB Atlas connection string.'
    );
  }

  // Already open — nothing to do
  if (mongoose.connection.readyState === 1) return;

  // Reuse an in-flight promise so parallel warm invocations share one connect
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.db.uri, mongooseOptions)
      .then((m) => {
        logger.info(`MongoDB connected: ${m.connection.host}`);

        mongoose.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected — will reconnect on next request');
          connectionPromise = null;
        });

        mongoose.connection.on('error', (err) => {
          logger.error('MongoDB error:', err);
          connectionPromise = null;
        });
      })
      .catch((err) => {
        logger.error('MongoDB connection failed:', err);
        connectionPromise = null; // allow retry on next request
        throw err; // propagate so the request gets a 503, not a hang
      });
  }

  await connectionPromise;
};

export const disconnectDB = async (): Promise<void> => {
  connectionPromise = null;
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
};
