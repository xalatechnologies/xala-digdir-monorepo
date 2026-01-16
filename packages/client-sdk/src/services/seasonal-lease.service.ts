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
   * Get all seasonal leases with optional filtering
   * Retrieve paginated seasonal leases filtered by listing, organization, season, or status
   *
   * @param params - Query parameters for filtering seasonal leases
   * @returns Paginated response containing seasonal leases and metadata
   *
   * @example
   * ```typescript
   * // Get all active seasonal leases
   * const { data, meta } = await seasonalLeaseService.getAll({ status: 'active' });
   *
   * // Get seasonal leases for a specific listing
   * const result = await seasonalLeaseService.getAll({
   *   listingId: 'listing-123',
   *   season: '2024-summer'
   * });
   *
   * // Paginated query
   * const page2 = await seasonalLeaseService.getAll({ page: 2, limit: 10 });
   * ```
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
   * Get a single seasonal lease by its ID
   *
   * @param id - Unique identifier of the seasonal lease
   * @returns Seasonal lease data
   *
   * @example
   * ```typescript
   * const { data } = await seasonalLeaseService.getById('lease-123');
   * console.log(`Season: ${data.season}, Status: ${data.status}`);
   * ```
   */
  async getById(id: string): Promise<{ data: SeasonalLease }> {
    return getClient().get<{ data: SeasonalLease }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new seasonal lease
   * Creates a long-term seasonal contract with weekly recurring time slots
   *
   * @param data - Seasonal lease creation data including listing, organization, dates, and weekly slots
   * @returns Newly created seasonal lease with status 'draft'
   *
   * @example
   * ```typescript
   * // Create summer season lease for football field
   * const { data } = await seasonalLeaseService.create({
   *   listingId: 'field-001',
   *   organizationId: 'org-123',
   *   season: '2024-summer',
   *   startDate: '2024-06-01',
   *   endDate: '2024-08-31',
   *   weeklySlots: [
   *     { dayOfWeek: 1, startTime: '18:00', endTime: '20:00' }, // Monday
   *     { dayOfWeek: 3, startTime: '18:00', endTime: '20:00' }  // Wednesday
   *   ],
   *   totalPrice: 5000,
   *   notes: 'Youth team training'
   * });
   * ```
   */
  async create(data: CreateSeasonalLeaseDTO): Promise<{ data: SeasonalLease }> {
    return getClient().post<{ data: SeasonalLease }>(this.basePath, data);
  }

  /**
   * Update an existing seasonal lease
   * Modify lease details such as time slots, dates, or pricing
   *
   * @param id - Seasonal lease ID to update
   * @param data - Partial update data (only fields to change)
   * @returns Updated seasonal lease
   *
   * @example
   * ```typescript
   * // Update weekly slots
   * const { data } = await seasonalLeaseService.update('lease-123', {
   *   weeklySlots: [
   *     { dayOfWeek: 2, startTime: '17:00', endTime: '19:00' }
   *   ]
   * });
   *
   * // Update pricing
   * await seasonalLeaseService.update('lease-123', { totalPrice: 6000 });
   * ```
   */
  async update(id: string, data: Partial<CreateSeasonalLeaseDTO>): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Approve a pending seasonal lease
   * Changes status from 'pending' to 'approved', making it ready for allocation generation
   *
   * @param id - Seasonal lease ID to approve
   * @returns Approved seasonal lease with updated status
   *
   * @example
   * ```typescript
   * const { data } = await seasonalLeaseService.approve('lease-123');
   * // Status is now 'approved', can generate allocations
   * await seasonalLeaseService.generateAllocations(data.id);
   * ```
   */
  async approve(id: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/approve`);
  }

  /**
   * Reject a pending seasonal lease
   * Declines the lease request with an optional reason
   *
   * @param id - Seasonal lease ID to reject
   * @param reason - Optional explanation for rejection
   * @returns Rejected seasonal lease
   *
   * @example
   * ```typescript
   * await seasonalLeaseService.reject('lease-123', 'Time slot conflicts with existing booking');
   * ```
   */
  async reject(id: string, reason?: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/reject`, { reason });
  }

  /**
   * Cancel an active or approved seasonal lease
   * Cancels the lease and optionally provides a reason
   *
   * @param id - Seasonal lease ID to cancel
   * @param reason - Optional cancellation reason
   * @returns Cancelled seasonal lease
   *
   * @example
   * ```typescript
   * await seasonalLeaseService.cancel('lease-123', 'Organization withdrew request');
   * ```
   */
  async cancel(id: string, reason?: string): Promise<{ data: SeasonalLease }> {
    return getClient().put<{ data: SeasonalLease }>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Delete a seasonal lease (draft only)
   * Permanently removes a draft seasonal lease. Only draft leases can be deleted.
   *
   * @param id - Seasonal lease ID to delete
   * @returns Success status
   *
   * @example
   * ```typescript
   * await seasonalLeaseService.delete('lease-draft-123');
   * ```
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Generate calendar allocations from an approved seasonal lease
   * Creates individual allocation entries for each recurring weekly slot across the season date range
   *
   * @param id - Approved seasonal lease ID
   * @returns Number of allocations created
   *
   * @example
   * ```typescript
   * // After approving a lease, generate allocations
   * const { data } = await seasonalLeaseService.generateAllocations('lease-123');
   * console.log(`Created ${data.allocationsCreated} allocation entries`);
   * // For a 12-week season with 2 weekly slots: allocationsCreated = 24
   * ```
   */
  async generateAllocations(id: string): Promise<{ data: { allocationsCreated: number } }> {
    return getClient().post<{ data: { allocationsCreated: number } }>(`${this.basePath}/${id}/generate-allocations`);
  }

  /**
   * Get rule-based allocation suggestions for seasonal leases (KRAV-ADM-05)
   * Returns AI-generated suggestions based on historical usage, priority rules, and availability
   *
   * @param params - Optional filters for listing and season
   * @returns Allocation suggestions with reasoning and historical data
   *
   * @example
   * ```typescript
   * // Get suggestions for a specific listing and season
   * const { data } = await seasonalLeaseService.getSuggestions({
   *   listingId: 'field-001',
   *   season: '2024-summer'
   * });
   *
   * data.suggestions.forEach(suggestion => {
   *   console.log(`${suggestion.organizationName}: ${suggestion.reasoning}`);
   *   console.log(`Suggested days: ${suggestion.suggestedWeekdays}`);
   * });
   * ```
   */
  async getSuggestions(params?: { listingId?: string; season?: string }): Promise<{ data: AllocationSuggestions }> {
    const queryParams = new URLSearchParams();
    if (params?.listingId) queryParams.set('listingId', params.listingId);
    if (params?.season) queryParams.set('season', params.season);
    
    const url = queryParams.toString()
      ? `${this.basePath}/suggestions?${queryParams.toString()}`
      : `${this.basePath}/suggestions`;
      
    return getClient().get<{ data: AllocationSuggestions }>(url);
  }
}

// =============================================================================
// Allocation Suggestion Types (KRAV-ADM-05)
// =============================================================================

export interface AllocationSuggestions {
  season: string;
  listingId: string;
  generatedAt: string;
  algorithm: string;
  canOverride: boolean;
  suggestions: AllocationSuggestion[];
}

export interface AllocationSuggestion {
  priority: number;
  organizationId: string | null;
  organizationName: string;
  suggestedWeekdays: number[];
  suggestedTimeSlot: { startTime: string; endTime: string };
  reasoning: string;
  historicalUsage: { totalLeases: number; lastSeason: string | null };
}

export const seasonalLeaseService = new SeasonalLeaseService();

