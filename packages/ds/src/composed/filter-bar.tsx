/**
 * Filter Bar Component
 * 
 * Horizontal filter bar following DIGILIST patterns
 */

import React, { forwardRef } from 'react';
import { Select, Button } from '@digdir/designsystemet-react';
import { Grid } from '../primitives';
import { FilterIcon, GridIcon, ListIcon, MapIcon } from '../primitives/icons';

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Filter options
   */
  filters?: Array<{
    name: string;
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
  }>;
  
  /**
   * Results count
   */
  resultsCount?: number;
  
  /**
   * Results label
   */
  resultsLabel?: string;
  
  /**
   * View mode
   */
  viewMode?: 'grid' | 'list' | 'map';
  
  /**
   * On view mode change
   */
  onViewModeChange?: (mode: 'grid' | 'list' | 'map') => void;
  
  /**
   * Spacing between filters
   * @default 16
   */
  spacing?: number;
}

export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  ({
    filters = [],
    resultsCount,
    resultsLabel = 'lokaler',
    viewMode = 'grid',
    onViewModeChange,
    spacing = 16,
    className,
    style,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          padding: '24px 0',
          borderBottom: '1px solid var(--ds-colors-border-default)',
          ...style
        }}
        {...props}
      >
        <Grid
          columns="repeat(auto-fit, minmax(200px, 1fr))"
          gap={spacing}
          style={{ alignItems: 'center' }}
        >
          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.name}>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                {filter.label}
              </div>
              <Select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                style={{ width: '100%' }}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}

          {/* Results count and view toggle */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gridColumn: '1 / -1'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              {resultsCount !== undefined && (
                <>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'var(--ds-colors-text-default)'
                  }}>
                    "{resultsCount}"
                  </span>
                  <span style={{
                    fontSize: '16px',
                    color: 'var(--ds-colors-text-subtle)'
                  }}>
                    {resultsLabel}
                  </span>
                </>
              )}
              <span style={{
                fontSize: '14px',
                color: 'var(--ds-colors-text-subtle)',
                marginLeft: '16px'
              }}>
                Rutenett visning
              </span>
            </div>

            {/* View mode buttons */}
            {onViewModeChange && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('grid')}
                  style={{ height: '40px', width: '40px', padding: 0 }}
                  title="Grid view"
                >
                  <GridIcon size={20} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('list')}
                  style={{ height: '40px', width: '40px', padding: 0 }}
                  title="List view"
                >
                  <ListIcon size={20} />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'primary' : 'tertiary'}
                  onClick={() => onViewModeChange('map')}
                  style={{ height: '40px', width: '40px', padding: 0 }}
                  title="Map view"
                >
                  <MapIcon size={20} />
                </Button>
              </div>
            )}
          </div>
        </Grid>
      </div>
    );
  }
);

FilterBar.displayName = 'FilterBar';
