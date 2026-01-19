/**
 * Booking Zod Schemas
 * Validation schemas for booking domain
 */
import { z } from 'zod';

/**
 * Booking Status Enum (canonical states)
 */
export const BookingStatusSchema = z.enum([
  'pending',           // Initial state
  'pending_approval',  // Submitted, awaiting decision
  'approved',          // Approved by caseworker
  'confirmed',         // Confirmed booking
  'rejected',          // Rejected with reason
  'cancelled',         // Cancelled by user/admin
  'completed',         // Booking fulfilled
  'expired',           // Reservation expired
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * Full Booking Schema
 */
export const BookingSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  rentalObjectId: z.string().uuid(),
  userId: z.string().uuid(),
  status: BookingStatusSchema.default('pending'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalPrice: z.string().or(z.number()).transform((v) => Number(v)),
  currency: z.string().length(3).default('NOK'),
  notes: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  version: z.number().int().positive().default(1),
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
  rentalObjectId: z.string().uuid(),
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
  version: z.number().int().positive().optional(),
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
 * Approve Booking DTO
 */
export const ApproveBookingSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export type ApproveBookingDTO = z.infer<typeof ApproveBookingSchema>;

/**
 * Deny Booking DTO
 * @deprecated Use RejectBookingSchema instead
 */
export const DenyBookingSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export type DenyBookingDTO = z.infer<typeof DenyBookingSchema>;

/**
 * Submit Booking DTO (for approval)
 */
export const SubmitBookingSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export type SubmitBookingDTO = z.infer<typeof SubmitBookingSchema>;

/**
 * Reject Booking DTO
 */
export const RejectBookingSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000),
});

export type RejectBookingDTO = z.infer<typeof RejectBookingSchema>;

/**
 * Booking Query Params
 */
export const BookingQuerySchema = z.object({
  rentalObjectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  orgId: z.string().uuid().optional(), // Organization filter for org-scoped access
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
  rentalObjectId: z.string().uuid(),
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
  rentalObjectId: z.string().uuid(),
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
  rentalObjectId: z.string().uuid(),
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

/**
 * Conflict Policy Enum
 * Defines how the API handles conflicts when creating recurring bookings
 */
export const ConflictPolicySchema = z.enum(['STOP_ON_CONFLICT', 'ALLOW_PARTIAL']);
export type ConflictPolicy = z.infer<typeof ConflictPolicySchema>;

/**
 * Recurring Create Request Schema
 * Request body for POST /api/bookings/recurring
 * Includes the booking selection and conflict handling policy
 */
export const RecurringCreateSchema = z.object({
  // Selection data (extends BookingSelectionSchema fields)
  rentalObjectId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  metadata: BookingMetadataSchema.optional(),

  // Recurring-specific fields (required for recurring creation)
  frequency: RecurringFrequencySchema,
  weekdays: z.array(z.number().int().min(1).max(7)).optional(),
  endCondition: RecurringEndConditionSchema,

  // Conflict policy options
  /**
   * When true, stops the entire operation if any conflict is detected.
   * No bookings will be created if there are any conflicts.
   * Default: false
   */
  stopOnConflict: z.boolean().default(false),

  /**
   * When true, creates only the available occurrences and skips conflicts.
   * Returns a list of created bookings and failed occurrences.
   * Default: true
   */
  allowPartial: z.boolean().default(true),

  // Optional: selected occurrence indices (for user-curated creation)
  selectedOccurrences: z.array(z.number().int().nonnegative()).optional(),
}).refine(
  (data) => {
    // stopOnConflict and allowPartial are mutually exclusive behaviors
    // If stopOnConflict is true, allowPartial behavior is overridden
    // This is a valid configuration - just informational
    return true;
  },
  {
    message: 'When stopOnConflict is true, the operation will fail on any conflict regardless of allowPartial',
    path: ['stopOnConflict'],
  }
).refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export type RecurringCreateRequest = z.infer<typeof RecurringCreateSchema>;

/**
 * Failed Occurrence Schema
 * Describes an occurrence that could not be created
 */
export const FailedOccurrenceSchema = z.object({
  index: z.number().int().nonnegative(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: OccurrenceStatusSchema,
  reasonKey: z.string(),
  conflictId: z.string().uuid().optional(),
});
export type FailedOccurrence = z.infer<typeof FailedOccurrenceSchema>;

/**
 * Recurring Booking Result Projection Schema
 * Response for POST /api/bookings/recurring
 */
export const RecurringBookingResultProjectionSchema = z.object({
  /** Successfully created bookings */
  created: z.array(BookingSchema),

  /** Occurrences that failed to be created */
  failed: z.array(FailedOccurrenceSchema),

  /** Summary of the operation */
  summary: z.object({
    totalRequested: z.number().int().nonnegative(),
    createdCount: z.number().int().nonnegative(),
    failedCount: z.number().int().nonnegative(),
    totalPrice: z.number().nonnegative(),
    currency: z.string().length(3).default('NOK'),
  }),

  /** Metadata about the recurring series */
  seriesMetadata: z.object({
    frequency: RecurringFrequencySchema,
    weekdays: z.array(z.number().int().min(1).max(7)).optional(),
    firstOccurrence: z.string().datetime(),
    lastOccurrence: z.string().datetime().optional(),
    seriesId: z.string().uuid().optional(),
  }),

  /** Timestamp when the result was generated */
  createdAt: z.string().datetime(),
});
export type RecurringBookingResultProjection = z.infer<typeof RecurringBookingResultProjectionSchema>;

/**
 * Slot Status - availability state from rental_objects
 */
export const SlotStatusSchema = z.enum(['AVAILABLE', 'RESERVED', 'BOOKED', 'BLOCKED', 'BLACKOUT']);
export type SlotStatus = z.infer<typeof SlotStatusSchema>;

/**
 * Booking Quote Projection Schema
 * Response for POST /api/bookings/quote
 * All data driven by rental_objects configuration
 */
export const BookingQuoteProjectionSchema = z.object({
  /** Rental object ID */
  rentalObjectId: z.string().uuid(),

  /** Rental object display name */
  rentalObjectName: z.string(),

  /** User's selection */
  selection: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    mode: BookingModeSchema.default('SINGLE_SLOT'),
  }),

  /** Slot availability status */
  slot: z.object({
    status: SlotStatusSchema,
    policyReasonKey: z.string().optional(),
  }),

  /** Pricing calculated from rental_objects config */
  pricing: z.object({
    basePrice: z.number().nonnegative(),
    discount: z.number().nonnegative().default(0),
    totalPrice: z.number().nonnegative(),
    currency: z.string().length(3).default('NOK'),
    breakdown: z.array(z.object({
      label: z.string(),
      amount: z.number(),
    })).optional(),
  }),

  /** Booking constraints from rental_objects */
  constraints: z.object({
    minDurationMinutes: z.number().int().nonnegative(),
    maxDurationMinutes: z.number().int().nonnegative(),
    bufferTimeMinutes: z.number().int().nonnegative(),
    advanceBookingDays: z.number().int().nonnegative(),
    cancellationDeadlineHours: z.number().int().nonnegative(),
  }),

  /** Available actions based on slot status and user permissions */
  availableActions: z.array(z.enum(['BOOK', 'REQUEST', 'WAITLIST', 'MODIFY'])),

  /** Timestamp */
  createdAt: z.string().datetime(),
});
export type BookingQuoteProjection = z.infer<typeof BookingQuoteProjectionSchema>;
