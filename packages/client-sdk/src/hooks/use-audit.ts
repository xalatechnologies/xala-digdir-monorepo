/**
 * Audit Hooks
 * Single Responsibility: React Query hooks for audit trail
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { auditService } from '../services/audit.service';
import type { AuditQueryParams } from '../types/additional';

// ============================================================================
// General Audit Hooks
// ============================================================================

/**
 * Get paginated audit events
 */
export function useAuditLog(params?: AuditQueryParams) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => auditService.getAll(params),
  });
}

/**
 * Get single audit event by ID
 */
export function useAuditEvent(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.audit.detail(id),
    queryFn: () => auditService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Infinite scroll audit events
 */
export function useInfiniteAuditLog(params?: Omit<AuditQueryParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.audit.list(params), 'infinite'],
    queryFn: ({ pageParam = 1 }) => auditService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

// ============================================================================
// Resource-Specific Audit Hooks
// ============================================================================

/**
 * Get audit trail for a specific listing
 */
export function useListingAudit(
  listingId: string,
  params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.audit.list({ resource: 'listing', resourceId: listingId, ...params })],
    queryFn: () => auditService.getListingAudit(listingId, params),
    enabled: !!listingId && (options?.enabled ?? true),
  });
}

/**
 * Get audit trail for a specific booking
 */
export function useBookingAudit(
  bookingId: string,
  params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.audit.list({ resource: 'booking', resourceId: bookingId, ...params })],
    queryFn: () => auditService.getBookingAudit(bookingId, params),
    enabled: !!bookingId && (options?.enabled ?? true),
  });
}

/**
 * Get audit trail for a specific organization
 */
export function useOrganizationAudit(
  organizationId: string,
  params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.audit.list({ resource: 'organization', resourceId: organizationId, ...params })],
    queryFn: () => auditService.getOrganizationAudit(organizationId, params),
    enabled: !!organizationId && (options?.enabled ?? true),
  });
}

/**
 * Get audit trail for a specific user
 */
export function useUserAudit(
  userId: string,
  params?: Omit<AuditQueryParams, 'resource' | 'resourceId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.audit.list({ resource: 'user', resourceId: userId, ...params })],
    queryFn: () => auditService.getUserAudit(userId, params),
    enabled: !!userId && (options?.enabled ?? true),
  });
}

/**
 * Get audit events performed by a specific user (actor)
 */
export function useActorAudit(
  actorUserId: string,
  params?: Omit<AuditQueryParams, 'userId'>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...queryKeys.audit.list({ userId: actorUserId, ...params })],
    queryFn: () => auditService.getByActor(actorUserId, params),
    enabled: !!actorUserId && (options?.enabled ?? true),
  });
}

// ============================================================================
// Infinite Scroll Resource-Specific Hooks
// ============================================================================

/**
 * Infinite scroll audit trail for a listing
 */
export function useInfiniteListingAudit(
  listingId: string,
  params?: Omit<AuditQueryParams, 'resource' | 'resourceId' | 'page'>,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.audit.list({ resource: 'listing', resourceId: listingId, ...params }), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      auditService.getListingAudit(listingId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!listingId && (options?.enabled ?? true),
  });
}
