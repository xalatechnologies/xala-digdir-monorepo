/**
 * Season Service
 * Manages seasonal booking periods (parent entity for season applications)
 */
import { getClient } from '../core/client-factory';

export type SeasonStatus = 'draft' | 'open' | 'closed' | 'active' | 'completed' | 'cancelled';

export interface Season {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  description?: string;
  status: SeasonStatus;
  totalApplications?: number;
  approvedApplications?: number;
  allocatedApplications?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonQueryParams {
  status?: SeasonStatus;
  year?: number;
  page?: number;
  limit?: number;
}

export interface CreateSeasonDTO {
  name: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSeasonDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  description?: string;
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

class SeasonService {
  private basePath = '/api/seasons';

  /**
   * Get all seasons
   * Retrieves paginated list of seasons with optional filtering by status and year
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise with paginated list of seasons
   *
   * @example
   * ```typescript
   * // Get all seasons
   * const seasons = await seasonService.getAll();
   *
   * // Filter by status and year
   * const activeSeasons = await seasonService.getAll({
   *   status: 'active',
   *   year: 2024,
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async getAll(params: SeasonQueryParams = {}): Promise<PaginatedResponse<Season>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}?${queryParams}`
      : this.basePath;

    return getClient().get<PaginatedResponse<Season>>(url);
  }

  /**
   * Get a single season by ID
   * Retrieves detailed information for a specific season
   *
   * @param id - Unique season identifier
   * @returns Promise with season details
   *
   * @example
   * ```typescript
   * const season = await seasonService.getById('season-123');
   * console.log('Season name:', season.data.name);
   * console.log('Application deadline:', season.data.applicationDeadline);
   * ```
   */
  async getById(id: string): Promise<{ data: Season }> {
    return getClient().get<{ data: Season }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new season
   * Creates a new seasonal booking period with application deadline
   *
   * @param data - Season creation data including name, dates, and deadline
   * @returns Promise with created season
   *
   * @example
   * ```typescript
   * const season = await seasonService.create({
   *   name: 'Spring 2024',
   *   startDate: '2024-03-01',
   *   endDate: '2024-05-31',
   *   applicationDeadline: '2024-02-15',
   *   description: 'Spring season for sports facilities'
   * });
   * console.log('Created season:', season.data.id);
   * ```
   */
  async create(data: CreateSeasonDTO): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(this.basePath, data);
  }

  /**
   * Update a season
   * Updates season details such as dates, deadline, or description
   *
   * @param id - Season identifier
   * @param data - Partial season data to update
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const updated = await seasonService.update('season-123', {
   *   applicationDeadline: '2024-02-20',
   *   description: 'Extended application deadline'
   * });
   * ```
   */
  async update(id: string, data: UpdateSeasonDTO): Promise<{ data: Season }> {
    return getClient().patch<{ data: Season }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Open a season for applications
   * Changes season status to 'open', allowing organizations to submit applications
   *
   * @param id - Season identifier
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const season = await seasonService.open('season-123');
   * console.log('Season status:', season.data.status); // 'open'
   * ```
   */
  async open(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/open`, {});
  }

  /**
   * Close a season (stop accepting applications)
   * Changes season status to 'closed', preventing new applications from being submitted
   *
   * @param id - Season identifier
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const season = await seasonService.close('season-123');
   * console.log('Season status:', season.data.status); // 'closed'
   * ```
   */
  async close(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/close`, {});
  }

  /**
   * Activate a season (make it the current active season)
   * Changes season status to 'active', marking it as the currently running season
   *
   * @param id - Season identifier
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const season = await seasonService.activate('season-123');
   * console.log('Season is now active:', season.data.status); // 'active'
   * ```
   */
  async activate(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/activate`, {});
  }

  /**
   * Complete a season (mark as finished)
   * Changes season status to 'completed', marking it as finished and archived
   *
   * @param id - Season identifier
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const season = await seasonService.complete('season-123');
   * console.log('Season completed:', season.data.status); // 'completed'
   * ```
   */
  async complete(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/complete`, {});
  }

  /**
   * Cancel a season
   * Changes season status to 'cancelled', preventing any further operations
   *
   * @param id - Season identifier
   * @param reason - Optional cancellation reason for audit trail
   * @returns Promise with updated season
   *
   * @example
   * ```typescript
   * const season = await seasonService.cancel('season-123', 'Insufficient applications');
   * console.log('Season cancelled:', season.data.status); // 'cancelled'
   * ```
   */
  async cancel(id: string, reason?: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Delete a season (draft only)
   * Permanently deletes a season. Only allowed for seasons in 'draft' status
   *
   * @param id - Season identifier
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * ```typescript
   * await seasonService.delete('season-123');
   * console.log('Season deleted');
   * ```
   */
  async delete(id: string): Promise<void> {
    return getClient().delete(`${this.basePath}/${id}`);
  }

  /**
   * Get season statistics
   * Retrieves comprehensive statistics for a season including application counts and venue breakdown
   *
   * @param id - Season identifier
   * @returns Promise with season statistics including total, pending, approved, rejected, and allocated applications
   *
   * @example
   * ```typescript
   * const stats = await seasonService.getStats('season-123');
   * console.log('Total applications:', stats.data.totalApplications);
   * console.log('Approved:', stats.data.approvedApplications);
   * console.log('Applications by venue:', stats.data.applicationsByVenue);
   * ```
   */
  async getStats(id: string): Promise<{
    data: {
      totalApplications: number;
      pendingApplications: number;
      approvedApplications: number;
      rejectedApplications: number;
      allocatedApplications: number;
      applicationsByVenue: Array<{
        listingId: string;
        listingName: string;
        applicationCount: number;
      }>;
    }
  }> {
    return getClient().get(`${this.basePath}/${id}/stats`);
  }
}

export const seasonService = new SeasonService();
export default seasonService;
