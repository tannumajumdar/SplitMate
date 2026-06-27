import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => redisClient;

export const connectRedis = async (): Promise<void> => {
  const client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password || undefined,
    retryStrategy: () => null, // disable auto-retry; we treat Redis as optional
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  // Attach error handler before connecting so no unhandled error events
  client.on('error', (err) => {
    logger.warn('Redis error (cache disabled):', err.message);
  });

  try {
    await client.connect();
    redisClient = client;
    logger.info('Redis connected.');
  } catch (error) {
    client.disconnect();
    logger.warn('Redis unavailable – continuing without cache.');
    redisClient = null;
  }
};

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!redisClient) return;
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    if (!redisClient) return;
    await redisClient.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    if (!redisClient) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(...keys);
  },
};
