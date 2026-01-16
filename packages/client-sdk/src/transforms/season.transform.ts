/**
 * Season & Season Application Transformers
 *
 * Reusable transformation utilities for season and application data.
 * Used by web, backoffice, and minside apps.
 */

import type { Season, SeasonStatus, SeasonApplication } from '../types';

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
  rentalObjectId: string;
  rentalObjectName?: string;
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
// Transform Utilities
// =============================================================================

const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  draft: 'Utkast',
  open: 'Åpen for søknader',
  closed: 'Stengt',
  active: 'Aktiv',
  completed: 'Fullført',
  cancelled: 'Kansellert',
};

const SEASON_STATUS_COLORS: Record<SeasonStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
  active: 'success',
  completed: 'neutral',
  cancelled: 'danger',
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Venter',
  approved: 'Godkjent',
  rejected: 'Avvist',
  allocated: 'Tildelt',
};

const APPLICATION_STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  allocated: 'success',
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Søndag',
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
};

const WEEKDAY_SHORT_LABELS: Record<number, string> = {
  0: 'Søn',
  1: 'Man',
  2: 'Tir',
  3: 'Ons',
  4: 'Tor',
  5: 'Fre',
  6: 'Lør',
};

/**
 * Get display label for season status
 */
export function getSeasonStatusLabel(status: SeasonStatus): string {
  return SEASON_STATUS_LABELS[status] || status;
}

/**
 * Get color for season status
 */
export function getSeasonStatusColor(status: SeasonStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  return SEASON_STATUS_COLORS[status] || 'neutral';
}

/**
 * Get display label for application status
 */
export function getApplicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] || status;
}

/**
 * Get color for application status
 */
export function getApplicationStatusColor(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  return APPLICATION_STATUS_COLORS[status] || 'neutral';
}

/**
 * Get weekday label
 */
export function getWeekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] || `Dag ${weekday}`;
}

/**
 * Get short weekday label
 */
export function getWeekdayShortLabel(weekday: number): string {
  return WEEKDAY_SHORT_LABELS[weekday] || `D${weekday}`;
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

  // Duration label
  let durationLabel: string;
  if (durationDays < 30) {
    durationLabel = `${durationDays} dag${durationDays > 1 ? 'er' : ''}`;
  } else if (durationDays < 365) {
    const months = Math.floor(durationDays / 30);
    durationLabel = `${months} måned${months > 1 ? 'er' : ''}`;
  } else {
    const years = Math.floor(durationDays / 365);
    durationLabel = `${years} år`;
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

  // Duration label
  let durationLabel: string;
  if (durationMinutes < 60) {
    durationLabel = `${durationMinutes} min`;
  } else if (durationMinutes % 60 === 0) {
    const hours = durationMinutes / 60;
    durationLabel = hours === 1 ? '1 time' : `${hours} timer`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    durationLabel = `${hours}t ${mins}min`;
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

  const priorityLabel = application.priority ? `Prioritet ${application.priority}` : undefined;

  return {
    // Core
    id: application.id,
    tenantId: application.tenantId,
    seasonId: application.seasonId,
    rentalObjectId: application.rentalObjectId,
    rentalObjectName: application.rentalObjectName,
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
