import { z } from 'zod';

export const sendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  channel: z.enum(['IN_APP', 'EMAIL']).default('IN_APP'),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1),
});
