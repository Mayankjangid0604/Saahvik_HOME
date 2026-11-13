import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/property/property.service', () => ({
  propertyService: {
    list: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Main Building' }]),
    get: vi.fn().mockResolvedValue({ id: 'p1', name: 'Main Building', rooms: [] }),
    create: vi.fn().mockResolvedValue({ id: 'p1', name: 'Main Building' }),
    update: vi.fn().mockResolvedValue({ id: 'p1', name: 'Updated' }),
    createRoom: vi.fn().mockResolvedValue({ id: 'r1', number: '101', beds: [] }),
    updateRoom: vi.fn().mockResolvedValue({ id: 'r1', number: '101' }),
    createBed: vi.fn().mockResolvedValue({ id: 'b1', label: 'A' }),
    updateBed: vi.fn().mockResolvedValue({ id: 'b1', label: 'B' }),
    getOccupancyStats: vi.fn().mockResolvedValue([{ propertyName: 'Main', occupancyRate: 75 }]),
  },
}));

describe('Property API', () => {
  const token = createTestToken();

  it('GET /api/properties - lists properties', async () => {
    const res = await request(app).get('/api/properties').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/properties - creates property', async () => {
    const res = await request(app).post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Main Building' });
    expect(res.status).toBe(201);
  });

  it('GET /api/properties/occupancy - returns stats', async () => {
    const res = await request(app).get('/api/properties/occupancy').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/properties/:id/rooms - creates room', async () => {
    const res = await request(app).post('/api/properties/p1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ number: '101', capacity: 4 });
    expect(res.status).toBe(201);
  });
});
