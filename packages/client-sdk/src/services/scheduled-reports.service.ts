/**
 * Scheduled Reports Service
 * Single Responsibility: Handle all scheduled report operations
 */

import { BaseService } from './base.service';
import type {
  ScheduledReport,
  CreateScheduledReportDTO,
  UpdateScheduledReportDTO,
  ScheduledReportQueryParams,
} from '../types/additional';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class ScheduledReportsService extends BaseService {
  constructor() {
    super('/api/reports/schedules');
  }

  /**
   * Get paginated scheduled reports
   */
  async getAll(params?: ScheduledReportQueryParams): Promise<PaginatedResponse<ScheduledReport>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single scheduled report by ID
   */
  async getById(id: string): Promise<SingleResponse<ScheduledReport>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new scheduled report
   */
  async create(data: CreateScheduledReportDTO): Promise<SingleResponse<ScheduledReport>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing scheduled report
   */
  async update(id: string, data: UpdateScheduledReportDTO): Promise<SingleResponse<ScheduledReport>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete scheduled report
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Pause scheduled report (set isActive to false)
   */
  async pause(id: string): Promise<SingleResponse<ScheduledReport>> {
    return this.client.put(this.buildPath(`/${id}/pause`));
  }

  /**
   * Resume scheduled report (set isActive to true)
   */
  async resume(id: string): Promise<SingleResponse<ScheduledReport>> {
    return this.client.put(this.buildPath(`/${id}/resume`));
  }

  /**
   * Trigger manual run of scheduled report
   */
  async triggerRun(id: string): Promise<SingleResponse<{ jobId: string }>> {
    return this.client.post(this.buildPath(`/${id}/run`));
  }

  /**
   * Get active scheduled reports
   */
  async getActive(): Promise<PaginatedResponse<ScheduledReport>> {
    return this.getAll({ isActive: true });
  }

  /**
   * Get scheduled reports by report type
   */
  async getByReportType(reportType: string): Promise<PaginatedResponse<ScheduledReport>> {
    return this.getAll({ reportType: reportType as any });
  }
}

// Export singleton instance for convenience
export const scheduledReportsService = new ScheduledReportsService();
