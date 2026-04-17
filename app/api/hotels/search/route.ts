import { HotelSearchQuerySchema } from '@/domain/hotel';
import { isResponse, jsonOk, readQuery } from '@/lib/api';
import { adapters } from '@/adapters';
import { getRepos } from '@/repositories';

export async function GET(request: Request) {
  const parsed = readQuery(request, HotelSearchQuerySchema);
  if (isResponse(parsed)) return parsed;

  const [live, local] = await Promise.all([
    adapters.hotels.search(parsed),
    getRepos().hotels.search({ city: parsed.city, maxPriceInr: parsed.max_price_inr }),
  ]);

  // Merge: prefer local ids (stable for linking) but include live-only entries.
  const map = new Map(local.map((h) => [h.supplier_hotel_id, h]));
  for (const h of live) if (!map.has(h.supplier_hotel_id)) map.set(h.supplier_hotel_id, h);

  return jsonOk({ query: parsed, hotels: Array.from(map.values()) });
}
