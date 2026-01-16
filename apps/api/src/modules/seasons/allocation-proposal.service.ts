/**
 * Allocation Proposal Service
 * Generates automated allocation suggestions based on priority rules and conflict resolution
 * KRAV-ADM-05: Regelstyrt forslag til sesongfordeling
 */
import { eq, and, or } from 'drizzle-orm';
import { container } from '../../core/container';
import { seasonApplications, seasons, listings, organizations } from '../../database/schema/index';
import type { SeasonApplication } from '../../database/schema/index';
import { sortApplicationsByPriority } from './priority-rules.service';
import { findConflictsForSeason, checkTimeSlotConflict } from './conflict-detection.service';

/**
 * Extended application with priority and listing/organization details
 */
interface ExtendedApplication extends SeasonApplication {
  calculatedPriority: number;
  priorityReason: string;
  organizationName?: string;
  organizationType?: string;
  listingName?: string;
}

/**
 * Allocation suggestion for an application
 */
export interface AllocationSuggestion {
  applicationId: string;
  organizationId: string;
  organizationName: string;
  rentalObjectId: string;
  listingName: string;
  weekday: number;
  suggestedStartTime: string;
  suggestedEndTime: string;
  originalStartTime: string;
  originalEndTime: string;
  timeAdjusted: boolean;
  priority: number;
  priorityReason: string;
  status: 'approve' | 'reject' | 'adjust';
  reasoning: string;
  conflicts: string[];
  hasConflicts: boolean;
}

/**
 * Allocation proposal result
 */
export interface AllocationProposal {
  seasonId: string;
  seasonName: string;
  generatedAt: string;
  algorithm: string;
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  adjustedCount: number;
  suggestions: AllocationSuggestion[];
  unresolvableConflicts: number;
  canOverride: boolean;
}

/**
 * Time slot adjustment options
 */
interface TimeSlotAdjustment {
  startTime: string;
  endTime: string;
  hasConflict: boolean;
}

/**
 * Generate time slot alternatives (e.g., shift by 1 hour, 2 hours, etc.)
 */
function generateTimeSlotAlternatives(
  startTime: string,
  endTime: string,
  maxShiftHours: number = 3
): TimeSlotAdjustment[] {
  const alternatives: TimeSlotAdjustment[] = [];

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;

  // Generate shifts (earlier and later)
  for (let shiftHours = 1; shiftHours <= maxShiftHours; shiftHours++) {
    const shiftMinutes = shiftHours * 60;

    // Earlier slot
    const earlierStart = startMinutes - shiftMinutes;
    if (earlierStart >= 6 * 60) { // Not before 06:00
      alternatives.push({
        startTime: minutesToTime(earlierStart),
        endTime: minutesToTime(earlierStart + duration),
        hasConflict: false,
      });
    }

    // Later slot
    const laterStart = startMinutes + shiftMinutes;
    if (laterStart + duration <= 23 * 60) { // Not after 23:00
      alternatives.push({
        startTime: minutesToTime(laterStart),
        endTime: minutesToTime(laterStart + duration),
        hasConflict: false,
      });
    }
  }

  return alternatives;
}

/**
 * Find alternative time slot without conflicts
 */
async function findAlternativeTimeSlot(
  seasonId: string,
  rentalObjectId: string,
  weekday: number,
  originalStartTime: string,
  originalEndTime: string,
  tenantId: string,
  excludeApplicationId: string
): Promise<TimeSlotAdjustment | null> {
  const alternatives = generateTimeSlotAlternatives(originalStartTime, originalEndTime);

  // Check each alternative for conflicts
  for (const alternative of alternatives) {
    const hasConflict = await checkTimeSlotConflict(
      seasonId,
      rentalObjectId,
      weekday,
      alternative.startTime,
      alternative.endTime,
      tenantId,
      excludeApplicationId
    );

    if (!hasConflict) {
      return alternative;
    }
  }

  return null;
}

/**
 * Generate allocation proposal for a season
 */
