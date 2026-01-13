/**
 * User Management Hooks
 * React Query hooks for user management endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUser,
  getCurrentUser,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
} from '../services/api';
import type {
  BackofficeUser,
  UserQueryParams,
  CreateUserDTO,
  UpdateUserDTO,
  PaginatedResponse,
  SingleResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all users with optional filtering
 */
export function useUsers(params?: UserQueryParams) {
  return useQuery<PaginatedResponse<BackofficeUser>>({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

/**
 * Fetch a single user by ID
 */
export function useUser(id: string, enabled = true) {
  return useQuery<SingleResponse<BackofficeUser>>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: enabled && !!id,
  });
}

/**
 * Fetch current authenticated user
 */
export function useCurrentUser() {
  return useQuery<SingleResponse<BackofficeUser>>({
    queryKey: userKeys.current(),
    queryFn: () => getCurrentUser(),
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

/**
 * Deactivate a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

/**
 * Reactivate a user
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
