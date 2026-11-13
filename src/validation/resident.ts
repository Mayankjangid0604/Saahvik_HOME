import { z } from 'zod';

export const createResidentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  bedId: z.string().uuid().optional(),
  guardianId: z.string().uuid().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  fees: z.array(z.object({
    feeType: z.string().min(1),
    amount: z.number().positive(),
    recurrence: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
  })).optional(),
});

export const updateResidentSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bedId: z.string().uuid().nullable().optional(),
  guardianId: z.string().uuid().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const checkoutResidentSchema = z.object({
  exitReason: z.string().optional(),
});
