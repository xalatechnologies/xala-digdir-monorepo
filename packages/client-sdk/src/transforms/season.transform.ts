/**
 * Season & Season Application Transformers
 *
 * Reusable transformation utilities for season and application data.
 * Used by web, backoffice, and minside apps.
 * 
 * Note: All labels are returned as i18n translation keys.
 * Use your app's t() function to resolve them.
 */

import type { Season, SeasonStatus, SeasonApplication } from '../types';
import {
  SEASON_STATUS_KEYS,
  SEASON_APPLICATION_STATUS_KEYS,
  WEEKDAY_KEYS,
  WEEKDAY_SHORT_KEYS,
  DURATION_KEYS,
  PRIORITY_KEYS,
} from '../localization/keys';

// =============================================================================
// UI Types for Transformed Seasons
// =============================================================================

export interface TransformedSeasonDates {
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  startDateFormatted: string;
  endDateFormatted: string;
  applicationDeadlineFormatted: string;
  durationDays: number;
  durationLabel: string;
  isActive: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  daysUntilStart: number;
  daysUntilDeadline: number;
  hasDeadlinePassed: boolean;
}

export interface TransformedSeasonStats {
  totalApplications: number;
  approvedApplications: number;
  allocatedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  approvalRate: number;
  allocationRate: number;
}

export interface TransformedSeason {
  // Core
  id: string;
  tenantId: string;
  name: string;
  description?: string;

  // Dates
  dates: TransformedSeasonDates;

  // Status
  status: SeasonStatus;
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';
  canApply: boolean;
  canEdit: boolean;

  // Stats
  stats: TransformedSeasonStats;

  // Metadata
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// UI Types for Transformed Season Applications
// =============================================================================

export interface TransformedSeasonApplicationTime {
  weekday: number;
  weekdayLabel: string;
  weekdayShort: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  durationHours: number;
  durationLabel: string;
}

export interface TransformedSeasonApplication {
  // Core
  id: string;
  tenantId: string;
  seasonId: string;
  listingId: string;
  listingName?: string;
  organizationId: string;
  organizationName?: string;

  // Applicant
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  displayName: string;
  contactInfo: string[];

  // Time
  time: TransformedSeasonApplicationTime;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'allocated';
  statusLabel: string;
  statusColor: 'success' | 'warning' | 'danger' | 'neutral';
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isAllocated: boolean;

  // Priority & Review
  priority?: number;
  priorityLabel?: string;
  notes?: string;
  rejectionReason?: string;

  // Metadata
  metadata?: Record<string, unknown>;

  // Timestamps
  createdAt: string;
  createdAtFormatted: string;
  updatedAt: string;
}

// =============================================================================
// Status Colors (semantic)
// =============================================================================

const SEASON_STATUS_COLORS: Record<SeasonStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
};

const APPLICATION_STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  allocated: 'success',
  waitlist: 'warning',
};

// Weekday index to key mapping
const WEEKDAY_INDEX_KEYS: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

// =============================================================================
// Label Functions (return i18n keys)
// =============================================================================

/**
 * Get i18n key for season status label
 * Use t(key) to resolve the actual label
 */
export function getSeasonStatusLabel(status: SeasonStatus): string {
  return SEASON_STATUS_KEYS[status as keyof typeof SEASON_STATUS_KEYS] ?? `sdk.season.status.${status}`;
}

/**
 * Get semantic color for season status
 */
export function getSeasonStatusColor(status: SeasonStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return SEASON_STATUS_COLORS[status] ?? 'neutral';
}

/**
 * Get i18n key for application status label
 * Use t(key) to resolve the actual label
 */
export function getApplicationStatusLabel(status: string): string {
  return SEASON_APPLICATION_STATUS_KEYS[status as keyof typeof SEASON_APPLICATION_STATUS_KEYS] ?? `sdk.seasonApplication.status.${status}`;
}

/**
 * Get semantic color for application status
 */
