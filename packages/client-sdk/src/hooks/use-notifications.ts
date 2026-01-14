/**
 * Notification Hooks
 * React hooks for managing in-app notifications and notification actions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { notificationService } from '../services/notification.service';
import type { NotificationQueryParams } from '../services/notification.service';

// ============================================================================
// Notification Query Hooks
// ============================================================================

/**
 * Get all notifications (admin only)
 */
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationService.getAll(params),
  });
}

/**
 * Get current user's notifications
 * Returns paginated list of notifications for the authenticated user
 */
export function useMyNotifications(params?: Omit<NotificationQueryParams, 'userId'>) {
  return useQuery({
    queryKey: queryKeys.notifications.my(params),
    queryFn: () => notificationService.getMyNotifications(params),
  });
}

/**
 * Get unread notification count
 * Returns the count of unread notifications for the current user
 */
export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
  });
}

/**
 * Get notification templates (admin only)
 */
export function useNotificationTemplates() {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'templates'] as const,
    queryFn: () => notificationService.getTemplates(),
  });
}

// ============================================================================
// Notification Mutation Hooks
// ============================================================================

/**
 * Mark a notification as read
 * Updates a single notification's read status
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mark all notifications as read
 * Updates all notifications for the current user to read status
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Delete a notification
 * Removes a notification from the user's list
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
