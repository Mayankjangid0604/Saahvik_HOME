import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'CLEANING', 'PEST_CONTROL', 'GENERAL', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  resolution: z.string().optional(),
});
