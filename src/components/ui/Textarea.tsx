'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea component matching OpenAI Platform design
 */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[14px] font-medium text-[#0d0d0d]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            // Base styles
            'w-full px-3 py-2',
            'rounded-[8px]',
            'border bg-white',
            'text-[14px] text-[#0d0d0d]',
            'placeholder:text-[#8f8f8f]',
            'resize-y min-h-[80px]',
            'transition-colors duration-150',
            
            // Focus state
            'focus:outline-none focus:ring-1 focus:ring-[#0d0d0d] focus:border-[#0d0d0d]',
            
            // Error state
            error 
              ? 'border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]' 
              : 'border-[#ededed] hover:border-[#d5d5d5]',
            
            // Disabled
            'disabled:bg-[#f5f5f5] disabled:text-[#8f8f8f] disabled:cursor-not-allowed disabled:resize-none',
            
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export { Textarea };
