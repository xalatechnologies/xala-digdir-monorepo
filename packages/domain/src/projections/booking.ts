import { z } from 'zod';
import {
  BookingStatusSchema,
  BookingSourceSchema,
  PaymentStatusSchema,
  BookingContactSchema,
  BookingVesselSchema,
  BookingPricingSchema,
  BookingExtraSchema,
} from '../schemas/booking';

/**
 * Booking List Item Projection
 *
 * Used for displaying bookings in lists and tables.
 * Contains essential information for quick scanning.
 */
export const BookingListProjectionSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  rentalObjectId: z.string().uuid(),
  rentalObjectName: z.string(),
  rentalObjectType: z.string(),
  organizationId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: BookingStatusSchema,
  paymentStatus: PaymentStatusSchema,
  source: BookingSourceSchema,
  contact: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    fullName: z.string(),
  }),
  pricing: z.object({
    totalAmount: z.number(),
    currency: z.string(),
    formattedTotal: z.string(),
  }),
  durationDays: z.number(),
  isUpcoming: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
});

export type BookingListProjection = z.infer<typeof BookingListProjectionSchema>;

/**
 * Booking Detail Projection
 *
 * Used for displaying full booking details on detail pages.
 * Includes all information, related entities, and available actions.
 */
export const BookingDetailProjectionSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  rentalObject: z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.string(),
    location: z
      .object({
        harborName: z.string().optional(),
        pier: z.string().optional(),
        position: z.string().optional(),
        fullAddress: z.string(),
      })
      .nullable(),
    amenities: z
      .object({
        hasElectricity: z.boolean(),
        hasWater: z.boolean(),
        amenityList: z.array(z.string()),
      })
      .nullable(),
  }),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
  }),
  user: z
    .object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string().nullable(),
    })
    .nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: BookingStatusSchema,
  source: BookingSourceSchema,
  contact: BookingContactSchema,
  vessel: BookingVesselSchema.nullable(),
  pricing: BookingPricingSchema.extend({
    formattedBaseAmount: z.string(),
    formattedDiscountAmount: z.string(),
    formattedTaxAmount: z.string(),
    formattedExtrasAmount: z.string(),
    formattedTotalAmount: z.string(),
  }),
  paymentStatus: PaymentStatusSchema,
  extras: z.array(
    BookingExtraSchema.extend({
      formattedUnitPrice: z.string(),
      formattedTotalPrice: z.string(),
    })
  ),
  notes: z.string().nullable(),
  internalNotes: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  // Timestamps
  checkedInAt: z.coerce.date().nullable(),
  checkedOutAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Computed fields
  durationDays: z.number(),
  durationText: z.string(),
  statusText: z.string(),
  paymentStatusText: z.string(),
  isUpcoming: z.boolean(),
  isActive: z.boolean(),
  isPast: z.boolean(),
  canCheckIn: z.boolean(),
  canCheckOut: z.boolean(),
  // Permissions
  permissions: z.object({
    canView: z.boolean(),
    canEdit: z.boolean(),
    canCancel: z.boolean(),
    canCheckIn: z.boolean(),
    canCheckOut: z.boolean(),
    canIssueRefund: z.boolean(),
    canDelete: z.boolean(),
    canAddNotes: z.boolean(),
  }),
  // Available actions
  availableActions: z.array(
    z.enum([
      'view',
      'edit',
      'confirm',
      'check_in',
      'check_out',
      'cancel',
      'resend_confirmation',
      'issue_refund',
      'add_note',
      'print',
      'download_receipt',
    ])
  ),
  // Payment history
  payments: z.array(
    z.object({
      id: z.string().uuid(),
      amount: z.number(),
      formattedAmount: z.string(),
      method: z.string(),
      status: z.string(),
      paidAt: z.coerce.date().nullable(),
      receiptUrl: z.string().url().nullable(),
    })
  ),
  // Audit trail
  auditTrail: z
    .array(
      z.object({
        id: z.string().uuid(),
        action: z.string(),
        performedBy: z.string(),
        performedAt: z.coerce.date(),
        details: z.string().nullable(),
      })
    )
    .optional(),
});

