import { z } from 'zod';

export const AlertTypeSchema = z.enum(['price_drop', 'deal', 'availability']);
export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  entity_key: z.string(),
  threshold_inr: z.number().positive(),
  alert_type: AlertTypeSchema,
  is_active: z.boolean().default(true),
  last_triggered: z.string().datetime({ offset: true }).nullable().optional(),
  created_at: z.string().datetime({ offset: true }),
});
export type Alert = z.infer<typeof AlertSchema>;
