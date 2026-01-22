/**
 * @digilist/ui - Rental Object Components
 *
 * Domain-specific components for displaying and managing rental objects.
 * These components are specific to the Digilist rental booking platform.
 */

// =============================================================================
// Core Rental Object Components
// =============================================================================

export { RentalObjectCard } from './RentalObjectCard';
export type { RentalObjectCardProps } from './RentalObjectCard';

export { RentalObjectGrid } from './RentalObjectGrid';
export type { RentalObjectGridProps } from './RentalObjectGrid';

export { RentalObjectListItem } from './RentalObjectListItem';
export type { RentalObjectListItemProps } from './RentalObjectListItem';

export { RentalObjectDetailHeader } from './RentalObjectDetailHeader';
export type { RentalObjectDetailHeaderProps } from './RentalObjectDetailHeader';

export { RentalObjectTableView } from './RentalObjectTableView';
export type { RentalObjectTableViewProps } from './RentalObjectTableView';

export { RentalObjectTabs, TabContent, TabEmptyState } from './RentalObjectTabs';
export type { RentalObjectTabsProps, TabConfig, TabContentProps, TabEmptyStateProps } from './RentalObjectTabs';

export { RentalObjectToolbar } from './RentalObjectToolbar';
export type { RentalObjectToolbarProps, ViewMode } from './RentalObjectToolbar';

// =============================================================================
// Map Component
// =============================================================================

export { RentalObjectMap } from './RentalObjectMap';
export type { RentalObjectMapProps, MapRentalObject } from './RentalObjectMap';

// =============================================================================
// Calendar Components
// =============================================================================

export { AvailabilityCalendar } from './AvailabilityCalendar';
export type { AvailabilityCalendarProps } from './AvailabilityCalendar';

export { RentalObjectAvailabilityCalendar } from './RentalObjectAvailabilityCalendar';
export type { RentalObjectAvailabilityCalendarProps } from './RentalObjectAvailabilityCalendar';

// =============================================================================
// Supporting Components
// =============================================================================

export { KeyFactsRow } from './KeyFactsRow';
export type { KeyFactsRowProps, KeyFact } from './KeyFactsRow';

export { FavoriteButton } from './FavoriteButton';
export type { FavoriteButtonProps } from './FavoriteButton';

export { ShareButton } from './ShareButton';
export type { ShareButtonProps, ShareData, SharePlatform } from './ShareButton';

export { StatusTag } from './StatusBadges';
export type { StatusTagProps, StatusBadgeConfig, BadgeColor } from './StatusBadges';

// =============================================================================
// Bulk Actions
// =============================================================================

export { BulkActionsBar } from './BulkActionsBar';
export type { BulkActionsBarProps } from './BulkActionsBar';

// =============================================================================
// Supporting components - AmenityChips (renamed from FacilityChips)
// =============================================================================

export {
  AmenityChips,
  type AmenityChipsProps,
  type Amenity,
} from '../AmenityChips';

/** @deprecated Use AmenityChips instead */
export { AmenityChips as FacilityChips } from '../AmenityChips';
/** @deprecated Use AmenityChipsProps instead */
export type { AmenityChipsProps as FacilityChipsProps } from '../AmenityChips';
/** @deprecated Use Amenity instead */
export type { Amenity as Facility } from '../AmenityChips';

// =============================================================================
// NOTE: Platform blocks remain in @xalatechnologies/platform/ui
// =============================================================================
// The following components are NOT re-exported here to avoid circular dependencies.
// Import them directly from @xalatechnologies/platform/ui:
//
//   import {
//     GuidelinesTab,
//     FAQTab,
//     ContactInfoCard,
//     OpeningHoursCard,
//     LocationCard,
//     CapacityCard,
//   } from '@xalatechnologies/platform/ui';
//
// These are platform-neutral blocks that will remain in @xalatechnologies/platform/ui.
