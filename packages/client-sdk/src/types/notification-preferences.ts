/**
 * Notification Preferences Types and Constants
 * Comprehensive notification settings matrix for user preferences
 */

import type { NotificationType, NotificationChannel } from './notification-system';

// =============================================================================
// Types
// =============================================================================

/**
 * Settings for a specific notification channel for a single notification type
 */
export interface NotificationChannelSettings {
  in_app: boolean;
  email: boolean;
  sms: boolean;
  push?: boolean;
}

/**
 * Complete notification preferences matrix
 * Maps each notification type to its channel settings
 */
export type NotificationPreferencesMatrix = Record<
  NotificationType,
  NotificationChannelSettings
>;

// =============================================================================
// Constants
// =============================================================================

/**
 * Registry of all available notification types
 * Used for iterating over notification types in UI
 */
export const NOTIFICATION_TYPES_REGISTRY: NotificationType[] = [
  'request_received',
  'approved',
  'rejected',
  'request_more_info',
  'booking_changed',
  'cancelled',
  'reminder_24h',
  'reminder_2h',
  'invoice_available',
  'payment_status',
  'system_alert',
  'custom',
];

/**
 * Default notification preferences
 * Based on Skien demo specification:
 * - In-app: always on by default
 * - E-post: on for decisions and changes
 * - SMS: off by default, but recommended for reminders and cancellations
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesMatrix = {
  // Booking decisions
  request_received: {
    in_app: true,
    email: true,
    sms: false,
  },
  approved: {
    in_app: true,
    email: true,
    sms: false,
  },
  rejected: {
    in_app: true,
    email: true,
    sms: false,
  },
  request_more_info: {
    in_app: true,
    email: true,
    sms: false,
  },

  // Booking changes
  booking_changed: {
    in_app: true,
    email: true,
    sms: false,
  },
  cancelled: {
    in_app: true,
    email: true,
    sms: true, // SMS recommended for cancellations
  },

  // Reminders
  reminder_24h: {
    in_app: true,
    email: false,
    sms: true, // SMS recommended for reminders
  },
  reminder_2h: {
    in_app: true,
    email: false,
    sms: true, // SMS recommended for reminders
  },

  // Billing
  invoice_available: {
    in_app: true,
    email: true,
    sms: false,
  },
  payment_status: {
    in_app: true,
    email: true,
    sms: false,
  },

  // System
  system_alert: {
    in_app: true,
    email: false,
    sms: false,
  },
  custom: {
    in_app: true,
    email: false,
    sms: false,
  },
};

/**
 * Get default channel settings for a notification type
 */
export function getDefaultChannelSettings(
  type: NotificationType
): NotificationChannelSettings {
  return DEFAULT_NOTIFICATION_PREFERENCES[type] || {
    in_app: true,
    email: false,
    sms: false,
  };
}

/**
 * Check if a notification type is enabled for a specific channel
 */
export function isChannelEnabled(
  preferences: NotificationPreferencesMatrix,
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  return preferences[type]?.[channel] ?? false;
}

/**
 * Update a specific channel for a notification type
 */
export function updateChannelSetting(
  preferences: NotificationPreferencesMatrix,
  type: NotificationType,
  channel: NotificationChannel,
  enabled: boolean
): NotificationPreferencesMatrix {
  return {
    ...preferences,
    [type]: {
      ...preferences[type],
      [channel]: enabled,
    },
  };
}
