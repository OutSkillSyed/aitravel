/**
 * Amadeus Self-Service Flights — real OAuth2 client-credentials flow.
 *
 * The same access token is reused across concurrent requests and refreshed
 * up to 30 minutes early, per doc 3. Normalizes Amadeus flight-offers into
 * CanonicalFlight. Without credentials the adapter returns an empty array
 * so local dev works without supplier keys.
 */

import { serverEnv } from '@/lib/env';
import type { CanonicalFlight, TransportSearchQuery } from '@/domain/transport';

import type { FlightAdapter } from './types';
import { AdapterError, fetchWithPolicy, runWithFallback } from './http';

const INR_PER_EUR = 90; // rough fallback if price isn't already INR. Docs require INR.

interface AmadeusToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: AmadeusToken | null = null;
let inflight: Promise<AmadeusToken> | null = null;

async function getToken(): Promise<AmadeusToken> {
  if (cachedToken && cachedToken.expires_at - Date.now() > 30_000) {
    return cachedToken;
  }
  if (inflight) return inflight;

  const { AMADEUS_API_KEY, AMADEUS_API_SECRET, AMADEUS_BASE_URL } = serverEnv;
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    throw new AdapterError('amadeus credentials not configured', 'http', 401);
  }

  inflight = fetchWithPolicy<{ access_token: string; expires_in: number }>(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }).toString(),
    },
    { adapter: 'amadeus-auth' },
  )
    .then((payload) => {
      const expires = Math.min(payload.expires_in, 30 * 60);
      cachedToken = {
        access_token: payload.access_token,
        expires_at: Date.now() + expires * 1000,
      };
      return cachedToken;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

interface AmadeusOffer {
  id: string;
  price: { grandTotal: string; currency: string };
  numberOfBookableSeats?: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      numberOfStops: number;
    }>;
  }>;
  travelerPricings?: Array<{ fareDetailsBySegment: Array<{ cabin: string }> }>;
}

function normalizeOffer(offer: AmadeusOffer): CanonicalFlight | null {
  const itin = offer.itineraries[0];
  if (!itin) return null;
  const first = itin.segments[0];
  const last = itin.segments[itin.segments.length - 1];
  if (!first || !last) return null;

  const depart = new Date(first.departure.at);
  const arrive = new Date(last.arrival.at);
  const durationMinutes = Math.max(1, Math.round((arrive.getTime() - depart.getTime()) / 60_000));

  const grandTotal = Number.parseFloat(offer.price.grandTotal);
  const priceInr =
    offer.price.currency === 'INR' ? grandTotal : Math.round(grandTotal * INR_PER_EUR);

  const cabinRaw = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? 'ECONOMY';
  const cabinClass = (
    {
      ECONOMY: 'economy',
      PREMIUM_ECONOMY: 'premium_economy',
      BUSINESS: 'business',
      FIRST: 'first',
    } as const
  )[cabinRaw] ?? 'economy';

  return {
    source: 'amadeus',
    mode: 'flight',
    id: offer.id,
    origin: first.departure.iataCode,
    destination: last.arrival.iataCode,
    departureAt: new Date(first.departure.at).toISOString(),
    arrivalAt: new Date(last.arrival.at).toISOString(),
    durationMinutes,
    price_inr: priceInr,
    pricePerHour_inr: Math.round(priceInr / (durationMinutes / 60)),
    cabinClass,
    seatsAvailable: offer.numberOfBookableSeats ?? 0,
    cancellable: false,
    airline: first.carrierCode,
    stops: Math.max(itin.segments.length - 1, 0),
    raw: offer,
  };
}

export const amadeusFlightAdapter: FlightAdapter = {
  async search(query: TransportSearchQuery) {
    return runWithFallback(
      async () => {
        const token = await getToken();
        const params = new URLSearchParams({
          originLocationCode: query.origin,
          destinationLocationCode: query.destination,
          departureDate: query.departDate,
          adults: String(query.pax),
          currencyCode: 'INR',
          max: '15',
          nonStop: 'false',
        });
        if (query.returnDate) params.set('returnDate', query.returnDate);
        if (query.maxPriceInr) params.set('maxPrice', String(Math.floor(query.maxPriceInr)));

        const payload = await fetchWithPolicy<{ data: AmadeusOffer[] }>(
          `${serverEnv.AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params}`,
          { headers: { Authorization: `Bearer ${token.access_token}` } },
          { adapter: 'amadeus-flights' },
        );
        return (payload.data ?? []).flatMap((o) => {
          const norm = normalizeOffer(o);
          return norm ? [norm] : [];
        });
      },
      [] as CanonicalFlight[],
      'amadeus-flights',
    );
  },
};
