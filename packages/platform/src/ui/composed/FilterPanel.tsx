/**
 * FilterPanel Component
 *
 * A dropdown/popover filter panel with condition builder.
 * Matches the design pattern from modern data table UIs.
 *
 * Features:
 * - Column, Operator, Values headers
 * - Loading/generating states with progress indicator
 * - Where/AND/OR logic operators
 * - Cancel button
 * - Dropdown positioning
 *
 * @module @xalatechnologies/platform/ui/composed/FilterPanel
 */

import React, { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// =============================================================================
// Types
// =============================================================================

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'larger_than'
  | 'is'
  | 'is_not'
  | 'is_empty'
  | 'is_not_empty';

export type FilterFieldType = 'text' | 'number' | 'select' | 'date';
export type FilterLogic = 'where' | 'and' | 'or';

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  icon?: ReactNode;
  options?: FilterFieldOption[];
}

export interface FilterCondition {
  id: string;
  logic: FilterLogic;
  fieldId: string;
  operator: FilterOperator;
  value: string;
  isLoading?: boolean;
  loadingText?: string;
  loadingDuration?: string;
}

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FilterField[];
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
  onApply?: () => void;
  onCancel?: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
  title?: string;
  showApplyButton?: boolean;
  applyButtonText?: string;
  cancelButtonText?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Constants
// =============================================================================

const TEXT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const NUMBER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'larger_than', label: 'Larger than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const SELECT_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'is', label: 'Is' },
  { value: 'is_not', label: 'Is not' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

function getOperatorsForType(type: FilterFieldType) {
  switch (type) {
    case 'number':
      return NUMBER_OPERATORS;
    case 'select':
      return SELECT_OPERATORS;
    default:
      return TEXT_OPERATORS;
  }
}

// =============================================================================
// Icons
// =============================================================================

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  );
}

function getFieldIcon(type: FilterFieldType) {
  switch (type) {
    case 'number':
      return <HashIcon />;
    default:
      return <TextIcon />;
  }
}

// =============================================================================
// LoadingIndicator
// =============================================================================

function LoadingIndicator({ text, duration }: { text?: string; duration?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-3)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
      }}
    >
      <div
        style={{
          width: 'var(--ds-sizing-2)',
          height: 'var(--ds-sizing-2)',
          backgroundColor: 'var(--ds-color-success-base-default)',
          borderRadius: '50%',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}>
        {text || 'Generating filter'}
      </span>
      {duration && (
        <span
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-success-text-default)',
          }}
        >
          <span
            style={{
              width: 'var(--ds-sizing-1-5)',
              height: 'var(--ds-sizing-1-5)',
              backgroundColor: 'var(--ds-color-success-base-default)',
              borderRadius: '50%',
            }}
          />
          Running {duration}
        </span>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// =============================================================================
// ConditionRow
// =============================================================================

interface ConditionRowProps {
  condition: FilterCondition;
  fields: FilterField[];
  isFirst: boolean;
  onChange: (updated: FilterCondition) => void;
  onRemove: () => void;
}

