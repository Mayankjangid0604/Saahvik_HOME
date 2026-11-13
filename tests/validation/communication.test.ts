import { describe, it, expect } from 'vitest';
import { sendNotificationSchema, markReadSchema } from '../../src/validation/communication';

describe('communication validation', () => {
  it('validates send notification', () => {
    const valid = sendNotificationSchema.parse({
      userIds: ['550e8400-e29b-41d4-a716-446655440000'],
      title: 'Test',
      body: 'Test body',
    });
    expect(valid.channel).toBe('IN_APP');
  });

  it('validates mark read', () => {
    const valid = markReadSchema.parse({
      notificationIds: ['550e8400-e29b-41d4-a716-446655440000'],
    });
    expect(valid.notificationIds).toHaveLength(1);
  });
});
