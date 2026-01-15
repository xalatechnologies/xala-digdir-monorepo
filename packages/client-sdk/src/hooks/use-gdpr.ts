/**
 * GDPR Hooks
 * React Query hooks for GDPR consent management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gdprService } from '../services/gdpr.service';
import type {
  ConsentType,
  ConsentSummary,
  UserConsentStatus,
  GrantConsentDTO,
  GrantMultipleConsentsDTO,
  ConsentAuditLogEntry,
  DataSubjectRequest,
  CreateDataSubjectRequestDTO,
} from '../types/gdpr';

// =============================================================================
// Query Keys
// =============================================================================

export const gdprKeys = {
  all: ['gdpr'] as const,
  consentTypes: (locale: string) => [...gdprKeys.all, 'consent-types', locale] as const,
  myConsents: (locale: string) => [...gdprKeys.all, 'my-consents', locale] as const,
  consentStatus: () => [...gdprKeys.all, 'consent-status'] as const,
  auditLog: (limit: number) => [...gdprKeys.all, 'audit-log', limit] as const,
  myDataRequests: () => [...gdprKeys.all, 'my-data-requests'] as const,
  pendingRequests: () => [...gdprKeys.all, 'pending-requests'] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get all active consent types
 */
export function useConsentTypes(locale = 'nb') {
  return useQuery({
    queryKey: gdprKeys.consentTypes(locale),
    queryFn: () => gdprService.getConsentTypes(locale),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get current user's consent summary
 */
export function useMyConsents(locale = 'nb') {
  return useQuery({
    queryKey: gdprKeys.myConsents(locale),
    queryFn: () => gdprService.getMyConsents(locale),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Check if user has granted all required consents
 */
export function useConsentStatus() {
  return useQuery({
    queryKey: gdprKeys.consentStatus(),
    queryFn: () => gdprService.checkConsentStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get consent audit log for current user
 */
export function useConsentAuditLog(limit = 50) {
  return useQuery({
    queryKey: gdprKeys.auditLog(limit),
    queryFn: () => gdprService.getAuditLog(limit),
  });
}

/**
 * Get all data subject requests for current user
 */
export function useMyDataRequests() {
  return useQuery({
    queryKey: gdprKeys.myDataRequests(),
    queryFn: () => gdprService.getMyDataRequests(),
  });
}

/**
 * Get all pending data subject requests (admin)
 */
export function usePendingDataRequests() {
  return useQuery({
    queryKey: gdprKeys.pendingRequests(),
    queryFn: () => gdprService.getPendingRequests(),
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Grant or revoke a single consent
 */
export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: GrantConsentDTO) => gdprService.grantConsent(dto),
    onSuccess: () => {
      // Invalidate all consent-related queries
      queryClient.invalidateQueries({ queryKey: gdprKeys.all });
    },
  });
}

/**
 * Grant or revoke multiple consents at once
 */
export function useGrantMultipleConsents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: GrantMultipleConsentsDTO) => gdprService.grantMultipleConsents(dto),
    onSuccess: () => {
      // Invalidate all consent-related queries
      queryClient.invalidateQueries({ queryKey: gdprKeys.all });
    },
  });
}

/**
 * Submit a data subject request
 */
export function useCreateDataSubjectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDataSubjectRequestDTO) => gdprService.createDataSubjectRequest(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gdprKeys.myDataRequests() });
    },
  });
}

/**
 * Update data subject request status (admin)
 */
export function useUpdateDataRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      responseNotes,
    }: {
      id: string;
      status: 'processing' | 'completed' | 'rejected';
      responseNotes?: string;
    }) => gdprService.updateRequestStatus(id, status, responseNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gdprKeys.pendingRequests() });
    },
  });
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to check if consent popup should be shown
 * Returns true if user hasn't granted all required consents
 */
export function useShowConsentPopup() {
  const { data: hasAllRequired, isLoading } = useConsentStatus();
  
  return {
    shouldShow: !isLoading && hasAllRequired === false,
    isLoading,
  };
}

/**
 * Hook to get pending required consents for the popup
 */
export function usePendingRequiredConsents(locale = 'nb') {
  const { data: summary, isLoading } = useMyConsents(locale);
  
  return {
    pendingConsents: summary?.pendingRequired ?? [],
    hasAllRequired: summary?.hasAllRequired ?? true,
    isLoading,
  };
}
