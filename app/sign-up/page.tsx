import Link from 'next/link';
import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthHero } from '@/components/auth/auth-hero';
import { signUpWithEmail } from '@/app/sign-in/actions';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create an aitravel account to save itineraries and set price alerts.',
  robots: { index: false, follow: false },
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80';

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthHero
        image={HERO_IMAGE}
        eyebrow="Plan a trip in under 60 seconds"
        title="Start with a budget. Unlock the trip."
        subtitle="Three ranked itineraries — Best, Cheapest, Comfort — assembled from live supplier pricing."
      />

      <section className="relative flex min-h-screen flex-col justify-center bg-surface px-6 py-10 sm:px-10 lg:px-16">
        <nav className="absolute right-6 top-6 flex items-center gap-3 text-sm sm:right-10">
          <Link href="/plan" className="text-ink-muted transition-colors hover:text-ink">
            Discover
          </Link>
          <Link href="/profile" className="text-ink-muted transition-colors hover:text-ink">
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center rounded-full border border-border px-4 font-semibold text-ink"
          >
            Sign in
          </Link>
        </nav>

        <AuthForm mode="sign-up" action={signUpWithEmail} />
      </section>
    </div>
  );
}
