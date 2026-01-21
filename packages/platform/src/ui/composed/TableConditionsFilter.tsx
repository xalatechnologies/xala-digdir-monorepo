/**
 * TableConditionsFilter Component
 *
 * An advanced table filter builder with condition rows.
 * Supports multiple conditions with AND/OR logic, field selection,
 * operators, and dynamic value inputs.
 *
 * Inspired by modern data table filter UIs.
 *
 * @module @xalatechnologies/platform/ui/composed/TableConditionsFilter
 */

import React, { useState, useCallback, useMemo, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'is'
  | 'is_not'
  | 'before'
  | 'after'
  | 'between';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';
export type LogicOperator = 'and' | 'or';

export interface ConditionFieldOption {
  value: string;
  label: string;
}

export interface ConditionField {
  id: string;
  label: string;
  type: FieldType;
  options?: ConditionFieldOption[];
}

export interface Condition {
  id: string;
  logic: LogicOperator;
  fieldId: string;
  operator: ConditionOperator;
  value: string;
  value2?: string;
}

export interface TableConditionsFilterProps {
  title?: string;
  subtitle?: string;
  fields: ConditionField[];
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  onApply: () => void;
  onClose?: () => void;
  maxConditions?: number;
  showLogicOperator?: boolean;
  applyButtonText?: string;
  addConditionText?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Constants
// =============================================================================

const TEXT_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const NUMBER_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'greater_or_equal', label: 'Greater or equal' },
  { value: 'less_or_equal', label: 'Less or equal' },
  { value: 'between', label: 'Between' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const DATE_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'is', label: 'Is' },
  { value: 'is_not', label: 'Is not' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const SELECT_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'is', label: 'Is' },
  { value: 'is_not', label: 'Is not' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

const BOOLEAN_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'is', label: 'Is' },
];

const DATE_PRESETS: { value: string; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_year', label: 'This year' },
];

function getOperatorsForType(type: FieldType) {
  switch (type) {
    case 'number':
      return NUMBER_OPERATORS;
    case 'date':
      return DATE_OPERATORS;
    case 'select':
      return SELECT_OPERATORS;
    case 'boolean':
      return BOOLEAN_OPERATORS;
    default:
      return TEXT_OPERATORS;
  }
}

// =============================================================================
// Icons
// =============================================================================

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// =============================================================================
// Utility: Generate unique ID
// =============================================================================

let conditionId = 0;
function generateId(): string {
  return `condition-${++conditionId}-${Date.now()}`;
}

// =============================================================================
// ConditionRow Component
// =============================================================================

interface ConditionRowProps {
  condition: Condition;
  fields: ConditionField[];
  isFirst: boolean;
  showLogicOperator: boolean;
  onChange: (updated: Condition) => void;
  onRemove: () => void;
}

