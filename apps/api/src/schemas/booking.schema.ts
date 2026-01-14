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
