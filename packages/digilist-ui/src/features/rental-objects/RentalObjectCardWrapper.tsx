/**
 * RentalObjectCardWrapper
 *
 * A thin wrapper that composes the Platform ResourceCard pattern
 * for the Digilist RentalObject domain.
 *
 * This is the recommended way to render rental object cards -
 * it uses the platform-neutral ResourceCard with domain-specific mapping.
 */
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapRentalObjectToResourceCard } from './mappers';
import type { RentalObjectCardProjection } from '@digilist/contracts/projections';

export interface RentalObjectCardWrapperProps {
  /** The rental object DTO from the API */
  rentalObject: RentalObjectCardProjection;
  /** Whether this item is favorited by the user */
  isFavorited?: boolean;
  /** Click handler for the card (navigates to detail page) */
  onClick?: (id: string) => void;
  /** Click handler for favorite toggle */
  onFavorite?: (id: string) => void;
  /** Click handler for share button */
  onShare?: (id: string) => void;
  /** Card display variant */
  variant?: 'grid' | 'list' | 'compact';
  /** Translation function for localized labels */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Renders a rental object using the Platform ResourceCard pattern.
 *
 * @example
 * ```tsx
 * import { RentalObjectCardWrapper } from '@digilist/ui/features/rental-objects';
 * import { useT } from '@xala/i18n';
 *
 * function RentalObjectCardComponent({ rentalObject }: { rentalObject: RentalObjectCardProjection }) {
 *   const t = useT();
 *   return (
 *     <RentalObjectCardWrapper
 *       rentalObject={rentalObject}
 *       onClick={(id) => navigate(`/rental-objects/${id}`)}
 *       t={t}
 *     />
 *   );
 * }
 * ```
 */
export function RentalObjectCardWrapper({
  rentalObject,
  isFavorited,
  onClick,
  onFavorite,
  onShare,
  variant = 'grid',
  t,
  className,
}: RentalObjectCardWrapperProps) {
  const props = mapRentalObjectToResourceCard(rentalObject, t);

  return (
    <ResourceCard
      {...props}
      isFavorited={isFavorited}
      variant={variant}
      onClick={onClick}
      onFavorite={onFavorite}
      onShare={onShare}
      className={className}
    />
  );
}

export default RentalObjectCardWrapper;
