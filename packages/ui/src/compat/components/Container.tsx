/**
 * Container Component
 *
 * Responsive container with max-width constraints.
 */

import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

export function Container({ children, size = 'lg', className = '' }: ContainerProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        maxWidth: maxWidths[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      {children}
    </div>
  );
}
