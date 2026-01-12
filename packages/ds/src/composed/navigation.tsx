/**
 * Navigation Component
 * 
 * Horizontal navigation following Designsystemet patterns
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Navigation links
   */
  children: React.ReactNode;
  
  /**
   * Spacing between items
   * @default 32
   */
  spacing?: number;
}

export const Navigation = forwardRef<HTMLDivElement, NavigationProps>(
  ({ children, spacing = 32, className, style, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('ds-navigation', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing}px`,
          ...style
        }}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

// Navigation Link
export interface NavigationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Is this the active page?
   */
  active?: boolean;
}

export const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ active, children, className, style, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn('ds-navigation-link', active && 'ds-navigation-link--active', className)}
        style={{
          color: active 
            ? 'var(--ds-colors-text-default)' 
            : 'var(--ds-colors-text-default)',
          textDecoration: 'none',
          fontWeight: active ? 600 : 400,
          padding: '8px 12px',
          borderRadius: '4px',
          transition: 'all 0.2s',
          ...(active && {
            backgroundColor: 'var(--ds-colors-surface-selected)'
          }),
          ...style
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);

NavigationLink.displayName = 'NavigationLink';
