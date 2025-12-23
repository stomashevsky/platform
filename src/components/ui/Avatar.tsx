'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Avatar component matching OpenAI Platform design
 */

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const initials = fallback 
      ? fallback.slice(0, 2).toUpperCase()
      : alt?.slice(0, 2).toUpperCase() || 'U';
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center',
          'rounded-full overflow-hidden',
          'bg-[#f5f5f5]',
          
          // Sizes
          {
            'w-6 h-6 text-[10px]': size === 'sm',
            'w-8 h-8 text-[12px]': size === 'md',
            'w-10 h-10 text-[14px]': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-medium text-[#5d5d5d]">
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
