/**
 * Rental Object Detail Types
 *
 * Type definitions for the rental object detail page components.
 */

/**
 * Rental object type enum matching the schema
 */
export type RentalObjectType = 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER';

/**
 * @deprecated Use RentalObjectType instead
 */
export type ListingType = RentalObjectType;

/**
 * Time slot availability status
 */
export type TimeSlotStatus = 'available' | 'occupied' | 'selected' | 'unavailable';

/**
 * Image for gallery display
 */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
}

/**
 * Amenity with optional icon
 */
export interface Amenity {
  id: string;
  label: string;
  icon?: string;
}

/**
 * @deprecated Use Amenity instead
 */
export type Facility = Amenity;

/**
 * Additional service with pricing
 */
export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  name?: string;
}

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Opening hours for a single day
 */
export interface OpeningHoursDay {
  day: string;
  hours: string;
  isClosed?: boolean;
}

/**
 * Time slot for availability calendar
 */
export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime?: string;
  status: TimeSlotStatus;
}

/**
 * Breadcrumb navigation item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Booking step
 */
export interface BookingStep {
  id: string;
  label: string;
}

/**
 * Activity type for booking
 */
export type ActivityType =
  | 'meeting'      // Mote
  | 'training'     // Trening
  | 'event'        // Arrangement
  | 'workshop'     // Workshop
  | 'presentation' // Presentasjon
  | 'party'        // Fest/Selskap
  | 'other';       // Annet

/**
 * Booking details form data
 */
export interface BookingDetails {
  /** Contact name */
  name: string;
  /** Contact email */
  email: string;
  /** Contact phone */
  phone: string;
  /** Additional notes (short description) */
  notes?: string;
  /** Whether terms are accepted */
  acceptedTerms: boolean;
  /** Purpose of booking */
  purpose?: string;
  /** Show purpose in calendar */
  showPurposeInCalendar?: boolean;
  /** Book multiple days */
  bookMultipleDays?: boolean;
  /** Number of attendees */
  numberOfPeople?: number;
  /** Type of activity */
  activityType?: ActivityType;
  /** Organization name */
  organization?: string;
}

/**
 * Booking state
 */
export interface BookingState {
  selectedSlots: TimeSlot[];
  currentStep: number;
  bookingDetails: BookingDetails;
}

/**
 * Guideline section for accordion
 */
export interface GuidelineSection {
  id: string;
  title: string;
  content: string;
}

/**
 * FAQ item for accordion
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Complete rental object detail data
 */
export interface RentalObjectDetail {
  id: string;
  name: string;
  category: string;
  rentalObjectType: RentalObjectType;
  location: string;
  description: string;
  images: GalleryImage[];
  capacity?: number;
  amenities: Amenity[];
  additionalServices?: AdditionalService[];
  contact?: ContactInfo;
  coordinates?: Coordinates;
  openingHours?: OpeningHoursDay[];
  guidelines?: GuidelineSection[];
  faq?: FAQItem[];
  /** Base price */
  price?: number;
  /** Price unit (e.g., 'time', 'dag') */
  priceUnit?: string;
  /** Currency code */
  currency?: string;
}

/**
 * @deprecated Use RentalObjectDetail instead
 */
export type ListingDetail = RentalObjectDetail;

// =============================================================================
// Calendar Component Types
// =============================================================================

/**
 * Calendar display and selection mode
 * - TIME_SLOTS: Week/day view with time slots (e.g., hourly booking)
 * - ALL_DAY: Month view with day selection (e.g., full-day booking)
 * - MULTI_DAY: Month view with date range selection (e.g., accommodation)
 */
export type CalendarMode = 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';

/**
 * Availability status for calendar slots
 * Matches API SlotStatus for consistency
 */
export type CalendarSlotStatus =
  | 'AVAILABLE'  // Slot can be booked
  | 'RESERVED'   // Temporarily held (lock)
  | 'BOOKED'     // Confirmed booking
  | 'BLOCKED'    // Manually blocked by admin
  | 'BLACKOUT'   // System blackout period
  | 'CLOSED';    // Outside opening hours

/**
 * Selection type for calendar interaction
 */
export type CalendarSelectionType = 'slot' | 'day' | 'range';

/**
 * Available calendar view modes
 */
