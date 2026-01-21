import { z } from 'zod';
import {
  SeasonStatusSchema,
  SeasonApplicationStatusSchema,
  PriorityRuleTypeSchema,
  SeasonPricingTierSchema,
  SeasonDateRangeSchema,
  ApplicationWindowSchema,
  PriorityRuleSchema,
  CreateSeasonSchema,
  UpdateSeasonSchema,
  CreateSeasonApplicationSchema,
  UpdateSeasonApplicationSchema,
  SeasonFilterSchema,
  SeasonApplicationFilterSchema,
  SeasonSchema,
  SeasonApplicationSchema,
} from '../schemas/season';

/**
 * Season Status
 */
export type SeasonStatus = z.infer<typeof SeasonStatusSchema>;

/**
 * Season Application Status
 */
export type SeasonApplicationStatus = z.infer<typeof SeasonApplicationStatusSchema>;

/**
 * Priority Rule Type
 */
export type PriorityRuleType = z.infer<typeof PriorityRuleTypeSchema>;

/**
 * Season Pricing Tier
 */
export type SeasonPricingTier = z.infer<typeof SeasonPricingTierSchema>;

/**
 * Season Date Range
 */
export type SeasonDateRange = z.infer<typeof SeasonDateRangeSchema>;

/**
 * Application Window
 */
export type ApplicationWindow = z.infer<typeof ApplicationWindowSchema>;

/**
 * Priority Rule
 */
export type PriorityRule = z.infer<typeof PriorityRuleSchema>;

/**
 * Create Season Input
 */
export type CreateSeasonInput = z.infer<typeof CreateSeasonSchema>;

/**
 * Update Season Input
 */
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonSchema>;

/**
 * Create Season Application Input
 */
export type CreateSeasonApplicationInput = z.infer<typeof CreateSeasonApplicationSchema>;

/**
 * Update Season Application Input
 */
export type UpdateSeasonApplicationInput = z.infer<typeof UpdateSeasonApplicationSchema>;

/**
 * Season Filter
 */
export type SeasonFilter = z.infer<typeof SeasonFilterSchema>;

/**
 * Season Application Filter
 */
export type SeasonApplicationFilter = z.infer<typeof SeasonApplicationFilterSchema>;

/**
 * Full Season
 */
export type Season = z.infer<typeof SeasonSchema>;

/**
 * Season Application
 */
export type SeasonApplication = z.infer<typeof SeasonApplicationSchema>;

/**
 * Season ID
 */
export type SeasonId = Season['id'];

/**
 * Season Application ID
 */
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
