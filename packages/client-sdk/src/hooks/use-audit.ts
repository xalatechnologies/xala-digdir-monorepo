/**
 * Audit Hooks
 * React Query hooks for audit log operations
 */
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import type { AuditLogEntry, AuditQueryParams as ServiceAuditQueryParams } from '../services/audit.service';
import type { AuditQueryParams } from '../types/additional';
import { queryKeys } from './query-keys';

// Re-export the AuditLogEntry type as AuditEvent for backwards compatibility
export type { AuditLogEntry };

// Export as AuditEvent alias
export type AuditEvent = AuditLogEntry;

// Re-export AuditQueryParams from types
export type { AuditQueryParams } from '../types/additional';

// Re-export AuditStats from service
export type { AuditStats } from '../services/audit.service';

/**
 * Fetch paginated audit logs with filtering
 */
export function useAuditLog(params: AuditQueryParams = {}) {
  // Convert to service params
  const serviceParams: ServiceAuditQueryParams = {
    ...params,
  };

  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => auditService.getAll(serviceParams),
  });
}

/**
 * Fetch a single audit event by ID
 */
export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.audit.detail(id),
    queryFn: () => auditService.getById(id),
    enabled: !!id,
  });
}

/**
 * Fetch audit statistics
 */
export function useAuditStats() {
  return useQuery({
    queryKey: queryKeys.audit.stats(),
    queryFn: () => auditService.getStats(),
  });
}

/**
 * Fetch audit logs for a specific resource type
 */
export function useResourceAudit(resource: string, params: Omit<AuditQueryParams, 'resource'> = {}) {
  return useQuery({
    queryKey: queryKeys.audit.resource(resource, params),
    queryFn: () => auditService.getByResource(resource, params),
    enabled: !!resource,
  });
}

/**
 * Fetch audit logs for a specific user
 */
export function useUserAudit(userId: string, params: Omit<AuditQueryParams, 'userId'> = {}) {
  return useQuery({
    queryKey: queryKeys.audit.user(userId, params),
    queryFn: () => auditService.getByUser(userId, params),
    enabled: !!userId,
  });
}
