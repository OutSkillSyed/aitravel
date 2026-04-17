import { z } from 'zod';

export const SearchTypeSchema = z.enum(['flight', 'train', 'bus', 'hotel', 'nearby', 'surprise']);
export type SearchType = z.infer<typeof SearchTypeSchema>;

export const SearchSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  search_type: SearchTypeSchema,
  input_json: z.record(z.unknown()),
  results_json: z.record(z.unknown()).nullable().optional(),
  created_at: z.string().datetime({ offset: true }),
});
export type Search = z.infer<typeof SearchSchema>;
