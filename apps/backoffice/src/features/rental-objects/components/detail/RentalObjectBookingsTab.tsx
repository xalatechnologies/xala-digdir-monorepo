/**
 * Rental Object Bookings Tab Component
 * Bookings tab for rental object detail pages
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings bookings tab. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import { BookingsTab } from '../../../listings/components/detail/BookingsTab';
import { useT } from '@xala/i18n';

export interface RentalObjectBookingsTabProps {
  /** The rental object ID */
  rentalObjectId: string;
}

/**
 * Bookings tab for rental object detail view
 * Displays all bookings for this rental object
 */
export function RentalObjectBookingsTab({
  rentalObjectId,
}: RentalObjectBookingsTabProps) {
  const t = useT();
  // Delegate to listings bookings tab (rental objects are RESOURCE type listings)
  return <BookingsTab listingId={rentalObjectId} />;
}
