'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProgressBar({ value, max = 100, className, colorClass, showValue, size = 'md' }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  const getGradient = () => {
    if (pct < 35) return 'from-emerald-500 to-green-400';
    if (pct <= 65) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-rose-400';
  };

  const getGlow = () => {
    if (pct < 35) return 'shadow-emerald-500/30';
    if (pct <= 65) return 'shadow-amber-500/30';
    return 'shadow-red-500/30';
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden',
          heights[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r shadow-lg',
            colorClass || getGradient(),
            getGlow()
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      {showValue && (
        <motion.span
          className="absolute -top-6 text-xs font-medium text-zinc-600 dark:text-zinc-400 tabular-nums"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(value)}
        </motion.span>
      )}
    </div>
  );
}
