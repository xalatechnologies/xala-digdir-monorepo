/**
 * Scope Assignment Service
 * Manages scope delegation for case handlers and organization members
 *
 * Scopes control which rental objects a user can access and manage.
 * Tenant admins can assign scopes to delegate responsibilities.
 */
import { BaseService } from './base.service';
import type { PaginatedResponse, SingleResponse } from '@/types/enums';

// =============================================================================
// Types
// =============================================================================

/**
 * Scope types
 */
export type ScopeType =
  | 'all' // Access to all rental objects
  | 'organization' // Access to all rental objects in assigned organization(s)
  | 'specific' // Access to specific rental objects only
  | 'category' // Access to rental objects in specific categories
  | 'none'; // No access (default)

/**
 * Scope assignment status
 */
export type ScopeStatus = 'active' | 'suspended' | 'expired';

/**
 * Case handler scope
 */
export interface CaseHandlerScope {
  id: string;
  tenantId: string;
  userId: string;
  scopeType: ScopeType;
  rentalObjectId?: string | null;
  organizationId?: string | null;
  categoryKeys?: string[];
  assignedBy?: string | null;
  status: ScopeStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create scope assignment DTO
 */
export interface CreateScopeAssignmentDTO {
  userId: string;
  scopeType: ScopeType;
  rentalObjectId?: string;
  organizationId?: string;
  categoryKeys?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Update scope assignment DTO
 */
export interface UpdateScopeAssignmentDTO {
  scopeType?: ScopeType;
  rentalObjectId?: string | null;
  organizationId?: string | null;
  categoryKeys?: string[];
  status?: ScopeStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Assign scopes to user DTO (bulk operation)
 */
export interface AssignScopesDTO {
  userId: string;
  scopes: Array<{
    scopeType: ScopeType;
    rentalObjectId?: string;
    organizationId?: string;
    categoryKeys?: string[];
  }>;
}

/**
 * Scope query parameters
 */
export interface ScopeQueryParams {
  userId?: string;
  scopeType?: ScopeType;
  status?: ScopeStatus;
  organizationId?: string;
  page?: number;
  limit?: number;
}

/**
 * Effective scope result (computed access)
 */
export interface EffectiveScope {
  userId: string;
  hasGlobalAccess: boolean;
  organizationIds: string[];
  rentalObjectIds: string[];
  categoryKeys: string[];
  computedAt: string;
}

/**
 * Scope delegation tree node
 */
export interface ScopeDelegationNode {
  userId: string;
  userName: string;
  role: string;
  scopes: CaseHandlerScope[];
  children: ScopeDelegationNode[];
}

// =============================================================================
// Service
// =============================================================================

export class ScopeAssignmentService extends BaseService {
  constructor() {
    super('/api/admin/scopes');
  }

  /**
   * Get all scope assignments (tenant-scoped, paginated)
   */
  async getAll(params?: ScopeQueryParams): Promise<PaginatedResponse<CaseHandlerScope>> {
    return this.get<PaginatedResponse<CaseHandlerScope>>('', { params });
  }

  /**
   * Get scope assignment by ID
   */
  async getById(scopeId: string): Promise<SingleResponse<CaseHandlerScope>> {
    return this.get<SingleResponse<CaseHandlerScope>>(`/${scopeId}`);
  }

  /**
   * Get all scopes for a specific user
   */
  async getUserScopes(userId: string): Promise<PaginatedResponse<CaseHandlerScope>> {
    return this.get<PaginatedResponse<CaseHandlerScope>>(`/users/${userId}`);
  }

  /**
   * Get effective scope for a user (computed access)
   */
  async getEffectiveScope(userId: string): Promise<SingleResponse<EffectiveScope>> {
    return this.get<SingleResponse<EffectiveScope>>(`/users/${userId}/effective`);
  }

  /**
   * Create a new scope assignment
   */
  async create(data: CreateScopeAssignmentDTO): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>('', data);
  }

  /**
   * Update an existing scope assignment
   */
  async update(
    scopeId: string,
    data: UpdateScopeAssignmentDTO
  ): Promise<SingleResponse<CaseHandlerScope>> {
    return this.put<SingleResponse<CaseHandlerScope>>(`/${scopeId}`, data);
  }

