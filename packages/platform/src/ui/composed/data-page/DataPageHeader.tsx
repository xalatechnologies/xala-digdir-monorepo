/**
 * DataPageHeader Component
 * 
 * Enhanced PageHeader with count badge support
 * Extends packages/ds/src/composed/page-header.tsx
 */

import React, { forwardRef } from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { Badge } from '@digdir/designsystemet-react';
import { PageHeader, PageHeaderProps } from '../page-header';

export interface DataPageHeaderProps extends Omit<PageHeaderProps, 'title'> {
  /** The page title */
  title: string;
  /** Optional item count to display */
  count?: number;
  /** Count label (must be translated by caller, e.g., "{{count}} objekter") */
  countLabel?: string;
}

export const DataPageHeader = forwardRef<HTMLDivElement, DataPageHeaderProps>(
  ({ title, count, countLabel, ...props }, ref) => {
    const displayTitle = count !== undefined && countLabel ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
        <span>{title}</span>
        {count > 0 && (
          <span style={{ backgroundColor: 'var(--ds-color-neutral-surface-hover)', color: 'var(--ds-color-neutral-text-default)', padding: '0.125rem 0.5rem', borderRadius: 'var(--ds-border-radius-full)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
            {countLabel.replace('{{count}}', count.toString())}
          </span>
        )}
      </div>
    ) : title;

    return <PageHeader ref={ref} title={displayTitle} {...props} />;
  }
);

DataPageHeader.displayName = 'DataPageHeader';
