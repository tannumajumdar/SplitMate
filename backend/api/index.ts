import 'dotenv/config';
import { initFirebase } from '../src/config/firebase';
import createApp from '../src/app';

// Firebase is sync and idempotent — safe to call on every cold start
initFirebase();

// Export the Express app — Vercel wraps this as the serverless handler.
// DB connection is handled per-request inside createApp() via middleware,
// with connection caching so warm invocations reuse the existing socket.
const app = createApp();

export default app;
