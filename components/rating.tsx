import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({
  value,
  reviews,
  className,
}: {
  value: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Star className="h-4 w-4 fill-accent text-accent" />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {reviews !== undefined ? (
        <span className="text-ink-muted">({reviews.toLocaleString()})</span>
      ) : null}
    </span>
  );
}
