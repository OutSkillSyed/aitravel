/**
 * RailYatri adapter — mocked until partner keys land. Returns realistic
 * CanonicalTrain records so the planner and UI can be exercised end-to-end.
 */

import type { CanonicalTrain, TransportSearchQuery } from '@/domain/transport';

import type { TrainAdapter } from './types';

const SAMPLES: Array<{ trainNumber: string; classCode: string; origin: string; dest: string; mins: number; inr: number }> = [
  { trainNumber: '12951', classCode: '3A', origin: 'DEL', dest: 'BOM', mins: 16 * 60, inr: 2800 },
  { trainNumber: '12009', classCode: 'CC', origin: 'DEL', dest: 'BOM', mins: 17 * 60, inr: 2200 },
  { trainNumber: '22439', classCode: '2A', origin: 'DEL', dest: 'JAI', mins: 4 * 60 + 30, inr: 1500 },
  { trainNumber: '12015', classCode: 'CC', origin: 'DEL', dest: 'JAI', mins: 4 * 60 + 45, inr: 1100 },
  { trainNumber: '16336', classCode: 'SL', origin: 'DEL', dest: 'COK', mins: 42 * 60, inr: 1800 },
  { trainNumber: '12618', classCode: '3A', origin: 'DEL', dest: 'ERS', mins: 45 * 60, inr: 2600 },
];

function addMinutes(iso: string, mins: number) {
  return new Date(new Date(iso).getTime() + mins * 60_000).toISOString();
}

function makeDepart(date: string, hour: number) {
  // Use +05:30 IST offset for realism.
  return new Date(`${date}T${String(hour).padStart(2, '0')}:15:00+05:30`).toISOString();
}

export const railyatriAdapter: TrainAdapter = {
  async search(query: TransportSearchQuery): Promise<CanonicalTrain[]> {
    const matches = SAMPLES.filter(
      (s) =>
        s.origin === query.origin.toUpperCase() && s.dest === query.destination.toUpperCase(),
    );
    return matches.map((s, idx) => {
      const depart = makeDepart(query.departDate, 6 + idx * 3);
      const arrive = addMinutes(depart, s.mins);
      return {
        source: 'railyatri-mock',
        mode: 'train',
        id: `RY-${s.trainNumber}-${query.departDate}`,
        origin: s.origin,
        destination: s.dest,
        departureAt: depart,
        arrivalAt: arrive,
        durationMinutes: s.mins,
        price_inr: s.inr,
        pricePerHour_inr: Math.round(s.inr / (s.mins / 60)),
        cancellable: true,
        trainNumber: s.trainNumber,
        classCode: s.classCode,
        seatsAvailable: 40 - idx * 8,
        raw: s,
      };
    });
  },
};
