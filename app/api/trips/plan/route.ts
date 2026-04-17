import { isResponse, jsonError, jsonOk, readJson } from '@/lib/api';
import { TripInputSchema } from '@/domain/trip';
import { getRepos } from '@/repositories';
import { planTrip } from '@/services/planner';

// Demo-mode user id until Supabase Auth lands — maps to MOCK_USER.
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: Request) {
  const body = await readJson(request, TripInputSchema);
  if (isResponse(body)) return body;

  const repos = getRepos();
  const trip = await repos.trips.create({
    user_id: DEMO_USER_ID,
    budget_inr: body.budget_inr,
    days: body.days,
    traveller_count: body.traveller_count,
    origin: body.origin,
    trip_style: body.trip_style ?? null,
  });

  try {
    const itinerary = await planTrip(body);
    const updated = await repos.trips.setItinerary(trip.id, itinerary, 'ready');
    await repos.searches.record({
      user_id: DEMO_USER_ID,
      search_type: 'flight',
      input_json: body,
      results_json: { trip_id: trip.id, options: itinerary.options.map((o) => o.type) },
    });
    return jsonOk({ trip: updated });
  } catch (err) {
    console.error('[plan] failed', err);
    return jsonError(502, 'planner failed', { details: (err as Error).message });
  }
}

export async function GET() {
  const trips = await getRepos().trips.listByUser(DEMO_USER_ID);
  return jsonOk({ trips });
}
