/**
 * Rental Object to Platform ResourceCard Mapper
 *
 * Maps Digilist domain DTOs to platform-neutral ResourceCard props.
 * This enables rendering domain data with the platform UI pattern.
 */
import type { ResourceCardProps, ResourceBadge, MetadataItem, StatusIndicator, PriceDisplay } from '@xalatechnologies/platform/ui/patterns';
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';

/** Translation function type */
type TranslateFunction = (key: string, params?: Record<string, unknown>) => string;

/**
 * Maps a RentalObjectCardProjection to ResourceCardProps
 *
 * @param rentalObject - The domain DTO from the API
 * @param t - Translation function for localized labels
 * @returns Platform-neutral ResourceCardProps
 */
export function mapRentalObjectToResourceCard(
  rentalObject: RentalObjectCardProjection,
  t: TranslateFunction
): Omit<ResourceCardProps, 'onClick' | 'onFavorite' | 'onShare' | 'isFavorited' | 'variant'> {
  // Build badges array
  const badges: ResourceBadge[] = [];

  // Primary badge: category/type
  if (rentalObject.typeLabel) {
    badges.push({
      id: 'type',
      text: rentalObject.typeLabel,
      variant: 'accent',
    });
  }

  // Featured badge
  if (rentalObject.isFeatured) {
    badges.push({
      id: 'featured',
      text: t('rentalObjects.featured'),
      variant: 'warning',
    });
  }

  // Tags as badges
  if (rentalObject.tags && rentalObject.tags.length > 0) {
    rentalObject.tags.slice(0, 2).forEach((tag, index) => {
      badges.push({
        id: `tag-${index}`,
        text: tag,
        variant: 'neutral',
      });
    });
  }

  // Build metadata array
  const metadata: MetadataItem[] = [];

  // Location
  if (rentalObject.locationFormatted) {
    metadata.push({
      id: 'location',
      label: t('rentalObjects.location'),
      value: rentalObject.locationFormatted,
    });
  }

  // Capacity
  if (rentalObject.capacityLabel) {
    metadata.push({
      id: 'capacity',
      label: t('rentalObjects.capacity'),
      value: rentalObject.capacityLabel,
    });
  }

  // Build status indicator
  const status: StatusIndicator = {
    type: rentalObject.isAvailable ? 'available' : 'unavailable',
    label: rentalObject.isAvailable
      ? t('rentalObjects.status.available')
      : t('rentalObjects.status.unavailable'),
  };

  // Build price display
  const price: PriceDisplay | undefined = rentalObject.priceDisplay
    ? {
        amount: rentalObject.priceDisplay,
        // Note: priceDisplay is already formatted (e.g., "200 kr/time")
        // If more granular data is needed, extend the projection
      }
    : undefined;

  return {
    id: rentalObject.id,
    title: rentalObject.name,
    subtitle: rentalObject.typeLabel,
    description: rentalObject.descriptionExcerpt,
    image: rentalObject.primaryImageUrl
      ? {
          src: rentalObject.primaryImageUrl,
          alt: rentalObject.name,
        }
      : undefined,
    badges,
    metadata,
    status,
    price,

    // Localized aria labels
    favoriteAriaLabel: t('rentalObjects.actions.toggleFavorite'),
    shareAriaLabel: t('rentalObjects.actions.share'),
    moreBadgesText:
      rentalObject.tags && rentalObject.tags.length > 2
        ? t('common.more', { count: rentalObject.tags.length - 2 })
        : undefined,
  };
}
