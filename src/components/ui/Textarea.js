'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef(function Textarea(
  { className, error, label, hint, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-md border bg-[var(--background)]',
          'px-3 py-2 text-sm',
          'placeholder:text-[var(--muted-foreground)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-1',
          'min-h-[120px] resize-y font-mono',
          error ? 'border-red-500' : 'border-[var(--border)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
});
