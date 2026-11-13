import { describe, it, expect } from 'vitest';
import { paginationSchema, paginationArgs } from '../../src/utils/pagination';

describe('pagination utils', () => {
  it('parses default pagination', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('computes skip/take', () => {
    const args = paginationArgs({ page: 3, limit: 10 });
    expect(args.skip).toBe(20);
    expect(args.take).toBe(10);
  });

  it('rejects invalid values', () => {
    expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow();
  });
});
