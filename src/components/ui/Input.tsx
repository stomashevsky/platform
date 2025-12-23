'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SendIcon } from '@/components/icons';

/**
 * Input component matching OpenAI Platform EXACTLY
 * 
 * Extracted from OpenAI (December 2024):
 * - Input: height 32px (inner), padding 0px 12px, fontSize 14px
 * - Container: height 40px, borderRadius 20px, padding 4px 32px 4px 12px
 * - letterSpacing: -0.14px (inner) / -0.16px (container)
 * - Placeholder color: #8f8f8f
 */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[14px] font-medium text-[#0d0d0d]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles
            'h-10 w-full px-3',
            'rounded-[8px]',
            'border bg-white',
            'text-[14px] text-[#0d0d0d]',
            'placeholder:text-[#8f8f8f]',
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

Input.displayName = 'Input';

export { Input };

/**
 * ChatInput - specialized input for chat interface
 */
export interface ChatInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: () => void;
  sendDisabled?: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSend, sendDisabled, ...props }, ref) => {
    return (
      <div className={cn(
        'relative flex items-end',
        'w-full max-w-3xl mx-auto',
        'rounded-[24px]',
        'border border-[#ededed]',
        'bg-white',
        'shadow-sm',
        'transition-colors duration-150',
        'focus-within:border-[#d5d5d5]',
        className
      )}>
        <textarea
          ref={ref}
          rows={1}
          className={cn(
            'flex-1',
            'px-4 py-3',
            'bg-transparent',
            'text-[14px] text-[#0d0d0d]',
            'placeholder:text-[#8f8f8f]',
            'resize-none',
            'focus:outline-none',
            'max-h-[200px]',
            // Hide scrollbar but keep functionality
            'scrollbar-none',
          )}
          {...props}
        />
        
        {/* Send button */}
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          className={cn(
            'flex-shrink-0',
            'w-8 h-8 m-2',
            'rounded-full',
            'flex items-center justify-center',
            'transition-colors duration-150',
            
            sendDisabled
              ? 'bg-[#f5f5f5] text-[#8f8f8f] cursor-not-allowed'
              : 'bg-[#181818] text-white hover:bg-[#0d0d0d]'
          )}
        >
          <SendIcon size={16} />
        </button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export { ChatInput };

/**
 * SearchInput - input with search icon
 */
export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8f8f]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'h-9 w-full',
            icon ? 'pl-9 pr-3' : 'px-3',
            'rounded-[8px]',
            'border border-[#ededed] bg-white',
            'text-[14px] text-[#0d0d0d]',
            'placeholder:text-[#8f8f8f]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#d5d5d5]',
            'hover:border-[#d5d5d5]',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
