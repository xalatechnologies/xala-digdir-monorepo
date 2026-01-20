/**
 * Reports Service
 * Analytics, reports, and data export
 */
import { getClient } from '@/core/client-factory';
import type {
  ReportQueryParams,
  BookingReport,
  UsageReport,
  RevenueReport,
  ExportFormat,
  TimeSlotHeatmap,
  SeasonalPattern,
  PeriodComparison,
} from '@/types';

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
   * Get comprehensive dashboard statistics including bookings, revenue, listings, users, and utilization
   * API returns data directly (no wrapper)
   *
   * @returns Promise containing complete dashboard statistics across all categories
   *
   * @example
   * ```typescript
   * // Get comprehensive dashboard stats
   * const stats = await reportsService.getDashboardStats();
   * console.log(`Total bookings: ${stats.bookings.total}`);
   * console.log(`Revenue: ${stats.revenue.total} ${stats.revenue.currency}`);
   * console.log(`Utilization: ${stats.utilization.percentage}%`);
   * ```
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return getClient().get<DashboardStats>(`${this.basePath}/dashboard`);
  }

  /**
   * Get booking report with filtering by date range, listing, status, etc.
   *
   * @param params - Query parameters for filtering (startDate, endDate, listingId, status, etc.)
   * @returns Promise containing booking report data
   *
   * @example
   * ```typescript
   * // Get booking report for a specific date range
   * const report = await reportsService.getBookingReport({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   listingId: 'listing-123'
   * });
   * ```
   */
  async getBookingReport(params: ReportQueryParams): Promise<BookingReport> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<BookingReport>(`${this.basePath}/bookings?${queryParams.toString()}`);
  }

  /**
   * Get revenue report showing income trends over time
   *
   * @param params - Query parameters for filtering (startDate, endDate, groupBy, etc.)
   * @returns Promise containing array of revenue data points
   *
   * @example
   * ```typescript
   * // Get monthly revenue for the year
   * const revenue = await reportsService.getRevenueReport({
   *   startDate: '2024-01-01',
   *   endDate: '2024-12-31',
   *   groupBy: 'month'
   * });
   * ```
   */
  async getRevenueReport(params: ReportQueryParams): Promise<RevenueReport[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<RevenueReport[]>(`${this.basePath}/revenue?${queryParams.toString()}`);
  }

  /**
   * Get utilization report showing how resources are being used over time
   *
   * @param params - Query parameters for filtering (startDate, endDate, listingId, etc.)
   * @returns Promise containing array of usage data points
   *
   * @example
   * ```typescript
   * // Get utilization for specific listing
   * const usage = await reportsService.getUtilizationReport({
   *   listingId: 'listing-123',
   *   startDate: '2024-01-01',
   *   endDate: '2024-03-31'
   * });
   * ```
   */
  async getUtilizationReport(params: ReportQueryParams): Promise<UsageReport[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<UsageReport[]>(`${this.basePath}/utilization?${queryParams.toString()}`);
  }

  /**
   * Get occupancy report showing booking rates by period
   *
   * @param params - Query parameters for filtering (startDate, endDate, groupBy, etc.)
   * @returns Promise containing array of occupancy data with period, rate, and booking count
   *
   * @example
   * ```typescript
   * // Get weekly occupancy rates
   * const occupancy = await reportsService.getOccupancyReport({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   groupBy: 'week'
   * });
   * occupancy.forEach(data => {
   *   console.log(`${data.period}: ${data.occupancyRate}% (${data.bookings} bookings)`);
   * });
   * ```
   */
  async getOccupancyReport(params: ReportQueryParams): Promise<{ period: string; occupancyRate: number; bookings: number }[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<{ period: string; occupancyRate: number; bookings: number }[]>(`${this.basePath}/occupancy?${queryParams.toString()}`);
  }

  /**
   * Get heatmap data showing booking patterns by time slots
   *
   * @param params - Query parameters for filtering (startDate, endDate, listingId, etc.)
   * @returns Promise containing array of time slot heatmap data
   *
   * @example
   * ```typescript
   * // Get heatmap for busy hours analysis
   * const heatmap = await reportsService.getHeatmapData({
   *   listingId: 'listing-123',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31'
   * });
   * ```
   */
  async getHeatmapData(params: ReportQueryParams): Promise<TimeSlotHeatmap[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<TimeSlotHeatmap[]>(`${this.basePath}/heatmap?${queryParams.toString()}`);
  }

  /**
   * Get seasonal patterns showing booking trends across seasons and months
   *
   * @param params - Query parameters for filtering (startDate, endDate, etc.)
   * @returns Promise containing array of seasonal pattern data
   *
   * @example
   * ```typescript
   * // Analyze seasonal trends
   * const patterns = await reportsService.getSeasonalPatterns({
   *   startDate: '2023-01-01',
   *   endDate: '2024-12-31'
   * });
   * ```
   */
  async getSeasonalPatterns(params: ReportQueryParams): Promise<SeasonalPattern[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<SeasonalPattern[]>(`${this.basePath}/seasonal?${queryParams.toString()}`);
  }

  /**
   * Get period comparison data to compare metrics between two time periods
   *
   * @param params - Query parameters including date ranges for comparison
   * @returns Promise containing comparison data between periods
   *
   * @example
   * ```typescript
   * // Compare this month vs last month
   * const comparison = await reportsService.getComparisonData({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   compareStartDate: '2023-12-01',
   *   compareEndDate: '2023-12-31'
   * });
   * ```
   */
  async getComparisonData(params: ReportQueryParams): Promise<PeriodComparison> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<PeriodComparison>(`${this.basePath}/comparison?${queryParams.toString()}`);
  }

  /**
   * Export report data to file (CSV, Excel, PDF, etc.)
   *
   * @param reportType - Type of report to export (bookings, revenue, utilization, etc.)
   * @param params - Query parameters for filtering the report data
   * @param format - Export format (csv, xlsx, pdf) - defaults to 'csv'
   * @returns Promise containing Blob of exported file
   *
   * @example
   * ```typescript
   * // Export booking report as Excel
   * const blob = await reportsService.export('bookings', {
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31'
   * }, 'xlsx');
   *
   * // Download the file
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'bookings-report.xlsx';
   * a.click();
   * ```
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
