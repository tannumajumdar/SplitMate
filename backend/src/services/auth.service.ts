import { Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { verifyFirebaseIdToken } from '../config/firebase';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { RefreshToken } from '../models/RefreshToken.model';
import { ApiError } from '../utils/ApiError';
import { IUser } from '../interfaces/user.interface';
import { TokenPair } from '../types/common.types';
import { env } from '../config/env';
import { cache } from '../config/redis';
import { sendEmail, resetPasswordEmail } from '../utils/email';

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export class AuthService {
  // ─── Email + Password ──────────────────────────────────────────────────────
  async registerWithEmail(
    name: string,
    email: string,
    password: string,
    res: Response
  ): Promise<{ user: IUser; tokens: TokenPair; isNewUser: boolean }> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('An account with this email already exists.');

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      name,
      email,
      password: hashed,
      provider: 'email',
      isVerified: true,
    });

    const tokens = await this.generateAndStoreTokens(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { user, tokens, isNewUser: true };
  }

  async loginWithEmail(
    email: string,
    password: string,
    res: Response
  ): Promise<{ user: IUser; tokens: TokenPair; isNewUser: boolean }> {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) throw ApiError.unauthorized('Invalid email or password.');
    if (!user.password) {
      throw ApiError.badRequest(
        'This account uses Google Sign-In. Please continue with Google.'
      );
    }
    if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact support.');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw ApiError.unauthorized('Invalid email or password.');

    const tokens = await this.generateAndStoreTokens(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { user, tokens, isNewUser: false };
  }

  // ─── Google ────────────────────────────────────────────────────────────────
  async loginWithGoogle(
    idToken: string,
    res: Response
  ): Promise<{ user: IUser; tokens: TokenPair; isNewUser: boolean }> {
    // Verify Firebase ID token → get email, name, uid, picture
    const firebaseUser = await verifyFirebaseIdToken(idToken);

    let user = await userRepository.findByGoogleId(firebaseUser.uid);
    let isNewUser = false;

    if (!user) {
      // Try linking by email
      user = await userRepository.findByEmail(firebaseUser.email);
      if (user) {
        // Link existing email account with Google
        user = await userRepository.updateRaw(user._id.toString(), {
          $set: {
            googleId: firebaseUser.uid,
            isVerified: true,
            profilePhoto: user.profilePhoto || firebaseUser.picture || undefined,
          },
        });
      } else {
        // Brand new user via Google
        user = await userRepository.create({
          name: firebaseUser.name || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          provider: 'google',
          googleId: firebaseUser.uid,
          profilePhoto: firebaseUser.picture || undefined,
          isVerified: true,
        });
        isNewUser = true;
      }
    }

    if (!user) throw ApiError.internal('Google sign-in failed.');
    if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact support.');

    const tokens = await this.generateAndStoreTokens(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { user, tokens, isNewUser };
  }

  // ─── Forgot / Reset password ───────────────────────────────────────────────
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    // Always return 200 — don't reveal if email exists
    if (!user || user.provider === 'google') return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    await userRepository.updateRaw(user._id.toString(), {
      $set: { resetPasswordToken: token, resetPasswordExpires: expires },
    });

    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
    const mail = resetPasswordEmail(user.name, resetUrl);
    mail.to = email;

    await sendEmail(mail);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByResetToken(token);
    if (!user) throw ApiError.badRequest('Reset link is invalid or has expired.');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userRepository.updateRaw(user._id.toString(), {
      $set: { password: hashed },
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
    });

    // Revoke all existing sessions
    await RefreshToken.deleteMany({ userId: user._id });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (!user.password) {
      throw ApiError.badRequest('This account uses Google Sign-In and has no password.');
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw ApiError.unauthorized('Current password is incorrect.');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updateRaw(userId, { $set: { password: hashed } });

    // Revoke all other sessions
    await RefreshToken.deleteMany({ userId });
  }

  // ─── Token management ──────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string, res: Response): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);

    const stored = await RefreshToken.findOne({ token: refreshToken, isRevoked: false });
    if (!stored) throw ApiError.unauthorized('Invalid or revoked refresh token.');

    if (stored.expiresAt < new Date()) {
      await stored.deleteOne();
      throw ApiError.unauthorized('Refresh token expired. Please login again.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || !user.isActive) throw ApiError.unauthorized('User not found or inactive.');

    await stored.deleteOne();
    const tokens = await this.generateAndStoreTokens(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string, res: Response): Promise<void> {
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
    res.clearCookie('refreshToken');
  }

  async logoutAll(userId: string, res: Response): Promise<void> {
    await RefreshToken.deleteMany({ userId });
    await cache.del(`user:${userId}`);
    res.clearCookie('refreshToken');
  }

  // ─── Private helpers ───────────────────────────────────────────────────────
  private async generateAndStoreTokens(user: IUser): Promise<TokenPair> {
    const payload = { userId: user._id.toString(), email: user.email };
    const tokens = generateTokenPair(payload);

    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return tokens;
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}

export const authService = new AuthService();
