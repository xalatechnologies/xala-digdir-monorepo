/**
 * StatsGrid Component
 *
 * Dashboard metrics grid with rich stat cards.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/StatsGrid
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  href?: string;
  onClick?: () => void;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface StatCardEnhancedProps {
  stat: StatItem;
  loading?: boolean;
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
// Color Styles
// =============================================================================

const colorStyles = {
  default: {
    icon: 'var(--ds-color-neutral-text-subtle)',
    iconBg: 'var(--ds-color-neutral-surface-subtle)',
  },
  success: {
    icon: 'var(--ds-color-success-text-default)',
    iconBg: 'var(--ds-color-success-surface-subtle)',
  },
  warning: {
    icon: 'var(--ds-color-warning-text-default)',
    iconBg: 'var(--ds-color-warning-surface-subtle)',
  },
  danger: {
    icon: 'var(--ds-color-danger-text-default)',
    iconBg: 'var(--ds-color-danger-surface-subtle)',
  },
  info: {
    icon: 'var(--ds-color-info-text-default)',
    iconBg: 'var(--ds-color-info-surface-subtle)',
  },
};

// =============================================================================
// StatCardEnhanced Component
// =============================================================================

export function StatCardEnhanced({ stat, loading = false }: StatCardEnhancedProps): React.ReactElement {
  const colors = colorStyles[stat.color || 'default'];
  const isClickable = !!stat.onClick || !!stat.href;

  const content = (
    <div
      onClick={stat.onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--ds-spacing-3)' }}>
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {stat.label}
        </span>
        {stat.icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--ds-sizing-10)',
              height: 'var(--ds-sizing-10)',
              backgroundColor: colors.iconBg,
              borderRadius: 'var(--ds-border-radius-md)',
              color: colors.icon,
            }}
          >
            {stat.icon}
          </div>
        )}
      </div>

      {loading ? (
        <div
          style={{
            height: 'var(--ds-sizing-10)',
            width: '60%',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: 'var(--ds-font-size-heading-lg)',
            fontWeight: 'var(--ds-font-weight-bold)',
            color: 'var(--ds-color-neutral-text-default)',
            lineHeight: 1.2,
          }}
        >
          {stat.value}
        </div>
      )}

      {(stat.change !== undefined || stat.changeLabel) && !loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            marginTop: 'var(--ds-spacing-2)',
          }}
        >
          {stat.trend && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color:
                  stat.trend === 'up'
                    ? 'var(--ds-color-success-text-default)'
                    : stat.trend === 'down'
                    ? 'var(--ds-color-danger-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {stat.trend === 'up' && <TrendUpIcon />}
              {stat.trend === 'down' && <TrendDownIcon />}
              {stat.trend === 'neutral' && <TrendNeutralIcon />}
            </span>
          )}
          {stat.change !== undefined && (
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color:
                  stat.trend === 'up'
                    ? 'var(--ds-color-success-text-default)'
                    : stat.trend === 'down'
                    ? 'var(--ds-color-danger-text-default)'
                    : 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {stat.change > 0 ? '+' : ''}
              {stat.change}%
            </span>
          )}
          {stat.changeLabel && (
            <span
              style={{
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {stat.changeLabel}
            </span>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );

  if (stat.href) {
    return (
      <a href={stat.href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </a>
    );
  }

  return content;
}

// =============================================================================
// StatsGrid Component
// =============================================================================

export function StatsGrid({
  stats,
  columns = 4,
  loading = false,
  className,
  style,
}: StatsGridProps): React.ReactElement {
  const gridColumns = {
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    5: 'repeat(5, 1fr)',
    6: 'repeat(6, 1fr)',
  }[columns];

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: 'var(--ds-spacing-4)',
        ...style,
      }}
    >
      {stats.map((stat) => (
        <StatCardEnhanced key={stat.id} stat={stat} loading={loading} />
      ))}
    </div>
  );
}

// =============================================================================
// MiniStat Component
// =============================================================================

export interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: TrendDirection;
  change?: number;
}

export function MiniStat({ label, value, icon, trend, change }: MiniStatProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-3)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
      }}
    >
      {icon && (
        <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-lg)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {value}
        </div>
      </div>
      {trend && change !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            color:
              trend === 'up'
                ? 'var(--ds-color-success-text-default)'
                : trend === 'down'
                ? 'var(--ds-color-danger-text-default)'
                : 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {trend === 'up' && <TrendUpIcon />}
          {trend === 'down' && <TrendDownIcon />}
          <span style={{ fontSize: 'var(--ds-font-size-xs)', fontWeight: 'var(--ds-font-weight-medium)' }}>
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        </div>
      )}
    </div>
  );
}

export default { StatsGrid, StatCardEnhanced, MiniStat };
