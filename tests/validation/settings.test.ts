import { describe, it, expect } from 'vitest';
import { updateOrgSettingsSchema, admissionFormConfigSchema } from '../../src/validation/settings';

describe('settings validation', () => {
  it('validates org settings update', () => {
    const valid = updateOrgSettingsSchema.parse({
      invoicePrefix: 'SH',
      lateFeePercentage: 5,
    });
    expect(valid.invoicePrefix).toBe('SH');
  });

  it('validates admission form config', () => {
    const valid = admissionFormConfigSchema.parse({
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', required: true, order: 1 },
        { name: 'dob', label: 'Date of Birth', type: 'date', order: 2 },
      ],
    });
    expect(valid.fields).toHaveLength(2);
  });
});