export async function generateAllocationProposal(
  seasonId: string,
  tenantId: string
): Promise<AllocationProposal> {
  const db = container.resolve<any>('Database');

  // Get season details
  const seasonResult = await db
    .select()
    .from(seasons)
    .where(and(eq(seasons.id, seasonId), eq(seasons.tenantId, tenantId)))
    .limit(1);

  if (!seasonResult.length) {
    throw new Error('Season not found');
  }

  const season = seasonResult[0];

  // Get all pending applications for the season
  const applications = await db
    .select()
    .from(seasonApplications)
    .where(
      and(
        eq(seasonApplications.seasonId, seasonId),
        eq(seasonApplications.tenantId, tenantId),
        eq(seasonApplications.status, 'pending')
      )
    );

  // Get conflicts for the season
  const conflicts = await findConflictsForSeason(seasonId, tenantId);

  // Create conflict map for quick lookup
  const conflictMap = new Map<string, string[]>();
  for (const conflict of conflicts) {
    if (!conflictMap.has(conflict.applicationId)) {
      conflictMap.set(conflict.applicationId, []);
    }
    if (!conflictMap.has(conflict.conflictingApplicationId)) {
      conflictMap.set(conflict.conflictingApplicationId, []);
    }

    conflictMap.get(conflict.applicationId)!.push(conflict.conflictingApplicationId);
    conflictMap.get(conflict.conflictingApplicationId)!.push(conflict.applicationId);
  }

  // Sort applications by priority
  const sortedApplications = await sortApplicationsByPriority(
    applications,
    seasonId,
    tenantId
  );

  // Enrich applications with listing and organization names
  const enrichedApplications: ExtendedApplication[] = [];
  for (const app of sortedApplications) {
    const listingResult = await db
      .select({ name: listings.name })
      .from(listings)
      .where(eq(listings.id, app.rentalObjectId))
      .limit(1);

    enrichedApplications.push({
      ...app,
      listingName: listingResult[0]?.name || 'Unknown',
    });
  }

  // Generate suggestions
  const suggestions: AllocationSuggestion[] = [];
  const approvedApplicationIds = new Set<string>();
  let approvedCount = 0;
  let rejectedCount = 0;
  let adjustedCount = 0;
  let unresolvableConflicts = 0;

  for (const app of enrichedApplications) {
    const appConflicts = conflictMap.get(app.id) || [];
    const hasConflicts = appConflicts.length > 0;

    // Check if any conflicting applications have already been approved
    const conflictsWithApproved = appConflicts.filter(conflictId =>
      approvedApplicationIds.has(conflictId)
    );

    let suggestion: AllocationSuggestion;

    if (!hasConflicts) {
      // No conflicts - approve as-is
      suggestion = {
        applicationId: app.id,
        organizationId: app.organizationId,
        organizationName: app.organizationName || 'Unknown',
        rentalObjectId: app.rentalObjectId,
        listingName: app.listingName || 'Unknown',
        weekday: app.weekday,
        suggestedStartTime: app.startTime,
        suggestedEndTime: app.endTime,
        originalStartTime: app.startTime,
        originalEndTime: app.endTime,
        timeAdjusted: false,
        priority: app.calculatedPriority,
        priorityReason: app.priorityReason,
        status: 'approve',
        reasoning: 'No conflicts detected. Application can be approved as submitted.',
        conflicts: [],
        hasConflicts: false,
      };
      approvedApplicationIds.add(app.id);
      approvedCount++;
    } else if (conflictsWithApproved.length === 0) {
      // Has conflicts but none are with already-approved applications - approve as-is
      suggestion = {
        applicationId: app.id,
        organizationId: app.organizationId,
        organizationName: app.organizationName || 'Unknown',
        rentalObjectId: app.rentalObjectId,
        listingName: app.listingName || 'Unknown',
        weekday: app.weekday,
        suggestedStartTime: app.startTime,
        suggestedEndTime: app.endTime,
        originalStartTime: app.startTime,
        originalEndTime: app.endTime,
        timeAdjusted: false,
        priority: app.calculatedPriority,
        priorityReason: app.priorityReason,
        status: 'approve',
        reasoning: `Has ${appConflicts.length} conflict(s) with lower-priority applications. Approved due to higher priority (${app.calculatedPriority}).`,
        conflicts: appConflicts,
        hasConflicts: true,
      };
      approvedApplicationIds.add(app.id);
      approvedCount++;
    } else {
      // Has conflicts with already-approved applications - try to find alternative time slot
      const alternative = await findAlternativeTimeSlot(
        seasonId,
        app.rentalObjectId,
        app.weekday,
        app.startTime,
        app.endTime,
        tenantId,
        app.id
      );

      if (alternative) {
        // Found alternative time slot - suggest adjustment
        suggestion = {
          applicationId: app.id,
          organizationId: app.organizationId,
          organizationName: app.organizationName || 'Unknown',
          rentalObjectId: app.rentalObjectId,
          listingName: app.listingName || 'Unknown',
          weekday: app.weekday,
          suggestedStartTime: alternative.startTime,
          suggestedEndTime: alternative.endTime,
          originalStartTime: app.startTime,
          originalEndTime: app.endTime,
          timeAdjusted: true,
          priority: app.calculatedPriority,
          priorityReason: app.priorityReason,
          status: 'adjust',
          reasoning: `Original time slot conflicts with higher-priority applications. Alternative time slot suggested: ${alternative.startTime}-${alternative.endTime}.`,
          conflicts: conflictsWithApproved,
          hasConflicts: true,
        };
        adjustedCount++;
      } else {
        // No alternative found - reject
        suggestion = {
          applicationId: app.id,
          organizationId: app.organizationId,
          organizationName: app.organizationName || 'Unknown',
          rentalObjectId: app.rentalObjectId,
          listingName: app.listingName || 'Unknown',
          weekday: app.weekday,
          suggestedStartTime: app.startTime,
          suggestedEndTime: app.endTime,
          originalStartTime: app.startTime,
          originalEndTime: app.endTime,
          timeAdjusted: false,
          priority: app.calculatedPriority,
          priorityReason: app.priorityReason,
          status: 'reject',
          reasoning: `Conflicts with ${conflictsWithApproved.length} higher-priority application(s). No alternative time slots available.`,
          conflicts: conflictsWithApproved,
          hasConflicts: true,
        };
        rejectedCount++;
        unresolvableConflicts++;
      }
    }

    suggestions.push(suggestion);
  }

  return {
    seasonId,
    seasonName: season.name,
    generatedAt: new Date().toISOString(),
    algorithm: 'priority_based_conflict_resolution_v1',
    totalApplications: applications.length,
    approvedCount,
    rejectedCount,
    adjustedCount,
    suggestions,
    unresolvableConflicts,
    canOverride: true,
  };
}

