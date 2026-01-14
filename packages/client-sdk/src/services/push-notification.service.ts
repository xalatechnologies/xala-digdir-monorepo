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
   */
  async register(data: RegisterPushSubscriptionDTO): Promise<PushSubscriptionResponse> {
    return getClient().post<PushSubscriptionResponse>(`${this.basePath}/subscribe`, data);
  }

  /**
   * Unsubscribe from push notifications
   * Removes the push subscription for the given endpoint
   */
  async unsubscribe(endpoint: string): Promise<DeleteResponse> {
    return getClient().post<DeleteResponse>(`${this.basePath}/unsubscribe`, { endpoint });
  }

  /**
   * Get all push subscriptions for the current user
   * Returns all registered devices/browsers
   */
  async getSubscriptions(): Promise<PushSubscriptionsResponse> {
    return getClient().get<PushSubscriptionsResponse>(`${this.basePath}/subscriptions`);
  }

  /**
   * Get notification preferences for the current user
   * Returns user's preferences for notification channels and types
   */
  async getPreferences(): Promise<NotificationPreferencesResponse> {
    return getClient().get<NotificationPreferencesResponse>(`${this.basePath}/preferences`);
  }

  /**
   * Update notification preferences for the current user
   * Allows users to configure which notifications they want to receive and how
   */
  async updatePreferences(data: UpdateNotificationPreferencesDTO): Promise<NotificationPreferencesResponse> {
    return getClient().put<NotificationPreferencesResponse>(`${this.basePath}/preferences`, data);
  }

  /**
   * Delete a specific push subscription by ID
   * Removes a registered device/browser subscription
   */
  async deleteSubscription(id: string): Promise<DeleteResponse> {
    return getClient().delete<DeleteResponse>(`${this.basePath}/subscriptions/${id}`);
  }

  /**
   * Test push notification
   * Sends a test notification to verify the subscription is working
   */
  async testPush(): Promise<{ success: boolean; message: string }> {
    return getClient().post<{ success: boolean; message: string }>(`${this.basePath}/test`);
  }
}

export const pushNotificationService = new PushNotificationService();
