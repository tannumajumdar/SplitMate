import crypto from 'crypto';

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
};

export const getOTPExpiry = (minutes: number): Date =>
  new Date(Date.now() + minutes * 60 * 1000);

export const isOTPExpired = (expiresAt: Date): boolean =>
  new Date() > new Date(expiresAt);
