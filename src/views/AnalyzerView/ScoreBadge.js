'use client';

import { cn } from '@/lib/utils';

export default function ScoreBadge({ score, label }) {
  const color =
    score < 35
      ? 'text-emerald-600 dark:text-emerald-400'
      : score <= 65
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <span className={cn('font-semibold tabular-nums', color)}>
      {score}
      {label && <span className="text-[var(--muted-foreground)] font-normal">/100</span>}
    </span>
  );
}
