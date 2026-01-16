/**
 * Calendar Zod Schemas
 * Validation schemas for calendar domain (config and availability matrix)
 */
import { z } from 'zod';

// =============================================================================
// Calendar Enums
// =============================================================================

/**
 * Calendar Granularity Enum
 */
export const CalendarGranularitySchema = z.enum(['TIME_SLOTS', 'ALL_DAY', 'MULTI_DAY']);
export type CalendarGranularity = z.infer<typeof CalendarGranularitySchema>;

/**
 * Slot Status Enum
 */
export const SlotStatusSchema = z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED', 'BLACKOUT', 'CLOSED']);
export type SlotStatus = z.infer<typeof SlotStatusSchema>;

/**
 * Selectable Unit Enum
 */
export const SelectableUnitSchema = z.enum(['slot', 'day', 'range']);
export type SelectableUnit = z.infer<typeof SelectableUnitSchema>;

/**
 * Calendar View Enum
 */
export const CalendarViewSchema = z.enum(['month', 'week', 'day']);
export type CalendarView = z.infer<typeof CalendarViewSchema>;

// =============================================================================
// Opening Hours Schemas
// =============================================================================

/**
 * Single Day Opening Hours Schema
 */
export const DayOpeningHoursSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:mm format'),
  closed: z.boolean().optional(),
});

export type DayOpeningHours = z.infer<typeof DayOpeningHoursSchema>;

/**
 * Opening Hours Exception Schema (holidays, special dates)
 */
export const OpeningHoursExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  closed: z.boolean(),
  reasonKey: z.string().optional(),
});

export type OpeningHoursException = z.infer<typeof OpeningHoursExceptionSchema>;

/**
 * Complete Opening Hours Schema
 */
export const OpeningHoursSchema = z.object({
  weekly: z.record(z.string(), DayOpeningHoursSchema),
  exceptions: z.array(OpeningHoursExceptionSchema).optional(),
});

export type OpeningHours = z.infer<typeof OpeningHoursSchema>;

// =============================================================================
// Booking Type Schema
// =============================================================================

/**
 * Booking Type Configuration Schema
 */
export const BookingTypeConfigSchema = z.object({
  code: z.string().min(1),
  labelKey: z.string().min(1),
  default: z.boolean(),
  rules: z.record(z.unknown()).default({}),
});

export type BookingTypeConfig = z.infer<typeof BookingTypeConfigSchema>;

// =============================================================================
// Calendar UI Config Schema
// =============================================================================

/**
 * Calendar UI Configuration Schema
 */
export const CalendarUIConfigSchema = z.object({
  showWeekView: z.boolean(),
  showMonthView: z.boolean(),
  showDayView: z.boolean(),
  defaultView: CalendarViewSchema,
  allowMultiSelect: z.boolean(),
});

export type CalendarUIConfig = z.infer<typeof CalendarUIConfigSchema>;

// =============================================================================
// Calendar Permissions Schema
// =============================================================================

/**
 * Calendar Permissions Schema (RBAC)
 */
export const CalendarPermissionsSchema = z.object({
  canViewCalendar: z.boolean(),
  canSelectSlot: z.boolean(),
  canRequestBooking: z.boolean(),
});

export type CalendarPermissions = z.infer<typeof CalendarPermissionsSchema>;

// =============================================================================
// Action and Policy Decision Schemas (for projection DTOs)
// =============================================================================

/**
 * Action DTO Schema
 */
export const ActionSchema = z.object({
  code: z.string(),
  labelKey: z.string(),
  enabled: z.boolean(),
  href: z.string().optional(),
});

export type Action = z.infer<typeof ActionSchema>;

/**
 * Policy Decision DTO Schema
 */
export const PolicyDecisionSchema = z.object({
  rule: z.string(),
  result: z.boolean(),
  reason: z.string().optional(),
});

export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

// =============================================================================
// Listing Calendar Config Projection Schema
// =============================================================================

/**
 * Listing Calendar Config Projection Schema
 * Response schema for GET /api/listings/:id/calendar-config
 */
