/**
 * Grid Component
 *
 * CSS Grid layout component with responsive columns.
 */

import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  gap?: number | string;
  rowGap?: number | string;
  columnGap?: number | string;
  minChildWidth?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
}

export function Grid({
  children,
  columns = 1,
  gap = '1rem',
  rowGap,
  columnGap,
  minChildWidth,
  alignItems,
  justifyItems,
  className = '',
  style,
}: GridProps): React.ReactElement {
  const gridTemplateColumns = minChildWidth
    ? `repeat(auto-fill, minmax(${minChildWidth}, 1fr))`
    : typeof columns === 'number'
    ? `repeat(${columns}, 1fr)`
    : columns;

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        rowGap: rowGap ? (typeof rowGap === 'number' ? `${rowGap}px` : rowGap) : undefined,
        columnGap: columnGap ? (typeof columnGap === 'number' ? `${columnGap}px` : columnGap) : undefined,
        alignItems,
        justifyItems,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
