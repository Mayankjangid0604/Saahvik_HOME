import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/auth/auth.service', () => ({
  authService: {
    registerOrg: vi.fn().mockResolvedValue({
      org: { id: 'o1', name: 'Test', slug: 'test' },
      user: { id: 'u1', email: 'a@b.com', firstName: 'J', lastName: 'D', role: 'OWNER' },
      accessToken: 'at',
      refreshToken: 'rt',
    }),
    login: vi.fn().mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', firstName: 'J', lastName: 'D', role: 'OWNER' },
      accessToken: 'at',
      refreshToken: 'rt',
    }),
    refreshToken: vi.fn().mockResolvedValue({ accessToken: 'at2', refreshToken: 'rt2' }),
    changePassword: vi.fn().mockResolvedValue({ message: 'Password changed' }),
    toggle2FA: vi.fn().mockResolvedValue({ message: '2FA setup OTP generated' }),
    confirm2FA: vi.fn().mockResolvedValue({ message: '2FA enabled' }),
    requestOTP: vi.fn().mockResolvedValue({ message: 'OTP sent' }),
    verifyOTP: vi.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
    resetPassword: vi.fn().mockResolvedValue({ message: 'Password reset successful' }),
  },
}));

vi.mock('../../src/config/database', () => ({
  prisma: {
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', firstName: 'J', lastName: 'D', role: 'OWNER', orgId: 'o1', is2FAEnabled: false }) },
  },
}));

describe('Auth API', () => {
  it('POST /api/auth/register - registers org', async () => {
    const res = await request(app).post('/api/auth/register').send({
      orgName: 'Test Hostel', email: 'a@b.com', password: 'password123', firstName: 'J', lastName: 'D',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.org.name).toBe('Test');
  });

  it('POST /api/auth/login - logs in', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'a@b.com', password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('at');
  });

  it('POST /api/auth/refresh - refreshes token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'rt' });
    expect(res.status).toBe(200);
  });

  it('POST /api/auth/password/change - changes password', async () => {
    const token = createTestToken();
    const res = await request(app).post('/api/auth/password/change')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'old12345', newPassword: 'new12345' });
    expect(res.status).toBe(200);
  });

  it('GET /api/auth/me - returns current user', async () => {
    const token = createTestToken();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('a@b.com');
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/register - rejects invalid data', async () => {
    const res = await request(app).post('/api/auth/register').send({ orgName: 'X' });
    expect(res.status).toBe(400);
  });
});
