/**
 * Audit Service
 * Single Responsibility: Handle all audit-related API operations
 */

import { BaseService } from './base.service';
import type { AuditEvent, AuditQueryParams } from '../types/additional';
import type { PaginatedResponse, SingleResponse } from '../types/enums';

export class AuditService extends BaseService {
  constructor() {
    super('/api/audit');
  }

  /**
   * Get paginated audit events
   */
  async getAll(params?: AuditQueryParams): Promise<PaginatedResponse<AuditEvent>> {
    return this.client.get(this.buildPath(), {
      params: params as Record<string, string | number | boolean>
    });
  }

  /**
   * Get single audit event by ID
   */
  async getById(id: string): Promise<SingleResponse<AuditEvent>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get audit events for a specific resource
   */
  async getByResource(
    resource: string,
    resourceId: string,
    params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.client.get(this.buildPath(), {
      params: {
        resource,
        resourceId,
        ...params,
      } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get audit events for a listing
   */
  async getListingAudit(
    listingId: string,
    params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.getByResource('listing', listingId, params);
  }

  /**
   * Get audit events for a booking
   */
  async getBookingAudit(
    bookingId: string,
    params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.getByResource('booking', bookingId, params);
  }

  /**
   * Get audit events for an organization
   */
  async getOrganizationAudit(
    organizationId: string,
    params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.getByResource('organization', organizationId, params);
  }

  /**
   * Get audit events for a user
   */
  async getUserAudit(
    userId: string,
    params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.getByResource('user', userId, params);
  }

  /**
   * Get audit events by user who performed the action
   */
  async getByActor(
    actorUserId: string,
    params?: Omit<AuditQueryParams, 'userId'>
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.client.get(this.buildPath(), {
      params: {
        userId: actorUserId,
        ...params,
      } as Record<string, string | number | boolean>,
    });
  }
}

// Singleton instance
export const auditService = new AuditService();
