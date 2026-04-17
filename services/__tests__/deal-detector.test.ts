import { describe, expect, it } from 'vitest';

import { detectDeals } from '@/services/deal-detector';
import type { PriceHistory } from '@/domain/price-history';

function row(price: number, i: number): PriceHistory {
  return {
    id: `id-${i}`,
    entity_type: 'flight_route',
    entity_key: 'DEL-GOI',
    supplier: 'amadeus',
    price_inr: price,
    baseline_inr: price,
    anomaly_score: 0,
    recorded_at: new Date(Date.now() - (100 - i) * 86_400_000).toISOString(),
  };
}

describe('detectDeals', () => {
  it('flags a clear price drop', () => {
    const samples = [
      ...Array.from({ length: 10 }, (_, i) => row(5500 + i * 20, i)),
      row(3200, 11),
    ];
    const deals = detectDeals(samples, { stddevK: 1.5 });
    expect(deals).toHaveLength(1);
    expect(deals[0]?.savings_pct).toBeGreaterThan(20);
  });

  it('ignores series that is too short', () => {
    const samples = Array.from({ length: 3 }, (_, i) => row(4000, i));
    expect(detectDeals(samples)).toEqual([]);
  });

  it('does not flag normal fluctuations', () => {
    const samples = Array.from({ length: 20 }, (_, i) =>
      row(5500 + Math.sin(i) * 80, i),
    );
    expect(detectDeals(samples, { stddevK: 2 })).toEqual([]);
  });
});
