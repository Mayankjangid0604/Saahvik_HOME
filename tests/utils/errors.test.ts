import { describe, it, expect } from 'vitest';
import { AppError, notFound, unauthorized, forbidden, badRequest, conflict } from '../../src/utils/errors';

describe('error utils', () => {
  it('creates AppError with status code', () => {
    const err = new AppError(404, 'Not found');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
  });

  it('creates convenience errors', () => {
    expect(notFound('User').statusCode).toBe(404);
    expect(unauthorized().statusCode).toBe(401);
    expect(forbidden().statusCode).toBe(403);
    expect(badRequest('bad').statusCode).toBe(400);
    expect(conflict('dup').statusCode).toBe(409);
  });
});
