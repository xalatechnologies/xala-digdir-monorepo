/**
 * ResourceGrid
 *
 * A generic, responsive grid component for displaying resource cards.
 * This is a platform-level pattern component with NO domain-specific terms.
 *
 * Features:
 * - Responsive columns via CSS Grid
 * - Loading skeleton state
 * - Empty state support
 * - Props-driven configuration
 *
 * @example
 * ```tsx
 * <ResourceGrid
 *   items={resources}
 *   renderItem={(item) => <ResourceCard {...item} />}
 *   columns={{ default: 3, md: 2, sm: 1 }}
 *   gap="md"
 *   loading={isLoading}
 *   loadingCount={6}
 *   emptyState={<EmptyState message="No items found" />}
 * />
 * ```
 */
import * as React from 'react';
import { Spinner, Paragraph } from '@digdir/designsystemet-react';
import { cn, getGapValue } from './utils';

export interface ResourceGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Responsive column configuration */
  columns?: {
    /** Default number of columns (largest screens) */
    default: number;
    /** Columns at sm breakpoint (640px) */
    sm?: number;
    /** Columns at md breakpoint (768px) */
    md?: number;
    /** Columns at lg breakpoint (1024px) */
    lg?: number;
    /** Columns at xl breakpoint (1280px) */
    xl?: number;
  };
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
  /** Show loading skeleton state */
  loading?: boolean;
  /** Number of skeleton items to show when loading */
  loadingCount?: number;
  /** Custom empty state content */
  emptyState?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Optional key extractor for items */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Minimum card width for auto-fill grid (px) */
  minItemWidth?: number;
}

/**
 * LoadingSkeleton component for grid items
 */
function LoadingSkeleton({ count = 6 }: { count: number }): React.ReactElement {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="resource-grid__skeleton"
          style={{
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-md, 8px)',
            minHeight: '200px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * Default empty state component
 */
function DefaultEmptyState(): React.ReactElement {
  return (
    <div
      className="resource-grid__empty"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-8, 32px)',
        textAlign: 'center',
        gridColumn: '1 / -1',
      }}
    >
      <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        No items to display
      </Paragraph>
    </div>
  );
}

/**
 * Loading indicator overlay
 */
function LoadingIndicator(): React.ReactElement {
  return (
    <div
      className="resource-grid__loading-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 'var(--ds-border-radius-md, 8px)',
        zIndex: 10,
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner data-size="md" aria-label="Loading..." />
    </div>
  );
}

/**
 * ResourceGrid component
 */
export function ResourceGrid<T>({
  items,
  renderItem,
  columns = { default: 3, md: 2, sm: 1 },
  gap = 'md',
  loading = false,
  loadingCount = 6,
  emptyState,
  className,
  keyExtractor,
  minItemWidth = 280,
}: ResourceGridProps<T>): React.ReactElement {
  const gapValue = getGapValue(gap);

  // Build responsive grid template columns using CSS clamp and media query approach
  // Uses auto-fill with minmax for responsive behavior
  const gridTemplateColumns = React.useMemo(() => {
    const maxCols = columns.default;
    // Calculate minimum width that ensures we don't exceed maxCols
    // Using minmax with auto-fill for responsive behavior
    return `repeat(auto-fill, minmax(min(max(${minItemWidth}px, calc((100% - ${maxCols - 1} * ${gapValue}) / ${maxCols})), 100%), 1fr))`;
  }, [columns.default, minItemWidth, gapValue]);

  // Generate CSS custom properties for responsive columns
  const cssVars = React.useMemo(() => {
    const vars: Record<string, string | number> = {
      '--resource-grid-gap': gapValue,
      '--resource-grid-min-item-width': `${minItemWidth}px`,
      '--resource-grid-max-columns': columns.default,
    };

    if (columns.sm !== undefined) {
      vars['--resource-grid-cols-sm'] = columns.sm;
    }
    if (columns.md !== undefined) {
      vars['--resource-grid-cols-md'] = columns.md;
    }
    if (columns.lg !== undefined) {
      vars['--resource-grid-cols-lg'] = columns.lg;
    }
    if (columns.xl !== undefined) {
      vars['--resource-grid-cols-xl'] = columns.xl;
    }

    return vars;
  }, [columns, gapValue, minItemWidth]);

  // Get unique key for each item
  const getKey = React.useCallback(
    (item: T, index: number): string | number => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Try common key patterns
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        if ('id' in obj && (typeof obj.id === 'string' || typeof obj.id === 'number')) {
          return obj.id;
        }
        if ('key' in obj && (typeof obj.key === 'string' || typeof obj.key === 'number')) {
          return obj.key;
        }
      }
      return index;
    },
    [keyExtractor]
  );

  const isEmpty = !loading && items.length === 0;
  const showSkeletons = loading && items.length === 0;

  return (
    <div
      className={cn('resource-grid', className)}
      data-loading={loading}
      data-empty={isEmpty}
      data-max-columns={columns.default}
      style={{
        ...cssVars,
        display: 'grid',
        gap: gapValue,
        gridTemplateColumns,
        width: '100%',
        position: 'relative',
      } as React.CSSProperties}
      role="list"
      aria-busy={loading}
    >
      {/* Skeleton loading state */}
      {showSkeletons && <LoadingSkeleton count={loadingCount} />}

      {/* Empty state */}
      {isEmpty && (emptyState || <DefaultEmptyState />)}

      {/* Items */}
      {!showSkeletons &&
        !isEmpty &&
        items.map((item, index) => (
          <div
            key={getKey(item, index)}
            className="resource-grid__item"
            role="listitem"
          >
            {renderItem(item, index)}
          </div>
        ))}

      {/* Loading overlay when items exist but loading new data */}
      {loading && items.length > 0 && <LoadingIndicator />}

      {/* CSS for skeleton animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Responsive column overrides using media queries */
        @media (max-width: 640px) {
          .resource-grid[data-max-columns] {
            grid-template-columns: repeat(var(--resource-grid-cols-sm, 1), 1fr) !important;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .resource-grid[data-max-columns] {
            grid-template-columns: repeat(var(--resource-grid-cols-md, 2), 1fr) !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .resource-grid[data-max-columns] {
            grid-template-columns: repeat(var(--resource-grid-cols-lg, var(--resource-grid-max-columns, 3)), 1fr) !important;
          }
        }

        @media (min-width: 1025px) and (max-width: 1280px) {
          .resource-grid[data-max-columns] {
            grid-template-columns: repeat(var(--resource-grid-cols-xl, var(--resource-grid-max-columns, 3)), 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ResourceGrid;
