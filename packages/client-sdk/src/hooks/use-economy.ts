/**
 * Economy Hooks
 * Single Responsibility: React Query hooks for economy, invoices, and billing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { economyService } from '@/services/economy.service';
import type {
  EconomyQueryParams,
  CreateInvoiceBasisDTO,
  UpdateInvoiceBasisDTO,
  GenerateInvoicesFromBookingsDTO,
  FinalizeInvoiceBasisDTO,
  SendSalesDocumentDTO,
  MarkAsPaidDTO,
  CreateCreditNoteDTO,
  SyncToVismaDTO,
  EconomyExportParams,
} from '@/types/economy';

// =============================================================================
// Invoice Basis Hooks
// =============================================================================

/**
 * Get paginated invoice bases
 */
export function useInvoiceBases(params?: EconomyQueryParams) {
  return useQuery({
    queryKey: queryKeys.economy.invoiceBases.list(params),
    queryFn: () => economyService.getInvoiceBases(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single invoice basis by ID
 */
export function useInvoiceBasis(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.economy.invoiceBases.detail(id),
    queryFn: () => economyService.getInvoiceBasis(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create invoice basis mutation
 */
export function useCreateInvoiceBasis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceBasisDTO) => economyService.createInvoiceBasis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Generate invoice bases from bookings mutation
 */
export function useGenerateFromBookings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateInvoicesFromBookingsDTO) => economyService.generateFromBookings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

/**
 * Update invoice basis mutation
 */
export function useUpdateInvoiceBasis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceBasisDTO }) =>
      economyService.updateInvoiceBasis(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.lists() });
    },
  });
}

/**
 * Approve invoice basis mutation
 */
export function useApproveInvoiceBasis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => economyService.approveInvoiceBasis(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Finalize invoice basis to sales document mutation
 */
export function useFinalizeInvoiceBasis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FinalizeInvoiceBasisDTO) => economyService.finalizeInvoiceBasis(data),
    onSuccess: (_, { invoiceBasisId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.detail(invoiceBasisId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Delete invoice basis mutation
 */
export function useDeleteInvoiceBasis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => economyService.deleteInvoiceBasis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.invoiceBases.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

// =============================================================================
// Sales Document Hooks
// =============================================================================

/**
 * Get paginated sales documents
 */
export function useSalesDocuments(params?: EconomyQueryParams) {
  return useQuery({
    queryKey: queryKeys.economy.salesDocuments.list(params),
    queryFn: () => economyService.getSalesDocuments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single sales document by ID
 */
export function useSalesDocument(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.economy.salesDocuments.detail(id),
    queryFn: () => economyService.getSalesDocument(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Send sales document mutation
 */
export function useSendSalesDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendSalesDocumentDTO) => economyService.sendSalesDocument(data),
    onSuccess: (_, { salesDocumentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.detail(salesDocumentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Mark sales document as paid mutation
 */
export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkAsPaidDTO) => economyService.markAsPaid(data),
    onSuccess: (_, { salesDocumentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.detail(salesDocumentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Download invoice PDF mutation
 */
export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: (id: string) => economyService.downloadInvoicePdf(id),
  });
}

/**
 * Cancel sales document mutation
 */
export function useCancelSalesDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      economyService.cancelSalesDocument(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

// =============================================================================
// Credit Note Hooks
// =============================================================================

/**
 * Get paginated credit notes
 */
export function useCreditNotes(params?: EconomyQueryParams) {
  return useQuery({
    queryKey: queryKeys.economy.creditNotes.list(params),
    queryFn: () => economyService.getCreditNotes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single credit note by ID
 */
export function useCreditNote(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.economy.creditNotes.detail(id),
    queryFn: () => economyService.getCreditNote(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create credit note mutation
 */
export function useCreateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCreditNoteDTO) => economyService.createCreditNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.creditNotes.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Approve credit note mutation
 */
export function useApproveCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => economyService.approveCreditNote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.creditNotes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Process credit note mutation
 */
export function useProcessCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => economyService.processCreditNote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.creditNotes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.creditNotes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.statistics() });
    },
  });
}

/**
 * Download credit note PDF mutation
 */
export function useDownloadCreditNotePdf() {
  return useMutation({
    mutationFn: (id: string) => economyService.downloadCreditNotePdf(id),
  });
}

// =============================================================================
// Visma Integration Hooks
// =============================================================================

/**
 * Sync sales documents to Visma mutation
 */
export function useSyncToVisma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SyncToVismaDTO) => economyService.syncToVisma(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.economy.salesDocuments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations.visma.status() });
    },
  });
}

/**
 * Check Visma sync status for a specific sales document
 */
export function useVismaInvoiceStatus(salesDocumentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.economy.salesDocuments.vismaStatus(salesDocumentId),
    queryFn: () => economyService.checkVismaStatus(salesDocumentId),
    enabled: !!salesDocumentId && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000, // 2 minutes - Visma sync status
  });
}

// =============================================================================
// Export Hooks
// =============================================================================

/**
 * Export economy data mutation
 */
export function useExportEconomy() {
  return useMutation({
    mutationFn: (params: EconomyExportParams) => economyService.export(params),
  });
}

// =============================================================================
// Statistics Hooks
// =============================================================================

/**
 * Get economy statistics
 */
export function useEconomyStatistics(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.economy.statistics(params),
    queryFn: () => economyService.getStatistics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - economy statistics
  });
}
