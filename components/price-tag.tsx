import { cn, formatInr } from '@/lib/utils';

export function PriceTag({
  amount,
  strikethrough,
  size = 'md',
  className,
}: {
  amount: number;
  strikethrough?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      {strikethrough && strikethrough > amount ? (
        <span className="text-xs text-ink-muted line-through">{formatInr(strikethrough)}</span>
      ) : null}
      <span className={cn('font-display font-semibold text-ink-dark', sizeClass)}>
        {formatInr(amount)}
      </span>
    </span>
  );
}
