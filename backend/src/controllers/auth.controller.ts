import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import type {
  RegisterEmailInput,
  LoginEmailInput,
  GoogleAuthInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

// POST /auth/register
export const registerEmail = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterEmailInput;
  const { user, tokens, isNewUser } = await authService.registerWithEmail(name, email, password, res);
  ApiResponse.success(
    res,
    { user, accessToken: tokens.accessToken, isNewUser },
    'Welcome to SplitMate!',
    201
  );
});

// POST /auth/login
export const loginEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginEmailInput;
  const { user, tokens } = await authService.loginWithEmail(email, password, res);
  ApiResponse.success(res, { user, accessToken: tokens.accessToken, isNewUser: false }, 'Login successful');
});

// POST /auth/google
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as GoogleAuthInput;
  const { user, tokens, isNewUser } = await authService.loginWithGoogle(idToken, res);
  ApiResponse.success(
    res,
    { user, accessToken: tokens.accessToken, isNewUser },
    isNewUser ? 'Welcome to SplitMate!' : 'Login successful',
    isNewUser ? 201 : 200
  );
});

// POST /auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.forgotPassword(email);
  ApiResponse.success(res, {}, 'If that email exists, a reset link has been sent.');
});

// POST /auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, password);
  ApiResponse.success(res, {}, 'Password reset successfully. Please log in.');
});

// POST /auth/change-password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;
  await authService.changePassword(req.userId!, currentPassword, newPassword);
  ApiResponse.success(res, {}, 'Password changed successfully.');
});

// GET /auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.success(res, { user: req.user });
});

// POST /auth/refresh
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken ?? (req.cookies?.refreshToken as string);
  if (!token) throw new Error('Refresh token required');
  const tokens = await authService.refreshTokens(token, res);
  ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed');
});

// POST /auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken ?? (req.cookies?.refreshToken as string);
  await authService.logout(token, res);
  ApiResponse.noContent(res);
});

// POST /auth/logout-all
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.userId!, res);
  ApiResponse.noContent(res);
});
