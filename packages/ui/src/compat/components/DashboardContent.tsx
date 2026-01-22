/**
 * DashboardContent Component
 *
 * Main content area wrapper for dashboard pages.
 */

import React from 'react';

export interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardContent({ children, className = '' }: DashboardContentProps): React.ReactElement {
  return (
    <main
      className={className}
      style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      }}
    >
      {children}
    </main>
  );
}
