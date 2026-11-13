import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/complaint/complaint.service', () => ({
  complaintService: {
    list: vi.fn().mockResolvedValue({ complaints: [], total: 0 }),
    get: vi.fn().mockResolvedValue({ id: 'c1', title: 'Leak', status: 'OPEN' }),
    create: vi.fn().mockResolvedValue({ id: 'c1', title: 'Leak' }),
    update: vi.fn().mockResolvedValue({ id: 'c1', status: 'RESOLVED' }),
  },
}));

describe('Complaint API', () => {
  const token = createTestToken();

  it('POST /api/complaints - creates complaint', async () => {
    const res = await request(app).post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Leak', description: 'Water leaking', category: 'PLUMBING' });
    expect(res.status).toBe(201);
  });

  it('GET /api/complaints - lists complaints', async () => {
    const res = await request(app).get('/api/complaints').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
