'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge component matching OpenAI Platform design
 */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'font-medium rounded-full',
          
          // Sizes
          {
            'h-5 px-2 text-[11px]': size === 'sm',
            'h-6 px-2.5 text-[12px]': size === 'md',
          },
          
          // Variants
          {
            'bg-[#f5f5f5] text-[#5d5d5d]': variant === 'default',
            'bg-[#dcfce7] text-[#166534]': variant === 'success',
            'bg-[#fef3c7] text-[#92400e]': variant === 'warning',
            'bg-[#fee2e2] text-[#dc2626]': variant === 'error',
            'bg-[#dbeafe] text-[#1e40af]': variant === 'info',
          },
          
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
