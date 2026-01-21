import { z } from 'zod';
import {
  BookingStatusSchema,
  BookingSourceSchema,
  PaymentStatusSchema,
  BookingContactSchema,
  BookingVesselSchema,
  BookingPricingSchema,
  BookingExtraSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  CancelBookingSchema,
  BookingFilterSchema,
  BookingSchema,
} from '../schemas/booking';

/**
 * Booking Status
 */
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/**
 * Booking Source
 */
export type BookingSource = z.infer<typeof BookingSourceSchema>;

/**
 * Payment Status
 */
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/**
 * Booking Contact
 */
export type BookingContact = z.infer<typeof BookingContactSchema>;

/**
 * Booking Vessel
 */
export type BookingVessel = z.infer<typeof BookingVesselSchema>;

/**
 * Booking Pricing
 */
export type BookingPricing = z.infer<typeof BookingPricingSchema>;

/**
 * Booking Extra
 */
export type BookingExtra = z.infer<typeof BookingExtraSchema>;

/**
 * Create Booking Input
 */
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

/**
 * Update Booking Input
 */
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;

/**
 * Cancel Booking Input
 */
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;

/**
 * Booking Filter
 */
export type BookingFilter = z.infer<typeof BookingFilterSchema>;

/**
 * Full Booking
 */
export type Booking = z.infer<typeof BookingSchema>;

/**
 * Booking ID
 */
export type BookingId = Booking['id'];

/**
 * Booking with Relations
 */
export interface BookingWithRelations extends Booking {
  rentalObject?: {
    id: string;
    name: string;
    type: string;
    location?: {
      harborName?: string;
      pier?: string;
      position?: string;
    } | null;
  };
  organization?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt: Date | null;
  }>;
}

/**
 * Booking Summary (for lists)
 */
export interface BookingSummary {
  id: string;
  bookingNumber: string;
  rentalObjectId: string;
  rentalObjectName: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contact: Pick<BookingContact, 'firstName' | 'lastName' | 'email'>;
  totalAmount: number;
  currency: string;
}

/**
 * Booking Calendar Event
 */
export interface BookingCalendarEvent {
  id: string;
  bookingNumber: string;
  rentalObjectId: string;
  rentalObjectName: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  contactName: string;
  color?: string;
}

/**
 * Booking Confirmation
 */
export interface BookingConfirmation {
  bookingId: string;
  bookingNumber: string;
  confirmationCode: string;
  rentalObject: {
    name: string;
    location?: string;
  };
  dates: {
    startDate: Date;
    endDate: Date;
    nights: number;
  };
  contact: BookingContact;
  pricing: BookingPricing;
  qrCodeUrl?: string;
  receiptUrl?: string;
}

/**
 * Booking Statistics
 */
export interface BookingStatistics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
  bookingsByStatus: Record<BookingStatus, number>;
  bookingsBySource: Record<BookingSource, number>;
  topRentalObjects: Array<{
    rentalObjectId: string;
    rentalObjectName: string;
    bookingCount: number;
    revenue: number;
  }>;
}

/**
 * Booking Action
 */
export type BookingAction =
  | 'confirm'
  | 'check_in'
  | 'check_out'
  | 'cancel'
  | 'edit'
  | 'view'
  | 'resend_confirmation'
  | 'issue_refund'
  | 'add_note';

/**
 * Booking Permission
 */
export interface BookingPermission {
  canView: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canIssueRefund: boolean;
  canDelete: boolean;
}
