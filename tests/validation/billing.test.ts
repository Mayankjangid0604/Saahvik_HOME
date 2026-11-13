import { describe, it, expect } from 'vitest';
import { createInvoiceSchema } from '../../src/validation/billing';

describe('billing validation', () => {
  it('validates invoice creation', () => {
    const valid = createInvoiceSchema.parse({
      residentId: '550e8400-e29b-41d4-a716-446655440000',
      items: [{ description: 'Room Rent', amount: 5000, quantity: 1 }],
      dueDate: '2024-12-31T00:00:00.000Z',
    });
    expect(valid.items).toHaveLength(1);
    expect(valid.tax).toBe(0);
  });

  it('rejects empty items', () => {
    expect(() => createInvoiceSchema.parse({
      residentId: '550e8400-e29b-41d4-a716-446655440000',
      items: [],
      dueDate: '2024-12-31T00:00:00.000Z',
    })).toThrow();
  });
});
