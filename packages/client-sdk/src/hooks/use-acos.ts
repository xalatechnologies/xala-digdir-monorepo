/**
 * ACOS WebSak Hooks
 * Single Responsibility: React Query hooks for Norwegian Municipal Case Management System
 *
 * ACOS WebSak is used by Norwegian municipalities for:
 * - Document management (dokumenthåndtering)
 * - Case tracking (saksstyring)
 * - Archive compliance following NOARK standards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { acosWebSakService } from '../services/integration.service';
import type {
  AcosCase,
  CreateAcosCaseDTO,
  UploadAcosDocumentDTO,
  AcosArchiveMetadata
} from '../types/settings';

// ============================================================================
// Status Hooks
// ============================================================================

/**
 * Get ACOS WebSak connection status
 */
export function useAcosStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.acos.status(),
    queryFn: () => acosWebSakService.getStatus(),
  });
}

/**
 * Sync with ACOS WebSak mutation
 */
export function useSyncAcos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acosWebSakService.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.all() });
    },
  });
}

// ============================================================================
// Case Hooks
// ============================================================================

/**
 * List ACOS cases with optional filters
 */
export function useAcosCases(params?: {
  status?: AcosCase['status'];
  caseType?: AcosCase['caseType'];
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.cases.list(params),
    queryFn: () => acosWebSakService.listCases(params),
  });
}

/**
 * Get ACOS case by ID
 */
export function useAcosCase(caseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.cases.detail(caseId),
    queryFn: () => acosWebSakService.getCase(caseId),
    enabled: !!caseId && (options?.enabled ?? true),
  });
}

/**
 * Get ACOS case by booking ID
 */
export function useAcosCaseByBooking(bookingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.cases.byBooking(bookingId),
    queryFn: () => acosWebSakService.getCaseByBookingId(bookingId),
    enabled: !!bookingId && (options?.enabled ?? true),
  });
}

/**
 * Create ACOS case mutation
 */
export function useCreateAcosCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcosCaseDTO) => acosWebSakService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
    },
  });
}

/**
 * Update ACOS case status mutation
 */
export function useUpdateAcosCaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, status }: { caseId: string; status: AcosCase['status'] }) =>
      acosWebSakService.updateCaseStatus(caseId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.detail(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
    },
  });
}

/**
 * Archive ACOS case mutation (NOARK compliance)
 */
export function useArchiveAcosCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, metadata }: { caseId: string; metadata?: AcosArchiveMetadata }) =>
      acosWebSakService.archiveCase(caseId, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.detail(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.cases.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
    },
  });
}

// ============================================================================
// Document Hooks
// ============================================================================

/**
 * List documents for an ACOS case
 */
export function useAcosCaseDocuments(caseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.documents.byCase(caseId),
    queryFn: () => acosWebSakService.listDocuments(caseId),
    enabled: !!caseId && (options?.enabled ?? true),
  });
}

/**
 * Get ACOS document by ID
 */
export function useAcosDocument(documentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.documents.detail(documentId),
    queryFn: () => acosWebSakService.getDocument(documentId),
    enabled: !!documentId && (options?.enabled ?? true),
  });
}

/**
 * Upload document to ACOS case mutation
 */
export function useUploadAcosDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadAcosDocumentDTO) => acosWebSakService.uploadDocument(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.byCase(variables.caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
    },
  });
}

/**
 * Archive ACOS document mutation (NOARK compliance)
 */
export function useArchiveAcosDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => acosWebSakService.archiveDocument(documentId),
    onSuccess: (data) => {
      const documentId = data.data?.id;
      const caseId = data.data?.caseId;
      if (documentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.detail(documentId) });
      }
      if (caseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.byCase(caseId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.status() });
    },
  });
}
