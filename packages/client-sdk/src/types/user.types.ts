/**
 * User Type Definitions
 * 
 * Types for user management and administration
 */

// ====================================================================
// USER ENTITY
// ====================================================================

export interface User {
  id: string;
  tenantId: string;
  email: string;
  
  // Profile
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  
  // Status
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_INVITE' | 'INACTIVE';
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Roles
  roles: Array<{
    id: string;
    name: string;
    tenantId: string;
  }>;
  
  // Organization memberships
  organizationId?: string;
  organizations?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
}

// ====================================================================
// LIST RESPONSE
// ====================================================================

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ====================================================================
// QUERY PARAMETERS
// ====================================================================

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_INVITE' | 'INACTIVE';
  role?: string;
  organizationId?: string;
  tenantId?: string;
  sortBy?: 'createdAt' | 'lastName' | 'email' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

// ====================================================================
// REQUEST DTOs
// ====================================================================

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId?: string;
  organizationId?: string;
  sendInvite?: boolean;
}

export interface UpdateUserDTO {
  firstName?: string;  
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  organizationId?: string;
}

export interface SuspendUserDTO {
  reason?: string;
  notifyUser?: boolean;
}

export interface AssignRoleDTO {
  roleId: string;
  organizationId?: string;
}

// ====================================================================
// BULK OPERATIONS
// ====================================================================

export interface BulkInviteUsersDTO {
  emails: string[];
  roleId?: string;
  organizationId?: string;
  message?: string;
}

export interface BulkInviteResponse {
  success: number;
  failed: number;
  errors?: Array<{
    email: string;
    error: string;
  }>;
}

// ====================================================================
// USER STATS
// ====================================================================

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  pendingInvite: number;
  byRole: Array<{
    role: string;
    count: number;
  }>;
  byOrganization: Array<{
    organizationId: string;
    organizationName: string;
    count: number;
  }>;
}
