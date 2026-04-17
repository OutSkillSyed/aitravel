import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How aitravel handles your data during the demo phase.',
};

export default function PrivacyPage() {
  return (
    <article className="container-app mx-auto max-w-3xl py-16">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-wide text-ink-muted">Legal</p>
        <h1 className="mt-2 text-3xl md:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-ink-muted">
          A short, plain-English summary of what we collect and why.
        </p>
      </header>

      <section className="space-y-4 text-ink [&_h2]:mt-6 [&_p]:leading-relaxed">
        <h2 className="font-display text-xl">What we store right now</h2>
        <ul className="list-disc pl-6">
          <li>Your email, only when you sign in — used solely to identify your session.</li>
          <li>The trips you create, cached in your browser (sessionStorage) until you close the tab.</li>
          <li>Anonymous logs of API calls used for debugging.</li>
        </ul>

        <h2 className="font-display text-xl">What we will store later</h2>
        <p>
          When Supabase-backed persistence lands, trips, saved hotels, alerts, and bookings will be
          stored in Supabase Postgres with row-level security scoped to your user id. We will
          update this page with the full policy before that rollout.
        </p>

        <h2 className="font-display text-xl">Third parties</h2>
        <p>
          We call external suppliers (e.g. Amadeus for flight prices, Google Places for nearby
          info) from our backend. Your IP is never forwarded to those suppliers; requests are made
          server-side. Gemini is used to narrate day plans — the inputs we send never include PII.
        </p>
      </section>

      <footer className="mt-10 text-sm text-ink-muted">
        See also the{' '}
        <Link href={'/legal/terms' as never} className="underline hover:text-ink">
          Terms of Service
        </Link>
        .
      </footer>
    </article>
  );
}
