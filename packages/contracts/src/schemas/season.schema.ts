import { z } from 'zod';

/**
 * Season Status
 */
export const SeasonStatusSchema = z.enum([
  'draft',
  'upcoming',
  'active',
  'ended',
  'cancelled',
]);

/**
 * Season Application Status
 */
export const SeasonApplicationStatusSchema = z.enum([
  'pending',
  'under_review',
  'approved',
  'rejected',
  'waitlisted',
  'withdrawn',
  'expired',
]);

/**
 * Priority Rule Type
 */
export const PriorityRuleTypeSchema = z.enum([
  'membership_years',
  'local_resident',
  'previous_season',
  'boat_size',
  'waiting_list_position',
  'manual_priority',
  'custom',
]);

/**
 * Season Pricing Tier
 */
export const SeasonPricingTierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priceMultiplier: z.number().positive().default(1),
  conditions: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Season Date Range
 */
export const SeasonDateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

/**
 * Application Window
 */
export const ApplicationWindowSchema = z.object({
  openDate: z.coerce.date(),
  closeDate: z.coerce.date(),
  priorityDeadline: z.coerce.date().optional(),
  lateApplicationsAllowed: z.boolean().default(false),
  lateFeeAmount: z.number().nonnegative().optional(),
}).refine((data) => data.closeDate > data.openDate, {
  message: 'Close date must be after open date',
  path: ['closeDate'],
});

/**
 * Priority Rule
 */
