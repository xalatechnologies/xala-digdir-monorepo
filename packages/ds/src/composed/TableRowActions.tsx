/**
 * TableRowActions Component
 *
 * Reusable dropdown menu for table row actions.
 * Provides consistent view, edit, delete, and custom actions.
 *
 * SSR-safe: No browser APIs used at module level.
 * Hydration-safe: Client-side interactions only.
 *
 * @module @xala/ds/composed/TableRowActions
 */

'use client';

import React, { useState, useRef, useEffect, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type ActionVariant = 'default' | 'danger' | 'success' | 'warning';

export interface RowAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: ActionVariant;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

export interface TableRowActionsProps {
  actions: RowAction[];
  triggerLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function MoreVerticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<ActionVariant, { color: string; hoverBg: string }> = {
  default: {
    color: 'var(--ds-color-neutral-text-default)',
    hoverBg: 'var(--ds-color-neutral-surface-hover)',
  },
  danger: {
    color: 'var(--ds-color-danger-text-default)',
    hoverBg: 'var(--ds-color-danger-surface-subtle)',
  },
  success: {
    color: 'var(--ds-color-success-text-default)',
    hoverBg: 'var(--ds-color-success-surface-subtle)',
  },
  warning: {
    color: 'var(--ds-color-warning-text-default)',
    hoverBg: 'var(--ds-color-warning-surface-subtle)',
  },
};

// =============================================================================
// TableRowActions Component
// =============================================================================

export function TableRowActions({
  actions,
  triggerLabel = 'Actions',
  className,
  style,
}: TableRowActionsProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter((action) => !action.hidden);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => 
          prev < visibleActions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => 
          prev > 0 ? prev - 1 : visibleActions.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0) {
          const action = visibleActions[focusedIndex];
          if (action && !action.disabled) {
            action.onClick();
            setIsOpen(false);
          }
        }
        break;
    }
  };

  const handleActionClick = (action: RowAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  if (visibleActions.length === 0) {
    return <></>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-2)',
          backgroundColor: 'transparent',
          borderWidth: '0',
          borderStyle: 'none',
          borderRadius: 'var(--ds-border-radius-md)',
          cursor: 'pointer',
          color: 'var(--ds-color-neutral-text-default)',
          transition: 'background-color 0.15s ease',
        }}
      >
        <MoreVerticalIcon />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 'var(--ds-spacing-1)',
            minWidth: 'var(--ds-sizing-40)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            boxShadow: 'var(--ds-shadow-lg)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {visibleActions.map((action, index) => {
            const variantStyle = variantStyles[action.variant || 'default'];
            const isFocused = index === focusedIndex;

            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => handleActionClick(action)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  width: '100%',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  fontSize: 'var(--ds-font-size-sm)',
                  textAlign: 'left',
                  backgroundColor: isFocused ? variantStyle.hoverBg : 'transparent',
                  color: action.disabled
                    ? 'var(--ds-color-neutral-text-subtle)'
                    : variantStyle.color,
                  borderWidth: '0',
                  borderStyle: 'none',
                  cursor: action.disabled ? 'not-allowed' : 'pointer',
                  opacity: action.disabled ? 0.5 : 1,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {action.icon && (
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Preset Action Builders
// =============================================================================

export function createViewAction(onView: () => void): RowAction {
  return {
    id: 'view',
    label: 'View',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    onClick: onView,
  };
}

export function createEditAction(onEdit: () => void): RowAction {
  return {
    id: 'edit',
    label: 'Edit',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    onClick: onEdit,
  };
}

export function createDeleteAction(onDelete: () => void, disabled?: boolean): RowAction {
  return {
    id: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    onClick: onDelete,
    disabled,
  };
}

export function createDuplicateAction(onDuplicate: () => void): RowAction {
  return {
    id: 'duplicate',
    label: 'Duplicate',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    onClick: onDuplicate,
  };
}

export default TableRowActions;
