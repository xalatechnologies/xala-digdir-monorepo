/**
 * OverviewTab
 *
 * Overview tab for listing detail view displaying images, description, and key information.
 * First tab in the listing detail view providing administrators with a comprehensive overview.
 */
import * as React from 'react';
import { ImageGallery, KeyFactsRow } from '@xala/ds';
import type { Listing } from '@digilist/client-sdk';
import type { GalleryImage, KeyFact } from '@xala/ds';
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

      {/* Additional sections will be added in subsequent subtasks */}
    </div>
  );
}
