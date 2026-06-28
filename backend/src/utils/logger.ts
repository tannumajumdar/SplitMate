import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) =>
    stack ? `${ts} [${level}]: ${message}\n${stack}` : `${ts} [${level}]: ${message}`
  )
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    silent: env.nodeEnv === 'test',
  }),
];

// Only write log files when running on a persistent server (not Vercel serverless).
// Vercel's filesystem is read-only outside /tmp, so DailyRotateFile would crash.
const isVercel = Boolean(process.env.VERCEL);

if (env.isProduction && !isVercel) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(env.logging.dir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '30d',
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: path.join(env.logging.dir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '14d',
      zippedArchive: true,
    })
  );
}

export const logger = winston.createLogger({
  level: env.logging.level,
  transports,
  exitOnError: false,
});
