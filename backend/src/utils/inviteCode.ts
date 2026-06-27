import crypto from 'crypto';

export const generateInviteCode = (length = 8): string =>
  crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase();
