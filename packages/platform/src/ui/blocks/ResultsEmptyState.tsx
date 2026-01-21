/**
 * ResultsEmptyState
 *
 * Empty state component for when no results match the current filters.
 * Supports multiple variants for different scenarios.
 *
 * @example
 * ```tsx
 * <ResultsEmptyState
 *   variant="no-results"
 *   title="Ingen resultater"
 *   description="Prøv å endre filtrene dine"
 *   action={<Button onClick={clearFilters}>Fjern filtre</Button>}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../utils';

export interface ResultsEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Empty state variant
   * @default 'no-results'
   */
  variant?: 'no-results' | 'no-data' | 'error';

  /**
   * Main title text
   */
  title?: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;

  /**
   * Action element (typically a button)
   */
  action?: React.ReactNode;

  /**
   * Test ID for E2E testing
   */
  'data-testid'?: string;
}

// Default icons for each variant
const SearchEmptyIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" opacity="0.5" />
    <path d="m21 21-4.35-4.35" opacity="0.5" />
    <path d="M8 11h6" strokeLinecap="round" />
  </svg>
);

const NoDataIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" opacity="0.5" />
    <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" opacity="0.3" />
    <circle cx="12" cy="12" r="3" />
    <path d="M10 10l4 4M14 10l-4 4" strokeLinecap="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" opacity="0.5" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </svg>
);

// Default content for each variant
const variantDefaults = {
  'no-results': {
    title: 'Ingen resultater',
    description: 'Prøv å endre filtrene dine eller søkeordet.',
    icon: <SearchEmptyIcon />,
    color: 'var(--ds-color-neutral-text-subtle)',
  },
  'no-data': {
    title: 'Ingen data tilgjengelig',
    description: 'Det er ingen lokaler registrert ennå. Kom tilbake senere.',
    icon: <NoDataIcon />,
    color: 'var(--ds-color-neutral-text-subtle)',
  },
  error: {
    title: 'Noe gikk galt',
    description: 'Kunne ikke laste resultater. Prøv igjen senere.',
    icon: <ErrorIcon />,
    color: 'var(--ds-color-danger-text-default)',
  },
};

/**
 * ResultsEmptyState Component
 *
 * Displays a centered empty state with icon, title, description, and optional action.
 */
export function ResultsEmptyState({
  variant = 'no-results',
  title,
  description,
  icon,
  action,
  className,
  'data-testid': testId,
  ...props
}: ResultsEmptyStateProps): React.ReactElement {
  const defaults = variantDefaults[variant];
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;
  const displayIcon = icon ?? defaults.icon;

  return (
    <div
      className={cn('ds-results-empty-state', className)}
      data-testid={testId}
      data-variant={variant}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-12) var(--ds-spacing-6)',
        textAlign: 'center',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        minHeight: '300px',
      }}
      {...props}
    >
      {/* Icon */}
      {displayIcon && (
        <div
          style={{
            color: defaults.color,
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          {displayIcon}
        </div>
      )}

      {/* Title */}
      {displayTitle && (
        <h3
          style={{
            fontSize: 'var(--ds-font-size-xl)',
            fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
            color: 'var(--ds-color-neutral-text-default)',
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
          {displayTitle}
        </h3>
      )}

      {/* Description */}
      {displayDescription && (
        <p
          style={{
            fontSize: 'var(--ds-font-size-md)',
            color: 'var(--ds-color-neutral-text-subtle)',
            margin: 0,
            marginBottom: action ? 'var(--ds-spacing-6)' : 0,
            maxWidth: '400px',
          }}
        >
          {displayDescription}
        </p>
      )}

      {/* Action */}
      {action && (
        <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
          {action}
        </div>
      )}
    </div>
  );
}

ResultsEmptyState.displayName = 'ResultsEmptyState';

export default ResultsEmptyState;
