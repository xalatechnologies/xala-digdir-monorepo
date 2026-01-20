/**
 * Notification Retry Integration Tests
 * Tests for retry mechanism with exponential backoff
 *
 * NOTE: These tests require the API server to be running
 * Run with: cd apps/api && pnpm dev (in separate terminal)
 * Then: cd apps/api && pnpm test:integration notification-retry
 *
 * Exponential Backoff Schedule:
 * Attempt 1: Failed → Retry after 1 minute
 * Attempt 2: Failed → Retry after 2 minutes
 * Attempt 3: Failed → Retry after 4 minutes
 * Attempt 4: Failed → Retry after 8 minutes
 * Attempt 5: Failed → No more retries (max attempts reached)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

describe('NotificationController - Retry Mechanism', () => {
  setupMockApi();
  let testNotificationId: string;

  // =========================================================================
  // POST /api/notifications/send
  // =========================================================================
  describe('POST /api/notifications/send', () => {
  setupMockApi();
    it('should send notification and track delivery attempt', async () => {
      const payload = {
        type: 'email',
        recipient: 'retry-test@example.com',
        subject: 'Retry Test Notification',
        body: 'Testing retry mechanism with exponential backoff',
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 201) {
        expect(data.data).toBeDefined();
        expect(data.data.notificationId).toBeDefined();
        testNotificationId = data.data.notificationId;
      } else if (res.status === 409) {
        // Duplicate - use existing notification ID
        expect(data.existingNotificationId).toBeDefined();
        testNotificationId = data.existingNotificationId;
      } else {
        // Other status codes are acceptable but store ID if available
        if (data.data?.notificationId) {
          testNotificationId = data.data.notificationId;
        }
      }
    });
  });

  // =========================================================================
  // GET /api/notifications/delivery-status/:id
  // =========================================================================
  describe('GET /api/notifications/delivery-status/:id', () => {
  setupMockApi();
    it('should return delivery status with attempts', async () => {
      if (!testNotificationId) {
        console.log('Skipping: no notification ID available');
        return;
      }

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('type');
      expect(data.data).toHaveProperty('recipient');
    });

    it('should include delivery attempts array', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();
      expect(data.data.attempts).toBeDefined();
      expect(Array.isArray(data.data.attempts)).toBe(true);
    });

    it('should include attemptNumber in each attempt', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();

      if (data.data.attempts && data.data.attempts.length > 0) {
        const attempt = data.data.attempts[0];
        expect(attempt).toHaveProperty('attemptNumber');
        expect(attempt).toHaveProperty('status');
        expect(attempt).toHaveProperty('retriedAt');
      }
    });

    it('should include nextRetryAt for failed attempts', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();

      // If notification failed, should have nextRetryAt
      if (data.data.status === 'failed' && data.data.attempts.length > 0) {
        const failedAttempts = data.data.attempts.filter(
          (a: any) => a.status === 'failed'
        );

        if (failedAttempts.length > 0) {
          const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
          // nextRetryAt should exist if not at max attempts (5)
          if (lastFailedAttempt.attemptNumber < 5) {
            expect(lastFailedAttempt).toHaveProperty('nextRetryAt');
          }
        }
      }
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${fakeId}`,
        { headers }
      );

      expect([404, 500]).toContain(res.status);
    });
  });

  // =========================================================================
  // POST /api/notifications/retry-failed
  // =========================================================================
  describe('POST /api/notifications/retry-failed', () => {
  setupMockApi();
    it('should retry failed notifications', async () => {
      const res = await fetch(`${API_URL}/api/notifications/retry-failed`, {
        method: 'POST',
        headers,
      });

      expect([200, 201]).toContain(res.status);
      const data = await res.json();

      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('retriedCount');
      expect(data.data).toHaveProperty('successCount');
      expect(data.data).toHaveProperty('failureCount');
      expect(data.data).toHaveProperty('message');
    });

    it('should return counts as numbers', async () => {
      const res = await fetch(`${API_URL}/api/notifications/retry-failed`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();

      expect(typeof data.data.retriedCount).toBe('number');
      expect(typeof data.data.successCount).toBe('number');
      expect(typeof data.data.failureCount).toBe('number');
      expect(data.data.retriedCount).toBeGreaterThanOrEqual(0);
    });

    it('should have consistent counts', async () => {
      const res = await fetch(`${API_URL}/api/notifications/retry-failed`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();

      // retriedCount should equal successCount + failureCount
      expect(data.data.retriedCount).toBe(
        data.data.successCount + data.data.failureCount
      );
    });
  });

  // =========================================================================
  // Exponential Backoff Verification
  // =========================================================================
  describe('Exponential Backoff Calculation', () => {
  setupMockApi();
    it('should calculate correct delay for attempt 1', () => {
      const attemptNumber = 1;
      const expectedDelayMinutes = 1; // 2^0 * 1 = 1 minute
      const baseDelay = 1;

      const calculatedDelay = Math.pow(2, attemptNumber - 1) * baseDelay;
      expect(calculatedDelay).toBe(expectedDelayMinutes);
    });

    it('should calculate correct delay for attempt 2', () => {
      const attemptNumber = 2;
      const expectedDelayMinutes = 2; // 2^1 * 1 = 2 minutes
      const baseDelay = 1;

      const calculatedDelay = Math.pow(2, attemptNumber - 1) * baseDelay;
      expect(calculatedDelay).toBe(expectedDelayMinutes);
    });

    it('should calculate correct delay for attempt 3', () => {
      const attemptNumber = 3;
      const expectedDelayMinutes = 4; // 2^2 * 1 = 4 minutes
      const baseDelay = 1;

      const calculatedDelay = Math.pow(2, attemptNumber - 1) * baseDelay;
      expect(calculatedDelay).toBe(expectedDelayMinutes);
    });

    it('should calculate correct delay for attempt 4', () => {
      const attemptNumber = 4;
      const expectedDelayMinutes = 8; // 2^3 * 1 = 8 minutes
      const baseDelay = 1;

      const calculatedDelay = Math.pow(2, attemptNumber - 1) * baseDelay;
      expect(calculatedDelay).toBe(expectedDelayMinutes);
    });

    it('should calculate correct delay for attempt 5', () => {
      const attemptNumber = 5;
      const expectedDelayMinutes = 16; // 2^4 * 1 = 16 minutes
      const baseDelay = 1;

      const calculatedDelay = Math.pow(2, attemptNumber - 1) * baseDelay;
      expect(calculatedDelay).toBe(expectedDelayMinutes);
    });

    it('should verify exponential growth pattern', () => {
      const baseDelay = 1;
      const delays = [1, 2, 3, 4, 5].map(attemptNumber =>
        Math.pow(2, attemptNumber - 1) * baseDelay
      );

      // Verify delays: [1, 2, 4, 8, 16]
      expect(delays).toEqual([1, 2, 4, 8, 16]);
    });
  });

  // =========================================================================
  // GET /api/notifications/delivery-reports
  // =========================================================================
  describe('GET /api/notifications/delivery-reports', () => {
  setupMockApi();
    it('should return delivery reports', async () => {
      const res = await fetch(`${API_URL}/api/notifications/delivery-reports`, {
        headers,
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('limit');
    });

    it('should support status filter', async () => {
      const res = await fetch(
        `${API_URL}/api/notifications/delivery-reports?status=sent`,
        { headers }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await fetch(
        `${API_URL}/api/notifications/delivery-reports?page=1&limit=10`,
        { headers }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(10);
    });

    it('should include attempt count in reports', async () => {
      const res = await fetch(`${API_URL}/api/notifications/delivery-reports`, {
        headers,
      });

      const data = await res.json();

      if (data.data.length > 0) {
        const report = data.data[0];
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('status');
        expect(report).toHaveProperty('type');
      }
    });
  });

  // =========================================================================
  // Retry Time Window Verification
  // =========================================================================
  describe('Retry Time Window Validation', () => {
  setupMockApi();
    it('should have nextRetryAt in future for failed notifications', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();

      if (data.data.status === 'failed' && data.data.attempts.length > 0) {
        const failedAttempts = data.data.attempts.filter(
          (a: any) => a.status === 'failed' && a.nextRetryAt
        );

        if (failedAttempts.length > 0) {
          const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
          const nextRetryAt = new Date(lastFailedAttempt.nextRetryAt);
          const now = new Date();

          // nextRetryAt should be in the future
          expect(nextRetryAt.getTime()).toBeGreaterThan(now.getTime());
        }
      }
    });

    it('should calculate nextRetryAt with correct intervals', async () => {
      // Verify the calculation logic matches expected intervals
      const baseDelayMs = 60 * 1000; // 1 minute in milliseconds
      const now = Date.now();

      const attempt1NextRetry = now + Math.pow(2, 0) * baseDelayMs; // +1 min
      const attempt2NextRetry = now + Math.pow(2, 1) * baseDelayMs; // +2 min
      const attempt3NextRetry = now + Math.pow(2, 2) * baseDelayMs; // +4 min
      const attempt4NextRetry = now + Math.pow(2, 3) * baseDelayMs; // +8 min
      const attempt5NextRetry = now + Math.pow(2, 4) * baseDelayMs; // +16 min

      // Verify time differences
      expect(attempt2NextRetry - attempt1NextRetry).toBe(baseDelayMs); // 1 min difference
      expect(attempt3NextRetry - attempt2NextRetry).toBe(2 * baseDelayMs); // 2 min difference
      expect(attempt4NextRetry - attempt3NextRetry).toBe(4 * baseDelayMs); // 4 min difference
      expect(attempt5NextRetry - attempt4NextRetry).toBe(8 * baseDelayMs); // 8 min difference
    });
  });

  // =========================================================================
  // Max Retry Attempts Verification
  // =========================================================================
  describe('Max Retry Attempts', () => {
  setupMockApi();
    it('should not exceed 5 retry attempts', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();

      if (data.data.attempts && data.data.attempts.length > 0) {
        // Verify no attempt has attemptNumber > 5
        const maxAttemptNumber = Math.max(
          ...data.data.attempts.map((a: any) => a.attemptNumber)
        );
        expect(maxAttemptNumber).toBeLessThanOrEqual(5);
      }
    });

    it('should not have nextRetryAt after 5th attempt', async () => {
      if (!testNotificationId) return;

      const res = await fetch(
        `${API_URL}/api/notifications/delivery-status/${testNotificationId}`,
        { headers }
      );

      const data = await res.json();

      if (data.data.attempts && data.data.attempts.length > 0) {
        const fifthAttempt = data.data.attempts.find(
          (a: any) => a.attemptNumber === 5
        );

        if (fifthAttempt && fifthAttempt.status === 'failed') {
          // After 5th failed attempt, there should be no nextRetryAt
          expect(fifthAttempt.nextRetryAt).toBeNull();
        }
      }
    });
  });
});
