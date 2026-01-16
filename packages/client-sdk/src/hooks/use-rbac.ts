/**
 * RBAC Hooks
 * Single Responsibility: React Query hooks for Role-Based Access Control
 *
 * This module provides hooks for:
 * - User capabilities projection
 * - Access grants (commune → org → rental object delegation)
 * - Permission assignments (org → member → rental object)
 * - Permission checking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { authzService } from '../services/authz.service';
import { accessGrantService } from '../services/access-grant.service';
import { permissionAssignmentService } from '../services/permission-assignment.service';
import type {
  UserCapabilities,
  AccessGrantQueryParams,
  AccessGrantWithDetails,
  CreateAccessGrantDTO,
  UpdateAccessGrantDTO,
  BulkAccessGrantDTO,
  PermissionAssignmentQueryParams,
  PermissionAssignmentWithDetails,
  AssignPermissionsDTO,
  RentalObjectPermission,
  CheckPermissionRequest,
} from '../types/rbac';

// ============================================================================
// Capabilities Hooks
// ============================================================================

/**
 * Get current user's capabilities projection
 * This is the single source of truth for UI capability-driven rendering.
 * Use this to determine navigation items, available actions, and route access.
 */
export function useCapabilities(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.rbac.capabilities(),
    queryFn: () => authzService.getCapabilities(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes - capabilities don't change often
  });
}

/**
 * Get user's permissions list
 * Returns an array of permission strings in format "{resource}:{action}"
 */
export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.auth.permissions(),
    queryFn: () => authzService.getPermissions(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if user has permission to perform an action on a resource
 */
export function useCheckPermission() {
  return useMutation({
    mutationFn: (request: CheckPermissionRequest) =>
      authzService.checkPermission(request),
  });
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(permission: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.auth.permissions(), 'check', permission],
    queryFn: () => authzService.hasPermission(permission),
    enabled: !!permission && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get user's effective role for a specific context
 */
export function useEffectiveRole(context?: { organizationId?: string }) {
  return useQuery({
    queryKey: [...queryKeys.rbac.roles(), 'effective', context],
    queryFn: () => authzService.getEffectiveRole(context),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Access Grant Hooks
// ============================================================================

/**
 * Get paginated access grants
 * Commune Admin: sees all grants for tenant
 * Org Admin: sees grants for their organization
 */
export function useAccessGrants(params?: AccessGrantQueryParams) {
  return useQuery({
    queryKey: queryKeys.accessGrants.list(params),
    queryFn: () => accessGrantService.getAll(params),
  });
}

/**
 * Get single access grant by ID
 */
export function useAccessGrant(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.accessGrants.detail(id),
    queryFn: () => accessGrantService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get access grants for a specific organization
 */
export function useAccessGrantsByOrganization(
  organizationId: string,
  params?: AccessGrantQueryParams
) {
  return useQuery({
    queryKey: queryKeys.accessGrants.byOrganization(organizationId),
    queryFn: () => accessGrantService.getByOrganization(organizationId, params),
    enabled: !!organizationId,
  });
}

/**
 * Get access grants for a specific rental object
 */
export function useAccessGrantsByRentalObject(
  rentalObjectId: string,
  params?: AccessGrantQueryParams
) {
  return useQuery({
    queryKey: queryKeys.accessGrants.byRentalObject(rentalObjectId),
    queryFn: () => accessGrantService.getByRentalObject(rentalObjectId, params),
    enabled: !!rentalObjectId,
  });
}

/**
 * Get accessible rental objects for an organization
 */
export function useAccessibleRentalObjects(organizationId: string) {
  return useQuery({
    queryKey: [...queryKeys.accessGrants.byOrganization(organizationId), 'rental-objects'],
    queryFn: () => accessGrantService.getAccessibleRentalObjects(organizationId),
    enabled: !!organizationId,
  });
}

/**
 * Get organizations with access to a rental object
 */
export function useGrantedOrganizations(rentalObjectId: string) {
  return useQuery({
    queryKey: [...queryKeys.accessGrants.byRentalObject(rentalObjectId), 'organizations'],
    queryFn: () => accessGrantService.getGrantedOrganizations(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

/**
 * Check if an organization has access to a rental object
 */
export function useCheckAccess(
  organizationId: string,
  rentalObjectId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.accessGrants.all, 'check', organizationId, rentalObjectId],
    queryFn: () => accessGrantService.checkAccess(organizationId, rentalObjectId),
    enabled: !!organizationId && !!rentalObjectId && (options?.enabled ?? true),
  });
}

/**
 * Grant access to an organization for a rental object (Commune Admin only)
 */
export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccessGrantDTO) => accessGrantService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate all access grant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accessGrants.byOrganization(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accessGrants.byRentalObject(variables.rentalObjectId),
      });
      // Also invalidate capabilities since access changed
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Bulk grant access to an organization for multiple rental objects (Commune Admin only)
 */
export function useBulkGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAccessGrantDTO) => accessGrantService.createBulk(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accessGrants.byOrganization(variables.organizationId),
      });
      // Invalidate each rental object's grants
      variables.rentalObjectIds.forEach((roId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.accessGrants.byRentalObject(roId),
        });
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Update access grant (Commune Admin only)
 */
export function useUpdateAccessGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccessGrantDTO }) =>
      accessGrantService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.lists() });
    },
  });
}

