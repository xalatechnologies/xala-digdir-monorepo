import { z } from 'zod';

/**
 * Booking Status
 */
export const BookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show',
  'completed',
]);

/**
 * Booking Source
 */
export const BookingSourceSchema = z.enum([
  'web',
  'mobile',
  'backoffice',
  'api',
  'walk_in',
  'phone',
  'email',
]);

/**
 * Payment Status
 */
export const PaymentStatusSchema = z.enum([
  'pending',
  'partial',
  'paid',
  'refunded',
  'failed',
  'cancelled',
]);

/**
 * Booking Contact
 */
export const BookingContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().length(2).optional(),
    })
    .optional(),
});

/**
 * Booking Vessel (for boat slip bookings)
 */
export const BookingVesselSchema = z.object({
  name: z.string().max(255).optional(),
  registrationNumber: z.string().max(100).optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  draft: z.number().positive().optional(),
  type: z.string().max(100).optional(),
  insuranceNumber: z.string().max(100).optional(),
  insuranceExpiry: z.coerce.date().optional(),
});

/**
 * Booking Pricing Breakdown
 */
export const BookingPricingSchema = z.object({
  baseAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  extrasAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  discountCode: z.string().optional(),
});

/**
 * Booking Extra
 */
export const BookingExtraSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

/**
 * Create Booking Input
 */
export const CreateBookingSchema = z.object({
  rentalObjectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  contact: BookingContactSchema,
  vessel: BookingVesselSchema.optional(),
  source: BookingSourceSchema.default('web'),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  discountCode: z.string().optional(),
  extras: z.array(BookingExtraSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * Update Booking Input
 */
export const UpdateBookingSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  contact: BookingContactSchema.partial().optional(),
  vessel: BookingVesselSchema.partial().optional(),
  status: BookingStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  extras: z.array(BookingExtraSchema).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Cancel Booking Input
 */
export const CancelBookingSchema = z.object({
  reason: z.string().max(500),
  refundAmount: z.number().nonnegative().optional(),
  cancelledBy: z.string().uuid(),
});

/**
 * Booking Filter
 */
export const BookingFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  rentalObjectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: BookingStatusSchema.optional(),
  statuses: z.array(BookingStatusSchema).optional(),
  source: BookingSourceSchema.optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  endDateFrom: z.coerce.date().optional(),
  endDateTo: z.coerce.date().optional(),
  search: z.string().optional(),
  includeDeleted: z.boolean().default(false),
});

/**
 * Full Booking Schema
 */
export const BookingSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  rentalObjectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: BookingStatusSchema,
  source: BookingSourceSchema,
  contact: BookingContactSchema,
  vessel: BookingVesselSchema.nullable(),
  pricing: BookingPricingSchema,
  paymentStatus: PaymentStatusSchema,
  notes: z.string().nullable(),
  internalNotes: z.string().nullable(),
  extras: z.array(BookingExtraSchema),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  checkedInAt: z.coerce.date().nullable(),
  checkedOutAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
