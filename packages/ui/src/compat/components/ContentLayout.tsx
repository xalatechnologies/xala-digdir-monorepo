/**
 * ContentLayout Component
 *
 * Layout wrapper for page content with consistent spacing and max-width.
 */

import React from 'react';

export interface ContentLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const maxWidthValues = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

const paddingValues = {
  none: '0',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

export function ContentLayout({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className = '',
}: ContentLayoutProps): React.ReactElement {
  return (
    <main
      className={className}
      style={{
        width: '100%',
        maxWidth: maxWidthValues[maxWidth],
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: paddingValues[padding],
      }}
    >
      {children}
    </main>
  );
}