/**
 * Revoke access grant (Commune Admin only)
 * Soft-deletes the grant, preserving audit trail
 */
export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      accessGrantService.revoke(id, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
      // Also invalidate permission assignments since they depend on access grants
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
    },
  });
}

/**
 * Delete access grant permanently (Commune Admin only)
 * Use with caution - prefer revoke for audit trail
 */
export function useDeleteAccessGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accessGrantService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
    },
  });
}

// ============================================================================
// Permission Assignment Hooks
// ============================================================================

/**
 * Get paginated permission assignments
 * Org Admin: sees all assignments for their organization
 */
export function usePermissionAssignments(params?: PermissionAssignmentQueryParams) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.list(params),
    queryFn: () => permissionAssignmentService.getAll(params),
  });
}

/**
 * Get single permission assignment by ID
 */
export function usePermissionAssignment(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.detail(id),
    queryFn: () => permissionAssignmentService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get permission assignments for a specific organization
 */
export function usePermissionAssignmentsByOrganization(
  organizationId: string,
  params?: PermissionAssignmentQueryParams
) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.byOrganization(organizationId),
    queryFn: () => permissionAssignmentService.getByOrganization(organizationId, params),
    enabled: !!organizationId,
  });
}

/**
 * Get permission assignments for a specific user
 */
export function usePermissionAssignmentsByUser(
  userId: string,
  params?: PermissionAssignmentQueryParams
) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.byUser(userId),
    queryFn: () => permissionAssignmentService.getByUser(userId, params),
    enabled: !!userId,
  });
}

/**
 * Get permission assignments for a specific rental object within an organization
 */
export function usePermissionAssignmentsByRentalObject(
  organizationId: string,
  rentalObjectId: string,
  params?: PermissionAssignmentQueryParams
) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.byRentalObject(organizationId, rentalObjectId),
    queryFn: () => permissionAssignmentService.getByRentalObject(rentalObjectId, {
      ...params,
      organizationId,
    }),
    enabled: !!organizationId && !!rentalObjectId,
  });
}

/**
 * Get permission assignment for a specific member on a rental object
 */
export function useMemberPermissions(
  organizationId: string,
  rentalObjectId: string,
  userId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.forOrgRentalObject(organizationId, rentalObjectId, userId),
    queryFn: () => permissionAssignmentService.getByMember(organizationId, rentalObjectId, userId),
    enabled: !!organizationId && !!rentalObjectId && !!userId && (options?.enabled ?? true),
  });
}

/**
 * Get all permissions for a user across all rental objects in an organization
 */
export function useUserPermissionsSummary(organizationId: string, userId: string) {
  return useQuery({
    queryKey: [...queryKeys.permissionAssignments.byUser(userId), 'summary', organizationId],
    queryFn: () => permissionAssignmentService.getUserPermissionsSummary(organizationId, userId),
    enabled: !!organizationId && !!userId,
  });
}

/**
 * Get available permissions that can be assigned
 */
export function useAvailablePermissions() {
  return useQuery({
    queryKey: queryKeys.permissionAssignments.availablePermissions(),
    queryFn: () => permissionAssignmentService.getAvailablePermissions(),
    staleTime: 60 * 60 * 1000, // 1 hour - available permissions rarely change
  });
}

