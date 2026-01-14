/**
 * OverviewTab
 *
 * Overview tab for listing detail view displaying images, description, and key information.
 * First tab in the listing detail view providing administrators with a comprehensive overview.
 */
import * as React from 'react';
import { ImageGallery } from '@xala/ds';
import type { Listing } from '@digilist/client-sdk';
import type { GalleryImage } from '@xala/ds';

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

// =============================================================================
// Component
// =============================================================================

export function OverviewTab({ listing }: OverviewTabProps): React.ReactElement {
  // Transform images to gallery format
  const galleryImages = React.useMemo(
    () => transformImagesToGallery(listing.images || [], listing.name),
    [listing.images, listing.name]
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

      {/* Additional sections will be added in subsequent subtasks */}
    </div>
  );
}
