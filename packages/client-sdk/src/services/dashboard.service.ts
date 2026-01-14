/**
 * Dashboard Service
 * Quick stats, recent activity, and dashboard widgets
 */
import { getClient } from '../core/client-factory';
import type { DashboardKPIs } from '../types';

export interface DashboardStats {
  bookings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    currency: string;
  };
  listings: {
    total: number;
    published: number;
    utilizationRate: number;
  };
  users: {
    total: number;
    activeToday: number;
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

export class DashboardService {
  private basePath = '/api/dashboard';

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<{ data: DashboardStats }> {
    return getClient().get<{ data: DashboardStats }>(`${this.basePath}/stats`);
  }

  /**
   * Get KPI summary for reports
   */
  async getKPIs(): Promise<{ data: DashboardKPIs }> {
    return getClient().get<{ data: DashboardKPIs }>(`${this.basePath}/kpis`);
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit = 10): Promise<{ data: RecentActivity[] }> {
    return getClient().get<{ data: RecentActivity[] }>(`${this.basePath}/activity?limit=${limit}`);
  }

  /**
   * Get quick actions for current user
   */
  async getQuickActions(): Promise<{ data: QuickAction[] }> {
    return getClient().get<{ data: QuickAction[] }>(`${this.basePath}/quick-actions`);
  }

  /**
   * Get today's upcoming bookings
   */
  async getUpcomingBookings(limit = 5): Promise<{ data: UpcomingBooking[] }> {
    return getClient().get<{ data: UpcomingBooking[] }>(`${this.basePath}/upcoming?limit=${limit}`);
  }

  /**
   * Get pending items requiring attention
   */
  async getPendingItems(): Promise<{ data: { bookings: number; messages: number; approvals: number } }> {
    return getClient().get<{ data: { bookings: number; messages: number; approvals: number } }>(`${this.basePath}/pending`);
  }
}

export const dashboardService = new DashboardService();
