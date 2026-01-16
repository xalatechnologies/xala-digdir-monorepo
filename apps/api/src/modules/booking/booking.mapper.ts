/**
 * Booking ACL Mapper - Anti-Corruption Layer
 *
 * Transforms raw database booking entities to screen-ready projection DTOs.
 * This is the ONLY place where booking data transformation should happen.
 * UI components receive these projection DTOs directly - no further transformation allowed.
 */

// =============================================================================
// INTERNAL DB TYPES (Not exported - internal to ACL layer)
// =============================================================================

interface DbBooking {
  id: string;
  tenantId: string;
  rentalObjectId: string;
  userId: string;
  status: string;
  startTime: Date;
  endTime: Date;
  totalPrice: string | number;
  currency: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  // Denormalized/joined fields
  rentalObjectName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  organizationName?: string;
  organizationId?: string;
}

interface DbRecurringBooking extends DbBooking {
  frequency?: string;
  weekdays?: number[];
  endConditionType?: string;
  occurrenceCount?: number;
  parentBookingId?: string;
}

// =============================================================================
// PROJECTION DTOs (Exported for SDK/UI consumption)
// =============================================================================

/**
 * Booking card projection for list views
 */
export interface BookingCardProjectionDTO {
  id: string;
  tenantId: string;
  
  // Rental Object Info
  rentalObjectId: string;
  rentalObjectName: string;
  
  // User Info
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // Organization Info (if applicable)
  organizationId: string | null;
  organizationName: string | null;
  
  // Status
  status: string;
  statusLabel: string;
  statusColor: string;
  
  // Timing
  startTime: string;
  endTime: string;
  dateDisplay: string;
  timeDisplay: string;
  durationDisplay: string;
  durationMinutes: number;
  
  // Pricing
  totalPrice: number;
  currency: string;
  priceDisplay: string;
  
  // Flags
  isPast: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  isCancellable: boolean;
  isModifiable: boolean;
  
  // Actions & Permissions
  availableActions: string[];
  permissions: {
    canView: boolean;
    canCancel: boolean;
    canModify: boolean;
    canApprove: boolean;
    canReject: boolean;
    canComplete: boolean;
  };
  
  // Metadata
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking details projection for detail views
 */
export interface BookingDetailsProjectionDTO extends BookingCardProjectionDTO {
  // Extended rental object info
  rentalObjectSlug: string;
  rentalObjectCategory: string;
  rentalObjectLocation: string;
  
  // Payment info
  paymentStatus: string;
  paymentStatusLabel: string;
  
  // History/Timeline
  timeline: Array<{
    id: string;
    action: string;
    actionLabel: string;
    timestamp: string;
    actorName: string;
    details: string;
  }>;
  
  // Documents
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
  }>;
  
  // Recurring info (if applicable)
  isRecurring: boolean;
  recurringInfo: {
    frequency: string;
    frequencyLabel: string;
    weekdays: number[];
    weekdaysLabel: string;
    occurrenceCount: number;
    parentBookingId: string | null;
  } | null;
}

/**
 * Booking receipt projection (KRAV-ADM-07)
 */
export interface BookingReceiptProjectionDTO {
  receiptNumber: string;
  bookingId: string;
  generatedAt: string;
  
  // WHO (Hvem)
  customer: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  
  // WHAT (Hva)
  service: {
    rentalObjectId: string;
    rentalObjectName: string;
    description: string;
    duration: string;
  };
  
  // WHERE (Hvor)
  location: {
    tenantId: string;
    tenantName: string;
    address: string;
  };
  
  // WHEN (Når)
  timing: {
    bookingDate: string;
    bookingDateDisplay: string;
    serviceDate: string;
    serviceDateDisplay: string;
    serviceTime: string;
    receiptDate: string;
    receiptDateDisplay: string;
  };
  
  // AMOUNT
  payment: {
    amount: number;
    currency: string;
    amountDisplay: string;
    status: string;
    statusLabel: string;
  };
}

/**
 * Calendar event projection
 */
export interface CalendarEventProjectionDTO {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  bookingId: string | null;
  
  // Timing
  start: string;
  end: string;
  title: string;
  
  // Display
  color: string;
  status: string;
  statusLabel: string;
  
  // User info
  userName: string;
  organizationName: string | null;
  
