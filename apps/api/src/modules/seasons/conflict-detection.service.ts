/**
 * Conflict Detection Service
 * Identifies overlapping season applications for the same listing and time slots
 */
import { eq, and, or, ne } from 'drizzle-orm';
import { container } from '../../core/container';
import { seasonApplications, seasons, listings, organizations } from '../../database/schema/index';
import type { SeasonApplication } from '../../database/schema/index';

/**
 * Conflict information for an application
 */
export interface ApplicationConflict {
  applicationId: string;
  conflictingApplicationId: string;
  seasonId: string;
  seasonName: string;
  rentalObjectId: string;
  listingName: string;
  weekday: number;
  timeSlot: string;
  applicantName: string;
  conflictingApplicantName: string;
  organizationName: string;
  conflictingOrganizationName: string;
  overlapType: 'full' | 'partial';
  severity: 'high' | 'medium' | 'low';
}

/**
 * Conflict summary for a season
 */
export interface ConflictSummary {
  seasonId: string;
  totalConflicts: number;
  conflictsByListing: Record<string, number>;
  conflictsByWeekday: Record<number, number>;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
}

/**
 * Check if two time ranges overlap
 * Time format: "HH:MM" (e.g., "08:00", "10:30")
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): { overlaps: boolean; type: 'full' | 'partial' } {
  // Convert time strings to minutes since midnight for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  // Check if there's no overlap (one ends before the other starts)
  if (end1Minutes <= start2Minutes || end2Minutes <= start1Minutes) {
    return { overlaps: false, type: 'partial' };
  }

  // Check if one time range completely contains the other (full overlap)
  const fullOverlap =
    (start1Minutes <= start2Minutes && end1Minutes >= end2Minutes) ||
    (start2Minutes <= start1Minutes && end2Minutes >= end1Minutes);

  return {
    overlaps: true,
    type: fullOverlap ? 'full' : 'partial',
  };
}

/**
 * Calculate conflict severity based on overlap type and application status
 */
function calculateSeverity(
  overlapType: 'full' | 'partial',
  status1: string,
  status2: string
): 'high' | 'medium' | 'low' {
  // High severity: full overlap with at least one approved application
  if (overlapType === 'full' && (status1 === 'approved' || status2 === 'approved')) {
    return 'high';
  }

  // Medium severity: partial overlap with approved applications, or full overlap with pending
  if (
    (overlapType === 'partial' && (status1 === 'approved' || status2 === 'approved')) ||
    (overlapType === 'full' && status1 === 'pending' && status2 === 'pending')
  ) {
    return 'medium';
  }

  // Low severity: partial overlap with pending applications
  return 'low';
}

/**
 * Find all conflicts for a specific application
 */
export async function findConflictsForApplication(
  applicationId: string,
  tenantId: string
): Promise<ApplicationConflict[]> {
  const db = container.resolve<any>('Database');

  // Get the application details
  const application = await db
    .select()
    .from(seasonApplications)
    .where(
      and(eq(seasonApplications.id, applicationId), eq(seasonApplications.tenantId, tenantId))
    )
    .limit(1);

  if (!application.length) {
    return [];
  }

  const app = application[0];

  // Find all other applications for the same season, listing, and weekday
  // Exclude cancelled and rejected applications
  const potentialConflicts = await db
    .select({
      id: seasonApplications.id,
      seasonId: seasonApplications.seasonId,
      seasonName: seasons.name,
      rentalObjectId: seasonApplications.rentalObjectId,
      listingName: listings.name,
      organizationId: seasonApplications.organizationId,
      organizationName: organizations.name,
      applicantName: seasonApplications.applicantName,
      weekday: seasonApplications.weekday,
      startTime: seasonApplications.startTime,
      endTime: seasonApplications.endTime,
      status: seasonApplications.status,
    })
    .from(seasonApplications)
    .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
    .leftJoin(listings, eq(seasonApplications.rentalObjectId, listings.id))
    .leftJoin(organizations, eq(seasonApplications.organizationId, organizations.id))
    .where(
      and(
        eq(seasonApplications.tenantId, tenantId),
        eq(seasonApplications.seasonId, app.seasonId),
        eq(seasonApplications.rentalObjectId, app.rentalObjectId),
        eq(seasonApplications.weekday, app.weekday),
        ne(seasonApplications.id, applicationId),
        or(
          eq(seasonApplications.status, 'pending'),
          eq(seasonApplications.status, 'approved'),
          eq(seasonApplications.status, 'allocated')
        )
      )
    );

  // Get the original application's details with joins
  const appDetails = await db
    .select({
      organizationName: organizations.name,
      seasonName: seasons.name,
      listingName: listings.name,
    })
    .from(seasonApplications)
    .leftJoin(seasons, eq(seasonApplications.seasonId, seasons.id))
    .leftJoin(listings, eq(seasonApplications.rentalObjectId, listings.id))
    .leftJoin(organizations, eq(seasonApplications.organizationId, organizations.id))
    .where(eq(seasonApplications.id, applicationId))
    .limit(1);

  const appDetail = appDetails[0];

  // Check for time overlaps
  const conflicts: ApplicationConflict[] = [];

  for (const conflict of potentialConflicts) {
    const overlap = timeRangesOverlap(
      app.startTime,
      app.endTime,
      conflict.startTime,
      conflict.endTime
    );

    if (overlap.overlaps) {
      const severity = calculateSeverity(overlap.type, app.status, conflict.status);

      conflicts.push({
        applicationId,
        conflictingApplicationId: conflict.id,
        seasonId: app.seasonId,
        seasonName: conflict.seasonName || '',
        rentalObjectId: app.rentalObjectId,
        listingName: conflict.listingName || '',
        weekday: app.weekday,
        timeSlot: `${app.startTime}-${app.endTime}`,
        applicantName: app.applicantName,
        conflictingApplicantName: conflict.applicantName,
        organizationName: appDetail?.organizationName || '',
        conflictingOrganizationName: conflict.organizationName || '',
        overlapType: overlap.type,
        severity,
      });
    }
  }

  return conflicts;
}

