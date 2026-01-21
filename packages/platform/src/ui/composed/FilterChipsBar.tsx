/**
 * FilterChipsBar Component
 *
 * Displays active filters as removable chips in a horizontal bar.
 * Inspired by modern data table filter UIs.
 *
 * Features:
 * - Active filter chips with dismiss button
 * - "+ Add Filter" button
 * - Clear all option
 * - Overflow handling
 *
 * @module @xalatechnologies/platform/ui/composed/FilterChipsBar
 */

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface ActiveFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
  displayValue?: string;
}

export interface FilterChipsBarProps {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  onAddFilter?: () => void;
  addFilterLabel?: string;
  clearAllLabel?: string;
  showClearAll?: boolean;
  maxVisible?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// =============================================================================
// Helper to format operator for display
// =============================================================================

function formatOperator(operator: string): string {
  const operatorMap: Record<string, string> = {
    equals: '=',
    not_equals: '≠',
    contains: 'contains',
    not_contains: 'does not contain',
    starts_with: 'starts with',
    ends_with: 'ends with',
    greater_than: '>',
    less_than: '<',
    greater_or_equal: '≥',
    less_or_equal: '≤',
    is: 'is',
    is_not: 'is not',
    before: 'before',
    after: 'after',
    between: 'between',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    larger_than: 'larger than',
  };
  return operatorMap[operator] || operator;
}

// =============================================================================
// FilterChip Component
// =============================================================================

interface FilterChipProps {
  filter: ActiveFilter;
  onRemove: () => void;
}

function FilterChip({ filter, onRemove }: FilterChipProps) {
  const displayValue = filter.displayValue || filter.value;
  const operatorDisplay = formatOperator(filter.operator);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
        paddingRight: 'var(--ds-spacing-1)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-full)',
        fontSize: 'var(--ds-font-size-sm)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
        {filter.field}
      </span>
      <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        {operatorDisplay}
      </span>
      {displayValue && !['is_empty', 'is_not_empty'].includes(filter.operator) && (
        <span style={{ color: 'var(--ds-color-accent-text-default)', fontWeight: 'var(--ds-font-weight-medium)' }}>
          {displayValue}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${filter.field} filter`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-1)',
          marginLeft: 'var(--ds-spacing-1)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ds-color-neutral-text-subtle)',
          borderRadius: 'var(--ds-border-radius-full)',
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// =============================================================================
// FilterChipsBar Component
// =============================================================================

export function FilterChipsBar({
  filters,
  onRemove,
  onClearAll,
  onAddFilter,
  addFilterLabel = 'Add Filter',
  clearAllLabel = 'Clear all',
  showClearAll = true,
  maxVisible,
  className,
  style,
}: FilterChipsBarProps): React.ReactElement | null {
  if (filters.length === 0 && !onAddFilter) return null;

  const visibleFilters = maxVisible ? filters.slice(0, maxVisible) : filters;
  const hiddenCount = maxVisible ? Math.max(0, filters.length - maxVisible) : 0;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-2)',
        ...style,
      }}
    >
      {filters.length > 0 && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
            marginRight: 'var(--ds-spacing-1)',
          }}
        >
          Filters:
        </span>
      )}

      {visibleFilters.map((filter) => (
        <FilterChip key={filter.id} filter={filter} onRemove={() => onRemove(filter.id)} />
      ))}

      {hiddenCount > 0 && (
        <span
          style={{
            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-full)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          +{hiddenCount}
        </span>
      )}

      {onAddFilter && (
        <button
          type="button"
          onClick={onAddFilter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
            backgroundColor: 'transparent',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'dashed',
            borderColor: 'var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <PlusIcon />
          {addFilterLabel}
        </button>
      )}

      {showClearAll && filters.length > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          style={{
            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-danger-text-default)',
            cursor: 'pointer',
            marginLeft: 'var(--ds-spacing-2)',
          }}
        >
          {clearAllLabel}
        </button>
      )}
    </div>
  );
}

export default FilterChipsBar;
