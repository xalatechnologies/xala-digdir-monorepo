/**
 * ListingCard
 *
 * A reusable card component for displaying listing/venue information.
 * Supports images, ratings, pricing, facilities, and action buttons.
 */
import * as React from 'react';
import { Tag } from '@digdir/designsystemet-react';
import { cn } from '../utils';

/** Card variant for different display contexts */
export type ListingCardVariant = 'grid' | 'detailed';

export interface ListingCardProps {
  /** Unique identifier */
  id: string;
  /** Listing name/title */
  name: string;
  /** Category/type label (displayed on image badge) */
  type: string;
  /** Listing type from schema: 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER' */
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
  /** Price amount */
  price?: number;
  /** Price unit (e.g., 'time', 'person', 'dag') */
  priceUnit?: string;
  /** Currency code */
  currency?: string;
  /** Rating value (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Whether the listing is available */
  available?: boolean;
  /** Click handler for the card */
  onClick?: (id: string) => void;
  /** Click handler for favorite button */
  onFavorite?: (id: string) => void;
  /** Click handler for share button */
  onShare?: (id: string) => void;
  /** Close handler for detailed variant */
  onClose?: () => void;
  /** Whether this listing is favorited */
  isFavorited?: boolean;
  /** Custom class name */
  className?: string;
  /** Image height in pixels */
  imageHeight?: number;
  /** Card variant: 'grid' for compact grid view, 'detailed' for popup/modal view */
  variant?: ListingCardVariant;
  /** Show/hide different elements */
  showRating?: boolean;
  showPrice?: boolean;
  showCapacity?: boolean;
  showFacilities?: boolean;
  showDescription?: boolean;
  showLocation?: boolean;
  showTypeBadge?: boolean;
  showAvailabilityBadge?: boolean;
  showGradientOverlay?: boolean;
  showFavoriteButton?: boolean;
  showShareButton?: boolean;
  showListingType?: boolean;
  /** Max facilities to display */
  maxFacilities?: number;
}

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

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

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

