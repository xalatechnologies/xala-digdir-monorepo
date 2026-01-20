/**
 * Extended Monitoring Hooks
 * React Query hooks for monitoring data
 */
import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { monitoringExtendedService } from '@/services/monitoring-extended.service';
import type {
  MonitoringOverviewDTO,
  IncidentDTO,
  IncidentListResponseDTO,
  IncidentFilterDTO,
  CreateIncidentDTO,
  UpdateIncidentDTO,
  AcknowledgeIncidentDTO,
  ResolveIncidentDTO,
  SyntheticMonitorDTO,
  SyntheticMonitorListResponseDTO,
  SyntheticRunListResponseDTO,
  CreateSyntheticMonitorDTO,
  UpdateSyntheticMonitorDTO,
  GrafanaDashboardListDTO,
  GrafanaDashboardDTO,
  GrafanaQueryRequestDTO,
  GrafanaQueryResponseDTO,
  LogListResponseDTO,
  LogFilterDTO,
  LogStatisticsDTO,
  AuditListResponseDTO,
  AuditFilterDTO,
  AuditCorrelationDTO,
  AuditStatisticsDTO,
} from '@xala/contracts';

// ==================== Query Keys ====================

export const monitoringKeys = {
  all: ['monitoring'] as const,
  overview: (tenantId?: string) => [...monitoringKeys.all, 'overview', tenantId] as const,
  incidents: {
    all: () => [...monitoringKeys.all, 'incidents'] as const,
    lists: () => [...monitoringKeys.incidents.all(), 'list'] as const,
    list: (filter?: IncidentFilterDTO) => [...monitoringKeys.incidents.lists(), filter] as const,
    details: () => [...monitoringKeys.incidents.all(), 'detail'] as const,
    detail: (id: string) => [...monitoringKeys.incidents.details(), id] as const,
  },
  synthetics: {
    all: () => [...monitoringKeys.all, 'synthetics'] as const,
    lists: () => [...monitoringKeys.synthetics.all(), 'list'] as const,
    list: (tenantId?: string) => [...monitoringKeys.synthetics.lists(), tenantId] as const,
    details: () => [...monitoringKeys.synthetics.all(), 'detail'] as const,
    detail: (id: string) => [...monitoringKeys.synthetics.details(), id] as const,
    runs: (id: string) => [...monitoringKeys.synthetics.detail(id), 'runs'] as const,
  },
  grafana: {
    all: () => [...monitoringKeys.all, 'grafana'] as const,
    dashboards: (search?: string) => [...monitoringKeys.grafana.all(), 'dashboards', search] as const,
    dashboard: (uid: string) => [...monitoringKeys.grafana.all(), 'dashboard', uid] as const,
  },
  logs: {
    all: () => [...monitoringKeys.all, 'logs'] as const,
    lists: () => [...monitoringKeys.logs.all(), 'list'] as const,
    list: (filter?: LogFilterDTO) => [...monitoringKeys.logs.lists(), filter] as const,
    statistics: (startDate?: string, endDate?: string) => [...monitoringKeys.logs.all(), 'statistics', startDate, endDate] as const,
  },
  audit: {
    all: () => [...monitoringKeys.all, 'audit'] as const,
    lists: () => [...monitoringKeys.audit.all(), 'list'] as const,
    list: (filter?: AuditFilterDTO) => [...monitoringKeys.audit.lists(), filter] as const,
    correlation: (id: string) => [...monitoringKeys.audit.all(), 'correlation', id] as const,
    statistics: (startDate?: string, endDate?: string) => [...monitoringKeys.audit.all(), 'statistics', startDate, endDate] as const,
  },
} as const;

// ==================== Overview ====================

export function useMonitoringOverview(
  tenantId?: string,
  options?: Omit<UseQueryOptions<MonitoringOverviewDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.overview(tenantId),
    queryFn: () => monitoringExtendedService.getOverview(tenantId),
    ...options,
  });
}

// ==================== Incidents ====================

export function useIncidents(
  filter?: IncidentFilterDTO,
  options?: Omit<UseQueryOptions<IncidentListResponseDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.incidents.list(filter),
    queryFn: () => monitoringExtendedService.getIncidents(filter),
    ...options,
  });
}

export function useIncident(
  id: string,
  options?: Omit<UseQueryOptions<IncidentDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.incidents.detail(id),
    queryFn: () => monitoringExtendedService.getIncident(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateIncident(
  options?: UseMutationOptions<IncidentDTO, Error, CreateIncidentDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncidentDTO) => monitoringExtendedService.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.lists() });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.overview() });
    },
    ...options,
  });
}

export function useUpdateIncident(
  options?: UseMutationOptions<IncidentDTO, Error, { id: string; data: UpdateIncidentDTO }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => monitoringExtendedService.updateIncident(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.detail(id) });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.lists() });
    },
    ...options,
  });
}

