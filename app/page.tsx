import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles, Wallet } from 'lucide-react';

import { BudgetForm } from '@/components/budget-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const destinations = [
  { city: 'Goa', tagline: 'Coastal cafes & sunset sails', price: 24_000 },
  { city: 'Jaipur', tagline: 'Pink palaces & rooftop nights', price: 18_500 },
  { city: 'Udaipur', tagline: 'Lake views at golden hour', price: 26_000 },
  { city: 'Manali', tagline: 'Snow, forest walks, hot cafes', price: 21_800 },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface-alt">
        <div className="container-app grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="flex flex-col gap-6">
            <Badge variant="primary" className="w-fit">
              Budget-first · Best / Cheapest / Comfort
            </Badge>
            <h1 className="text-4xl leading-tight text-ink-dark sm:text-5xl md:text-[56px]">
              Tell us your budget.
              <br />
              <span className="text-primary">We&apos;ll build the trip.</span>
            </h1>
            <p className="max-w-lg text-lg text-ink-muted">
              aitravel turns a number and a home city into a real, bookable itinerary — flights,
              trains, buses, hotels, nearby cafes and all. Ranked three ways, powered by live
              supplier pricing and an AI planner that never fakes a fare.
            </p>
            <div className="flex gap-3">
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Start planning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/surprise-me"
                className="inline-flex items-center gap-2 rounded-full border border-secondary px-6 py-3 text-base font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Sparkles className="h-4 w-4" /> Surprise me
              </Link>
            </div>
          </div>

          <Card className="self-center p-8">
            <div className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
              <Wallet className="h-4 w-4" /> Quick budget planner
            </div>
            <BudgetForm />
          </Card>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl">Where to, this month?</h2>
            <p className="text-ink-muted">Curated starter budgets for 4-night trips from most Indian metros.</p>
          </div>
          <Link href="/plan" className="hidden text-sm font-semibold text-primary hover:underline md:block">
            Start planning →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => (
            <Link key={d.city} href={`/hotels?city=${d.city}` as never}>
              <Card className="h-full transition-transform hover:-translate-y-0.5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg">{d.city}</CardTitle>
                  </div>
                  <CardDescription>{d.tagline}</CardDescription>
                </CardHeader>
                <div className="mt-2 text-sm text-ink-muted">From</div>
                <div className="font-display text-2xl text-ink-dark">
                  ₹{d.price.toLocaleString('en-IN')}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
