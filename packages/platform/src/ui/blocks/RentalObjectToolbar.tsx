/**
 * RentalObjectToolbar
 *
 * A toolbar component for rental object pages with filter button, count, and view toggles.
 * Uses Digdir ToggleGroup for view mode selection and standard Button patterns.
 */
import * as React from 'react';
import { cn } from '../utils';
import { Button, ToggleGroup, Tooltip, Badge } from '@digdir/designsystemet-react';
import { FilterIcon, GridIcon, ListIcon, MapIcon, TableIcon } from '../primitives';

export type ViewMode = 'grid' | 'list' | 'map' | 'table';

export interface RentalObjectToolbarProps {
  /** Total count of rental objects */
  count: number;
  /** Label for the count (e.g., "rental objects", "venues") */
  countLabel?: string;
  /** Number of active filters */
  activeFilterCount?: number;
  /** Click handler for filter button */
  onFilterClick?: () => void;
  /** Current view mode */
  viewMode?: ViewMode;
  /** View mode change handler */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Show/hide view mode toggles */
  showViewToggle?: boolean;
  /** Available view modes */
  availableViews?: ViewMode[];
  /** Custom class name */
  className?: string;
  /** Test ID for E2E testing */
  'data-testid'?: string;
}

export function RentalObjectToolbar({
  count,
  countLabel = 'resources',
  activeFilterCount = 0,
  onFilterClick,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  availableViews = ['grid', 'list', 'map', 'table'],
  className,
  'data-testid': testId = 'rental-object-toolbar',
}: RentalObjectToolbarProps): React.ReactElement {
  const viewIcons: Record<ViewMode, React.ReactNode> = {
    grid: <GridIcon size={20} aria-hidden />,
    list: <ListIcon size={20} aria-hidden />,
    map: <MapIcon size={20} aria-hidden />,
    table: <TableIcon size={20} aria-hidden />,
  };

  const viewTitles: Record<ViewMode, string> = {
    grid: 'Rutenett',
    list: 'Liste',
    map: 'Kart',
    table: 'Tabell',
  };

  const handleViewChange = (value: string) => {
    if (value && onViewModeChange) {
      onViewModeChange(value as ViewMode);
    }
  };

  return (
    <div
      className={cn('rental-object-toolbar', className)}
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--ds-spacing-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
        {onFilterClick && (
          <Button
            variant="secondary"
            type="button"
            onClick={onFilterClick}
            data-testid={`${testId}-filter-button`}
          >
            <FilterIcon size={18} aria-hidden />
            Filtre
            {activeFilterCount > 0 && (
              <Badge count={activeFilterCount} data-color="accent" />
            )}
          </Button>
        )}
        <span
          aria-live="polite"
          aria-atomic="true"
          data-testid={`${testId}-result-count`}
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {count} {countLabel}
        </span>
      </div>

      {showViewToggle && availableViews.length > 1 && (
        <ToggleGroup
          value={viewMode}
          onChange={handleViewChange}
          data-testid={`${testId}-view-toggle`}
        >
          {availableViews.map((view) => (
            <Tooltip key={view} content={viewTitles[view]}>
              <ToggleGroup.Item
                value={view}
                icon
                data-testid={`${testId}-view-${view}`}
                aria-label={viewTitles[view]}
              >
                {viewIcons[view]}
              </ToggleGroup.Item>
            </Tooltip>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}

export default RentalObjectToolbar;

