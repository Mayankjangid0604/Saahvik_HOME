import { describe, it, expect } from 'vitest';
import { createComplaintSchema, updateComplaintSchema } from '../../src/validation/complaint';

describe('complaint validation', () => {
  it('validates complaint creation', () => {
    const valid = createComplaintSchema.parse({
      title: 'Leaky faucet',
      description: 'Bathroom faucet is leaking',
      category: 'PLUMBING',
    });
    expect(valid.priority).toBe('MEDIUM');
  });

  it('validates complaint update', () => {
    const valid = updateComplaintSchema.parse({
      status: 'RESOLVED',
      resolution: 'Fixed the faucet',
    });
    expect(valid.status).toBe('RESOLVED');
  });
});
