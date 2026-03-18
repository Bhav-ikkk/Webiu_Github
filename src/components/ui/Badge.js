'use client';

import { cn } from '@/lib/utils';
import { BookOpen, Zap, Flame } from 'lucide-react';

const variants = {
  default: 'bg-[var(--muted)] text-[var(--foreground)] ring-1 ring-[var(--border)]',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-red-500/20',
  beginner: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20',
  advanced: 'bg-red-500/10 text-red-700 dark:text-red-400 ring-1 ring-red-500/20',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 ring-1 ring-purple-500/20',
};

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ level }) {
  const config = {
    Beginner: {
      variant: 'beginner',
      icon: BookOpen,
    },
    Intermediate: {
      variant: 'intermediate',
      icon: Zap,
    },
    Advanced: {
      variant: 'advanced',
      icon: Flame,
    },
  };

  const { variant, icon: Icon } = config[level] || config.Beginner;

  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {level}
    </Badge>
  );
}
