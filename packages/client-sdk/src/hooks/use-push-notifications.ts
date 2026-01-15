/**
 * Push Notification Hooks
 * React hooks for managing browser push subscriptions and notification preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { queryKeys } from './query-keys';
import { pushNotificationService } from '../services/push-notification.service';
import type {
  RegisterPushSubscriptionDTO,
  UpdateNotificationPreferencesDTO,
  UpdateOrganizationNotificationPreferencesDTO,
  PushPermissionState,
} from '../types/push-notification';

// ============================================================================
// Push Subscription Query Hooks
// ============================================================================

/**
 * Get all push subscriptions for the current user
 * Returns all registered devices/browsers
 */
export function usePushSubscriptions() {
  return useQuery({
    queryKey: queryKeys.pushNotifications.subscriptions(),
    queryFn: () => pushNotificationService.getSubscriptions(),
  });
}

/**
 * Get notification preferences for the current user
 * Returns user's preferences for notification channels and types
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.pushNotifications.preferences(),
    queryFn: () => pushNotificationService.getPreferences(),
  });
}

// ============================================================================
// Push Permission State Hook
// ============================================================================

/**
 * Get browser push notification permission state
 * Returns current permission status and method to request permission
 */
export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermissionState>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as PushPermissionState);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<PushPermissionState> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const result = await Notification.requestPermission();
    setPermission(result as PushPermissionState);
    return result as PushPermissionState;
  }, [isSupported]);

  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
    requestPermission,
  };
}

// ============================================================================
// Push Subscription Mutation Hooks
// ============================================================================

/**
 * Register a new push subscription
 * Stores the subscription endpoint and keys for sending browser push notifications
 */
export function useRegisterPushSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterPushSubscriptionDTO) => pushNotificationService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushNotifications.subscriptions() });
    },
  });
}

/**
 * Unsubscribe from push notifications
 * Removes the push subscription for the given endpoint
 */
export function useUnsubscribePush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (endpoint: string) => pushNotificationService.unsubscribe(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushNotifications.subscriptions() });
    },
  });
}

/**
 * Delete a specific push subscription by ID
 * Removes a registered device/browser subscription
 */
export function useDeletePushSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pushNotificationService.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushNotifications.subscriptions() });
    },
  });
}

// ============================================================================
// Notification Preferences Mutation Hooks
// ============================================================================

/**
 * Update notification preferences
 * Allows users to configure which notifications they want to receive and how
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesDTO) => pushNotificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushNotifications.preferences() });
    },
  });
}

// ============================================================================
// Test Push Notification Hook
// ============================================================================

/**
 * Send a test push notification
 * Verifies the subscription is working correctly
 */
export function useTestPushNotification() {
  return useMutation({
    mutationFn: () => pushNotificationService.testPush(),
  });
}

// ============================================================================
// Complete Push Subscription Flow Hook
// ============================================================================

/**
 * Complete push subscription flow
 * Handles permission request, service worker registration, and subscription
 * Returns methods to subscribe and unsubscribe with full error handling
 */
export function usePushSubscriptionFlow() {
  const { permission, isSupported, requestPermission } = usePushPermission();
  const registerMutation = useRegisterPushSubscription();
  const unsubscribeMutation = useUnsubscribePush();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    setIsSubscribing(true);
    try {
      // Step 1: Request permission if needed
      let currentPermission = permission;
      if (permission === 'default') {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Step 2: Register service worker
      const registration = await navigator.serviceWorker.ready;

      // Step 3: Subscribe to push
      // Get VAPID public key from environment
      const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || '';
      const applicationServerKey = vapidPublicKey
        ? (urlBase64ToUint8Array(vapidPublicKey) as BufferSource)
        : undefined;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Step 4: Send subscription to backend
      const subscriptionJSON = subscription.toJSON();
      if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
        throw new Error('Invalid subscription format');
      }

      await registerMutation.mutateAsync({
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh || '',
          auth: subscriptionJSON.keys.auth || '',
        },
        deviceName: getBrowserName(),
        userAgent: navigator.userAgent,
      });

      return subscription;
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported, permission, requestPermission, registerMutation]);

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await unsubscribeMutation.mutateAsync(subscription.endpoint);
    }
  }, [unsubscribeMutation]);

  return {
    subscribe,
    unsubscribe,
    isSubscribing,
    isSupported,
    permission,
  };
}

// ============================================================================
// Organization Notification Preferences Hooks
// ============================================================================

/**
 * Get notification preferences for the current organization
 * Returns organization's preferences for notification channels and types
 */
export function useOrganizationNotificationPreferences(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.pushNotifications.organizationPreferences(organizationId),
    queryFn: () => pushNotificationService.getOrganizationPreferences(organizationId),
    enabled: !!organizationId,
  });
}

/**
 * Update organization notification preferences
 * Allows organization admins to configure which notifications the org receives and how
 */
export function useUpdateOrganizationNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: UpdateOrganizationNotificationPreferencesDTO }) =>
      pushNotificationService.updateOrganizationPreferences(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pushNotifications.organizationPreferences(variables.organizationId),
      });
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get browser name for device identification
 */
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}
