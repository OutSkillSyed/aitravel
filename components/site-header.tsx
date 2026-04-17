import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getDemoSession } from '@/lib/auth/session';
import { BrandMark } from '@/components/auth/brand-mark';

type NavItem = { href: string; label: string; icon?: typeof Sparkles };

const nav: NavItem[] = [
  { href: '/plan', label: 'Plan a trip' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/transport', label: 'Transport' },
  { href: '/surprise-me', label: 'Surprise Me', icon: Sparkles },
];

export async function SiteHeader() {
  const session = await getDemoSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <BrandMark size="sm" />
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href as never}
              className={cn(
                'inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-ink',
              )}
            >
              {n.icon ? <n.icon className="h-4 w-4" /> : null}
              {n.label}
            </Link>
          ))}
        </nav>

        {session ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted hover:text-ink md:inline-flex"
              title={session.email}
            >
              {session.email.split('@')[0]}
            </Link>
            <Link
              href="/sign-out"
              className="rounded-full bg-ink-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Sign out
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:border-ink md:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Start planning
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
