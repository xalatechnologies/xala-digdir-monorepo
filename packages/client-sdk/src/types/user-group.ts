/**
 * User Group Types
 * Types for user group management
 */

/**
 * User Group entity
 */
export interface UserGroup {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create User Group DTO
 */
export interface CreateUserGroupDTO {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Update User Group DTO
 */
export interface UpdateUserGroupDTO {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * User Group Query Params
 */
export interface UserGroupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}
