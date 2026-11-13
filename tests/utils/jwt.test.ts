import { describe, it, expect } from 'vitest';
import { signAccessToken, signRefreshToken, verifyToken } from '../../src/utils/jwt';

describe('jwt utils', () => {
  const payload = { userId: 'u1', orgId: 'o1', role: 'OWNER' };

  it('signs and verifies access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('u1');
    expect(decoded.orgId).toBe('o1');
    expect(decoded.role).toBe('OWNER');
  });

  it('signs and verifies refresh token', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('u1');
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('invalid')).toThrow();
  });
});
