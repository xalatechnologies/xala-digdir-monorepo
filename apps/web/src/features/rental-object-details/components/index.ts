/**
 * Rental Object Details Components Index
 */

// Layout composition
export { RentalObjectDetailsLayout, type RentalObjectDetailsLayoutProps } from './RentalObjectDetailsLayout';

// Header components
export { RentalObjectHeader, type RentalObjectHeaderProps } from './RentalObjectHeader';

// Re-export from @digilist/ui (domain components)
export {
  KeyFactsRow,
  type KeyFactsRowProps,
  type KeyFact,
  FavoriteButton,
  type FavoriteButtonProps,
  ShareButton,
  type ShareButtonProps,
  type ShareData,
  type SharePlatform,
} from '@digilist/ui/blocks/rental-objects';

// Tab content components
export { OverviewTab, type OverviewTabProps } from './OverviewTab';
export { ActivityTab, type ActivityTabProps } from './ActivityTab';
export { RulesTab, type RulesTabProps } from './RulesTab';
export { FaqTab, type FaqTabProps } from './FaqTab';

// Booking mode selector (re-exported from @digilist/ui)
export {
  BookingModeSelector,
  createBookingModeOptions,
  type BookingModeSelectorProps,
  type BookingModeOption,
  type BookingModeType,
} from '@digilist/ui/features/booking';

// Sidebar widgets
export {
  ContactWidget,
  MapWidget,
  OpeningHoursWidget,
  BookingWidgetPlacement,
  type ContactWidgetProps,
  type MapWidgetProps,
  type OpeningHoursWidgetProps,
  type BookingWidgetPlacementProps,
} from './Sidebar';

// Calendar section
export { CalendarSection, type CalendarSectionProps } from './CalendarSection';
