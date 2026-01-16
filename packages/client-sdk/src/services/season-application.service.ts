/**
 * Season Application Service
 * Manages seasonal lease applications and allocation workflow
 */
import { getClient } from '../core/client-factory';

export interface SeasonApplication {
  id: string;
  tenantId: string;
  seasonId: string;
  rentalObjectId: string;
  rentalObjectName?: string;
  organizationId: string;
  organizationName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'pending' | 'approved' | 'rejected' | 'allocated';
  priority?: number;
  notes?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonApplicationQueryParams {
  seasonId?: string;
  rentalObjectId?: string;
  organizationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSeasonApplicationDTO {
  seasonId: string;
  rentalObjectId: string;
  organizationId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface AllocateApplicationDTO {
  applicationId: string;
  generateRecurring?: boolean;
}

export interface FinalizeSeasonAllocationsDTO {
  seasonId: string;
  sendNotifications?: boolean;
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

class SeasonApplicationService {
  private basePath = '/api/season-applications';

  /**
   * Get all season applications
   */
  async getAll(params: SeasonApplicationQueryParams = {}): Promise<PaginatedResponse<SeasonApplication>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}?${queryParams}`
      : this.basePath;

    return getClient().get<PaginatedResponse<SeasonApplication>>(url);
  }

  /**
   * Get a single season application by ID
   */
  async getById(id: string): Promise<{ data: SeasonApplication }> {
    return getClient().get<{ data: SeasonApplication }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new season application
   */
  async create(data: CreateSeasonApplicationDTO): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(this.basePath, data);
  }

  /**
   * Update a season application
   */
  async update(id: string, data: Partial<CreateSeasonApplicationDTO>): Promise<{ data: SeasonApplication }> {
    return getClient().patch<{ data: SeasonApplication }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Approve a season application
   */
  async approve(id: string): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(`${this.basePath}/${id}/approve`, {});
  }

  /**
   * Reject a season application
   */
  async reject(id: string, reason?: string): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(`${this.basePath}/${id}/reject`, { reason });
  }

  /**
   * Allocate an approved application (generate bookings)
   */
  async allocate(data: AllocateApplicationDTO): Promise<{ data: SeasonApplication }> {
    const { applicationId, generateRecurring = true } = data;
    return getClient().post<{ data: SeasonApplication }>(
      `${this.basePath}/${applicationId}/allocate`,
      { generateRecurring }
    );
  }

  /**
   * Finalize all allocations for a season
   */
  async finalizeAllocations(data: FinalizeSeasonAllocationsDTO): Promise<{ data: { success: boolean; allocatedCount: number } }> {
    const { seasonId, sendNotifications = true } = data;
    return getClient().post<{ data: { success: boolean; allocatedCount: number } }>(
      `/api/seasons/${seasonId}/finalize-allocations`,
      { sendNotifications }
    );
  }

  /**
   * Delete a season application (draft/pending only)
   */
  async delete(id: string): Promise<void> {
    return getClient().delete(`${this.basePath}/${id}`);
  }
}

export const seasonApplicationService = new SeasonApplicationService();
export default seasonApplicationService;
