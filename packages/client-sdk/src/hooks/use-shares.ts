/**
 * Share Hooks
 * Single Responsibility: React Query hooks for share links
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { shareService, type ShareQueryParams } from '../services/share.service';
import type { CreateShareLinkDTO } from '../types/additional';

// ============================================================================
// Share Query Hooks
// ============================================================================

/**
 * Get current user's share links
 */
export function useMyShares(params?: ShareQueryParams) {
  return useQuery({
    queryKey: [...queryKeys.shares.all, 'my', params] as const,
    queryFn: () => shareService.getMyShares(params),
  });
}

/**
 * Get share link by token
 */
export function useShareByToken(token: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shares.detail(token),
    queryFn: () => shareService.getByToken(token),
    enabled: !!token && (options?.enabled ?? true),
  });
}

/**
 * Get share links for a specific resource (listing or booking)
 */
export function useResourceShares(
  type: 'listing' | 'booking',
  resourceId: string,
  params?: ShareQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.shares.byResource(type, resourceId),
    queryFn: () => shareService.getByResource(type, resourceId, params),
    enabled: !!type && !!resourceId && (options?.enabled ?? true),
  });
}

/**
 * Validate a share link without incrementing view count
 */
export function useValidateShare(token: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.shares.all, 'validate', token] as const,
    queryFn: () => shareService.validate(token),
    enabled: !!token && (options?.enabled ?? true),
  });
}

// ============================================================================
// Share Mutation Hooks
// ============================================================================

/**
 * Create share link mutation
 */
export function useCreateShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShareLinkDTO) => shareService.create(data),
    onSuccess: (_, variables) => {
      // Invalidate all share lists
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.lists() });
      // Invalidate my shares
      queryClient.invalidateQueries({ queryKey: [...queryKeys.shares.all, 'my'] });
      // Invalidate resource-specific shares
      if (variables.type && variables.resourceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shares.byResource(variables.type, variables.resourceId),
        });
      }
    },
  });
}

/**
 * Revoke (delete) share link mutation
 */
export function useRevokeShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => shareService.revoke(token),
    onSuccess: (_, token) => {
      // Invalidate specific share detail
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.detail(token) });
      // Invalidate all share lists
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.lists() });
      // Invalidate my shares
      queryClient.invalidateQueries({ queryKey: [...queryKeys.shares.all, 'my'] });
      // Invalidate all resource shares (we don't know which resource, so invalidate all)
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.shares.all, 'byResource'],
      });
    },
  });
}
