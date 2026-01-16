/**
 * Listings Grid View
 * Card-based grid display using the reusable DS ListingCard component
 * Enhanced with admin-specific features: selection, status badges, actions
 */

import type { ChangeEvent } from 'react';
import { Paragraph, Spinner, RentalObjectCard, RentalObjectGrid as DSRentalObjectGrid, RentalObjectStatusBadge } from '@xala/ds';
import { useNavigate } from 'react-router-dom';
import { RentalObjectRowActions } from './RentalObjectRowActions';
import type { Listing, ListingStatus } from '@digilist/client-sdk';

interface RentalObjectsGridProps {
  listings: RentalObject[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectOne: (id: string, selected: boolean) => void;
  onRefresh?: () => void;
}

export function RentalObjectsGrid({
  listings,
  isLoading,
  selectedIds,
  onSelectOne,
  onRefresh,
}: RentalObjectsGridProps) {
  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    navigate(`/rental-objects/${id}`);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
        }}
      >
        <Spinner aria-label="Laster..." />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen utleieobjekter funnet
        </Paragraph>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Prøv å endre søkekriteriene eller opprett et nytt objekt
        </Paragraph>
      </div>
    );
  }

  return (
    <DSRentalObjectGrid minCardWidth={320} gap="var(--ds-spacing-4)">
      {listings.map((listing) => {
        // Transform raw Listing to UiListing for consistent data display
        const listing = listing;

        return (
          <div key={listing.id} style={{ position: 'relative' }}>
            {/* Admin overlay: Selection checkbox */}
            <div
              style={{
                position: 'absolute',
                top: 'var(--ds-spacing-3)',
                left: 'var(--ds-spacing-3)',
                zIndex: 10,
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
                padding: 'var(--ds-spacing-1)',
                boxShadow: 'var(--ds-shadow-sm)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line digdir/prefer-ds-components -- Checkbox with custom styling and positioning */}
              <input
                type="checkbox"
                aria-label={`Velg ${listing.name}`}
                checked={selectedIds.includes(listing.id)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSelectOne(listing.id, e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--ds-color-accent-base-default)',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Admin overlay: Status badge */}
            <div
              style={{
                position: 'absolute',
                top: 'var(--ds-spacing-3)',
                right: 'var(--ds-spacing-3)',
                zIndex: 10,
              }}
            >
              <ListingStatusBadge status={listing.status as ListingStatus} />
            </div>

            {/* Admin overlay: Row actions */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(var(--ds-spacing-3) + 200px + var(--ds-spacing-4))',
                right: 'var(--ds-spacing-4)',
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <RentalObjectRowActions
                listingId={listing.id}
                listingName={listing.name}
                status={listing.status as ListingStatus}
                onActionComplete={onRefresh}
              />
            </div>

            {/* Reusable ListingCard from DS - using transformed UiListing */}
            <RentalObjectCard
              id={listing.id}
              name={listing.name}
              type={listing.type}
              listingType={listing.listingType}
              location={listing.location || '-'}
              description={listing.description}
              image={listing.image}
              facilities={listing.facilities}
              moreFacilities={listing.moreFacilities}
              {...(listing.capacity > 0 ? { capacity: listing.capacity } : {})}
              {...(listing.price > 0 ? { price: listing.price } : {})}
              priceUnit={listing.priceUnit}
              currency={listing.currency}
              onClick={handleCardClick}
              imageHeight={200}
              showTypeBadge={false}
              showFavoriteButton={false}
              showShareButton={false}
              showRating={false}
              showPrice={listing.price > 0}
              showListingType
              showCapacity={listing.capacity > 0}
              showLocation
              showDescription
              showFacilities={listing.facilities.length > 0}
              maxFacilities={3}
            />
          </div>
        );
      })}
    </DSRentalObjectGrid>
  );
}
