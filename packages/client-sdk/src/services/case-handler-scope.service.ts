/**
 * Case Handler Scope Service
 * Handles custody/case handler scope assignment and management
 */

import { BaseService } from './base.service';
import type {
  CaseHandlerScope,
  CreateCaseHandlerScopeDTO,
  UpdateCaseHandlerScopeDTO,
  CaseHandlerScopeQueryParams,
  PaginatedResponse,
  SingleResponse,
} from '../types';

export class CaseHandlerScopeService extends BaseService {
  constructor() {
    super('/api/case-handler-scope');
  }

  /**
   * Get all case handler scopes
   */
  async getAll(params?: CaseHandlerScopeQueryParams): Promise<PaginatedResponse<CaseHandlerScope>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single case handler scope by ID
   */
  async getById(id: string): Promise<SingleResponse<CaseHandlerScope>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get scopes for a specific case handler
   */
  async getForCaseHandler(userId: string): Promise<PaginatedResponse<CaseHandlerScope>> {
    return this.client.get(this.buildPath(`/user/${userId}`));
  }

  /**
   * Get scopes for a specific rental object
   */
  async getForRentalObject(rentalObjectId: string): Promise<PaginatedResponse<CaseHandlerScope>> {
    return this.client.get(this.buildPath(`/rental-object/${rentalObjectId}`));
  }

  /**
   * Create case handler scope
   */
  async create(data: CreateCaseHandlerScopeDTO): Promise<SingleResponse<CaseHandlerScope>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Update case handler scope
   */
  async update(id: string, data: UpdateCaseHandlerScopeDTO): Promise<SingleResponse<CaseHandlerScope>> {
    return this.client.put(this.buildPath(`/${id}`), data);
  }

  /**
   * Delete case handler scope
   */
  async delete(id: string): Promise<void> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Bulk assign scopes to case handler
   */
  async bulkAssign(userId: string, rentalObjectIds: string[]): Promise<SingleResponse<{
    assigned: number;
    failed: string[];
  }>> {
    return this.client.post(this.buildPath('/bulk'), { userId, rentalObjectIds });
  }

  /**
   * Revoke all scopes for case handler
   */
  async revokeAll(userId: string): Promise<SingleResponse<void>> {
    return this.client.post(this.buildPath(`/user/${userId}/revoke-all`), {});
  }

  /**
   * Check if case handler has access to rental object
   */
  async checkAccess(userId: string, rentalObjectId: string): Promise<SingleResponse<{
    hasAccess: boolean;
    scope: CaseHandlerScope | null;
  }>> {
    return this.client.post(this.buildPath('/check-access'), { userId, rentalObjectId });
  }

  /**
   * Get custody audit log
   */
  async getAuditLog(userId: string): Promise<PaginatedResponse<{
    action: 'granted' | 'revoked';
    rentalObjectId: string;
    rentalObjectName: string;
    grantedBy: string;
    timestamp: string;
  }>> {
    return this.client.get(this.buildPath(`/user/${userId}/audit`));
  }

  /**
   * Transfer scopes from one case handler to another
   */
  async transferScopes(fromUserId: string, toUserId: string): Promise<SingleResponse<{
    transferred: number;
  }>> {
    return this.client.post(this.buildPath('/transfer'), { fromUserId, toUserId });
  }
}

export const caseHandlerScopeService = new CaseHandlerScopeService();
