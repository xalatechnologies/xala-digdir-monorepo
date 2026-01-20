/**
 * Brreg Hooks
 * React Query hooks for Norwegian org registry
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brregService } from '@/services/brreg.service';

// Query key factory
export const brregKeys = {
  all: ['brreg'] as const,
  search: (query: string) => [...brregKeys.all, 'search', query] as const,
  org: (orgNumber: string) => [...brregKeys.all, 'org', orgNumber] as const,
  roles: (orgNumber: string) => [...brregKeys.all, 'roles', orgNumber] as const,
  validation: (orgNumber: string) => [...brregKeys.all, 'validate', orgNumber] as const,
};

/**
 * Search organizations in Brreg
 */
export function useBrregSearch(query: string, options?: { type?: string; limit?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: brregKeys.search(query),
    queryFn: () => brregService.search(query, options),
    enabled: query.length >= 2 && (options?.enabled ?? true),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

/**
 * Get organization details
 */
export function useBrregOrganization(orgNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: brregKeys.org(orgNumber),
    queryFn: () => brregService.getOrganization(orgNumber),
    enabled: !!orgNumber && (options?.enabled ?? true),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}

/**
 * Get organization roles
 */
export function useBrregRoles(orgNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: brregKeys.roles(orgNumber),
    queryFn: () => brregService.getOrganizationRoles(orgNumber),
    enabled: !!orgNumber && (options?.enabled ?? true),
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Validate org number
 */
export function useBrregValidation(orgNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: brregKeys.validation(orgNumber),
    queryFn: () => brregService.validate(orgNumber),
    enabled: !!orgNumber && orgNumber.length === 9 && (options?.enabled ?? true),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Create organization from Brreg mutation
 */
export function useCreateFromBrreg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgNumber: string) => brregService.createFromBrreg(orgNumber),
    onSuccess: () => {
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
