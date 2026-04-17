import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/price-tag';
import { getRepos } from '@/repositories';

type Props = { searchParams: Promise<{ hotel?: string }> };

export const metadata = { title: 'Review & checkout' };

export default async function CheckoutPage({ searchParams }: Props) {
  const { hotel: hotelId } = await searchParams;
  const hotel = hotelId ? await getRepos().hotels.findById(hotelId) : null;

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl md:text-4xl">Review & checkout</h1>
      <p className="mt-2 text-ink-muted">
        Booking orchestrator state machine — stubbed. Wire Razorpay in Phase 3.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your selection</CardTitle>
            <CardDescription>Verify details before we lock pricing with the supplier.</CardDescription>
          </CardHeader>
          {hotel ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-xl">{hotel.name}</div>
                <div className="text-sm text-ink-muted">{hotel.city} · {hotel.star_rating}★ · {hotel.supplier}</div>
              </div>
              <PriceTag amount={hotel.hotel_json.price_per_night_inr} />
            </div>
          ) : (
            <p className="text-ink-muted">
              No hotel selected.{' '}
              <Link href="/hotels" className="text-primary underline">Pick one from the catalogue</Link>.
            </p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Demo mode — no payment gateway attached.</CardDescription>
          </CardHeader>
          <Button disabled size="lg">Pay securely (coming soon)</Button>
          <p className="mt-3 text-xs text-ink-muted">
            Razorpay and Stripe are wired as env vars. Connect in Phase 3 before enabling this.
          </p>
        </Card>
      </div>
    </div>
  );
}
