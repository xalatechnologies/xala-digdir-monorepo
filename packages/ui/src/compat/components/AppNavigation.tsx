/**
 * AppNavigation Component
 *
 * Main navigation component for the app.
 */

import React from 'react';
import { Link } from '@digdir/designsystemet-react';

export interface NavItemConfig {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children?: NavItemConfig[];
}

export interface AppNavigationProps {
  items: NavItemConfig[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function AppNavigation({
  items,
  orientation = 'horizontal',
  className = '',
}: AppNavigationProps): React.ReactElement {
  const isHorizontal = orientation === 'horizontal';

  return (
    <nav
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: isHorizontal ? '0.5rem' : '0.25rem',
      }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--ds-border-radius-md)',
            textDecoration: 'none',
            color: item.active
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-default)',
            backgroundColor: item.active
              ? 'var(--ds-color-accent-surface-default)'
              : 'transparent',
            fontWeight: item.active ? 500 : 400,
          }}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