export const PriorityRuleSchema = z.object({
  id: z.string().uuid(),
  type: PriorityRuleTypeSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.number().int().min(1),
  points: z.number().int().default(0),
  conditions: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Create Season Input
 */
export const CreateSeasonSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  organizationId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  dateRange: SeasonDateRangeSchema,
  applicationWindow: ApplicationWindowSchema,
  pricingTiers: z.array(SeasonPricingTierSchema).default([]),
  priorityRules: z.array(PriorityRuleSchema).default([]),
  maxApplicationsPerUser: z.number().int().positive().default(1),
  autoApproveRenewals: z.boolean().default(false),
  requirePaymentOnApproval: z.boolean().default(true),
  paymentDeadlineDays: z.number().int().positive().default(14),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update Season Input
 */
export const UpdateSeasonSchema = CreateSeasonSchema.partial().omit({
  organizationId: true,
});

/**
 * Create Season Application Input
 */
export const CreateSeasonApplicationSchema = z.object({
  seasonId: z.string().uuid(),
  userId: z.string().uuid(),
  rentalObjectId: z.string().uuid().optional(),
  preferredRentalObjectIds: z.array(z.string().uuid()).default([]),
  vesselInfo: z.object({
    name: z.string().max(255).optional(),
    registrationNumber: z.string().max(100).optional(),
    length: z.number().positive(),
    width: z.number().positive(),
    draft: z.number().positive().optional(),
    type: z.string().max(100).optional(),
  }).optional(),
  notes: z.string().max(2000).optional(),
  isRenewal: z.boolean().default(false),
  previousSeasonId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Update Season Application Input
 */
export const UpdateSeasonApplicationSchema = z.object({
  status: SeasonApplicationStatusSchema.optional(),
  assignedRentalObjectId: z.string().uuid().optional(),
  priorityScore: z.number().int().optional(),
  reviewNotes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Season Filter
 */
export const SeasonFilterSchema = z.object({
  organizationId: z.string().uuid().optional(),
  status: SeasonStatusSchema.optional(),
  year: z.number().int().optional(),
  isApplicationOpen: z.boolean().optional(),
  search: z.string().optional(),
});

/**
 * Season Application Filter
 */
export const SeasonApplicationFilterSchema = z.object({
  seasonId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: SeasonApplicationStatusSchema.optional(),
  statuses: z.array(SeasonApplicationStatusSchema).optional(),
  isRenewal: z.boolean().optional(),
  minPriorityScore: z.number().int().optional(),
  maxPriorityScore: z.number().int().optional(),
  search: z.string().optional(),
});

/**
 * Full Season Schema
 */
export const SeasonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  organizationId: z.string().uuid(),
  year: z.number().int(),
  status: SeasonStatusSchema,
  dateRange: SeasonDateRangeSchema,
  applicationWindow: ApplicationWindowSchema,
  pricingTiers: z.array(SeasonPricingTierSchema),
  priorityRules: z.array(PriorityRuleSchema),
  maxApplicationsPerUser: z.number().int().positive(),
  autoApproveRenewals: z.boolean(),
  requirePaymentOnApproval: z.boolean(),
  paymentDeadlineDays: z.number().int().positive(),
  totalSlots: z.number().int().nonnegative(),
  availableSlots: z.number().int().nonnegative(),
  applicationCount: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

/**
 * Full Season Application Schema
 */
export const SeasonApplicationSchema = z.object({
  id: z.string().uuid(),
  applicationNumber: z.string(),
  seasonId: z.string().uuid(),
  userId: z.string().uuid(),
  status: SeasonApplicationStatusSchema,
  assignedRentalObjectId: z.string().uuid().nullable(),
  preferredRentalObjectIds: z.array(z.string().uuid()),
  vesselInfo: z.object({
    name: z.string().nullable(),
    registrationNumber: z.string().nullable(),
    length: z.number().positive(),
    width: z.number().positive(),
    draft: z.number().positive().nullable(),
    type: z.string().nullable(),
  }).nullable(),
  priorityScore: z.number().int(),
  priorityBreakdown: z.record(z.string(), z.number()).nullable(),
  notes: z.string().nullable(),
  reviewNotes: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  isRenewal: z.boolean(),
  previousSeasonId: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  submittedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedBy: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type SeasonStatus = z.infer<typeof SeasonStatusSchema>;
export type SeasonApplicationStatus = z.infer<typeof SeasonApplicationStatusSchema>;
export type PriorityRuleType = z.infer<typeof PriorityRuleTypeSchema>;
export type SeasonPricingTier = z.infer<typeof SeasonPricingTierSchema>;
export type SeasonDateRange = z.infer<typeof SeasonDateRangeSchema>;
export type ApplicationWindow = z.infer<typeof ApplicationWindowSchema>;
export type PriorityRule = z.infer<typeof PriorityRuleSchema>;
export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonSchema>;
export type CreateSeasonApplicationInput = z.infer<typeof CreateSeasonApplicationSchema>;
export type UpdateSeasonApplicationInput = z.infer<typeof UpdateSeasonApplicationSchema>;
export type SeasonFilter = z.infer<typeof SeasonFilterSchema>;
export type SeasonApplicationFilter = z.infer<typeof SeasonApplicationFilterSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type SeasonApplication = z.infer<typeof SeasonApplicationSchema>;
export type SeasonId = Season['id'];
export type SeasonApplicationId = SeasonApplication['id'];

/**
 * Season with Relations
 */
export interface SeasonWithRelations extends Season {
  organization?: {
    id: string;
    name: string;
  };
  applications?: SeasonApplication[];
  allocations?: Array<{
    id: string;
    rentalObjectId: string;
    userId: string | null;
    status: string;
  }>;
}

/**
 * Season Application with Relations
 */
export interface SeasonApplicationWithRelations extends SeasonApplication {
  season?: {
    id: string;
    name: string;
    year: number;
    status: SeasonStatus;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedRentalObject?: {
    id: string;
    name: string;
    type: string;
    location?: {
      harborName?: string;
      pier?: string;
      position?: string;
    } | null;
  } | null;
  preferredRentalObjects?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

/**
 * Season Summary (for lists)
 */
export interface SeasonSummary {
  id: string;
  name: string;
  year: number;
  status: SeasonStatus;
  dateRange: SeasonDateRange;
  applicationWindow: {
    openDate: Date;
    closeDate: Date;
    isOpen: boolean;
  };
  slots: {
    total: number;
    available: number;
    occupied: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    waitlisted: number;
  };
}

/**
 * Season Application Summary (for lists)
 */
export interface SeasonApplicationSummary {
  id: string;
  applicationNumber: string;
  seasonId: string;
  seasonName: string;
  userId: string;
  userName: string;
  status: SeasonApplicationStatus;
  priorityScore: number;
  isRenewal: boolean;
  submittedAt: Date;
  vesselLength: number | null;
  assignedSlot: string | null;
}

/**
 * Season Statistics
 */
export interface SeasonStatistics {
  seasonId: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyRate: number;
  applications: {
    total: number;
    byStatus: Record<SeasonApplicationStatus, number>;
    renewalCount: number;
    newApplicationCount: number;
  };
  revenue: {
    projected: number;
    collected: number;
    outstanding: number;
  };
  waitlist: {
    count: number;
    averageWaitTime: number;
  };
}

/**
 * Season Timeline Event
 */
export interface SeasonTimelineEvent {
  type: 'application_open' | 'priority_deadline' | 'application_close' | 'season_start' | 'season_end';
  date: Date;
  label: string;
  isPast: boolean;
  isCurrent: boolean;
}

/**
 * Season Action
 */
export type SeasonAction =
  | 'activate'
  | 'close_applications'
  | 'process_applications'
  | 'send_notifications'
  | 'generate_allocations'
  | 'archive';

/**
 * Season Application Action
 */
export type SeasonApplicationAction =
  | 'approve'
  | 'reject'
  | 'waitlist'
  | 'assign_slot'
  | 'request_payment'
  | 'send_reminder';

/**
 * Season Permission
 */
export interface SeasonPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageApplications: boolean;
  canGenerateAllocations: boolean;
  canSendNotifications: boolean;
}

/**
 * Season Application Permission
 */
export interface SeasonApplicationPermission {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canWaitlist: boolean;
  canAssignSlot: boolean;
  canWithdraw: boolean;
}
