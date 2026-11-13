import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { createTestToken } from '../helpers';

vi.mock('../../src/services/billing/billing.service', () => ({
  billingService: {
    listInvoices: vi.fn().mockResolvedValue({ invoices: [], total: 0 }),
    getInvoice: vi.fn().mockResolvedValue({ id: 'inv1', number: 'INV-000001', total: 5000 }),
    createInvoice: vi.fn().mockResolvedValue({ id: 'inv1', number: 'INV-000001', total: 5000 }),
    updateInvoice: vi.fn().mockResolvedValue({ id: 'inv1', total: 6000 }),
    getResidentInvoices: vi.fn().mockResolvedValue([]),
    getOverdueInvoices: vi.fn().mockResolvedValue([]),
  },
}));

describe('Billing API', () => {
  const token = createTestToken();

  it('GET /api/invoices - lists invoices', async () => {
    const res = await request(app).get('/api/invoices').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/invoices - creates invoice', async () => {
    const res = await request(app).post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        residentId: '550e8400-e29b-41d4-a716-446655440000',
        items: [{ description: 'Rent', amount: 5000, quantity: 1 }],
        dueDate: '2024-12-31T00:00:00.000Z',
      });
    expect(res.status).toBe(201);
  });

  it('GET /api/invoices/overdue - returns overdue', async () => {
    const res = await request(app).get('/api/invoices/overdue').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
