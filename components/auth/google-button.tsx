'use client';

import { useState } from 'react';

type Props = { label: string };

const GOOGLE_LOGO =
  'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg';

export function GoogleButton({ label }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() =>
          setMessage(
            'Google sign-in arrives with Supabase Auth (Phase 5). Use email for now.',
          )
        }
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-white text-sm font-medium text-ink-dark shadow-sm transition-colors hover:border-primary/40 hover:bg-surface-alt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GOOGLE_LOGO} alt="" aria-hidden className="h-5 w-5" />
        {label}
      </button>
      {message ? (
        <p className="rounded-xl bg-surface-alt px-3 py-2 text-xs text-ink-muted">{message}</p>
      ) : null}
    </div>
  );
}
