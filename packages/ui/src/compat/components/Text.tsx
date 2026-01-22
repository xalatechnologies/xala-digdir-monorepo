/**
 * Text Component
 *
 * Generic text component.
 */

import React from 'react';

export interface TextProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'bold';
  color?: 'default' | 'subtle' | 'muted';
  className?: string;
  as?: 'span' | 'p' | 'div';
}

export function Text({
  children,
  size = 'md',
  weight = 'normal',
  color = 'default',
  className = '',
  as: Component = 'span',
}: TextProps): React.ReactElement {
  const sizes = {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  };

  const weights = {
    normal: 400,
    medium: 500,
    bold: 600,
  };

  const colors = {
    default: 'var(--ds-color-neutral-text-default)',
    subtle: 'var(--ds-color-neutral-text-subtle)',
    muted: 'var(--ds-color-neutral-text-muted)',
  };

  return (
    <Component
      className={className}
      style={{
        fontSize: sizes[size],
        fontWeight: weights[weight],
        color: colors[color],
      }}
    >
      {children}
    </Component>
  );
}
