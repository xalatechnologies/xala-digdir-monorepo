/**
 * Dashboard Service
 * Quick stats, recent activity, and dashboard widgets
 */
import { getClient } from '../core/client-factory';
import type { DashboardKPIs } from '../types';

// Status breakdown from API
export interface StatusBreakdown {
  count: number;
  revenue: number;
}

// Dashboard stats as returned by the API
export interface DashboardStats {
  total: number;
  byStatus: {
    confirmed: StatusBreakdown;
    completed: StatusBreakdown;
    cancelled: StatusBreakdown;
    pending: StatusBreakdown;
  };
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'listing' | 'user' | 'message' | 'payment';
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  resourceId?: string;
  timestamp: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  count?: number;
}

export interface UpcomingBooking {
  id: string;
  listingId: string;
  listingName: string;
  userName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface PendingItems {
  bookings: number;
  messages: number;
  approvals: number;
}

export class DashboardService {
  private basePath = '/api/dashboard';

  /**
   * Get dashboard statistics including booking counts and revenue by status
   * API returns data directly (not wrapped in { data: ... })
   *
   * @returns Promise containing total bookings and breakdown by status (confirmed, completed, cancelled, pending)
   *
   * @example
   * ```typescript
   * // Get dashboard stats
   * const stats = await dashboardService.getStats();
   * console.log(`Total bookings: ${stats.total}`);
   * console.log(`Confirmed: ${stats.byStatus.confirmed.count}`);
   * console.log(`Revenue from confirmed: ${stats.byStatus.confirmed.revenue}`);
   * ```
   */
  async getStats(): Promise<DashboardStats> {
    return getClient().get<DashboardStats>(`${this.basePath}/stats`);
  }

  /**
   * Get KPI summary for reports including key performance indicators
   *
   * @returns Promise containing dashboard KPIs (revenue, bookings, utilization, etc.)
   *
   * @example
   * ```typescript
   * // Get KPI metrics
   * const kpis = await dashboardService.getKPIs();
   * console.log('Current KPIs:', kpis);
   * ```
   */
  async getKPIs(): Promise<DashboardKPIs> {
    return getClient().get<DashboardKPIs>(`${this.basePath}/kpis`);
  }

  /**
   * Get recent activity feed showing latest actions in the system
   *
   * @param limit - Maximum number of activity items to return (default: 10)
   * @returns Promise containing array of recent activity items
   *
   * @example
   * ```typescript
   * // Get last 20 activities
   * const activities = await dashboardService.getRecentActivity(20);
   * activities.forEach(activity => {
   *   console.log(`${activity.type}: ${activity.description} at ${activity.timestamp}`);
   * });
   * ```
   */
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    return getClient().get<RecentActivity[]>(`${this.basePath}/activity?limit=${limit}`);
  }

  /**
   * Get quick actions for current user based on their role and permissions
   *
   * @returns Promise containing array of quick action items with labels, icons, and links
   *
   * @example
   * ```typescript
   * // Get available quick actions
   * const actions = await dashboardService.getQuickActions();
   * actions.forEach(action => {
   *   console.log(`${action.label} (${action.count || 0}) - ${action.href}`);
   * });
   * ```
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return getClient().get<QuickAction[]>(`${this.basePath}/quick-actions`);
  }

  /**
   * Get today's upcoming bookings to display in dashboard
   *
   * @param limit - Maximum number of bookings to return (default: 5)
   * @returns Promise containing array of upcoming bookings with listing and user details
   *
   * @example
   * ```typescript
   * // Get next 10 upcoming bookings
   * const bookings = await dashboardService.getUpcomingBookings(10);
   * bookings.forEach(booking => {
   *   console.log(`${booking.listingName} - ${booking.userName} at ${booking.startTime}`);
   * });
   * ```
   */
  async getUpcomingBookings(limit = 5): Promise<UpcomingBooking[]> {
    return getClient().get<UpcomingBooking[]>(`${this.basePath}/upcoming?limit=${limit}`);
  }

  /**
   * Get pending items requiring attention (bookings, messages, approvals)
   *
   * @returns Promise containing counts of pending items by category
   *
   * @example
   * ```typescript
   * // Check pending items
   * const pending = await dashboardService.getPendingItems();
   * console.log(`Pending bookings: ${pending.bookings}`);
   * console.log(`Unread messages: ${pending.messages}`);
   * console.log(`Awaiting approval: ${pending.approvals}`);
   * ```
   */
  async getPendingItems(): Promise<PendingItems> {
    return getClient().get<PendingItems>(`${this.basePath}/pending`);
  }
}

export const dashboardService = new DashboardService();
