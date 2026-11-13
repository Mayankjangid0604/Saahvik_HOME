import { vi } from 'vitest';

// Mock Prisma client for unit tests
vi.mock('../src/config/database', () => {
  return {
    prisma: createMockPrisma(),
  };
});

function createMockPrisma() {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      return new Proxy({}, {
        get(_t, method) {
          if (method === 'then') return undefined;
          return vi.fn().mockResolvedValue(null);
        },
      });
    },
  };
  return new Proxy({}, handler);
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
