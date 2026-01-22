/**
 * AppHeader Component
 *
 * Application header with logo, navigation, and user menu.
 */

import React from 'react';

export interface AppHeaderProps {
  children?: React.ReactNode;
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function AppHeader({
  children,
  logo,
  navigation,
  actions,
  sticky = true,
  className = '',
}: AppHeaderProps): React.ReactElement {
  return (
    <header
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '64px',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {logo}
        {navigation}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{actions}</div>}
      {children}
    </header>
  );
}
