import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['RAZORPAY', 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI']).default('RAZORPAY'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const recordManualPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI']),
  notes: z.string().optional(),
});