/**
 * Assign or update permissions for a user on a rental object (Org Admin only)
 * Creates a new assignment or updates existing permissions
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignPermissionsDTO) => permissionAssignmentService.assign(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byOrganization(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byRentalObject(
          variables.organizationId,
          variables.rentalObjectId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.forOrgRentalObject(
          variables.organizationId,
          variables.rentalObjectId,
          variables.userId
        ),
      });
      // Also invalidate capabilities since permissions changed
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Update permission assignment by ID (Org Admin only)
 */
export function useUpdatePermissionAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: RentalObjectPermission[] }) =>
      permissionAssignmentService.update(id, permissions),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Revoke all permissions for a user on a rental object (Org Admin only)
 * Soft-deletes the assignment, preserving audit trail
 */
export function useRevokePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      rentalObjectId,
      userId,
      reason,
    }: {
      organizationId: string;
      rentalObjectId: string;
      userId: string;
      reason?: string;
    }) => permissionAssignmentService.revoke(organizationId, rentalObjectId, userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.forOrgRentalObject(
          variables.organizationId,
          variables.rentalObjectId,
          variables.userId
        ),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Delete permission assignment by ID (Org Admin only)
 */
export function useDeletePermissionAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionAssignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Check if a user has specific permission on a rental object
 */
export function useCheckRentalObjectPermission(
  organizationId: string,
  userId: string,
  rentalObjectId: string,
  permission: RentalObjectPermission,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [
      ...queryKeys.permissionAssignments.all,
      'check',
      organizationId,
      userId,
      rentalObjectId,
      permission,
    ],
    queryFn: () =>
      permissionAssignmentService.checkPermission(
        organizationId,
        userId,
        rentalObjectId,
        permission
      ),
    enabled:
      !!organizationId &&
      !!userId &&
      !!rentalObjectId &&
      !!permission &&
      (options?.enabled ?? true),
  });
}

/**
 * Bulk assign permissions to multiple users on a rental object (Org Admin only)
 */
export function useBulkAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      rentalObjectId,
      assignments,
    }: {
      organizationId: string;
      rentalObjectId: string;
      assignments: { userId: string; permissions: RentalObjectPermission[] }[];
    }) => permissionAssignmentService.bulkAssign(organizationId, rentalObjectId, assignments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byOrganization(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byRentalObject(
          variables.organizationId,
          variables.rentalObjectId
        ),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

/**
 * Copy permissions from one user to another on a rental object (Org Admin only)
 */
export function useCopyPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      rentalObjectId,
      fromUserId,
      toUserId,
    }: {
      organizationId: string;
      rentalObjectId: string;
      fromUserId: string;
      toUserId: string;
    }) =>
      permissionAssignmentService.copyPermissions(
        organizationId,
        rentalObjectId,
        fromUserId,
        toUserId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissionAssignments.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.byUser(variables.toUserId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.permissionAssignments.forOrgRentalObject(
          variables.organizationId,
          variables.rentalObjectId,
          variables.toUserId
        ),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.capabilities() });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Helper hook to check if current user has a specific global capability
 * Convenience wrapper around useCapabilities
 */
export function useHasCapability(
  capability: keyof UserCapabilities['globalCapabilities']
): boolean {
  const { data } = useCapabilities();
  return data?.data?.globalCapabilities?.[capability] ?? false;
}

/**
 * Helper hook to get current user's backoffice role
 * Convenience wrapper around useCapabilities
 */
export function useBackofficeRole() {
  const { data, isLoading, error } = useCapabilities();
  return {
    role: data?.data?.backofficeRole,
    isLoading,
    error,
  };
}

/**
 * Helper hook to get current user's organization memberships
 * Convenience wrapper around useCapabilities
 */
export function useMyOrgMemberships() {
  const { data, isLoading, error } = useCapabilities();
  return {
    memberships: data?.data?.orgMemberships ?? [],
    isLoading,
    error,
  };
}

/**
 * Helper hook to get current user's accessible rental objects
 * Convenience wrapper around useCapabilities
 */
export function useMyAccessibleRentalObjects() {
  const { data, isLoading, error } = useCapabilities();
  return {
    rentalObjects: data?.data?.accessibleRentalObjects ?? [],
    isLoading,
    error,
  };
}
