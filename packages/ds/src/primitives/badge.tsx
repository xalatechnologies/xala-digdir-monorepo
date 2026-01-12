/**
 * Badge Component
 * 
 * Small status or label component
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variant
   * @default 'neutral'
   */
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', className, style, ...props }, ref) => {
    const getStyles = () => {
      const base: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        borderRadius: '4px',
        transition: 'all 0.2s',
      };

      // Size mapping
      const sizes = {
        sm: { fontSize: '12px', padding: '2px 8px', height: '20px' },
        md: { fontSize: '14px', padding: '4px 12px', height: '24px' },
        lg: { fontSize: '16px', padding: '6px 16px', height: '32px' },
      };

      // Variant mapping
      const variants = {
        neutral: {
          backgroundColor: 'var(--ds-colors-surface-subtle)',
          color: 'var(--ds-colors-text-default)',
        },
        info: {
          backgroundColor: 'var(--ds-colors-info-subtle)',
          color: 'var(--ds-colors-info-default)',
        },
        success: {
          backgroundColor: 'var(--ds-colors-success-subtle)',
          color: 'var(--ds-colors-success-default)',
        },
        warning: {
          backgroundColor: 'var(--ds-colors-warning-subtle)',
          color: 'var(--ds-colors-warning-default)',
        },
        danger: {
          backgroundColor: 'var(--ds-colors-danger-subtle)',
          color: 'var(--ds-colors-danger-default)',
        },
      };

      return {
        ...base,
        ...sizes[size],
        ...variants[variant],
      };
    };

    return (
      <span
        ref={ref}
        className={cn('ds-badge', className)}
        style={{ ...getStyles(), ...style }}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