  /**
   * Delete a scope assignment
   */
  async deleteScope(scopeId: string): Promise<SingleResponse<{ success: boolean }>> {
    await super.delete(`/${scopeId}`);
    return { data: { success: true } };
  }

  /**
   * Assign multiple scopes to a user (replaces existing scopes)
   */
  async assignScopes(data: AssignScopesDTO): Promise<SingleResponse<CaseHandlerScope[]>> {
    return this.post<SingleResponse<CaseHandlerScope[]>>('/assign', data);
  }

  /**
   * Add a specific rental object to user's scope
   */
  async addRentalObject(
    userId: string,
    rentalObjectId: string
  ): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/users/${userId}/rental-objects`, {
      rentalObjectId,
    });
  }

  /**
   * Remove a specific rental object from user's scope
   */
  async removeRentalObject(
    userId: string,
    rentalObjectId: string
  ): Promise<SingleResponse<{ success: boolean }>> {
    await super.delete(`/users/${userId}/rental-objects/${rentalObjectId}`);
    return { data: { success: true } };
  }

  /**
   * Set user scope to organization-level (access all objects in org)
   */
  async setOrganizationScope(
    userId: string,
    organizationId: string
  ): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/users/${userId}/organization`, {
      organizationId,
    });
  }

  /**
   * Set user scope to category-level
   */
  async setCategoryScope(
    userId: string,
    categoryKeys: string[]
  ): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/users/${userId}/categories`, {
      categoryKeys,
    });
  }

  /**
   * Set user scope to global (access all rental objects)
   */
  async setGlobalScope(userId: string): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/users/${userId}/global`, {});
  }

  /**
   * Clear all scopes for a user
   */
  async clearAllScopes(userId: string): Promise<SingleResponse<{ success: boolean }>> {
    await super.delete(`/users/${userId}`);
    return { data: { success: true } };
  }

  /**
   * Suspend scope temporarily
   */
  async suspend(scopeId: string, reason?: string): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/${scopeId}/suspend`, { reason });
  }

  /**
   * Reactivate suspended scope
   */
  async reactivate(scopeId: string): Promise<SingleResponse<CaseHandlerScope>> {
    return this.post<SingleResponse<CaseHandlerScope>>(`/${scopeId}/reactivate`, {});
  }

  /**
   * Get scope delegation tree (hierarchical view)
   */
  async getDelegationTree(organizationId?: string): Promise<SingleResponse<ScopeDelegationNode>> {
    const params = organizationId ? { organizationId } : undefined;
    return this.get<SingleResponse<ScopeDelegationNode>>('/delegation-tree', { params });
  }

  /**
   * Validate if user has access to a rental object
   */
  async validateAccess(
    userId: string,
    rentalObjectId: string
  ): Promise<SingleResponse<{ hasAccess: boolean; reason?: string }>> {
    return this.post<SingleResponse<{ hasAccess: boolean; reason?: string }>>(
      '/validate-access',
      { userId, rentalObjectId }
    );
  }

  /**
   * Bulk assign scopes to multiple users
   */
  async bulkAssign(
    userIds: string[],
    scopeData: Omit<CreateScopeAssignmentDTO, 'userId'>
  ): Promise<
    SingleResponse<{
      successful: number;
      failed: number;
      results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
    }>
  > {
    return this.post<
      SingleResponse<{
        successful: number;
        failed: number;
        results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
      }>
    >('/bulk/assign', { userIds, scopeData });
  }

  /**
   * Bulk remove scopes from multiple users
   */
  async bulkRemove(
    userIds: string[]
  ): Promise<
    SingleResponse<{
      successful: number;
      failed: number;
      results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
    }>
  > {
    return this.post<
      SingleResponse<{
        successful: number;
        failed: number;
        results: Array<{ userId: string; status: 'success' | 'error'; error?: string }>;
      }>
    >('/bulk/remove', { userIds });
  }
}

// Export singleton instance
export const scopeAssignmentService = new ScopeAssignmentService();
