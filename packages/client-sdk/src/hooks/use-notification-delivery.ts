/**
 * Notification Delivery Hooks
 * React hooks for managing notification delivery status and retry operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { notificationService } from '../services/notification.service';
import type { DeliveryReportQueryParams } from '../services/notification.service';

// ============================================================================
// Delivery Query Hooks
// ============================================================================

/**
 * Get delivery status for a specific notification
 * Returns notification details with all delivery attempts
 */
export function useDeliveryStatus(id: string) {
  return useQuery({
    queryKey: queryKeys.notifications.deliveryStatus(id),
    queryFn: () => notificationService.getDeliveryStatus(id),
    enabled: !!id,
  });
}

/**
 * Get delivery reports with filtering
 * Returns paginated list of notifications with delivery status (admin only)
 */
export function useDeliveryReports(params?: DeliveryReportQueryParams) {
  return useQuery({
    queryKey: queryKeys.notifications.deliveryReports(params),
    queryFn: () => notificationService.getDeliveryReports(params),
  });
}

// ============================================================================
// Delivery Mutation Hooks
// ============================================================================

/**
 * Retry failed notifications
 * Triggers retry for all failed notifications ready for retry
 */
export function useRetryFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.retryFailed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
