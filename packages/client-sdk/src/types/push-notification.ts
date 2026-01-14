/**
 * Push Notification Types
 * Single Responsibility: All push notification and notification preference type definitions
 */

import type { BaseEntity, TenantEntity } from './enums';

// =============================================================================
// Push Notification Permission States
// =============================================================================

/**
 * Browser push notification permission states
 * Maps to standard Notification API permission values
 */
export type PushPermissionState = 'default' | 'granted' | 'denied';

/**
 * Notification types for booking-related events
 */
export type BookingNotificationType =
  | 'booking_confirmed'
  | 'booking_reminder_24h'
  | 'booking_reminder_1h'
  | 'booking_cancelled'
  | 'booking_modified'
  | 'booking_upcoming'
  | 'booking_completed';

// =============================================================================
// Push Subscription Entity
// =============================================================================

/**
 * Push subscription data stored for a user device
 * Used to send browser push notifications via web push protocol
 */
export interface PushSubscription extends TenantEntity {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  deviceName?: string;
  isActive: boolean;
  lastUsedAt?: string;
  expiresAt?: string;
}

// =============================================================================
// Notification Preferences
// =============================================================================

/**
 * User preferences for different notification channels and types
 */
export interface NotificationPreferences extends TenantEntity {
  userId: string;

  // Channel preferences
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;

  // Booking notification preferences
  bookingConfirmationEnabled: boolean;
  bookingReminderEnabled: boolean;
  bookingCancellationEnabled: boolean;
  bookingModificationEnabled: boolean;

  // Reminder timing preferences
  reminderTiming: {
    enabled24h: boolean;
    enabled1h: boolean;
  };

  // Quiet hours (ISO 8601 time format HH:mm)
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// =============================================================================
// Push Notification DTOs
// =============================================================================

/**
 * Data required to register a new push subscription
 */
export interface RegisterPushSubscriptionDTO {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  userAgent?: string;
}

/**
 * Data for updating notification preferences
 */
export interface UpdateNotificationPreferencesDTO {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  smsEnabled?: boolean;
  bookingConfirmationEnabled?: boolean;
  bookingReminderEnabled?: boolean;
  bookingCancellationEnabled?: boolean;
  bookingModificationEnabled?: boolean;
  reminderTiming?: {
    enabled24h?: boolean;
    enabled1h?: boolean;
  };
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// =============================================================================
// Push Notification Payload
// =============================================================================

/**
 * Payload structure for push notification messages
 * Follows web push notification standard format
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: PushNotificationData;
  actions?: PushNotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Custom data attached to push notifications
 * Used for deep linking and context
 */
export interface PushNotificationData {
  type: BookingNotificationType;
  bookingId?: string;
  listingId?: string;
  userId?: string;
  url?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Action buttons for push notifications
 */
export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// =============================================================================
// Realtime Notification Events
// =============================================================================

/**
 * WebSocket event for real-time notification delivery
 * Sent when a notification is created that should appear in-app
 */
export interface NotificationEvent extends BaseEntity {
  userId: string;
  tenantId: string;
  type: BookingNotificationType;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  relatedBookingId?: string;
  relatedListingId?: string;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
}