export function useAcknowledgeIncident(
  options?: UseMutationOptions<IncidentDTO, Error, { id: string; data: AcknowledgeIncidentDTO }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => monitoringExtendedService.acknowledgeIncident(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.detail(id) });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.lists() });
    },
    ...options,
  });
}

export function useResolveIncident(
  options?: UseMutationOptions<IncidentDTO, Error, { id: string; data: ResolveIncidentDTO }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => monitoringExtendedService.resolveIncident(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.detail(id) });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.incidents.lists() });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.overview() });
    },
    ...options,
  });
}

// ==================== Synthetic Monitors ====================

export function useSyntheticMonitors(
  tenantId?: string,
  options?: Omit<UseQueryOptions<SyntheticMonitorListResponseDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.synthetics.list(tenantId),
    queryFn: () => monitoringExtendedService.getSyntheticMonitors(tenantId),
    ...options,
  });
}

export function useSyntheticMonitor(
  id: string,
  options?: Omit<UseQueryOptions<SyntheticMonitorDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.synthetics.detail(id),
    queryFn: () => monitoringExtendedService.getSyntheticMonitor(id),
    enabled: !!id,
    ...options,
  });
}

export function useSyntheticRuns(
  monitorId: string,
  limit = 50,
  options?: Omit<UseQueryOptions<SyntheticRunListResponseDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.synthetics.runs(monitorId),
    queryFn: () => monitoringExtendedService.getSyntheticRuns(monitorId, limit),
    enabled: !!monitorId,
    ...options,
  });
}

export function useCreateSyntheticMonitor(
  options?: UseMutationOptions<SyntheticMonitorDTO, Error, CreateSyntheticMonitorDTO>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSyntheticMonitorDTO) => monitoringExtendedService.createSyntheticMonitor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.synthetics.lists() });
    },
    ...options,
  });
}

export function useUpdateSyntheticMonitor(
  options?: UseMutationOptions<SyntheticMonitorDTO, Error, { id: string; data: UpdateSyntheticMonitorDTO }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => monitoringExtendedService.updateSyntheticMonitor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.synthetics.detail(id) });
      queryClient.invalidateQueries({ queryKey: monitoringKeys.synthetics.lists() });
    },
    ...options,
  });
}

export function useDeleteSyntheticMonitor(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => monitoringExtendedService.deleteSyntheticMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.synthetics.lists() });
    },
    ...options,
  });
}

export function useTriggerSyntheticRun(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => monitoringExtendedService.triggerSyntheticRun(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: monitoringKeys.synthetics.runs(id) });
    },
    ...options,
  });
}

// ==================== Grafana ====================

export function useGrafanaDashboards(
  search?: string,
  options?: Omit<UseQueryOptions<GrafanaDashboardListDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.grafana.dashboards(search),
    queryFn: () => monitoringExtendedService.getGrafanaDashboards(search),
    ...options,
  });
}

export function useGrafanaDashboard(
  uid: string,
  options?: Omit<UseQueryOptions<GrafanaDashboardDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.grafana.dashboard(uid),
    queryFn: () => monitoringExtendedService.getGrafanaDashboard(uid),
    enabled: !!uid,
    ...options,
  });
}

export function useQueryGrafanaPanel(
  options?: UseMutationOptions<GrafanaQueryResponseDTO, Error, GrafanaQueryRequestDTO>
) {
  return useMutation({
    mutationFn: (request: GrafanaQueryRequestDTO) => monitoringExtendedService.queryGrafanaPanel(request),
    ...options,
  });
}

// ==================== Logs ====================

export function useLogs(
  filter?: LogFilterDTO,
  options?: Omit<UseQueryOptions<LogListResponseDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.logs.list(filter),
    queryFn: () => monitoringExtendedService.getLogs(filter),
    ...options,
  });
}

export function useLogStatistics(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<LogStatisticsDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.logs.statistics(startDate, endDate),
    queryFn: () => monitoringExtendedService.getLogStatistics(startDate, endDate),
    ...options,
  });
}

// ==================== Audit ====================

export function useAuditEvents(
  filter?: AuditFilterDTO,
  options?: Omit<UseQueryOptions<AuditListResponseDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.audit.list(filter),
    queryFn: () => monitoringExtendedService.getAuditEvents(filter),
    ...options,
  });
}

export function useAuditCorrelation(
  correlationId: string,
  options?: Omit<UseQueryOptions<AuditCorrelationDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.audit.correlation(correlationId),
    queryFn: () => monitoringExtendedService.getAuditCorrelation(correlationId),
    enabled: !!correlationId,
    ...options,
  });
}

export function useAuditStatistics(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions<AuditStatisticsDTO>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: monitoringKeys.audit.statistics(startDate, endDate),
    queryFn: () => monitoringExtendedService.getAuditStatistics(startDate, endDate),
    ...options,
  });
}
