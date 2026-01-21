/**
 * RequestStatusBadge
 *
 * Generic status badge component for request statuses.
 * Domain-agnostic - receives status configuration via props.
 *
 * @example
 * ```tsx
 * // For GDPR requests
 * <RequestStatusBadge
 *   status="pending"
 *   statusConfig={{
 *     pending: { color: 'warning', label: 'Venter' },
 *     processing: { color: 'info', label: 'Behandles' },
 *     completed: { color: 'success', label: 'Fullfort' },
 *     rejected: { color: 'danger', label: 'Avslaatt' },
 *   }}
 * />
 * ```
 */

import * as React from 'react';

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
export function StatusTag({
  children,
  color,
  size = 'sm',
  className,
}: StatusTagProps): React.ReactElement {
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
        lineHeight: 'var(--ds-line-height-sm)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// =============================================================================
// Request Status Badge (Generic)
// =============================================================================

export interface RequestStatusBadgeProps<TStatus extends string = string> {
  /** The status value */
  status: TStatus;
  /** Status configuration mapping status to color and label */
  statusConfig: Record<TStatus, StatusBadgeConfig>;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Fallback config when status is not in statusConfig */
  fallbackConfig?: StatusBadgeConfig;
}

/**
 * Generic RequestStatusBadge component for displaying request status.
 * Receives status configuration via props for domain-agnostic usage.
 */
export function RequestStatusBadge<TStatus extends string = string>({
  status,
  statusConfig,
  size = 'sm',
  fallbackConfig = { color: 'neutral', label: status },
}: RequestStatusBadgeProps<TStatus>): React.ReactElement {
  const config = statusConfig[status] || fallbackConfig;
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}

// =============================================================================
// Default GDPR Status Config (convenience export for common use case)
// =============================================================================

/**
 * Default status configuration for GDPR requests.
 * Apps can use this or provide their own config.
 */
export const DEFAULT_GDPR_STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
  pending: { color: 'warning', label: 'Venter' },
  processing: { color: 'info', label: 'Behandles' },
  completed: { color: 'success', label: 'Fullfort' },
  rejected: { color: 'danger', label: 'Avslaatt' },
};
