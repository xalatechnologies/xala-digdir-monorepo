/**
 * DashboardPageHeader - Dashboard welcome/page header component
 */

import React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  user?: { firstName?: string; name?: string };
  greeting?: string;
  children?: React.ReactNode;
}

export function DashboardPageHeader({
  title,
  subtitle,
  description,
  user,
  greeting,
  children,
}: DashboardPageHeaderProps) {
  const displayTitle = greeting && user
    ? `${greeting}, ${user.firstName || user.name || ''}!`
    : title;

  return (
    <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
      <Heading level={1} size="lg">
        {displayTitle}
      </Heading>
      {(subtitle || description) && (
        <Paragraph style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {subtitle || description}
        </Paragraph>
      )}
      {children}
    </div>
  );
}
