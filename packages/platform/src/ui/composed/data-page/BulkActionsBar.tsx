/**
 * BulkActionsBar Component
 *
 * Action bar that appears when items are selected for bulk operations
 * Generalizes pattern from apps/backoffice/src/features/rental-objects/components/list/BulkActionsBar.tsx
 */

import React from 'react';
import { Badge } from '@digdir/designsystemet-react';
import { Button } from '@digdir/designsystemet-react';
import { cn } from '../../utils';

export interface BulkAction {
  /** Action label (must be translated by caller) */
  label: string;
  /** Action handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Whether action is disabled */
  disabled?: boolean;
  /** Optional icon */
  icon?: React.ReactNode;
}

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Array of action buttons */
  actions: BulkAction[];
  /** Clear selection handler */
  onClear: () => void;
  /** Selected count label (must be translated by caller, e.g., "{{count}} valgt") */
  selectedLabel: string;
  /** Clear button label (must be translated by caller) */
  clearLabel: string;
  /** Position variant */
  position?: 'fixed' | 'inline';
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
  selectedLabel,
  clearLabel,
  position = 'fixed',
  className,
  style,
}: BulkActionsBarProps): React.ReactElement | null {
  if (selectedCount === 0) {
    return null;
  }

  const containerStyle: React.CSSProperties =
    position === 'fixed'
      ? {
          position: 'fixed',
          bottom: 'var(--ds-spacing-6)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-xl)',
          boxShadow: 'var(--ds-shadow-xl)',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-4)',
          animation: 'slideUp 0.3s ease',
        }
      : {
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-accent-border-default)',
        };

  return (
    <>
      <div className={cn('bulk-actions-bar', className)} style={{ ...containerStyle, ...style }}>
        {/* Selected Count Badge */}
        <span style={{ backgroundColor: 'var(--ds-color-info-surface-default)', color: 'var(--ds-color-info-text-default)', padding: '0.25rem 0.75rem', borderRadius: 'var(--ds-border-radius-full)', fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-medium)' }}>
          {selectedLabel.replace('{{count}}', selectedCount.toString())}
        </span>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '32px',
            backgroundColor: 'var(--ds-color-neutral-border-default)',
          }}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              type="button"
              variant={action.variant || 'secondary'}
              data-size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span style={{ marginRight: 'var(--ds-spacing-1)' }}>{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '32px',
            backgroundColor: 'var(--ds-color-neutral-border-default)',
          }}
        />

        {/* Clear Selection */}
        <Button type="button" variant="tertiary" data-size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
      </div>

      {/* Animation for fixed position */}
      {position === 'fixed' && (
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}</style>
      )}
    </>
  );
}
