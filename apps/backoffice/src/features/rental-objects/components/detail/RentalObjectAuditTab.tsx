/**
 * Rental Object Audit Tab Component
 * Audit/changelog tab for rental object detail pages
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings audit tab. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import { AuditTab } from '../../../listings/components/detail/AuditTab';

export interface RentalObjectAuditTabProps {
  /** The rental object ID */
  rentalObjectId: string;
}

/**
 * Audit tab for rental object detail view
 * Displays changelog and audit history for this rental object
 */
export function RentalObjectAuditTab({
  rentalObjectId,
}: RentalObjectAuditTabProps) {
  // Delegate to listings audit tab (rental objects are RESOURCE type listings)
  return <AuditTab listingId={rentalObjectId} />;
}
