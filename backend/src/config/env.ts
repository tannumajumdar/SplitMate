import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Collect missing required vars without throwing — throwing at module init
// crashes the serverless function before any handler is registered, causing 504.
const _missing: string[] = [];

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) _missing.push(key);
  return value ?? '';
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

/** Returns any required env vars that are not set. Empty array = all good. */
export const getMissingEnvVars = (): string[] => [..._missing];

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  apiVersion: optional('API_VERSION', 'v1'),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  db: {
    uri: required('MONGODB_URI'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  redis: {
    host: optional('REDIS_HOST', 'localhost'),
    port: parseInt(optional('REDIS_PORT', '6379'), 10),
    password: optional('REDIS_PASSWORD', ''),
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  firebase: {
    projectId: optional('FIREBASE_PROJECT_ID', ''),
    apiKey: optional('FIREBASE_API_KEY', ''),
    privateKeyId: optional('FIREBASE_PRIVATE_KEY_ID', ''),
    privateKey: optional('FIREBASE_PRIVATE_KEY', '').replace(/\\n/g, '\n'),
    clientEmail: optional('FIREBASE_CLIENT_EMAIL', ''),
    clientId: optional('FIREBASE_CLIENT_ID', ''),
  },

  email: {
    host: optional('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    secure: optional('SMTP_SECURE', 'false') === 'true',
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('SMTP_FROM', 'SplitMate <noreply@splitmate.app>'),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optional('CLOUDINARY_API_KEY', ''),
    apiSecret: optional('CLOUDINARY_API_SECRET', ''),
    folder: optional('CLOUDINARY_FOLDER', 'splitmate/receipts'),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(optional('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    authMax: parseInt(optional('AUTH_RATE_LIMIT_MAX', '10'), 10),
  },

  cookie: {
    secret: optional('COOKIE_SECRET', 'fallback_cookie_secret'),
  },

  logging: {
    level: optional('LOG_LEVEL', 'debug'),
    dir: optional('LOG_DIR', 'logs'),
  },
} as const;
