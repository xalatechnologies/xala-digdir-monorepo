/**
 * Reports Service
 * Analytics, reports, and data export
 */
import { getClient } from '../core/client-factory';
import type {
  ReportQueryParams,
  BookingReport,
  UsageReport,
  RevenueReport,
  ExportFormat,
} from '../types';

export interface DashboardStats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    currency: string;
    growth: number;
  };
  listings: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  utilization: {
    percentage: number;
    totalHours: number;
    bookedHours: number;
  };
}

class ReportsService {
  private basePath = '/api/reports';

  /**
   * Get dashboard statistics
   * API returns data directly (no wrapper)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return getClient().get<DashboardStats>(`${this.basePath}/dashboard`);
  }

  /**
   * Get booking report
   */
  async getBookingReport(params: ReportQueryParams): Promise<BookingReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<BookingReport>(`${this.basePath}/bookings?${queryParams.toString()}`);
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(params: ReportQueryParams): Promise<RevenueReport[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<RevenueReport[]>(`${this.basePath}/revenue?${queryParams.toString()}`);
  }

  /**
   * Get utilization report
   */
  async getUtilizationReport(params: ReportQueryParams): Promise<UsageReport[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<UsageReport[]>(`${this.basePath}/utilization?${queryParams.toString()}`);
  }

  /**
   * Get occupancy report
   */
  async getOccupancyReport(params: ReportQueryParams): Promise<{ period: string; occupancyRate: number; bookings: number }[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<{ period: string; occupancyRate: number; bookings: number }[]>(`${this.basePath}/occupancy?${queryParams.toString()}`);
  }

  /**
   * Export report data
   */
  async export(reportType: string, params: ReportQueryParams, format: ExportFormat = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    queryParams.set('format', format);
    
    const response = await fetch(`${this.basePath}/export/${reportType}?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.blob();
  }
}

export const reportsService = new ReportsService();
