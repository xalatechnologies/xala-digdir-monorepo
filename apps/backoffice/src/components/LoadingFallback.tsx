import { Spinner } from '@xala/ds';

/**
 * Loading fallback component for React Suspense boundaries.
 * Displays a centered spinner with full viewport height.
 */
export function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      <Spinner aria-label="Laster..." data-data-size="lg" />
    </div>
  );
}
