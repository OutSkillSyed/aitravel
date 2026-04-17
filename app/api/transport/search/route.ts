import { z } from 'zod';

import { adapters } from '@/adapters';
import { isResponse, jsonOk, readQuery } from '@/lib/api';

const QuerySchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pax: z.coerce.number().int().min(1).max(9).default(1),
  maxPriceInr: z.coerce.number().int().positive().optional(),
  mode: z.enum(['flight', 'train', 'bus', 'all']).default('all'),
});

export async function GET(request: Request) {
  const parsed = readQuery(request, QuerySchema);
  if (isResponse(parsed)) return parsed;

  const query = {
    origin: parsed.origin.toUpperCase(),
    destination: parsed.destination.toUpperCase(),
    departDate: parsed.departDate,
    returnDate: parsed.returnDate,
    pax: parsed.pax,
    maxPriceInr: parsed.maxPriceInr,
  };

  const [flights, trains, buses] = await Promise.all([
    parsed.mode === 'all' || parsed.mode === 'flight' ? adapters.flights.search(query) : Promise.resolve([]),
    parsed.mode === 'all' || parsed.mode === 'train' ? adapters.trains.search(query) : Promise.resolve([]),
    parsed.mode === 'all' || parsed.mode === 'bus' ? adapters.buses.search(query) : Promise.resolve([]),
  ]);

  return jsonOk({
    query,
    flights,
    trains,
    buses,
    counts: { flights: flights.length, trains: trains.length, buses: buses.length },
  });
}
