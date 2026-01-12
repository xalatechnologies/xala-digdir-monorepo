/**
 * ListingGrid
 *
 * A responsive grid component for displaying listing cards.
 */
import * as React from 'react';
import { cn } from '../utils';

export interface ListingGridProps {
  /** Number of columns (default: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between cards in pixels (default: 32) */
  gap?: number;
  /** Grid children (ListingCard components) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function ListingGrid({
  columns = 3,
  gap = 32,
  children,
  className,
}: ListingGridProps): React.ReactElement {
  return (
    <div
      className={cn('listing-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

export default ListingGrid;
