import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['deal', 'price_drop', 'booking', 'system']);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  type: NotificationTypeSchema,
  is_read: z.boolean().default(false),
  sent_at: z.string().datetime({ offset: true }),
});
export type Notification = z.infer<typeof NotificationSchema>;
