import winston from 'winston';
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

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    silent: env.nodeEnv === 'test',
  }),
];

// Vercel serverless has a read-only filesystem — never attempt file logging there.
// process.env.VERCEL is set to "1" by Vercel at runtime and at build time.
if (!process.env.VERCEL && env.isProduction) {
  try {
    // Dynamic require so esbuild does not tree-shake or inline the env check.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DailyRotateFile = require('winston-daily-rotate-file');
    const logDir = path.resolve(env.logging.dir);

    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxFiles: '30d',
        zippedArchive: true,
      }),
      new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: combine(timestamp(), errors({ stack: true }), json()),
        maxFiles: '14d',
        zippedArchive: true,
      })
    );
  } catch {
    // File logging unavailable — console only.
  }
}

export const logger = winston.createLogger({
  level: env.logging.level,
  transports,
  exitOnError: false,
});
