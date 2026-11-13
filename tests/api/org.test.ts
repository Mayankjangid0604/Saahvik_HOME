import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/org/org.service', () => ({
  orgService: {
    getOrg: vi.fn().mockResolvedValue({ id: 'o1', name: 'Test Hostel', slug: 'test-hostel' }),
    updateOrg: vi.fn().mockResolvedValue({ id: 'o1', name: 'Updated Hostel' }),
    listUsers: vi.fn().mockResolvedValue([
      { id: 'u1', firstName: 'John', lastName: 'Doe', role: 'OWNER' },
    ]),
    createUser: vi.fn().mockResolvedValue({
      user: { id: 'u2', email: 'staff@test.com', firstName: 'Jane', lastName: 'Doe', role: 'WARDEN' },
      generatedPassword: 'abc12345',
    }),
    updateUser: vi.fn().mockResolvedValue({ id: 'u2', firstName: 'Jane', role: 'WARDEN' }),
    getUser: vi.fn().mockResolvedValue({ id: 'u2', firstName: 'Jane', lastName: 'Doe', role: 'WARDEN' }),
  },
}));

describe('Org API', () => {
  const token = createTestToken();

  it('GET /api/org - returns org', async () => {
    const res = await request(app).get('/api/org').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Hostel');
  });

  it('PATCH /api/org - updates org', async () => {
    const res = await request(app).patch('/api/org')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Hostel' });
    expect(res.status).toBe(200);
  });

  it('GET /api/org/users - lists users', async () => {
    const res = await request(app).get('/api/org/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /api/org/users - creates user', async () => {
    const res = await request(app).post('/api/org/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'staff@test.com', firstName: 'Jane', lastName: 'Doe', role: 'WARDEN' });
    expect(res.status).toBe(201);
    expect(res.body.data.generatedPassword).toBeTruthy();
  });

  it('rejects STAFF from creating users', async () => {
    const staffToken = createTestToken({ role: 'STAFF' });
    const res = await request(app).post('/api/org/users')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ email: 'x@test.com', firstName: 'A', lastName: 'B', role: 'STAFF' });
    expect(res.status).toBe(403);
  });
});
