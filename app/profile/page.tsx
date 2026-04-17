import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRepos } from '@/repositories';

export const metadata = { title: 'Your profile' };

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export default async function ProfilePage() {
  const repos = getRepos();
  const [user, travellers, trips, bookings] = await Promise.all([
    repos.users.findById(DEMO_USER_ID),
    repos.travellers.listByUser(DEMO_USER_ID),
    repos.trips.listByUser(DEMO_USER_ID),
    repos.bookings.listByUser(DEMO_USER_ID),
  ]);
  if (!user) return <div className="container-app py-12">No demo user seeded.</div>;

  return (
    <div className="container-app py-12">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl">{user.full_name}</h1>
        <p className="text-ink-muted">{user.email}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Travellers ({travellers.length})</CardTitle>
            <CardDescription>Linked travellers for quick booking.</CardDescription>
          </CardHeader>
          <ul className="space-y-1 text-sm">
            {travellers.map((t) => (
              <li key={t.id}>{t.first_name} {t.last_name} · {t.passport_country ?? 'no passport'}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved trips ({trips.length})</CardTitle>
            <CardDescription>Your planning runs — the latest on top.</CardDescription>
          </CardHeader>
          <ul className="space-y-2 text-sm">
            {trips.slice(0, 10).map((t) => (
              <li key={t.id} className="flex justify-between">
                <span>{t.origin} · {t.days}d · {t.status}</span>
                <span className="text-ink-muted">₹{t.budget_inr.toLocaleString('en-IN')}</span>
              </li>
            ))}
            {trips.length === 0 ? <li className="text-ink-muted">No trips yet.</li> : null}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings ({bookings.length})</CardTitle>
            <CardDescription>Confirmed and pending reservations.</CardDescription>
          </CardHeader>
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-muted">No bookings yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {bookings.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.booking_type} · {b.supplier_ref}</span>
                  <span>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
