import { z } from 'zod';

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['WARDEN', 'STAFF', 'PARENT']),
  password: z.string().min(8).max(128).optional(),
}).refine(d => d.email || d.phone, { message: 'Email or phone required' });

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['WARDEN', 'STAFF', 'PARENT']).optional(),
  isActive: z.boolean().optional(),
});
