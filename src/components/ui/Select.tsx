'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@/components/icons';

/**
 * Select component matching OpenAI Platform design
 */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[14px] font-medium text-[#0d0d0d]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              // Base styles
              'h-10 w-full px-3 pr-10',
              'rounded-[8px]',
              'border bg-white',
              'text-[14px] text-[#0d0d0d]',
              'appearance-none',
              'cursor-pointer',
              'transition-colors duration-150',
              
              // Focus state
              'focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d]',
              
              // Error state
              error 
                ? 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]' 
                : 'border-[#ededed] hover:border-[#d5d5d5]',
              
              // Disabled
              'disabled:bg-[#f5f5f5] disabled:text-[#8f8f8f] disabled:cursor-not-allowed',
              
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDownIcon 
            size={16} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5d5d5d] pointer-events-none" 
          />
        </div>
        {(error || hint) && (
          <span className={cn(
            'text-[12px]',
            error ? 'text-[#ef4444]' : 'text-[#8f8f8f]'
          )}>
            {error || hint}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
