import Link from 'next/link';
import { Suspense } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/price-tag';
import { Rating } from '@/components/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { getRepos } from '@/repositories';

type Props = { searchParams: Promise<{ city?: string }> };

export const metadata = { title: 'Hotels' };

async function HotelGrid({ city }: { city: string | undefined }) {
  const hotels = await getRepos().hotels.search({ city: city ?? 'Goa' });
  if (hotels.length === 0) {
    return (
      <p className="text-ink-muted">
        No hotels in our mock inventory for &quot;{city}&quot;. Try Goa, Jaipur, Udaipur, Manali, Kochi, or Pondicherry.
      </p>
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {hotels.map((h) => (
        <Link key={h.id} href={`/hotels/${h.id}` as never}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{h.name}</CardTitle>
              <CardDescription>{h.city} · {h.star_rating}★</CardDescription>
            </CardHeader>
            <Rating value={h.hotel_json.rating ?? h.star_rating} reviews={h.hotel_json.review_count} />
            <div className="mt-4 flex items-baseline justify-between">
              <PriceTag amount={h.hotel_json.price_per_night_inr} />
              <span className="text-xs text-ink-muted">per night</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function HotelsPage({ searchParams }: Props) {
  const { city } = await searchParams;
  return (
    <div className="container-app py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl">Hotels</h1>
          <p className="mt-1 text-ink-muted">{city ? `Showing stays in ${city}.` : 'Start by picking a city.'}</p>
        </div>
        <form className="flex gap-2">
          <input
            name="city"
            defaultValue={city ?? ''}
            placeholder="Search city (e.g. Goa)"
            className="h-11 rounded-full border border-border bg-surface px-4 text-sm focus-visible:border-primary focus-visible:outline-none"
          />
          <button className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Search
          </button>
        </form>
      </header>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <HotelGrid city={city} />
      </Suspense>
    </div>
  );
}
