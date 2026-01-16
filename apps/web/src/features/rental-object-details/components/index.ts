/**
 * Rental Object Details Components Index
 */

// Layout composition
export { RentalObjectDetailsLayout, type RentalObjectDetailsLayoutProps } from './RentalObjectDetailsLayout';

// Header components
export { RentalObjectHeader, type RentalObjectHeaderProps } from './RentalObjectHeader';
export { KeyFactsRow, type KeyFactsRowProps } from './KeyFactsRow';
export { FavoriteButton, type FavoriteButtonProps } from './FavoriteButton';
export { ShareButton, type ShareButtonProps } from './ShareButton';

// Tab content components
export { OverviewTab, type OverviewTabProps } from './OverviewTab';
export { ActivityTab, type ActivityTabProps } from './ActivityTab';
export { RulesTab, type RulesTabProps } from './RulesTab';
export { FaqTab, type FaqTabProps } from './FaqTab';

// Booking mode selector
export {
  BookingModeSelector,
  createBookingModeOptions,
  type BookingModeSelectorProps,
  type BookingModeOption,
} from './BookingModeSelector';

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
