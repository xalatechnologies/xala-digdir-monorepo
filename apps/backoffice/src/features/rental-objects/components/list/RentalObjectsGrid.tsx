/**
 * Rental Objects Grid Component
 * Grid view for displaying rental objects
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings grid component. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import type { Listing } from '@digilist/client-sdk';
import { ListingsGrid } from '../../../listings/components/list/ListingsGrid';
import { useT } from '@xala/i18n';

export interface RentalObjectsGridProps {
  /** Array of rental objects to display */
  rentalObjects: Listing[];
  /** Loading state */
  isLoading: boolean;
  /** Selected rental object IDs */
  selectedIds: string[];
  /** Callback when a rental object is selected/deselected */
  onSelectOne: (id: string, selected: boolean) => void;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
}

/**
 * Grid view for rental objects
 * Displays rental objects in a card grid layout with selection support
 */
export function RentalObjectsGrid({
  rentalObjects,
  isLoading,
  selectedIds,
  onSelectOne,
  onRefresh,
}: RentalObjectsGridProps) {
  const t = useT();
  // Delegate to listings grid component (rental objects are RESOURCE type listings)
  return (
    <ListingsGrid
      listings={rentalObjects}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectOne={onSelectOne}
      onRefresh={onRefresh}
    />
  );
}
