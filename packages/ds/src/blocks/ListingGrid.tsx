/**
 * ListingGrid
 *
 * A responsive grid component for displaying listing cards.
 * Uses CSS auto-fit for intrinsic responsiveness.
 */
import * as React from 'react';
import { cn } from '../utils';

export interface ListingGridProps {
  /** Minimum width for each card before wrapping (default: 280) */
  minCardWidth?: number;
  /** Maximum number of columns (default: 3) */
  maxColumns?: number;
  /** Gap between cards - number (px) or CSS value (default: uses size mode token) */
  gap?: number | string;
  /** Grid children (ListingCard components) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /**
   * Number of columns (DEPRECATED: use minCardWidth for responsive behavior)
   * @deprecated Use minCardWidth instead for responsive grids
   */
  columns?: 1 | 2 | 3 | 4;
}

export function ListingGrid({
  minCardWidth = 280,
  maxColumns = 3,
  gap,
  children,
  className,
  columns,
}: ListingGridProps): React.ReactElement {
  // Use responsive auto-fit pattern by default
  // Fall back to fixed columns only if explicitly set (for backwards compatibility)
  const useFixedColumns = columns !== undefined;

  const gapValue = gap !== undefined
    ? (typeof gap === 'number' ? `${gap}px` : gap)
    : 'var(--ds-size-gap-default, 32px)';

  // For auto-fit with max columns constraint, we use minmax with a calculated minimum
  // This ensures cards never get smaller than minCardWidth while respecting maxColumns
  const gridTemplateColumns = useFixedColumns
    ? `repeat(${columns}, 1fr)`
    : `repeat(auto-fit, minmax(min(100%, ${minCardWidth}px), 1fr))`;

  return (
    <div
      className={cn('listing-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: gapValue,
      }}
    >
      {children}
    </div>
  );
}

export default ListingGrid;
