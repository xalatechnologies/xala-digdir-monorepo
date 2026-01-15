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

/**
 * Extended notification types for the complete notification system
 * Based on Skien demo specification:
 * - Request received (Forespørsel mottatt)
 * - Approved (Godkjent)
 * - Rejected (Avslått)
 * - Request for more info (Be om mer info)
 * - Booking changed (Endret booking)
 * - Cancelled (Avlyst)
 * - Reminder before start (Påminnelse før start)
 * - Invoice/Payment status (Faktura tilgjengelig / betalingsstatus)
 */
export type NotificationType =
  | 'request_received'      // Forespørsel mottatt
  | 'approved'              // Godkjent
  | 'rejected'              // Avslått
  | 'request_more_info'     // Be om mer info
  | 'booking_changed'       // Endret booking
  | 'cancelled'             // Avlyst
  | 'reminder_24h'          // Påminnelse 24t før start
  | 'reminder_2h'           // Påminnelse 2t før start
  | 'invoice_available'     // Faktura tilgjengelig
  | 'payment_status';       // Betalingsstatus endret

/**
 * Notification channel types
 * In-app is always the default and recommended to stay enabled
 */
export type NotificationChannel = 'in_app' | 'email' | 'sms';

/**
 * Per-channel enabled state for a single notification type
 */
export interface NotificationChannelSettings {
  in_app: boolean;
  email: boolean;
  sms: boolean;
}

/**
 * Granular notification preferences matrix
 * Maps each notification type to its channel settings
 */
export interface NotificationPreferencesMatrix {
  request_received: NotificationChannelSettings;
  approved: NotificationChannelSettings;
  rejected: NotificationChannelSettings;
  request_more_info: NotificationChannelSettings;
  booking_changed: NotificationChannelSettings;
  cancelled: NotificationChannelSettings;
  reminder_24h: NotificationChannelSettings;
  reminder_2h: NotificationChannelSettings;
  invoice_available: NotificationChannelSettings;
  payment_status: NotificationChannelSettings;
}

/**
 * Sensible default preferences based on Skien demo specification:
 * - In-app: on for all
 * - E-post: on for decisions and changes
 * - SMS: off by default, but recommended for reminders and cancellations
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesMatrix = {
  request_received: { in_app: true, email: true, sms: false },
  approved: { in_app: true, email: true, sms: false },
  rejected: { in_app: true, email: true, sms: false },
  request_more_info: { in_app: true, email: true, sms: false },
  booking_changed: { in_app: true, email: true, sms: true },  // SMS recommended
  cancelled: { in_app: true, email: true, sms: true },        // SMS recommended
  reminder_24h: { in_app: true, email: false, sms: true },    // SMS recommended
  reminder_2h: { in_app: true, email: false, sms: true },     // SMS recommended
  invoice_available: { in_app: true, email: true, sms: false },
  payment_status: { in_app: true, email: true, sms: false },
};

/**
 * Notification type metadata for UI display
 */
export interface NotificationTypeMetadata {
  type: NotificationType;
  labelKey: string;         // i18n key for the label
  descriptionKey: string;   // i18n key for description
  category: 'booking' | 'reminder' | 'billing';
  smsRecommended: boolean;  // Whether SMS is recommended for this type
}

/**
 * Complete notification types registry with metadata
 */
export const NOTIFICATION_TYPES_REGISTRY: NotificationTypeMetadata[] = [
  // Booking category
  {
    type: 'request_received',
    labelKey: 'notifications.types.requestReceived',
    descriptionKey: 'notifications.types.requestReceivedDesc',
    category: 'booking',
    smsRecommended: false,
  },
  {
    type: 'approved',
    labelKey: 'notifications.types.approved',
    descriptionKey: 'notifications.types.approvedDesc',
    category: 'booking',
    smsRecommended: false,
  },
  {
    type: 'rejected',
    labelKey: 'notifications.types.rejected',
    descriptionKey: 'notifications.types.rejectedDesc',
    category: 'booking',
    smsRecommended: false,
  },
  {
    type: 'request_more_info',
    labelKey: 'notifications.types.requestMoreInfo',
    descriptionKey: 'notifications.types.requestMoreInfoDesc',
    category: 'booking',
    smsRecommended: false,
  },
  {
    type: 'booking_changed',
    labelKey: 'notifications.types.bookingChanged',
    descriptionKey: 'notifications.types.bookingChangedDesc',
    category: 'booking',
    smsRecommended: true,
  },
  {
    type: 'cancelled',
    labelKey: 'notifications.types.cancelled',
    descriptionKey: 'notifications.types.cancelledDesc',
    category: 'booking',
    smsRecommended: true,
  },
  // Reminder category
  {
    type: 'reminder_24h',
    labelKey: 'notifications.types.reminder24h',
    descriptionKey: 'notifications.types.reminder24hDesc',
    category: 'reminder',
    smsRecommended: true,
  },
  {
    type: 'reminder_2h',
    labelKey: 'notifications.types.reminder2h',
    descriptionKey: 'notifications.types.reminder2hDesc',
    category: 'reminder',
    smsRecommended: true,
  },
  // Billing category
  {
    type: 'invoice_available',
    labelKey: 'notifications.types.invoiceAvailable',
    descriptionKey: 'notifications.types.invoiceAvailableDesc',
    category: 'billing',
    smsRecommended: false,
  },
  {
    type: 'payment_status',
    labelKey: 'notifications.types.paymentStatus',
    descriptionKey: 'notifications.types.paymentStatusDesc',
    category: 'billing',
    smsRecommended: false,
  },
];

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

  // Master channel toggles (enable/disable entire channel)
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;  // Recommended to always be true
  smsEnabled: boolean;

  // Booking notification preferences (legacy - kept for backward compatibility)
  bookingConfirmationEnabled: boolean;
  bookingReminderEnabled: boolean;
  bookingCancellationEnabled: boolean;
  bookingModificationEnabled: boolean;

  // Reminder timing preferences (legacy - kept for backward compatibility)
  reminderTiming: {
    enabled24h: boolean;
    enabled1h: boolean;
  };

  // Quiet hours (ISO 8601 time format HH:mm)
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;

  // NEW: Granular notification preferences matrix
  // Maps each notification type to its per-channel settings
  notificationMatrix?: NotificationPreferencesMatrix;
}

/**
 * Extended notification preferences for organizations
 * Organizations may have different notification needs than individual users
 */
export interface OrganizationNotificationPreferences extends TenantEntity {
  organizationId: string;

  // Master channel toggles
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;  // Always true by default

  // Granular notification preferences matrix
  notificationMatrix: NotificationPreferencesMatrix;

  // Organization-specific settings
  // Who receives notifications in the organization
  notifyAdmins: boolean;
  notifyBookingManagers: boolean;
  notifyAllMembers: boolean;

  // Contact preferences
  primaryEmail?: string;
  primaryPhone?: string;  // For SMS

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
  // NEW: Granular notification preferences matrix
  notificationMatrix?: Partial<NotificationPreferencesMatrix>;
}

/**
 * Data for updating organization notification preferences
 */
export interface UpdateOrganizationNotificationPreferencesDTO {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  notificationMatrix?: Partial<NotificationPreferencesMatrix>;
  notifyAdmins?: boolean;
  notifyBookingManagers?: boolean;
  notifyAllMembers?: boolean;
  primaryEmail?: string;
  primaryPhone?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

/**
 * Update a single notification type's channel settings
 */
export interface UpdateNotificationTypeChannelDTO {
  notificationType: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
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
