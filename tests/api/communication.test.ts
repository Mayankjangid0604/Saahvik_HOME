import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/communication/communication.service', () => ({
  communicationService: {
    sendNotification: vi.fn().mockResolvedValue([{ id: 'n1' }]),
    getUserNotifications: vi.fn().mockResolvedValue([{ id: 'n1', title: 'Test', isRead: false }]),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    getEmailUsage: vi.fn().mockResolvedValue({ used: 50, cap: 1000, remaining: 950 }),
  },
}));

describe('Communication API', () => {
  const token = createTestToken();

  it('POST /api/communication/send - sends notification', async () => {
    const res = await request(app).post('/api/communication/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ userIds: ['550e8400-e29b-41d4-a716-446655440000'], title: 'Test', body: 'Body' });
    expect(res.status).toBe(200);
  });

  it('GET /api/communication/notifications - gets notifications', async () => {
    const res = await request(app).get('/api/communication/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/communication/email-usage - gets email usage', async () => {
    const res = await request(app).get('/api/communication/email-usage').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.cap).toBe(1000);
  });
});
