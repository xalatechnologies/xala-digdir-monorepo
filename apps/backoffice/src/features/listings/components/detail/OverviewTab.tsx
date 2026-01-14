/**
 * OverviewTab
 *
 * Overview tab for listing detail view displaying images, description, and key information.
 * First tab in the listing detail view providing administrators with a comprehensive overview.
 */
import * as React from 'react';
import { ImageGallery, KeyFactsRow, FacilityChips, OpeningHoursCard, LocationCard, ContactInfoCard } from '@xala/ds';
import type { Listing } from '@digilist/client-sdk';
import type { GalleryImage, KeyFact, Facility, OpeningHoursDay } from '@xala/ds';
import { getListingTypeLabel } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

export interface OverviewTabProps {
  /** Listing data from SDK */
  listing: Listing;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map listing status to Norwegian display labels
 */
const STATUS_LABELS: Record<string, string> = {
  published: 'Publisert',
  draft: 'Utkast',
  archived: 'Arkivert',
  maintenance: 'Vedlikehold',
};

/**
 * Transform SDK image URLs to GalleryImage format
 */
function transformImagesToGallery(images: string[], listingName: string): GalleryImage[] {
  return images.map((url, index) => ({
    id: `${index}-${url}`,
    src: url,
    alt: `${listingName} - Bilde ${index + 1}`,
    thumbnail: url, // Use same URL for thumbnail (can be optimized later)
  }));
}

/**
 * Build key facts array from listing data
 */
function buildKeyFacts(listing: Listing): KeyFact[] {
  const facts: KeyFact[] = [];

  // Add capacity if available
  if (listing.capacity) {
    facts.push({
      type: 'capacity',
      label: 'Kapasitet',
      value: `${listing.capacity} personer`,
    });
  }

  // Add listing type
  facts.push({
    type: 'custom',
    label: 'Type',
    value: getListingTypeLabel(listing.type),
  });

  // Add status
  facts.push({
    type: 'custom',
    label: 'Status',
    value: STATUS_LABELS[listing.status] || listing.status,
  });

  return facts;
}

/**
 * Transform SDK facilities/amenities array to Facility format
 */
function transformFacilities(facilities: string[] = [], amenities: string[] = []): Facility[] {
  // Combine facilities and amenities, remove duplicates
  const allFacilities = [...new Set([...facilities, ...amenities])];

  return allFacilities.map((label, index) => ({
    id: `facility-${index}`,
    label,
  }));
}

/**
 * Transform SDK opening hours to OpeningHoursDay format
 */
function transformOpeningHours(
  openingHours?: Record<string, { open: string; close: string }>
): OpeningHoursDay[] {
  if (!openingHours) {
    return [];
  }

  const daysOrder = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
  const result: OpeningHoursDay[] = [];

  // Convert object to array and sort by day order
  Object.entries(openingHours).forEach(([day, times]) => {
    const hours = times.open && times.close ? `${times.open} - ${times.close}` : 'Stengt';
    const isClosed = !times.open || !times.close;

    result.push({
      day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize first letter
      hours,
      isClosed,
    });
  });

  // Sort by day order
  result.sort((a, b) => {
    const aIndex = daysOrder.findIndex(d => a.day.toLowerCase().startsWith(d));
    const bIndex = daysOrder.findIndex(d => b.day.toLowerCase().startsWith(d));
    return aIndex - bIndex;
  });

  return result;
}

// =============================================================================
// Component
// =============================================================================

export function OverviewTab({ listing }: OverviewTabProps): React.ReactElement {
  // Transform images to gallery format
  const galleryImages = React.useMemo(
    () => transformImagesToGallery(listing.images || [], listing.name),
    [listing.images, listing.name]
  );

  // Build key facts
  const keyFacts = React.useMemo(
    () => buildKeyFacts(listing),
    [listing]
  );

  // Transform facilities and amenities
  const facilities = React.useMemo(
    () => transformFacilities(listing.metadata?.facilities, listing.metadata?.amenities),
    [listing.metadata?.facilities, listing.metadata?.amenities]
  );

  // Transform opening hours
  const openingHours = React.useMemo(
    () => transformOpeningHours(listing.metadata?.openingHours),
    [listing.metadata?.openingHours]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-6)',
      }}
    >
      {/* Image Gallery Section */}
      <section>
        <ImageGallery
          images={galleryImages}
          showCounter
          height={500}
          maxThumbnails={4}
        />
      </section>

      {/* Key Facts Section */}
      <section>
        <KeyFactsRow facts={keyFacts} variant="default" />
      </section>

      {/* Description Section */}
      {listing.description && (
        <section>
          <h2
            style={{
              fontSize: 'var(--ds-font-size-lg)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              margin: '0 0 var(--ds-spacing-3) 0',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Beskrivelse
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-base)',
              lineHeight: 'var(--ds-line-height-relaxed)',
              color: 'var(--ds-color-neutral-text-subtle)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {listing.description}
          </p>
        </section>
      )}

      {/* Facilities and Amenities Section */}
      {facilities.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: 'var(--ds-font-size-lg)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              margin: '0 0 var(--ds-spacing-4) 0',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Fasiliteter
          </h2>
          <FacilityChips facilities={facilities} />
        </section>
      )}

      {/* Opening Hours Section */}
      {openingHours.length > 0 && (
        <section>
          <OpeningHoursCard hours={openingHours} highlightToday />
        </section>
      )}

      {/* Location and Contact Information Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Location Section */}
        {listing.address && (
          <LocationCard
            address={listing.address}
            latitude={listing.location?.latitude}
            longitude={listing.location?.longitude}
            mapboxToken={import.meta.env.VITE_MAPBOX_TOKEN}
            height={250}
            title="Lokasjon"
            showExpandLink
          />
        )}

        {/* Contact Information Section */}
        <ContactInfoCard
          email={listing.metadata?.contactEmail}
          phone={listing.metadata?.contactPhone}
          website={listing.metadata?.contactWebsite}
          contactName={listing.metadata?.contactName}
          title="Kontaktinformasjon"
        />
      </div>

      {/* Additional sections will be added in subsequent subtasks */}
    </div>
  );
}
