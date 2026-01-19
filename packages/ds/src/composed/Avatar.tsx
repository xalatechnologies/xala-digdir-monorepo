/**
 * Avatar Component
 *
 * Consistent user avatar display with fallback initials.
 * Supports different sizes and online status indicator.
 * Uses only design tokens - no raw CSS values.
 *
 * @module @xala/ds/composed/Avatar
 */

import React from 'react';
import { AVATAR_COLOR_PALETTE } from '../tokens/extended';

// =============================================================================
// Types
// =============================================================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Size Styles - Using Design Tokens
// =============================================================================

const sizeStyles: Record<AvatarSize, { dimension: string; fontSize: string; statusSize: string; overlap: string }> = {
  xs: { 
    dimension: 'var(--ds-sizing-6)', 
    fontSize: 'var(--ds-font-size-xs)', 
    statusSize: 'var(--ds-sizing-2)',
    overlap: 'var(--ds-spacing-2)',
  },
  sm: { 
    dimension: 'var(--ds-sizing-8)', 
    fontSize: 'var(--ds-font-size-sm)', 
    statusSize: 'var(--ds-sizing-2-5)',
    overlap: 'var(--ds-spacing-2)',
  },
  md: { 
    dimension: 'var(--ds-sizing-10)', 
    fontSize: 'var(--ds-font-size-md)', 
    statusSize: 'var(--ds-sizing-3)',
    overlap: 'var(--ds-spacing-2)',
  },
  lg: { 
    dimension: 'var(--ds-sizing-14)', 
    fontSize: 'var(--ds-font-size-lg)', 
    statusSize: 'var(--ds-sizing-3-5)',
    overlap: 'var(--ds-spacing-3)',
  },
  xl: { 
    dimension: 'var(--ds-sizing-20)', 
    fontSize: 'var(--ds-font-size-xl)', 
    statusSize: 'var(--ds-sizing-4)',
    overlap: 'var(--ds-spacing-3)',
  },
};

// =============================================================================
// Helpers
// =============================================================================

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const first = parts[0];
    return first ? first.substring(0, 2).toUpperCase() : '?';
  }
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];
  const firstChar = firstPart?.[0] ?? '';
  const lastChar = lastPart?.[0] ?? '';
  return (firstChar + lastChar).toUpperCase() || '?';
}

const DEFAULT_COLOR = 'var(--ds-color-accent-base-default)';

function getColorFromName(name: string): string {
  if (!name) return DEFAULT_COLOR;
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLOR_PALETTE[Math.abs(hash) % AVATAR_COLOR_PALETTE.length] ?? DEFAULT_COLOR;
}

// =============================================================================
// Avatar Component
// =============================================================================

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  showStatus = false,
  isOnline = false,
  className,
  style,
}: AvatarProps): React.ReactElement {
  const [imgError, setImgError] = React.useState(false);
  const sizeStyle = sizeStyles[size];
  const showImage = src && !imgError;
  const initials = getInitials(name || alt || '');
  const bgColor = getColorFromName(name || alt || '');

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeStyle.dimension,
        height: sizeStyle.dimension,
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: showImage ? 'transparent' : bgColor,
        color: 'white',
        fontSize: sizeStyle.fontSize,
        fontWeight: 'var(--ds-font-weight-medium)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {showImage ? (
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
      ) : (
        <span>{initials}</span>
      )}
      
      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: sizeStyle.statusSize,
            height: sizeStyle.statusSize,
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: isOnline 
              ? 'var(--ds-color-success-base-default)' 
              : 'var(--ds-color-neutral-surface-hover)',
            border: '2px solid var(--ds-color-neutral-background-default)',
          }}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

// =============================================================================
// AvatarGroup Component
// =============================================================================

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
  style,
}: AvatarGroupProps): React.ReactElement {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? `calc(-1 * ${sizeStyle.overlap})` : 0,
            position: 'relative',
            zIndex: visibleChildren.length - index,
          }}
        >
          {React.isValidElement(child) 
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
            : child
          }
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: `calc(-1 * ${sizeStyle.overlap})`,
            width: sizeStyle.dimension,
            height: sizeStyle.dimension,
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            color: 'var(--ds-color-neutral-text-default)',
            fontSize: sizeStyle.fontSize,
            fontWeight: 'var(--ds-font-weight-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 'var(--ds-border-width-default)',
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

// =============================================================================
// UserInfo Component - Avatar with name and subtitle
// =============================================================================

export interface UserInfoProps {
  name: string;
  subtitle?: string;
  src?: string | null;
  size?: AvatarSize;
  showStatus?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function UserInfo({
  name,
  subtitle,
  src,
  size = 'md',
  showStatus,
  isOnline,
  onClick,
  className,
  style,
}: UserInfoProps): React.ReactElement {
  const sizeStyle = sizeStyles[size];
  const textSize = size === 'xs' || size === 'sm' ? 'var(--ds-font-size-xs)' : 'var(--ds-font-size-sm)';

  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <Avatar
        src={src}
        name={name}
        size={size}
        showStatus={showStatus}
        isOnline={isOnline}
      />
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: sizeStyle.fontSize,
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </p>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: textSize,
              color: 'var(--ds-color-neutral-text-subtle)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default Avatar;
