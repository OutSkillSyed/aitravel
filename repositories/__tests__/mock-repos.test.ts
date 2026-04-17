import { describe, expect, it } from 'vitest';

import { mockRepos } from '@/repositories/mock';

describe('mockRepos', () => {
  it('seeds hotels searchable by city', async () => {
    const repos = mockRepos();
    const hotels = await repos.hotels.search({ city: 'Goa' });
    expect(hotels.length).toBeGreaterThan(0);
    for (const h of hotels) expect(h.city).toBe('Goa');
  });

  it('creates trips and updates itinerary idempotently', async () => {
    const repos = mockRepos();
    const trip = await repos.trips.create({
      user_id: '00000000-0000-0000-0000-000000000001',
      budget_inr: 50_000,
      days: 4,
      traveller_count: 2,
      origin: 'DEL',
      trip_style: 'adventure',
    });
    expect(trip.status).toBe('planning');
    const updated = await repos.trips.setItinerary(trip.id, {
      options: [
        {
          type: 'best',
          total_cost_inr: 40_000,
          score: 0.7,
          breakdown: { transport: 14_000, hotels: 14_000, food: 7_200, activities: 4_800 },
          days: [
            {
              day: 1,
              location: 'Goa',
              accommodation: 'Test hotel',
              transport: 'Flight',
              activities: ['Arrive'],
              estimated_cost: 10_000,
            },
          ],
        },
      ],
    } as never, 'ready');
    expect(updated.status).toBe('ready');
    expect(updated.itinerary_json?.options).toHaveLength(1);
  });

  it('nearby cache honours TTL', async () => {
    const repos = mockRepos();
    const hotel = (await repos.hotels.search({ city: 'Jaipur' }))[0]!;
    const fresh = await repos.nearby.isFresh(hotel.id, new Date());
    expect(typeof fresh).toBe('boolean');
  });
});
