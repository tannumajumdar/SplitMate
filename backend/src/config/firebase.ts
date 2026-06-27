import admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';

let firebaseInitialized = false;

export const initFirebase = (): void => {
  if (firebaseInitialized) return;

  if (!env.firebase.privateKey) {
    if (env.firebase.apiKey) {
      logger.info('Firebase: using REST API verification (no service account configured).');
    } else {
      logger.warn('Firebase config missing – Google sign-in verification disabled.');
    }
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      privateKeyId: env.firebase.privateKeyId,
      privateKey: env.firebase.privateKey,
      clientEmail: env.firebase.clientEmail,
      clientId: env.firebase.clientId,
    } as admin.ServiceAccount),
  });

  firebaseInitialized = true;
  logger.info('Firebase Admin SDK initialized.');
};

export interface FirebaseUserInfo {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

/**
 * Verify a Firebase ID token using the Firebase REST API.
 * Works for both Google Sign-In and other Firebase auth methods.
 * Only requires FIREBASE_API_KEY — no service account needed.
 */
export const verifyFirebaseIdToken = async (idToken: string): Promise<FirebaseUserInfo> => {
  if (!env.firebase.apiKey) {
    throw ApiError.internal('Firebase API key not configured. Set FIREBASE_API_KEY in backend/.env');
  }

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.firebase.apiKey}`;

  interface FirebaseApiResponse {
    users?: Array<{
      localId: string;
      email: string;
      displayName?: string;
      photoUrl?: string;
      emailVerified?: boolean;
    }>;
    error?: { message: string; code: number };
  }

  let data: FirebaseApiResponse;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    data = (await res.json()) as FirebaseApiResponse;
  } catch {
    throw ApiError.internal('Failed to reach Firebase. Check network connectivity.');
  }

  if (data.error) {
    logger.warn('Firebase token verification failed:', data.error.message);
    throw ApiError.unauthorized(`Firebase verification failed: ${data.error.message}`);
  }

  const fbUser = data.users?.[0];
  if (!fbUser?.email) {
    throw ApiError.unauthorized('Firebase token does not contain an email address.');
  }

  return {
    uid: fbUser.localId,
    email: fbUser.email,
    name: fbUser.displayName || fbUser.email.split('@')[0],
    picture: fbUser.photoUrl,
    emailVerified: fbUser.emailVerified ?? false,
  };
};

export { admin };
