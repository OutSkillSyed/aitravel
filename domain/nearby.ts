import { z } from 'zod';

export const NearbyCategorySchema = z.enum([
  'restaurant',
  'cafe',
  'shop',
  'pharmacy',
  'transit',
  'attraction',
]);
export type NearbyCategory = z.infer<typeof NearbyCategorySchema>;

export const NearbyPlaceSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  place_id: z.string(),
  name: z.string().min(1),
  category: NearbyCategorySchema,
  distance_meters: z.number().int().nonnegative(),
  google_rating: z.number().min(0).max(5).nullable().optional(),
  review_count: z.number().int().nonnegative().nullable().optional(),
  open_now: z.boolean().nullable().optional(),
  price_level: z.number().int().min(1).max(4).nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  cached_at: z.string().datetime({ offset: true }),
  ttl_expires_at: z.string().datetime({ offset: true }),
});
export type NearbyPlace = z.infer<typeof NearbyPlaceSchema>;
