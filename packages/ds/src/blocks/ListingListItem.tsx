/**
 * ListingListItem
 *
 * A horizontal list item component for displaying listing/venue information.
 * Used in list view mode. Supports images, location map, facilities, and capacity.
 */
import * as React from 'react';
import { Tag } from '@digdir/designsystemet-react';
import { cn } from '../utils';

export interface ListingListItemProps {
  /** Unique identifier */
  id: string;
  /** Listing name/title */
  name: string;
  /** Category/type label */
  type: string;
  /** Listing type from schema */
  listingType?: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';
  /** Location text */
  location: string;
  /** Description text */
  description: string;
  /** Image URL */
  image: string;
  /** List of facilities */
  facilities?: string[];
  /** Number of additional facilities not shown */
  moreFacilities?: number;
  /** Capacity (number of people) */
  capacity?: number;
  /** Click handler for the item */
  onClick?: (id: string) => void;
  /** Click handler for favorite button */
  onFavorite?: (id: string) => void;
  /** Whether this listing is favorited */
  isFavorited?: boolean;
  /** Custom class name */
  className?: string;
  /** Image width in pixels */
  imageWidth?: number;
  /** Map width in pixels */
  mapWidth?: number;
  /** Show/hide different elements */
  showCapacity?: boolean;
  showFacilities?: boolean;
  showDescription?: boolean;
  showLocation?: boolean;
  showTypeBadge?: boolean;
  showMap?: boolean;
  showFavoriteButton?: boolean;
  showListingType?: boolean;
  /** Max facilities to display */
  maxFacilities?: number;
  /** Latitude for map */
  latitude?: number;
  /** Longitude for map */
  longitude?: number;
  /** Mapbox access token */
  mapboxToken?: string;
}

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Listing type labels in Norwegian
const listingTypeLabels: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  EVENT: 'Arrangement',
  SERVICE: 'Tjeneste',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

// Listing type colors for badges
const listingTypeColors: Record<string, string> = {
  SPACE: 'accent',
  RESOURCE: 'info',
  EVENT: 'success',
  SERVICE: 'warning',
  VEHICLE: 'brand1',
  OTHER: 'neutral',
};

