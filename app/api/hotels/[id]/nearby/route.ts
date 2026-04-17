import { jsonError, jsonOk } from '@/lib/api';
import { getRepos } from '@/repositories';
import { adapters } from '@/adapters';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const repos = getRepos();
  const hotel = await repos.hotels.findById(id);
  if (!hotel) return jsonError(404, 'hotel not found');

  const fresh = await repos.nearby.isFresh(id, new Date());
  if (fresh) {
    const cached = await repos.nearby.list(id);
    return jsonOk({ hotel_id: id, source: 'cache', places: cached });
  }

  // Fall back: use mock seed if places API isn't configured (returns []).
  let places = await adapters.places
    .nearby({ lat: hotel.lat, lng: hotel.lng, radiusMeters: 100, maxPerCategory: 10 })
    .catch(() => []);
  if (places.length === 0) {
    places = await repos.nearby.list(id);
  } else {
    const stamped = places.map((p) => ({ ...p, hotel_id: id }));
    await repos.nearby.cache(id, stamped);
    places = stamped;
  }
  return jsonOk({ hotel_id: id, source: places.length ? 'live+seed' : 'empty', places });
}
