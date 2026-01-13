/**
 * Organization Hooks
 * React Query hooks for organization management endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
} from '../services/api';
import type {
  Organization,
  OrganizationMember,
  OrganizationQueryParams,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  PaginatedResponse,
  SingleResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (params?: OrganizationQueryParams) => [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  members: (organizationId: string) => [...organizationKeys.all, organizationId, 'members'] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all organizations with optional filtering
 */
export function useOrganizations(params?: OrganizationQueryParams) {
  return useQuery<PaginatedResponse<Organization>>({
    queryKey: organizationKeys.list(params),
    queryFn: () => getOrganizations(params),
  });
}

/**
 * Fetch a single organization by ID
 */
export function useOrganization(id: string, enabled = true) {
  return useQuery<SingleResponse<Organization>>({
    queryKey: organizationKeys.detail(id),
    queryFn: () => getOrganization(id),
    enabled: enabled && !!id,
  });
}

/**
 * Fetch members of an organization
 */
export function useOrganizationMembers(organizationId: string, enabled = true) {
  return useQuery<{ data: OrganizationMember[] }>({
    queryKey: organizationKeys.members(organizationId),
    queryFn: () => getOrganizationMembers(organizationId),
    enabled: enabled && !!organizationId,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationDTO) => createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

/**
 * Update an organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDTO }) =>
      updateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
    },
  });
}

/**
 * Add a member to an organization
 */
export function useAddOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, userId, role }: { organizationId: string; userId: string; role: 'admin' | 'member' }) =>
      addOrganizationMember(organizationId, userId, role),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) });
    },
  });
}

/**
 * Remove a member from an organization
 */
export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, memberId }: { organizationId: string; memberId: string }) =>
      removeOrganizationMember(organizationId, memberId),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) });
    },
  });
}
