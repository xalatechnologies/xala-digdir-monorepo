/**
 * GDPR Service
 * Single Responsibility: Handle GDPR data subject rights requests
 */

import { BaseService } from './base.service';
import type {
  GdprRequest,
  CreateGdprRequestDTO,
  GdprRequestQueryParams,
  GdprDataExport,
  ConsentSettings,
  UpdateConsentDTO,
} from '@/types/gdpr';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '@/types/enums';

export class GdprService extends BaseService {
  constructor() {
    super('/api/gdpr');
  }

  /**
   * Create a new GDPR request (export or deletion)
   */
  async createRequest(data: CreateGdprRequestDTO): Promise<SingleResponse<GdprRequest>> {
    return this.client.post(this.buildPath('/requests'), data);
  }

  /**
   * Get current user's GDPR requests
   */
  async getMyRequests(params?: GdprRequestQueryParams): Promise<PaginatedResponse<GdprRequest>> {
    return this.client.get(this.buildPath('/requests'), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single GDPR request by ID
   */
  async getById(id: string): Promise<SingleResponse<GdprRequest>> {
    return this.client.get(this.buildPath(`/requests/${id}`));
  }

  /**
   * Cancel a pending GDPR request
   */
  async cancelRequest(id: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/requests/${id}/cancel`));
  }

  /**
   * Get pending GDPR requests (admin only)
   */
  async getPendingRequests(params?: GdprRequestQueryParams): Promise<PaginatedResponse<GdprRequest>> {
    return this.client.get(this.buildPath('/requests/pending'), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Update GDPR request status (admin only)
   */
  async updateRequestStatus(id: string, status: 'processing' | 'completed' | 'rejected', rejectionReason?: string): Promise<SuccessResponse> {
    return this.client.put(this.buildPath(`/requests/${id}/status`), { status, rejectionReason });
  }

  /**
   * Export user data (GDPR data export)
   */
  async exportData(): Promise<SingleResponse<GdprDataExport>> {
    return this.client.get(this.buildPath('/export'));
  }

  /**
   * Get consent settings
   */
  async getConsents(): Promise<SingleResponse<ConsentSettings>> {
    return this.client.get(this.buildPath('/consents'));
  }

  /**
   * Update consent settings
   */
  async updateConsents(data: UpdateConsentDTO): Promise<SingleResponse<ConsentSettings>> {
    return this.client.put(this.buildPath('/consents'), data);
  }
}

// Export singleton instance
export const gdprService = new GdprService();
