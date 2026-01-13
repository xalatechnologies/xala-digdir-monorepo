/**
 * ListingGrid
 *
 * A responsive grid component for displaying listing cards.
 * Strict responsive rules: 3 columns (large), 2 columns (tablet), 1 column (mobile)
 */
import * as React from 'react';
import { cn } from '../utils';

export interface ListingGridProps {
  /** Gap between cards - number (px) or CSS value (default: uses size mode token) */
  gap?: number | string;
  /** Grid children (ListingCard components) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function ListingGrid({
  gap,
  children,
  className,
}: ListingGridProps): React.ReactElement {
  const gapValue = gap !== undefined
    ? (typeof gap === 'number' ? `${gap}px` : gap)
    : 'var(--ds-spacing-6, 24px)';

  return (
    <div
      className={cn('listing-grid', className)}
      style={{
        display: 'grid',
        gap: gapValue,
      }}
    >
      {children}
    </div>
  );
}

export default ListingGrid;
