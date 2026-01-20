/**
 * Scanner Hooks
 * React Query hooks for code quality and compliance scanners
 * Used by saas-admin Monitoring page
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  scannerService,
  type ScannerType,
} from '@/services/scanner.service';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get scanner status
 */
export function useScannerStatus(scanner: ScannerType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.scanners.status(scanner),
    queryFn: () => scannerService.getStatus(scanner),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get last result for a scanner
 */
export function useScannerLastResult(scanner: ScannerType, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.scanners.lastResult(scanner),
    queryFn: () => scannerService.getLastResult(scanner),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get all scanner statuses
 */
export function useAllScannerStatuses() {
  return useQuery({
    queryKey: queryKeys.scanners.allStatuses(),
    queryFn: () => scannerService.getAllStatuses(),
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Run a scanner
 */
export function useRunScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scanner: ScannerType) => scannerService.run(scanner),
    onSuccess: (_, scanner) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.status(scanner) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.lastResult(scanner) });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.allStatuses() });
    },
  });
}

/**
 * Run i18n scanner
 */
export function useRunI18nScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scannerService.runI18n(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.status('i18n') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.lastResult('i18n') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.allStatuses() });
    },
  });
}

/**
 * Run design system scanner
 */
export function useRunDesignSystemScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scannerService.runDesignSystem(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.status('design-system') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.lastResult('design-system') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.allStatuses() });
    },
  });
}

/**
 * Run WCAG accessibility scanner
 */
export function useRunWcagScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scannerService.runWcag(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.status('wcag') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.lastResult('wcag') });
      queryClient.invalidateQueries({ queryKey: queryKeys.scanners.allStatuses() });
    },
  });
}

// Re-export types for convenience
export type { ScannerType };
