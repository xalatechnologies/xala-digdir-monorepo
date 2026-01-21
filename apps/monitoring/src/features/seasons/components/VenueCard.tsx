/**
 * Venue Card Component
 *
 * Wrapper around @digilist/ui VenueCard.
 * Uses the shared domain component for consistent UI across apps.
 */

import { VenueCard as SharedVenueCard } from '@digilist/ui';
import type { RentalObject, Listing } from '@digilist/client-sdk/types';

interface VenueCardProps {
  venue: RentalObject | Listing; // Support both RentalObject (new) and Listing (backward compatibility)
  onApply?: (venueId: string) => void;
  showApplyButton?: boolean;
}

export function VenueCard({ venue, onApply, showApplyButton = true }: VenueCardProps) {
  // Map SDK RentalObject/Listing type to VenueCardData
  const venueData = {
    id: venue.id,
    name: venue.name,
    description: venue.description,
    capacity: venue.capacity,
    size: venue.size,
    address: venue.address ? {
      street: venue.address.street,
      city: venue.address.city,
    } : undefined,
    imageUrl: venue.images && venue.images.length > 0 ? venue.images[0].url : undefined,
    categories: venue.categories,
  };

  return (
    <SharedVenueCard
      venue={venueData}
      onApply={onApply}
      showApplyButton={showApplyButton}
    />
  );
}
