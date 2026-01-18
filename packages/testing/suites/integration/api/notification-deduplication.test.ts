/**
 * Notification Deduplication Integration Tests
 * Tests for notification deduplication system
 * Verifies that identical notifications within 5-minute window are deduplicated
 *
 * NOTE: These tests require the API server to be running
 * Run with: pnpm dev (in separate terminal), then pnpm test:integration
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

describe('NotificationsController - Deduplication', () => {
  setupMockApi();
  // =========================================================================
  // POST /api/notifications/send - Deduplication Tests
  // =========================================================================
  // NOTE: Time-window expiration test (waiting 6+ minutes) is not included
  // to keep test suite fast. Deduplication window logic is tested in unit tests.
  // =========================================================================
  describe('POST /api/notifications/send - Deduplication', () => {
  setupMockApi();
    it('should create notification on first send', async () => {
      const notification = {
        type: 'email',
        recipient: 'test-dedup-1@example.com',
        subject: 'Test Deduplication 1',
        body: 'This is a test notification for deduplication testing',
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(data.data.notificationId).toBeDefined();
      expect(data.data.message).toBeDefined();
    });

    it('should prevent duplicate within 5-minute window', async () => {
      const notification = {
        type: 'email',
        recipient: 'test-dedup-2@example.com',
        subject: 'Test Deduplication 2',
        body: 'This notification will be sent twice to test deduplication',
      };

      // First send - should succeed
      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res1.status).toBe(201);
      const data1 = await res1.json();
      expect(data1.data.notificationId).toBeDefined();
      const firstNotificationId = data1.data.notificationId;

      // Second send (immediate) - should be blocked as duplicate
      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res2.status).toBe(409);
      const data2 = await res2.json();
      expect(data2.error).toBe('duplicate_notification');
      expect(data2.message).toBeDefined();
      expect(data2.existingNotificationId).toBe(firstNotificationId);
    });

    it('should return duplicate status with existing notification ID', async () => {
      const notification = {
        type: 'sms',
        recipient: '+4712345678',
        body: 'SMS test for deduplication',
      };

      // First send
      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res1.status).toBe(201);
      const data1 = await res1.json();
      const notificationId = data1.data.notificationId;

      // Second send - should return existing notification ID
      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res2.status).toBe(409);
      const data2 = await res2.json();
      expect(data2.existingNotificationId).toBe(notificationId);
    });

    it('should deduplicate based on content hash (email)', async () => {
      const notification = {
        type: 'email',
        recipient: 'test-hash@example.com',
        subject: 'Content Hash Test',
        body: 'Testing content hash deduplication logic',
        metadata: {
          source: 'integration-test',
          testId: 'hash-test-email',
        },
      };

      // Send twice with identical content
      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(409);
    });

    it('should deduplicate based on content hash (SMS)', async () => {
      const notification = {
        type: 'sms',
        recipient: '+4787654321',
        body: 'SMS content hash test message',
      };

      // Send twice with identical content
      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(409);
    });

    it('should allow notifications with different content', async () => {
      const notification1 = {
        type: 'email',
        recipient: 'test-different@example.com',
        subject: 'First Subject',
        body: 'First notification body',
      };

      const notification2 = {
        type: 'email',
        recipient: 'test-different@example.com',
        subject: 'Second Subject',
        body: 'Second notification body',
      };

      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification1),
      });

      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification2),
      });

      // Both should succeed since content is different
      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);

      const data1 = await res1.json();
      const data2 = await res2.json();
      expect(data1.data.notificationId).not.toBe(data2.data.notificationId);
    });

    it('should allow notifications with same content to different recipients', async () => {
      const notification1 = {
        type: 'email',
        recipient: 'recipient1@example.com',
        subject: 'Same Content',
        body: 'Same body content for different recipients',
      };

      const notification2 = {
        type: 'email',
        recipient: 'recipient2@example.com',
        subject: 'Same Content',
        body: 'Same body content for different recipients',
      };

      const res1 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification1),
      });

      const res2 = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification2),
      });

      // Both should succeed since recipients are different
      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
    });
  });

  // =========================================================================
  // GET /api/notifications/delivery-status/:id - Verify Duplicate Detection
  // =========================================================================
  describe('GET /api/notifications/delivery-status/:id', () => {
  setupMockApi();
    it('should retrieve delivery status for first notification', async () => {
      const notification = {
        type: 'email',
        recipient: 'status-test@example.com',
        subject: 'Status Test',
        body: 'Testing delivery status retrieval',
      };

      // Create notification
      const sendRes = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(notification),
      });

      expect(sendRes.status).toBe(201);
      const sendData = await sendRes.json();
      const notificationId = sendData.data.notificationId;

      // Get delivery status
      const statusRes = await fetch(
        `${API_URL}/api/notifications/delivery-status/${notificationId}`,
        { headers }
      );

      expect(statusRes.status).toBe(200);
      const statusData = await statusRes.json();
      expect(statusData.data).toBeDefined();
      expect(statusData.data.id).toBe(notificationId);
      expect(statusData.data.status).toBeDefined();
    });
  });

  // =========================================================================
  // Validation Tests
  // =========================================================================
  describe('POST /api/notifications/send - Validation', () => {
  setupMockApi();
    it('should reject notification without required fields', async () => {
      const invalidNotification = {
        type: 'email',
        // Missing recipient and body
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invalidNotification),
      });

      expect([400, 422]).toContain(res.status);
    });

    it('should reject notification with invalid type', async () => {
      const invalidNotification = {
        type: 'invalid-type',
        recipient: 'test@example.com',
        body: 'Test body',
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(invalidNotification),
      });

      expect([400, 422]).toContain(res.status);
    });

    it('should accept valid email notification', async () => {
      const validNotification = {
        type: 'email',
        recipient: 'valid@example.com',
        subject: 'Valid Email',
        body: 'This is a valid email notification',
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(validNotification),
      });

      expect(res.status).toBe(201);
    });

    it('should accept valid SMS notification without subject', async () => {
      const validNotification = {
        type: 'sms',
        recipient: '+4700000000',
        body: 'Valid SMS notification',
      };

      const res = await fetch(`${API_URL}/api/notifications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(validNotification),
      });

      expect(res.status).toBe(201);
    });
  });
});
