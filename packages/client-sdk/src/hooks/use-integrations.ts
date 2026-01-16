/**
 * Integration Hooks
 * Single Responsibility: React Query hooks for third-party integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  settingsService,
  rcoService,
  vismaService,
  brregService,
  nifService,
  vippsService,
  calendarSyncService,
  acosWebSakService
} from '../services/integration.service';
import type {
  TenantSettings,
  CreateAccessCodeDTO,
  CreateInvoiceDTO,
  InitiatePaymentDTO,
  CapturePaymentDTO,
  RefundPaymentDTO,
  CreateAcosCaseDTO,
  UploadAcosDocumentDTO,
  AcosCase,
  AcosArchiveMetadata
} from '../types/settings';

// ============================================================================
// Settings Hooks
// ============================================================================

/**
 * Get tenant settings
 */
export function useTenantSettings() {
  return useQuery({
    queryKey: queryKeys.settings.tenant(),
    queryFn: () => settingsService.getSettings(),
  });
}

/**
 * Update tenant settings mutation
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.tenant() });
    },
  });
}

/**
 * Get integration settings
 */
export function useIntegrationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.integrations(),
    queryFn: () => settingsService.getIntegrations(),
  });
}

/**
 * Update integration settings mutation
 */
export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: Record<string, unknown> }) => 
      settingsService.updateIntegration(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.integrations() });
    },
  });
}

// ============================================================================
// RCO Hooks
// ============================================================================

/**
 * Get RCO connection status
 */
export function useRcoStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.status(),
    queryFn: () => rcoService.getStatus(),
  });
}

/**
 * Get connected locks
 */
export function useRcoLocks() {
  return useQuery({
    queryKey: queryKeys.integrations.rco.locks(),
    queryFn: () => rcoService.getLocks(),
  });
}

/**
 * Generate access code mutation
 */
export function useGenerateAccessCode() {
  return useMutation({
    mutationFn: (data: CreateAccessCodeDTO) => rcoService.generateAccessCode(data),
  });
}

/**
 * Remote unlock mutation
 */
export function useRemoteUnlock() {
  return useMutation({
    mutationFn: ({ lockId, duration }: { lockId: string; duration?: number }) =>
      rcoService.unlock(lockId, duration),
  });
}

/**
 * Sync RCO integration mutation (retry connection)
 */
export function useRcoSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rcoService.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.rco.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.rco.locks() });
    },
  });
}

// ============================================================================
// Visma Hooks
// ============================================================================

/**
 * Get Visma connection status
 */
export function useVismaStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.status(),
    queryFn: () => vismaService.getStatus(),
  });
}

/**
 * Get Visma invoices
 */
export function useVismaInvoices() {
  return useQuery({
    queryKey: queryKeys.integrations.visma.invoices(),
    queryFn: () => vismaService.getInvoices(),
  });
}

/**
 * Create Visma invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceDTO) => vismaService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices() });
    },
  });
}

/**
 * Sync with Visma mutation
 */
export function useSyncVisma() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => vismaService.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.invoices() });
    },
  });
}

// ============================================================================
// BRREG Hooks
// ============================================================================

/**
 * Lookup organization in BRREG
 */
export function useBrregLookup(orgNumber: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.brreg.lookup(orgNumber),
    queryFn: () => brregService.lookup(orgNumber),
    enabled: !!orgNumber && orgNumber.length >= 9 && (options?.enabled ?? true),
  });
}

/**
 * Verify organization in BRREG mutation
 */
export function useVerifyBrreg() {
  return useMutation({
    mutationFn: (organizationNumber: string) => brregService.verify(organizationNumber),
  });
}

// ============================================================================
// NIF Hooks
// ============================================================================

/**
 * Lookup sports club in NIF
 */
export function useNifLookup(clubId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.nif.lookup(clubId),
    queryFn: () => nifService.lookup(clubId),
    enabled: !!clubId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Vipps Hooks
// ============================================================================

/**
 * Get Vipps connection status
 */
export function useVippsStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.status(),
    queryFn: () => vippsService.getStatus(),
  });
}

/**
 * Get payment status
 */
export function useVippsPayment(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.payment(orderId),
    queryFn: () => vippsService.getPaymentStatus(orderId),
    enabled: !!orderId && (options?.enabled ?? true),
  });
}

/**
 * Initiate Vipps payment mutation
 */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (data: InitiatePaymentDTO) => vippsService.initiatePayment(data),
  });
}

/**
 * Get payment history
 */
export function useVippsPaymentHistory() {
  return useQuery({
    queryKey: queryKeys.integrations.vipps.history(),
    queryFn: () => vippsService.getPaymentHistory(),
  });
}

