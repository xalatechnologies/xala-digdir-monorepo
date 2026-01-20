/**
 * Allocations Service
 * Calendar allocations and time blocking management
 */
import { getClient } from '@/core/client-factory';

export interface Allocation {
  id: string;
  tenantId: string;
  listingId: string;
  listingName?: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'blocked' | 'reserved' | 'confirmed' | 'cancelled';
  bookingId?: string | null;
  userId?: string | null;
  userName?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AllocationQueryParams {
  listingId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface CreateAllocationDTO {
  listingId: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: string;
  bookingId?: string;
  userId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

class AllocationService {
  private basePath = '/api/allocations';

  /**
   * Get all allocations with optional filtering
   * Retrieve calendar allocations (time blocks) filtered by listing, date range, or status
   *
   * @param params - Query parameters for filtering allocations
   * @returns Array of allocations matching the filters
   *
   * @example
   * ```typescript
   * // Get all blocked allocations
   * const { data } = await allocationService.getAll({ status: 'blocked' });
   *
   * // Get allocations for a specific listing
   * const allocations = await allocationService.getAll({
   *   listingId: 'listing-123',
   *   startDate: '2024-06-01',
   *   endDate: '2024-06-30'
   * });
   *
   * // Get confirmed bookings
   * const confirmed = await allocationService.getAll({ status: 'confirmed' });
   * ```
   */
  async getAll(params: AllocationQueryParams = {}): Promise<{ data: Allocation[] }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<{ data: Allocation[] }>(url);
  }

  /**
   * Create a new allocation (time block)
   * Create a calendar allocation to block time, reserve slots, or confirm bookings
   *
   * @param data - Allocation creation data including listing, time range, and status
   * @returns Newly created allocation
   *
   * @example
   * ```typescript
   * // Block time for maintenance
   * const { data } = await allocationService.create({
   *   listingId: 'field-001',
   *   title: 'Maintenance: Grass cutting',
   *   startTime: '2024-06-15T08:00:00Z',
   *   endTime: '2024-06-15T12:00:00Z',
   *   status: 'blocked',
   *   notes: 'Scheduled maintenance'
   * });
   *
   * // Reserve slot for booking
   * const reservation = await allocationService.create({
   *   listingId: 'room-202',
   *   title: 'Reserved for Event Planning',
   *   startTime: '2024-06-20T14:00:00Z',
   *   endTime: '2024-06-20T16:00:00Z',
   *   status: 'reserved',
   *   bookingId: 'booking-456',
   *   userId: 'user-789'
   * });
   * ```
   */
  async create(data: CreateAllocationDTO): Promise<{ data: Allocation }> {
    return getClient().post<{ data: Allocation }>(this.basePath, data);
  }

  /**
   * Delete an allocation
   * Permanently removes an allocation/time block from the calendar
   *
   * @param id - Allocation ID to delete
   * @returns Success status
   *
   * @example
   * ```typescript
   * await allocationService.delete('allocation-123');
   * ```
   */
  async deleteById(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get allocations for a specific listing
   * Convenience method to retrieve all allocations for a single listing
   *
   * @param listingId - Listing ID to filter by
   * @param params - Additional query parameters (date range, status)
   * @returns Array of allocations for the listing
   *
   * @example
   * ```typescript
   * // Get all allocations for a listing
   * const { data } = await allocationService.getByListing('field-001');
   *
   * // Get blocked allocations for a listing
   * const blocked = await allocationService.getByListing('field-001', {
   *   status: 'blocked'
   * });
   *
   * // Get allocations in date range
   * const june = await allocationService.getByListing('field-001', {
   *   startDate: '2024-06-01',
   *   endDate: '2024-06-30'
   * });
   * ```
   */
  async getByListing(listingId: string, params: Omit<AllocationQueryParams, 'listingId'> = {}): Promise<{ data: Allocation[] }> {
    return this.getAll({ ...params, listingId });
  }

  /**
   * Get allocations for a date range
   * Convenience method to retrieve allocations within a specific time period
   *
   * @param startDate - Start date (ISO 8601 format)
   * @param endDate - End date (ISO 8601 format)
   * @param params - Additional query parameters (listing, status)
   * @returns Array of allocations within the date range
   *
   * @example
   * ```typescript
   * // Get all allocations for next week
   * const { data } = await allocationService.getByDateRange(
   *   '2024-06-10',
   *   '2024-06-17'
   * );
   *
   * // Get allocations for specific listing in date range
   * const listingAllocations = await allocationService.getByDateRange(
   *   '2024-06-01',
   *   '2024-06-30',
   *   { listingId: 'field-001' }
   * );
   * ```
   */
  async getByDateRange(startDate: string, endDate: string, params: Omit<AllocationQueryParams, 'startDate' | 'endDate'> = {}): Promise<{ data: Allocation[] }> {
    return this.getAll({ ...params, startDate, endDate });
  }
}

export const allocationService = new AllocationService();
