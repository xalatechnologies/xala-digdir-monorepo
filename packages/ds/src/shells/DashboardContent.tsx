/**
 * DashboardContent
 *
 * Responsive content container for dashboard pages.
 * Full-width fluid layout with consistent left/right padding.
 */

import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface DashboardContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Whether to add padding at bottom for mobile nav (default: false) */
  hasBottomNav?: boolean;
  /** Test ID */
  'data-testid'?: string;
}

// Unique ID generator for scoped styles
let styleIdCounter = 0;
const getStyleId = () => `ds-content-${++styleIdCounter}`;

// =============================================================================
// Component
// =============================================================================

export const DashboardContent = forwardRef<HTMLElement, DashboardContentProps>(
  (
    {
      hasBottomNav = false,
      className,
      style,
      children,
      'data-testid': testId = 'dashboard-content',
      ...props
    },
    ref
  ) => {
    const styleId = React.useMemo(() => getStyleId(), []);

    return (
      <main
        ref={ref as React.RefObject<HTMLElement>}
        className={cn('ds-dashboard-content', styleId, className)}
        data-testid={testId}
        style={{
          flex: 1,
          overflow: 'auto',
          minWidth: 0, // Prevent flex overflow
          ...style,
        }}
        {...props}
      >
        {children}

        {/* Responsive padding - full fluid width */}
        <style>{`
          /* Mobile (< 576px) */
          .${styleId} {
            padding: var(--ds-spacing-4);
            ${hasBottomNav ? 'padding-bottom: calc(64px + var(--ds-spacing-4) + env(safe-area-inset-bottom));' : ''}
          }

          /* Small tablets (576px+) */
          @media (min-width: 576px) {
            .${styleId} {
              padding: var(--ds-spacing-5);
              ${hasBottomNav ? 'padding-bottom: calc(64px + var(--ds-spacing-5) + env(safe-area-inset-bottom));' : ''}
            }
          }

          /* Tablets (768px+) - no bottom nav needed */
          @media (min-width: 768px) {
            .${styleId} {
              padding: var(--ds-spacing-6);
            }
          }

          /* Desktop (992px+) */
          @media (min-width: 992px) {
            .${styleId} {
              padding: var(--ds-spacing-6) var(--ds-spacing-8);
            }
          }

          /* Large desktop (1200px+) */
          @media (min-width: 1200px) {
            .${styleId} {
              padding: var(--ds-spacing-6) var(--ds-spacing-10);
            }
          }

          /* Ultra wide (1600px+) */
          @media (min-width: 1600px) {
            .${styleId} {
              padding: var(--ds-spacing-8) var(--ds-spacing-12);
            }
          }
        `}</style>
      </main>
    );
  }
);

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
