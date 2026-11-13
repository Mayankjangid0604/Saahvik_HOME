import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  quantity: z.number().int().min(1).default(1),
});

export const createInvoiceSchema = z.object({
  residentId: z.string().uuid(),
  items: z.array(invoiceItemSchema).min(1),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  dueDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1).optional(),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CANCELLED']).optional(),
});
