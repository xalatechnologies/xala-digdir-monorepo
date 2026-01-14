/**
 * Seasonal Lease Service
 * Long-term allocations and seasonal contracts
 */
import { getClient } from '../core/client-factory';

export interface SeasonalLease {
  id: string;
  tenantId: string;
  listingId: string;
  listingName?: string;
  organizationId: string;
  organizationName?: string;
  season: string;
  startDate: string;
  endDate: string;
  // Weekly slots array for complex schedules
  weeklySlots: WeeklySlot[];
  // Flat fields for simple display (derived from weeklySlots)
  weekdays: number[];
  startTime: string;
  endTime: string;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'expired' | 'cancelled';
  totalPrice?: number;
  currency?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface SeasonalLeaseQueryParams {
  listingId?: string;
  organizationId?: string;
  season?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSeasonalLeaseDTO {
  listingId: string;
  organizationId: string;
  season: string;
  startDate: string;
  endDate: string;
  weeklySlots: WeeklySlot[];
  totalPrice?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class SeasonalLeaseService {
  private basePath = '/api/seasonal-leases';

  /**
   * Get all seasonal leases
   */
  async getAll(params: SeasonalLeaseQueryParams = {}): Promise<PaginatedResponse<SeasonalLease>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<PaginatedResponse<SeasonalLease>>(url);
  }

  /**
   * Get seasonal lease by ID
   */
  async getById(id: string): Promise<{ data: SeasonalLease }> {
    return getClient().get<{ data: SeasonalLease }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new seasonal lease
   */
  async create(data: CreateSeasonalLeaseDTO): Promise<{ data: SeasonalLease }> {
    return getClient().post<{ data: SeasonalLease }>(this.basePath, data);
  }

  /**
   * Update a seasonal lease
   */
  async update(id: string, data: Partial<CreateSeasonalLeaseDTO>): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Approve a seasonal lease
   */
  async approve(id: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/approve`);
  }

  /**
   * Reject a seasonal lease
   */
  async reject(id: string, reason?: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/reject`, { reason });
  }

  /**
   * Cancel a seasonal lease
   */
  async cancel(id: string, reason?: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Delete a seasonal lease (draft only)
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Generate allocations from seasonal lease
   */
  async generateAllocations(id: string): Promise<{ data: { allocationsCreated: number } }> {
    return getClient().post<{ data: { allocationsCreated: number } }>(`${this.basePath}/${id}/generate-allocations`);
  }
}

export const seasonalLeaseService = new SeasonalLeaseService();
