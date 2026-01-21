/**
 * DataPageToolbar Component
 * 
 * Combines search, filters, and view mode toggle
 * Consolidates common toolbar patterns
 */

import React from 'react';
import { GridIcon, ListIcon, MapIcon, TableIcon } from '../../primitives';
import { Button } from '@digdir/designsystemet-react';
import { HeaderSearch } from '../header-parts';
import { cn } from '../../utils';

export type ViewMode = 'grid' | 'list' | 'map' | 'table';

export interface FilterConfig {
  /** Filter label (must be translated by caller) */
  label: string;
  /** Filter value */
  value: string;
  /** Filter change handler */
  onChange: (value: string) => void;
  /** Available filter options */
  options: Array<{ value: string; label: string }>;
}

export interface DataPageToolbarProps {
  /** Current search value */
  searchValue: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Search submit handler */
  onSearch?: (value: string) => void;
  /** Search placeholder (must be translated by caller) */
  searchPlaceholder?: string;
  /** Search width */
  searchWidth?: string;
  /** Filter configurations */
  filters?: FilterConfig[];
  /** Current view mode */
  viewMode?: ViewMode;
  /** View mode change handler */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Available view modes */
  availableViews?: ViewMode[];
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const viewModeIcons: Record<ViewMode, React.ReactNode> = {
  grid: <GridIcon />,
  list: <ListIcon />,
  map: <MapIcon />,
  table: <TableIcon />,
};

export function DataPageToolbar({
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder,
  searchWidth = '350px',
  filters,
  viewMode,
  onViewModeChange,
  availableViews = ['grid', 'list'],
  className,
  style,
}: DataPageToolbarProps): React.ReactElement {
  return (
    <div
      className={cn('data-page-toolbar', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {/* Search */}
      <HeaderSearch
        placeholder={searchPlaceholder}
        value={searchValue}
        onSearchChange={onSearchChange}
        onSearch={onSearch}
        width={searchWidth}
      />

      {/* Filters */}
      {filters?.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-sm)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            color: 'var(--ds-color-neutral-text-default)',
            cursor: 'pointer',
          }}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* View Mode Toggle */}
      {viewMode && onViewModeChange && availableViews.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-1)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            padding: 'var(--ds-spacing-1)',
          }}
        >
          {availableViews.map((mode) => {
            const isActive = viewMode === mode;
            return (
              <Button
                key={mode}
                type="button"
                variant={isActive ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => onViewModeChange(mode)}
                aria-label={`Switch to ${mode} view`}
                style={{
                  minWidth: 'auto',
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                }}
              >
                {viewModeIcons[mode]}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
