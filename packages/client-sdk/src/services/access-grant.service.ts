/**
 * Access Grant Service
 * Single Responsibility: Handle access grant operations for RBAC
 *
 * Access grants delegate rental object access from commune (tenant) to organizations.
 * Only Commune Admins can create/revoke access grants.
 */

import { BaseService } from './base.service';
import type {
  AccessGrant,
  AccessGrantWithDetails,
  CreateAccessGrantDTO,
  UpdateAccessGrantDTO,
  BulkAccessGrantDTO,
  AccessGrantQueryParams,
  RevokeAccessRequest,
} from '../types/rbac';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

export class AccessGrantService extends BaseService {
  constructor() {
    super('/api/access-grants');
  }

  /**
   * Get paginated access grants
   * Commune Admin: sees all grants for tenant
   * Org Admin: sees grants for their organization
   */
  async getAll(params?: AccessGrantQueryParams): Promise<PaginatedResponse<AccessGrantWithDetails>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean> });
  }

  /**
   * Get single access grant by ID
   */
  async getById(id: string): Promise<SingleResponse<AccessGrantWithDetails>> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  /**
   * Get access grants for a specific organization
   */
  async getByOrganization(organizationId: string, params?: AccessGrantQueryParams): Promise<PaginatedResponse<AccessGrantWithDetails>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, organizationId } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get access grants for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string, params?: AccessGrantQueryParams): Promise<PaginatedResponse<AccessGrantWithDetails>> {
    return this.client.get(this.buildPath(), {
      params: { ...params, rentalObjectId } as Record<string, string | number | boolean>,
    });
  }

  /**
   * Create new access grant (Commune Admin only)
   * Grants an organization access to a rental object
   */
  async create(data: CreateAccessGrantDTO): Promise<SingleResponse<AccessGrant>> {
    return this.client.post(this.buildPath(), data);
  }

  /**
   * Create multiple access grants at once (Commune Admin only)
   * Grants an organization access to multiple rental objects
   */
  async createBulk(data: BulkAccessGrantDTO): Promise<SingleResponse<AccessGrant[]>> {
    return this.client.post(this.buildPath('/bulk'), data);
  }

  /**
   * Update access grant (Commune Admin only)
   * Update expiration or notes
   */
  async update(id: string, data: UpdateAccessGrantDTO): Promise<SingleResponse<AccessGrant>> {
    return this.client.patch(this.buildPath(`/${id}`), data);
  }

  /**
   * Revoke access grant (Commune Admin only)
   * Soft-deletes the grant, preserving audit trail
   */
  async revoke(id: string, data?: RevokeAccessRequest): Promise<SuccessResponse> {
    return this.client.post(this.buildPath(`/${id}/revoke`), data || {});
  }

  /**
   * Delete access grant permanently (Commune Admin only)
   * Use with caution - prefer revoke for audit trail
   */
  async deleteById(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Check if an organization has access to a rental object
   */
  async checkAccess(organizationId: string, rentalObjectId: string): Promise<SingleResponse<{ hasAccess: boolean; grant?: AccessGrant }>> {
    return this.client.get(this.buildPath('/check'), {
      params: { organizationId, rentalObjectId },
    });
  }

  /**
   * Get accessible rental objects for an organization
   * Returns all rental objects the org has been granted access to
   */
  async getAccessibleRentalObjects(organizationId: string): Promise<SingleResponse<{ rentalObjectId: string; rentalObjectName: string; grantedAt: string }[]>> {
    return this.client.get(this.buildPath(`/organizations/${organizationId}/rental-objects`));
  }

  /**
   * Get organizations with access to a rental object
   * Returns all orgs that have been granted access to the rental object
   */
  async getGrantedOrganizations(rentalObjectId: string): Promise<SingleResponse<{ organizationId: string; organizationName: string; grantedAt: string }[]>> {
    return this.client.get(this.buildPath(`/rental-objects/${rentalObjectId}/organizations`));
  }
}

// Singleton instance
export const accessGrantService = new AccessGrantService();
