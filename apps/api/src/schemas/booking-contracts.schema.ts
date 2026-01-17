/**
 * Booking Contracts Validation Schemas (Zod)
 * Validates request bodies for contract-first booking endpoints
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { z } from 'zod';

// =============================================================================
// Price Preview Schema
// =============================================================================

export const PricePreviewRequestSchema = z.object({
  rentalObjectId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  context: z.enum(['PRIVATE', 'MEMBERSHIP_ORG']),
  contextOrgId: z.string().uuid().optional(),
  addonIds: z.array(z.string().uuid()).optional(),
});

export type PricePreviewRequest = z.infer<typeof PricePreviewRequestSchema>;

// =============================================================================
// Recurring Preview Schema
// =============================================================================

export const RecurringPreviewRequestSchema = z.object({
  rentalObjectId: z.string().uuid(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  interval: z.number().int().min(1).max(12),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxOccurrences: z.number().int().min(1).max(100).optional(),
});

export type RecurringPreviewRequest = z.infer<typeof RecurringPreviewRequestSchema>;

// =============================================================================
// Calendar Request Schema
// =============================================================================

export const CalendarRequestSchema = z.object({
  rentalObjectId: z.string().uuid(),
  view: z.enum(['DAY', 'WEEK', 'MONTH', 'TIMELINE']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CalendarRequest = z.infer<typeof CalendarRequestSchema>;

// =============================================================================
// Block Management Schemas
// =============================================================================

export const CreateBlockRequestSchema = z.object({
  rentalObjectId: z.string().uuid(),
  type: z.enum(['MAINTENANCE', 'EVENT_PRIORITY', 'CLOSED_DAY', 'CUSTOM']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  recurring: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

export type CreateBlockRequest = z.infer<typeof CreateBlockRequestSchema>;
