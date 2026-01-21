/**
 * Booking Mappers
 *
 * Functions for mapping domain booking DTOs to UI component props.
 * These mappers enable thin wrapper components by providing
 * the DTO -> props transformation layer.
 */

import type {
  BookingCardProjection,
  BookingDetailsProjection,
} from '@digilist/contracts/projections';

// =============================================================================
// Translation Function Type
// =============================================================================

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

// =============================================================================
// Status Badge Types
// =============================================================================

export type BookingStatusColor =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface BookingStatusBadge {
  label: string;
  color: BookingStatusColor;
}

// =============================================================================
// Booking Card Mapper
// =============================================================================

/**
 * Props for booking card display.
 * This interface aligns with typical card patterns.
 */
export interface BookingCardDisplayProps {
  id: string;
  title: string;
  subtitle?: string;
  dateDisplay: string;
  timeDisplay: string;
  durationDisplay?: string;
  priceDisplay?: string;
  imageUrl?: string;
  status: BookingStatusBadge;
  paymentStatus?: BookingStatusBadge;
  isPast: boolean;
  isUpcoming: boolean;
  isCancellable: boolean;
  userName?: string;
}

/**
 * Maps a BookingCardProjection DTO to display props.
 *
 * @param dto - The booking card projection from the API
 * @param t - Translation function for i18n
 * @returns Props for booking card display
 *
 * @example
 * ```tsx
 * const displayProps = mapBookingToCardDisplay(booking, t);
 * return <BookingCard {...displayProps} />;
 * ```
 */
export function mapBookingToCardDisplay(
  dto: BookingCardProjection,
  t: TranslationFn
): BookingCardDisplayProps {
  return {
    id: dto.id,
    title: dto.rentalObjectName,
    dateDisplay: dto.dateDisplay,
    timeDisplay: dto.timeDisplay,
    durationDisplay: dto.durationDisplay,
    priceDisplay: dto.priceDisplay,
    imageUrl: dto.rentalObjectImageUrl,
    status: {
      label: dto.statusLabel,
      color: mapStatusToColor(dto.status),
    },
    paymentStatus: dto.paymentStatusLabel
      ? {
          label: dto.paymentStatusLabel,
          color: mapPaymentStatusToColor(dto.paymentStatus),
        }
      : undefined,
    isPast: dto.isPast,
    isUpcoming: dto.isUpcoming,
    isCancellable: dto.isCancellable,
    userName: dto.userName,
  };
}

// =============================================================================
// Booking Details Mapper
// =============================================================================

/**
 * Props for booking details display.
 */
export interface BookingDetailsDisplayProps extends BookingCardDisplayProps {
  startTime: string;
  endTime: string;
  rentalObject: {
    id: string;
    name: string;
    address?: string;
    imageUrl?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  organization?: {
    id: string;
    name: string;
  } | null;
  payment: {
    total: string;
    breakdown: Array<{ label: string; amount: string }>;
    method?: string;
    paidAt?: string;
  };
  notes?: string;
  canCancel: boolean;
  canModify: boolean;
  actions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    reason?: string;
  }>;
  createdAt: string;
}

/**
 * Maps a BookingDetailsProjection DTO to detailed display props.
 *
 * @param dto - The booking details projection from the API
 * @param t - Translation function for i18n
 * @returns Props for booking details display
 */
export function mapBookingToDetailsDisplay(
  dto: BookingDetailsProjection,
  t: TranslationFn
): BookingDetailsDisplayProps {
  const cardProps = mapBookingToCardDisplay(dto, t);

  return {
    ...cardProps,
    startTime: dto.startTime,
    endTime: dto.endTime,
    rentalObject: {
      id: dto.rentalObjectDetails.id,
      name: dto.rentalObjectDetails.name,
      address: dto.rentalObjectDetails.address,
      imageUrl: dto.rentalObjectDetails.imageUrl,
    },
    user: dto.user,
    organization: dto.organization,
    payment: {
      total: dto.payment.formattedPrice,
      breakdown: dto.payment.breakdown.map((item) => ({
        label: item.label,
        amount: formatCurrency(item.amount, dto.payment.currency),
      })),
      method: dto.payment.method,
      paidAt: dto.payment.paidAt,
    },
    notes: dto.notes,
    canCancel: dto.canCancel,
    canModify: dto.canModify,
    actions: dto.availableActions,
    createdAt: dto.createdAt,
  };
}

// =============================================================================
// Price Summary Mapper
// =============================================================================

/**
 * Price line item for summary display.
 */
export interface PriceSummaryLine {
  id: string;
  label: string;
  amount: string;
  isDiscount?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

/**
 * Maps booking payment details to price summary lines.
 *
 * @param dto - The booking details projection
 * @param t - Translation function
 * @returns Array of price lines for PriceSummaryCard
 */
export function mapBookingToPriceSummary(
  dto: BookingDetailsProjection,
  t: TranslationFn
): PriceSummaryLine[] {
  const lines: PriceSummaryLine[] = [];

  // Add breakdown items
  dto.payment.breakdown.forEach((item, index) => {
    lines.push({
      id: `item-${index}`,
      label: item.label,
      amount: formatCurrency(item.amount, dto.payment.currency),
      isDiscount: item.amount < 0,
    });
  });

  // Add total
  lines.push({
    id: 'total',
    label: t('booking.total'),
    amount: dto.payment.formattedPrice,
    isTotal: true,
  });

  return lines;
}

// =============================================================================
// Calendar Event Mapper
// =============================================================================

/**
 * Calendar event display props.
 */
export interface CalendarEventDisplayProps {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  textColor?: string;
  editable: boolean;
  clickable: boolean;
  resourceId?: string;
  extendedProps: {
    bookingId?: string;
    status: string;
    statusLabel: string;
    userName?: string;
    organizationName?: string;
  };
}

/**
 * Maps calendar event projection to display props.
 */
export function mapCalendarEventToDisplay(
  event: {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    color?: string;
    textColor?: string;
    rentalObjectId: string;
    bookingId?: string;
    status: string;
    statusLabel: string;
    userName?: string;
    organizationName?: string;
    editable: boolean;
    clickable: boolean;
  },
  _t: TranslationFn
): CalendarEventDisplayProps {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    color: event.color,
    textColor: event.textColor,
    editable: event.editable,
    clickable: event.clickable,
    resourceId: event.rentalObjectId,
    extendedProps: {
      bookingId: event.bookingId,
      status: event.status,
      statusLabel: event.statusLabel,
      userName: event.userName,
      organizationName: event.organizationName,
    },
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Maps booking status string to color.
 */
function mapStatusToColor(status: string): BookingStatusColor {
  const statusMap: Record<string, BookingStatusColor> = {
    confirmed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    completed: 'neutral',
    no_show: 'danger',
  };
  return statusMap[status.toLowerCase()] ?? 'neutral';
}

/**
 * Maps payment status string to color.
 */
function mapPaymentStatusToColor(status: string): BookingStatusColor {
  const statusMap: Record<string, BookingStatusColor> = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info',
    partial: 'warning',
  };
  return statusMap[status.toLowerCase()] ?? 'neutral';
}

/**
 * Formats a currency amount.
 */
function formatCurrency(amount: number, currency: string = 'NOK'): string {
  const formatter = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

// =============================================================================
// List/Array Helpers
// =============================================================================

/**
 * Maps an array of booking card projections to display props.
 */
export function mapBookingsToCardDisplays(
  items: BookingCardProjection[],
  t: TranslationFn
): BookingCardDisplayProps[] {
  return items.map((item) => mapBookingToCardDisplay(item, t));
}
