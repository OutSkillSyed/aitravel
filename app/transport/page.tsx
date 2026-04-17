import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceTag } from '@/components/price-tag';
import { adapters } from '@/adapters';
import { formatInr } from '@/lib/utils';

type Props = { searchParams: Promise<{ origin?: string; destination?: string; date?: string; mode?: string }> };

export const metadata = { title: 'Transport search' };

function defaultDate() {
  return new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10);
}

export default async function TransportPage({ searchParams }: Props) {
  const sp = await searchParams;
  const origin = (sp.origin ?? 'DEL').toUpperCase();
  const destination = (sp.destination ?? 'GOI').toUpperCase();
  const departDate = sp.date ?? defaultDate();

  const query = { origin, destination, departDate, pax: 1 };
  const [flights, trains, buses] = await Promise.all([
    adapters.flights.search(query),
    adapters.trains.search(query),
    adapters.buses.search(query),
  ]);

  return (
    <div className="container-app py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl">Transport search</h1>
          <p className="mt-1 text-ink-muted">{origin} → {destination} on {departDate}</p>
        </div>
        <form className="flex flex-wrap items-center gap-2 text-sm">
          <input name="origin" defaultValue={origin} className="h-11 w-20 rounded-full border border-border px-3 uppercase" />
          <input name="destination" defaultValue={destination} className="h-11 w-20 rounded-full border border-border px-3 uppercase" />
          <input name="date" defaultValue={departDate} type="date" className="h-11 rounded-full border border-border px-3" />
          <button className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground">Search</button>
        </form>
      </header>

      <Section title="Flights" emptyMessage={!serverConfigured('AMADEUS_API_KEY')
        ? 'Amadeus credentials not set — configure AMADEUS_API_KEY to fetch live flights.'
        : 'No flights matched — try a different date.'} items={flights.map((f) => ({
          key: f.id,
          title: `${f.origin} → ${f.destination}`,
          sub: `${f.airline ?? ''} · ${f.cabinClass} · ${Math.round(f.durationMinutes / 60)}h ${f.durationMinutes % 60}m · ${f.stops} stop(s)`,
          price: f.price_inr,
          pricePerHour: f.pricePerHour_inr,
          badge: 'Flight',
        }))} />

      <Section title="Trains (RailYatri mock)" items={trains.map((t) => ({
        key: t.id,
        title: `${t.trainNumber} ${t.origin} → ${t.destination}`,
        sub: `${t.classCode} · ${Math.round(t.durationMinutes / 60)}h ${t.durationMinutes % 60}m`,
        price: t.price_inr,
        pricePerHour: t.pricePerHour_inr,
        badge: 'Train',
      }))} />

      <Section title="Buses (RedBus mock)" items={buses.map((b) => ({
        key: b.id,
        title: `${b.operator} · ${b.origin} → ${b.destination}`,
        sub: `${b.busType} · ${Math.round(b.durationMinutes / 60)}h ${b.durationMinutes % 60}m`,
        price: b.price_inr,
        pricePerHour: b.pricePerHour_inr,
        badge: 'Bus',
      }))} />
    </div>
  );
}

function Section({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: { key: string; title: string; sub: string; price: number; pricePerHour: number; badge: string }[];
  emptyMessage?: string;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyMessage ?? 'No results.'}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <Card key={i.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{i.badge}</Badge>
                  <span className="text-xs text-ink-muted">{formatInr(i.pricePerHour)}/hr</span>
                </div>
                <CardTitle>{i.title}</CardTitle>
                <CardDescription>{i.sub}</CardDescription>
              </CardHeader>
              <PriceTag amount={i.price} />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function serverConfigured(key: string): boolean {
  return Boolean(process.env[key]);
}
