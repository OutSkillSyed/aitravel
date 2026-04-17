import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;

export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export type TripStyle =
  | 'adventure'
  | 'relaxed'
  | 'family'
  | 'romantic'
  | 'backpacker'
  | 'business';

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type TransportMode = 'flight' | 'train' | 'bus';
