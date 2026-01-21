/**
 * LoadingFallback Component
 *
 * Full-page loading state for lazy-loaded components.
 * Used with React.Suspense.
 *
 * @example
 * ```tsx
 * import { LoadingFallback } from '@digdir/designsystemet-react';
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<LoadingFallback />}>
 *       <LazyComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 */

import { Spinner } from '@digdir/designsystemet-react';

export interface LoadingFallbackProps {
  /** Loading message to display */
  message?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * LoadingFallback displays a centered spinner with optional message
 */
export function LoadingFallback({
  message = 'Laster...',
  className,
  style,
}: LoadingFallbackProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        ...style,
      }}
    >
      <Spinner aria-label={message} data-size="lg" />
    </div>
  );
}
