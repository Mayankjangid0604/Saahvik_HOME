import { z } from 'zod';

export const createStaffProfileSchema = z.object({
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().datetime().optional(),
  salary: z.number().min(0).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const updateStaffProfileSchema = createStaffProfileSchema;
