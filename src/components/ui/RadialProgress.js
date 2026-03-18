'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function RadialProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  className,
  color,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (percentage < 35) return '#22c55e';
    if (percentage <= 65) return '#f59e0b';
    return '#ef4444';
  };

  const getGlow = () => {
    if (percentage < 35) return '0 0 20px rgba(34, 197, 94, 0.4)';
    if (percentage <= 65) return '0 0 20px rgba(245, 158, 11, 0.4)';
    return '0 0 20px rgba(239, 68, 68, 0.4)';
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{
            filter: `drop-shadow(${getGlow()})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {Math.round(value)}
        </motion.span>
        {sublabel && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{sublabel}</span>
        )}
      </div>
      {label && (
        <span className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
      )}
    </div>
  );
}
