/**
 * Security Dashboard Hooks
 * Single Responsibility: React Query hooks for security metrics and compliance monitoring
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { securityService } from '../services/security.service';
import type {
  FailedLoginQueryParams,
  DataExportQueryParams,
} from '../services/security.service';

/**
 * Get security dashboard metrics
 * Returns audit trail completeness, failed logins, data exports, and security events
 */
export function useSecurityMetrics() {
  return useQuery({
    queryKey: queryKeys.security.metrics(),
    queryFn: () => securityService.getMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute - security metrics should be relatively fresh
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Get GDPR consent status summary
 * Returns total users, users with consent, users without consent, and percentage
 */
export function useGdprStatus() {
  return useQuery({
    queryKey: queryKeys.security.gdprStatus(),
    queryFn: () => securityService.getGdprStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes - GDPR status changes slowly
  });
}

/**
 * Get failed login attempts with optional filtering
 * Returns paginated list of failed login attempts from audit logs
 */
export function useFailedLogins(params?: FailedLoginQueryParams) {
  return useQuery({
    queryKey: queryKeys.security.failedLogins.list(params),
    queryFn: () => securityService.getFailedLogins(params),
    staleTime: 30 * 1000, // 30 seconds - security events should be fresh
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
}

/**
 * Get data export tracking with optional filtering
 * Returns paginated list of data export events from audit logs with user info
 */
export function useDataExports(params?: DataExportQueryParams) {
  return useQuery({
    queryKey: queryKeys.security.dataExports.list(params),
    queryFn: () => securityService.getDataExports(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get failed login attempts for a specific user
 * Convenience hook for filtering by user ID
 */
export function useFailedLoginsByUser(
  userId: string,
  params?: Omit<FailedLoginQueryParams, 'userId'>
) {
  return useQuery({
    queryKey: queryKeys.security.failedLogins.byUser(userId, params),
    queryFn: () => securityService.getFailedLoginsByUser(userId, params),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!userId, // Only run query if userId is provided
  });
}

/**
 * Get data export events for a specific user
 * Convenience hook for filtering by user ID
 */
export function useDataExportsByUser(
  userId: string,
  params?: Omit<DataExportQueryParams, 'userId'>
) {
  return useQuery({
    queryKey: queryKeys.security.dataExports.byUser(userId, params),
    queryFn: () => securityService.getDataExportsByUser(userId, params),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!userId, // Only run query if userId is provided
  });
}
