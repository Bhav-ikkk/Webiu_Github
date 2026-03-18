'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  default: 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 shadow-sm',
  secondary: 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]',
  outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] hover:border-[var(--muted-foreground)]/30',
  ghost: 'hover:bg-[var(--muted)]',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  gradient: 'btn-gradient text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-sm gap-2 rounded-xl',
};

export const Button = forwardRef(function Button(
  { children, className, variant = 'default', size = 'md', loading = false, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
