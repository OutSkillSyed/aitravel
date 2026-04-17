import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; icon?: typeof Sparkles };

const nav: NavItem[] = [
  { href: '/plan', label: 'Plan a trip' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/transport', label: 'Transport' },
  { href: '/surprise-me', label: 'Surprise Me', icon: Sparkles },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Compass className="h-6 w-6 text-primary" />
          aitravel
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
        <Link
          href="/plan"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Start planning
        </Link>
      </div>
    </header>
  );
}
