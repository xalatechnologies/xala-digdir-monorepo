/**
 * ListingDetailHeader
 *
 * Header section for listing detail page showing category, title,
 * capacity, location, and action buttons (favorite, share).
 */
import * as React from 'react';
import { Tag, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { MapPinIcon, HeartIcon, ShareIcon } from '../primitives/icons';

// Users icon for capacity
function UsersIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export interface ListingDetailHeaderProps {
  /** Category label (e.g., "Rom", "Møterom") */
  category: string;
  /** Listing title */
  title: string;
  /** Location address */
  location: string;
  /** Capacity (number of people) */
  capacity?: number;
  /** Callback when favorite button is clicked */
  onFavorite?: () => void;
  /** Callback when share button is clicked */
  onShare?: () => void;
  /** Whether the listing is favorited */
  isFavorited?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * ListingDetailHeader component
 *
 * @example
 * ```tsx
 * <ListingDetailHeader
 *   category="Rom"
 *   title="Møterom 101"
 *   location="Storgata 1, 0155 Oslo"
 *   capacity={25}
 *   onFavorite={() => console.log('Favorited')}
 *   onShare={() => console.log('Shared')}
 * />
 * ```
 */
export function ListingDetailHeader({
  category,
  title,
  location,
  capacity,
  onFavorite,
  onShare,
  isFavorited = false,
  className,
}: ListingDetailHeaderProps): React.ReactElement {
  return (
    <div
      className={cn('listing-detail-header', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      {/* Category badge */}
      <Tag
        data-size="sm"
        data-color="neutral"
        style={{ alignSelf: 'flex-start' }}
      >
        {category}
      </Tag>

      {/* Title row with capacity and actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        {/* Title */}
        <Heading
          level={1}
          data-size="xl"
          style={{ margin: 0, flex: '1 1 auto' }}
        >
          {title}
        </Heading>

        {/* Right side: Capacity + Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
            flexShrink: 0,
          }}
        >
          {/* Capacity badge */}
          {capacity && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-info-surface-default)',
                borderRadius: 'var(--ds-border-radius-full)',
                color: 'var(--ds-color-info-text-default)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              <UsersIcon size={16} />
              <span>{capacity} pers</span>
            </div>
          )}

          {/* Action buttons */}
          {(onFavorite || onShare) && (
            <div
              style={{
                display: 'flex',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {onFavorite && (
                <button
                  type="button"
                  onClick={onFavorite}
                  aria-label={isFavorited ? 'Fjern fra favoritter' : 'Legg til favoritter'}
                  aria-pressed={isFavorited}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: isFavorited
                      ? 'var(--ds-color-danger-surface-default)'
                      : 'var(--ds-color-neutral-background-default)',
                    color: isFavorited
                      ? 'var(--ds-color-danger-base-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <HeartIcon size={18} />
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  aria-label="Del"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ShareIcon size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <Paragraph
        data-size="sm"
        style={{
          margin: 0,
          color: 'var(--ds-color-neutral-text-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
        }}
      >
        <MapPinIcon size={16} />
        {location}
      </Paragraph>
    </div>
  );
}

export default ListingDetailHeader;
