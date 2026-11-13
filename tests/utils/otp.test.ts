import { describe, it, expect } from 'vitest';
import { generateOTP, otpExpiresAt } from '../../src/utils/otp';

describe('otp utils', () => {
  it('generates a 6-digit OTP', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('generates expiry in the future', () => {
    const expiry = otpExpiresAt();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
