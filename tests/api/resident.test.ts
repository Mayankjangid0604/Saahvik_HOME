import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/resident/resident.service', () => ({
  residentService: {
    list: vi.fn().mockResolvedValue({ residents: [{ id: 'r1', firstName: 'Jane' }], total: 1 }),
    get: vi.fn().mockResolvedValue({ id: 'r1', firstName: 'Jane', lastName: 'Doe' }),
    create: vi.fn().mockResolvedValue({ id: 'r1', firstName: 'Jane', lastName: 'Doe' }),
    update: vi.fn().mockResolvedValue({ id: 'r1', firstName: 'Jane' }),
    checkout: vi.fn().mockResolvedValue({ id: 'r1', status: 'CHECKED_OUT' }),
    search: vi.fn().mockResolvedValue({ residents: [], total: 0 }),
  },
}));

describe('Resident API', () => {
  const token = createTestToken();

  it('GET /api/residents - lists residents', async () => {
    const res = await request(app).get('/api/residents').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('POST /api/residents - creates resident', async () => {
    const res = await request(app).post('/api/residents')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jane', lastName: 'Doe' });
    expect(res.status).toBe(201);
  });

  it('POST /api/residents/:id/checkout - checks out', async () => {
    const res = await request(app).post('/api/residents/r1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
  });

  it('GET /api/residents/search - searches', async () => {
    const res = await request(app).get('/api/residents/search?q=jane')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
