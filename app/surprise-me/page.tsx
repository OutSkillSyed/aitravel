import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/price-tag';
import { getRepos } from '@/repositories';
import { detectDeals } from '@/services/deal-detector';

export const metadata = { title: 'Surprise Me · hidden deals' };

export default async function SurpriseMePage() {
  const samples = await getRepos().priceHistory.seriesFor('flight_route', 'DEL-GOI');
  const deals = detectDeals(samples, { stddevK: 1.5 });

  return (
    <div className="container-app py-12">
      <header className="mb-8 max-w-2xl">
        <Badge variant="primary" className="mb-3">Surprise Me</Badge>
        <h1 className="text-3xl md:text-4xl">Hidden deals and anomaly drops</h1>
        <p className="mt-2 text-ink-muted">
          We watch pricing on popular routes and flag moments where live prices dip well below the
          rolling baseline. Mock history today — swap in the live poller post-handoff.
        </p>
      </header>

      {deals.length === 0 ? (
        <Card>No anomalies yet. Check back soon.</Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <Card key={`${d.entity_type}-${d.entity_key}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="success">-{d.savings_pct}%</Badge>
                  <CardTitle>{d.entity_key}</CardTitle>
                </div>
                <CardDescription>Deviation: {d.anomaly_score}σ · {d.sample_count} samples</CardDescription>
              </CardHeader>
              <div className="flex items-baseline justify-between">
                <PriceTag amount={d.current_price_inr} strikethrough={d.baseline_inr} size="lg" />
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                Baseline ₹{d.baseline_inr.toLocaleString('en-IN')} (EWMA). Signal strength improves with more samples.
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
