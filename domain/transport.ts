/**
 * Canonical transport types — every flights/trains/buses adapter must map into these.
 * Pricing is always INR. Raw supplier payload is preserved under `raw` for debugging.
 */
import { z } from 'zod';

export const CanonicalTransportBase = z.object({
  source: z.string(),
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureAt: z.string().datetime({ offset: true }),
  arrivalAt: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
  price_inr: z.number().nonnegative(),
  pricePerHour_inr: z.number().nonnegative(),
  cancellable: z.boolean(),
  raw: z.unknown(),
});

export const CanonicalFlightSchema = CanonicalTransportBase.extend({
  mode: z.literal('flight'),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']),
  seatsAvailable: z.number().int().nonnegative(),
  airline: z.string().optional(),
  stops: z.number().int().nonnegative().default(0),
});
export type CanonicalFlight = z.infer<typeof CanonicalFlightSchema>;

export const CanonicalTrainSchema = CanonicalTransportBase.extend({
  mode: z.literal('train'),
  trainNumber: z.string(),
  classCode: z.string(),
  seatsAvailable: z.number().int().nonnegative().optional(),
});
export type CanonicalTrain = z.infer<typeof CanonicalTrainSchema>;

export const CanonicalBusSchema = CanonicalTransportBase.extend({
  mode: z.literal('bus'),
  operator: z.string(),
  busType: z.string(),
  seatsAvailable: z.number().int().nonnegative().optional(),
});
export type CanonicalBus = z.infer<typeof CanonicalBusSchema>;

export const CanonicalTransportSchema = z.discriminatedUnion('mode', [
  CanonicalFlightSchema,
  CanonicalTrainSchema,
  CanonicalBusSchema,
]);
export type CanonicalTransport = z.infer<typeof CanonicalTransportSchema>;

export interface TransportSearchQuery {
  origin: string;
  destination: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string;
  pax: number;
  maxPriceInr?: number;
}
