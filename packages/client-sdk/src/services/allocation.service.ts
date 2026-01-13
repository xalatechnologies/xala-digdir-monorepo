/**
 * Allocations Service
 * Calendar allocations and time blocking management
 */
import { getClient } from '../core/client-factory';

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
   */
  async create(data: CreateAllocationDTO): Promise<{ data: Allocation }> {
    return getClient().post<{ data: Allocation }>(this.basePath, data);
  }

  /**
   * Delete an allocation
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get allocations for a specific listing
   */
  async getByListing(listingId: string, params: Omit<AllocationQueryParams, 'listingId'> = {}): Promise<{ data: Allocation[] }> {
    return this.getAll({ ...params, listingId });
  }

  /**
   * Get allocations for a date range
   */
  async getByDateRange(startDate: string, endDate: string, params: Omit<AllocationQueryParams, 'startDate' | 'endDate'> = {}): Promise<{ data: Allocation[] }> {
    return this.getAll({ ...params, startDate, endDate });
  }
}

export const allocationService = new AllocationService();
