/**
 * Organization Hooks (MinSide)
 * Production-ready hooks for organization management
 * 
 * Uses OrganizationService for API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import type { Organization, OrganizationMember } from '@/types/organization';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '@/types/enums';

/**
 * Query keys for organization data
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  members: (id: string) => [...organizationKeys.detail(id), 'members'] as const,
};

interface UseOrganizationsOptions {
  status?: 'active' | 'inactive' | 'all';
}

/**
 * Fetch user's organizations from the API
 * Endpoint: GET /api/organizations
 */
export function useOrganizations(options?: UseOrganizationsOptions) {
  return useQuery<PaginatedResponse<Organization>>({
    queryKey: organizationKeys.list(options),
    queryFn: async () => {
      // 'all' means no status filter
      const status = options?.status === 'all' ? undefined : options?.status;
      return organizationService.getAll(status ? { status } : undefined);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch single organization by ID
 * Endpoint: GET /api/organizations/:id
 */
export function useOrganization(id: string) {
  return useQuery<SingleResponse<Organization>>({
    queryKey: organizationKeys.detail(id),
    queryFn: async () => {
      return organizationService.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch organization members
 * Endpoint: GET /api/organizations/:id/members
 */
export function useOrganizationMembers(organizationId: string) {
  return useQuery<SingleResponse<OrganizationMember[]>>({
    queryKey: organizationKeys.members(organizationId),
    queryFn: async () => {
      return organizationService.getMembers(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Add member to organization
 * Endpoint: POST /api/organizations/:id/members
 */
export function useAddOrganizationMember() {
  const queryClient = useQueryClient();
  
  return useMutation<SuccessResponse, Error, { organizationId: string; userId: string; role?: string }>({
    mutationFn: async ({ organizationId, userId, role }) => {
      return organizationService.addMember(organizationId, { userId, role });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(variables.organizationId) });
    },
  });
}

/**
 * Remove member from organization
 * Endpoint: DELETE /api/organizations/:id/members/:memberId
 */
export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();
  
  return useMutation<SuccessResponse, Error, { organizationId: string; memberId: string }>({
    mutationFn: async ({ organizationId, memberId }) => {
      return organizationService.removeMember(organizationId, memberId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(variables.organizationId) });
    },
  });
}

/**
 * Update organization member role
 * Endpoint: PUT /api/organizations/:id/members/:memberId
 */
export function useUpdateOrganizationMember() {
  const queryClient = useQueryClient();
  
  return useMutation<SuccessResponse, Error, { organizationId: string; memberId: string; role: string }>({
    mutationFn: async ({ organizationId, memberId, role }) => {
      return organizationService.updateMember(organizationId, memberId, { role });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(variables.organizationId) });
    },
  });
}

