/**
 * Admin Permissions Hooks
 * React Query hooks for rental object-specific permissions
 * Used by backoffice PermissionManagement page
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  adminPermissionService,
  type AdminPermissionQueryParams,
  type GrantPermissionDTO,
} from '@/services/admin-permission.service';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all rental object permissions with optional filters
 */
export function useAdminPermissions(params?: AdminPermissionQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminPermissions.list(params),
    queryFn: () => adminPermissionService.getAll(params),
  });
}

/**
 * Get single permission by ID
 */
export function useAdminPermission(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminPermissions.detail(id),
    queryFn: () => adminPermissionService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get permissions for a specific rental object
 */
export function useAdminPermissionsByRentalObject(rentalObjectId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminPermissions.byRentalObject(rentalObjectId),
    queryFn: () => adminPermissionService.getByRentalObject(rentalObjectId),
    enabled: !!rentalObjectId && (options?.enabled ?? true),
  });
}

/**
 * Get permissions for a specific user
 */
export function useAdminPermissionsByUser(userId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminPermissions.byUser(userId),
    queryFn: () => adminPermissionService.getByUser(userId),
    enabled: !!userId && (options?.enabled ?? true),
  });
}

/**
 * Get permissions for a specific organization
 */
export function useAdminPermissionsByOrganization(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminPermissions.byOrganization(organizationId),
    queryFn: () => adminPermissionService.getByOrganization(organizationId),
    enabled: !!organizationId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Grant permission to user or organization
 */
export function useGrantAdminPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantPermissionDTO) => adminPermissionService.grant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPermissions.all });
    },
  });
}

/**
 * Revoke (delete) a permission
 */
export function useRevokeAdminPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPermissionService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPermissions.all });
    },
  });
}

/**
 * Update an existing permission
 */
export function useUpdateAdminPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GrantPermissionDTO> }) =>
      adminPermissionService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPermissions.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPermissions.lists() });
    },
  });
}

// Re-export types for convenience
export type { AdminPermissionQueryParams, GrantPermissionDTO } from '@/services/admin-permission.service';
