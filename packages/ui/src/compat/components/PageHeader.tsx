/**
 * PageHeader Component
 *
 * Header section for pages with title, description, and actions.
 */

import React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = '',
}: PageHeaderProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        marginBottom: '1.5rem',
      }}
    >
      {breadcrumbs && <div style={{ marginBottom: '1rem' }}>{breadcrumbs}</div>}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Heading level={1} data-size="lg">{title}</Heading>
          {description && (
            <Paragraph style={{ marginTop: '0.5rem', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {description}
            </Paragraph>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
