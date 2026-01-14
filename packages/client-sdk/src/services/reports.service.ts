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
  TimeSlotHeatmap,
  SeasonalPattern,
  PeriodComparison,
  ReportGenerationResult,
  ReportHistoryItem,
  ReportHistoryQueryParams,
  PaginatedResponse,
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
   * Get heatmap data
   */
  async getHeatmapData(params: ReportQueryParams): Promise<TimeSlotHeatmap[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<TimeSlotHeatmap[]>(`${this.basePath}/heatmap?${queryParams.toString()}`);
  }

  /**
   * Get seasonal patterns
   */
  async getSeasonalPatterns(params: ReportQueryParams): Promise<SeasonalPattern[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<SeasonalPattern[]>(`${this.basePath}/seasonal?${queryParams.toString()}`);
  }

  /**
   * Get period comparison data
   */
  async getComparisonData(params: ReportQueryParams): Promise<PeriodComparison> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    return getClient().get<PeriodComparison>(`${this.basePath}/comparison?${queryParams.toString()}`);
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

  /**
   * Generate report asynchronously (for large reports)
   * Returns a job ID to track progress
   */
  async generateAsync(
    reportType: string,
    params: ReportQueryParams,
    format: ExportFormat = 'csv'
  ): Promise<ReportGenerationResult> {
    return getClient().post<ReportGenerationResult>(`${this.basePath}/generate`, {
      reportType,
      exportFormat: format,
      parameters: params,
    });
  }

  /**
   * Get status of async report generation job
   */
  async getJobStatus(jobId: string): Promise<ReportGenerationResult> {
    return getClient().get<ReportGenerationResult>(`${this.basePath}/jobs/${jobId}`);
  }

  /**
   * Download completed report from async job
   */
  async downloadReport(jobId: string): Promise<Blob> {
    const response = await fetch(`${this.basePath}/jobs/${jobId}/download`, {
      method: 'GET',
    });
    return response.blob();
  }

  /**
   * Get report generation history
   */
  async getHistory(params?: ReportHistoryQueryParams): Promise<PaginatedResponse<ReportHistoryItem>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.set(key, String(value));
      });
    }

    const queryString = queryParams.toString();
    return getClient().get<PaginatedResponse<ReportHistoryItem>>(
      queryString ? `${this.basePath}/history?${queryString}` : `${this.basePath}/history`
    );
  }
}

export const reportsService = new ReportsService();
