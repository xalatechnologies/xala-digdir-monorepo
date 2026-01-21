/**
 * Skeleton Loading Components
 *
 * Placeholder skeletons for loading states.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/Skeleton
 */

'use client';

import React from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: string;
  lastLineWidth?: string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: string;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Animations
// =============================================================================

const pulseKeyframes = `
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

const waveKeyframes = `
@keyframes skeleton-wave {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}
`;

// =============================================================================
// Skeleton Component
// =============================================================================

export function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className,
  style,
}: SkeletonProps): React.ReactElement {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return { borderRadius: 'var(--ds-border-radius-full)' };
      case 'rectangular':
        return { borderRadius: 0 };
      case 'rounded':
        return { borderRadius: 'var(--ds-border-radius-md)' };
      case 'text':
      default:
        return { borderRadius: 'var(--ds-border-radius-sm)' };
    }
  };

  const getAnimationStyles = (): React.CSSProperties => {
    switch (animation) {
      case 'pulse':
        return { animation: 'skeleton-pulse 1.5s ease-in-out infinite' };
      case 'wave':
        return { position: 'relative', overflow: 'hidden' };
      case 'none':
      default:
        return {};
    }
  };

  return (
    <>
      <style>{pulseKeyframes}{waveKeyframes}</style>
      <span
        className={className}
        style={{
          display: 'block',
          width: width ?? '100%',
          height: height ?? (variant === 'text' ? 'var(--ds-sizing-4)' : 'var(--ds-sizing-10)'),
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          ...getVariantStyles(),
          ...getAnimationStyles(),
          ...style,
        }}
      >
        {animation === 'wave' && (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'skeleton-wave 1.5s linear infinite',
            }}
          />
        )}
      </span>
    </>
  );
}

// =============================================================================
// SkeletonText Component
// =============================================================================

export function SkeletonText({
  lines = 3,
  lineHeight = 'var(--ds-sizing-4)',
  lastLineWidth = '60%',
  animation = 'pulse',
  className,
  style,
}: SkeletonTextProps): React.ReactElement {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)', ...style }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

// =============================================================================
// SkeletonCard Component
// =============================================================================

export function SkeletonCard({
  hasImage = true,
  imageHeight = 'var(--ds-sizing-40)',
  lines = 3,
  animation = 'pulse',
  className,
  style,
}: SkeletonCardProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {hasImage && <Skeleton variant="rectangular" height={imageHeight} animation={animation} />}
      <div style={{ padding: 'var(--ds-spacing-4)' }}>
        <Skeleton variant="text" height="var(--ds-sizing-6)" width="70%" animation={animation} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
        <SkeletonText lines={lines} animation={animation} />
      </div>
    </div>
  );
}

// =============================================================================
// SkeletonTable Component
// =============================================================================

export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasHeader = true,
  animation = 'pulse',
  className,
  style,
}: SkeletonTableProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderBottomWidth: 'var(--ds-border-width-default)',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" height="var(--ds-sizing-5)" animation={animation} />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-4)',
            borderBottomWidth: rowIndex < rows - 1 ? 'var(--ds-border-width-default)' : 0,
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height="var(--ds-sizing-4)" width={colIndex === 0 ? '80%' : '60%'} animation={animation} />
          ))}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SkeletonAvatar Component
// =============================================================================

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  animation?: 'pulse' | 'wave' | 'none';
}

export function SkeletonAvatar({ size = 'md', animation = 'pulse' }: SkeletonAvatarProps): React.ReactElement {
  const sizes = { sm: 'var(--ds-sizing-8)', md: 'var(--ds-sizing-10)', lg: 'var(--ds-sizing-12)' };
  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} animation={animation} />;
}

export default { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar };
