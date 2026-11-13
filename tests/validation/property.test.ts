import { describe, it, expect } from 'vitest';
import { createPropertySchema, createRoomSchema, createBedSchema } from '../../src/validation/property';

describe('property validation', () => {
  it('validates property creation', () => {
    const valid = createPropertySchema.parse({ name: 'Main Building' });
    expect(valid.name).toBe('Main Building');
    expect(valid.type).toBe('HOSTEL');
  });

  it('validates room creation', () => {
    const valid = createRoomSchema.parse({ number: '101', capacity: 4 });
    expect(valid.capacity).toBe(4);
    expect(valid.roomType).toBe('SHARED');
  });

  it('rejects zero capacity', () => {
    expect(() => createRoomSchema.parse({ number: '101', capacity: 0 })).toThrow();
  });

  it('validates bed creation', () => {
    const valid = createBedSchema.parse({ label: 'A' });
    expect(valid.label).toBe('A');
  });
});