export type CalendarViewMode = 'month' | 'week' | 'day';

/**
 * Single cell in the availability calendar
 */
export interface CalendarCell {
  /** Unique identifier for the cell */
  id: string;
  /** Start datetime (ISO string) */
  start: string;
  /** End datetime (ISO string) */
  end: string;
  /** Current availability status */
  status: CalendarSlotStatus;
  /** i18n key explaining unavailability reason */
  reasonKey?: string | null;
  /** Associated booking ID if booked/reserved */
  bookingId?: string | null;
  /** Associated block ID if blocked/blackout */
  blockId?: string | null;
  /** When a reservation lock expires (ISO string) */
  lockedUntil?: string | null;
}

/**
 * Selected time range for booking
 */
export interface CalendarSelectionRange {
  /** Start date (ISO string) */
  startDate: string;
  /** End date (ISO string, inclusive) */
  endDate: string;
  /** Start time for time-slot mode (HH:mm) */
  startTime?: string;
  /** End time for time-slot mode (HH:mm) */
  endTime?: string;
}

/**
 * Current calendar selection state
 */
export interface CalendarSelection {
  /** Selected cells/slots */
  cells: CalendarCell[];
  /** Date range for range selections */
  range?: CalendarSelectionRange;
  /** Whether selection is valid for booking */
  isValid: boolean;
  /** Validation error i18n key if invalid */
  errorKey?: string;
}

/**
 * Legend item for slot status display
 */
export interface CalendarLegendItem {
  /** Status code */
  status: CalendarSlotStatus;
  /** i18n key for label */
  labelKey: string;
  /** Norwegian display label */
  label: string;
}

/**
 * Calendar slot status labels (Norwegian)
 */
export const CALENDAR_SLOT_STATUS_LABELS: Record<CalendarSlotStatus, string> = {
  AVAILABLE: 'Ledig',
  RESERVED: 'Reservert',
  BOOKED: 'Booket',
  BLOCKED: 'Blokkert',
  BLACKOUT: 'Utilgjengelig',
  CLOSED: 'Stengt',
};

/**
 * Calendar slot status i18n keys
 */
export const CALENDAR_SLOT_STATUS_KEYS: Record<CalendarSlotStatus, string> = {
  AVAILABLE: 'calendar.slot.available',
  RESERVED: 'calendar.slot.reserved',
  BOOKED: 'calendar.slot.booked',
  BLOCKED: 'calendar.slot.blocked',
  BLACKOUT: 'calendar.slot.blackout',
  CLOSED: 'calendar.slot.closed',
};

/**
 * Calendar mode display labels (Norwegian)
 */
export const CALENDAR_MODE_LABELS: Record<CalendarMode, string> = {
  TIME_SLOTS: 'Tidsluke',
  ALL_DAY: 'Heldag',
  MULTI_DAY: 'Flere dager',
};

/**
 * Default legend items for calendar status display
 */
export const DEFAULT_CALENDAR_LEGEND: CalendarLegendItem[] = [
  { status: 'AVAILABLE', labelKey: 'calendar.slot.available', label: 'Ledig' },
  { status: 'RESERVED', labelKey: 'calendar.slot.reserved', label: 'Reservert' },
  { status: 'BOOKED', labelKey: 'calendar.slot.booked', label: 'Booket' },
  { status: 'BLOCKED', labelKey: 'calendar.slot.blocked', label: 'Blokkert' },
  { status: 'BLACKOUT', labelKey: 'calendar.slot.blackout', label: 'Utilgjengelig' },
  { status: 'CLOSED', labelKey: 'calendar.slot.closed', label: 'Stengt' },
];

/**
 * Check if a calendar slot status allows selection
 */
export function isCalendarSlotSelectable(status: CalendarSlotStatus): boolean {
  return status === 'AVAILABLE';
}

/**
 * Get the display label for a calendar slot status
 */
export function getCalendarSlotLabel(status: CalendarSlotStatus): string {
  return CALENDAR_SLOT_STATUS_LABELS[status] ?? status;
}

/**
 * Get the i18n key for a calendar slot status
 */
export function getCalendarSlotKey(status: CalendarSlotStatus): string {
  return CALENDAR_SLOT_STATUS_KEYS[status] ?? `calendar.slot.${status.toLowerCase()}`;
}
