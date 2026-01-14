/**
 * Report Templates Service
 * Single Responsibility: Handle all report template CRUD operations
 */

import { BaseService } from './base.service';
import type {
  ReportTemplate,
  CreateReportTemplateDTO,
  UpdateReportTemplateDTO,
} from '../types';
import type { PaginatedResponse, SingleResponse, SuccessResponse, BaseQueryParams } from '../types/enums';

export interface ReportTemplateQueryParams extends BaseQueryParams {
  reportType?: string;
  isSystem?: boolean;
  createdBy?: string;
}

export class ReportTemplatesService extends BaseService {
  constructor() {
    super('/api/report-templates');
  }

  /**
   * Get paginated report templates
   */
  async getAll(params?: ReportTemplateQueryParams): Promise<PaginatedResponse<ReportTemplate>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single report template by ID
   */
  async getById(id: string): Promise<SingleResponse<ReportTemplate>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Create new report template
   */
  async create(data: CreateReportTemplateDTO): Promise<SingleResponse<ReportTemplate>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update existing report template
   */
  async update(id: string, data: UpdateReportTemplateDTO): Promise<SingleResponse<ReportTemplate>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete report template
   */
  async delete(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Get system report templates (pre-built templates)
   */
  async getSystemTemplates(): Promise<PaginatedResponse<ReportTemplate>> {
    return this.client.get(this.buildPath('/system'));
  }

  /**
   * Duplicate existing report template
   */
  async duplicate(id: string, name?: string): Promise<SingleResponse<ReportTemplate>> {
    return this.client.post(this.buildPath(`/${id}/duplicate`), { name });
  }
}

export const reportTemplatesService = new ReportTemplatesService();
