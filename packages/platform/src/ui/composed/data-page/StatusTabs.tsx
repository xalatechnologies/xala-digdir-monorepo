/**
 * StatusTabs Component
 * 
 * Horizontal status tabs with counts, used for filtering data by status
 * Based on pattern from apps/backoffice/src/routes/bookings.tsx
 */

import React from 'react';
import { Badge } from '@digdir/designsystemet-react';
import { cn } from '../../utils';

export interface StatusTabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label (must be translated by caller) */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Count to display in badge */
  count?: number;
  /** Color variant for active state */
  color?: 'warning' | 'success' | 'info' | 'danger' | 'neutral';
}

export interface StatusTabsProps {
  /** Array of tab configurations */
  tabs: StatusTabItem[];
  /** Currently active tab ID */
  activeTab: string;
  /** Tab change handler */
  onChange: (tabId: string) => void;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const colorMap: Record<string, string> = {
  warning: 'var(--ds-color-warning-text-default)',
  success: 'var(--ds-color-success-text-default)',
  info: 'var(--ds-color-info-text-default)',
  danger: 'var(--ds-color-danger-text-default)',
  neutral: 'var(--ds-color-neutral-text-default)',
};

const surfaceColorMap: Record<string, string> = {
  warning: 'var(--ds-color-warning-surface-default)',
  success: 'var(--ds-color-success-surface-default)',
  info: 'var(--ds-color-info-surface-default)',
  danger: 'var(--ds-color-danger-surface-default)',
  neutral: 'var(--ds-color-neutral-surface-hover)',
};

export function StatusTabs({
  tabs,
  activeTab,
  onChange,
  className,
  style,
}: StatusTabsProps): React.ReactElement {
  return (
    <div
      className={cn('status-tabs', className)}
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-1)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        paddingBottom: 'var(--ds-spacing-1)',
        overflowX: 'auto',
        ...style,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = tab.count ?? 0;
        const color = tab.color || 'neutral';
        const textColor = colorMap[color];
        const surfaceColor = surfaceColorMap[color];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-selected={isActive}
            role="tab"
            className={cn('status-tab', isActive && 'status-tab--active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              border: 'none',
              borderRadius: 'var(--ds-border-radius-md) var(--ds-border-radius-md) 0 0',
              backgroundColor: isActive ? 'var(--ds-color-neutral-surface-default)' : 'transparent',
              color: isActive ? textColor : 'var(--ds-color-neutral-text-subtle)',
              fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
              fontSize: 'var(--ds-font-size-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderBottom: isActive ? `2px solid ${textColor}` : '2px solid transparent',
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {count > 0 && (
              <span
                style={{
                  minWidth: '20px',
                  height: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  backgroundColor: isActive ? surfaceColor : 'var(--ds-color-neutral-surface-hover)',
                  color: isActive ? textColor : 'var(--ds-color-neutral-text-subtle)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  padding: '0 var(--ds-spacing-1)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
