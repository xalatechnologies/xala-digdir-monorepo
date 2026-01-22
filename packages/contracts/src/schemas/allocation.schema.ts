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

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type AllocationStatus = z.infer<typeof AllocationStatusSchema>;
export type AllocationType = z.infer<typeof AllocationTypeSchema>;
export type AllocationSource = z.infer<typeof AllocationSourceSchema>;
export type CreateAllocationInput = z.infer<typeof CreateAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof UpdateAllocationSchema>;
export type TransferAllocationInput = z.infer<typeof TransferAllocationSchema>;
export type CancelAllocationInput = z.infer<typeof CancelAllocationSchema>;
export type AllocationFilter = z.infer<typeof AllocationFilterSchema>;
export type AllocationConflictCheckInput = z.infer<typeof AllocationConflictCheckSchema>;
export type AllocationHistoryEntry = z.infer<typeof AllocationHistoryEntrySchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type AllocationAvailabilitySlot = z.infer<typeof AllocationAvailabilitySlotSchema>;
export type BulkAllocationInput = z.infer<typeof BulkAllocationSchema>;
export type AllocationId = Allocation['id'];

/**
 * Allocation with Relations
 */
export interface AllocationWithRelations extends Allocation {
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
  season?: {
    id: string;
    name: string;
    year: number;
  } | null;
  booking?: {
    id: string;
    bookingNumber: string;
    status: string;
  } | null;
  application?: {
    id: string;
    applicationNumber: string;
    status: string;
  } | null;
  transferredFrom?: Allocation | null;
  transferredTo?: Allocation | null;
  history?: AllocationHistoryEntry[];
}

/**
 * Allocation Summary (for lists)
 */
export interface AllocationSummary {
  id: string;
  allocationNumber: string;
  rentalObjectId: string;
  rentalObjectName: string;
  type: AllocationType;
  status: AllocationStatus;
  startDate: Date;
  endDate: Date;
  userName: string | null;
  seasonName: string | null;
  isActive: boolean;
}

/**
 * Allocation Calendar Event
 */
export interface AllocationCalendarEvent {
  id: string;
  allocationNumber: string;
  rentalObjectId: string;
  rentalObjectName: string;
  startDate: Date;
  endDate: Date;
  type: AllocationType;
  status: AllocationStatus;
  userName: string | null;
  color?: string;
}

/**
 * Allocation Conflict
 */
export interface AllocationConflict {
  conflictingAllocationId: string;
  conflictingAllocationNumber: string;
  rentalObjectId: string;
  rentalObjectName: string;
  conflictType: 'full' | 'partial';
  conflictPeriod: {
    startDate: Date;
    endDate: Date;
  };
  existingPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * Bulk Allocation Result
 */
export interface BulkAllocationResult {
  successful: Array<{
    allocationId: string;
    allocationNumber: string;
    rentalObjectId: string;
  }>;
  failed: Array<{
    index: number;
    rentalObjectId: string;
    error: string;
    conflicts?: AllocationConflict[];
  }>;
  summary: {
    total: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
  };
}

/**
 * Allocation Statistics
 */
export interface AllocationStatistics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalAllocations: number;
  activeAllocations: number;
  expiredAllocations: number;
  cancelledAllocations: number;
  byType: Record<AllocationType, number>;
  bySource: Record<AllocationSource, number>;
  occupancyRate: number;
  transferCount: number;
  averageDuration: number;
}

/**
 * Allocation Action
 */
export type AllocationAction =
  | 'activate'
  | 'cancel'
  | 'transfer'
  | 'extend'
  | 'edit'
  | 'view'
  | 'view_history';

/**
 * Allocation Permission
 */
export interface AllocationPermission {
  canView: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canTransfer: boolean;
  canExtend: boolean;
  canDelete: boolean;
  canViewHistory: boolean;
}

/**
 * Allocation Matrix Cell (for harbor map visualization)
 */
export interface AllocationMatrixCell {
  rentalObjectId: string;
  rentalObjectName: string;
  pier: string | null;
  position: string | null;
  allocation: AllocationSummary | null;
  isAvailable: boolean;
  status: 'available' | 'allocated' | 'maintenance' | 'reserved';
}

/**
 * Allocation Matrix Row (pier)
 */
export interface AllocationMatrixRow {
  pier: string;
  cells: AllocationMatrixCell[];
}

/**
 * Allocation Matrix (full harbor view)
 */
export interface AllocationMatrix {
  harborId: string;
  harborName: string;
  seasonId: string | null;
  seasonName: string | null;
  rows: AllocationMatrixRow[];
  statistics: {
    total: number;
    available: number;
    allocated: number;
    maintenance: number;
    reserved: number;
  };
}
