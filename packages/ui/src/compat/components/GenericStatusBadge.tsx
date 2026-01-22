/**
 * GenericStatusBadge - Generic status badge with configurable colors
 */

import React from 'react';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

export interface StatusBadgeConfig {
  label: string;
  variant: StatusBadgeVariant;
}

export interface GenericStatusBadgeProps {
  status: string;
  config?: Record<string, StatusBadgeConfig>;
  label?: string;
  variant?: StatusBadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantColors: Record<StatusBadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' },
  warning: { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' },
  danger: { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
  info: { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
  neutral: { bg: 'var(--ds-color-neutral-surface-hover)', text: 'var(--ds-color-neutral-text-default)' },
  primary: { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' },
};

const sizes = {
  sm: { padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', fontSize: '0.75rem' },
  md: { padding: 'var(--ds-spacing-1) var(--ds-spacing-3)', fontSize: '0.875rem' },
  lg: { padding: 'var(--ds-spacing-2) var(--ds-spacing-4)', fontSize: '1rem' },
};

export function GenericStatusBadge({
  status,
  config,
  label,
  variant = 'neutral',
  size = 'md',
  className,
}: GenericStatusBadgeProps) {
  const statusConfig = config?.[status];
  const displayLabel = label || statusConfig?.label || status;
  const displayVariant = statusConfig?.variant || variant;
  const colors = variantColors[displayVariant];
  const sizeStyles = sizes[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 500,
        ...sizeStyles,
      }}
    >
      {displayLabel}
    </span>
  );
}
