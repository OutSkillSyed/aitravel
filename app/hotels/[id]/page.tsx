import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { NearbyTabs } from '@/components/nearby-tabs';
import { Rating } from '@/components/rating';
import { PriceTag } from '@/components/price-tag';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getRepos } from '@/repositories';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getRepos().hotels.findById(id);
  if (!hotel) return { title: 'Hotel not found' };
  return {
    title: `${hotel.name} · ${hotel.city}`,
    description: hotel.hotel_json.description,
    openGraph: {
      title: hotel.name,
      description: hotel.hotel_json.description,
      images: hotel.hotel_json.photos,
    },
  };
}

export default async function HotelDetail({ params }: Props) {
  const { id } = await params;
  const repos = getRepos();
  const hotel = await repos.hotels.findById(id);
  if (!hotel) notFound();
  const nearby = await repos.nearby.list(hotel.id);
  const hero = hotel.hotel_json.photos[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    address: hotel.hotel_json.address,
    starRating: { '@type': 'Rating', ratingValue: hotel.star_rating },
    aggregateRating: hotel.hotel_json.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: hotel.hotel_json.rating,
          reviewCount: hotel.hotel_json.review_count,
        }
      : undefined,
    geo: { '@type': 'GeoCoordinates', latitude: hotel.lat, longitude: hotel.lng },
    priceRange: `₹${hotel.hotel_json.price_per_night_inr}`,
  };

  return (
    <article className="container-app py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {hero ? (
        <div className="relative mb-8 h-64 overflow-hidden rounded-2xl md:h-96">
          <Image
            src={hero}
            alt={hotel.name}
            fill
            sizes="(min-width: 768px) 80vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-surface">
            <Badge variant="primary" className="mb-2">{hotel.city}</Badge>
            <h1 className="font-display text-3xl md:text-5xl">{hotel.name}</h1>
          </div>
        </div>
      ) : (
        <h1 className="mb-6 text-3xl md:text-5xl">{hotel.name}</h1>
      )}

      <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
        <section>
          <div className="flex flex-wrap items-center gap-4">
            <Rating value={hotel.hotel_json.rating ?? hotel.star_rating} reviews={hotel.hotel_json.review_count} />
            <span className="text-sm text-ink-muted">{hotel.star_rating} star</span>
          </div>
          <p className="mt-4 text-ink">{hotel.hotel_json.description}</p>

          <h2 className="mt-8 font-display text-2xl">Amenities</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {hotel.hotel_json.amenities.map((a) => (
              <li key={a} className="rounded-full border border-border px-3 py-1">{a}</li>
            ))}
          </ul>

          <Separator className="my-8" />

          <h2 className="font-display text-2xl">Nearby places</h2>
          <p className="text-sm text-ink-muted">Google-sourced when credentials are configured; mock data otherwise.</p>
          <NearbyTabs places={nearby} />
        </section>

        <aside>
          <Card className="sticky top-24">
            <div className="text-sm text-ink-muted">From</div>
            <PriceTag amount={hotel.hotel_json.price_per_night_inr} size="lg" />
            <div className="text-xs text-ink-muted">per night, taxes extra</div>
            <a
              href={`/checkout?hotel=${hotel.id}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Continue to booking
            </a>
            <p className="mt-3 text-xs text-ink-muted">
              Supplier: <span className="font-medium text-ink">{hotel.supplier}</span>
            </p>
          </Card>
        </aside>
      </div>
    </article>
  );
}
