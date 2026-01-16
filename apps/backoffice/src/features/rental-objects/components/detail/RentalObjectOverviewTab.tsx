/**
 * Rental Object Overview Tab Component
 * Overview tab for rental object detail pages
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings overview tab. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import type { Listing } from '@digilist/client-sdk';
import { OverviewTab } from '../../../listings/components/detail/OverviewTab';
import { useT } from '@xala/i18n';

export interface RentalObjectOverviewTabProps {
  /** The rental object to display */
  rentalObject: Listing;
}

/**
 * Overview tab for rental object detail view
 * Displays rental object details, images, description, facilities, etc.
 */
export function RentalObjectOverviewTab({
  rentalObject,
}: RentalObjectOverviewTabProps) {
  const t = useT();
  // Delegate to listings overview tab (rental objects are RESOURCE type listings)
  return <OverviewTab listing={rentalObject} />;
}