export function ListingCard({
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
  price,
  priceUnit = 'time',
  currency = 'kr',
  rating,
  reviewCount,
  available = true,
  onClick,
  onFavorite,
  onShare,
  onClose,
  isFavorited = false,
  className,
  imageHeight = 200,
  variant = 'grid',
  showRating = false, // Disabled by default, enable when rating system is ready
  showPrice = false,
  showCapacity = true,
  showFacilities = true,
  showDescription = true,
  showLocation = true,
  showTypeBadge = true,
  showAvailabilityBadge = true,
  showGradientOverlay = true,
  showFavoriteButton = true,
  showShareButton = true,
  showListingType = true,
  maxFacilities = 3,
}: ListingCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    onClick?.(id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Detailed variant - larger popup/modal style
  if (variant === 'detailed') {
    return (
      <div
        className={cn('listing-card listing-card--detailed', className)}
        style={{
          position: 'relative',
          width: '520px',
          maxWidth: '95vw',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Close button - positioned over the image with high contrast */}
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Lukk"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <CloseIcon />
          </button>
        )}

        <div
          style={{ cursor: onClick ? 'pointer' : 'default' }}
          onClick={handleClick}
        >
          {/* Image */}
          {image && (
            <img
              src={image}
              alt={name}
              style={{
                width: '100%',
                height: '240px',
                objectFit: 'cover',
              }}
            />
          )}

          <div style={{ padding: '20px' }}>
            {/* Listing type badge */}
            {listingType && (
              <span style={{
                display: 'inline-block',
                marginBottom: '12px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-text-default)',
                borderRadius: 'var(--ds-border-radius-sm)',
              }}>
                {listingTypeLabels[listingType] || listingType}
              </span>
            )}

            {/* Title */}
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--ds-color-neutral-text-default)',
            }}>
              {name}
            </h3>

            {/* Location */}
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '1.125rem',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}>
              {location}
            </p>

            {/* Description */}
            {description && (
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '1rem',
                color: 'var(--ds-color-neutral-text-default)',
                lineHeight: 1.6,
              }}>
                {description}
              </p>
            )}

            {/* Capacity */}
            {capacity && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <PeopleIcon />
                <span style={{ fontSize: '1.125rem', color: 'var(--ds-color-neutral-text-default)' }}>
                  {capacity} personer
                </span>
              </div>
            )}

            {/* Facilities */}
            {facilities && facilities.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
              }}>
                {facilities.slice(0, 4).map((facility, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.9375rem',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                      color: 'var(--ds-color-neutral-text-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                    }}
                  >
                    {facility}
                  </span>
                ))}
                {facilities.length > 4 && (
                  <span style={{
                    padding: '8px 14px',
                    fontSize: '0.9375rem',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}>
                    +{facilities.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Footer with availability & CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              {available !== undefined && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.125rem',
                  color: available
                    ? 'var(--ds-color-success-text-default)'
                    : 'var(--ds-color-danger-text-default)',
                  fontWeight: 500,
                }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: available
                      ? 'var(--ds-color-success-base-default)'
                      : 'var(--ds-color-danger-base-default)',
                  }} />
                  {available ? 'Ledig' : 'Opptatt'}
                </span>
              )}
              <span style={{
                fontSize: '1.125rem',
                color: 'var(--ds-color-accent-text-default)',
                fontWeight: 600,
              }}>
                Se detaljer →
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default) - compact card style
  return (
    <div
      className={cn('listing-card', className)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: '12px',
        border: `0.5px solid ${isHovered ? 'var(--ds-color-accent-border-subtle)' : 'rgba(0,0,0,0.08)'}`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered
          ? '0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image with overlays */}
      <div style={{
        position: 'relative',
        height: `${imageHeight}px`,
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
        {/* Gradient overlay */}
        {showGradientOverlay && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)'
          }} />
        )}

        {/* Category badge */}
        {showTypeBadge && (
          <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <Tag data-size="sm" data-color="accent" style={{ paddingInline: '0.75rem' }}>
              {type}
            </Tag>
          </div>
        )}

        {/* Action buttons */}
        {(showFavoriteButton || showShareButton) && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px'
          }}>
          {showFavoriteButton && onFavorite && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
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
          {showShareButton && onShare && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                border: 'none',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onClick={handleShare}
              title="Del"
            >
              <ShareIcon />
            </button>
          )}
          </div>
        )}

        {/* Rating on image - TODO: Enable when rating system is ready */}
        {showRating && rating !== undefined && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 'var(--ds-border-radius-md)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          } as React.CSSProperties}>
            <StarIcon />
            {rating}
            {reviewCount !== undefined && (
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)', fontWeight: 'var(--ds-font-weight-regular)' } as React.CSSProperties}>
                ({reviewCount})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          margin: '0 0 10px 0',
          fontSize: 'var(--ds-font-size-md)',
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
          lineHeight: 'var(--ds-line-height-sm)',
          fontFamily: 'var(--ds-font-family)'
        } as React.CSSProperties}>
          {name}
        </h3>

        {showLocation && (
          <p style={{
            margin: '0 0 12px 0',
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

        {showDescription && (
          <p style={{
            margin: '0 0 20px 0',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            lineHeight: 'var(--ds-line-height-md)',
            minHeight: '4.5em',
            display: '-webkit-box',
            WebkitLineClamp: 3,
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
            flexWrap: 'nowrap',
            gap: '8px',
            marginBottom: '18px',
            overflow: 'hidden'
          }}>
            {facilities.slice(0, maxFacilities).map((facility) => (
              <Tag key={facility} data-size="sm" data-color="accent" style={{ paddingInline: '0.75rem', flexShrink: 0 }}>
                {facility}
              </Tag>
            ))}
            {moreFacilities > 0 && (
              <Tag data-size="sm" data-color="neutral" style={{ paddingInline: '0.75rem', flexShrink: 0 }}>
                +{moreFacilities} mer
              </Tag>
            )}
          </div>
        )}

        {/* Footer with capacity and listing type */}
        {(showCapacity || showListingType) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: 'auto -24px -24px -24px',
            padding: '14px 24px',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderTop: '1px solid rgba(0,0,0,0.04)'
          }}>
            {showCapacity && capacity !== undefined && (
              <div style={{
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
            {showListingType && listingType && (
              <Tag data-size="sm" data-color={listingTypeColors[listingType] || 'neutral'} style={{ paddingInline: '0.75rem' }}>
                {listingTypeLabels[listingType] || listingType}
              </Tag>
            )}
            {showPrice && price !== undefined && (
              <span style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                fontFamily: 'var(--ds-font-family)'
              } as React.CSSProperties}>
                fra {price} {currency}/{priceUnit}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingCard;
