/**
 * ResultsSkeleton
 *
 * Loading skeleton component for rental object results.
 * Supports grid and list view modes with animated shimmer effect.
 *
 * @example
 * ```tsx
 * {isLoading && <ResultsSkeleton viewMode="grid" count={6} />}
 * ```
 */

import * as React from 'react';
import { cn } from '../utils';

export interface ResultsSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * View mode for skeleton layout
   * @default 'grid'
   */
  viewMode: 'grid' | 'list';

  /**
   * Number of skeleton items to show
   * @default 6
   */
  count?: number;

  /**
   * Card height for grid view
   * @default 380
   */
  cardHeight?: number;

  /**
   * List item height for list view
   * @default 200
   */
  listItemHeight?: number;

  /**
   * Test ID for E2E testing
   */
  'data-testid'?: string;
}

// Skeleton keyframes CSS
const shimmerKeyframes = `
  @keyframes ds-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

/**
 * Individual skeleton card for grid view
 */
const SkeletonCard = ({ height = 380 }: { height?: number }) => (
  <div
    style={{
      height: `${height}px`,
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
      borderRadius: 'var(--ds-border-radius-lg)',
      border: '1px solid var(--ds-color-neutral-border-subtle)',
      overflow: 'hidden',
    }}
  >
    {/* Image placeholder */}
    <div
      style={{
        width: '100%',
        height: '200px',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'ds-shimmer 1.5s infinite',
        }}
      />
    </div>

    {/* Content placeholder */}
    <div style={{ padding: 'var(--ds-spacing-4)' }}>
      {/* Title */}
      <div
        style={{
          height: '24px',
          width: '70%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
          marginBottom: 'var(--ds-spacing-2)',
        }}
      />

      {/* Location */}
      <div
        style={{
          height: '16px',
          width: '50%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      />

      {/* Tags */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div
          style={{
            height: '24px',
            width: '60px',
            borderRadius: 'var(--ds-border-radius-lg)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        />
        <div
          style={{
            height: '24px',
            width: '80px',
            borderRadius: 'var(--ds-border-radius-lg)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--ds-spacing-2)',
        }}
      >
        <div
          style={{
            height: '20px',
            width: '40px',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        />
        <div
          style={{
            height: '20px',
            width: '60px',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        />
      </div>
    </div>
  </div>
);

/**
 * Individual skeleton item for list view
 */
const SkeletonListItem = ({ height = 200 }: { height?: number }) => (
  <div
    style={{
      height: `${height}px`,
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
      borderRadius: 'var(--ds-border-radius-lg)',
      border: '1px solid var(--ds-color-neutral-border-subtle)',
      overflow: 'hidden',
      display: 'flex',
      gap: 'var(--ds-spacing-4)',
      padding: 'var(--ds-spacing-4)',
    }}
  >
    {/* Image placeholder */}
    <div
      style={{
        width: '200px',
        height: '100%',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'ds-shimmer 1.5s infinite',
        }}
      />
    </div>

    {/* Content */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
      {/* Title */}
      <div
        style={{
          height: '24px',
          width: '60%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      />

      {/* Location */}
      <div
        style={{
          height: '16px',
          width: '40%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      />

      {/* Description */}
      <div
        style={{
          height: '16px',
          width: '80%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      />
      <div
        style={{
          height: '16px',
          width: '70%',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      />

      {/* Tags */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'auto' }}>
        <div
          style={{
            height: '24px',
            width: '60px',
            borderRadius: 'var(--ds-border-radius-lg)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        />
        <div
          style={{
            height: '24px',
            width: '80px',
            borderRadius: 'var(--ds-border-radius-lg)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          }}
        />
      </div>
    </div>

    {/* Map placeholder */}
    <div
      style={{
        width: '150px',
        height: '100%',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        flexShrink: 0,
      }}
    />
  </div>
);

/**
 * ResultsSkeleton Component
 *
 * Displays animated loading skeletons for rental object results.
 * Automatically adapts layout based on view mode.
 */
export function ResultsSkeleton({
  viewMode = 'grid',
  count = 6,
  cardHeight = 380,
  listItemHeight = 200,
  className,
  'data-testid': testId,
  ...props
}: ResultsSkeletonProps): React.ReactElement {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={cn('ds-results-skeleton', className)}
      data-testid={testId}
      data-view-mode={viewMode}
      role="status"
      aria-label="Laster resultater..."
      aria-busy="true"
      {...props}
    >
      <style>{shimmerKeyframes}</style>

      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--ds-spacing-6)',
          }}
        >
          {items.map((i) => (
            <SkeletonCard key={i} height={cardHeight} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {items.map((i) => (
            <SkeletonListItem key={i} height={listItemHeight} />
          ))}
        </div>
      )}
    </div>
  );
}

ResultsSkeleton.displayName = 'ResultsSkeleton';

export default ResultsSkeleton;
