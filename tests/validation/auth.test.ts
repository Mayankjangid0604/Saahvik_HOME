import { describe, it, expect } from 'vitest';
import { registerOrgSchema, loginSchema, requestOTPSchema, changePasswordSchema } from '../../src/validation/auth';

describe('auth validation', () => {
  it('validates register org', () => {
    const valid = registerOrgSchema.parse({
      orgName: 'Test Hostel',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(valid.orgName).toBe('Test Hostel');
  });

  it('rejects short password', () => {
    expect(() => registerOrgSchema.parse({
      orgName: 'Test', email: 'test@example.com', password: 'short', firstName: 'J', lastName: 'D',
    })).toThrow();
  });

  it('validates login', () => {
    const valid = loginSchema.parse({ identifier: 'test@example.com', password: 'pass123' });
    expect(valid.identifier).toBe('test@example.com');
  });

  it('validates OTP request', () => {
    const valid = requestOTPSchema.parse({ phone: '9876543210', purpose: 'LOGIN' });
    expect(valid.purpose).toBe('LOGIN');
  });

  it('validates change password', () => {
    const valid = changePasswordSchema.parse({ currentPassword: 'old12345', newPassword: 'new12345' });
    expect(valid.newPassword).toBe('new12345');
  });
});
