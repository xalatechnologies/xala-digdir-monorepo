/**
 * RequestStatusBadge
 *
 * Status badge for GDPR request statuses
 * - Supports: pending, processing, completed, rejected
 * - Norwegian labels
 * - Consistent color coding
 */

import * as React from 'react';
import type { GdprRequestStatus } from '@digilist/client-sdk/types';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export type BadgeColor = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeConfig {
  color: BadgeColor;
  label: string;
}

// =============================================================================
// Base StatusTag Component
// =============================================================================

const colorStyles: Record<BadgeColor, { bg: string; text: string }> = {
  success: {
    bg: 'var(--ds-color-success-surface-default)',
    text: 'var(--ds-color-success-text-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-default)',
    text: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-default)',
    text: 'var(--ds-color-danger-text-default)',
  },
  info: {
    bg: 'var(--ds-color-info-surface-default)',
    text: 'var(--ds-color-info-text-default)',
  },
  neutral: {
    bg: 'var(--ds-color-neutral-surface-hover)',
    text: 'var(--ds-color-neutral-text-subtle)',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', { padding: string; fontSize: string }> = {
  sm: {
    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-xs)',
  },
  md: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    fontSize: 'var(--ds-font-size-sm)',
  },
  lg: {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
    fontSize: 'var(--ds-font-size-md)',
  },
};

export interface StatusTagProps {
  /** The label text to display */
  children: React.ReactNode;
  /** Color scheme */
  color: BadgeColor;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
}

/**
 * Base StatusTag component for displaying status labels.
 */
function StatusTag({
  children,
  color,
  size = 'sm',
  className,
}: StatusTagProps): React.ReactElement {
  const t = useT();
  const colorStyle = colorStyles[color];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// GDPR Request Status Badge
// =============================================================================

const gdprRequestStatusConfig: Record<GdprRequestStatus, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  processing: { color: 'info', label: 'Behandles' },
  completed: { color: 'success', label: t('common.fullfort') },
  rejected: { color: 'danger', label: t('common.avslaatt') },
};

export interface RequestStatusBadgeProps {
  /** GDPR request status */
  status: GdprRequestStatus;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * RequestStatusBadge component for displaying GDPR request status.
 * Uses color-coded badges with Norwegian labels.
 */
export function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps): React.ReactElement {
  const config = gdprRequestStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}
