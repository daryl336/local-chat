'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-content-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              `w-full h-10 px-3 rounded-lg
              bg-surface-secondary text-content
              border border-border
              placeholder:text-content-muted
              transition-all duration-150
              focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed`,
              icon && 'pl-10',
              error && 'border-accent-red focus:border-accent-red focus:ring-accent-red',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
