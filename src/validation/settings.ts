import { z } from 'zod';

export const updateOrgSettingsSchema = z.object({
  invoicePrefix: z.string().min(1).max(10).optional(),
  defaultPaymentTerms: z.number().int().min(0).optional(),
  lateFeePercentage: z.number().min(0).max(100).optional(),
  maintenanceEmail: z.string().email().optional(),
  billingEmail: z.string().email().optional(),
  notificationPrefs: z.record(z.string(), z.unknown()).optional(),
});

export const admissionFormConfigSchema = z.object({
  fields: z.array(z.object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'file', 'textarea']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    order: z.number().int(),
  })),
});
