/**
 * Rental Object Availability Tab Component
 * Availability tab for rental object detail pages
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings availability tab. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import { AvailabilityTab } from '../../../listings/components/detail/AvailabilityTab';

export interface RentalObjectAvailabilityTabProps {
  /** The rental object ID */
  rentalObjectId: string;
  /** The rental object name */
  rentalObjectName: string;
}

/**
 * Availability tab for rental object detail view
 * Displays and manages availability rules for this rental object
 */
export function RentalObjectAvailabilityTab({
  rentalObjectId,
  rentalObjectName,
}: RentalObjectAvailabilityTabProps) {
  // Delegate to listings availability tab (rental objects are RESOURCE type listings)
  return (
    <AvailabilityTab
      listingId={rentalObjectId}
      listingName={rentalObjectName}
    />
  );
}
