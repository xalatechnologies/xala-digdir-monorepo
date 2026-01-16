/**
 * GDPR Hooks
 * Single Responsibility: React Query hooks for GDPR data subject rights
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { gdprService } from '../services/gdpr.service';
import type {
  GdprRequestQueryParams,
  CreateGdprRequestDTO
} from '../types/gdpr';

// ============================================================================
// GDPR Request Hooks
// ============================================================================

/**
 * Get current user's GDPR requests
 */
export function useMyGdprRequests(params?: GdprRequestQueryParams) {
  return useQuery({
    queryKey: queryKeys.gdpr.myRequests(params),
    queryFn: () => gdprService.getMyRequests(params),
  });
}

/**
 * Get single GDPR request by ID
 */
export function useGdprRequest(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.gdpr.detail(id),
    queryFn: () => gdprService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get pending GDPR requests (admin only)
 */
export function usePendingGdprRequests(params?: GdprRequestQueryParams) {
  return useQuery({
    queryKey: queryKeys.gdpr.pending(params),
    queryFn: () => gdprService.getPendingRequests(params),
  });
}

/**
 * Get GDPR data export
 */
export function useGdprDataExport(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.gdpr.export(),
    queryFn: () => gdprService.exportData(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Create GDPR request mutation (export or deletion)
 */
export function useCreateGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGdprRequestDTO) => gdprService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.all });
    },
  });
}

/**
 * Cancel GDPR request mutation
 */
export function useCancelGdprRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gdprService.cancelRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.lists() });
    },
  });
}

/**
 * Update GDPR request status mutation (admin only)
 */
export function useUpdateGdprRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason
    }: {
      id: string;
      status: 'processing' | 'completed' | 'rejected';
      rejectionReason?: string
    }) => gdprService.updateRequestStatus(id, status, rejectionReason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.gdpr.pending() });
    },
  });
}
