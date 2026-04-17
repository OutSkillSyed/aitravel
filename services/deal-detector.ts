/**
 * Surprise Me deal detector. Runs over price_history to identify routes and
 * hotels where the most recent price is anomalously cheap relative to the
 * rolling baseline (EWMA + stddev). Returns ranked deal candidates.
 */

import type { PriceHistory } from '@/domain/price-history';

export interface DealCandidate {
  entity_type: PriceHistory['entity_type'];
  entity_key: string;
  current_price_inr: number;
  baseline_inr: number;
  anomaly_score: number; // stddevs below baseline
  savings_pct: number;
  sample_count: number;
}

interface Baseline {
  ewma: number;
  stddev: number;
}

function computeBaseline(prices: number[], alpha = 0.2): Baseline | null {
  if (prices.length < 5) return null;
  const weights = prices.map((_, i, arr) => (1 - alpha) ** (arr.length - 1 - i));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const ewma = prices.reduce((a, p, i) => a + (p * weights[i]!) / wsum, 0);
  const mean = prices.reduce((a, p) => a + p, 0) / prices.length;
  const variance = prices.reduce((a, p) => a + (p - mean) ** 2, 0) / (prices.length - 1);
  return { ewma, stddev: Math.sqrt(variance) };
}

export function detectDeals(
  history: PriceHistory[],
  opts: { minSamples?: number; stddevK?: number } = {},
): DealCandidate[] {
  const minSamples = opts.minSamples ?? 5;
  const stddevK = opts.stddevK ?? 2;

  // Group by entity
  const groups = new Map<string, PriceHistory[]>();
  for (const row of history) {
    const key = `${row.entity_type}:${row.entity_key}`;
    const arr = groups.get(key) ?? [];
    arr.push(row);
    groups.set(key, arr);
  }

  const deals: DealCandidate[] = [];
  for (const [, rows] of groups) {
    if (rows.length < minSamples) continue;
    const sorted = rows.slice().sort((a, b) => (a.recorded_at > b.recorded_at ? 1 : -1));
    const prices = sorted.map((r) => r.price_inr);
    const baseline = computeBaseline(prices);
    if (!baseline) continue;
    const latest = sorted[sorted.length - 1]!;
    const z = baseline.stddev === 0 ? 0 : (latest.price_inr - baseline.ewma) / baseline.stddev;
    const isDeal =
      baseline.stddev === 0
        ? latest.price_inr < baseline.ewma * 0.9
        : z <= -stddevK;
    if (!isDeal) continue;
    deals.push({
      entity_type: latest.entity_type,
      entity_key: latest.entity_key,
      current_price_inr: latest.price_inr,
      baseline_inr: Math.round(baseline.ewma),
      anomaly_score: Number(z.toFixed(2)),
      savings_pct: Math.round((1 - latest.price_inr / baseline.ewma) * 100),
      sample_count: sorted.length,
    });
  }
  deals.sort((a, b) => a.anomaly_score - b.anomaly_score);
  return deals;
}
