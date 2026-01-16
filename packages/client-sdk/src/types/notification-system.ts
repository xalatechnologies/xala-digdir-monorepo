/**
 * Notification System Types
 * Types for the complete notification system
 */

// =============================================================================
// Enums and Constants
// =============================================================================

export type NotificationType =
  | 'request_received'
  | 'approved'
  | 'rejected'
  | 'request_more_info'
  | 'booking_changed'
  | 'cancelled'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'invoice_available'
  | 'payment_status'
  | 'system_alert'
  | 'custom';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

// =============================================================================
// Notification DTOs
// =============================================================================

export interface NotificationDTO {
  id: string;
  tenantId: string;
  userId: string;
  organizationId: string | null;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  dismissedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  total: number;
}

export interface NotificationCountResponse {
  count: number;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  last24Hours: number;
  last7Days: number;
}

// =============================================================================
// Template DTOs
// =============================================================================

export interface TemplateContent {
  subject?: string;
  body: string;
  title?: string;
}

export interface LocalizedTemplate {
  nb: TemplateContent;
  en: TemplateContent;
}

export interface NotificationTemplateDTO {
  id: string;
  tenantId: string | null;
  code: string;
  name: string;
  description: string | null;
  emailTemplate: LocalizedTemplate | null;
  smsTemplate: { nb: string; en: string } | null;
  pushTemplate: LocalizedTemplate | null;
  inAppTemplate: LocalizedTemplate | null;
  availableVariables: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDTO {
  code: string;
  name: string;
  description?: string;
  emailTemplate?: LocalizedTemplate;
  smsTemplate?: { nb: string; en: string };
  pushTemplate?: LocalizedTemplate;
  inAppTemplate?: LocalizedTemplate;
  availableVariables?: string[];
}

export interface UpdateTemplateDTO {
  name?: string;
  description?: string;
  emailTemplate?: LocalizedTemplate;
  smsTemplate?: { nb: string; en: string };
  pushTemplate?: LocalizedTemplate;
  inAppTemplate?: LocalizedTemplate;
  availableVariables?: string[];
  isActive?: boolean;
}

export interface TemplatePreviewRequest {
  variables: Record<string, string | number | boolean>;
  locale?: 'nb' | 'en';
}

export interface TemplatePreviewResponse {
  email?: { subject: string; body: string };
  sms?: { body: string };
  push?: { title: string; body: string };
  inApp?: { title: string; body: string };
}

// =============================================================================
// Send Notification DTOs
// =============================================================================

export interface SendNotificationDTO {
  userId: string;
  type: NotificationType | string;
  variables: Record<string, string | number | boolean>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledFor?: string;
}

export interface BroadcastNotificationDTO {
  userIds: string[];
  type: NotificationType | string;
  variables: Record<string, string | number | boolean>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
}

export interface SendNotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
}

export interface BroadcastNotificationResponse {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  results: Array<{ userId: string; success: boolean; error?: string }>;
}

// =============================================================================
// Channel Configuration
// =============================================================================

export interface AvailableChannelsResponse {
  channels: NotificationChannel[];
}

export interface RateLimitsResponse {
  email: { remaining: number; resetsAt: string };
  sms: { remaining: number; resetsAt: string };
  in_app: { remaining: number; resetsAt: string };
  push: { remaining: number; resetsAt: string };
}

// =============================================================================
// Query Parameters
// =============================================================================

export interface NotificationQueryParams {
  type?: NotificationType;
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
