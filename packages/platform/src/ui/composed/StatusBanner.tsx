/**
 * StatusBanner Component
 *
 * Contextual status banners for detail pages.
 * Displays status information with icon and description.
 *
 * SSR-safe: No browser APIs used.
 * Hydration-safe: Pure presentational component.
 *
 * @module @xalatechnologies/platform/ui/composed/StatusBanner
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type StatusBannerVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusBannerProps {
  variant: StatusBannerVariant;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<StatusBannerVariant, {
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
}> = {
  info: {
    backgroundColor: 'var(--ds-color-info-surface-subtle)',
    borderColor: 'var(--ds-color-info-border-default)',
    iconColor: 'var(--ds-color-info-text-default)',
  },
  success: {
    backgroundColor: 'var(--ds-color-success-surface-subtle)',
    borderColor: 'var(--ds-color-success-border-default)',
    iconColor: 'var(--ds-color-success-text-default)',
  },
  warning: {
    backgroundColor: 'var(--ds-color-warning-surface-subtle)',
    borderColor: 'var(--ds-color-warning-border-default)',
    iconColor: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    backgroundColor: 'var(--ds-color-danger-surface-subtle)',
    borderColor: 'var(--ds-color-danger-border-default)',
    iconColor: 'var(--ds-color-danger-text-default)',
  },
  neutral: {
    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
    borderColor: 'var(--ds-color-neutral-border-default)',
    iconColor: 'var(--ds-color-neutral-text-default)',
  },
};

// =============================================================================
// Default Icons
// =============================================================================

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function getDefaultIcon(variant: StatusBannerVariant): ReactNode {
  switch (variant) {
    case 'info':
      return <InfoIcon />;
    case 'success':
      return <CheckCircleIcon />;
    case 'warning':
      return <AlertTriangleIcon />;
    case 'danger':
      return <XCircleIcon />;
    default:
      return <InfoIcon />;
  }
}

// =============================================================================
// StatusBanner Component
// =============================================================================

export function StatusBanner({
  variant,
  icon,
  title,
  description,
  action,
  className,
  style,
}: StatusBannerProps): React.ReactElement {
  const variantStyle = variantStyles[variant];
  const displayIcon = icon ?? getDefaultIcon(variant);

  return (
    <div
      className={className}
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: variantStyle.backgroundColor,
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: variantStyle.borderColor,
        borderRadius: 'var(--ds-border-radius-lg)',
        ...style,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          color: variantStyle.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {displayIcon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              margin: 'var(--ds-spacing-1) 0 0 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div style={{ flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  );
}

export default StatusBanner;
