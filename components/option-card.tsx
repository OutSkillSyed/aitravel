import Link from 'next/link';
import { Trophy, Zap, BedDouble } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/price-tag';
import type { PlannedOption } from '@/domain/trip';

const meta = {
  best: { label: 'Best', icon: Trophy, blurb: 'Balanced value and experience' },
  cheapest: { label: 'Cheapest', icon: Zap, blurb: 'Lowest price first' },
  comfort: { label: 'Comfort', icon: BedDouble, blurb: 'Premium comfort, smoother pace' },
} as const;

export function OptionCard({ option, tripId }: { option: PlannedOption; tripId: string }) {
  const m = meta[option.type];
  const Icon = m.icon;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant={option.type === 'best' ? 'primary' : option.type === 'comfort' ? 'secondary' : 'outline'}>
            <Icon className="mr-1 h-3.5 w-3.5" />
            {m.label}
          </Badge>
          <span className="text-xs text-ink-muted">score {option.score.toFixed(2)}</span>
        </div>
        <CardTitle className="mt-1">{m.blurb}</CardTitle>
        <CardDescription>
          {option.days.length}-day plan starting in {option.days[0]?.location ?? 'your origin'}
        </CardDescription>
      </CardHeader>

      <div className="mt-2 space-y-3">
        <PriceTag amount={option.total_cost_inr} size="lg" />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Row label="Transport" value={option.breakdown.transport} />
          <Row label="Hotels" value={option.breakdown.hotels} />
          <Row label="Food" value={option.breakdown.food} />
          <Row label="Activities" value={option.breakdown.activities} />
        </dl>
      </div>

      <Link
        href={`/plan/${tripId}?option=${option.type}` as never}
        className="mt-auto inline-flex items-center justify-center rounded-full border border-secondary px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
      >
        See day-by-day →
      </Link>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium"><PriceTag amount={value} size="sm" /></dd>
    </>
  );
}
