/**
 * ListToolbar Component
 *
 * A consistent toolbar for list pages combining search, filters, sort, and actions.
 * Part of the MinSide UI consistency consolidation.
 *
 * @example
 * ```tsx
 * <ListToolbar
 *   search={{ value: query, onChange: setQuery, placeholder: t('common.search') }}
 *   filters={[
 *     { id: 'status', label: t('label.status'), value: status, options: statusOptions }
 *   ]}
 *   activeFilters={{ status: 'confirmed' }}
 *   onFilterChange={(id, value) => setFilters({ ...filters, [id]: value })}
 *   resultsCount={items.length}
 *   primaryAction={<Button variant="primary">{t('action.create')}</Button>}
 * />
 * ```
 */

import * as React from 'react';
import { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { Button, Textfield } from '@digdir/designsystemet-react';
import { SearchIcon } from '../primitives/icons';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface ListToolbarFilterOption {
  /** Unique option ID */
  id: string;
  /** Display label */
  label: string;
  /** Optional count badge */
  count?: number;
}

export interface ListToolbarFilter {
  /** Unique filter ID */
  id: string;
  /** Display label */
  label: string;
  /** Current value */
  value?: string;
  /** Available options */
  options: ListToolbarFilterOption[];
}

export interface ListToolbarSearchConfig {
  /** Current search value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export interface ListToolbarSortOption {
  /** Unique option ID */
  id: string;
  /** Display label */
  label: string;
}

export interface ListToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Search configuration */
  search?: ListToolbarSearchConfig;

  /** Filter button configurations */
  filters?: ListToolbarFilter[];

  /** Currently active filter values */
  activeFilters?: Record<string, string | undefined>;

  /** Filter change handler */
  onFilterChange?: (filterId: string, value: string | undefined) => void;

  /** Sort options */
  sortOptions?: ListToolbarSortOption[];

  /** Current sort value */
  sortValue?: string;

  /** Sort change handler */
  onSortChange?: (value: string) => void;

  /** Results count to display */
  resultsCount?: number;

  /** Results label (e.g., "bookings", "items") */
  resultsLabel?: string;

  /** Primary action button slot */
  primaryAction?: React.ReactNode;

  /** Whether to show filter counts in buttons */
  showFilterCounts?: boolean;

  /** Layout variant */
  variant?: 'default' | 'compact';

  /** Test ID */
  'data-testid'?: string;
}

// =============================================================================
// Debounce Hook
// =============================================================================

function useDebouncedValue(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// ListToolbar Component
// =============================================================================

export const ListToolbar = forwardRef<HTMLDivElement, ListToolbarProps>(
  (
    {
      search,
      filters = [],
      activeFilters = {},
      onFilterChange,
      sortOptions = [],
      sortValue,
      onSortChange,
      resultsCount,
      resultsLabel = 'items',
      primaryAction,
      showFilterCounts = true,
      variant = 'default',
      className,
      'data-testid': testId = 'list-toolbar',
      ...props
    },
    ref
  ) => {
    const [localSearchValue, setLocalSearchValue] = useState(search?.value ?? '');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounced search
    const debouncedSearch = useDebouncedValue(localSearchValue, search?.debounceMs ?? 300);

    // Sync debounced value to parent
    useEffect(() => {
      if (search && debouncedSearch !== search.value) {
        search.onChange(debouncedSearch);
      }
    }, [debouncedSearch, search]);

    // Sync external value changes
    useEffect(() => {
      if (search && search.value !== localSearchValue) {
        setLocalSearchValue(search.value);
      }
    }, [search?.value]);

    const handleFilterClick = useCallback(
      (filterId: string, optionId: string) => {
        if (!onFilterChange) return;

        const currentValue = activeFilters[filterId];
        // Toggle: if same value, clear it; otherwise set new value
        const newValue = currentValue === optionId ? undefined : optionId;
        onFilterChange(filterId, newValue);
      },
      [activeFilters, onFilterChange]
    );

    const isCompact = variant === 'compact';

    return (
      <div
        ref={ref}
        className={cn('ds-list-toolbar', className)}
        data-testid={testId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isCompact ? 'var(--ds-spacing-3)' : 'var(--ds-spacing-4)',
          padding: isCompact ? 'var(--ds-spacing-3) 0' : 'var(--ds-spacing-4) 0',
        }}
        {...props}
      >
        {/* Top row: Search + Primary Action */}
        {(search || primaryAction) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--ds-spacing-3)',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            {search && (
              <div
                style={{
                  flex: '1 1 300px',
                  maxWidth: '500px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 'var(--ds-spacing-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                >
                  <SearchIcon size={18} />
                </div>
                <Textfield
                  ref={searchInputRef}
                  type="search"
                  value={localSearchValue}
                  onChange={(e) => setLocalSearchValue(e.target.value)}
                  placeholder={search.placeholder ?? 'Search...'}
                  aria-label={search.placeholder ?? 'Search'}
                  data-testid={`${testId}-search`}
                  style={{
                    paddingLeft: 'var(--ds-spacing-9)',
                    width: '100%',
                  }}
                />
              </div>
            )}

            {/* Spacer */}
            <div style={{ flex: '1 1 auto' }} />

            {/* Primary Action */}
            {primaryAction && (
              <div data-testid={`${testId}-primary-action`}>{primaryAction}</div>
            )}
          </div>
        )}

        {/* Filter row */}
        {filters.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--ds-spacing-2)',
              alignItems: 'center',
            }}
            data-testid={`${testId}-filters`}
          >
            {filters.map((filter) => (
              <div
                key={filter.id}
                style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-1)',
                  flexWrap: 'wrap',
                }}
              >
                {filter.options.map((option) => {
                  const isActive = activeFilters[filter.id] === option.id;
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={isActive ? 'primary' : 'tertiary'}
                      data-size="sm"
                      onClick={() => handleFilterClick(filter.id, option.id)}
                      data-testid={`${testId}-filter-${filter.id}-${option.id}`}
                      style={{
                        minHeight: '44px', // WCAG touch target
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {option.label}
                      {showFilterCounts && option.count !== undefined && (
                        <span
                          style={{
                            marginLeft: 'var(--ds-spacing-1)',
                            opacity: 0.75,
                          }}
                        >
                          ({option.count})
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            ))}

            {/* Sort dropdown */}
            {sortOptions.length > 0 && onSortChange && (
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Sort:
                </span>
                <select
                  value={sortValue ?? ''}
                  onChange={(e) => onSortChange(e.target.value)}
                  data-testid={`${testId}-sort`}
                  style={{
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    minHeight: '44px',
                  }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Results count row */}
        {resultsCount !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
            data-testid={`${testId}-results-count`}
          >
            <span
              style={{
                fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {resultsCount}
            </span>
            {resultsLabel}
          </div>
        )}
      </div>
    );
  }
);

ListToolbar.displayName = 'ListToolbar';

export default ListToolbar;
