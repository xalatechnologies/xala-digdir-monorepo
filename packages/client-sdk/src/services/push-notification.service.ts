/**
 * Push Notification Service
 * Browser push notification subscriptions and notification preferences
 */
import { getClient } from '../core/client-factory';
import type {
  PushSubscription,
  NotificationPreferences,
  RegisterPushSubscriptionDTO,
  UpdateNotificationPreferencesDTO,
} from '../types/push-notification';

export interface PushSubscriptionResponse {
  data: PushSubscription;
}

export interface PushSubscriptionsResponse {
  data: PushSubscription[];
}

export interface NotificationPreferencesResponse {
  data: NotificationPreferences;
}

export interface DeleteResponse {
  success: boolean;
}

class PushNotificationService {
  private basePath = '/api/push-notifications';

  /**
   * Register a new push subscription for the current user
   * Stores the subscription endpoint and keys for sending browser push notifications
   * Call this after requesting notification permission from the browser
   *
   * @param data - Push subscription data including endpoint and encryption keys
   * @returns Promise resolving to the registered push subscription
   *
   * @example
   * ```typescript
   * // Register push notifications after user grants permission
   * const registration = await navigator.serviceWorker.ready;
   * const subscription = await registration.pushManager.subscribe({
   *   userVisibleOnly: true,
   *   applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
   * });
   *
   * const { data } = await pushNotificationService.register({
   *   endpoint: subscription.endpoint,
   *   keys: {
   *     p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
   *     auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
   *   }
   * });
   * ```
   */
  async register(data: RegisterPushSubscriptionDTO): Promise<PushSubscriptionResponse> {
    return getClient().post<PushSubscriptionResponse>(`${this.basePath}/subscribe`, data);
  }

  /**
   * Unsubscribe from push notifications
   * Removes the push subscription for the given endpoint
   * Call this when user disables notifications or logs out
   *
   * @param endpoint - The push subscription endpoint URL to remove
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Unsubscribe when user disables push notifications
   * const registration = await navigator.serviceWorker.ready;
   * const subscription = await registration.pushManager.getSubscription();
   * if (subscription) {
   *   await pushNotificationService.unsubscribe(subscription.endpoint);
   *   await subscription.unsubscribe();
   * }
   * ```
   */
  async unsubscribe(endpoint: string): Promise<DeleteResponse> {
    return getClient().post<DeleteResponse>(`${this.basePath}/unsubscribe`, { endpoint });
  }

  /**
   * Get all push subscriptions for the current user
   * Returns all registered devices/browsers where the user has enabled push notifications
   * Useful for displaying active notification devices in settings
   *
   * @returns Promise resolving to array of push subscriptions
   *
   * @example
   * ```typescript
   * // Display all devices with push notifications enabled
   * const { data } = await pushNotificationService.getSubscriptions();
   * console.log(`Push enabled on ${data.length} devices`);
   * data.forEach(sub => {
   *   console.log(`Device: ${sub.userAgent}, Added: ${sub.createdAt}`);
   * });
   * ```
   */
  async getSubscriptions(): Promise<PushSubscriptionsResponse> {
    return getClient().get<PushSubscriptionsResponse>(`${this.basePath}/subscriptions`);
  }

  /**
   * Get notification preferences for the current user
   * Returns user's preferences for notification channels and types
   * Use this to populate notification settings UI
   *
   * @returns Promise resolving to user's notification preferences
   *
   * @example
   * ```typescript
   * // Load user's notification preferences
   * const { data } = await pushNotificationService.getPreferences();
   * console.log('Email enabled:', data.emailEnabled);
   * console.log('Push enabled:', data.pushEnabled);
   * console.log('In-app enabled:', data.inAppEnabled);
   * ```
   */
  async getPreferences(): Promise<NotificationPreferencesResponse> {
    return getClient().get<NotificationPreferencesResponse>(`${this.basePath}/preferences`);
  }

  /**
   * Update notification preferences for the current user
   * Allows users to configure which notifications they want to receive and how
   * Changes take effect immediately for future notifications
   *
   * @param data - Updated notification preferences
   * @returns Promise resolving to updated notification preferences
   *
   * @example
   * ```typescript
   * // Disable email notifications but keep push enabled
   * const { data } = await pushNotificationService.updatePreferences({
   *   emailEnabled: false,
   *   pushEnabled: true,
   *   inAppEnabled: true,
   *   notificationTypes: {
   *     bookingReminders: true,
   *     bookingUpdates: true,
   *     systemAlerts: false
   *   }
   * });
   *
   * // Enable only critical notifications
   * await pushNotificationService.updatePreferences({
   *   emailEnabled: true,
   *   pushEnabled: true,
   *   notificationTypes: {
   *     bookingReminders: true,
   *     bookingUpdates: false,
   *     systemAlerts: true
   *   }
   * });
   * ```
   */
  async updatePreferences(data: UpdateNotificationPreferencesDTO): Promise<NotificationPreferencesResponse> {
    return getClient().put<NotificationPreferencesResponse>(`${this.basePath}/preferences`, data);
  }

  /**
   * Delete a specific push subscription by ID
   * Removes a registered device/browser subscription
   * Use this to allow users to remove individual devices from notification settings
   *
   * @param id - The subscription ID to delete
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Remove a specific device from notification settings
   * await pushNotificationService.deleteSubscription('sub-123');
   * ```
   */
  async deleteSubscription(id: string): Promise<DeleteResponse> {
    return getClient().delete<DeleteResponse>(`${this.basePath}/subscriptions/${id}`);
  }

  /**
   * Send a test push notification
   * Sends a test notification to verify the subscription is working
   * Useful for verifying push setup in notification settings
   *
   * @returns Promise resolving to success status and message
   *
   * @example
   * ```typescript
   * // Test push notifications after user enables them
   * const result = await pushNotificationService.testPush();
   * if (result.success) {
   *   console.log('Test notification sent:', result.message);
   * }
   * ```
   */
  async testPush(): Promise<{ success: boolean; message: string }> {
    return getClient().post<{ success: boolean; message: string }>(`${this.basePath}/test`);
  }
}

export const pushNotificationService = new PushNotificationService();
