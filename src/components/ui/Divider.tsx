'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Divider component matching OpenAI Platform design
 */

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn(
          'bg-[#ededed]',
          orientation === 'horizontal' 
            ? 'h-px w-full' 
            : 'w-px h-full',
          className
        )}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
