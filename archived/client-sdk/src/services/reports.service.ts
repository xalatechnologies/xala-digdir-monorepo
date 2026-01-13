/**
 * Reports Service
 * Handles reporting and analytics operations
 */

import { BaseService } from './base.service';
import type {
  DashboardKPIs,
  UsageReport,
  RevenueReport,
  ReportQueryParams,
  ExportFormat,
  BookingStats
} from '../types';

class ReportsService extends BaseService {
  async getDashboardKPIs(): Promise<{ data: DashboardKPIs }> {
    return this.client.get(this.buildPath('/dashboard'));
  }

  async getUsageReport(params?: ReportQueryParams): Promise<{ data: UsageReport }> {
    return this.client.get(this.buildPath('/usage'), { params });
  }

  async getRevenueReport(params?: ReportQueryParams): Promise<{ data: RevenueReport }> {
    return this.client.get(this.buildPath('/revenue'), { params });
  }

  async getBookingStats(params?: ReportQueryParams): Promise<{ data: BookingStats }> {
    return this.client.get(this.buildPath('/booking-stats'), { params });
  }

  async exportReport(
    type: 'usage' | 'revenue' | 'bookings',
    format: ExportFormat,
    params?: ReportQueryParams
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(this.buildPath(`/export/${type}`), {
      params: { ...params, format },
    });
    return response as unknown as Blob;
  }
}

export const reportsService = new ReportsService('/reports');
