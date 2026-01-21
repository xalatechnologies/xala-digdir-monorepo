/**
 * StatusBadges
 *
 * Reusable status badge components for various entity types.
 * Norwegian labels with consistent color coding.
 *
 * Uses custom styled tags instead of Digdir Badge (which is designed for numeric counts).
 */
import * as React from 'react';
import { cn } from '../../utils';

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
 * Use this for custom status displays or when you need more control.
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
      className={cn('status-tag', className)}
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

export default StatusTag;
