'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button component matching OpenAI Platform EXACTLY
 * 
 * Extracted from OpenAI Platform (December 2024):
 * - Primary button: height 40px, borderRadius 9999px (pill)
 * - Font: 14px, weight 500, letterSpacing -0.14px, lineHeight 14px
 * - Background via ::before: #181818 (rgb(24, 24, 24))
 * - Transition: opacity 0.15s, color 0.15s
 * - Content: position relative, z-10
 * - Gap between icon and text: 6px (для Create button с иконкой Plus)
 * 
 * OpenAI использует ::before для фона, а не прямой background!
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          fontFamily: '"OpenAI Sans", helvetica, sans-serif',
          letterSpacing: '-0.14px',
          lineHeight: '14px',
        }}
        className={cn(
          // Base styles - OpenAI exact
          'relative inline-flex items-center justify-center',
          'font-medium border-0 cursor-pointer p-0',
          'focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // ::before для фона (как в OpenAI)
          'before:absolute before:inset-0 before:transition-colors',
          
          // Gap - OpenAI exact: 6px между иконкой и текстом
          'gap-[6px]',
          
          // Sizes - exact from OpenAI
          {
            // Small
            'h-8 px-3 text-[13px] before:rounded-[8px]': size === 'sm',
            // Medium: 40px height, pill shape - OpenAI exact
            'h-10 px-4 text-[14px] font-medium before:rounded-[9999px]': size === 'md',
            // Large
            'h-12 px-6 text-[14px] before:rounded-[9999px]': size === 'lg',
          },
          
          // Variants - используем ::before для фона
          {
            // Primary - OpenAI exact: ::before bg #181818, white text
            'bg-transparent text-white before:bg-[#181818] hover:before:bg-[#0d0d0d]': 
              variant === 'primary',
            
            // Secondary - white with border
            'bg-transparent text-[#0d0d0d] before:bg-white border border-[#ededed] hover:before:bg-[#f5f5f5]': 
              variant === 'secondary',
            
            // Ghost - transparent
            'bg-transparent text-[#5d5d5d] hover:text-[#0d0d0d] hover:before:bg-[#f5f5f5]': 
              variant === 'ghost',
            
            // Danger
            'bg-transparent text-white before:bg-[#ef4444] hover:before:bg-[#dc2626]': 
              variant === 'danger',
          },
          
          className
        )}
        {...props}
      >
        {/* Content с z-10 чтобы быть поверх ::before */}
        {icon && iconPosition === 'left' && (
          <span className="relative z-10 flex-shrink-0">{icon}</span>
        )}
        {children && <span className="relative z-10">{children}</span>}
        {icon && iconPosition === 'right' && (
          <span className="relative z-10 flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
