/**
 * Season Application Service
 * Manages seasonal lease applications and allocation workflow
 */
import { getClient } from '../core/client-factory';

export interface SeasonApplication {
  id: string;
  tenantId: string;
  seasonId: string;
  listingId: string;
  listingName?: string;
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
  listingId?: string;
  organizationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateSeasonApplicationDTO {
  seasonId: string;
  listingId: string;
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
   * Retrieves paginated list of season applications with optional filtering by season, listing, organization, or status
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise with paginated list of season applications
   *
   * @example
   * ```typescript
   * // Get all applications
   * const applications = await seasonApplicationService.getAll();
   *
   * // Filter by season and status
   * const pendingApps = await seasonApplicationService.getAll({
   *   seasonId: 'season-123',
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * });
   * ```
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
   * Retrieves detailed information for a specific season application
   *
   * @param id - Unique application identifier
   * @returns Promise with application details
   *
   * @example
   * ```typescript
   * const application = await seasonApplicationService.getById('app-123');
   * console.log('Applicant:', application.data.applicantName);
   * console.log('Status:', application.data.status);
   * console.log('Time slot:', `${application.data.startTime} - ${application.data.endTime}`);
   * ```
   */
  async getById(id: string): Promise<{ data: SeasonApplication }> {
    return getClient().get<{ data: SeasonApplication }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new season application
   * Submits a new application for seasonal booking allocation with specified time slot
   *
   * @param data - Application creation data including season, listing, organization, time slot, and applicant details
   * @returns Promise with created application
   *
   * @example
   * ```typescript
   * const application = await seasonApplicationService.create({
   *   seasonId: 'season-123',
   *   listingId: 'listing-456',
   *   organizationId: 'org-789',
   *   applicantName: 'John Doe',
   *   applicantEmail: 'john@example.com',
   *   applicantPhone: '+47 12345678',
   *   weekday: 2, // Tuesday
   *   startTime: '18:00',
   *   endTime: '20:00',
   *   notes: 'Weekly training for youth team'
   * });
   * console.log('Application submitted:', application.data.id);
   * ```
   */
  async create(data: CreateSeasonApplicationDTO): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(this.basePath, data);
  }

  /**
   * Update a season application
   * Updates application details such as time slot, contact information, or notes
   *
   * @param id - Application identifier
   * @param data - Partial application data to update
   * @returns Promise with updated application
   *
   * @example
   * ```typescript
   * const updated = await seasonApplicationService.update('app-123', {
   *   weekday: 3, // Changed to Wednesday
   *   startTime: '19:00',
   *   notes: 'Updated: Changed time due to schedule conflict'
   * });
   * ```
   */
  async update(id: string, data: Partial<CreateSeasonApplicationDTO>): Promise<{ data: SeasonApplication }> {
    return getClient().patch<{ data: SeasonApplication }>(`${this.basePath}/${id}`, data);
  }

  /**
   * Approve a season application
   * Changes application status to 'approved', making it eligible for allocation
   *
   * @param id - Application identifier
   * @returns Promise with updated application
   *
   * @example
   * ```typescript
   * const approved = await seasonApplicationService.approve('app-123');
   * console.log('Application status:', approved.data.status); // 'approved'
   * ```
   */
  async approve(id: string): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(`${this.basePath}/${id}/approve`, {});
  }

  /**
   * Reject a season application
   * Changes application status to 'rejected' with optional reason for audit trail
   *
   * @param id - Application identifier
   * @param reason - Optional rejection reason that will be stored in rejectionReason field
   * @returns Promise with updated application
   *
   * @example
   * ```typescript
   * const rejected = await seasonApplicationService.reject(
   *   'app-123',
   *   'Time slot already allocated to another organization'
   * );
   * console.log('Rejection reason:', rejected.data.rejectionReason);
   * ```
   */
  async reject(id: string, reason?: string): Promise<{ data: SeasonApplication }> {
    return getClient().post<{ data: SeasonApplication }>(`${this.basePath}/${id}/reject`, { reason });
  }

  /**
   * Allocate an approved application (generate bookings)
   * Generates recurring bookings for an approved application based on the specified time slot
   *
   * @param data - Allocation data including application ID and recurring booking generation flag
   * @returns Promise with updated application with 'allocated' status
   *
   * @example
   * ```typescript
   * // Allocate and generate recurring bookings
   * const allocated = await seasonApplicationService.allocate({
   *   applicationId: 'app-123',
   *   generateRecurring: true
   * });
   * console.log('Application allocated:', allocated.data.status); // 'allocated'
   * ```
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
   * Processes all approved applications for a season, generates bookings, and optionally sends notifications
   *
   * @param data - Finalization data including season ID and notification flag
   * @returns Promise with success status and count of allocated applications
   *
   * @example
   * ```typescript
   * const result = await seasonApplicationService.finalizeAllocations({
   *   seasonId: 'season-123',
   *   sendNotifications: true
   * });
   * console.log('Allocated applications:', result.data.allocatedCount);
   * console.log('Success:', result.data.success);
   * ```
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
   * Permanently deletes an application. Only allowed for applications in 'pending' status
   *
   * @param id - Application identifier
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * ```typescript
   * await seasonApplicationService.delete('app-123');
   * console.log('Application deleted');
   * ```
   */
  async delete(id: string): Promise<void> {
    return getClient().delete(`${this.basePath}/${id}`);
  }
}

export const seasonApplicationService = new SeasonApplicationService();
export default seasonApplicationService;
