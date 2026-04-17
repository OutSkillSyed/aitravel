import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-alt text-ink',
        primary: 'border-primary bg-primary/10 text-primary',
        secondary: 'border-secondary bg-secondary/10 text-secondary',
        success: 'border-success bg-success/10 text-success',
        outline: 'border-border bg-transparent text-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
