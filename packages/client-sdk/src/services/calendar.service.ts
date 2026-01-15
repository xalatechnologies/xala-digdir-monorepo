/**
 * Calendar Service
 * Single Responsibility: Handle calendar configuration and availability matrix operations
 *
 * This service provides methods for:
 * - Getting calendar configuration for a listing (granularity, rules, permissions)
 * - Getting availability matrix with cell-by-cell status
 */

import { BaseService } from './base.service';
import type {
  ListingCalendarConfigProjectionDTO,
  ListingAvailabilityMatrixProjectionDTO,
  AvailabilityMatrixQueryParams,
} from '../types/calendar';
import type { SingleResponse } from '../types/enums';

/**
 * Query parameters for calendar config endpoint
 */
export interface CalendarConfigQueryParams {
  /** Booking type to get config for (optional) */
  bookingType?: string;
}

/**
 * Listing Calendar Service
 * Handles calendar configuration and availability matrix for listings
 */
export class ListingCalendarService extends BaseService {
  constructor() {
    super('/api/listings');
  }

  /**
   * Get calendar configuration for a listing
   * Returns complete calendar behavior including granularity, slot rules, booking window,
   * opening hours, allowed booking types, UI hints, and permissions.
   *
   * @param listingId - The listing ID
   * @param params - Optional query parameters (bookingType)
   * @returns Calendar configuration projection DTO
   *
   * @example
   * ```typescript
   * const { data } = await listingCalendarService.getCalendarConfig('listing-123');
   * console.log(data.granularity); // 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY'
   * console.log(data.slotSizeMinutes); // 30
   * ```
   */
  async getCalendarConfig(
    listingId: string,
    params?: CalendarConfigQueryParams
  ): Promise<SingleResponse<ListingCalendarConfigProjectionDTO>> {
    return this.client.get(
      this.buildPath(`/${listingId}/calendar-config`),
      { params: params as Record<string, string | number | boolean> }
    );
  }
}

/**
 * Availability Matrix Service
 * Handles availability matrix queries for listings
 */
export class AvailabilityMatrixService extends BaseService {
  constructor() {
    super('/api/availability');
  }

  /**
   * Get availability matrix for a listing
   * Returns cell-by-cell availability state for a date range, with each cell
   * containing status (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED)
   * and reason key for unavailable slots.
   *
   * @param listingId - The listing ID
   * @param params - Query parameters including from/to dates and optional bookingType
   * @returns Availability matrix projection DTO with cells array
   *
   * @example
   * ```typescript
   * const { data } = await availabilityMatrixService.getAvailabilityMatrix('listing-123', {
   *   from: '2025-01-15',
   *   to: '2025-01-21',
   *   bookingType: 'HOURLY'
   * });
   * console.log(data.cells); // Array of AvailabilityCellDTO
   * ```
   */
  async getAvailabilityMatrix(
    listingId: string,
    params: AvailabilityMatrixQueryParams
  ): Promise<SingleResponse<ListingAvailabilityMatrixProjectionDTO>> {
    return this.client.get(
      this.buildPath(`/${listingId}`),
      { params: params as unknown as Record<string, string | number | boolean> }
    );
  }
}

// Singleton instances
export const listingCalendarService = new ListingCalendarService();
export const availabilityMatrixService = new AvailabilityMatrixService();
