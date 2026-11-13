import { describe, it, expect } from 'vitest';
import { createResidentSchema, checkoutResidentSchema } from '../../src/validation/resident';

describe('resident validation', () => {
  it('validates resident creation', () => {
    const valid = createResidentSchema.parse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      gender: 'FEMALE',
    });
    expect(valid.firstName).toBe('Jane');
  });

  it('validates with fees', () => {
    const valid = createResidentSchema.parse({
      firstName: 'Jane',
      lastName: 'Doe',
      fees: [{
        feeType: 'Rent',
        amount: 5000,
        recurrence: 'MONTHLY',
        startDate: '2024-01-01T00:00:00.000Z',
      }],
    });
    expect(valid.fees).toHaveLength(1);
  });

  it('validates checkout', () => {
    const valid = checkoutResidentSchema.parse({ exitReason: 'Graduated' });
    expect(valid.exitReason).toBe('Graduated');
  });
});
