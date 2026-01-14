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

export interface SeasonVenue {
  id: string;
  seasonId: string;
  listingId: string;
  listingName: string;
  listingSlug?: string;
  capacity?: number;
  category?: string;
  isActive: boolean;
  addedAt: string;
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
   */
  async getById(id: string): Promise<{ data: Season }> {
    return getClient().get<{ data: Season }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new season
   */
  async create(data: CreateSeasonDTO): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(this.basePath, data);
  }

  /**
   * Update a season
   */
  async update(id: string, data: UpdateSeasonDTO): Promise<{ data: Season }> {
    return getClient().patch<{ data: Season }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Open a season for applications
   */
  async open(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/open`, {});
  }

  /**
   * Close a season (stop accepting applications)
   */
  async close(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/close`, {});
  }

  /**
   * Activate a season (make it the current active season)
   */
  async activate(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/activate`, {});
  }

  /**
   * Complete a season (mark as finished)
   */
  async complete(id: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/complete`, {});
  }

  /**
   * Cancel a season
   */
  async cancel(id: string, reason?: string): Promise<{ data: Season }> {
    return getClient().post<{ data: Season }>(`${this.basePath}/${id}/cancel`, { reason });
  }

  /**
   * Delete a season (draft only)
   */
  async delete(id: string): Promise<void> {
    return getClient().delete(`${this.basePath}/${id}`);
  }

  /**
   * Get season statistics
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

  /**
   * Get venues assigned to a season
   */
  async getSeasonVenues(seasonId: string): Promise<{ data: SeasonVenue[] }> {
    return getClient().get<{ data: SeasonVenue[] }>(`${this.basePath}/${seasonId}/venues`);
  }
}

export const seasonService = new SeasonService();
export default seasonService;
