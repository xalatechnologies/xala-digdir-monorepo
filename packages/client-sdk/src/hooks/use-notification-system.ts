/**
 * Notification System Hooks
 * React Query hooks for the notification system
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationSystemService } from '../services/notification-system.service';
import type {
  NotificationQueryParams,
  SendNotificationDTO,
  BroadcastNotificationDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  TemplatePreviewRequest,
} from '../types/notification-system';

// Query keys
export const notificationSystemKeys = {
  all: ['notification-system'] as const,
  notifications: () => [...notificationSystemKeys.all, 'notifications'] as const,
  notificationList: (params?: NotificationQueryParams) =>
    [...notificationSystemKeys.notifications(), 'list', params] as const,
  notification: (id: string) => [...notificationSystemKeys.notifications(), id] as const,
  unreadCount: () => [...notificationSystemKeys.notifications(), 'count'] as const,
  stats: () => [...notificationSystemKeys.notifications(), 'stats'] as const,
  templates: () => [...notificationSystemKeys.all, 'templates'] as const,
  templateList: () => [...notificationSystemKeys.templates(), 'list'] as const,
  template: (code: string) => [...notificationSystemKeys.templates(), code] as const,
  channels: () => [...notificationSystemKeys.all, 'channels'] as const,
  rateLimits: () => [...notificationSystemKeys.all, 'rate-limits'] as const,
};

// =============================================================================
// User Notification Hooks
// =============================================================================

/**
 * Hook to get notifications for current user
 */
export function useNotifications(params: NotificationQueryParams = {}) {
  return useQuery({
    queryKey: notificationSystemKeys.notificationList(params),
    queryFn: () => notificationSystemService.getNotifications(params),
  });
}

/**
 * Hook to get a single notification
 */
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationSystemKeys.notification(id),
    queryFn: () => notificationSystemService.getNotification(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationSystemKeys.unreadCount(),
    queryFn: () => notificationSystemService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get notification statistics
 */
export function useNotificationStats() {
  return useQuery({
    queryKey: notificationSystemKeys.stats(),
    queryFn: () => notificationSystemService.getNotificationStats(),
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationSystemService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.stats() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationSystemService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.stats() });
    },
  });
}

/**
 * Hook to dismiss a notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationSystemService.dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.notifications() });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationSystemService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.stats() });
    },
  });
}

// =============================================================================
// Send Notification Hooks (Admin)
// =============================================================================

/**
 * Hook to send a notification to a user
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendNotificationDTO) => notificationSystemService.sendNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.notifications() });
    },
  });
}

/**
 * Hook to broadcast a notification to multiple users
 */
export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (data: BroadcastNotificationDTO) =>
      notificationSystemService.broadcastNotification(data),
  });
}

// =============================================================================
// Template Hooks
// =============================================================================

/**
 * Hook to get all notification templates
 */
export function useNotificationTemplates() {
  return useQuery({
    queryKey: notificationSystemKeys.templateList(),
    queryFn: () => notificationSystemService.getTemplates(),
  });
}

/**
 * Hook to get a template by code
 */
export function useNotificationTemplate(code: string) {
  return useQuery({
    queryKey: notificationSystemKeys.template(code),
    queryFn: () => notificationSystemService.getTemplate(code),
    enabled: Boolean(code),
  });
}

/**
 * Hook to create a template
 */
export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDTO) => notificationSystemService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.templates() });
    },
  });
}

/**
 * Hook to update a template
 */
export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDTO }) =>
      notificationSystemService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.templates() });
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationSystemService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSystemKeys.templates() });
    },
  });
}

/**
 * Hook to preview a template
 */
export function usePreviewNotificationTemplate() {
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: TemplatePreviewRequest }) =>
      notificationSystemService.previewTemplate(code, data),
  });
}

// =============================================================================
// Channel Configuration Hooks
// =============================================================================

/**
 * Hook to get available notification channels
 */
export function useAvailableNotificationChannels() {
  return useQuery({
    queryKey: notificationSystemKeys.channels(),
    queryFn: () => notificationSystemService.getAvailableChannels(),
  });
}

/**
 * Hook to get rate limits for all channels
 */
export function useNotificationRateLimits() {
  return useQuery({
    queryKey: notificationSystemKeys.rateLimits(),
    queryFn: () => notificationSystemService.getRateLimits(),
    refetchInterval: 60000, // Refetch every minute
  });
}
