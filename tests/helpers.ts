import { signAccessToken, TokenPayload } from '../src/utils/jwt';

export function createTestToken(overrides: Partial<TokenPayload> = {}): string {
  const payload: TokenPayload = {
    userId: 'test-user-id',
    orgId: 'test-org-id',
    role: 'OWNER',
    ...overrides,
  };
  return signAccessToken(payload);
}

export const testOrgId = 'test-org-id';
export const testUserId = 'test-user-id';
