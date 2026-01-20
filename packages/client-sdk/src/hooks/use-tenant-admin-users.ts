/**
 * Tenant Admin User Management Hooks
 * React Query hooks for tenant-admin-specific user operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { tenantAdminUserService } from '@/services/tenant-admin-user.service';
import type {
  TenantUser,
  UserQueryParams,
  InviteUserDTO,
  AssignRoleDTO,
  AssignOrganizationDTO,
  AssignScopeDTO,
  EffectivePermissions,
  UserInvitation,
  ResendInvitationDTO,
  CancelInvitationDTO,
  UserRole,
  UserActivityLogEntry,
} from '@/services/tenant-admin-user.service';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '@/types/enums';

// =============================================================================
// Query Keys
// =============================================================================

export const tenantAdminUserKeys = {
  all: ['tenant-admin-users'] as const,
  lists: () => [...tenantAdminUserKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...tenantAdminUserKeys.lists(), params] as const,
  details: () => [...tenantAdminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantAdminUserKeys.details(), id] as const,
  permissions: (id: string) => [...tenantAdminUserKeys.detail(id), 'permissions'] as const,
  activity: (id: string) => [...tenantAdminUserKeys.detail(id), 'activity'] as const,
  invitations: () => [...tenantAdminUserKeys.all, 'invitations'] as const,
  invitation: (params?: { status?: 'pending' | 'expired'; page?: number; limit?: number }) => [...tenantAdminUserKeys.invitations(), params] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get paginated users with filters
 */
export function useTenantAdminUsers(
  params?: UserQueryParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<TenantUser>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tenantAdminUserKeys.list(params),
    queryFn: () => tenantAdminUserService.getAll(params),
    ...options,
  });
}

/**
 * Get single user by ID
 */
export function useTenantAdminUser(
  id: string,
  options?: Omit<UseQueryOptions<SingleResponse<TenantUser>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tenantAdminUserKeys.detail(id),
    queryFn: () => tenantAdminUserService.getById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get effective permissions for user
 */
export function useUserEffectivePermissions(
  userId: string,
  options?: Omit<UseQueryOptions<SingleResponse<EffectivePermissions>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tenantAdminUserKeys.permissions(userId),
    queryFn: () => tenantAdminUserService.getEffectivePermissions(userId),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Get user activity log
 */
export function useUserActivity(
  userId: string,
  params?: { page?: number; limit?: number; startDate?: string; endDate?: string },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserActivityLogEntry>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tenantAdminUserKeys.activity(userId),
    queryFn: () => tenantAdminUserService.getActivityLog(userId, params),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Get pending invitations
 */
export function useUserInvitations(
  params?: { status?: 'pending' | 'expired'; page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<UserInvitation>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tenantAdminUserKeys.invitation(params),
    queryFn: () => tenantAdminUserService.getInvitations(params),
    ...options,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Invite new user
 */
export function useInviteTenantUser(
  options?: UseMutationOptions<SingleResponse<UserInvitation>, Error, InviteUserDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserDTO) => tenantAdminUserService.inviteUser(data),
    onSuccess: () => {
      // Invalidate user lists and invitations
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.invitations() });
    },
    ...options,
  });
}

/**
 * Resend invitation
 */
export function useResendInvitation(
  options?: UseMutationOptions<SuccessResponse, Error, ResendInvitationDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResendInvitationDTO) => tenantAdminUserService.resendInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.invitations() });
    },
    ...options,
  });
}

/**
 * Cancel invitation
 */
export function useCancelInvitation(
  options?: UseMutationOptions<SuccessResponse, Error, CancelInvitationDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelInvitationDTO) => tenantAdminUserService.cancelInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.invitations() });
    },
    ...options,
  });
}

/**
 * Assign role to user
 */
export function useAssignUserRole(
  options?: UseMutationOptions<SingleResponse<TenantUser>, Error, AssignRoleDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignRoleDTO) => tenantAdminUserService.assignRole(data),
    onSuccess: (_, variables) => {
      // Invalidate user lists and specific user detail
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.permissions(variables.userId) });
    },
    ...options,
  });
}

/**
 * Assign user to organization
 */
export function useAssignUserToOrganization(
  options?: UseMutationOptions<SuccessResponse, Error, AssignOrganizationDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignOrganizationDTO) => tenantAdminUserService.assignToOrganization(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
    },
    ...options,
  });
}

/**
 * Remove user from organization
 */
export function useRemoveUserFromOrganization(
  options?: UseMutationOptions<SuccessResponse, Error, { userId: string; organizationId: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, organizationId }) =>
      tenantAdminUserService.removeFromOrganization(userId, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
    },
    ...options,
  });
}

/**
 * Assign scopes to user
 */
export function useAssignUserScopes(
  options?: UseMutationOptions<SuccessResponse, Error, AssignScopeDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignScopeDTO) => tenantAdminUserService.assignScopes(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.permissions(variables.userId) });
    },
    ...options,
  });
}

/**
 * Deactivate user
 */
export function useDeactivateTenantUser(
  options?: UseMutationOptions<SuccessResponse, Error, { userId: string; reason?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }) => tenantAdminUserService.deactivate(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
    },
    ...options,
  });
}

/**
 * Reactivate user
 */
export function useReactivateTenantUser(
  options?: UseMutationOptions<SuccessResponse, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => tenantAdminUserService.reactivate(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(userId) });
    },
    ...options,
  });
}

/**
 * Suspend user
 */
export function useSuspendUser(
  options?: UseMutationOptions<SuccessResponse, Error, { userId: string; reason: string; expiresAt?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason, expiresAt }) =>
      tenantAdminUserService.suspend(userId, reason, expiresAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(variables.userId) });
    },
    ...options,
  });
}

/**
 * Unsuspend user
 */
export function useUnsuspendUser(
  options?: UseMutationOptions<SuccessResponse, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => tenantAdminUserService.unsuspend(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.detail(userId) });
    },
    ...options,
  });
}

// =============================================================================
// Bulk Operations
// =============================================================================

/**
 * Bulk invite users
 */
export function useBulkInviteUsers(
  options?: UseMutationOptions<
    SingleResponse<{ invited: TenantUser[]; failed: Array<{ email: string; error: string }> }>,
    Error,
    InviteUserDTO[]
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (users: InviteUserDTO[]) => tenantAdminUserService.bulkInvite(users),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.invitations() });
    },
    ...options,
  });
}

/**
 * Bulk deactivate users
 */
export function useBulkDeactivateUsers(
  options?: UseMutationOptions<SuccessResponse, Error, { userIds: string[]; reason?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, reason }) => tenantAdminUserService.bulkDeactivate(userIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
    },
    ...options,
  });
}

/**
 * Bulk assign role
 */
export function useBulkAssignRole(
  options?: UseMutationOptions<SuccessResponse, Error, { userIds: string[]; role: UserRole }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, role }) => tenantAdminUserService.bulkAssignRole(userIds, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantAdminUserKeys.lists() });
    },
    ...options,
  });
}
