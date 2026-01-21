import { z } from 'zod';

/**
 * Allocation Status
 */
export const AllocationStatusSchema = z.enum([
  'pending',
  'active',
  'expired',
  'cancelled',
  'transferred',
]);

/**
 * Allocation Type
 */
export const AllocationTypeSchema = z.enum([
  'seasonal',
  'temporary',
  'guest',
  'maintenance',
  'reserved',
]);

/**
 * Allocation Source
 */
export const AllocationSourceSchema = z.enum([
  'season_application',
  'booking',
  'manual',
  'transfer',
  'renewal',
]);

/**
 * Create Allocation Input
 */
export const CreateAllocationSchema = z.object({
  rentalObjectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
  bookingId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  type: AllocationTypeSchema,
  source: AllocationSourceSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * Update Allocation Input
 */
export const UpdateAllocationSchema = z.object({
  status: AllocationStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Transfer Allocation Input
 */
export const TransferAllocationSchema = z.object({
  newRentalObjectId: z.string().uuid(),
  reason: z.string().max(500),
  effectiveDate: z.coerce.date().optional(),
  transferredBy: z.string().uuid(),
});

/**
 * Cancel Allocation Input
 */
export const CancelAllocationSchema = z.object({
  reason: z.string().max(500),
  cancelledBy: z.string().uuid(),
  effectiveDate: z.coerce.date().optional(),
});

/**
 * Allocation Filter
 */
export const AllocationFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  rentalObjectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  seasonId: z.string().uuid().optional(),
  status: AllocationStatusSchema.optional(),
  statuses: z.array(AllocationStatusSchema).optional(),
  type: AllocationTypeSchema.optional(),
  types: z.array(AllocationTypeSchema).optional(),
  source: AllocationSourceSchema.optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  endDateFrom: z.coerce.date().optional(),
  endDateTo: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  includeExpired: z.boolean().default(false),
});

/**
 * Allocation Conflict Check Input
 */
export const AllocationConflictCheckSchema = z.object({
  rentalObjectId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  excludeAllocationId: z.string().uuid().optional(),
});

/**
 * Allocation History Entry
 */
export const AllocationHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  allocationId: z.string().uuid(),
  action: z.enum([
    'created',
    'updated',
    'activated',
    'cancelled',
    'transferred',
    'expired',
  ]),
  changedBy: z.string().uuid(),
  changedAt: z.coerce.date(),
  previousValues: z.record(z.string(), z.unknown()).nullable(),
  newValues: z.record(z.string(), z.unknown()).nullable(),
  reason: z.string().nullable(),
});

/**
 * Full Allocation Schema
 */
export const AllocationSchema = z.object({
  id: z.string().uuid(),
  allocationNumber: z.string(),
  rentalObjectId: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  seasonId: z.string().uuid().nullable(),
  bookingId: z.string().uuid().nullable(),
  applicationId: z.string().uuid().nullable(),
  type: AllocationTypeSchema,
  source: AllocationSourceSchema,
  status: AllocationStatusSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().nullable(),
  internalNotes: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  transferredFromId: z.string().uuid().nullable(),
  transferredToId: z.string().uuid().nullable(),
  cancelledAt: z.coerce.date().nullable(),
  cancelledBy: z.string().uuid().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Allocation Availability Slot
 */
export const AllocationAvailabilitySlotSchema = z.object({
  rentalObjectId: z.string().uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isAvailable: z.boolean(),
  conflictingAllocationId: z.string().uuid().optional(),
  conflictType: z.enum(['full', 'partial']).optional(),
});

/**
 * Bulk Allocation Input
 */
export const BulkAllocationSchema = z.object({
  allocations: z.array(CreateAllocationSchema).min(1).max(100),
  validateConflicts: z.boolean().default(true),
  skipConflicting: z.boolean().default(false),
});
