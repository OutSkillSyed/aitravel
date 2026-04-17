import { describe, expect, it } from 'vitest';

import { allocateBreakdown, scoreOption } from '@/services/scorer';

const base = {
  totalCostInr: 40_000,
  budgetInr: 50_000,
  avgHotelRating: 4,
  transportStops: 0,
  transportHours: 2,
};

describe('scoreOption', () => {
  it('cheapest rewards unused budget', () => {
    const low = scoreOption('cheapest', { ...base, totalCostInr: 10_000 });
    const high = scoreOption('cheapest', { ...base, totalCostInr: 48_000 });
    expect(low).toBeGreaterThan(high);
  });

  it('comfort rewards higher rating', () => {
    const low = scoreOption('comfort', { ...base, avgHotelRating: 2 });
    const high = scoreOption('comfort', { ...base, avgHotelRating: 5 });
    expect(high).toBeGreaterThan(low);
  });

  it('comfort penalises over-budget', () => {
    const under = scoreOption('comfort', base);
    const over = scoreOption('comfort', { ...base, totalCostInr: 70_000 });
    expect(under).toBeGreaterThan(over);
  });

  it('best punishes many stops', () => {
    const direct = scoreOption('best', base);
    const many = scoreOption('best', { ...base, transportStops: 3 });
    expect(direct).toBeGreaterThan(many);
  });
});

describe('allocateBreakdown', () => {
  it('sums to approximately the total', () => {
    const b = allocateBreakdown(100_000, 'adventure');
    const sum = b.transport + b.hotels + b.food + b.activities;
    expect(sum).toBeGreaterThan(99_000);
    expect(sum).toBeLessThanOrEqual(100_000);
  });
});
