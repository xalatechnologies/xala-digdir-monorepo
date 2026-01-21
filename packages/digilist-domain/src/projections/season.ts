import { z } from 'zod';
import {
  SeasonStatusSchema,
  SeasonApplicationStatusSchema,
  PriorityRuleSchema,
  SeasonPricingTierSchema,
} from '../schemas/season';

/**
 * Season List Item Projection
 *
 * Used for displaying seasons in lists and tables.
 */
export const SeasonListProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  year: z.number(),
  status: SeasonStatusSchema,
  statusText: z.string(),
  statusColor: z.string(),
  organizationId: z.string().uuid(),
  organizationName: z.string().optional(),
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    formattedRange: z.string(),
  }),
  applicationWindow: z.object({
    openDate: z.coerce.date(),
    closeDate: z.coerce.date(),
    isOpen: z.boolean(),
    daysRemaining: z.number().nullable(),
    statusText: z.string(),
  }),
  slots: z.object({
    total: z.number(),
    available: z.number(),
    occupied: z.number(),
    occupancyRate: z.number(),
  }),
  applications: z.object({
    total: z.number(),
    pending: z.number(),
    approved: z.number(),
  }),
  updatedAt: z.coerce.date(),
});

export type SeasonListProjection = z.infer<typeof SeasonListProjectionSchema>;

/**
 * Season Detail Projection
 *
 * Used for displaying full season details on admin pages.
 */
export const SeasonDetailProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  year: z.number(),
  status: SeasonStatusSchema,
  statusText: z.string(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    formattedRange: z.string(),
    daysTotal: z.number(),
    daysRemaining: z.number().nullable(),
    daysElapsed: z.number().nullable(),
    progressPercent: z.number().nullable(),
  }),
  applicationWindow: z.object({
    openDate: z.coerce.date(),
    closeDate: z.coerce.date(),
    priorityDeadline: z.coerce.date().optional(),
    lateApplicationsAllowed: z.boolean(),
    lateFeeAmount: z.number().optional(),
    isOpen: z.boolean(),
    isPast: z.boolean(),
    daysRemaining: z.number().nullable(),
    statusText: z.string(),
    formattedRange: z.string(),
  }),
  pricingTiers: z.array(
    SeasonPricingTierSchema.extend({
      formattedPriceMultiplier: z.string(),
    })
  ),
  priorityRules: z.array(
    PriorityRuleSchema.extend({
      formattedPoints: z.string(),
    })
  ),
  settings: z.object({
    maxApplicationsPerUser: z.number(),
    autoApproveRenewals: z.boolean(),
    requirePaymentOnApproval: z.boolean(),
    paymentDeadlineDays: z.number(),
  }),
  statistics: z.object({
    slots: z.object({
      total: z.number(),
      available: z.number(),
      occupied: z.number(),
      maintenance: z.number(),
      occupancyRate: z.number(),
      formattedOccupancyRate: z.string(),
    }),
    applications: z.object({
      total: z.number(),
      pending: z.number(),
      underReview: z.number(),
      approved: z.number(),
      rejected: z.number(),
      waitlisted: z.number(),
      withdrawn: z.number(),
    }),
    renewals: z.object({
      total: z.number(),
      approved: z.number(),
      renewalRate: z.number(),
    }),
    revenue: z.object({
      projected: z.number(),
      formattedProjected: z.string(),
      collected: z.number(),
      formattedCollected: z.string(),
      outstanding: z.number(),
      formattedOutstanding: z.string(),
      currency: z.string(),
    }),
  }),
  timeline: z.array(
    z.object({
      type: z.enum([
        'application_open',
        'priority_deadline',
        'application_close',
        'season_start',
        'season_end',
      ]),
      date: z.coerce.date(),
      label: z.string(),
      isPast: z.boolean(),
      isCurrent: z.boolean(),
      isNext: z.boolean(),
    })
  ),
  // Permissions
  permissions: z.object({
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canActivate: z.boolean(),
    canCloseApplications: z.boolean(),
    canProcessApplications: z.boolean(),
    canGenerateAllocations: z.boolean(),
    canSendNotifications: z.boolean(),
    canArchive: z.boolean(),
  }),
  // Available actions
  availableActions: z.array(
    z.enum([
      'edit',
      'delete',
      'activate',
      'close_applications',
      'process_applications',
      'generate_allocations',
      'send_notifications',
      'export_applications',
      'export_allocations',
      'archive',
    ])
  ),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SeasonDetailProjection = z.infer<typeof SeasonDetailProjectionSchema>;

/**
 * Season Application List Item Projection
 *
 * Used for displaying applications in admin tables.
 */
export const SeasonApplicationListProjectionSchema = z.object({
  id: z.string().uuid(),
  applicationNumber: z.string(),
  seasonId: z.string().uuid(),
  seasonName: z.string(),
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    fullName: z.string(),
  }),
  status: SeasonApplicationStatusSchema,
  statusText: z.string(),
  statusColor: z.string(),
  priorityScore: z.number(),
  priorityRank: z.number().nullable(),
  isRenewal: z.boolean(),
  vessel: z
    .object({
      name: z.string().nullable(),
      length: z.number(),
      width: z.number(),
      displaySize: z.string(),
    })
    .nullable(),
  assignedSlot: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      pier: z.string().nullable(),
      position: z.string().nullable(),
    })
    .nullable(),
  submittedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
});

export type SeasonApplicationListProjection = z.infer<typeof SeasonApplicationListProjectionSchema>;

