/**
 * Allocations Service
 * Handles resource allocation operations for rental objects
 */

import { BaseService } from './base.service';
import type {
  Allocation,
  CreateAllocationDTO,
  UpdateAllocationDTO,
  AllocationQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '@/types';

export class AllocationsService extends BaseService {
  constructor() {
    super('/api/allocations');
  }

  /**
   * Get all allocations with optional filtering
   */
  async getAll(params?: AllocationQueryParams): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single allocation by ID
   */
  async getById(id: string): Promise<SingleResponse<Allocation>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get allocations for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), { 
      params: { rentalObjectId } 
    });
  }

  /**
   * Create new allocation
   */
  async create(data: CreateAllocationDTO): Promise<SingleResponse<Allocation>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing allocation
   */
  async update(id: string, data: UpdateAllocationDTO): Promise<SingleResponse<Allocation>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete allocation
   */
  async deleteAllocation(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Bulk create allocations
   */
  async bulkCreate(allocations: CreateAllocationDTO[]): Promise<PaginatedResponse<Allocation>> {
    return this.client.post(this.buildPath('/bulk'), { allocations });
  }

  /**
   * Get allocation conflicts for a time range
   */
  async checkConflicts(params: {
    rentalObjectId: string;
    startTime: string;
    endTime: string;
  }): Promise<SingleResponse<{ conflicts: Allocation[] }>> {
    return this.client.post(this.buildPath('/check-conflicts'), params);
  }

  /**
   * Get allocations for a specific listing (alias for getByRentalObject with params)
   * Convenience method to retrieve all allocations for a single listing
   *
   * @deprecated Use getByRentalObject instead. This method uses "listing" terminology.
   *
   * @param listingId - Listing/RentalObject ID to filter by
   * @param params - Additional query parameters (date range, status)
   * @returns Array of allocations for the listing
   *
   * @example
   * ```typescript
   * // Get all allocations for a listing
   * const { data } = await allocationsService.getByListing('field-001');
   *
   * // Get blocked allocations for a listing
   * const blocked = await allocationsService.getByListing('field-001', {
   *   status: 'blocked'
   * });
   * ```
   */
  async getByListing(
    listingId: string,
    params: Omit<AllocationQueryParams, 'rentalObjectId'> = {}
  ): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, rentalObjectId: listingId } as Record<string, string | number | boolean>
    });
  }

  /**
   * Get allocations for a date range
   * Convenience method to retrieve allocations within a specific time period
   *
   * @param startDate - Start date (ISO 8601 format)
   * @param endDate - End date (ISO 8601 format)
   * @param params - Additional query parameters (rentalObjectId, status)
   * @returns Array of allocations within the date range
   *
   * @example
   * ```typescript
   * // Get all allocations for next week
   * const { data } = await allocationsService.getByDateRange(
   *   '2024-06-10',
   *   '2024-06-17'
   * );
   *
   * // Get allocations for specific rental object in date range
   * const listingAllocations = await allocationsService.getByDateRange(
   *   '2024-06-01',
   *   '2024-06-30',
   *   { rentalObjectId: 'field-001' }
   * );
   * ```
   */
  async getByDateRange(
    startDate: string,
    endDate: string,
    params: Omit<AllocationQueryParams, 'startDate' | 'endDate'> = {}
  ): Promise<PaginatedResponse<Allocation>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, startDate, endDate } as Record<string, string | number | boolean>
    });
  }

  /**
   * Delete allocation by ID
   * @deprecated Use deleteAllocation instead
   */
  async deleteById(id: string): Promise<void> {
    return this.deleteAllocation(id);
  }
}

export const allocationsService = new AllocationsService();