/**
 * Get allocation proposal summary (lightweight version without detailed suggestions)
 */
export async function getAllocationProposalSummary(
  seasonId: string,
  tenantId: string
): Promise<{
  seasonId: string;
  totalApplications: number;
  estimatedApprovals: number;
  estimatedRejections: number;
  estimatedAdjustments: number;
  hasConflicts: boolean;
  conflictCount: number;
}> {
  const db = container.resolve<any>('Database');

  // Count pending applications
  const applications = await db
    .select()
    .from(seasonApplications)
    .where(
      and(
        eq(seasonApplications.seasonId, seasonId),
        eq(seasonApplications.tenantId, tenantId),
        eq(seasonApplications.status, 'pending')
      )
    );

  // Get conflicts
  const conflicts = await findConflictsForSeason(seasonId, tenantId);

  // Simple estimation: applications with conflicts might need adjustment or rejection
  const applicationsWithConflicts = new Set<string>();
  for (const conflict of conflicts) {
    applicationsWithConflicts.add(conflict.applicationId);
    applicationsWithConflicts.add(conflict.conflictingApplicationId);
  }

  const conflictingCount = applicationsWithConflicts.size;
  const nonConflictingCount = applications.length - conflictingCount;

  return {
    seasonId,
    totalApplications: applications.length,
    estimatedApprovals: nonConflictingCount + Math.floor(conflictingCount * 0.5),
    estimatedRejections: Math.floor(conflictingCount * 0.2),
    estimatedAdjustments: Math.floor(conflictingCount * 0.3),
    hasConflicts: conflicts.length > 0,
    conflictCount: conflicts.length,
  };
}

/**
 * Apply allocation proposal (approve/reject/adjust applications based on suggestions)
 */
export async function applyAllocationProposal(
  seasonId: string,
  tenantId: string,
  options?: {
    autoApproveNoConflicts?: boolean;
    autoAdjustTimes?: boolean;
    rejectUnresolvable?: boolean;
  }
): Promise<{
  approvedCount: number;
  rejectedCount: number;
  adjustedCount: number;
  skippedCount: number;
}> {
  const db = container.resolve<any>('Database');

  const proposal = await generateAllocationProposal(seasonId, tenantId);

  let approvedCount = 0;
  let rejectedCount = 0;
  let adjustedCount = 0;
  let skippedCount = 0;

  for (const suggestion of proposal.suggestions) {
    if (suggestion.status === 'approve' && options?.autoApproveNoConflicts !== false) {
      // Auto-approve applications with no conflicts or higher priority
      await db
        .update(seasonApplications)
        .set({
          status: 'approved',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seasonApplications.id, suggestion.applicationId),
            eq(seasonApplications.tenantId, tenantId)
          )
        );
      approvedCount++;
    } else if (suggestion.status === 'adjust' && options?.autoAdjustTimes) {
      // Auto-adjust time slots and approve
      await db
        .update(seasonApplications)
        .set({
          startTime: suggestion.suggestedStartTime,
          endTime: suggestion.suggestedEndTime,
          status: 'approved',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seasonApplications.id, suggestion.applicationId),
            eq(seasonApplications.tenantId, tenantId)
          )
        );
      adjustedCount++;
    } else if (suggestion.status === 'reject' && options?.rejectUnresolvable) {
      // Auto-reject unresolvable conflicts
      await db
        .update(seasonApplications)
        .set({
          status: 'rejected',
          rejectionReason: suggestion.reasoning,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(seasonApplications.id, suggestion.applicationId),
            eq(seasonApplications.tenantId, tenantId)
          )
        );
      rejectedCount++;
    } else {
      // Skip - requires manual review
      skippedCount++;
    }
  }

  return {
    approvedCount,
    rejectedCount,
    adjustedCount,
    skippedCount,
  };
}
