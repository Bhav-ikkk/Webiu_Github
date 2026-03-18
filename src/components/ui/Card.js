'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef(function Card({ className, variant = 'default', hover = true, children, ...props }, ref) {
  const variants = {
    default: 'glass-card',
    solid: 'bg-[var(--card)] border border-[var(--border)]',
    gradient: 'glass-card bg-gradient-to-br from-[var(--card)] to-transparent',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-b border-[var(--border)]/50', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('font-semibold tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-[var(--muted-foreground)] mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-t border-[var(--border)]/50 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}
