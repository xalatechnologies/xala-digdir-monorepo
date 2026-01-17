/**
 * Sidebar Components Index
 */

export { ContactWidget, type ContactWidgetProps } from './ContactWidget';
export { MapWidget, type MapWidgetProps } from './MapWidget';
export { OpeningHoursWidget, type OpeningHoursWidgetProps } from './OpeningHoursWidget';
export { BookingWidgetPlacement, type BookingWidgetPlacementProps } from './BookingWidgetPlacement';

// Booking Step Components
export { BookingVisibilitySelector, type BookingVisibility, type BookingVisibilitySelectorProps } from './components/BookingVisibilitySelector';
export { BookingContextSelector, type BookingContext, type BookingContextType, type BookingContextSelectorProps } from './components/BookingContextSelector';
export { BookingAddOnsSelector, type AddOn, type SelectedAddOn, type BookingAddOnsSelectorProps } from './components/BookingAddOnsSelector';
export { PriceBreakdown, type PriceBreakdownData, type PriceBreakdownProps, type PriceLineItem } from './components/PriceBreakdown';

// Recurring Booking Components
export { RecurringBuilder, type RecurringBuilderProps, type RecurringPattern } from './components/RecurringBuilder';
export { RecurringPreview, type RecurringPreviewProps } from './components/RecurringPreview';
export { ConflictResolver, type ConflictResolverProps, type AlternativeSlot, type ConflictResolution } from './components/ConflictResolver';

// Booking Mode Selector
export { BookingModeSelector, type BookingModeSelectorProps } from './components/BookingModeSelector';
