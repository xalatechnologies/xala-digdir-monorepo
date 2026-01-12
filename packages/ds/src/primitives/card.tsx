/**
 * Card Component
 * 
 * Container component for content
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, style, ...props }, ref) => {
    const getStyles = () => {
      const base = {
        borderRadius: '8px',
        transition: 'all 0.2s',
      };

      switch (variant) {
        case 'outlined':
          return {
            ...base,
            border: '1px solid var(--ds-colors-border-default)',
            backgroundColor: 'var(--ds-colors-surface-default)',
          };
        case 'elevated':
          return {
            ...base,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'var(--ds-colors-surface-default)',
          };
        default:
          return {
            ...base,
            border: '1px solid var(--ds-colors-border-subtle)',
            backgroundColor: 'var(--ds-colors-surface-default)',
          };
      }
    };

    return (
      <div
        ref={ref}
        className={cn('ds-card', className)}
        style={{ ...getStyles(), ...style }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
