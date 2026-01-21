/**
 * RentalObjectDetailHeader
 *
 * Header section for rental object detail page showing category, title,
 * key facts, location, and action buttons (favorite, share).
 *
 * Supports both simple usage with capacity prop and advanced usage
 * with keyFacts array for type-specific information display.
 */
import * as React from 'react';
import { Tag, Heading, Paragraph } from '@xalatechnologies/platform/ui';
import { cn } from '../../utils';
import { MapPinIcon, ShareIcon } from '../../primitives/icons';
import { KeyFactsRow, type KeyFact } from './KeyFactsRow';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton, type ShareData, type SharePlatform } from './ShareButton';

export interface RentalObjectDetailHeaderProps {
  /** Category label (e.g., "Rom", "Moterom") */
  category: string;
  /** Rental object type for styling (e.g., "SPACE", "EQUIPMENT") */
  rentalObjectType?: string;
  /** Rental object title */
  title: string;
  /** Location address */
  location: string;
  /** Capacity (number of people) - simple mode */
  capacity?: number;
  /** Key facts to display - advanced mode */
  keyFacts?: KeyFact[];
  /** Callback when favorite button is clicked */
  onFavorite?: () => void;
  /** Callback when share is initiated */
  onShare?: (platform?: SharePlatform) => void;
  /** Whether the rental object is favorited */
  isFavorited?: boolean;
  /** Whether user is authenticated (for favorite gating) */
  isAuthenticated?: boolean;
  /** Callback when unauthenticated user tries to favorite */
  onAuthRequired?: () => void;
  /** Favorite loading state */
  isFavoriteLoading?: boolean;
  /** Share data for the share sheet */
  shareData?: ShareData;
  /** UTM parameters for share tracking */
  shareUtmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  /** Custom class name */
  className?: string;
}

/**
 * RentalObjectDetailHeader component
 *
 * @example
 * ```tsx
 * // Simple usage with capacity
 * <RentalObjectDetailHeader
 *   category="Rom"
 *   title="Moterom 101"
 *   location="Storgata 1, 0155 Oslo"
 *   capacity={25}
 *   onFavorite={() => console.log('Favorited')}
 * />
 *
 * // Advanced usage with key facts
 * <RentalObjectDetailHeader
 *   category="Rom"
 *   rentalObjectType="SPACE"
 *   title="Moterom 101"
 *   location="Storgata 1, 0155 Oslo"
 *   keyFacts={[
 *     { type: 'capacity', label: 'Kapasitet', value: '25 personer' },
 *     { type: 'area', label: 'Areal', value: '120 m2' },
 *     { type: 'bookingMode', label: 'Booking', value: 'Timebasert' },
 *   ]}
 *   isFavorited={true}
 *   isAuthenticated={true}
 *   onFavorite={() => toggleFavorite()}
 *   shareData={{ url: 'https://...', title: 'Moterom 101' }}
 * />
 * ```
 */
export function RentalObjectDetailHeader({
  category,
  rentalObjectType,
  title,
  location,
  capacity,
  keyFacts,
  onFavorite,
  onShare,
  isFavorited = false,
  isAuthenticated = true,
  onAuthRequired,
  isFavoriteLoading = false,
  shareData,
  shareUtmParams,
  className,
}: RentalObjectDetailHeaderProps): React.ReactElement {
  // Build key facts from capacity if not provided
  const effectiveKeyFacts = React.useMemo((): KeyFact[] => {
    if (keyFacts && keyFacts.length > 0) {
      return keyFacts;
    }
    if (capacity) {
      return [
        {
          type: 'capacity',
          label: 'Kapasitet',
          value: `${capacity} pers`,
        },
      ];
    }
    return [];
  }, [keyFacts, capacity]);

  // Get tag color based on rental object type
  const getTypeColor = (): 'neutral' | 'first' | 'second' | 'third' => {
    switch (rentalObjectType) {
      case 'SPACE':
        return 'first';
      case 'RESOURCE':
        return 'second';
      case 'EVENT':
        return 'third';
      case 'SERVICE':
        return 'first';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      className={cn('rental-object-detail-header', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {/* Top row: Category badge + Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        {/* Category badge */}
        <Tag
          data-size="sm"
          data-color={getTypeColor()}
        >
          {category}
        </Tag>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {(onFavorite || onAuthRequired) && (
            <FavoriteButton
              isFavorited={isFavorited}
              isAuthenticated={isAuthenticated}
              isLoading={isFavoriteLoading}
              onToggle={onFavorite || (() => {})}
              onAuthRequired={onAuthRequired || (() => {})}
              variant="icon"
              size="md"
            />
          )}
          {shareData ? (
            <ShareButton
              shareData={shareData}
              utmParams={shareUtmParams || {}}
              variant="icon"
              size="md"
              {...(onShare ? { onShare: (platform?: SharePlatform) => onShare(platform) } : {})}
            />
          ) : onShare ? (
            <button
              type="button"
              onClick={() => { onShare(); }}
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
          ) : null}
        </div>
      </div>

      {/* Title */}
      <Heading
        level={1}
        data-size="xl"
        style={{ margin: 0 }}
      >
        {title}
      </Heading>

      {/* Key Facts Row */}
      {effectiveKeyFacts.length > 0 && (
        <KeyFactsRow
          facts={effectiveKeyFacts}
          variant="default"
        />
      )}

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

export default RentalObjectDetailHeader;
