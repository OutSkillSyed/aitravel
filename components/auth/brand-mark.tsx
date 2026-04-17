import { Plane } from 'lucide-react';

import { cn } from '@/lib/utils';

export function BrandMark({
  size = 'md',
  className,
  monochrome,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  monochrome?: boolean;
}) {
  const dims =
    size === 'lg'
      ? 'h-14 w-14 text-xl'
      : size === 'sm'
        ? 'h-8 w-8 text-sm'
        : 'h-11 w-11 text-base';
  const label = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-2xl shadow-card',
          dims,
          monochrome
            ? 'bg-white/15 text-white ring-1 ring-white/25 backdrop-blur'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <Plane
          className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}
          strokeWidth={2}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          label,
          monochrome ? 'text-white' : 'text-ink-dark',
        )}
      >
        aitravel
        <span className={cn('ml-0.5', monochrome ? 'text-white/70' : 'text-primary')}>AI</span>
      </span>
    </span>
  );
}
