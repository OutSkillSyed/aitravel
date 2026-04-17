import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-5xl">Route not found</h1>
      <p className="text-ink-muted">We couldn&apos;t find that page. Let&apos;s get you back to planning.</p>
      <Link href="/" className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
        Go home
      </Link>
    </div>
  );
}
