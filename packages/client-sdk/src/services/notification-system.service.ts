/**
 * Notification System Service
 * SDK service for interacting with the notification system API
 */
import { getClient } from '../core/client-factory';
import type { IHttpClient } from '../core/http-client.interface';
import type {
  NotificationDTO,
  NotificationListResponse,
  NotificationCountResponse,
  NotificationStatsResponse,
  NotificationQueryParams,
  NotificationTemplateDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
  SendNotificationDTO,
  SendNotificationResponse,
  BroadcastNotificationDTO,
  BroadcastNotificationResponse,
  AvailableChannelsResponse,
  RateLimitsResponse,
} from '../types/notification-system';

const NOTIFICATIONS_BASE = '/api/notifications';
const TEMPLATES_BASE = '/api/notification-templates';

function getApiClient(): IHttpClient {
  return getClient();
}

// =============================================================================
// User Notifications
// =============================================================================

/**
 * Get notifications for current user
 */
export async function getNotifications(
  params: NotificationQueryParams = {}
): Promise<NotificationListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.set('type', params.type);
  if (params.priority) queryParams.set('priority', params.priority);
  if (params.unreadOnly !== undefined) queryParams.set('unreadOnly', String(params.unreadOnly));
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit));
  if (params.offset !== undefined) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  const url = queryString ? `${NOTIFICATIONS_BASE}?${queryString}` : NOTIFICATIONS_BASE;
  
  return getApiClient().get<NotificationListResponse>(url);
}

/**
 * Get a single notification by ID
 */
export async function getNotification(id: string): Promise<NotificationDTO> {
  return getApiClient().get<NotificationDTO>(`${NOTIFICATIONS_BASE}/${id}`);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<NotificationCountResponse> {
  return getApiClient().get<NotificationCountResponse>(`${NOTIFICATIONS_BASE}/count`);
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<NotificationStatsResponse> {
  return getApiClient().get<NotificationStatsResponse>(`${NOTIFICATIONS_BASE}/stats`);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string): Promise<{ success: boolean }> {
  return getApiClient().put<{ success: boolean }>(`${NOTIFICATIONS_BASE}/${id}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; count: number }> {
  return getApiClient().put<{ success: boolean; count: number }>(`${NOTIFICATIONS_BASE}/read-all`);
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(id: string): Promise<{ success: boolean }> {
  return getApiClient().put<{ success: boolean }>(`${NOTIFICATIONS_BASE}/${id}/dismiss`);
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  return getApiClient().delete(`${NOTIFICATIONS_BASE}/${id}`);
}

// =============================================================================
// Send Notifications (Admin)
// =============================================================================

/**
 * Send a notification to a user
 */
export async function sendNotification(
  data: SendNotificationDTO
): Promise<SendNotificationResponse> {
  return getApiClient().post<SendNotificationResponse>(`${NOTIFICATIONS_BASE}/send`, data);
}

/**
 * Broadcast a notification to multiple users
 */
export async function broadcastNotification(
  data: BroadcastNotificationDTO
): Promise<BroadcastNotificationResponse> {
  return getApiClient().post<BroadcastNotificationResponse>(`${NOTIFICATIONS_BASE}/broadcast`, data);
}

// =============================================================================
// Templates
// =============================================================================

/**
 * Get all notification templates
 */
export async function getTemplates(): Promise<{ templates: NotificationTemplateDTO[] }> {
  return getApiClient().get<{ templates: NotificationTemplateDTO[] }>(TEMPLATES_BASE);
}

/**
 * Get a template by code
 */
export async function getTemplate(code: string): Promise<NotificationTemplateDTO> {
  return getApiClient().get<NotificationTemplateDTO>(`${TEMPLATES_BASE}/${code}`);
}

/**
 * Create a new template
 */
export async function createTemplate(data: CreateTemplateDTO): Promise<NotificationTemplateDTO> {
  return getApiClient().post<NotificationTemplateDTO>(TEMPLATES_BASE, data);
}

/**
 * Update a template
 */
export async function updateTemplate(
  id: string,
  data: UpdateTemplateDTO
): Promise<NotificationTemplateDTO> {
  return getApiClient().put<NotificationTemplateDTO>(`${TEMPLATES_BASE}/${id}`, data);
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<void> {
  return getApiClient().delete(`${TEMPLATES_BASE}/${id}`);
}

/**
 * Preview a template with variables
 */
export async function previewTemplate(
  code: string,
  data: TemplatePreviewRequest
): Promise<TemplatePreviewResponse> {
  return getApiClient().post<TemplatePreviewResponse>(`${TEMPLATES_BASE}/${code}/preview`, data);
}

// =============================================================================
// Channel Configuration
// =============================================================================

/**
 * Get available notification channels for the tenant
 */
export async function getAvailableChannels(): Promise<AvailableChannelsResponse> {
  return getApiClient().get<AvailableChannelsResponse>(`${NOTIFICATIONS_BASE}/channels`);
}

/**
 * Get rate limits for all channels
 */
export async function getRateLimits(): Promise<RateLimitsResponse> {
  return getApiClient().get<RateLimitsResponse>(`${NOTIFICATIONS_BASE}/rate-limits`);
}

// =============================================================================
// Export all as notificationSystemService
// =============================================================================

export const notificationSystemService = {
  // User notifications
  getNotifications,
  getNotification,
  getUnreadCount,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  deleteNotification,
  
  // Send notifications
  sendNotification,
  broadcastNotification,
  
  // Templates
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  
  // Channel configuration
  getAvailableChannels,
  getRateLimits,
};
