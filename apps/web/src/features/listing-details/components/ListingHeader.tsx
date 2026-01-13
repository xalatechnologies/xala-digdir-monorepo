/**
 * ListingHeader Component
 *
 * Displays listing title, type, category, key facts, address,
 * and action buttons (favorite, share).
 */

import * as React from 'react';
import { Heading, Paragraph, Tag } from '@digdir/designsystemet-react';
import { MapPinIcon } from '@xala/ds';
import type { Listing } from '../types';
import { getListingTypeLabel } from '../presenters/listingTypePresenter';
import { KeyFactsRow } from './KeyFactsRow';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';

// =============================================================================
// Props
// =============================================================================

export interface ListingHeaderProps {
  listing: Listing;
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  isAuthenticated: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  onAuthRequired: () => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ListingHeader({
  listing,
  isFavorited,
  isFavoriteLoading = false,
  isAuthenticated,
  onFavoriteToggle,
  onShare,
  onAuthRequired,
  className,
}: ListingHeaderProps): React.ReactElement {
  const typeLabel = getListingTypeLabel(listing.type);
  const categoryLabel = listing.category ? ` • ${listing.category}` : '';

  return (
    <header
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        paddingTop: 'var(--ds-spacing-4)',
        paddingBottom: 'var(--ds-spacing-4)',
      }}
    >
      {/* Top row: Title + Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        {/* Title and type */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          {/* Type badge */}
          <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <Tag color="info" data-size="sm">
              {typeLabel}{categoryLabel}
            </Tag>
          </div>

          {/* Title */}
          <Heading
            level={1}
            data-size="lg"
            style={{
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {listing.name}
          </Heading>

          {/* Key facts row */}
          <KeyFactsRow
            keyFacts={listing.keyFacts}
            listingType={listing.type}
            {...(listing.keyFacts.bookingMode && { bookingMode: listing.keyFacts.bookingMode })}
          />

          {/* Address */}
          {listing.address && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginTop: 'var(--ds-spacing-3)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              <MapPinIcon size={16} />
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {listing.address.formatted}
              </Paragraph>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            flexShrink: 0,
          }}
        >
          <FavoriteButton
            isFavorited={isFavorited}
            isLoading={isFavoriteLoading}
            isAuthenticated={isAuthenticated}
            onToggle={onFavoriteToggle}
            onAuthRequired={onAuthRequired}
          />
          <ShareButton
            onShare={onShare}
            listingName={listing.name}
          />
        </div>
      </div>
    </header>
  );
}

export default ListingHeader;