function ConditionRow({
  condition,
  fields,
  isFirst,
  showLogicOperator,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const field = fields.find((f) => f.id === condition.fieldId);
  const operators = field ? getOperatorsForType(field.type) : TEXT_OPERATORS;
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  const needsSecondValue = condition.operator === 'between';

  const selectStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-border-default)',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    color: 'var(--ds-color-neutral-text-default)',
    minWidth: '120px',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    fontSize: 'var(--ds-font-size-sm)',
    border: '1px solid var(--ds-color-neutral-border-default)',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    color: 'var(--ds-color-neutral-text-default)',
    flex: 1,
    minWidth: '120px',
  };

  const renderValueInput = () => {
    if (!needsValue) return null;

    if (field?.type === 'select' && field.options) {
      return (
        <select
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          style={selectStyle}
        >
          <option value="">Select...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field?.type === 'date') {
      return (
        <select
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          style={selectStyle}
        >
          <option value="">Select...</option>
          {DATE_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      );
    }

    if (field?.type === 'boolean') {
      return (
        <select
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          style={selectStyle}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    return (
      <>
        <input
          type={field?.type === 'number' ? 'number' : 'text'}
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Enter value..."
          style={inputStyle}
        />
        {needsSecondValue && (
          <>
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>and</span>
            <input
              type={field?.type === 'number' ? 'number' : 'text'}
              value={condition.value2 || ''}
              onChange={(e) => onChange({ ...condition, value2: e.target.value })}
              placeholder="Enter value..."
              style={inputStyle}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-3) 0',
      }}
    >
      <div
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          cursor: 'grab',
          flexShrink: 0,
        }}
        title="Drag to reorder"
      >
        <GripIcon />
      </div>

      {showLogicOperator && (
        <div style={{ width: '70px', flexShrink: 0 }}>
          {isFirst ? (
            <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Where
            </span>
          ) : (
            <select
              value={condition.logic}
              onChange={(e) => onChange({ ...condition, logic: e.target.value as LogicOperator })}
              style={{ ...selectStyle, width: '70px', minWidth: '70px' }}
            >
              <option value="and">and</option>
              <option value="or">or</option>
            </select>
          )}
        </div>
      )}

      <select
        value={condition.fieldId}
        onChange={(e) => {
          const selectedField = fields.find((f) => f.id === e.target.value);
          const operators = getOperatorsForType(selectedField?.type || 'text');
          onChange({
            ...condition,
            fieldId: e.target.value,
            operator: operators[0]?.value ?? 'contains',
            value: '',
            value2: undefined,
          });
        }}
        style={selectStyle}
      >
        <option value="">Select field...</option>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}
        style={selectStyle}
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {renderValueInput()}

      <button
        type="button"
        onClick={onRemove}
        title="Remove condition"
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
// TableConditionsFilter Component
// =============================================================================

export function TableConditionsFilter({
  title = 'Customize table',
  subtitle = 'Select and add conditions',
  fields,
  conditions,
  onChange,
  onApply,
  onClose,
  maxConditions = 10,
  showLogicOperator = true,
  applyButtonText = 'Apply',
  addConditionText = 'Add conditions',
  className,
  style,
}: TableConditionsFilterProps): React.ReactElement {
  const handleAddCondition = useCallback(() => {
    if (conditions.length >= maxConditions) return;

    const defaultField = fields[0];
    const operators = getOperatorsForType(defaultField?.type || 'text');
    const defaultOperator = operators[0];

    const newCondition: Condition = {
      id: generateId(),
      logic: 'and',
      fieldId: defaultField?.id || '',
      operator: defaultOperator?.value ?? 'contains',
      value: '',
    };

    onChange([...conditions, newCondition]);
  }, [conditions, fields, maxConditions, onChange]);

  const handleUpdateCondition = useCallback(
    (id: string, updated: Condition) => {
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

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        boxShadow: 'var(--ds-shadow-lg)',
        minWidth: '500px',
        maxWidth: '800px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {onClose && (
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
        )}
      </div>

      <div style={{ padding: 'var(--ds-spacing-4) var(--ds-spacing-5)' }}>
        {conditions.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
              fontSize: 'var(--ds-font-size-sm)',
              padding: 'var(--ds-spacing-4)',
            }}
          >
            No conditions added yet. Click "{addConditionText}" to start filtering.
          </p>
        ) : (
          <div>
            {conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                fields={fields}
                isFirst={index === 0}
                showLogicOperator={showLogicOperator}
                onChange={(updated) => handleUpdateCondition(condition.id, updated)}
                onRemove={() => handleRemoveCondition(condition.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={handleAddCondition}
          disabled={conditions.length >= maxConditions}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-accent-text-default)',
            background: 'transparent',
            border: 'none',
            cursor: conditions.length >= maxConditions ? 'not-allowed' : 'pointer',
            opacity: conditions.length >= maxConditions ? 0.5 : 1,
          }}
        >
          <PlusIcon />
          {addConditionText}
        </button>

        <button
          type="button"
          onClick={onApply}
          style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
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
      </div>
    </div>
  );
}

// =============================================================================
// Hook for managing conditions state
// =============================================================================

export interface UseTableConditionsReturn {
  conditions: Condition[];
  setConditions: React.Dispatch<React.SetStateAction<Condition[]>>;
  addCondition: (fieldId?: string) => void;
  removeCondition: (id: string) => void;
  updateCondition: (id: string, updates: Partial<Condition>) => void;
  clearConditions: () => void;
  buildQueryParams: () => Record<string, string>;
}

export function useTableConditions(initialConditions: Condition[] = []): UseTableConditionsReturn {
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  const addCondition = useCallback((fieldId?: string) => {
    const newCondition: Condition = {
      id: generateId(),
      logic: 'and',
      fieldId: fieldId || '',
      operator: 'contains',
      value: '',
    };
    setConditions((prev) => [...prev, newCondition]);
  }, []);

  const removeCondition = useCallback((id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCondition = useCallback((id: string, updates: Partial<Condition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const clearConditions = useCallback(() => {
    setConditions([]);
  }, []);

  const buildQueryParams = useCallback(() => {
    const params: Record<string, string> = {};
    conditions.forEach((c, index) => {
      if (c.fieldId && c.value) {
        params[`filter[${index}][field]`] = c.fieldId;
        params[`filter[${index}][operator]`] = c.operator;
        params[`filter[${index}][value]`] = c.value;
        if (c.value2) {
          params[`filter[${index}][value2]`] = c.value2;
        }
        if (index > 0) {
          params[`filter[${index}][logic]`] = c.logic;
        }
      }
    });
    return params;
  }, [conditions]);

  return {
    conditions,
    setConditions,
    addCondition,
    removeCondition,
    updateCondition,
    clearConditions,
    buildQueryParams,
  };
}

export default TableConditionsFilter;