/**
 * Capture payment mutation (finalize authorized payment)
 */
export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapturePaymentDTO) => vippsService.capturePayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.payment(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.history() });
    },
  });
}

/**
 * Refund payment mutation (full or partial)
 */
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefundPaymentDTO) => vippsService.refundPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.payment(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.vipps.history() });
    },
  });
}

// ============================================================================
// Calendar Sync Hooks
// ============================================================================

/**
 * Get calendar sync status
 */
export function useCalendarSyncStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.calendar.status(),
    queryFn: () => calendarSyncService.getStatus(),
  });
}

/**
 * Sync external calendar mutation
 */
export function useSyncCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: 'google' | 'outlook') => calendarSyncService.sync(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.calendar.status() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// ============================================================================
// ACOS WebSak Hooks
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
    },
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
 * List ACOS documents for a case
 */
export function useAcosDocuments(caseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.integrations.acos.documents.byCase(caseId),
    queryFn: () => acosWebSakService.listDocuments(caseId),
    enabled: !!caseId && (options?.enabled ?? true),
  });
}

/**
 * Upload ACOS document mutation
 */
export function useUploadAcosDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadAcosDocumentDTO) => acosWebSakService.uploadDocument(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.byCase(variables.caseId) });
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
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.acos.documents.detail(documentId) });
    },
  });
}

/**
 * Sync ACOS WebSak integration mutation (retry connection)
 */
export function useAcosSync() {
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
// Combined Integration Status Hooks
// ============================================================================

/**
 * Integration status type for combined status hook
 */
export interface IntegrationStatusSummary {
  rco: { connected: boolean; activeAccessCodes: number; lockdownActive: boolean } | null;
  visma: { connected: boolean; pendingInvoices: number; overdueInvoices: number; lastSync?: string } | null;
  vipps: { connected: boolean; merchantId: string } | null;
  acos: { connected: boolean; pendingCases: number; pendingDocuments: number } | null;
  calendar: { googleCalendar: { connected: boolean }; outlookCalendar: { connected: boolean; lastSync?: string } } | null;
}

/**
 * Get all integration statuses in a single hook
 * Useful for displaying integration health dashboard
 */
export function useAllIntegrationsStatus() {
  const rcoStatus = useRcoStatus();
  const vismaStatus = useVismaStatus();
  const vippsStatus = useVippsStatus();
  const acosStatus = useAcosStatus();
  const calendarStatus = useCalendarSyncStatus();

  const isLoading =
    rcoStatus.isLoading ||
    vismaStatus.isLoading ||
    vippsStatus.isLoading ||
    acosStatus.isLoading ||
    calendarStatus.isLoading;

  const isError =
    rcoStatus.isError ||
    vismaStatus.isError ||
    vippsStatus.isError ||
    acosStatus.isError ||
    calendarStatus.isError;

  const statuses: IntegrationStatusSummary = {
    rco: rcoStatus.data?.data ?? null,
    visma: vismaStatus.data?.data ?? null,
    vipps: vippsStatus.data?.data ?? null,
    acos: acosStatus.data?.data ?? null,
    calendar: calendarStatus.data?.data ?? null,
  };

  const connectedCount = [
    statuses.rco?.connected,
    statuses.visma?.connected,
    statuses.vipps?.connected,
    statuses.acos?.connected,
    statuses.calendar?.googleCalendar?.connected || statuses.calendar?.outlookCalendar?.connected,
  ].filter(Boolean).length;

  const totalIntegrations = 5;

  return {
    statuses,
    isLoading,
    isError,
    connectedCount,
    totalIntegrations,
    allConnected: connectedCount === totalIntegrations,
    refetch: () => {
      rcoStatus.refetch();
      vismaStatus.refetch();
      vippsStatus.refetch();
      acosStatus.refetch();
      calendarStatus.refetch();
    },
  };
}

/**
 * Retry all failed integrations mutation
 * Triggers sync for all integration services
 */
export function useRetryAllIntegrations() {
  const rcoSync = useRcoSync();
  const vismaSync = useSyncVisma();
  const acosSync = useAcosSync();

  const isLoading = rcoSync.isPending || vismaSync.isPending || acosSync.isPending;
  const isError = rcoSync.isError || vismaSync.isError || acosSync.isError;

  const retryAll = async () => {
    await Promise.allSettled([
      rcoSync.mutateAsync(),
      vismaSync.mutateAsync(),
      acosSync.mutateAsync(),
    ]);
  };

  return {
    retryAll,
    isLoading,
    isError,
    rcoSync,
    vismaSync,
    acosSync,
  };
}
