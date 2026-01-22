/**
 * HeaderActions Component
 *
 * Container for header action items (notifications, user menu, etc.)
 */

import React from 'react';

export interface HeaderActionsProps {
  children?: React.ReactNode;
  className?: string;
}

export function HeaderActions({
  children,
  className = '',
}: HeaderActionsProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {children}
    </div>
  );
}
