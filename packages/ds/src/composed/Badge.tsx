/**
 * Badge & Tag Components
 *
 * Status badges, notification counts, and tags.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/Badge
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pill?: boolean;
  outline?: boolean;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface TagProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  removable?: boolean;
  onRemove?: () => void;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface NotificationBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: 'var(--ds-color-neutral-surface-default)',
    text: 'var(--ds-color-neutral-text-default)',
    border: 'var(--ds-color-neutral-border-default)',
  },
  success: {
    bg: 'var(--ds-color-success-surface-subtle)',
    text: 'var(--ds-color-success-text-default)',
    border: 'var(--ds-color-success-border-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-subtle)',
    text: 'var(--ds-color-warning-text-default)',
    border: 'var(--ds-color-warning-border-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-subtle)',
    text: 'var(--ds-color-danger-text-default)',
    border: 'var(--ds-color-danger-border-default)',
  },
  info: {
    bg: 'var(--ds-color-info-surface-subtle)',
    text: 'var(--ds-color-info-text-default)',
    border: 'var(--ds-color-info-border-default)',
  },
  accent: {
    bg: 'var(--ds-color-accent-surface-subtle)',
    text: 'var(--ds-color-accent-text-default)',
    border: 'var(--ds-color-accent-border-default)',
  },
};

const sizeStyles: Record<BadgeSize, { padding: string; font: string; height: string }> = {
  sm: { padding: 'var(--ds-spacing-1) var(--ds-spacing-2)', font: 'var(--ds-font-size-xs)', height: 'var(--ds-sizing-5)' },
  md: { padding: 'var(--ds-spacing-1) var(--ds-spacing-3)', font: 'var(--ds-font-size-sm)', height: 'var(--ds-sizing-6)' },
  lg: { padding: 'var(--ds-spacing-2) var(--ds-spacing-4)', font: 'var(--ds-font-size-md)', height: 'var(--ds-sizing-8)' },
};

// =============================================================================
// Badge Component
// =============================================================================

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = false,
  outline = false,
  icon,
  className,
  style,
}: BadgeProps): React.ReactElement {
  const colors = variantStyles[variant];
  const sizes = sizeStyles[size];

  if (dot) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-block',
          width: 'var(--ds-sizing-2)',
          height: 'var(--ds-sizing-2)',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: colors.text,
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ds-spacing-1)',
        padding: sizes.padding,
        fontSize: sizes.font,
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 1,
        backgroundColor: outline ? 'transparent' : colors.bg,
        color: colors.text,
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: colors.border,
        borderRadius: pill ? 'var(--ds-border-radius-full)' : 'var(--ds-border-radius-sm)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

// =============================================================================
// Tag Component
// =============================================================================

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  icon,
  className,
  style,
}: TagProps): React.ReactElement {
  const colors = variantStyles[variant];
  const sizes = sizeStyles[size];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        padding: sizes.padding,
        fontSize: sizes.font,
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 1,
        backgroundColor: colors.bg,
        color: colors.text,
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: colors.border,
        borderRadius: 'var(--ds-border-radius-md)',
        ...style,
      }}
    >
      {icon}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            marginLeft: 'var(--ds-spacing-1)',
            backgroundColor: 'transparent',
            borderWidth: '0',
            cursor: 'pointer',
            color: 'inherit',
            opacity: 0.7,
          }}
        >
          <XIcon />
        </button>
      )}
    </span>
  );
}

// =============================================================================
// NotificationBadge Component
// =============================================================================

export function NotificationBadge({
  count,
  max = 99,
  showZero = false,
  dot = false,
  children,
  className,
  style,
}: NotificationBadgeProps): React.ReactElement {
  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = count > 0 || showZero;

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-flex', ...style }}>
      {children}
      {shouldShow && (
        <span
          style={{
            position: 'absolute',
            top: dot ? 'var(--ds-spacing-0)' : '-var(--ds-spacing-1)',
            right: dot ? 'var(--ds-spacing-0)' : '-var(--ds-spacing-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: dot ? 'var(--ds-sizing-2)' : 'var(--ds-sizing-5)',
            height: dot ? 'var(--ds-sizing-2)' : 'var(--ds-sizing-5)',
            padding: dot ? 0 : '0 var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-xs)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'white',
            backgroundColor: 'var(--ds-color-danger-base-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            borderWidth: 'var(--ds-border-width-lg)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-background-default)',
          }}
        >
          {!dot && displayCount}
        </span>
      )}
    </div>
  );
}

export default { Badge, Tag, NotificationBadge };
