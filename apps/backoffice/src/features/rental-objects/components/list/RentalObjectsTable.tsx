/**
 * Rental Objects Table Component
 * Table view for displaying rental objects
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings table component. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import type { Listing } from '@digilist/client-sdk';
import { ListingsTable } from '../../../listings/components/list/ListingsTable';
import { useT } from '@xala/i18n';

export interface RentalObjectsTableProps {
  /** Array of rental objects to display */
  rentalObjects: Listing[];
  /** Loading state */
  isLoading: boolean;
  /** Selected rental object IDs */
  selectedIds: string[];
  /** Callback when all rental objects are selected/deselected */
  onSelectAll: (selected: boolean) => void;
  /** Callback when a rental object is selected/deselected */
  onSelectOne: (id: string, selected: boolean) => void;
  /** Callback when sort is requested */
  onSort: (field: 'name' | 'updatedAt' | 'createdAt' | 'status' | undefined) => void;
  /** Current sort field */
  sortBy?: 'name' | 'updatedAt' | 'createdAt' | 'status';
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
  /** Callback when refresh is requested */
  onRefresh?: () => void;
}

/**
 * Table view for rental objects
 * Displays rental objects in a sortable table with selection support
 */
export function RentalObjectsTable({
  rentalObjects,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onSort,
  sortBy,
  sortOrder,
  onRefresh,
}: RentalObjectsTableProps) {
  const t = useT();
  // Delegate to listings table component (rental objects are RESOURCE type listings)
  return (
    <ListingsTable
      listings={rentalObjects}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectAll={onSelectAll}
      onSelectOne={onSelectOne}
      onSort={onSort}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onRefresh={onRefresh}
    />
  );
}
