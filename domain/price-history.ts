import { z } from 'zod';

export const PriceHistorySchema = z.object({
  id: z.string().uuid(),
  entity_type: z.enum(['flight_route', 'hotel', 'train_route', 'bus_route']),
  entity_key: z.string(),
  supplier: z.string(),
  price_inr: z.number().nonnegative(),
  baseline_inr: z.number().nonnegative(),
  anomaly_score: z.number(),
  recorded_at: z.string().datetime({ offset: true }),
});
export type PriceHistory = z.infer<typeof PriceHistorySchema>;