function ConditionRow({ condition, fields, isFirst, onChange, onRemove }: ConditionRowProps) {
  const field = fields.find((f) => f.id === condition.fieldId);
  const operators = field ? getOperatorsForType(field.type) : TEXT_OPERATORS;
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);

  const selectStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-sm)',
    borderWidth: 'var(--ds-border-width-default)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-neutral-border-default)',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    color: 'var(--ds-color-neutral-text-default)',
    minWidth: 'var(--ds-sizing-25)',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-sm)',
    borderWidth: 'var(--ds-border-width-default)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-neutral-border-default)',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    color: 'var(--ds-color-neutral-text-default)',
    flex: 1,
    minWidth: 'var(--ds-sizing-20)',
  };

  if (condition.isLoading) {
    return <LoadingIndicator text={condition.loadingText} duration={condition.loadingDuration} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        padding: 'var(--ds-spacing-2) 0',
      }}
    >
      <div style={{ width: 'var(--ds-sizing-15)', flexShrink: 0 }}>
        {isFirst ? (
          <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Where
          </span>
        ) : (
          <select
            value={condition.logic}
            onChange={(e) => onChange({ ...condition, logic: e.target.value as FilterLogic })}
            style={{ ...selectStyle, width: 'var(--ds-sizing-15)', minWidth: 'var(--ds-sizing-15)' }}
          >
            <option value="and">AND</option>
            <option value="or">OR</option>
          </select>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', minWidth: 'var(--ds-sizing-30)' }}>
        {field && (
          <span style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex', alignItems: 'center' }}>
            {field.icon || getFieldIcon(field.type)}
          </span>
        )}
        <select
          value={condition.fieldId}
          onChange={(e) => {
            const selectedField = fields.find((f) => f.id === e.target.value);
            const ops = getOperatorsForType(selectedField?.type || 'text');
            onChange({
              ...condition,
              fieldId: e.target.value,
              operator: ops[0]?.value ?? 'contains',
              value: '',
            });
          }}
          style={selectStyle}
        >
          <option value="">Select...</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as FilterOperator })}
        style={{ ...selectStyle, minWidth: 'var(--ds-sizing-27)' }}
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {needsValue && (
        field?.type === 'select' && field.options ? (
          <select
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            style={{ ...selectStyle, flex: 1 }}
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field?.type === 'number' ? 'number' : 'text'}
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Value..."
            style={inputStyle}
          />
        )
      )}

      <button
        type="button"
        onClick={onRemove}
        title="Remove filter"
        style={{
          flexShrink: 0,
          padding: 'var(--ds-spacing-2)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ds-color-neutral-text-subtle)',
          borderRadius: 'var(--ds-border-radius-sm)',
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// =============================================================================
// FilterPanel Component
// =============================================================================

let filterId = 0;
function generateId(): string {
  return `filter-${++filterId}-${Date.now()}`;
}

export function FilterPanel({
  isOpen,
  onClose,
  fields,
  conditions,
  onChange,
  onApply,
  onCancel,
  anchorRef,
  title = 'Add filters',
  showApplyButton = false,
  applyButtonText = 'Apply',
  cancelButtonText = 'Cancel',
  className,
  style,
}: FilterPanelProps): React.ReactElement | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && 
          anchorRef?.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleAddCondition = useCallback(() => {
    const defaultField = fields[0];
    const operators = getOperatorsForType(defaultField?.type || 'text');
    const newCondition: FilterCondition = {
      id: generateId(),
      logic: conditions.length === 0 ? 'where' : 'and',
      fieldId: defaultField?.id || '',
      operator: operators[0]?.value ?? 'contains',
      value: '',
    };
    onChange([...conditions, newCondition]);
  }, [conditions, fields, onChange]);

  const handleUpdateCondition = useCallback(
    (id: string, updated: FilterCondition) => {
      onChange(conditions.map((c) => (c.id === id ? updated : c)));
    },
    [conditions, onChange]
  );

  const handleRemoveCondition = useCallback(
    (id: string) => {
      onChange(conditions.filter((c) => c.id !== id));
    },
    [conditions, onChange]
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose();
  }, [onCancel, onClose]);

  if (!isOpen) return null;

  const panelContent = (
    <div
      ref={panelRef}
      className={className}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        boxShadow: 'var(--ds-shadow-lg)',
        minWidth: 'var(--ds-sizing-125)',
        maxWidth: 'var(--ds-sizing-175)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          borderBottomWidth: 'var(--ds-border-width-default)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
        }}
      >
        <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            padding: 'var(--ds-spacing-1)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <CloseIcon />
        </button>
      </div>

      <div style={{ padding: 'var(--ds-spacing-3) var(--ds-spacing-4)' }}>
        {conditions.length === 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'var(--ds-sizing-15) 1fr 1fr 1fr auto',
              gap: 'var(--ds-spacing-2)',
              paddingBottom: 'var(--ds-spacing-2)',
              borderBottomWidth: 'var(--ds-border-width-default)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}></span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Column</span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Operator</span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Values</span>
            <span style={{ width: 'var(--ds-sizing-8)' }}></span>
          </div>
        )}

        {conditions.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'var(--ds-sizing-15) 1fr 1fr 1fr auto',
              gap: 'var(--ds-spacing-2)',
              paddingBottom: 'var(--ds-spacing-2)',
              borderBottomWidth: 'var(--ds-border-width-default)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}></span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Column</span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Operator</span>
            <span style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>Values</span>
            <span style={{ width: 'var(--ds-sizing-8)' }}></span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
          {conditions.map((condition, index) => (
            <ConditionRow
              key={condition.id}
              condition={condition}
              fields={fields}
              isFirst={index === 0}
              onChange={(updated) => handleUpdateCondition(condition.id, updated)}
              onRemove={() => handleRemoveCondition(condition.id)}
            />
          ))}
        </div>

        {conditions.length === 0 && (
          <p style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
            No filters added. Click below to add a filter.
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          borderTopWidth: 'var(--ds-border-width-default)',
          borderTopStyle: 'solid',
          borderTopColor: 'var(--ds-color-neutral-border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={handleAddCondition}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-accent-text-default)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Add filter
        </button>

        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-danger-text-default)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ⊗ {cancelButtonText}
          </button>

          {showApplyButton && onApply && (
            <button
              type="button"
              onClick={onApply}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'white',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
              }}
            >
              {applyButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(panelContent, document.body);
}

export default FilterPanel;
