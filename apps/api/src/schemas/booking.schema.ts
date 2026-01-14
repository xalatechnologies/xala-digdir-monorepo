/**
 * Booking Zod Schemas
 * Validation schemas for booking domain
 */
import { z } from 'zod';

/**
 * Booking Status Enum
 */
export const BookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * Full Booking Schema
 */
export const BookingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  listingId: z.string().uuid(),
  userId: z.string().uuid(),
  status: BookingStatusSchema.default('pending'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalPrice: z.string().or(z.number()).transform((v) => Number(v)),
  currency: z.string().length(3).default('NOK'),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Create Booking DTO
 */
export const CreateBookingSchema = z.object({
  listingId: z.string().uuid(),
  userId: z.string().uuid().optional(), // Optional if taken from auth context
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalPrice: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;

/**
 * Update Booking DTO
 */
export const UpdateBookingSchema = z.object({
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  notes: z.string().max(1000).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateBookingDTO = z.infer<typeof UpdateBookingSchema>;

/**
 * Cancel Booking DTO
 */
export const CancelBookingSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export type CancelBookingDTO = z.infer<typeof CancelBookingSchema>;

/**
 * Booking Query Params
 */
export const BookingQuerySchema = z.object({
  listingId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: BookingStatusSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type BookingQueryParams = z.infer<typeof BookingQuerySchema>;

/**
 * Calendar Event Schema (for calendar view)
 */
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  listingId: z.string().uuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  status: BookingStatusSchema,
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// =============================================================================
// Recurring Booking Schemas
// =============================================================================

/**
 * Booking Mode Enum
 * Defines the different booking modes supported by listings
 */
export const BookingModeSchema = z.enum(['SINGLE_SLOT', 'IN_GAME', 'RECURRING']);
export type BookingMode = z.infer<typeof BookingModeSchema>;

/**
 * Recurring Frequency Enum
 * Supported recurrence patterns for recurring bookings
 */
export const RecurringFrequencySchema = z.enum(['WEEKLY', 'MONTHLY']);
export type RecurringFrequency = z.infer<typeof RecurringFrequencySchema>;

/**
 * Occurrence Status Enum
 * Status of individual occurrences in a recurring booking preview
 */
export const OccurrenceStatusSchema = z.enum([
  'AVAILABLE',
  'CONFLICT',
  'RESERVED',
  'BLOCKED',
  'BLACKOUT',
  'CLOSED',
]);
export type OccurrenceStatus = z.infer<typeof OccurrenceStatusSchema>;

/**
 * Recurring End Condition Type Enum
 */
export const RecurringEndConditionTypeSchema = z.enum(['AFTER_OCCURRENCES', 'UNTIL_DATE']);
export type RecurringEndConditionType = z.infer<typeof RecurringEndConditionTypeSchema>;

/**
 * Recurring End Condition Schema
 * Defines when a recurring booking series should end
 */
export const RecurringEndConditionSchema = z.object({
  type: RecurringEndConditionTypeSchema,
  occurrences: z.number().int().positive().max(52).optional(),
  untilDate: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.type === 'AFTER_OCCURRENCES') {
      return data.occurrences !== undefined && data.occurrences > 0;
    }
    if (data.type === 'UNTIL_DATE') {
      return data.untilDate !== undefined;
    }
    return true;
  },
  {
    message: 'End condition must include occurrences for AFTER_OCCURRENCES or untilDate for UNTIL_DATE',
    path: ['type'],
  }
);
export type RecurringEndCondition = z.infer<typeof RecurringEndConditionSchema>;

/**
 * Booking Metadata Schema
 * Additional metadata for bookings
 */
export const BookingMetadataSchema = z.object({
  attendees: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  recurring: z.boolean().optional(),
  frequency: z.string().optional(),
  weekdays: z.array(z.number().int().min(1).max(7)).optional(),
}).passthrough();
export type BookingMetadata = z.infer<typeof BookingMetadataSchema>;

/**
 * Booking Selection Schema
 * Unified selection model across all booking modes (SINGLE_SLOT, IN_GAME, RECURRING)
 */
export const BookingSelectionSchema = z.object({
  listingId: z.string().uuid(),
  mode: BookingModeSchema,
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  metadata: BookingMetadataSchema.optional(),

  // Recurring-specific fields
  frequency: RecurringFrequencySchema.optional(),
  weekdays: z.array(z.number().int().min(1).max(7)).optional(),
  endCondition: RecurringEndConditionSchema.optional(),

  // In-game specific fields
  durationMinutes: z.number().int().positive().max(480).optional(),
}).refine(
  (data) => {
    // For RECURRING mode, frequency and endCondition are required
    if (data.mode === 'RECURRING') {
      return data.frequency !== undefined && data.endCondition !== undefined;
    }
    return true;
  },
  {
    message: 'RECURRING mode requires frequency and endCondition',
    path: ['mode'],
  }
).refine(
  (data) => {
    // For IN_GAME mode, durationMinutes is typically used
    if (data.mode === 'IN_GAME') {
      return true; // durationMinutes is optional but recommended
    }
    return true;
  },
  {
    message: 'IN_GAME mode should include durationMinutes',
    path: ['mode'],
  }
);
export type BookingSelection = z.infer<typeof BookingSelectionSchema>;

/**
 * Recurring Occurrence Schema
 * Individual occurrence in a recurring booking preview
 */
export const RecurringOccurrenceSchema = z.object({
  index: z.number().int().nonnegative(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: OccurrenceStatusSchema,
  reasonKey: z.string().optional(),
  conflictId: z.string().uuid().optional(),
  selected: z.boolean().optional(),
});
export type RecurringOccurrence = z.infer<typeof RecurringOccurrenceSchema>;

/**
 * Recurring Summary Schema
 * Summary statistics for recurring booking preview/result
 */
export const RecurringSummarySchema = z.object({
  totalOccurrences: z.number().int().nonnegative(),
  availableCount: z.number().int().nonnegative(),
  conflictCount: z.number().int().nonnegative(),
  blockedCount: z.number().int().nonnegative(),
  blackoutCount: z.number().int().nonnegative(),
  totalPrice: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
});
export type RecurringSummary = z.infer<typeof RecurringSummarySchema>;

/**
 * Recurring Preview Request Schema
 * Request body for POST /api/bookings/recurring/preview
 */
export const RecurringPreviewRequestSchema = BookingSelectionSchema.refine(
  (data) => data.mode === 'RECURRING',
  {
    message: 'Preview request must use RECURRING mode',
    path: ['mode'],
  }
);
export type RecurringPreviewRequest = z.infer<typeof RecurringPreviewRequestSchema>;

/**
 * Recurring Preview Projection Schema
 * Server-computed recurring booking preview response
 */
export const RecurringPreviewProjectionSchema = z.object({
  listingId: z.string().uuid(),
  selection: BookingSelectionSchema,
  occurrences: z.array(RecurringOccurrenceSchema),
  summary: RecurringSummarySchema,
  proposedSelection: BookingSelectionSchema.optional(),
  generatedAt: z.string().datetime(),
  validFor: z.string().optional(), // ISO 8601 duration
  availableActions: z.array(z.enum(['CREATE_ALL', 'CREATE_AVAILABLE', 'MODIFY_SELECTION'])),
  permissions: z.object({
    canCreateAll: z.boolean(),
    canCreatePartial: z.boolean(),
    canModify: z.boolean(),
  }),
});
export type RecurringPreviewProjection = z.infer<typeof RecurringPreviewProjectionSchema>;