/**
 * Find all conflicts for a season
 */
export async function findConflictsForSeason(
  seasonId: string,
  tenantId: string
): Promise<ApplicationConflict[]> {
  const db = container.resolve<any>('Database');

  // Get all applications for the season (excluding cancelled/rejected)
  const applications = await db
    .select()
    .from(seasonApplications)
    .where(
      and(
        eq(seasonApplications.seasonId, seasonId),
        eq(seasonApplications.tenantId, tenantId),
        or(
          eq(seasonApplications.status, 'pending'),
          eq(seasonApplications.status, 'approved'),
          eq(seasonApplications.status, 'allocated')
        )
      )
    );

  // Find conflicts for each application
  const allConflicts: ApplicationConflict[] = [];
  const processedPairs = new Set<string>();

  for (const app of applications) {
    const conflicts = await findConflictsForApplication(app.id, tenantId);

    // Deduplicate conflicts (A conflicts with B is the same as B conflicts with A)
    for (const conflict of conflicts) {
      const pairKey = [conflict.applicationId, conflict.conflictingApplicationId].sort().join('-');

      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        allConflicts.push(conflict);
      }
    }
  }

  return allConflicts;
}

/**
 * Get conflict summary for a season
 */
export async function getConflictSummary(
  seasonId: string,
  tenantId: string
): Promise<ConflictSummary> {
  const conflicts = await findConflictsForSeason(seasonId, tenantId);

  const conflictsByListing: Record<string, number> = {};
  const conflictsByWeekday: Record<number, number> = {};
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;
  let lowSeverityCount = 0;

  for (const conflict of conflicts) {
    // Count by listing
    conflictsByListing[conflict.rentalObjectId] = (conflictsByListing[conflict.rentalObjectId] || 0) + 1;

    // Count by weekday
    conflictsByWeekday[conflict.weekday] = (conflictsByWeekday[conflict.weekday] || 0) + 1;

    // Count by severity
    if (conflict.severity === 'high') highSeverityCount++;
    else if (conflict.severity === 'medium') mediumSeverityCount++;
    else lowSeverityCount++;
  }

  return {
    seasonId,
    totalConflicts: conflicts.length,
    conflictsByListing,
    conflictsByWeekday,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
  };
}

/**
 * Check if a specific time slot has conflicts
 */
export async function checkTimeSlotConflict(
  seasonId: string,
  rentalObjectId: string,
  weekday: number,
  startTime: string,
  endTime: string,
  tenantId: string,
  excludeApplicationId?: string
): Promise<boolean> {
  const db = container.resolve<any>('Database');

  // Get all applications for the same season, listing, weekday
  const conditions = [
    eq(seasonApplications.seasonId, seasonId),
    eq(seasonApplications.rentalObjectId, rentalObjectId),
    eq(seasonApplications.weekday, weekday),
    eq(seasonApplications.tenantId, tenantId),
    or(
      eq(seasonApplications.status, 'pending'),
      eq(seasonApplications.status, 'approved'),
      eq(seasonApplications.status, 'allocated')
    ),
  ];

  if (excludeApplicationId) {
    conditions.push(ne(seasonApplications.id, excludeApplicationId));
  }

  const applications = await db
    .select({
      id: seasonApplications.id,
      startTime: seasonApplications.startTime,
      endTime: seasonApplications.endTime,
    })
    .from(seasonApplications)
    .where(and(...conditions));

  // Check for time overlaps
  for (const app of applications) {
    const overlap = timeRangesOverlap(startTime, endTime, app.startTime, app.endTime);
    if (overlap.overlaps) {
      return true;
    }
  }

  return false;
}
