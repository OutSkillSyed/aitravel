/**
 * Google Places (New) — POST places:searchNearby with strict FieldMask.
 * Returns canonical NearbyPlace rows tagged with the caller's hotel id.
 *
 * Per doc 3:
 *   - X-Goog-Api-Key header
 *   - X-Goog-FieldMask required (we set the exact list from the doc)
 *   - rankPreference=DISTANCE, radius 50–100m, max 10 per category
 *   - Cache for 24h — caller persists via the NearbyRepo.
 */

import { randomUUID } from 'node:crypto';

import { serverEnv } from '@/lib/env';
import type { NearbyCategory, NearbyPlace } from '@/domain/nearby';

import type { PlacesAdapter } from './types';
import { AdapterError, fetchWithPolicy, runWithFallback } from './http';

const FIELD_MASK =
  'places.id,places.displayName,places.rating,places.userRatingCount,places.currentOpeningHours,places.priceLevel,places.location,places.primaryType,places.types';

const TYPE_MAP: Record<NearbyCategory, string[]> = {
  restaurant: ['restaurant'],
  cafe: ['cafe'],
  shop: ['store', 'shopping_mall'],
  pharmacy: ['pharmacy', 'drugstore'],
  transit: ['transit_station', 'bus_station', 'subway_station', 'train_station'],
  attraction: ['tourist_attraction', 'landmark'],
};

interface PlacesResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    currentOpeningHours?: { openNow?: boolean };
    priceLevel?: string;
    location?: { latitude: number; longitude: number };
    primaryType?: string;
    types?: string[];
  }>;
}

function toPriceLevel(raw?: string): number | null {
  switch (raw) {
    case 'PRICE_LEVEL_FREE':
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1;
    case 'PRICE_LEVEL_MODERATE':
      return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
      return 3;
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 4;
    default:
      return null;
  }
}

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const googlePlacesAdapter: PlacesAdapter = {
  async nearby({ lat, lng, radiusMeters = 100, categories, maxPerCategory = 10 }) {
    if (!serverEnv.GOOGLE_PLACES_API_KEY) {
      throw new AdapterError('google places key missing', 'http', 401);
    }
    const cats: NearbyCategory[] = categories ?? Object.keys(TYPE_MAP) as NearbyCategory[];
    const now = new Date().toISOString();
    const ttl = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const origin = { lat, lng };

    const perCat = await Promise.all(
      cats.map(async (cat) =>
        runWithFallback(
          async () => {
            const body = {
              includedTypes: TYPE_MAP[cat],
              maxResultCount: maxPerCategory,
              rankPreference: 'DISTANCE' as const,
              locationRestriction: {
                circle: {
                  center: { latitude: lat, longitude: lng },
                  radius: radiusMeters,
                },
              },
            };
            const payload = await fetchWithPolicy<PlacesResponse>(
              'https://places.googleapis.com/v1/places:searchNearby',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Goog-Api-Key': serverEnv.GOOGLE_PLACES_API_KEY!,
                  'X-Goog-FieldMask': FIELD_MASK,
                },
                body: JSON.stringify(body),
              },
              { adapter: `google-places-${cat}` },
            );
            return (payload.places ?? []).map<NearbyPlace>((p) => ({
              id: randomUUID(),
              hotel_id: '',
              place_id: p.id,
              name: p.displayName?.text ?? cat,
              category: cat,
              distance_meters: p.location
                ? haversineMeters(origin, { lat: p.location.latitude, lng: p.location.longitude })
                : 0,
              google_rating: p.rating ?? null,
              review_count: p.userRatingCount ?? null,
              open_now: p.currentOpeningHours?.openNow ?? null,
              price_level: toPriceLevel(p.priceLevel),
              lat: p.location?.latitude ?? 0,
              lng: p.location?.longitude ?? 0,
              cached_at: now,
              ttl_expires_at: ttl,
            }));
          },
          [] as NearbyPlace[],
          `google-places-${cat}`,
        ),
      ),
    );
    return perCat.flat();
  },
};