/**
 * Season Application Detail Projection
 *
 * Used for displaying full application details in admin review pages.
 */
export const SeasonApplicationDetailProjectionSchema = z.object({
  id: z.string().uuid(),
  applicationNumber: z.string(),
  season: z.object({
    id: z.string().uuid(),
    name: z.string(),
    year: z.number(),
    status: SeasonStatusSchema,
    dateRange: z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      formattedRange: z.string(),
    }),
  }),
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    fullName: z.string(),
    memberSince: z.coerce.date().nullable(),
    previousSeasons: z.number(),
  }),
  status: SeasonApplicationStatusSchema,
  statusText: z.string(),
  statusColor: z.string(),
  priority: z.object({
    score: z.number(),
    rank: z.number().nullable(),
    breakdown: z.array(
      z.object({
        rule: z.string(),
        points: z.number(),
        reason: z.string(),
      })
    ),
  }),
  vessel: z
    .object({
      name: z.string().nullable(),
      registrationNumber: z.string().nullable(),
      length: z.number(),
      width: z.number(),
      draft: z.number().nullable(),
      type: z.string().nullable(),
      displaySize: z.string(),
    })
    .nullable(),
  preferences: z.object({
    preferredSlots: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        type: z.string(),
        pier: z.string().nullable(),
        position: z.string().nullable(),
        isAvailable: z.boolean(),
      })
    ),
  }),
  assignedSlot: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      type: z.string(),
      pier: z.string().nullable(),
      position: z.string().nullable(),
      location: z.string(),
    })
    .nullable(),
  isRenewal: z.boolean(),
  previousSeason: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      slotName: z.string().nullable(),
    })
    .nullable(),
  notes: z.string().nullable(),
  reviewNotes: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  // Pricing
  pricing: z
    .object({
      tier: z.string(),
      baseAmount: z.number(),
      formattedBaseAmount: z.string(),
      totalAmount: z.number(),
      formattedTotalAmount: z.string(),
      currency: z.string(),
    })
    .nullable(),
  // Timestamps
  submittedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedBy: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
  // Permissions
  permissions: z.object({
    canView: z.boolean(),
    canEdit: z.boolean(),
    canApprove: z.boolean(),
    canReject: z.boolean(),
    canWaitlist: z.boolean(),
    canAssignSlot: z.boolean(),
    canRequestPayment: z.boolean(),
    canWithdraw: z.boolean(),
  }),
  // Available actions
  availableActions: z.array(
    z.enum([
      'view',
      'edit',
      'approve',
      'reject',
      'waitlist',
      'assign_slot',
      'change_slot',
      'request_payment',
      'send_reminder',
      'withdraw',
      'add_note',
    ])
  ),
  // Audit history
  history: z.array(
    z.object({
      action: z.string(),
      performedBy: z.string(),
      performedAt: z.coerce.date(),
      details: z.string().nullable(),
    })
  ),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SeasonApplicationDetailProjection = z.infer<
  typeof SeasonApplicationDetailProjectionSchema
>;

/**
 * Season Card Projection (for user portal)
 *
 * Used for displaying available seasons to users in minside.
 */
export const SeasonCardProjectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  year: z.number(),
  description: z.string().nullable(),
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    formattedRange: z.string(),
  }),
  applicationWindow: z.object({
    isOpen: z.boolean(),
    openDate: z.coerce.date(),
    closeDate: z.coerce.date(),
    daysRemaining: z.number().nullable(),
    statusText: z.string(),
    statusColor: z.string(),
  }),
  availability: z.object({
    totalSlots: z.number(),
    availableSlots: z.number(),
    isAvailable: z.boolean(),
  }),
  userApplication: z
    .object({
      id: z.string().uuid(),
      status: SeasonApplicationStatusSchema,
      statusText: z.string(),
      assignedSlot: z.string().nullable(),
    })
    .nullable(),
  canApply: z.boolean(),
  cannotApplyReason: z.string().nullable(),
  pricing: z.object({
    startingFrom: z.number(),
    formattedStartingFrom: z.string(),
    currency: z.string(),
  }),
});

export type SeasonCardProjection = z.infer<typeof SeasonCardProjectionSchema>;

/**
 * Season Summary Stats Projection
 *
 * Used for dashboard widgets showing season statistics.
 */
export const SeasonSummaryStatsProjectionSchema = z.object({
  seasonId: z.string().uuid(),
  seasonName: z.string(),
  status: SeasonStatusSchema,
  slots: z.object({
    total: z.number(),
    occupied: z.number(),
    available: z.number(),
    occupancyRate: z.number(),
    formattedOccupancyRate: z.string(),
  }),
  applications: z.object({
    total: z.number(),
    pending: z.number(),
    approved: z.number(),
    waitlisted: z.number(),
    processingRate: z.number(),
  }),
  revenue: z.object({
    collected: z.number(),
    formattedCollected: z.string(),
    outstanding: z.number(),
    formattedOutstanding: z.string(),
    currency: z.string(),
  }),
  trends: z.object({
    applicationsVsLastYear: z.object({
      direction: z.enum(['up', 'down', 'stable']),
      percentage: z.number(),
    }),
    occupancyVsLastYear: z.object({
      direction: z.enum(['up', 'down', 'stable']),
      percentage: z.number(),
    }),
  }),
});

export type SeasonSummaryStatsProjection = z.infer<typeof SeasonSummaryStatsProjectionSchema>;
