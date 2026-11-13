import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('password utils', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('testpass123');
    expect(hash).not.toBe('testpass123');
    expect(await verifyPassword('testpass123', hash)).toBe(true);
    expect(await verifyPassword('wrongpass', hash)).toBe(false);
  });
});
