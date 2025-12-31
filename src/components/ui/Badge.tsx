'use client';

import { cn } from '@/lib/utils/cn';
import { AgentCategory, CATEGORY_COLORS } from '@/types/agent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'category';
  category?: AgentCategory;
  className?: string;
}

export function Badge({ children, variant = 'default', category, className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium';

  if (variant === 'category' && category) {
    const colors = CATEGORY_COLORS[category];
    return (
      <span className={cn(baseStyles, colors.bg, colors.text, colors.border, 'border', className)}>
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        baseStyles,
        'bg-surface-tertiary text-content-secondary',
        className
      )}
    >
      {children}
    </span>
  );
}
