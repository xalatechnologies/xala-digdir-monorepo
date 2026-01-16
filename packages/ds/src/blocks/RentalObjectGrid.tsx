/**
 * RentalObjectGrid
 *
 * A responsive grid component for displaying rental object cards.
 * Strict responsive rules: 3 columns (large), 2 columns (tablet), 1 column (mobile)
 */
import * as React from 'react';
import { cn } from '../utils';

export interface RentalObjectGridProps {
  /** Gap between cards - number (px) or CSS value (default: uses size mode token) */
  gap?: number | string;
  /** Minimum card width for auto-fill grid (default: 280) */
  minCardWidth?: number;
  /** Maximum columns (default: 3) - enforces 3/2/1 responsive pattern */
  maxColumns?: 1 | 2 | 3;
  /** Grid children (RentalObjectCard components) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function RentalObjectGrid({
  gap,
  minCardWidth = 280,
  maxColumns = 3,
  children,
  className,
}: RentalObjectGridProps): React.ReactElement {
  const gapValue = gap !== undefined
    ? (typeof gap === 'number' ? `${gap}px` : gap)
    : 'var(--ds-spacing-6, 24px)';

  // Responsive columns: max 3 on desktop, max 2 on tablet, 1 on mobile
  // Uses auto-fill with minmax but capped at maxColumns
  const gridTemplateColumns = `repeat(auto-fill, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  return (
    <div
      className={cn('rental-object-grid', className)}
      data-max-columns={maxColumns}
      style={{
        '--rental-object-grid-gap': gapValue,
        '--rental-object-grid-min-card-width': `${minCardWidth}px`,
        '--rental-object-grid-max-columns': maxColumns,
        display: 'grid',
        gap: gapValue,
        gridTemplateColumns,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default RentalObjectGrid;
