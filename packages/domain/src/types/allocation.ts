import { z } from 'zod';
import {
  AllocationStatusSchema,
  AllocationTypeSchema,
  AllocationSourceSchema,
  CreateAllocationSchema,
  UpdateAllocationSchema,
  TransferAllocationSchema,
  CancelAllocationSchema,
  AllocationFilterSchema,
  AllocationConflictCheckSchema,
  AllocationHistoryEntrySchema,
  AllocationSchema,
  AllocationAvailabilitySlotSchema,
  BulkAllocationSchema,
} from '../schemas/allocation';

/**
 * Allocation Status
 */
export type AllocationStatus = z.infer<typeof AllocationStatusSchema>;

/**
 * Allocation Type
 */
export type AllocationType = z.infer<typeof AllocationTypeSchema>;

/**
 * Allocation Source
 */
export type AllocationSource = z.infer<typeof AllocationSourceSchema>;

/**
 * Create Allocation Input
 */
export type CreateAllocationInput = z.infer<typeof CreateAllocationSchema>;

/**
 * Update Allocation Input
 */
export type UpdateAllocationInput = z.infer<typeof UpdateAllocationSchema>;

/**
 * Transfer Allocation Input
 */
export type TransferAllocationInput = z.infer<typeof TransferAllocationSchema>;

/**
 * Cancel Allocation Input
 */
export type CancelAllocationInput = z.infer<typeof CancelAllocationSchema>;

/**
 * Allocation Filter
 */
export type AllocationFilter = z.infer<typeof AllocationFilterSchema>;

/**
 * Allocation Conflict Check Input
 */
export type AllocationConflictCheckInput = z.infer<typeof AllocationConflictCheckSchema>;

/**
 * Allocation History Entry
 */
export type AllocationHistoryEntry = z.infer<typeof AllocationHistoryEntrySchema>;

/**
 * Full Allocation
 */
export type Allocation = z.infer<typeof AllocationSchema>;

/**
 * Allocation Availability Slot
 */
export type AllocationAvailabilitySlot = z.infer<typeof AllocationAvailabilitySlotSchema>;

/**
 * Bulk Allocation Input
 */
export type BulkAllocationInput = z.infer<typeof BulkAllocationSchema>;

/**
 * Allocation ID
 */
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
