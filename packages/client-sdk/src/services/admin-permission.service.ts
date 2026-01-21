/**
 * Admin Permission Service
 * Handles rental object-specific permissions (different from RBAC permissions)
 * Used by backoffice PermissionManagement page
 */

import { BaseService } from './base.service';
import type { PaginatedResponse, SingleResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a permission grant/assignment for a rental object.
 * Named differently from RentalObjectPermission enum (in types/rbac.ts) to avoid confusion.
 */
export interface RentalObjectPermissionGrant {
  id: string;
  rentalObjectId: string;
  rentalObjectName: string;
  userId?: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;

  // Permission flags
  canView: boolean;
  canBook: boolean;
  canManage: boolean;
  canApproveBookings: boolean;
  canCancelBookings: boolean;
  canViewReports: boolean;
  canSetPricing: boolean;
  canManageAvailability: boolean;

  // Time-based
  validFrom?: string;
  validUntil?: string;

  // Audit
  grantedBy: string;
  grantedAt: string;
  revokedAt?: string;
}

export interface GrantPermissionDTO {
  rentalObjectId: string;
  grantTo: 'USER' | 'ORGANIZATION';
  userId?: string;
  organizationId?: string;
  permissions: {
    canView: boolean;
    canBook: boolean;
    canManage: boolean;
    canApproveBookings: boolean;
    canCancelBookings: boolean;
    canViewReports: boolean;
    canSetPricing: boolean;
    canManageAvailability: boolean;
  };
  validFrom?: string;
  validUntil?: string;
}

export interface AdminPermissionQueryParams {
  rentalObjectId?: string;
  search?: string;
  userId?: string;
  organizationId?: string;
  status?: 'active' | 'expired' | 'revoked' | 'all';
  page?: number;
  limit?: number;
}

// ============================================================================
// Service
// ============================================================================

class AdminPermissionService extends BaseService {
  constructor() {
    super('/api/admin/permissions');
  }

  /**
   * Get all rental object permissions
   */
  async getAll(params?: AdminPermissionQueryParams): Promise<PaginatedResponse<RentalObjectPermissionGrant>> {
    const queryParams = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return this.client.get<PaginatedResponse<RentalObjectPermissionGrant>>(this.buildPath(queryParams));
  }

  /**
   * Get single permission by ID
   */
  async getById(id: string): Promise<SingleResponse<RentalObjectPermissionGrant>> {
    return this.client.get<SingleResponse<RentalObjectPermissionGrant>>(this.buildPath(`/${id}`));
  }

  /**
   * Grant permission to user or organization
   */
  async grant(data: GrantPermissionDTO): Promise<SingleResponse<RentalObjectPermissionGrant>> {
    return this.client.post<SingleResponse<RentalObjectPermissionGrant>>(this.buildPath(), data);
  }

  /**
   * Revoke (delete) a permission
   */
  async revoke(id: string): Promise<void> {
    await this.client.delete(this.buildPath(`/${id}`));
  }

  /**
   * Update an existing permission
   */
  async update(id: string, data: Partial<GrantPermissionDTO>): Promise<SingleResponse<RentalObjectPermissionGrant>> {
    return this.client.patch<SingleResponse<RentalObjectPermissionGrant>>(this.buildPath(`/${id}`), data);
  }

  /**
   * Get permissions for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string): Promise<PaginatedResponse<RentalObjectPermissionGrant>> {
    return this.getAll({ rentalObjectId });
  }

  /**
   * Get permissions for a specific user
   */
  async getByUser(userId: string): Promise<PaginatedResponse<RentalObjectPermissionGrant>> {
    return this.getAll({ userId });
  }

  /**
   * Get permissions for a specific organization
   */
  async getByOrganization(organizationId: string): Promise<PaginatedResponse<RentalObjectPermissionGrant>> {
    return this.getAll({ organizationId });
  }
}

export const adminPermissionService = new AdminPermissionService();