export const ListingCalendarConfigProjectionSchema = z.object({
  // Identity
  rentalObjectId: z.string().uuid(),

  // Calendar mode
  granularity: CalendarGranularitySchema,
  timezone: z.string().min(1),

  // Slot behavior
  slotSizeMinutes: z.number().int().positive(),
  selectableUnit: SelectableUnitSchema,
  minDurationMinutes: z.number().int().nonnegative(),
  maxDurationMinutes: z.number().int().positive().optional().nullable(),
  stepMinutes: z.number().int().positive(),
  bufferBeforeMinutes: z.number().int().nonnegative().optional(),
  bufferAfterMinutes: z.number().int().nonnegative().optional(),

  // Booking window rules
  minNoticeMinutes: z.number().int().nonnegative().optional(),
  bookingHorizonDays: z.number().int().positive().optional(),
  allowSameDayBooking: z.boolean(),

  // Opening hours
  openingHours: OpeningHoursSchema,

  // Booking types
  bookingTypes: z.array(BookingTypeConfigSchema),

  // UI hints
  ui: CalendarUIConfigSchema,

  // RBAC
  permissions: CalendarPermissionsSchema,

  // Actions and policy decisions
  availableActions: z.array(ActionSchema),
  policyDecisions: z.array(PolicyDecisionSchema).optional(),
});

export type ListingCalendarConfigProjection = z.infer<typeof ListingCalendarConfigProjectionSchema>;

// =============================================================================
// Availability Cell Schema
// =============================================================================

/**
 * Availability Cell Schema
 * Single cell in the availability matrix
 */
export const AvailabilityCellSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  status: SlotStatusSchema,
  reasonKey: z.string().optional().nullable(),
  bookingId: z.string().uuid().optional().nullable(),
  blockId: z.string().uuid().optional().nullable(),
  lockedUntil: z.string().datetime().optional().nullable(),
});

export type AvailabilityCell = z.infer<typeof AvailabilityCellSchema>;

// =============================================================================
// Slot Status Legend Schema
// =============================================================================

/**
 * Slot Status Legend Entry Schema
 */
export const SlotStatusLegendSchema = z.object({
  status: SlotStatusSchema,
  labelKey: z.string().min(1),
});

export type SlotStatusLegend = z.infer<typeof SlotStatusLegendSchema>;

// =============================================================================
// Listing Availability Matrix Projection Schema
// =============================================================================

/**
 * Listing Availability Matrix Projection Schema
 * Response schema for GET /api/availability/:rentalObjectId
 */
export const ListingAvailabilityMatrixProjectionSchema = z.object({
  rentalObjectId: z.string().uuid(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  granularity: CalendarGranularitySchema,
  cells: z.array(AvailabilityCellSchema),
  legend: z.array(SlotStatusLegendSchema),
});

export type ListingAvailabilityMatrixProjection = z.infer<typeof ListingAvailabilityMatrixProjectionSchema>;

// =============================================================================
// Query Parameters Schemas
// =============================================================================

/**
 * Calendar Config Query Params Schema
 * Query params for GET /api/listings/:id/calendar-config
 */
export const CalendarConfigQuerySchema = z.object({
  bookingType: z.string().optional(),
});

export type CalendarConfigQueryParams = z.infer<typeof CalendarConfigQuerySchema>;

/**
 * Availability Matrix Query Params Schema
 * Query params for GET /api/availability/:rentalObjectId
 */
export const AvailabilityMatrixQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  bookingType: z.string().optional(),
}).refine((data) => data.from <= data.to, {
  message: 'From date must be before or equal to to date',
  path: ['from'],
});

export type AvailabilityMatrixQueryParams = z.infer<typeof AvailabilityMatrixQuerySchema>;

// =============================================================================
// Route Parameter Schemas
// =============================================================================

/**
 * Calendar Config Route Params Schema
 */
export const CalendarConfigRouteParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CalendarConfigRouteParams = z.infer<typeof CalendarConfigRouteParamsSchema>;

/**
 * Availability Matrix Route Params Schema
 */
export const AvailabilityMatrixRouteParamsSchema = z.object({
  rentalObjectId: z.string().uuid(),
});

export type AvailabilityMatrixRouteParams = z.infer<typeof AvailabilityMatrixRouteParamsSchema>;