export function getApplicationStatusColor(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  return APPLICATION_STATUS_COLORS[status] ?? 'neutral';
}

/**
 * Get i18n key for weekday label
 * Use t(key) to resolve the actual label
 */
export function getWeekdayLabel(weekday: number): string {
  const dayKey = WEEKDAY_INDEX_KEYS[weekday];
  return dayKey ? WEEKDAY_KEYS[dayKey as keyof typeof WEEKDAY_KEYS] : `sdk.weekday.${weekday}`;
}

/**
 * Get i18n key for short weekday label
 * Use t(key) to resolve the actual label
 */
export function getWeekdayShortLabel(weekday: number): string {
  const dayKey = WEEKDAY_INDEX_KEYS[weekday];
  return dayKey ? WEEKDAY_SHORT_KEYS[dayKey as keyof typeof WEEKDAY_SHORT_KEYS] : `sdk.weekday.short.${weekday}`;
}

/**
 * Get i18n key for duration unit
 * Use t(key) to resolve the actual label
 */
export function getDurationUnitKey(singular: boolean, unit: 'minute' | 'hour' | 'day'): string {
  if (singular) {
    return DURATION_KEYS[unit];
  }
  return DURATION_KEYS[`${unit}s` as keyof typeof DURATION_KEYS];
}

/**
 * Format date to Norwegian format
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Transform season dates
 */
export function transformSeasonDates(season: Season): TransformedSeasonDates {
  const now = new Date();
  const startDate = new Date(season.startDate);
  const endDate = new Date(season.endDate);
  const deadline = new Date(season.applicationDeadline);

  const durationDays = daysBetween(startDate, endDate);
  const daysUntilStart = daysBetween(now, startDate);
  const daysUntilDeadline = daysBetween(now, deadline);

  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isPast = now > endDate;
  const hasDeadlinePassed = now > deadline;

  // Duration label - returns structured data for i18n interpolation
  let durationLabel: string;
  if (durationDays < 30) {
    durationLabel = durationDays === 1 ? `1 ${DURATION_KEYS.day}` : `${durationDays} ${DURATION_KEYS.days}`;
  } else if (durationDays < 365) {
    const months = Math.floor(durationDays / 30);
    durationLabel = `${months} sdk.duration.months`;
  } else {
    const years = Math.floor(durationDays / 365);
    durationLabel = `${years} sdk.duration.years`;
  }

  return {
    startDate: season.startDate,
    endDate: season.endDate,
    applicationDeadline: season.applicationDeadline,
    startDateFormatted: formatDate(season.startDate),
    endDateFormatted: formatDate(season.endDate),
    applicationDeadlineFormatted: formatDate(season.applicationDeadline),
    durationDays,
    durationLabel,
    isActive,
    isUpcoming,
    isPast,
    daysUntilStart,
    daysUntilDeadline,
    hasDeadlinePassed,
  };
}

/**
 * Transform season stats
 */
export function transformSeasonStats(season: Season): TransformedSeasonStats {
  const totalApplications = season.totalApplications || 0;
  const approvedApplications = season.approvedApplications || 0;
  const allocatedApplications = season.allocatedApplications || 0;
  const pendingApplications = totalApplications - approvedApplications;
  const rejectedApplications = 0; // Could be calculated if we had the data

  const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
  const allocationRate = approvedApplications > 0 ? (allocatedApplications / approvedApplications) * 100 : 0;

  return {
    totalApplications,
    approvedApplications,
    allocatedApplications,
    pendingApplications,
    rejectedApplications,
    approvalRate: Math.round(approvalRate),
    allocationRate: Math.round(allocationRate),
  };
}

/**
 * Transform application time
 */
