/**
 * Calendar Service
 * Single Responsibility: Handle calendar configuration and availability matrix operations
 *
 * This service provides methods for:
 * - Getting calendar configuration for a rental object (granularity, rules, permissions)
 * - Getting availability matrix with cell-by-cell status
 */

import { BaseService } from './base.service';
import type {
  RentalObjectCalendarConfigProjectionDTO,
  RentalObjectAvailabilityMatrixProjectionDTO,
  AvailabilityMatrixQueryParams,
} from '@/types/calendar';
import type { SingleResponse } from '@/types/enums';

/**
 * Query parameters for calendar config endpoint
 */
export interface CalendarConfigQueryParams {
  /** Booking type to get config for (optional) */
  bookingType?: string;
  /** Index signature for query key compatibility */
  [key: string]: string | undefined;
}

/**
 * Rental Object Calendar Service
 * Handles calendar configuration and availability matrix for rental objects
 */
export class RentalObjectCalendarService extends BaseService {
  constructor() {
    super('/api/rental-objects');
  }

  /**
   * Get calendar configuration for a rental object
   * Returns complete calendar behavior including granularity, slot rules, booking window,
   * opening hours, allowed booking types, UI hints, and permissions.
   *
   * @param rentalObjectId - The rental object ID
   * @param params - Optional query parameters (bookingType)
   * @returns Calendar configuration projection DTO
   *
   * @example
   * ```typescript
   * const { data } = await rentalObjectCalendarService.getCalendarConfig('rental-object-123');
   * console.log(data.granularity); // 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY'
   * console.log(data.slotSizeMinutes); // 30
   * ```
   */
  async getCalendarConfig(
    rentalObjectId: string,
    params?: CalendarConfigQueryParams
  ): Promise<SingleResponse<RentalObjectCalendarConfigProjectionDTO>> {
    return this.client.get(
      this.buildPath(`/${rentalObjectId}/calendar-config`),
      { params: params as Record<string, string | number | boolean> }
    );
  }
}

/**
 * Availability Matrix Service
 * Handles availability matrix queries for rental objects
 */
export class AvailabilityMatrixService extends BaseService {
  constructor() {
    super('/api/availability');
  }

  /**
   * Get availability matrix for a rental object
   * Returns cell-by-cell availability state for a date range, with each cell
   * containing status (AVAILABLE, RESERVED, BOOKED, BLOCKED, BLACKOUT, CLOSED)
   * and reason key for unavailable slots.
   *
   * @param rentalObjectId - The rental object ID
   * @param params - Query parameters including from/to dates and optional bookingType
   * @returns Availability matrix projection DTO with cells array
   *
   * @example
   * ```typescript
   * const { data } = await availabilityMatrixService.getAvailabilityMatrix('rental-object-123', {
   *   from: '2025-01-15',
   *   to: '2025-01-21',
   *   bookingType: 'HOURLY'
   * });
   * console.log(data.cells); // Array of AvailabilityCellDTO
   * ```
   */
  async getAvailabilityMatrix(
    rentalObjectId: string,
    params: AvailabilityMatrixQueryParams
  ): Promise<SingleResponse<RentalObjectAvailabilityMatrixProjectionDTO>> {
    return this.client.get(
      this.buildPath(`/${rentalObjectId}`),
      { params: params as unknown as Record<string, string | number | boolean> }
    );
  }
}

// Singleton instances
export const rentalObjectCalendarService = new RentalObjectCalendarService();
export const availabilityMatrixService = new AvailabilityMatrixService();
