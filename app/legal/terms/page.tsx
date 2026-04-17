import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'aitravel terms of service — demo placeholder.',
};

export default function TermsPage() {
  return (
    <article className="container-app mx-auto max-w-3xl py-16">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-wide text-ink-muted">Legal</p>
        <h1 className="mt-2 text-3xl md:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-ink-muted">
          These terms will be finalised before the first paid booking. Until then, aitravel is a
          demo that assembles itineraries from mock inventory. Nothing on this site is a binding
          offer.
        </p>
      </header>

      <section className="space-y-4 text-ink [&_h2]:mt-6 [&_p]:leading-relaxed">
        <h2 className="font-display text-xl">1. Demo status</h2>
        <p>
          aitravel is under active development. The itineraries shown are for demonstration and may
          not reflect live availability or pricing until supplier integrations are live.
        </p>
        <h2 className="font-display text-xl">2. Your account</h2>
        <p>
          Sign-in is email-based in demo mode. Full account terms will be published when
          production auth (Supabase Auth) lands.
        </p>
        <h2 className="font-display text-xl">3. Changes</h2>
        <p>
          These terms will be revised once we onboard paying travellers. We will notify active
          users by email before any changes take effect.
        </p>
      </section>

      <footer className="mt-10 text-sm text-ink-muted">
        Questions? See the{' '}
        <Link href={'/legal/privacy' as never} className="underline hover:text-ink">
          Privacy Policy
        </Link>
        .
      </footer>
    </article>
  );
}