  // Flags
  isAllDay: boolean;
  isEditable: boolean;
}

// =============================================================================
// LABEL/COLOR MAPPINGS - Use i18n keys
// =============================================================================

const STATUS_LABELS: Record<string, string> = {
  pending: 'sdk.booking.status.pending',
  confirmed: 'sdk.booking.status.confirmed',
  cancelled: 'sdk.booking.status.cancelled',
  completed: 'sdk.booking.status.completed',
  rejected: 'sdk.booking.status.rejected',
  pending_approval: 'sdk.booking.status.pendingApproval',
  no_show: 'sdk.booking.status.noShow',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'neutral',
  completed: 'info',
  rejected: 'danger',
  pending_approval: 'warning',
  no_show: 'danger',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'sdk.payment.status.pending',
  paid: 'sdk.payment.status.paid',
  refunded: 'sdk.payment.status.refunded',
  failed: 'sdk.payment.status.failed',
};

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'sdk.booking.frequency.weekly',
  MONTHLY: 'sdk.booking.frequency.monthly',
  DAILY: 'sdk.booking.frequency.daily',
};

const WEEKDAY_LABELS: string[] = [
  'sdk.weekday.sunday',
  'sdk.weekday.monday',
  'sdk.weekday.tuesday',
  'sdk.weekday.wednesday',
  'sdk.weekday.thursday',
  'sdk.weekday.friday',
  'sdk.weekday.saturday',
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function safeString(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function safeNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('nb-NO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTimeDisplay(start: Date | string, end: Date | string): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  
  const startTime = s.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  const endTime = e.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  
  return `${startTime} - ${endTime}`;
}

function calculateDuration(start: Date | string, end: Date | string): { minutes: number; display: string } {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  
  const minutes = Math.round((e.getTime() - s.getTime()) / 60000);
  
  if (minutes < 60) {
    return { minutes, display: `${minutes} sdk.duration.minutes` };
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return { minutes, display: `${hours} sdk.duration.hours` };
  }
  
  return { minutes, display: `${hours} sdk.duration.hours ${remainingMins} sdk.duration.minutes` };
}

function formatPrice(amount: number, currency: string): string {
  if (amount === 0) return 'sdk.booking.free';
  return `${amount.toFixed(2)} ${currency}`;
}

function getBookingFlags(booking: DbBooking): {
  isPast: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  isCancellable: boolean;
  isModifiable: boolean;
} {
  const now = new Date();
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const bookingDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  
  const isPast = end < now;
  const isToday = bookingDate.getTime() === today.getTime();
  const isUpcoming = start > now;
  
  // Cancellable if not already cancelled/completed and upcoming
  const isCancellable = 
    isUpcoming && 
    !['cancelled', 'completed', 'rejected'].includes(booking.status);
  
  // Modifiable if confirmed and upcoming
  const isModifiable = 
    isUpcoming && 
    booking.status === 'confirmed';
  
  return { isPast, isToday, isUpcoming, isCancellable, isModifiable };
}

function getAvailableActions(booking: DbBooking, userRole: string = 'member'): string[] {
  const actions: string[] = ['view'];
  const flags = getBookingFlags(booking);
  
  if (flags.isCancellable) {
    actions.push('cancel');
  }
  
  if (flags.isModifiable) {
    actions.push('modify');
  }
  
  // Admin/caseworker actions
  if (['admin', 'caseworker', 'ADMIN', 'CASEWORKER', 'SAAS_ADMIN'].includes(userRole)) {
    if (booking.status === 'pending' || booking.status === 'pending_approval') {
      actions.push('approve', 'reject');
    }
    if (booking.status === 'confirmed' && !flags.isPast) {
      actions.push('complete');
    }
  }
  
  return actions;
}

function getPermissions(booking: DbBooking, userRole: string = 'member', isOwner: boolean = false): BookingCardProjectionDTO['permissions'] {
  const flags = getBookingFlags(booking);
  const isAdmin = ['admin', 'caseworker', 'ADMIN', 'CASEWORKER', 'SAAS_ADMIN'].includes(userRole);
  
  return {
    canView: true,
    canCancel: (isOwner || isAdmin) && flags.isCancellable,
    canModify: (isOwner || isAdmin) && flags.isModifiable,
    canApprove: isAdmin && ['pending', 'pending_approval'].includes(booking.status),
    canReject: isAdmin && ['pending', 'pending_approval'].includes(booking.status),
    canComplete: isAdmin && booking.status === 'confirmed' && !flags.isPast,
  };
}

function formatWeekdays(weekdays: number[]): string {
  if (!weekdays || weekdays.length === 0) return '';
  return weekdays.map(d => WEEKDAY_LABELS[d] || `sdk.weekday.${d}`).join(', ');
}

// =============================================================================
// MAIN MAPPER FUNCTIONS
// =============================================================================

/**
 * Map a database booking to a card projection DTO
 */
export function toBookingCardProjection(
  booking: DbBooking,
  options: { userRole?: string; isOwner?: boolean } = {}
): BookingCardProjectionDTO {
  const { userRole = 'member', isOwner = false } = options;
  const flags = getBookingFlags(booking);
  const duration = calculateDuration(booking.startTime, booking.endTime);
  const totalPrice = safeNumber(booking.totalPrice);
  
  return {
    id: booking.id,
    tenantId: booking.tenantId,
    
    rentalObjectId: booking.rentalObjectId,
    rentalObjectName: booking.rentalObjectName || 'sdk.placeholder.unknown',
    
    userId: booking.userId,
    userName: booking.userName || 'sdk.placeholder.unknown',
    userEmail: booking.userEmail || '',
    userPhone: booking.userPhone || '',
    
    organizationId: booking.organizationId || null,
    organizationName: booking.organizationName || null,
    
    status: booking.status,
    statusLabel: STATUS_LABELS[booking.status] || `sdk.booking.status.${booking.status}`,
    statusColor: STATUS_COLORS[booking.status] || 'neutral',
    
    startTime: formatDate(booking.startTime),
    endTime: formatDate(booking.endTime),
    dateDisplay: formatDateDisplay(booking.startTime),
    timeDisplay: formatTimeDisplay(booking.startTime, booking.endTime),
    durationDisplay: duration.display,
    durationMinutes: duration.minutes,
    
    totalPrice,
    currency: booking.currency || 'NOK',
    priceDisplay: formatPrice(totalPrice, booking.currency || 'NOK'),
    
    isPast: flags.isPast,
    isToday: flags.isToday,
    isUpcoming: flags.isUpcoming,
    isCancellable: flags.isCancellable,
    isModifiable: flags.isModifiable,
    
    availableActions: getAvailableActions(booking, userRole),
    permissions: getPermissions(booking, userRole, isOwner),
    
    notes: booking.notes || '',
    createdAt: formatDate(booking.createdAt),
    updatedAt: formatDate(booking.updatedAt),
  };
}

/**
 * Map a database booking to a details projection DTO
 */
export function toBookingDetailsProjection(
  booking: DbBooking & { 
    rentalObjectSlug?: string; 
    rentalObjectCategory?: string;
    rentalObjectLocation?: string;
    paymentStatus?: string;
    timeline?: Array<{ action: string; timestamp: Date; actorName: string; details: string }>;
    documents?: Array<{ id: string; type: string; name: string; url: string }>;
  },
  options: { userRole?: string; isOwner?: boolean } = {}
): BookingDetailsProjectionDTO {
  const card = toBookingCardProjection(booking, options);
  const meta = booking.metadata || {};
  
  // Build timeline
  const timeline = (booking.timeline || []).map((event, i) => ({
    id: `timeline-${i}`,
    action: event.action,
    actionLabel: `sdk.booking.action.${event.action}`,
    timestamp: formatDate(event.timestamp),
    actorName: event.actorName || 'sdk.placeholder.system',
    details: event.details || '',
  }));
  
  // Build documents list
  const documents = (booking.documents || []).map(doc => ({
    id: doc.id,
    type: doc.type,
    name: doc.name,
    url: doc.url,
  }));
  
  // Check if recurring
  const isRecurring = Boolean(meta.recurring);
  const recurringInfo = isRecurring ? {
    frequency: safeString(meta.frequency) || 'WEEKLY',
    frequencyLabel: FREQUENCY_LABELS[safeString(meta.frequency)] || 'sdk.booking.frequency.weekly',
    weekdays: (meta.weekdays as number[]) || [],
    weekdaysLabel: formatWeekdays((meta.weekdays as number[]) || []),
    occurrenceCount: safeNumber(meta.occurrenceCount) || 1,
    parentBookingId: safeString(meta.parentBookingId) || null,
  } : null;
  
  return {
    ...card,
    
    rentalObjectSlug: booking.rentalObjectSlug || '',
    rentalObjectCategory: booking.rentalObjectCategory || '',
    rentalObjectLocation: booking.rentalObjectLocation || '',
    
    paymentStatus: booking.paymentStatus || 'pending',
    paymentStatusLabel: PAYMENT_STATUS_LABELS[booking.paymentStatus || 'pending'] || 'sdk.payment.status.pending',
    
    timeline,
    documents,
    
    isRecurring,
    recurringInfo,
  };
}

/**
 * Map a database booking to a receipt projection DTO (KRAV-ADM-07)
 */
export function toBookingReceiptProjection(
  booking: DbBooking,
  tenantInfo: { name: string; address?: string } = { name: 'sdk.placeholder.unknown' }
): BookingReceiptProjectionDTO {
  const totalPrice = safeNumber(booking.totalPrice);
  const duration = calculateDuration(booking.startTime, booking.endTime);
  
  return {
    receiptNumber: `REC-${booking.id.slice(0, 8).toUpperCase()}`,
    bookingId: booking.id,
    generatedAt: new Date().toISOString(),
    
    customer: {
      userId: booking.userId,
      userName: booking.userName || 'sdk.placeholder.unknown',
      userEmail: booking.userEmail || '',
    },
    
    service: {
      rentalObjectId: booking.rentalObjectId,
      rentalObjectName: booking.rentalObjectName || 'sdk.placeholder.unknown',
      description: booking.notes || 'sdk.booking.defaultDescription',
      duration: duration.display,
    },
    
    location: {
      tenantId: booking.tenantId,
      tenantName: tenantInfo.name,
      address: tenantInfo.address || '',
    },
    
    timing: {
      bookingDate: formatDate(booking.createdAt),
      bookingDateDisplay: formatDateDisplay(booking.createdAt),
      serviceDate: formatDate(booking.startTime),
      serviceDateDisplay: formatDateDisplay(booking.startTime),
      serviceTime: formatTimeDisplay(booking.startTime, booking.endTime),
      receiptDate: new Date().toISOString(),
      receiptDateDisplay: formatDateDisplay(new Date()),
    },
    
    payment: {
      amount: totalPrice,
      currency: booking.currency || 'NOK',
      amountDisplay: formatPrice(totalPrice, booking.currency || 'NOK'),
      status: booking.status,
      statusLabel: STATUS_LABELS[booking.status] || 'sdk.booking.status.unknown',
    },
  };
}

/**
 * Map database bookings to calendar event projections
 */
export function toCalendarEventProjection(
  booking: DbBooking,
  options: { isEditable?: boolean } = {}
): CalendarEventProjectionDTO {
  return {
    id: `booking-${booking.id}`,
    rentalObjectId: booking.rentalObjectId,
    rentalObjectName: booking.rentalObjectName || 'sdk.placeholder.unknown',
    bookingId: booking.id,
    
    start: formatDate(booking.startTime),
    end: formatDate(booking.endTime),
    title: booking.userName || booking.notes || 'sdk.booking.defaultTitle',
    
    color: STATUS_COLORS[booking.status] || 'neutral',
    status: booking.status,
    statusLabel: STATUS_LABELS[booking.status] || 'sdk.booking.status.unknown',
    
    userName: booking.userName || 'sdk.placeholder.unknown',
    organizationName: booking.organizationName || null,
    
    isAllDay: false,
    isEditable: options.isEditable ?? false,
  };
}

/**
 * Map multiple bookings to card projections
 */
export function toBookingCardProjections(
  bookings: DbBooking[],
  options: { userRole?: string; userId?: string } = {}
): BookingCardProjectionDTO[] {
  return bookings.map(booking => 
    toBookingCardProjection(booking, {
      userRole: options.userRole,
      isOwner: booking.userId === options.userId,
    })
  );
}

/**
 * Map multiple bookings to calendar events
 */
export function toCalendarEventProjections(
  bookings: DbBooking[],
  options: { isEditable?: boolean } = {}
): CalendarEventProjectionDTO[] {
  return bookings.map(booking => toCalendarEventProjection(booking, options));
}
