'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DayPlanList } from '@/components/day-plan-list';
import { OptionCard } from '@/components/option-card';
import { formatInr } from '@/lib/utils';
import type { OptionType, Trip } from '@/domain/trip';

export const TRIP_STORAGE_PREFIX = 'aitravel:trip:';

type Status = 'loading' | 'found' | 'missing';

async function fetchTripFallback(id: string): Promise<Trip | null> {
  try {
    const res = await fetch(`/api/trips/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { trip: Trip };
    return data.trip ?? null;
  } catch {
    return null;
  }
}

function readFromStorage(id: string): Trip | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(`${TRIP_STORAGE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Trip;
  } catch {
    return null;
  }
}

export function PlanResultClient({
  id,
  defaultOption,
}: {
  id: string;
  defaultOption?: string;
}) {
  const [status, setStatus] = useState<Status>('loading');
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readFromStorage(id);
    if (cached) {
      setTrip(cached);
      setStatus('found');
      return;
    }
    fetchTripFallback(id).then((fallback) => {
      if (cancelled) return;
      if (fallback) {
        setTrip(fallback);
        setStatus('found');
      } else {
        setStatus('missing');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') return <LoadingState />;
  if (status === 'missing' || !trip) return <MissingTrip id={id} />;

  const options = trip.itinerary_json?.options ?? [];
  const activeType = (defaultOption as OptionType | undefined) ?? 'best';

  return (
    <div className="container-app py-10">
      <header className="mb-8">
        <Badge variant="primary">Trip</Badge>
        <h1 className="mt-2 text-3xl md:text-4xl">
          {trip.origin} · {trip.days} days · {formatInr(trip.budget_inr)}
        </h1>
        <p className="mt-1 text-ink-muted">
          {trip.traveller_count} traveller(s) · {trip.trip_style ?? 'any vibe'} · status{' '}
          <span className="font-medium text-ink">{trip.status}</span>
        </p>
      </header>

      {options.length === 0 ? (
        <Card>
          We couldn&apos;t build options for this trip. Try adjusting the budget or dates.
        </Card>
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
                <TabsTrigger key={o.type} value={o.type}>
                  {labelFor(o.type)}
                </TabsTrigger>
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

function LoadingState() {
  return (
    <div className="container-app py-10">
      <Skeleton className="mb-4 h-6 w-24" />
      <Skeleton className="mb-2 h-10 w-96" />
      <Skeleton className="mb-10 h-5 w-64" />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

function MissingTrip({ id }: { id: string }) {
  return (
    <div className="container-app py-16">
      <Card className="mx-auto flex max-w-xl flex-col items-start gap-4">
        <Badge variant="outline" className="gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> Trip not in this session
        </Badge>
        <h1 className="font-display text-2xl">We can&apos;t open this trip here</h1>
        <p className="text-sm text-ink-muted">
          Trips are held locally until Supabase persistence lands (Phase 5). This link
          (<code className="font-mono text-xs">{id.slice(0, 8)}…</code>) was created in a
          different browser session or on a different device, so we can&apos;t recover it.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/plan">
              <RefreshCw className="mr-1.5 h-4 w-4" /> Plan a fresh trip
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function labelFor(t: OptionType) {
  return t === 'best' ? 'Best' : t === 'cheapest' ? 'Cheapest' : 'Comfort';
}
