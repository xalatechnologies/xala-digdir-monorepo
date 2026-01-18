import { Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';

/**
 * Loading fallback component for React Suspense boundaries.
 * Displays a centered spinner with full viewport height.
 */
export function LoadingFallback() {
  const t = useT();
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
      <Spinner aria-label={t("state.loading")} data-data-size="lg" />
    </div>
  );
}
