/**
 * GDPR Service
 * Client SDK service for GDPR consent management
 */

import { BaseService } from './base.service';
import type {
  ConsentType,
  ConsentSummary,
  UserConsentStatus,
  GrantConsentDTO,
  GrantMultipleConsentsDTO,
  ConsentAuditLogEntry,
  DataSubjectRequest,
  CreateDataSubjectRequestDTO,
  ConsentTypesResponse,
  ConsentSummaryResponse,
  ConsentStatusResponse,
  ConsentStatusCheckResponse,
  ConsentAuditLogResponse,
  DataSubjectRequestResponse,
  DataSubjectRequestsResponse,
} from '../types/gdpr';

export class GdprService extends BaseService {
  constructor() {
    super('/api/gdpr');
  }

  // ==========================================================================
  // Consent Types
  // ==========================================================================

  /**
   * Get all active consent types
   */
  async getConsentTypes(locale = 'nb'): Promise<ConsentType[]> {
    const response = await this.client.get<ConsentTypesResponse>(
      this.buildPath(`/consent-types?locale=${locale}`)
    );
    return response.data;
  }

  // ==========================================================================
  // User Consents
  // ==========================================================================

  /**
   * Get current user's consent summary
   */
  async getMyConsents(locale = 'nb'): Promise<ConsentSummary> {
    const response = await this.client.get<ConsentSummaryResponse>(
      this.buildPath(`/my-consents?locale=${locale}`)
    );
    return response.data;
  }

  /**
   * Grant or revoke a single consent
   */
  async grantConsent(dto: GrantConsentDTO): Promise<UserConsentStatus> {
    const response = await this.client.post<ConsentStatusResponse>(
      this.buildPath('/consent'),
      dto
    );
    return response.data;
  }

  /**
   * Grant or revoke multiple consents at once
   */
  async grantMultipleConsents(dto: GrantMultipleConsentsDTO): Promise<UserConsentStatus[]> {
    const response = await this.client.post<{ data: UserConsentStatus[] }>(
      this.buildPath('/consents'),
      dto
    );
    return response.data;
  }

  /**
   * Check if user has granted all required consents
   */
  async checkConsentStatus(): Promise<boolean> {
    const response = await this.client.get<ConsentStatusCheckResponse>(
      this.buildPath('/consent-status')
    );
    return response.data.hasAllRequired;
  }

  /**
   * Get consent audit log for current user
   */
  async getAuditLog(limit = 50): Promise<ConsentAuditLogEntry[]> {
    const response = await this.client.get<ConsentAuditLogResponse>(
      this.buildPath(`/audit-log?limit=${limit}`)
    );
    return response.data;
  }

  // ==========================================================================
  // Data Subject Requests
  // ==========================================================================

  /**
   * Submit a data subject request (access, erasure, etc.)
   */
  async createDataSubjectRequest(dto: CreateDataSubjectRequestDTO): Promise<DataSubjectRequest> {
    const response = await this.client.post<DataSubjectRequestResponse>(
      this.buildPath('/data-request'),
      dto
    );
    return response.data;
  }

  /**
   * Get all data subject requests for current user
   */
  async getMyDataRequests(): Promise<DataSubjectRequest[]> {
    const response = await this.client.get<DataSubjectRequestsResponse>(
      this.buildPath('/my-data-requests')
    );
    return response.data;
  }

  // ==========================================================================
  // Admin methods
  // ==========================================================================

  /**
   * Get all pending data subject requests (admin only)
   */
  async getPendingRequests(): Promise<DataSubjectRequest[]> {
    const response = await this.client.get<DataSubjectRequestsResponse>(
      this.buildPath('/admin/pending-requests')
    );
    return response.data;
  }

  /**
   * Update data subject request status (admin only)
   */
  async updateRequestStatus(
    id: string,
    status: 'processing' | 'completed' | 'rejected',
    responseNotes?: string
  ): Promise<DataSubjectRequest> {
    const response = await this.client.patch<DataSubjectRequestResponse>(
      this.buildPath(`/admin/requests/${id}/status`),
      { status, responseNotes }
    );
    return response.data;
  }
}

// Export singleton instance
export const gdprService = new GdprService();
