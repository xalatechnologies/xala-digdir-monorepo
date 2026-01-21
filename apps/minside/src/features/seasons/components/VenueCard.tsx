/**
 * VenueCard Wrapper
 * Thin wrapper that maps SDK RentalObject to DS VenueCard props
 */
import { VenueCard as DSVenueCard, type VenueCardData } from '@digilist/ui';
import type { RentalObject } from '@digilist/client-sdk/types';

interface VenueCardWrapperProps {
  venue: RentalObject;
  onApply?: (id: string) => void;
  showApplyButton?: boolean;
}

function mapToVenueCardData(venue: RentalObject): VenueCardData {
  return {
    id: venue.id,
    name: venue.name,
    description: venue.description,
    capacity: venue.capacity,
    size: (venue as any).size,
    address: (venue as any).address,
    imageUrl: venue.images?.[0] ? (typeof venue.images[0] === 'string' ? venue.images[0] : (venue.images[0] as any).url) : undefined,
    categories: (venue as any).categories || (venue.category ? [venue.category] : []),
  };
}

export function VenueCard({ venue, onApply, showApplyButton = true }: VenueCardWrapperProps) {
  return <DSVenueCard venue={mapToVenueCardData(venue)} onApply={onApply} showApplyButton={showApplyButton} />;
}
