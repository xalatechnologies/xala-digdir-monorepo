/**
 * Rental Object Header Component
 * Header section for rental object detail pages
 *
 * NOTE: This component provides a rental_object-first API while internally
 * delegating to the listings detail header. Rental objects are stored as
 * listings with type=RESOURCE in the current architecture.
 */

import type { Listing } from '@digilist/client-sdk';
import { DetailHeader } from '../../../listings/components/detail/DetailHeader';
import { useT } from '@xala/i18n';

export interface RentalObjectHeaderProps {
  /** The rental object to display */
  rentalObject: Listing;
  /** Callback when edit is successful */
  onEditSuccess?: () => void;
}

/**
 * Header component for rental object detail view
 * Displays rental object title, status, and action buttons
 */
export function RentalObjectHeader({
  rentalObject,
  onEditSuccess,
}: RentalObjectHeaderProps) {
  const t = useT();
  // Delegate to listings detail header (rental objects are RESOURCE type listings)
  return (
    <DetailHeader
      listing={rentalObject}
      onEditSuccess={onEditSuccess}
    />
  );
}
