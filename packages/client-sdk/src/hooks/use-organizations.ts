/**
 * Organization Hooks (MinSide)
 * TEMPORARY STUB - To be implemented when backend is ready
 *
 * This stub allows the app to load without breaking on missing import.
 * Returns empty organizations array until backend API is implemented.
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import type { Organization } from '../types';

interface UseOrganizationsOptions {
  status?: 'active' | 'inactive' | 'all';
}

interface OrganizationsResponse {
  data: Organization[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Fetch user's organizations (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 * Expected endpoint: GET /api/minside/organizations
 */
export function useOrganizations(options?: UseOrganizationsOptions) {
  return useQuery<OrganizationsResponse>({
    queryKey: ['organizations', 'minside', options],
    queryFn: async () => {
      // STUB: Return empty array until backend is ready
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 50,
        },
      };
    },
    // Disable refetching since this is a stub
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

/**
 * Fetch single organization (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 */
export function useOrganization(id: string) {
  return useQuery<{ data: Organization }>({
    queryKey: ['organizations', 'minside', 'detail', id],
    queryFn: async () => {
      // STUB: Return null until backend is ready
      throw new Error('Organization not found');
    },
    enabled: false, // Disable until backend is ready
  });
}

/**
 * Fetch organization members (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 * Expected endpoint: GET /api/organizations/:id/members
 */
export function useOrganizationMembers(organizationId: string) {
  return useQuery<{ data: any[] }>({
    queryKey: ['organizations', organizationId, 'members'],
    queryFn: async () => {
      // STUB: Return empty array until backend is ready
      return {
        data: [],
      };
    },
    enabled: !!organizationId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}

/**
 * Add member to organization (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 */
export function useAddOrganizationMember() {
  return useMutation<{ data: any }, Error, { organizationId: string; userId: string }>({
    mutationFn: async (payload) => {
      // STUB: Return unchanged until backend ready
      return { data: {} };
    },
  });
}

/**
 * Remove member from organization (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 */
export function useRemoveOrganizationMember() {
  return useMutation<{ success: boolean }, Error, { organizationId: string; userId: string }>({
    mutationFn: async (payload) => {
      // STUB: Return success until backend ready
      return { success: true };
    },
  });
}

/**
 * Update organization member (MinSide)
 *
 * TODO: Implement when backend endpoint is ready
 */
export function useUpdateOrganizationMember() {
  return useMutation<{ data: any }, Error, { organizationId: string; userId: string; role?: string }>({
    mutationFn: async (payload) => {
      // STUB: Return unchanged until backend ready
      return { data: {} };
    },
  });
}
