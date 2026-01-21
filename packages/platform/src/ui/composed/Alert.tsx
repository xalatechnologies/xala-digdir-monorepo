/**
 * Alert Component
 *
 * Inline alert banners for displaying contextual messages.
 * Supports info, success, warning, and error variants.
 *
 * @module @xalatechnologies/platform/ui/composed/Alert
 */

import React, { useState, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getDefaultIcon(variant: AlertVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircleIcon />;
    case 'warning':
      return <AlertTriangleIcon />;
    case 'error':
      return <XCircleIcon />;
    default:
      return <InfoIcon />;
  }
}

function getVariantStyles(variant: AlertVariant) {
  switch (variant) {
    case 'success':
      return {
        bg: 'var(--ds-color-success-surface-default)',
        border: 'var(--ds-color-success-border-default)',
        icon: 'var(--ds-color-success-base-default)',
        text: 'var(--ds-color-success-text-default)',
      };
    case 'warning':
      return {
        bg: 'var(--ds-color-warning-surface-default)',
        border: 'var(--ds-color-warning-border-default)',
        icon: 'var(--ds-color-warning-base-default)',
        text: 'var(--ds-color-warning-text-default)',
      };
    case 'error':
      return {
        bg: 'var(--ds-color-danger-surface-default)',
        border: 'var(--ds-color-danger-border-default)',
        icon: 'var(--ds-color-danger-base-default)',
        text: 'var(--ds-color-danger-text-default)',
      };
    default:
      return {
        bg: 'var(--ds-color-info-surface-default)',
        border: 'var(--ds-color-info-border-default)',
        icon: 'var(--ds-color-info-base-default)',
        text: 'var(--ds-color-info-text-default)',
      };
  }
}

// =============================================================================
// Alert Component
// =============================================================================

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  action,
  className,
  style,
}: AlertProps): React.ReactElement | null {
  const [isDismissed, setIsDismissed] = useState(false);
  const styles = getVariantStyles(variant);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--ds-border-radius-md)',
        ...style,
      }}
    >
      <div style={{ color: styles.icon, flexShrink: 0, marginTop: '2px' }}>
        {icon ?? getDefaultIcon(variant)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontWeight: 'var(--ds-font-weight-medium)',
              fontSize: 'var(--ds-font-size-sm)',
              color: styles.text,
              marginBottom: 'var(--ds-spacing-1)',
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-default)',
            lineHeight: 1.5,
          }}
        >
          {children}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              marginTop: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: styles.icon,
              background: 'transparent',
              border: `1px solid ${styles.border}`,
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          style={{
            flexShrink: 0,
            padding: 'var(--ds-spacing-1)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ds-color-neutral-text-subtle)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

export default Alert;
