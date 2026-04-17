import Link from 'next/link';
import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthHero } from '@/components/auth/auth-hero';
import { signInWithEmail } from './actions';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to aitravel to sync your saved itineraries.',
  robots: { index: false, follow: false },
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=80';

export default function SignInPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthHero
        image={HERO_IMAGE}
        eyebrow="Trusted by budget travellers across India"
        title="Your World, Unlocked."
        subtitle="Join thousands of travellers automating their itineraries safely with aitravel AI."
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
            aria-current="page"
            className="inline-flex h-10 items-center rounded-full bg-ink-dark px-4 font-semibold text-white"
          >
            Sign in
          </Link>
        </nav>

        <AuthForm mode="sign-in" action={signInWithEmail} />
      </section>
    </div>
  );
}
