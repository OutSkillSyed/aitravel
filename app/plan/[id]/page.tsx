import { notFound } from 'next/navigation';

import { OptionCard } from '@/components/option-card';
import { DayPlanList } from '@/components/day-plan-list';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRepos } from '@/repositories';
import { formatInr } from '@/lib/utils';
import type { OptionType } from '@/domain/trip';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ option?: string }>;
};

export default async function PlanResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { option } = await searchParams;
  const trip = await getRepos().trips.findById(id);
  if (!trip) notFound();
  const options = trip.itinerary_json?.options ?? [];
  const activeType = (option as OptionType | undefined) ?? 'best';

  return (
    <div className="container-app py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="primary">Trip</Badge>
          <h1 className="mt-2 text-3xl md:text-4xl">
            {trip.origin} · {trip.days} days · {formatInr(trip.budget_inr)}
          </h1>
          <p className="mt-1 text-ink-muted">
            {trip.traveller_count} traveller(s) · {trip.trip_style ?? 'any vibe'} · status{' '}
            <span className="font-medium text-ink">{trip.status}</span>
          </p>
        </div>
      </div>

      {options.length === 0 ? (
        <Card>We couldn&apos;t build options for this trip. Try adjusting the budget or dates.</Card>
      ) : (
        <>
          <section className="mb-10 grid gap-6 md:grid-cols-3">
            {options.map((o) => (
              <OptionCard key={o.type} option={o} tripId={trip.id} />
            ))}
          </section>

          <Tabs defaultValue={activeType}>
            <TabsList>
              {options.map((o) => (
                <TabsTrigger key={o.type} value={o.type}>{labelFor(o.type)}</TabsTrigger>
              ))}
            </TabsList>
            {options.map((o) => (
              <TabsContent key={o.type} value={o.type}>
                <DayPlanList option={o} />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

function labelFor(t: OptionType) {
  return t === 'best' ? 'Best' : t === 'cheapest' ? 'Cheapest' : 'Comfort';
}
