/**
 * Rental Object Details Feature
 *
 * Main export file for the rental object details feature.
 * Exports types, components, adapters, and presenters.
 */

// Types - explicit exports to avoid conflicts
export type {
  RentalObjectType,
  BookingMode,
  ApprovalMode,
  GeoCoordinates,
  Address,
  ContactInfo,
  DayHours,
  ExceptionalDay,
  OpeningHours,
  Amenity,
  IncludedEquipment,
  /** @deprecated Use IncludedEquipment instead */
  IncludedFacility,
  Rule,
  FAQItem,
  RentalObjectEvent,
  RentalHistoryItem,
  ActivityData,
  BookingConfig,
  RentalObjectMetadata,
  RentalObjectImage,
  KeyFacts,
  Listing,
  FavoriteState,
  ShareOptions,
  AuditEventType,
  AuditEvent,
  RealtimeEventType,
  RealtimeEvent,
  RentalObjectDetailsI18n,
  TabsProps,
  SidebarProps,
} from './types';

// Presenters
export {
  createPresenter,
  getRentalObjectTypeLabel,
  getBookingModeLabel,
  isCurrentlyOpen,
  type RentalObjectTypeConfig,
  type KeyFactConfig,
  type ActivityTabConfig,
} from './presenters/rentalObjectTypePresenter';

// Adapters
export * from './adapters';

// Components - explicit exports
export {
  RentalObjectDetailsLayout,
  RentalObjectHeader,
  KeyFactsRow,
  FavoriteButton,
  ShareButton,
  OverviewTab,
  ActivityTab,
  RulesTab,
  FaqTab,
  ContactWidget,
  MapWidget,
  OpeningHoursWidget,
  BookingWidgetPlacement,
  CalendarSection,
} from './components';

export type {
  RentalObjectDetailsLayoutProps,
  RentalObjectHeaderProps,
  KeyFactsRowProps,
  FavoriteButtonProps,
  ShareButtonProps,
  OverviewTabProps,
  ActivityTabProps,
  RulesTabProps,
  FaqTabProps,
  ContactWidgetProps,
  MapWidgetProps,
  OpeningHoursWidgetProps,
  BookingWidgetPlacementProps,
  CalendarSectionProps,
} from './components';
