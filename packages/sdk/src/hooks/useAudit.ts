/**
 * Audit Hooks
 * React Query hooks for audit log operations
 */

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, getAuditEvent } from '../services/api';
import type { AuditQueryParams } from '../types/api';

// Query keys for cache management
export const auditKeys = {
  all: ['audit'] as const,
  list: (params?: AuditQueryParams) => [...auditKeys.all, 'list', params] as const,
  detail: (id: string) => [...auditKeys.all, 'detail', id] as const,
};

/**
 * Get audit logs
 */
export function useAuditLogs(params?: AuditQueryParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogs(params),
  });
}

/**
 * Get a single audit event
 */
export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => getAuditEvent(id),
    enabled: !!id,
  });
}
