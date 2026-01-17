/**
 * Org Dashboard Service
 * Service for organization-scoped dashboard operations
 */
import { getClient } from '../core/client-factory';
import type {
  OrgDashboardStatsDTO,
  OrgPendingItemDTO,
  CalendarPreviewDTO,
  CalendarPreviewParams,
  OrgAlertDTO,
  AssignedRentalObjectDTO,
  PaginatedResponse,
  PaginationParams,
} from '../types/org-dashboard';

/**
 * Org Dashboard Service
 * Provides methods for org-scoped dashboard data
 */
export const orgDashboardService = {
  /**
   * Get dashboard stats for assigned rental objects
   */
  async getStats(): Promise<{ data: OrgDashboardStatsDTO }> {
    return getClient().get<{ data: OrgDashboardStatsDTO }>('/api/org-dashboard/stats');
  },

  /**
   * Get pending items (bookings needing approval) for assigned objects
   */
  async getPendingItems(
    params?: PaginationParams
  ): Promise<PaginatedResponse<OrgPendingItemDTO>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());

    const url = queryParams.toString()
      ? `/api/org-dashboard/pending-items?${queryParams}`
      : '/api/org-dashboard/pending-items';

    return getClient().get<PaginatedResponse<OrgPendingItemDTO>>(url);
  },

  /**
   * Get calendar preview for assigned objects
   */
  async getCalendarPreview(
    params?: CalendarPreviewParams
  ): Promise<{ data: CalendarPreviewDTO }> {
    const queryParams = new URLSearchParams();
    if (params?.range) queryParams.set('range', params.range);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const url = queryParams.toString()
      ? `/api/org-dashboard/calendar-preview?${queryParams}`
      : '/api/org-dashboard/calendar-preview';

    return getClient().get<{ data: CalendarPreviewDTO }>(url);
  },

  /**
   * Get operational alerts for assigned objects
   */
  async getAlerts(): Promise<{ data: OrgAlertDTO[] }> {
    return getClient().get<{ data: OrgAlertDTO[] }>('/api/org-dashboard/alerts');
  },

  /**
   * Get list of assigned rental objects
   */
  async getAssignedRentalObjects(): Promise<{ data: AssignedRentalObjectDTO[] }> {
    return getClient().get<{ data: AssignedRentalObjectDTO[] }>(
      '/api/org-dashboard/assigned-rental-objects'
    );
  },
};

export default orgDashboardService;
