'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Chip component matching OpenAI Platform EXACTLY
 * 
 * Extracted from OpenAI Platform (December 2024):
 * - Height: 28px
 * - Padding: 0px 7.98px (≈ 8px)
 * - Border-radius: 9999px (pill shape)
 * - Font: 14px, weight 500
 * - Letter-spacing: -0.14px (наследуется от body: -0.16px)
 * - Color: rgb(13, 13, 13) = #0d0d0d
 * - Background: rgba(0, 0, 0, 0) - прозрачный
 * - ::before background: oklab(0.159065 0.00000723451 0.00000317395 / 0.08) ≈ полупрозрачный серый
 * - ::before borderRadius: 9999px
 * - Transition: background-color 0.3s cubic-bezier(0.19, 1, 0.22, 1)
 * 
 * OpenAI использует ::before для фона!
 */

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'hover';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ 
    className, 
    variant = 'default',
    icon,
    iconPosition = 'left',
    children, 
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        style={{
          height: '28px',
          padding: '0 8px',
          fontFamily: '"OpenAI Sans", helvetica, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
        }}
        className={cn(
          // Base styles - exact from OpenAI
          'relative inline-flex items-center justify-center',
          'rounded-[9999px]',
          'bg-transparent',
          'border-0',
          'gap-[4px]',
          'cursor-pointer',
          'text-[#0d0d0d]',
          
          // ::before для фона (как в OpenAI)
          'before:absolute before:inset-0 before:rounded-[9999px]',
          'before:transition-all before:duration-300',
          
          // Variants
          {
            // Default - полупрозрачный фон через ::before
            // oklab(0.159065 ... / 0.08) ≈ rgba(0, 0, 0, 0.08)
            'before:bg-[rgba(0,0,0,0.08)] hover:before:bg-[#ededed]':
              variant === 'default',
            
            // Hover - более заметный фон
            'before:bg-[#ededed]':
              variant === 'hover',
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

Chip.displayName = 'Chip';

export { Chip };

/**
 * ChipGroup - container for multiple chips
 */
interface ChipGroupProps {
  children: ReactNode;
  className?: string;
}

export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div className={cn(
      'flex flex-wrap gap-2',
      className
    )}>
      {children}
    </div>
  );
}
