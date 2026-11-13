import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/settings/settings.service', () => ({
  settingsService: {
    getOrgSettings: vi.fn().mockResolvedValue({ invoicePrefix: 'INV', invoiceNextNumber: 1 }),
    updateOrgSettings: vi.fn().mockResolvedValue({ invoicePrefix: 'SH' }),
    getAdmissionFormConfig: vi.fn().mockResolvedValue({ fields: [] }),
    updateAdmissionFormConfig: vi.fn().mockResolvedValue({ fields: [{ name: 'name', label: 'Name', type: 'text', order: 1 }] }),
  },
}));

describe('Settings API', () => {
  const token = createTestToken();

  it('GET /api/settings - returns settings', async () => {
    const res = await request(app).get('/api/settings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('PATCH /api/settings - updates settings', async () => {
    const res = await request(app).patch('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ invoicePrefix: 'SH' });
    expect(res.status).toBe(200);
  });

  it('PUT /api/settings/admission-form - updates form config', async () => {
    const res = await request(app).put('/api/settings/admission-form')
      .set('Authorization', `Bearer ${token}`)
      .send({ fields: [{ name: 'name', label: 'Name', type: 'text', required: true, order: 1 }] });
    expect(res.status).toBe(200);
  });

  it('rejects non-OWNER access', async () => {
    const staffToken = createTestToken({ role: 'STAFF' });
    const res = await request(app).get('/api/settings').set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(403);
  });
});
