'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, ...props }, ref) => {
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
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            `w-full px-3 py-2 rounded-lg
            bg-surface-secondary text-content
            border border-border
            placeholder:text-content-muted
            transition-all duration-150
            resize-none
            focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed`,
            error && 'border-accent-red focus:border-accent-red focus:ring-accent-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
