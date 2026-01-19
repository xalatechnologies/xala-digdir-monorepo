/**
 * Booking Schemas
 *
 * Contract definitions for bookings.
 */
import { z } from 'zod';
import {
  UUIDSchema,
  MetadataSchema,
  TimestampsSchema,
  CurrencyCodeSchema,
  PaginationSchema,
  SortOrderSchema,
} from './common.schema';

// =============================================================================
// Enums
// =============================================================================

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

export const PaymentStatusSchema = z.enum([
  'pending',
  'paid',
  'refunded',
  'failed',
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// =============================================================================
// Full Booking Schema
// =============================================================================

export const BookingSchema = z.object({
  id: UUIDSchema,
  tenantId: UUIDSchema,
  rentalObjectId: UUIDSchema,
  userId: UUIDSchema,
  organizationId: UUIDSchema.optional().nullable(),
  status: BookingStatusSchema.default('pending'),
  paymentStatus: PaymentStatusSchema.default('pending'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalPrice: z.number().nonnegative(),
  currency: CurrencyCodeSchema,
  notes: z.string().optional().nullable(),
  metadata: MetadataSchema,
  version: z.number().int().positive().default(1),
}).merge(TimestampsSchema).refine(
  (data) => data.endTime > data.startTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export type Booking = z.infer<typeof BookingSchema>;

// =============================================================================
// Create DTO
// =============================================================================

export const CreateBookingSchema = z.object({
  rentalObjectId: UUIDSchema,
  userId: UUIDSchema.optional(),
  organizationId: UUIDSchema.optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalPrice: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  metadata: MetadataSchema.optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: 'End time must be after start time', path: ['endTime'] }
);

export type CreateBookingDTO = z.infer<typeof CreateBookingSchema>;

// =============================================================================
// Update DTO
// =============================================================================

export const UpdateBookingSchema = z.object({
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
  metadata: MetadataSchema.optional(),
  version: z.number().int().positive().optional(),
});

export type UpdateBookingDTO = z.infer<typeof UpdateBookingSchema>;

// =============================================================================
// Cancel DTO
// =============================================================================

export const CancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
  refundAmount: z.number().nonnegative().optional(),
});

export type CancelBookingDTO = z.infer<typeof CancelBookingSchema>;

// =============================================================================
// Query Parameters
// =============================================================================

export const BookingQuerySchema = PaginationSchema.extend({
  rentalObjectId: UUIDSchema.optional(),
  userId: UUIDSchema.optional(),
  organizationId: UUIDSchema.optional(),
  status: BookingStatusSchema.optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'startTime', 'endTime', 'totalPrice']).optional().default('createdAt'),
  sortOrder: SortOrderSchema.optional().default('desc'),
});

export type BookingQueryParams = z.infer<typeof BookingQuerySchema>;

// =============================================================================
// Booking Quote
// =============================================================================

export const BookingQuoteRequestSchema = z.object({
  rentalObjectId: UUIDSchema,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  organizationId: UUIDSchema.optional(),
  discountCode: z.string().optional(),
});

export type BookingQuoteRequest = z.infer<typeof BookingQuoteRequestSchema>;

export const BookingQuoteResponseSchema = z.object({
  rentalObjectId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  basePrice: z.number(),
  discounts: z.array(z.object({
    type: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })),
  totalPrice: z.number(),
  currency: CurrencyCodeSchema,
  breakdown: z.array(z.object({
    label: z.string(),
    amount: z.number(),
  })),
  validUntil: z.string(),
});

export type BookingQuoteResponse = z.infer<typeof BookingQuoteResponseSchema>;
