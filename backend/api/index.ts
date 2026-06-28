import 'dotenv/config';
import { getMissingEnvVars } from '../src/config/env';
import { initFirebase } from '../src/config/firebase';
import createApp from '../src/app';
import express, { Application, Request, Response } from 'express';

const missing = getMissingEnvVars();

let handler: Application;

if (missing.length > 0) {
  // Return a clear 500 instead of letting the process crash with 504.
  // The full app cannot start without these — set them in Vercel Dashboard →
  // Project → Settings → Environment Variables.
  handler = express();
  handler.use((_req: Request, res: Response) => {
    res.status(500).json({
      success: false,
      message: `Server misconfigured. Missing environment variables: ${missing.join(', ')}`,
      fix: 'Vercel Dashboard → your project → Settings → Environment Variables',
    });
  });
} else {
  initFirebase();
  handler = createApp();
}

export default handler;
