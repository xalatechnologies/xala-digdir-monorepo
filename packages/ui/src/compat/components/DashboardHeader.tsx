/**
 * DashboardHeader - Dashboard page header with actions
 */

import React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        marginBottom: 'var(--ds-spacing-6)',
      }}
    >
      {breadcrumbs && (
        <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {breadcrumbs}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)' }}>
        <div>
          <Heading level={1} size="lg">
            {title}
          </Heading>
          {subtitle && (
            <Paragraph style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {subtitle}
            </Paragraph>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
