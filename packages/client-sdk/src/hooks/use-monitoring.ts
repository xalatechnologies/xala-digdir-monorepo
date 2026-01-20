/**
 * Monitoring Hooks
 * React Query hooks for system monitoring and health operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringService } from '@/services/monitoring.service';
import type {
  HealthStatus,
  SystemMetrics,
  LogEntry,
  LogQueryParams,
  Incident,
} from '@/services/monitoring.service';
import { queryKeys } from './query-keys';

// Re-export types for convenience
export type { HealthStatus, SystemMetrics, LogEntry, LogQueryParams, Incident };

/**
 * Fetch system health status
 */
export function useHealthStatus() {
  return useQuery({
    queryKey: queryKeys.monitoring.health(),
    queryFn: () => monitoringService.getHealth(),
  });
}

/**
 * Fetch system metrics
 */
export function useSystemMetrics() {
  return useQuery({
    queryKey: queryKeys.monitoring.metrics(),
    queryFn: () => monitoringService.getMetrics(),
  });
}

/**
 * Fetch system logs with filtering and pagination
 */
export function useLogs(params: LogQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.monitoring.logs(params),
    queryFn: () => monitoringService.getLogs(params),
  });
}

/**
 * Fetch active incidents
 */
export function useIncidents() {
  return useQuery({
    queryKey: queryKeys.monitoring.incidents(),
    queryFn: () => monitoringService.getIncidents(),
  });
}

/**
 * Fetch database statistics
 */
export function useDatabaseStats() {
  return useQuery({
    queryKey: queryKeys.monitoring.databaseStats(),
    queryFn: () => monitoringService.getDatabaseStats(),
  });
}

/**
 * Fetch API usage statistics
 */
export function useApiUsage(period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: queryKeys.monitoring.apiUsage(period),
    queryFn: () => monitoringService.getApiUsage(period),
  });
}

/**
 * Trigger health check mutation
 */
export function useTriggerHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => monitoringService.triggerHealthCheck(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.monitoring.health() });
      queryClient.invalidateQueries({ queryKey: queryKeys.monitoring.metrics() });
    },
  });
}
