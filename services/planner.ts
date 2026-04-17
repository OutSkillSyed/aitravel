/**
 * Trip planner. Assembles three budget-valid options (best / cheapest / comfort)
 * using deterministic pricing from the adapters and optional Gemini narrative
 * for the day-by-day activities. Pricing is never fabricated by the LLM.
 *
 * Flow:
 *   1. Decide candidate destinations (from input or mock hotel cities).
 *   2. Per destination, fetch the cheapest available transport leg and a hotel
 *      list. Build three persona-tuned shortlists with deterministic costs.
 *   3. Score and pick a single winner per persona (may share destinations).
 *   4. Ask Gemini — if configured — to write the day plan narrative for each
 *      winner. Fall back to a deterministic template otherwise.
 *   5. Validate the final output with Zod and return.
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

import { serverEnv } from '@/lib/env';
import type {
  Breakdown,
  DayPlan,
  OptionType,
  PlannedOption,
  PlannerOutput,
  TripInput,
} from '@/domain/trip';
import { PlannerOutputSchema } from '@/domain/trip';
import type { Hotel } from '@/domain/hotel';
import type { CanonicalTransport, TransportMode } from '@/domain/transport';

import { adapters } from '@/adapters';
import { allocateBreakdown, scoreOption } from './scorer';

const DEFAULT_DESTINATIONS: Record<string, string[]> = {
  DEL: ['Goa', 'Jaipur', 'Udaipur', 'Manali', 'Kochi'],
  BOM: ['Goa', 'Udaipur', 'Jaipur', 'Manali'],
  BLR: ['Goa', 'Kochi', 'Pondicherry'],
};

const CITY_IATA: Record<string, string> = {
  goa: 'GOI',
  jaipur: 'JAI',
  udaipur: 'UDR',
  manali: 'DHM',
  kochi: 'COK',
  pondicherry: 'PNY',
};

interface Candidate {
  destination: string;
  hotel: Hotel;
  transport: CanonicalTransport | null;
  transportCost: number;
  hotelTotal: number;
  nights: number;
  total: number;
  breakdown: Breakdown;
  avgRating: number;
}

function resolveDestinations(input: TripInput): string[] {
  if (input.optional_destinations && input.optional_destinations.length > 0) {
    return input.optional_destinations;
  }
  const originCode = input.origin.toUpperCase().slice(0, 3);
  return DEFAULT_DESTINATIONS[originCode] ?? ['Goa', 'Udaipur', 'Jaipur'];
}

function cheapestTransport(list: CanonicalTransport[]): CanonicalTransport | null {
  return list.reduce<CanonicalTransport | null>(
    (best, item) => (best == null || item.price_inr < best.price_inr ? item : best),
    null,
  );
}

async function buildCandidate(input: TripInput, destination: string): Promise<Candidate | null> {
  const destCode = CITY_IATA[destination.toLowerCase()] ?? destination.toUpperCase().slice(0, 3);
  const originCode = input.origin.toUpperCase().slice(0, 3);
  const today = new Date();
  const departDate = new Date(today.getTime() + 21 * 86_400_000).toISOString().slice(0, 10);
  const returnDate = new Date(today.getTime() + (21 + input.days) * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const query = {
    origin: originCode,
    destination: destCode,
    departDate,
    returnDate,
    pax: input.traveller_count,
  };

  const [flights, trains, buses, hotels] = await Promise.all([
    adapters.flights.search(query),
    adapters.trains.search(query),
    adapters.buses.search(query),
    adapters.hotels.search({
      city: destination,
      checkin: departDate,
      checkout: returnDate,
      guests: input.traveller_count,
    }),
  ]);

  const transport =
    cheapestTransport([...flights, ...trains, ...buses]) ??
    cheapestTransport([...trains, ...buses, ...flights]);

  if (hotels.length === 0) return null;

  const sortedHotels = [...hotels].sort(
    (a, b) => b.hotel_json.price_per_night_inr - a.hotel_json.price_per_night_inr,
  );
  const pickByPersona = sortedHotels[0]; // default; planner picks per persona later
  const hotelNights = input.days;
  const transportCost = (transport?.price_inr ?? 0) * input.traveller_count;
  const hotelTotal = pickByPersona.hotel_json.price_per_night_inr * hotelNights;
  const total = transportCost + hotelTotal;

  return {
    destination,
    hotel: pickByPersona,
    transport,
    transportCost,
    hotelTotal,
    nights: hotelNights,
    total,
    breakdown: allocateBreakdown(total, input.trip_style),
    avgRating: pickByPersona.hotel_json.rating ?? pickByPersona.star_rating,
  };
}

function selectPersonaWinner(
  candidates: Candidate[],
  persona: OptionType,
  budgetInr: number,
): Candidate | null {
  // For comfort we pick the highest rated; cheapest by lowest total; best by score.
  const valid = candidates.filter((c) => c.total <= budgetInr);
  if (valid.length === 0) {
    // Budget-blown fallback: still return the cheapest so UI can render + suggest relaxation.
    return candidates.reduce((best, c) => (best == null || c.total < best.total ? c : best), null as Candidate | null);
  }
  switch (persona) {
    case 'cheapest':
      return valid.slice().sort((a, b) => a.total - b.total)[0] ?? null;
    case 'comfort':
      return valid.slice().sort((a, b) => b.avgRating - a.avgRating || a.total - b.total)[0] ?? null;
    case 'best':
    default: {
      const withScore = valid.map((c) => ({
        c,
        s: scoreOption('best', {
          totalCostInr: c.total,
          budgetInr,
          avgHotelRating: c.avgRating,
          transportStops: c.transport && 'stops' in c.transport ? c.transport.stops : 0,
          transportHours: (c.transport?.durationMinutes ?? 180) / 60,
        }),
      }));
      withScore.sort((a, b) => b.s - a.s);
      return withScore[0]?.c ?? null;
    }
  }
}

function templatizeDays(input: TripInput, candidate: Candidate): DayPlan[] {
  const perDayTotal = Math.round(candidate.total / Math.max(input.days, 1));
  return Array.from({ length: input.days }, (_, i) => {
    const day = i + 1;
    return {
      day,
      location: candidate.destination,
      accommodation: candidate.hotel.name,
      transport: day === 1 ? transportSummary(candidate.transport) : 'Local transit & walking',
      activities:
        day === 1
          ? ['Arrival and hotel check-in', 'Neighbourhood orientation walk']
          : day === input.days
            ? ['Leisure morning', 'Transfer and departure']
            : defaultActivitiesFor(candidate.destination, day),
      estimated_cost: perDayTotal,
    };
  });
}

function transportSummary(t: CanonicalTransport | null): string {
  if (!t) return 'Self-arranged transfer';
  if (t.mode === 'flight') return `Flight ${t.airline ?? ''} ${t.origin}→${t.destination}`.trim();
  if (t.mode === 'train') return `Train ${t.trainNumber} (${t.classCode})`;
  return `Bus — ${t.operator}`;
}

function defaultActivitiesFor(destination: string, day: number): string[] {
  const sets: Record<string, string[][]> = {
    Goa: [
      ['Beach morning at Palolem', 'Seafood shack lunch', 'Sunset kayak'],
      ['Spice plantation day trip', 'Old Goa heritage walk'],
      ['Dudhsagar waterfall excursion', 'Night market shopping'],
    ],
    Jaipur: [
      ['Amber Fort with audio guide', 'Hawa Mahal photos', 'Chokhi Dhani dinner'],
      ['City Palace & Jantar Mantar', 'Bapu Bazaar block-printing'],
      ['Nahargarh sunrise', 'Jal Mahal photo stop'],
    ],
    Udaipur: [
      ['Lake Pichola boat ride', 'City Palace tour'],
      ['Bagore-ki-Haveli folk show', 'Monsoon Palace sunset'],
      ['Shilpgram crafts village', 'Fateh Sagar lakeside'],
    ],
  };
  const options = sets[destination];
  if (!options) return ['Guided local highlights tour', 'Hotel-recommended evening plan'];
  return options[(day - 1) % options.length] ?? [];
}

let geminiModel: GenerativeModel | null = null;
function getGemini(): GenerativeModel | null {
  if (geminiModel) return geminiModel;
  if (!serverEnv.GEMINI_API_KEY) return null;
  const client = new GoogleGenerativeAI(serverEnv.GEMINI_API_KEY);
  geminiModel = client.getGenerativeModel({
    model: serverEnv.GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
  });
  return geminiModel;
}

async function narrateWithGemini(
  input: TripInput,
  candidate: Candidate,
  persona: OptionType,
): Promise<DayPlan[] | null> {
  const model = getGemini();
  if (!model) return null;
  const prompt = JSON.stringify({
    role: 'You are an expert travel planner for the Indian market. Respond with STRICT JSON only.',
    instruction:
      'Return an array of days. Each day has: day (1-indexed int), location (string), accommodation (string), transport (string, short), activities (array of 2-4 short strings), estimated_cost (non-negative INR).',
    persona,
    input,
    chosen: {
      destination: candidate.destination,
      hotel: candidate.hotel.name,
      hotel_rating: candidate.avgRating,
      transport_summary: transportSummary(candidate.transport),
      budget_inr: input.budget_inr,
      total_estimated_inr: candidate.total,
    },
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['day', 'location', 'accommodation', 'transport', 'activities', 'estimated_cost'],
      },
    },
  });
  try {
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    const parsed = JSON.parse(text);
    const days = Array.isArray(parsed) ? parsed : parsed.days;
    if (!Array.isArray(days)) return null;
    // Coerce into our schema (defensive)
    return days.slice(0, input.days).map((d: Record<string, unknown>, i) => ({
      day: Number(d.day ?? i + 1),
      location: String(d.location ?? candidate.destination),
      accommodation: String(d.accommodation ?? candidate.hotel.name),
      transport: String(d.transport ?? transportSummary(candidate.transport)),
      activities: Array.isArray(d.activities)
        ? (d.activities as unknown[]).map((a) => String(a))
        : [],
      estimated_cost: Math.max(0, Number(d.estimated_cost ?? 0)),
    }));
  } catch (err) {
    console.warn('[planner] gemini narration failed, using template:', (err as Error).message);
    return null;
  }
}

async function assembleOption(
  input: TripInput,
  candidate: Candidate,
  persona: OptionType,
): Promise<PlannedOption> {
  const geminiDays = await narrateWithGemini(input, candidate, persona);
  const days = geminiDays ?? templatizeDays(input, candidate);
  const stops = candidate.transport && 'stops' in candidate.transport ? candidate.transport.stops : 0;
  const transportHours = (candidate.transport?.durationMinutes ?? 180) / 60;

  return {
    type: persona,
    total_cost_inr: candidate.total,
    score: scoreOption(persona, {
      totalCostInr: candidate.total,
      budgetInr: input.budget_inr,
      avgHotelRating: candidate.avgRating,
      transportStops: stops,
      transportHours,
    }),
    breakdown: candidate.breakdown,
    days,
  };
}

export async function planTrip(input: TripInput): Promise<PlannerOutput> {
  const destinations = resolveDestinations(input);
  const candidates = (
    await Promise.all(destinations.slice(0, 5).map((d) => buildCandidate(input, d)))
  ).filter((c): c is Candidate => c != null);

  if (candidates.length === 0) {
    throw new Error('planner: no viable destination candidates (no hotels matched)');
  }

  const personas: OptionType[] = ['best', 'cheapest', 'comfort'];
  const winners = personas.map((p) => ({
    persona: p,
    candidate: selectPersonaWinner(candidates, p, input.budget_inr) ?? candidates[0]!,
  }));
  const options = await Promise.all(winners.map((w) => assembleOption(input, w.candidate, w.persona)));

  return PlannerOutputSchema.parse({ options });
}
