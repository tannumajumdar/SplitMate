import { generateOTP, getOTPExpiry, isOTPExpired } from '../../utils/otp';

describe('generateOTP', () => {
  it('generates a 6-digit numeric OTP by default', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generates OTP of specified length', () => {
    const otp = generateOTP(4);
    expect(otp).toHaveLength(4);
    expect(otp).toMatch(/^\d{4}$/);
  });

  it('generates unique OTPs', () => {
    const otps = new Set(Array.from({ length: 100 }, () => generateOTP()));
    expect(otps.size).toBeGreaterThan(50);
  });
});

describe('getOTPExpiry', () => {
  it('returns a date in the future', () => {
    const expiry = getOTPExpiry(10);
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });

  it('returns approximately 10 minutes from now', () => {
    const before = Date.now();
    const expiry = getOTPExpiry(10);
    const diff = expiry.getTime() - before;
    expect(diff).toBeGreaterThan(9 * 60 * 1000);
    expect(diff).toBeLessThan(11 * 60 * 1000);
  });
});

describe('isOTPExpired', () => {
  it('returns true for past dates', () => {
    const pastDate = new Date(Date.now() - 1000);
    expect(isOTPExpired(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date(Date.now() + 60000);
    expect(isOTPExpired(futureDate)).toBe(false);
  });
});
