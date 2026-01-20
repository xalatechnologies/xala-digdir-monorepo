/**
 * Billing Hooks
 * React Query hooks for user and organization billing (Minside portal)
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { billingService, orgBillingService } from '@/services/billing.service';
import type { InvoiceQueryParams } from '@/services/billing.service';

// =============================================================================
// Query Keys
// =============================================================================

export const billingKeys = {
  all: ['billing'] as const,
  summary: (params?: { period?: string }) => [...billingKeys.all, 'summary', params] as const,
  invoices: {
    all: () => [...billingKeys.all, 'invoices'] as const,
    list: (params?: InvoiceQueryParams) => [...billingKeys.invoices.all(), 'list', params] as const,
    detail: (id: string) => [...billingKeys.invoices.all(), 'detail', id] as const,
  },
  org: (orgId: string) => ({
    all: [...billingKeys.all, 'org', orgId] as const,
    summary: (params?: { period?: string }) => [...billingKeys.org(orgId).all, 'summary', params] as const,
    invoices: {
      list: (params?: InvoiceQueryParams) => [...billingKeys.org(orgId).all, 'invoices', 'list', params] as const,
      detail: (invoiceId: string) => [...billingKeys.org(orgId).all, 'invoices', 'detail', invoiceId] as const,
    },
  }),
};

// =============================================================================
// User Billing Hooks
// =============================================================================

/**
 * Get user's billing summary
 */
export function useBillingSummary(params?: { period?: string }) {
  return useQuery({
    queryKey: billingKeys.summary(params),
    queryFn: () => billingService.getSummary(params),
  });
}

/**
 * Get user's invoices
 */
export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: billingKeys.invoices.list(params),
    queryFn: () => billingService.listInvoices(params),
  });
}

/**
 * Get single invoice by ID
 */
export function useInvoice(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.invoices.detail(id),
    queryFn: () => billingService.getInvoice(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Download invoice as PDF (returns blob)
 */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (id: string) => billingService.downloadInvoice(id),
  });
}

/**
 * Get temporary download URL for invoice
 */
export function useInvoiceDownloadUrl(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...billingKeys.invoices.detail(id), 'url'] as const,
    queryFn: () => billingService.getInvoiceDownloadUrl(id),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 60 * 1000, // URL valid for 1 minute
  });
}

// =============================================================================
// Organization Billing Hooks
// =============================================================================

/**
 * Get organization's billing summary
 */
export function useOrgBillingSummary(orgId: string, params?: { period?: string }) {
  return useQuery({
    queryKey: billingKeys.org(orgId).summary(params),
    queryFn: () => orgBillingService.getSummary(orgId, params),
    enabled: !!orgId,
  });
}

/**
 * Get organization's invoices
 */
export function useOrgInvoices(orgId: string, params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: billingKeys.org(orgId).invoices.list(params),
    queryFn: () => orgBillingService.listInvoices(orgId, params),
    enabled: !!orgId,
  });
}

/**
 * Get single organization invoice
 */
export function useOrgInvoice(orgId: string, invoiceId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: billingKeys.org(orgId).invoices.detail(invoiceId),
    queryFn: () => orgBillingService.getInvoice(orgId, invoiceId),
    enabled: !!orgId && !!invoiceId && (options?.enabled ?? true),
  });
}

/**
 * Download organization invoice as PDF
 */
export function useDownloadOrgInvoice() {
  return useMutation({
    mutationFn: ({ orgId, invoiceId }: { orgId: string; invoiceId: string }) => 
      orgBillingService.downloadInvoice(orgId, invoiceId),
  });
}
