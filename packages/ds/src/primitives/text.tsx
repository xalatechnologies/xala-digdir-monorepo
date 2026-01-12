/**
 * Text Component
 * 
 * Typography component
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Text variant
   * @default 'body'
   */
  variant?: 'body' | 'subtitle' | 'caption' | 'overline';
  
  /**
   * Text size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Text weight
   * @default 'normal'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Text color
   */
  color?: string;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ 
    variant = 'body', 
    size = 'md', 
    weight = 'normal',
    color,
    className,
    style,
    ...props 
  }, ref) => {
    const getStyles = () => {
      const base: React.CSSProperties = {
        margin: 0,
        color: color || 'var(--ds-colors-text-default)',
      };

      // Size mapping
      const sizes = {
        xs: { fontSize: '12px', lineHeight: '16px' },
        sm: { fontSize: '14px', lineHeight: '20px' },
        md: { fontSize: '16px', lineHeight: '24px' },
        lg: { fontSize: '18px', lineHeight: '28px' },
        xl: { fontSize: '20px', lineHeight: '30px' },
      };

      // Weight mapping
      const weights = {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      };

      return {
        ...base,
        ...sizes[size],
        fontWeight: weights[weight],
      };
    };

    const Component = variant === 'overline' ? 'span' : 'p';

    return (
      <Component
        ref={ref}
        className={cn('ds-text', className)}
        style={{ ...getStyles(), ...style }}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';
