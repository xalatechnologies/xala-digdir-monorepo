import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  UserListResponse,
  CreateUserDTO,
  UpdateUserDTO,
  ListUsersQuery,
  AssignRoleDTO,
} from '../types/user.types';
import { queryKeys } from './query-keys';

/**
 * User Management Hooks
 * 
 * React Query hooks for admin user operations
 * Note: These are for ADMIN operations, not current user profile
 */

// ====================================================================
// QUERIES
// ====================================================================

/**
 * List all users (admin only)
 */
export function useUsers(query?: Partial<ListUsersQuery>) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: async () => {
      // TODO: Implement userService.list(query)
      const response = await fetch(`/api/admin/users?${new URLSearchParams(query as any)}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json() as Promise<UserListResponse>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get single user by ID (admin only)
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json() as Promise<User>;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get users by organization (admin only)
 */
export function useUsersByOrganization(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.users.byOrganization(organizationId),
    queryFn: async () => {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users`);
      if (!response.ok) throw new Error('Failed to fetch organization users');
      return response.json() as Promise<User[]>;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get users by tenant (super admin only)
 */
export function useUsersByTenant(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.users.byTenant(tenantId),
    queryFn: async () => {
      const response = await fetch(`/api/admin/tenants/${tenantId}/users`);
      if (!response.ok) throw new Error('Failed to fetch tenant users');
      return response.json() as Promise<User[]>;
    },
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  });
}

// ====================================================================
// MUTATIONS
// ====================================================================

/**
 * Create new user (admin only)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDTO) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data) => {
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Set detail cache
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
    },
  });
}

/**
 * Update user (admin only)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDTO }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
    },
  });
}

/**
 * Delete user (admin only)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete user');
      }
    },
    onSuccess: (_, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

/**
 * Suspend user (admin only)
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/admin/users/${id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to suspend user');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
    },
  });
}

/**
 * Reinstate suspended user (admin only)
 */
export function useReinstateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}/reinstate`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to reinstate user');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data, id) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.users.detail(id), data);
    },
  });
}

/**
 * Assign role to user (admin only)
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: AssignRoleDTO }) => {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to assign role');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);
    },
  });
}

/**
 * Remove role from user (admin only)
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove role');
      }
      return response.json() as Promise<User>;
    },
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Update detail cache
      queryClient.setQueryData(queryKeys.users.detail(variables.userId), data);
    },
  });
}

/**
 * Bulk invite users (admin only)
 */
export function useBulkInviteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { emails: string[]; roleId?: string; organizationId?: string }) => {
      const response = await fetch('/api/admin/users/invite-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to invite users');
      }
      return response.json() as Promise<{
        success: number;
        failed: number;
        errors?: Array<{ email: string; error: string }>;
      }>;
    },
    onSuccess: () => {
      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// ====================================================================
// HELPER HOOKS
// ====================================================================

/**
 * Get user count by status
 */
export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats');
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json() as Promise<{
        total: number;
        active: number;
        suspended: number;
        pendingInvite: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Search users (debounced)
 */
export function useSearchUsers(searchTerm: string) {
  return useQuery({
    queryKey: queryKeys.users.search(searchTerm),
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to search users');
      return response.json() as Promise<User[]>;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}
