'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';
import { GoogleButton } from './google-button';
import type { AuthResult } from '@/app/sign-in/actions';

type Mode = 'sign-in' | 'sign-up';

interface Props {
  mode: Mode;
  action: (_prev: AuthResult | null, form: FormData) => Promise<AuthResult>;
}

const COPY: Record<Mode, { eyebrow: string; title: string; subtitle: string; cta: string; google: string; altLink: { label: string; href: string; cta: string } }> = {
  'sign-in': {
    eyebrow: 'Welcome back',
    title: 'Welcome Back',
    subtitle: 'Sign in to sync your saved itineraries across all your devices.',
    cta: 'Continue with Email',
    google: 'Continue with Google',
    altLink: { label: "New to aitravel?", href: '/sign-up', cta: 'Create an account' },
  },
  'sign-up': {
    eyebrow: 'Start your trip',
    title: 'Create your account',
    subtitle: 'Save itineraries, set price alerts, and plan across devices.',
    cta: 'Create account',
    google: 'Sign up with Google',
    altLink: { label: 'Already have an account?', href: '/sign-in', cta: 'Sign in' },
  },
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-5 text-sm font-semibold text-primary-foreground shadow-card transition-all hover:shadow-card-hover disabled:opacity-70',
      )}
    >
      {pending ? 'Just a second…' : label}
      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
    </button>
  );
}

export function AuthForm({ mode, action }: Props) {
  const copy = COPY[mode];
  const [state, formAction] = useActionState<AuthResult | null, FormData>(action, null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark />
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink-dark">{copy.title}</h1>
          <p className="mt-2 text-sm text-ink-muted">{copy.subtitle}</p>
        </div>
      </div>

      <GoogleButton label={copy.google} />

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        {state && !state.ok ? (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
        ) : null}
        <SubmitButton label={copy.cta} />
      </form>

      <p className="text-center text-xs text-ink-muted">
        By continuing, you agree to our{' '}
        <a href="/legal/terms" className="underline hover:text-ink">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/legal/privacy" className="underline hover:text-ink">
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-center text-sm text-ink-muted">
        {copy.altLink.label}{' '}
        <Link href={copy.altLink.href as never} className="font-semibold text-primary hover:text-primary-dark">
          {copy.altLink.cta}
        </Link>
      </p>
    </div>
  );
}
