/**
 * StatCard Component
 *
 * Consistent stat/metric cards for dashboards.
 * Displays a value with label, optional trend indicator, and icon.
 *
 * @module @xalatechnologies/platform/ui/composed/StatCard
 */

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type StatTrend = 'up' | 'down' | 'neutral';
export type StatVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    direction: StatTrend;
    value: string;
    label?: string;
  };
  variant?: StatVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function TrendUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

function TrendNeutralIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// =============================================================================
// Skeleton Loader
// =============================================================================

function StatSkeleton({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const valueHeight = size === 'sm' ? 'var(--ds-sizing-6)' : size === 'lg' ? 'var(--ds-sizing-10)' : 'var(--ds-sizing-8)';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      <div
        style={{
          height: 'var(--ds-sizing-3-5)',
          width: '60%',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: valueHeight,
          width: '80%',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<StatVariant, { iconBg: string; iconColor: string }> = {
  default: {
    iconBg: 'var(--ds-color-neutral-surface-hover)',
    iconColor: 'var(--ds-color-neutral-text-default)',
  },
  success: {
    iconBg: 'var(--ds-color-success-surface-default)',
    iconColor: 'var(--ds-color-success-text-default)',
  },
  warning: {
    iconBg: 'var(--ds-color-warning-surface-default)',
    iconColor: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    iconBg: 'var(--ds-color-danger-surface-default)',
    iconColor: 'var(--ds-color-danger-text-default)',
  },
  info: {
    iconBg: 'var(--ds-color-info-surface-default)',
    iconColor: 'var(--ds-color-info-text-default)',
  },
};

const trendColors: Record<StatTrend, string> = {
  up: 'var(--ds-color-success-text-default)',
  down: 'var(--ds-color-danger-text-default)',
  neutral: 'var(--ds-color-neutral-text-subtle)',
};

const sizeStyles = {
  sm: {
    padding: 'var(--ds-spacing-3)',
    labelSize: 'var(--ds-font-size-xs)',
    valueSize: 'var(--ds-font-size-lg)',
    iconSize: 'var(--ds-sizing-8)',
    trendSize: 'var(--ds-font-size-xs)',
  },
  md: {
    padding: 'var(--ds-spacing-4)',
    labelSize: 'var(--ds-font-size-sm)',
    valueSize: 'var(--ds-font-size-xl)',
    iconSize: 'var(--ds-sizing-10)',
    trendSize: 'var(--ds-font-size-sm)',
  },
  lg: {
    padding: 'var(--ds-spacing-5)',
    labelSize: 'var(--ds-font-size-md)',
    valueSize: 'var(--ds-font-size-2xl)',
    iconSize: 'var(--ds-sizing-12)',
    trendSize: 'var(--ds-font-size-sm)',
  },
};

// =============================================================================
// StatCard Component
// =============================================================================

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  loading = false,
  onClick,
  className,
  style,
}: StatCardProps): React.ReactElement {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const TrendIcon = trend?.direction === 'up' 
    ? TrendUpIcon 
    : trend?.direction === 'down' 
    ? TrendDownIcon 
    : TrendNeutralIcon;

  return (
    <div
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: sizeStyle.padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {loading ? (
        <StatSkeleton size={size} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: sizeStyle.labelSize,
                color: 'var(--ds-color-neutral-text-subtle)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              {label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: sizeStyle.valueSize,
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
                lineHeight: 1.2,
              }}
            >
              {value}
            </p>
            {trend && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  marginTop: 'var(--ds-spacing-2)',
                }}
              >
                <span style={{ color: trendColors[trend.direction], display: 'flex', alignItems: 'center' }}>
                  <TrendIcon />
                </span>
                <span
                  style={{
                    fontSize: sizeStyle.trendSize,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: trendColors[trend.direction],
                  }}
                >
                  {trend.value}
                </span>
                {trend.label && (
                  <span
                    style={{
                      fontSize: sizeStyle.trendSize,
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              style={{
                width: sizeStyle.iconSize,
                height: sizeStyle.iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: variantStyle.iconBg,
                color: variantStyle.iconColor,
                borderRadius: 'var(--ds-border-radius-md)',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// StatCardGrid - Helper for consistent grid layout
// =============================================================================

export interface StatCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function StatCardGrid({
  children,
  columns = 4,
  gap = 'md',
  className,
  style,
}: StatCardGridProps): React.ReactElement {
  const gapSize = gap === 'sm' ? 'var(--ds-spacing-3)' : gap === 'lg' ? 'var(--ds-spacing-6)' : 'var(--ds-spacing-4)';

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapSize,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default StatCard;
