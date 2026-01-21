/**
 * Seasons Mappers
 *
 * Functions for mapping domain season/venue DTOs to UI component props.
 * These mappers enable thin wrapper components by providing
 * the DTO -> props transformation layer.
 */

import type { SeasonCardData, SeasonStatus, VenueCardData } from '../../blocks/seasons';

// =============================================================================
// Translation Function Type
// =============================================================================

type TranslationFn = (key: string, params?: Record<string, unknown>) => string;

// =============================================================================
// Season Status Types
// =============================================================================

export type SeasonStatusColor =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface SeasonStatusBadge {
  label: string;
  color: SeasonStatusColor;
}

// =============================================================================
// Season DTO (from API)
// =============================================================================

/**
 * Season DTO as received from the API.
 * This represents the raw data structure from the backend.
 */
export interface SeasonDTO {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  totalApplications?: number;
  approvedApplications?: number;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps a Season DTO from the API to SeasonCardData.
 *
 * @param dto - The season DTO from the API
 * @param t - Translation function for i18n
 * @returns SeasonCardData for SeasonCard component
 *
 * @example
 * ```tsx
 * const cardData = mapSeasonDTOToCardData(season, t);
 * return <SeasonCard season={cardData} />;
 * ```
 */
export function mapSeasonDTOToCardData(
  dto: SeasonDTO,
  _t: TranslationFn
): SeasonCardData {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    status: mapApiStatusToSeasonStatus(dto.status),
    startDate: dto.startDate,
    endDate: dto.endDate,
    applicationDeadline: dto.applicationDeadline,
    totalApplications: dto.totalApplications,
    approvedApplications: dto.approvedApplications,
  };
}

/**
 * Maps API status string to SeasonStatus enum.
 */
function mapApiStatusToSeasonStatus(apiStatus: string): SeasonStatus {
  const statusMap: Record<string, SeasonStatus> = {
    DRAFT: 'draft',
    OPEN: 'open',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    // Handle lowercase variants
    draft: 'draft',
    open: 'open',
    closed: 'closed',
    cancelled: 'cancelled',
    completed: 'completed',
  };
  return statusMap[apiStatus] ?? 'draft';
}

/**
 * Gets the status badge configuration for a season status.
 *
 * @param status - The season status
 * @param t - Translation function
 * @returns Status badge with label and color
 */
export function getSeasonStatusBadge(
  status: SeasonStatus,
  t: TranslationFn
): SeasonStatusBadge {
  const config: Record<SeasonStatus, { labelKey: string; color: SeasonStatusColor }> = {
    draft: { labelKey: 'seasons.status.draft', color: 'neutral' },
    open: { labelKey: 'seasons.status.open', color: 'success' },
    closed: { labelKey: 'seasons.status.closed', color: 'warning' },
    cancelled: { labelKey: 'seasons.status.cancelled', color: 'danger' },
    completed: { labelKey: 'seasons.status.completed', color: 'info' },
  };

  const cfg = config[status] ?? config.draft;
  return {
    label: t(cfg.labelKey),
    color: cfg.color,
  };
}

// =============================================================================
// Venue DTO (from API)
// =============================================================================

/**
 * Venue DTO as received from the API.
 */
export interface VenueDTO {
  id: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  size?: number | null;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
  } | null;
  imageUrl?: string | null;
  categories?: string[] | null;
  amenities?: string[] | null;
}

/**
 * Maps a Venue DTO from the API to VenueCardData.
 *
 * @param dto - The venue DTO from the API
 * @param _t - Translation function (for future use)
 * @returns VenueCardData for VenueCard component
 */
export function mapVenueDTOToCardData(
  dto: VenueDTO,
  _t: TranslationFn
): VenueCardData {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    capacity: dto.capacity ?? undefined,
    size: dto.size ?? undefined,
    address: dto.address
      ? {
          street: dto.address.street,
          city: dto.address.city,
        }
      : undefined,
    imageUrl: dto.imageUrl ?? undefined,
    categories: dto.categories ?? undefined,
  };
}

// =============================================================================
// Date Formatting Helpers
// =============================================================================

/**
 * Formats a date string for display.
 */
export function formatSeasonDate(
  dateString: string,
  locale: string = 'nb-NO'
): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a date range for display.
 */
export function formatSeasonDateRange(
  startDate: string,
  endDate: string,
  locale: string = 'nb-NO'
): string {
  return `${formatSeasonDate(startDate, locale)} - ${formatSeasonDate(endDate, locale)}`;
}

/**
 * Checks if a season is currently accepting applications.
 */
export function isSeasonAcceptingApplications(season: SeasonCardData): boolean {
  if (season.status !== 'open') return false;

  const now = new Date();
  const deadline = new Date(season.applicationDeadline);
  return now <= deadline;
}

/**
 * Gets the number of days until the application deadline.
 * Returns negative if deadline has passed.
 */
export function getDaysUntilDeadline(deadlineString: string): number {
  const now = new Date();
  const deadline = new Date(deadlineString);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================================
// List/Array Helpers
// =============================================================================

/**
 * Maps an array of season DTOs to card data.
 */
export function mapSeasonDTOsToCardData(
  items: SeasonDTO[],
  t: TranslationFn
): SeasonCardData[] {
  return items.map((item) => mapSeasonDTOToCardData(item, t));
}

/**
 * Maps an array of venue DTOs to card data.
 */
export function mapVenueDTOsToCardData(
  items: VenueDTO[],
  t: TranslationFn
): VenueCardData[] {
  return items.map((item) => mapVenueDTOToCardData(item, t));
}

/**
 * Filters seasons by status.
 */
export function filterSeasonsByStatus(
  seasons: SeasonCardData[],
  statuses: SeasonStatus[]
): SeasonCardData[] {
  return seasons.filter((s) => statuses.includes(s.status));
}

/**
 * Gets open seasons that are still accepting applications.
 */
export function getActiveSeasons(seasons: SeasonCardData[]): SeasonCardData[] {
  return seasons.filter(isSeasonAcceptingApplications);
}
