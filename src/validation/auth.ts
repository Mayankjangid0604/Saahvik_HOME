import { z } from 'zod';

export const registerOrgSchema = z.object({
  orgName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  totpCode: z.string().optional(),
});

export const requestOTPSchema = z.object({
  phone: z.string().min(10),
  purpose: z.enum(['LOGIN', 'PASSWORD_RESET']),
});

export const verifyOTPSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  purpose: z.enum(['LOGIN', 'PASSWORD_RESET']),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const setup2FASchema = z.object({
  enable: z.boolean(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
