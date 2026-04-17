import { z } from 'zod';

export const HotelSchema = z.object({
  id: z.string().uuid(),
  supplier: z.string(),
  supplier_hotel_id: z.string(),
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  city: z.string(),
  star_rating: z.number().min(0).max(5),
  hotel_json: z
    .object({
      photos: z.array(z.string()).default([]),
      amenities: z.array(z.string()).default([]),
      description: z.string().optional(),
      price_per_night_inr: z.number().nonnegative(),
      rating: z.number().min(0).max(5).optional(),
      review_count: z.number().int().nonnegative().optional(),
      address: z.string().optional(),
    })
    .passthrough(),
  created_at: z.string().datetime({ offset: true }),
});
export type Hotel = z.infer<typeof HotelSchema>;

export const HotelSearchQuerySchema = z.object({
  city: z.string().min(2),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(9).default(1),
  max_price_inr: z.coerce.number().positive().optional(),
});
export type HotelSearchQuery = z.infer<typeof HotelSearchQuerySchema>;