export function transformApplicationTime(
  weekday: number,
  startTime: string,
  endTime: string
): TransformedSeasonApplicationTime {
  // Parse time strings (HH:MM format)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Calculate duration in hours
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const durationMinutes = endMinutes - startMinutes;
  const durationHours = durationMinutes / 60;

  // Duration label - uses i18n keys
  let durationLabel: string;
  if (durationMinutes < 60) {
    durationLabel = durationMinutes === 1 ? `1 ${DURATION_KEYS.minute}` : `${durationMinutes} ${DURATION_KEYS.minutes}`;
  } else if (durationMinutes % 60 === 0) {
    const hours = durationMinutes / 60;
    durationLabel = hours === 1 ? `1 ${DURATION_KEYS.hour}` : `${hours} ${DURATION_KEYS.hours}`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationLabel = `${hours} ${DURATION_KEYS.hours} ${mins} ${DURATION_KEYS.minutes}`;
  }

  return {
    weekday,
    weekdayLabel: getWeekdayLabel(weekday),
    weekdayShort: getWeekdayShortLabel(weekday),
    startTime,
    endTime,
    timeRange: `${startTime} - ${endTime}`,
    durationHours,
    durationLabel,
  };
}

// =============================================================================
// Main Transform Functions
// =============================================================================

/**
 * Transform a raw API season to a UI-friendly format
 */
export function transformSeason(season: Season): TransformedSeason {
  const dates = transformSeasonDates(season);
  const stats = transformSeasonStats(season);

  const canApply = season.status === 'open' && !dates.hasDeadlinePassed;
  const canEdit = season.status === 'draft' || season.status === 'open';

  return {
    // Core
    id: season.id,
    tenantId: season.tenantId,
    name: season.name,
    description: season.description,

    // Dates
    dates,

    // Status
    status: season.status,
    statusLabel: getSeasonStatusLabel(season.status),
    statusColor: getSeasonStatusColor(season.status),
    canApply,
    canEdit,

    // Stats
    stats,

    // Metadata
    metadata: season.metadata,

    // Timestamps
    createdAt: season.createdAt,
    updatedAt: season.updatedAt,
  };
}

/**
 * Transform multiple seasons
 */
export function transformSeasons(seasons: Season[]): TransformedSeason[] {
  return seasons.map(transformSeason);
}

/**
 * Transform a raw API season application to a UI-friendly format
 */
export function transformSeasonApplication(application: SeasonApplication): TransformedSeasonApplication {
  const time = transformApplicationTime(application.weekday, application.startTime, application.endTime);

  const displayName = application.organizationName || application.applicantName;
  const contactInfo: string[] = [];
  contactInfo.push(application.applicantEmail);
  if (application.applicantPhone) contactInfo.push(application.applicantPhone);

  const priorityLabel = application.priority ? `${PRIORITY_KEYS.prefix} ${application.priority}` : undefined;

  return {
    // Core
    id: application.id,
    tenantId: application.tenantId,
    seasonId: application.seasonId,
    listingId: application.listingId,
    listingName: application.listingName,
    organizationId: application.organizationId,
    organizationName: application.organizationName,

    // Applicant
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
    applicantPhone: application.applicantPhone,
    displayName,
    contactInfo,

    // Time
    time,

    // Status
    status: application.status,
    statusLabel: getApplicationStatusLabel(application.status),
    statusColor: getApplicationStatusColor(application.status),
    isPending: application.status === 'pending',
    isApproved: application.status === 'approved',
    isRejected: application.status === 'rejected',
    isAllocated: application.status === 'allocated',

    // Priority & Review
    priority: application.priority,
    priorityLabel,
    notes: application.notes,
    rejectionReason: application.rejectionReason,

    // Metadata
    metadata: application.metadata,

    // Timestamps
    createdAt: application.createdAt,
    createdAtFormatted: formatDate(application.createdAt),
    updatedAt: application.updatedAt,
  };
}

/**
 * Transform multiple season applications
 */
export function transformSeasonApplications(applications: SeasonApplication[]): TransformedSeasonApplication[] {
  return applications.map(transformSeasonApplication);
}
