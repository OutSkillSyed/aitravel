import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-alt">
      <div className="container-app grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg">aitravel</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Budget-first travel planning. We turn a number and a home city into a real itinerary —
            flights, trains, buses, hotels, nearby places, all ranked.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Plan</h4>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link href="/plan" className="hover:text-primary">Start planning</Link></li>
            <li><Link href="/surprise-me" className="hover:text-primary">Surprise Me deals</Link></li>
            <li><Link href="/transport" className="hover:text-primary">Search transport</Link></li>
            <li><Link href="/hotels" className="hover:text-primary">Search hotels</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">About</h4>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link href="/profile" className="hover:text-primary">Your profile</Link></li>
            <li>
              <a href="https://github.com/OutSkillSyed/aitravel" className="hover:text-primary">
                Source
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} aitravel. Built with mock data; not a booking system yet.
      </div>
    </footer>
  );
}
