/**
 * Notification System Types
 * Type definitions for the notification system
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

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

// =============================================================================
// Template Types
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

export interface ChannelTemplates {
  email?: LocalizedTemplate;
  sms?: { nb: string; en: string };
  push?: LocalizedTemplate;
  in_app?: LocalizedTemplate;
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateNotificationDTO {
  tenantId: string;
  userId: string;
  organizationId?: string;
  type: NotificationType;
  channels: NotificationChannel[];
  templateVariables: Record<string, string | number | boolean>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  priority?: NotificationPriority;
  scheduledFor?: Date;
}

export interface SendNotificationDTO {
  tenantId: string;
  userId: string;
  organizationId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  channels: NotificationChannel[];
}

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

export interface NotificationQueryParams {
  userId?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MarkNotificationReadDTO {
  notificationId: string;
  userId: string;
}

// =============================================================================
// Template DTOs
// =============================================================================

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
  tenantId?: string;
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

// =============================================================================
// Delivery Log Types
// =============================================================================

export interface DeliveryLogDTO {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  recipientAddress: string | null;
  providerMessageId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

// =============================================================================
// Channel Handler Interfaces
// =============================================================================

export interface ChannelSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
}

export interface SMSPayload {
  to: string;
  message: string;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

export interface InAppPayload {
  userId: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Provider Config Types
// =============================================================================

export interface EmailProviderConfigDTO {
  id: string;
  tenantId: string;
  provider: string;
  isActive: boolean;
  fromEmail: string;
  fromName: string | null;
  replyToEmail: string | null;
  dailyLimit: number;
  monthlyLimit: number;
  dailyCount: number;
  monthlyCount: number;
}

export interface SMSProviderConfigDTO {
  id: string;
  tenantId: string;
  provider: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  dailyCount: number;
  monthlyCount: number;
}

// =============================================================================
// Statistics Types
// =============================================================================

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  last24Hours: number;
  last7Days: number;
}

export interface DeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  byChannel: Record<NotificationChannel, { sent: number; delivered: number; failed: number }>;
}
