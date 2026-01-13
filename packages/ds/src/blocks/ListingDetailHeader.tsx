/**
 * ListingDetailHeader
 *
 * Header section for listing detail page showing category, title,
 * location, and action buttons (favorite, share).
 */
import * as React from 'react';
import { Tag, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { MapPinIcon, HeartIcon, ShareIcon } from '../primitives/icons';

export interface ListingDetailHeaderProps {
  /** Category label (e.g., "Rom", "Møterom") */
  category: string;
  /** Listing title */
  title: string;
  /** Location address */
  location: string;
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
 *   onFavorite={() => console.log('Favorited')}
 *   onShare={() => console.log('Shared')}
 * />
 * ```
 */
export function ListingDetailHeader({
  category,
  title,
  location,
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
      {/* Category badge row with actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Category badge */}
        <Tag
          data-size="sm"
          data-color="neutral"
        >
          {category}
        </Tag>

        {/* Action buttons - text buttons with icons */}
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
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  color: isFavorited
                    ? 'var(--ds-color-danger-base-default)'
                    : 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                <HeartIcon size={18} />
                <span>Lik</span>
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
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  color: 'var(--ds-color-neutral-text-default)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                <ShareIcon size={16} />
                <span>Del</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <Heading
        level={1}
        data-size="xl"
        style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}
      >
        {title}
      </Heading>

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
