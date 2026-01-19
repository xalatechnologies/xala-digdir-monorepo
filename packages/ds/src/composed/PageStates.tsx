/**
 * PageStates Components
 *
 * Reusable components for common page states:
 * - Loading state with spinner
 * - Empty state with icon and action
 * - Not found state with back navigation
 * - Error state with retry action
 *
 * SSR-safe: No browser APIs used.
 * Hydration-safe: Pure presentational components.
 *
 * @module @xala/ds/composed/PageStates
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface LoadingStateProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
  style?: React.CSSProperties;
}

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  backLink?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function SpinnerIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function FileQuestionIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 13a2 2 0 1 0 2.83 2.83" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

// =============================================================================
// Size Configurations
// =============================================================================

const spinnerSizes = {
  sm: 24,
  md: 32,
  lg: 48,
};

const paddingSizes = {
  sm: 'var(--ds-spacing-4)',
  md: 'var(--ds-spacing-6)',
  lg: 'var(--ds-spacing-8)',
};

// =============================================================================
// LoadingState Component
// =============================================================================

export function LoadingState({
  label = 'Loading...',
  size = 'md',
  className,
  style,
}: LoadingStateProps): React.ReactElement {
  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: paddingSizes[size],
        gap: 'var(--ds-spacing-3)',
        ...style,
      }}
    >
      <div style={{ color: 'var(--ds-color-accent-text-default)' }}>
        <SpinnerIcon size={spinnerSizes[size]} />
      </div>
      <span
        style={{
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// =============================================================================
// EmptyState Component
// =============================================================================

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
  style,
}: EmptyStateProps): React.ReactElement {
  const defaultIcon = <InboxIcon />;
  const displayIcon = icon ?? defaultIcon;

  const padding = variant === 'compact' ? 'var(--ds-spacing-6)' : 'var(--ds-spacing-8)';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding,
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        {displayIcon}
      </div>

      <h3
        style={{
          margin: '0 0 var(--ds-spacing-2) 0',
          fontSize: variant === 'compact' ? 'var(--ds-font-size-md)' : 'var(--ds-font-size-lg)',
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
          {action}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// NotFoundState Component
// =============================================================================

export function NotFoundState({
  title = 'Not found',
  description = 'The requested resource could not be found.',
  backLink,
  className,
  style,
}: NotFoundStateProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--ds-spacing-8)',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <FileQuestionIcon />
      </div>

      <h3
        style={{
          margin: '0 0 var(--ds-spacing-2) 0',
          fontSize: 'var(--ds-font-size-lg)',
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-neutral-text-subtle)',
          maxWidth: '400px',
        }}
      >
        {description}
      </p>

      {backLink && (
        <a
          href={backLink.href}
          onClick={(e) => {
            if (backLink.onClick) {
              e.preventDefault();
              backLink.onClick();
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-default)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon />
          {backLink.label}
        </a>
      )}
    </div>
  );
}

// =============================================================================
// ErrorState Component
// =============================================================================

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  onRetry,
  retryLabel = 'Try again',
  className,
  style,
}: ErrorStateProps): React.ReactElement {
  return (
    <div
      className={className}
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--ds-spacing-8)',
        ...style,
      }}
    >
      <div
        style={{
          color: 'var(--ds-color-danger-text-default)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <AlertCircleIcon />
      </div>

      <h3
        style={{
          margin: '0 0 var(--ds-spacing-2) 0',
          fontSize: 'var(--ds-font-size-lg)',
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-neutral-text-subtle)',
          maxWidth: '400px',
        }}
      >
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'white',
            backgroundColor: 'var(--ds-color-accent-base-default)',
            borderWidth: '0',
            borderStyle: 'none',
            borderRadius: 'var(--ds-border-radius-md)',
            cursor: 'pointer',
          }}
        >
          <RefreshIcon />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default {
  LoadingState,
  EmptyState,
  NotFoundState,
  ErrorState,
};
