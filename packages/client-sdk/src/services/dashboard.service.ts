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
   * Get dashboard statistics
   * API returns data directly (not wrapped in { data: ... })
   */
  async getStats(): Promise<DashboardStats> {
    return getClient().get<DashboardStats>(`${this.basePath}/stats`);
  }

  /**
   * Get KPI summary for reports
   */
  async getKPIs(): Promise<DashboardKPIs> {
    return getClient().get<DashboardKPIs>(`${this.basePath}/kpis`);
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    return getClient().get<RecentActivity[]>(`${this.basePath}/activity?limit=${limit}`);
  }

  /**
   * Get quick actions for current user
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return getClient().get<QuickAction[]>(`${this.basePath}/quick-actions`);
  }

  /**
   * Get today's upcoming bookings
   */
  async getUpcomingBookings(limit = 5): Promise<UpcomingBooking[]> {
    return getClient().get<UpcomingBooking[]>(`${this.basePath}/upcoming?limit=${limit}`);
  }

  /**
   * Get pending items requiring attention
   */
  async getPendingItems(): Promise<PendingItems> {
    return getClient().get<PendingItems>(`${this.basePath}/pending`);
  }
}

export const dashboardService = new DashboardService();