export type BookingDetailProjection = z.infer<typeof BookingDetailProjectionSchema>;

/**
 * Booking Card Projection
 *
 * Used for displaying booking cards in the user portal (minside).
 * Shows key information for the booking holder.
 */
export const BookingCardProjectionSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  rentalObject: z.object({
    name: z.string(),
    type: z.string(),
    thumbnailUrl: z.string().url().nullable(),
    location: z
      .object({
        harborName: z.string().optional(),
        displayText: z.string(),
      })
      .nullable(),
  }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: BookingStatusSchema,
  statusText: z.string(),
  statusColor: z.string(),
  durationText: z.string(),
  pricing: z.object({
    formattedTotal: z.string(),
  }),
  canCancel: z.boolean(),
  canCheckIn: z.boolean(),
  qrCodeUrl: z.string().url().nullable(),
});

export type BookingCardProjection = z.infer<typeof BookingCardProjectionSchema>;

/**
 * Booking Calendar Event Projection
 *
 * Used for displaying bookings on calendar views.
 */
export const BookingCalendarProjectionSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  rentalObjectId: z.string().uuid(),
  rentalObjectName: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: BookingStatusSchema,
  contactName: z.string(),
  color: z.string(),
  isAllDay: z.boolean(),
  tooltip: z.string(),
});

export type BookingCalendarProjection = z.infer<typeof BookingCalendarProjectionSchema>;

/**
 * Booking Confirmation Projection
 *
 * Used for booking confirmation emails and receipt pages.
 */
export const BookingConfirmationProjectionSchema = z.object({
  bookingId: z.string().uuid(),
  bookingNumber: z.string(),
  confirmationCode: z.string(),
  rentalObject: z.object({
    name: z.string(),
    type: z.string(),
    location: z.string(),
    amenitiesList: z.array(z.string()),
  }),
  dates: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    nights: z.number(),
    formattedDateRange: z.string(),
  }),
  contact: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
  }),
  pricing: z.object({
    lineItems: z.array(
      z.object({
        description: z.string(),
        amount: z.number(),
        formattedAmount: z.string(),
      })
    ),
    subtotal: z.number(),
    formattedSubtotal: z.string(),
    tax: z.number(),
    formattedTax: z.string(),
    total: z.number(),
    formattedTotal: z.string(),
    currency: z.string(),
  }),
  qrCodeUrl: z.string().url().nullable(),
  receiptUrl: z.string().url().nullable(),
  cancellationPolicy: z.string(),
  importantInfo: z.array(z.string()),
  organization: z.object({
    name: z.string(),
    contactEmail: z.string(),
    contactPhone: z.string().nullable(),
    address: z.string().nullable(),
  }),
});

export type BookingConfirmationProjection = z.infer<typeof BookingConfirmationProjectionSchema>;

/**
 * Booking Summary Stats Projection
 *
 * Used for dashboard widgets showing booking statistics.
 */
export const BookingSummaryStatsProjectionSchema = z.object({
  period: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    label: z.string(),
  }),
  totalBookings: z.number(),
  confirmedBookings: z.number(),
  cancelledBookings: z.number(),
  pendingBookings: z.number(),
  revenue: z.object({
    total: z.number(),
    formattedTotal: z.string(),
    currency: z.string(),
  }),
  occupancyRate: z.number(),
  formattedOccupancyRate: z.string(),
  averageBookingValue: z.number(),
  formattedAverageBookingValue: z.string(),
  byStatus: z.record(BookingStatusSchema, z.number()),
  bySource: z.record(BookingSourceSchema, z.number()),
  trend: z.object({
    direction: z.enum(['up', 'down', 'stable']),
    percentage: z.number(),
    comparedTo: z.string(),
  }),
});

export type BookingSummaryStatsProjection = z.infer<typeof BookingSummaryStatsProjectionSchema>;
