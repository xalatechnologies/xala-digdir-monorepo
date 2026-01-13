/**
 * Reports & Analytics Hooks
 * React Query hooks for reports and dashboard endpoints
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getUsageReport,
  getRevenueReport,
  getBookingStats,
  getOrganizationReport,
  getDashboardKPIs,
  exportReport,
} from '../services/api';
import type {
  UsageReport,
  RevenueReport,
  BookingStats,
  OrganizationReport,
  DashboardKPIs,
  ReportQueryParams,
  SingleResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const reportKeys = {
  all: ['reports'] as const,
  dashboard: () => [...reportKeys.all, 'dashboard'] as const,
  kpis: () => [...reportKeys.dashboard(), 'kpis'] as const,
  usage: (params: Omit<ReportQueryParams, 'type'>) => [...reportKeys.all, 'usage', params] as const,
  revenue: (params: Omit<ReportQueryParams, 'type'>) => [...reportKeys.all, 'revenue', params] as const,
  bookings: (params: Omit<ReportQueryParams, 'type'>) => [...reportKeys.all, 'bookings', params] as const,
  organizations: (params?: { startDate?: string; endDate?: string }) => [...reportKeys.all, 'organizations', params] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch dashboard KPIs
 */
export function useDashboardKPIs() {
  return useQuery<SingleResponse<DashboardKPIs>>({
    queryKey: reportKeys.kpis(),
    queryFn: () => getDashboardKPIs(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

/**
 * Fetch usage report
 */
export function useUsageReport(params: Omit<ReportQueryParams, 'type'>) {
  return useQuery<{ data: UsageReport[] }>({
    queryKey: reportKeys.usage(params),
    queryFn: () => getUsageReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch revenue report
 */
export function useRevenueReport(params: Omit<ReportQueryParams, 'type'>) {
  return useQuery<SingleResponse<RevenueReport>>({
    queryKey: reportKeys.revenue(params),
    queryFn: () => getRevenueReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch booking statistics
 */
export function useBookingStats(params: Omit<ReportQueryParams, 'type'>) {
  return useQuery<{ data: BookingStats[] }>({
    queryKey: reportKeys.bookings(params),
    queryFn: () => getBookingStats(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fetch organization activity report
 */
export function useOrganizationReport(params?: { startDate?: string; endDate?: string }) {
  return useQuery<{ data: OrganizationReport[] }>({
    queryKey: reportKeys.organizations(params),
    queryFn: () => getOrganizationReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Export a report to file
 */
export function useExportReport() {
  return useMutation({
    mutationFn: async (params: ReportQueryParams & { format: 'pdf' | 'excel' | 'csv' }) => {
      const blob = await exportReport(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const extension = params.format === 'excel' ? 'xlsx' : params.format;
      link.download = `report-${params.type}-${params.startDate}-${params.endDate}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
  });
}
