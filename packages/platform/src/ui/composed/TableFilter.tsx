/**
 * TableFilter Component
 *
 * A reusable filter bar for data tables with search, dropdown filters, and quick filters.
 * Designed with Digdir Designsystemet tokens.
 *
 * Features:
 * - Search input with debounce
 * - Dropdown filters (single and multi-select)
 * - Quick filter chips
 * - Filter state management
 * - Responsive design
 */

import * as React from 'react';
import { useState, useCallback, useEffect, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  /** Unique filter ID */
  id: string;
  /** Filter label */
  label: string;
  /** Filter type */
  type: 'search' | 'select' | 'multiselect' | 'chips';
  /** Available options for select/multiselect/chips */
  options?: FilterOption[];
  /** Placeholder text */
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | string[] | undefined;
}

export interface TableFilterProps {
  /** Filter configurations */
  filters: FilterConfig[];
  /** Current filter values */
  values: FilterValues;
  /** Filter change handler */
  onChange: (values: FilterValues) => void;
  /** Search debounce delay in ms */
  debounceMs?: number;
  /** Show clear all button */
  showClearAll?: boolean;
  /** ARIA label */
  ariaLabel?: string;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// FilterInput Component
// =============================================================================

interface FilterInputProps {
  config: FilterConfig;
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  debounceMs?: number;
}

function FilterInput({ config, value, onChange, debounceMs = 300 }: FilterInputProps) {
  const [localValue, setLocalValue] = useState(value as string || '');

  // Debounce search input
  useEffect(() => {
    if (config.type !== 'search') return;

    const timer = setTimeout(() => {
      onChange(localValue || undefined);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, config.type, debounceMs, onChange]);

  // Sync localValue with external value
  useEffect(() => {
    if (config.type === 'search') {
      setLocalValue(value as string || '');
    }
  }, [value, config.type]);

  if (config.type === 'search') {
    return (
      <div
        style={{
          position: 'relative',
          minWidth: '200px',
          flex: '1 1 200px',
          maxWidth: '400px',
        }}
      >
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={config.placeholder || `Søk...`}
          aria-label={config.label}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            paddingLeft: 'var(--ds-spacing-10)',
            fontSize: 'var(--ds-font-size-sm)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            color: 'var(--ds-color-neutral-text-default)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--ds-color-accent-border-default)';
            e.target.style.boxShadow = '0 0 0 3px var(--ds-color-focus-outer)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--ds-color-neutral-border-default)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <svg
          style={{
            position: 'absolute',
            left: 'var(--ds-spacing-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: 'var(--ds-color-neutral-text-subtle)',
            pointerEvents: 'none',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
        </svg>
      </div>
    );
  }

  if (config.type === 'select') {
    return (
      <select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        aria-label={config.label}
        style={{
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          paddingRight: 'var(--ds-spacing-8)',
          fontSize: 'var(--ds-font-size-sm)',
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          color: 'var(--ds-color-neutral-text-default)',
          cursor: 'pointer',
          minWidth: '150px',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right var(--ds-spacing-2) center',
          backgroundSize: '16px',
        }}
      >
        <option value="">{config.placeholder || config.label}</option>
        {config.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
            {opt.count !== undefined ? ` (${opt.count})` : ''}
          </option>
        ))}
      </select>
    );
  }

  if (config.type === 'chips') {
    const selectedValues = (value as string[]) || [];

    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          flexWrap: 'wrap',
        }}
        role="group"
        aria-label={config.label}
      >
        {config.options?.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                const newValues = isSelected
                  ? selectedValues.filter((v) => v !== opt.value)
                  : [...selectedValues, opt.value];
                onChange(newValues.length > 0 ? newValues : undefined);
              }}
              aria-pressed={isSelected}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                border: isSelected
                  ? '1px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-surface-default)',
                color: isSelected
                  ? 'var(--ds-color-accent-text-default)'
                  : 'var(--ds-color-neutral-text-default)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span
                  style={{
                    fontSize: 'var(--ds-font-size-xs)',
                    opacity: 0.7,
                  }}
                >
                  ({opt.count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

// =============================================================================
// TableFilter Component
// =============================================================================

export function TableFilter({
  filters,
  values,
  onChange,
  debounceMs = 300,
  showClearAll = true,
  ariaLabel = 'Tabellfiltre',
  className,
}: TableFilterProps) {
  const handleFilterChange = useCallback(
    (filterId: string, value: string | string[] | undefined) => {
      onChange({
        ...values,
        [filterId]: value,
      });
    },
    [values, onChange]
  );

  const handleClearAll = useCallback(() => {
    onChange({});
  }, [onChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(values).filter(
      (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')
    ).length;
  }, [values]);

  // Separate search filters from other filters
  const searchFilters = filters.filter((f) => f.type === 'search');
  const otherFilters = filters.filter((f) => f.type !== 'search');

  return (
    <div
      className={className}
      role="search"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        marginBottom: 'var(--ds-spacing-4)',
      }}
    >
      {/* Top row: Search and Clear */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        {searchFilters.map((filter) => (
          <FilterInput
            key={filter.id}
            config={filter}
            value={values[filter.id]}
            onChange={(v) => handleFilterChange(filter.id, v)}
            debounceMs={debounceMs}
          />
        ))}

        {/* Select filters */}
        {otherFilters
          .filter((f) => f.type === 'select' || f.type === 'multiselect')
          .map((filter) => (
            <FilterInput
              key={filter.id}
              config={filter}
              value={values[filter.id]}
              onChange={(v) => handleFilterChange(filter.id, v)}
            />
          ))}

        {/* Clear all button */}
        {showClearAll && activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-danger-text-default)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              marginLeft: 'auto',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Fjern alle ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Chip filters */}
      {otherFilters
        .filter((f) => f.type === 'chips')
        .map((filter) => (
          <div key={filter.id}>
            <div
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              {filter.label}
            </div>
            <FilterInput
              config={filter}
              value={values[filter.id]}
              onChange={(v) => handleFilterChange(filter.id, v)}
            />
          </div>
        ))}
    </div>
  );
}

export default TableFilter;
