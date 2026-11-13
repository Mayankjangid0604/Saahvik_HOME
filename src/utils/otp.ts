import { env } from '../config/env';

export function generateOTP(): string {
  const digits = env.OTP_LENGTH;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function otpExpiresAt(): Date {
  return new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
}
