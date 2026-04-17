import { z } from 'zod';

export const BookingTypeSchema = z.enum(['flight', 'train', 'bus', 'hotel']);
export type BookingType = z.infer<typeof BookingTypeSchema>;

export const BookingStatusSchema = z.enum([
  'pending',
  'payment_pending',
  'confirmed',
  'failed',
  'cancelled',
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  trip_id: z.string().uuid().nullable().optional(),
  booking_type: BookingTypeSchema,
  supplier_ref: z.string(),
  amount_inr: z.number().nonnegative(),
  status: BookingStatusSchema.default('pending'),
  booking_json: z.record(z.unknown()).default({}),
  booked_at: z.string().datetime({ offset: true }),
});
export type Booking = z.infer<typeof BookingSchema>;
