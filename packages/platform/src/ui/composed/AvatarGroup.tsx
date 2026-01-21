/**
 * AvatarGroup Component
 *
 * Stack of avatars with overflow indicator.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/AvatarGroup
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarItemProps {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  icon?: ReactNode;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  style?: React.CSSProperties;
}

export interface AvatarGroupProps {
  items: AvatarItemProps[];
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Size & Spacing Styles
// =============================================================================

const sizeStyles: Record<AvatarSize, { size: string; font: string; status: string }> = {
  xs: { size: 'var(--ds-sizing-6)', font: 'var(--ds-font-size-xs)', status: 'var(--ds-sizing-2)' },
  sm: { size: 'var(--ds-sizing-8)', font: 'var(--ds-font-size-sm)', status: 'var(--ds-sizing-2)' },
  md: { size: 'var(--ds-sizing-10)', font: 'var(--ds-font-size-md)', status: 'var(--ds-sizing-3)' },
  lg: { size: 'var(--ds-sizing-12)', font: 'var(--ds-font-size-lg)', status: 'var(--ds-sizing-3)' },
  xl: { size: 'var(--ds-sizing-16)', font: 'var(--ds-font-size-xl)', status: 'var(--ds-sizing-4)' },
};

const spacingStyles: Record<string, string> = {
  tight: '-0.75rem',
  normal: '-0.5rem',
  loose: '-0.25rem',
};

const statusColors: Record<string, string> = {
  online: 'var(--ds-color-success-base-default)',
  offline: 'var(--ds-color-neutral-text-subtle)',
  away: 'var(--ds-color-warning-base-default)',
  busy: 'var(--ds-color-danger-base-default)',
};

const avatarColors = [
  { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' },
  { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' },
  { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' },
  { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
  { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
];

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];
  if (parts.length === 1 && firstPart) return firstPart.charAt(0).toUpperCase();
  if (firstPart && lastPart) return (firstPart.charAt(0) + lastPart.charAt(0)).toUpperCase();
  return '?';
}

function getColorFromName(name?: string): { bg: string; text: string } {
  const defaultColor = avatarColors[0] ?? { bg: 'var(--ds-color-accent-surface-default)', text: 'var(--ds-color-accent-text-default)' };
  if (!name) return defaultColor;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length] ?? defaultColor;
}

// =============================================================================
// AvatarItem Component
// =============================================================================

export function AvatarItem({
  src,
  alt,
  name,
  initials,
  icon,
  size = 'md',
  status,
  className,
  style,
}: AvatarItemProps): React.ReactElement {
  const styles = sizeStyles[size];
  const colors = getColorFromName(name);
  const displayInitials = initials || getInitials(name);
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: styles.size,
        height: styles.size,
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: styles.font,
        fontWeight: 'var(--ds-font-weight-medium)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : icon ? (
        icon
      ) : (
        <span>{displayInitials}</span>
      )}

      {status && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: styles.status,
            height: styles.status,
            backgroundColor: statusColors[status],
            borderRadius: 'var(--ds-border-radius-full)',
            borderWidth: 'var(--ds-border-width-lg)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-background-default)',
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// AvatarGroup Component
// =============================================================================

export function AvatarGroup({
  items,
  max = 5,
  size = 'md',
  spacing = 'normal',
  className,
  style,
}: AvatarGroupProps): React.ReactElement {
  const styles = sizeStyles[size];
  const visibleItems = items.slice(0, max);
  const remainingCount = items.length - max;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {visibleItems.map((item, index) => (
        <div
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : spacingStyles[spacing],
            zIndex: visibleItems.length - index,
          }}
        >
          <AvatarItem
            {...item}
            size={size}
            style={{
              borderWidth: 'var(--ds-border-width-lg)',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-neutral-background-default)',
              ...item.style,
            }}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: spacingStyles[spacing],
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: styles.size,
            height: styles.size,
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            color: 'var(--ds-color-neutral-text-default)',
            fontSize: styles.font,
            fontWeight: 'var(--ds-font-weight-medium)',
            borderWidth: 'var(--ds-border-width-lg)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-background-default)',
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default { AvatarItem, AvatarGroup };
