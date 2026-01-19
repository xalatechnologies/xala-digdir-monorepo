/**
 * DataTable Components
 *
 * Reusable table components with proper design tokens, sorting, filtering, and accessibility.
 * Built on top of Digdir Designsystemet patterns.
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Responsive design with horizontal scroll
 * - Keyboard navigation support
 * - Design token compliance
 * - WCAG 2.1 Level A accessibility
 */

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export type SortDirection = 'asc' | 'desc' | 'none';

export interface ColumnDef<T> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  header: React.ReactNode;
  /** Access the value from the row data */
  accessorKey?: keyof T;
  /** Custom accessor function */
  accessorFn?: (row: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Fixed width */
  width?: string | number;
  /** Custom cell renderer */
  cell?: (value: T[keyof T] | undefined, row: T) => React.ReactNode;
  /** Hide on mobile screens */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Unique row key accessor */
  getRowKey: (row: T) => string;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Sort change handler */
  onSort?: (column: string, direction: SortDirection) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Custom row styles */
  rowClassName?: (row: T) => string | undefined;
  /** Table ARIA label */
  ariaLabel?: string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Custom table class */
  className?: string;
  /** Table height */
  height?: string | number;
}

// =============================================================================
// TableHeader Component
// =============================================================================

interface TableHeaderCellProps {
  column: ColumnDef<unknown>;
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
}

function TableHeaderCell({
  column,
  sortColumn,
  sortDirection = 'none',
  onSort,
}: TableHeaderCellProps) {
  const isCurrentSort = sortColumn === column.id;

  const handleSort = useCallback(() => {
    if (!column.sortable || !onSort) return;

    let newDirection: SortDirection;
    if (!isCurrentSort) {
      newDirection = 'asc';
    } else if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else {
      newDirection = 'asc';
    }

    onSort(column.id, newDirection);
  }, [column.id, column.sortable, isCurrentSort, onSort, sortDirection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && column.sortable) {
        e.preventDefault();
        handleSort();
      }
    },
    [column.sortable, handleSort]
  );

  const getSortIndicator = () => {
    if (!column.sortable) return null;

    if (!isCurrentSort) {
      return (
        <span
          style={{
            opacity: 0.4,
            fontSize: 'var(--ds-font-size-sm)',
            marginLeft: 'var(--ds-spacing-1)',
          }}
        >
          ⇅
        </span>
      );
    }

    return (
      <span
        style={{
          fontSize: 'var(--ds-font-size-sm)',
          marginLeft: 'var(--ds-spacing-1)',
          color: 'var(--ds-color-accent-text-default)',
        }}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <th
      scope="col"
      style={{
        padding: 'var(--ds-spacing-4)',
        textAlign: column.align || 'left',
        fontWeight: 'var(--ds-font-weight-semibold)',
        color: 'var(--ds-color-neutral-text-default)',
        backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
        borderBottom: '2px solid var(--ds-color-neutral-border-default)',
        cursor: column.sortable ? 'pointer' : 'default',
        userSelect: column.sortable ? 'none' : undefined,
        width: column.width,
        whiteSpace: 'nowrap',
      }}
      onClick={column.sortable ? handleSort : undefined}
      onKeyDown={column.sortable ? handleKeyDown : undefined}
      tabIndex={column.sortable ? 0 : undefined}
      aria-sort={
        column.sortable
          ? isCurrentSort
            ? sortDirection === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
          : undefined
      }
      className={column.hideOnMobile ? 'hide-on-mobile' : undefined}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          justifyContent:
            column.align === 'right'
              ? 'flex-end'
              : column.align === 'center'
              ? 'center'
              : 'flex-start',
        }}
      >
        {column.header}
        {getSortIndicator()}
      </div>
    </th>
  );
}

// =============================================================================
// DataTable Component
// =============================================================================

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  sortColumn,
  sortDirection,
  onSort,
  isLoading = false,
  emptyMessage = 'Ingen data å vise',
  onRowClick,
  rowClassName,
  ariaLabel = 'Datatabell',
  stickyHeader = true,
  className,
  height,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState<number>(-1);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, row: T) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          if (onRowClick) {
            e.preventDefault();
            onRowClick(row);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (index < data.length - 1) {
            setFocusedRow(index + 1);
            const nextRow = document.querySelector(
              `[data-row-index="${index + 1}"]`
            ) as HTMLElement;
            nextRow?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (index > 0) {
            setFocusedRow(index - 1);
            const prevRow = document.querySelector(
              `[data-row-index="${index - 1}"]`
            ) as HTMLElement;
            prevRow?.focus();
          }
          break;
      }
    },
    [data.length, onRowClick]
  );

  // Get cell value
  const getCellValue = useCallback((row: T, column: ColumnDef<T>): React.ReactNode => {
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      const val = row[column.accessorKey];
      // Return primitive values as ReactNode
      if (val === null || val === undefined) return null;
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        return String(val);
      }
      return null;
    }
    return null;
  }, []);

  // Render cell
  const renderCell = useCallback(
    (row: T, column: ColumnDef<T>): React.ReactNode => {
      if (column.cell) {
        const rawValue = column.accessorKey ? row[column.accessorKey] : undefined;
        return column.cell(rawValue, row);
      }

      return getCellValue(row, column);
    },
    [getCellValue]
  );

  // Loading spinner
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--ds-color-neutral-border-default)',
            borderTopColor: 'var(--ds-color-accent-base-default)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
          role="status"
          aria-label="Laster..."
        />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          color: 'var(--ds-color-neutral-text-subtle)',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <div
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          <thead>
            <tr
              style={
                stickyHeader
                  ? {
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.id}
                  column={column as ColumnDef<unknown>}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const rowKey = getRowKey(row);
              const isHovered = hoveredRow === rowKey;
              const isFocused = focusedRow === index;
              const customClass = rowClassName?.(row);

              return (
                <tr
                  key={rowKey}
                  data-row-index={index}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  aria-label={onRowClick ? 'Klikk for å åpne' : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick ? (e) => handleKeyDown(e, index, row) : undefined
                  }
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onFocus={() => setFocusedRow(index)}
                  onBlur={() => setFocusedRow(-1)}
                  className={customClass}
                  style={{
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor: isFocused
                      ? 'var(--ds-color-accent-surface-default)'
                      : isHovered
                      ? 'var(--ds-color-neutral-surface-hover)'
                      : 'var(--ds-color-neutral-surface-default)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        textAlign: column.align || 'left',
                        color: 'var(--ds-color-neutral-text-default)',
                      }}
                      className={column.hideOnMobile ? 'hide-on-mobile' : undefined}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive and accessibility styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none;
          }
        }

        tr[role="button"]:focus {
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: -3px;
        }

        tr[role="button"]:focus-visible {
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: -3px;
        }

        @media (prefers-reduced-motion: reduce) {
          tr {
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          tr[role="button"]:focus {
            outline-width: 4px;
          }
        }
      `}</style>
    </div>
  );
}

export default DataTable;