export function ListingListItem({
  id,
  name,
  type,
  listingType,
  location,
  description,
  image,
  facilities = [],
  moreFacilities = 0,
  capacity,
  onClick,
  onFavorite,
  isFavorited = false,
  className,
  imageWidth = 336,
  mapWidth = 294,
  showCapacity = true,
  showFacilities = true,
  showDescription = true,
  showLocation = true,
  showTypeBadge = true,
  showMap = true,
  showFavoriteButton = true,
  showListingType = true,
  maxFacilities = 4,
  latitude,
  longitude,
  mapboxToken,
}: ListingListItemProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    onClick?.(id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  // Generate static map URL (using OpenStreetMap placeholder for demo)
  const getMapUrl = () => {
    if (latitude && longitude) {
      // Using a static map tile service
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=${mapWidth}x160&markers=${latitude},${longitude},red`;
    }
    // Fallback placeholder map image
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${10.2039 + Math.random() * 0.1},${59.7439 + Math.random() * 0.05},14,0/${mapWidth}x160?access_token=placeholder`;
  };

  return (
    <div
      className={cn('listing-list-item', className)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: '12px',
        border: `0.5px solid ${isHovered ? 'var(--ds-color-accent-border-subtle)' : 'rgba(0,0,0,0.08)'}`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image section */}
      <div style={{
        position: 'relative',
        width: `${imageWidth}px`,
        minWidth: `${imageWidth}px`,
        backgroundColor: 'var(--ds-color-neutral-surface-hover)'
      }}>
        <img
          src={image}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Type badge on image */}
        {showTypeBadge && (
          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <Tag data-size="sm" data-color={listingTypeColors[listingType || 'OTHER'] || 'neutral'} style={{ paddingInline: '0.75rem' }}>
              {type}
            </Tag>
          </div>
        )}

        {/* Favorite button */}
        {showFavoriteButton && onFavorite && (
          <button
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: isFavorited ? 'var(--ds-color-danger-base-default)' : 'var(--ds-color-neutral-text-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={handleFavorite}
            title="Legg til favoritter"
          >
            <HeartIcon filled={isFavorited} />
          </button>
        )}
      </div>

      {/* Content section */}
      <div style={{
        flex: 1,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header with title and listing type */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
            lineHeight: 'var(--ds-line-height-sm)',
            fontFamily: 'var(--ds-font-family)'
          } as React.CSSProperties}>
            {name}
          </h3>
          {showListingType && listingType && (
            <Tag data-size="sm" data-color={listingTypeColors[listingType] || 'neutral'} style={{ paddingInline: '0.75rem', flexShrink: 0 }}>
              {listingTypeLabels[listingType] || listingType}
            </Tag>
          )}
        </div>

        {/* Location */}
        {showLocation && (
          <p style={{
            margin: '0 0 10px 0',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--ds-font-family)'
          } as React.CSSProperties}>
            <MapPinIcon />
            {location}
          </p>
        )}

        {/* Description */}
        {showDescription && (
          <p style={{
            margin: '0 0 14px 0',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            lineHeight: 'var(--ds-line-height-md)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: 'var(--ds-font-family)'
          } as React.CSSProperties}>
            {description}
          </p>
        )}

        {/* Facility tags */}
        {showFacilities && facilities.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '14px'
          }}>
            {facilities.slice(0, maxFacilities).map((facility) => (
              <Tag key={facility} data-size="sm" data-color="accent" style={{ paddingInline: '0.75rem' }}>
                {facility}
              </Tag>
            ))}
            {moreFacilities > 0 && (
              <Tag data-size="sm" data-color="neutral" style={{ paddingInline: '0.75rem' }}>
                +{moreFacilities} flere
              </Tag>
            )}
          </div>
        )}

        {/* Capacity */}
        {showCapacity && capacity !== undefined && (
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            fontFamily: 'var(--ds-font-family)'
          } as React.CSSProperties}>
            <UserIcon />
            {capacity} personer
          </div>
        )}
      </div>

      {/* Map section */}
      {showMap && (
        <div style={{
          width: `${mapWidth}px`,
          minWidth: `${mapWidth}px`,
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {mapboxToken && latitude && longitude ? (
            // Mapbox Static Image
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+2F55A4(${longitude},${latitude})/${longitude},${latitude},14,0/${mapWidth}x200@2x?access_token=${mapboxToken}`}
              alt={`Kart over ${location}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            // Fallback placeholder
            <div style={{
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(135deg,
                  var(--ds-color-neutral-surface-hover) 0%,
                  var(--ds-color-neutral-surface-active) 100%
                )
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Simplified map placeholder with streets */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 160"
                style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
              >
                <line x1="0" y1="40" x2="200" y2="40" stroke="var(--ds-color-neutral-border-default)" strokeWidth="2" />
                <line x1="0" y1="80" x2="200" y2="80" stroke="var(--ds-color-neutral-border-default)" strokeWidth="3" />
                <line x1="0" y1="120" x2="200" y2="120" stroke="var(--ds-color-neutral-border-default)" strokeWidth="2" />
                <line x1="50" y1="0" x2="50" y2="160" stroke="var(--ds-color-neutral-border-default)" strokeWidth="2" />
                <line x1="100" y1="0" x2="100" y2="160" stroke="var(--ds-color-neutral-border-default)" strokeWidth="3" />
                <line x1="150" y1="0" x2="150" y2="160" stroke="var(--ds-color-neutral-border-default)" strokeWidth="2" />
              </svg>
              <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--ds-color-accent-base-default)" stroke="white" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3" fill="white" stroke="var(--ds-color-accent-base-default)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListingListItem;
