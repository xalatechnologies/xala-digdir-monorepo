/**
 * Booking Projections
 *
 * UI-ready projection schemas for bookings.
 */
import { z } from 'zod';

// =============================================================================
// Card Projection (for lists)
// =============================================================================

export const BookingCardProjectionSchema = z.object({
  id: z.string(),
  
  // Display strings
  listingName: z.string(),
  dateDisplay: z.string(),
  timeDisplay: z.string(),
  durationDisplay: z.string(),
  priceDisplay: z.string(),
  
  // Status
  status: z.string(),
  statusLabel: z.string(),
  statusColor: z.string(),
  paymentStatus: z.string(),
  paymentStatusLabel: z.string(),
  
  // User info
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  
  // Images
  listingImageUrl: z.string().optional(),
  
  // Computed
  isPast: z.boolean(),
  isUpcoming: z.boolean(),
  isCancellable: z.boolean(),
});

export type BookingCardProjection = z.infer<typeof BookingCardProjectionSchema>;

// =============================================================================
// Details Projection
// =============================================================================

export const BookingDetailsProjectionSchema = BookingCardProjectionSchema.extend({
  // Full dates
  startTime: z.string(),
  endTime: z.string(),
  
  // Rental object details
  listingDetails: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  
  // User details
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }).optional(),
  
  // Organization
  organization: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  
  // Payment details
  payment: z.object({
    totalPrice: z.number(),
    currency: z.string(),
    formattedPrice: z.string(),
    breakdown: z.array(z.object({
      label: z.string(),
      amount: z.number(),
    })),
    method: z.string().optional(),
    paidAt: z.string().optional(),
  }),
  
  // Notes
  notes: z.string().optional(),
  
  // Permissions
  canCancel: z.boolean(),
  canModify: z.boolean(),
  canViewPayment: z.boolean(),
  
  // Actions
  availableActions: z.array(z.object({
    action: z.string(),
    label: z.string(),
    enabled: z.boolean(),
    reason: z.string().optional(),
  })),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BookingDetailsProjection = z.infer<typeof BookingDetailsProjectionSchema>;

// =============================================================================
// Receipt Projection (KRAV-ADM-07)
// =============================================================================

export const BookingReceiptProjectionSchema = z.object({
  bookingId: z.string(),
  receiptNumber: z.string(),
  
  // Tenant/Provider info
  provider: z.object({
    name: z.string(),
    address: z.string().optional(),
    orgNumber: z.string().optional(),
    logo: z.string().optional(),
  }),
  
  // Customer
  customer: z.object({
    name: z.string(),
    email: z.string(),
    organizationName: z.string().optional(),
  }),
  
  // Booking details
  booking: z.object({
    listingName: z.string(),
    date: z.string(),
    time: z.string(),
    duration: z.string(),
  }),
  
  // Payment
  payment: z.object({
    subtotal: z.number(),
    discounts: z.array(z.object({
      label: z.string(),
      amount: z.number(),
    })),
    total: z.number(),
    currency: z.string(),
    method: z.string(),
    paidAt: z.string(),
  }),
  
  // Meta
  issuedAt: z.string(),
  downloadUrl: z.string().optional(),
});

export type BookingReceiptProjection = z.infer<typeof BookingReceiptProjectionSchema>;

// =============================================================================
// Calendar Event Projection
// =============================================================================

export const CalendarEventProjectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean().optional(),
  
  // Styling
  color: z.string().optional(),
  textColor: z.string().optional(),
  
  // Related entities
  rentalObjectId: z.string(),
  bookingId: z.string().optional(),
  
  // Status
  status: z.string(),
  statusLabel: z.string(),
  
  // User info
  userName: z.string().optional(),
  organizationName: z.string().optional(),
  
  // Interaction
  editable: z.boolean(),
  clickable: z.boolean(),
});

export type CalendarEventProjection = z.infer<typeof CalendarEventProjectionSchema>;
