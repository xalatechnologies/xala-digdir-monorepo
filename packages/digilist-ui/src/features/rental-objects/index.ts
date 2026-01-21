/**
 * Rental Objects Feature Kit
 *
 * Domain-specific components and mappers for rental object display and management.
 * This feature kit provides thin wrappers around platform patterns with
 * domain-specific DTO mapping.
 *
 * ## Usage Patterns
 *
 * ### Pattern 1: Using Platform Wrapper (Recommended)
 * ```tsx
 * import { RentalObjectCardWrapper } from '@digilist/ui/features/rental-objects';
 * import type { RentalObjectCardProjection } from '@digilist/contracts/projections';
 *
 * function RentalObjectsGrid({ rentalObjects }: { rentalObjects: RentalObjectCardProjection[] }) {
 *   const t = useT();
 *   return (
 *     <Grid columns={3}>
 *       {rentalObjects.map(rentalObject => (
 *         <RentalObjectCardWrapper
 *           key={rentalObject.id}
 *           rentalObject={rentalObject}
 *           onClick={(id) => navigate(`/rental-objects/${id}`)}
 *           t={t}
 *         />
 *       ))}
 *     </Grid>
 *   );
 * }
 * ```
 *
 * ### Pattern 2: Using Domain Components Directly
 * ```tsx
 * import { RentalObjectCard } from '@digilist/ui/features/rental-objects';
 *
 * function MyCard({ name, location }) {
 *   return <RentalObjectCard name={name} location={location} ... />;
 * }
 * ```
 *
 * ### Pattern 3: Using Mappers with Platform Patterns
 * ```tsx
 * import { mapRentalObjectToResourceCard } from '@digilist/ui/features/rental-objects';
 * import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
 *
 * const props = mapRentalObjectToResourceCard(dto, t);
 * return <ResourceCard {...props} />;
 * ```
 */

// =============================================================================
// Platform Pattern Wrappers (Thin wrappers with domain mapping)
// =============================================================================

export { RentalObjectCardWrapper } from './RentalObjectCardWrapper';
export type { RentalObjectCardWrapperProps } from './RentalObjectCardWrapper';

// =============================================================================
// Domain-to-Platform Mappers
// =============================================================================

export { mapRentalObjectToResourceCard } from './mappers';

// =============================================================================
// Re-export Domain Components from blocks (for direct use)
// =============================================================================

export {
  // Core components
  RentalObjectCard,
  type RentalObjectCardProps,

  RentalObjectGrid,
  type RentalObjectGridProps,

  RentalObjectListItem,
  type RentalObjectListItemProps,

  RentalObjectDetailHeader,
  type RentalObjectDetailHeaderProps,

  RentalObjectTableView,
  type RentalObjectTableViewProps,

  RentalObjectTabs,
  TabContent,
  TabEmptyState,
  type RentalObjectTabsProps,
  type TabConfig,
  type TabContentProps,
  type TabEmptyStateProps,

  RentalObjectToolbar,
  type RentalObjectToolbarProps,
  type ViewMode,

  // Map component
  RentalObjectMap,
  type RentalObjectMapProps,
  type MapRentalObject,

  // Calendar components
  AvailabilityCalendar,
  type AvailabilityCalendarProps,

  RentalObjectAvailabilityCalendar,
  type RentalObjectAvailabilityCalendarProps,

  // Supporting components
  KeyFactsRow,
  type KeyFactsRowProps,
  type KeyFact,

  FavoriteButton,
  type FavoriteButtonProps,

  ShareButton,
  type ShareButtonProps,
  type ShareData,
  type SharePlatform,

  StatusTag,
  type StatusTagProps,
  type StatusBadgeConfig,
  type BadgeColor,

  // Amenity chips
  AmenityChips,
  type AmenityChipsProps,
  type Amenity,

  // Legacy aliases (deprecated)
  /** @deprecated Use AmenityChips instead */
  FacilityChips,
  /** @deprecated Use AmenityChipsProps instead */
  type FacilityChipsProps,
  /** @deprecated Use Amenity instead */
  type Facility,
} from '../../blocks/rental-objects';

// =============================================================================
// NOTE: Platform blocks (GuidelinesTab, FAQTab, ContactInfoCard, etc.)
// should be imported directly from @xalatechnologies/platform/ui to avoid circular dependencies
// =============================================================================
