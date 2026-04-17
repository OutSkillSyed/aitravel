/**
 * RedBus adapter — mocked. Structured to match the contract so the real client
 * can be dropped in later without UI churn.
 */

import type { CanonicalBus, TransportSearchQuery } from '@/domain/transport';

import type { BusAdapter } from './types';

const SAMPLES = [
  { operator: 'VRL Travels', busType: 'AC Sleeper', origin: 'BLR', dest: 'GOI', mins: 14 * 60, inr: 1400 },
  { operator: 'Orange Tours', busType: 'AC Semi-Sleeper', origin: 'BLR', dest: 'GOI', mins: 15 * 60, inr: 1100 },
  { operator: 'IntrCity', busType: 'AC Seater', origin: 'DEL', dest: 'JAI', mins: 5 * 60 + 30, inr: 650 },
  { operator: 'RedBus Express', busType: 'NON-AC Seater', origin: 'DEL', dest: 'JAI', mins: 6 * 60, inr: 520 },
  { operator: 'HRTC', busType: 'Volvo AC', origin: 'DEL', dest: 'MAN', mins: 14 * 60, inr: 1600 },
];

export const redbusAdapter: BusAdapter = {
  async search(query: TransportSearchQuery): Promise<CanonicalBus[]> {
    const matches = SAMPLES.filter(
      (s) =>
        s.origin === query.origin.toUpperCase() && s.dest === query.destination.toUpperCase(),
    );
    return matches.map((s, idx) => {
      const depart = new Date(
        `${query.departDate}T${String(18 + idx).padStart(2, '0')}:00:00+05:30`,
      ).toISOString();
      const arrive = new Date(new Date(depart).getTime() + s.mins * 60_000).toISOString();
      return {
        source: 'redbus-mock',
        mode: 'bus',
        id: `RB-${idx}-${query.departDate}`,
        origin: s.origin,
        destination: s.dest,
        departureAt: depart,
        arrivalAt: arrive,
        durationMinutes: s.mins,
        price_inr: s.inr,
        pricePerHour_inr: Math.round(s.inr / (s.mins / 60)),
        cancellable: true,
        operator: s.operator,
        busType: s.busType,
        seatsAvailable: 28 - idx * 4,
        raw: s,
      };
    });
  },
};
