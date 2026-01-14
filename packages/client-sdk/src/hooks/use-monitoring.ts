/**
 * Monitoring Hooks
 * React Query hooks for system health and monitoring operations
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { monitoringService } from '../services/monitoring.service';
import { queryKeys } from './query-keys';
import type {
  HealthStatus,
  ServiceHealth,
  SystemMetrics,
  LogEntry,
  LogQueryParams,
  Incident,
  PaginatedResponse,
} from '../services/monitoring.service';

// Re-export types for convenience
export type {
  HealthStatus,
  ServiceHealth,
  SystemMetrics,
  LogEntry,
  LogQueryParams,
  Incident,
  PaginatedResponse,
};

/**
 * Fetch system health status
 */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.monitoring.health(),
    queryFn: () => monitoringService.getHealth(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch system metrics
 */
export function useMetrics() {
  return useQuery({
    queryKey: queryKeys.monitoring.metrics(),
    queryFn: () => monitoringService.getMetrics(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch system logs with filtering
 */
export function useLogs(params: LogQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.monitoring.logs(params),
    queryFn: () => monitoringService.getLogs(params),
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Fetch active incidents
 */
export function useIncidents() {
  return useQuery({
    queryKey: queryKeys.monitoring.incidents(),
    queryFn: () => monitoringService.getIncidents(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch database statistics
 */
export function useDatabaseStats() {
  return useQuery({
    queryKey: queryKeys.monitoring.databaseStats(),
    queryFn: () => monitoringService.getDatabaseStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch API usage statistics
 */
export function useApiUsage(period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: queryKeys.monitoring.apiUsage(period),
    queryFn: () => monitoringService.getApiUsage(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Trigger health check (mutation)
 */
export function useTriggerHealthCheck() {
  return useMutation({
    mutationFn: () => monitoringService.triggerHealthCheck(),
  });
}
