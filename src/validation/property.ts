import { z } from 'zod';

export const createPropertySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().optional(),
  type: z.enum(['HOSTEL', 'PG', 'DORMITORY']).default('HOSTEL'),
});

export const updatePropertySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().optional(),
  type: z.enum(['HOSTEL', 'PG', 'DORMITORY']).optional(),
  isActive: z.boolean().optional(),
});

export const createRoomSchema = z.object({
  number: z.string().min(1),
  floor: z.number().int().default(0),
  capacity: z.number().int().min(1),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'SHARED', 'DORMITORY']).default('SHARED'),
  amenities: z.record(z.string(), z.unknown()).optional(),
});

export const updateRoomSchema = z.object({
  number: z.string().min(1).optional(),
  floor: z.number().int().optional(),
  capacity: z.number().int().min(1).optional(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'SHARED', 'DORMITORY']).optional(),
  amenities: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const createBedSchema = z.object({
  label: z.string().min(1),
});

export const updateBedSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
