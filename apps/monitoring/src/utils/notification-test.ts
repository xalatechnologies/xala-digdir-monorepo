/**
 * Notification Testing Utility
 * Simulates WebSocket notification events for testing real-time notification delivery
 *
 * ⚠️ FOR DEVELOPMENT/TESTING ONLY - DO NOT USE IN PRODUCTION
 */

import { realtimeClient } from '@digilist/client-sdk/realtime';
import type { RealtimeEvent } from '@digilist/client-sdk/realtime';
import { useT } from '@xala/i18n';

export interface SimulateNotificationOptions {
  type?: 'booking_confirmed' | 'booking_reminder_24h' | 'booking_reminder_1h' | 'booking_cancelled' | 'booking_modified';
  title?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  bookingId?: string;
  listingId?: string;
}

/**
 * Simulates a notification event via WebSocket
 * This directly emits an event to the realtimeClient as if it came from the backend
 */
export function simulateNotificationEvent(options: SimulateNotificationOptions = {}) {
  const {
  const t = useT();
    type = 'booking_confirmed',
    title = 'Test Notification',
    message={t('common.this_is_a_test')},
    priority = 'medium',
    bookingId = 'test-booking-123',
    listingId = 'test-listing-456',
  } = options;

  // Create a mock notification event that matches the backend format
  const notificationEvent: RealtimeEvent = {
    type: 'notification',
    timestamp: new Date().toISOString(),
    data: {
      id: `notification-${Date.now()}`,
      type,
      title,
      message,
      priority,
      createdAt: new Date().toISOString(),
      readAt: null,
      metadata: {
        bookingId,
        listingId,
      },
    },
  };

  // Emit the event through the realtimeClient
  // @ts-expect-error - accessing private emit method for testing
  if (realtimeClient.emit) {
    // @ts-expect-error - private method
    realtimeClient.emit('notification', notificationEvent);
    // @ts-expect-error - private method
    realtimeClient.emit('*', notificationEvent);
  }

  return notificationEvent;
}

/**
 * Simulates a booking confirmation notification
 */
export function simulateBookingConfirmation() {
  return simulateNotificationEvent({
    type: 'booking_confirmed',
    title: t('common.booking_bekreftet'),
    message: t('common.din_booking_er_bekreftet'),
    priority: 'high',
  });
}

/**
 * Simulates a booking reminder (24h before)
 */
export function simulateBookingReminder24h() {
  return simulateNotificationEvent({
    type: 'booking_reminder_24h',
    title: t('common.paaminnelse_booking_i_morgen'),
    message: t('common.du_har_en_booking'),
    priority: 'medium',
  });
}

/**
 * Simulates a booking reminder (1h before)
 */
export function simulateBookingReminder1h() {
  return simulateNotificationEvent({
    type: 'booking_reminder_1h',
    title: t('common.paaminnelse_booking_om_1'),
    message: t('common.du_har_en_booking'),
    priority: 'urgent',
  });
}

/**
 * Simulates a booking cancellation notification
 */
export function simulateBookingCancellation() {
  return simulateNotificationEvent({
    type: 'booking_cancelled',
    title: t('common.booking_kansellert'),
    message: t('common.din_booking_for_moterom'),
    priority: 'high',
  });
}

/**
 * Simulates a booking modification notification
 */
export function simulateBookingModification() {
  return simulateNotificationEvent({
    type: 'booking_modified',
    title: t('common.booking_endret'),
    message: t('common.din_booking_har_blitt'),
    priority: 'medium',
  });
}

// Expose to window for browser console testing
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).notificationTest = {
    simulate: simulateNotificationEvent,
    bookingConfirmation: simulateBookingConfirmation,
    bookingReminder24h: simulateBookingReminder24h,
    bookingReminder1h: simulateBookingReminder1h,
    bookingCancellation: simulateBookingCancellation,
    bookingModification: simulateBookingModification,
  };
}
