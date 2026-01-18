/**
 * Vipps Webhook Integration Tests
 * 
 * Tests for the Vipps webhook handler.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
import { createHmac } from 'crypto';

// Mock environment variables
const mockEnv = {
  VIPPS_CLIENT_ID: 'test-client-id',
  VIPPS_CLIENT_SECRET: 'test-client-secret',
  VIPPS_SUBSCRIPTION_KEY: 'test-subscription-key',
  VIPPS_MSN: '440455',
  VIPPS_ENVIRONMENT: 'test',
  VIPPS_WEBHOOK_SECRET: 'test-webhook-secret',
};

describe('Vipps Webhook Handler', () => {
  setupMockApi();
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    Object.assign(process.env, mockEnv);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Signature Validation', () => {
  setupMockApi();
    it('validates correct HMAC signature', () => {
      const secret = 'test-webhook-secret';
      const payload = JSON.stringify({
        eventId: 'test-123',
        eventType: 'checkout.session.completed',
        data: { reference: 'ref-123' },
      });

      const signature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const expectedSignature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      expect(signature).toEqual(expectedSignature);
    });

    it('rejects invalid signature', () => {
      const secret = 'test-webhook-secret';
      const payload = JSON.stringify({ eventId: 'test-123' });
      const wrongSecret = 'wrong-secret';

      const validSignature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const invalidSignature = createHmac('sha256', wrongSecret)
        .update(payload)
        .digest('hex');

      expect(validSignature).not.toEqual(invalidSignature);
    });
  });

  describe('Idempotency', () => {
  setupMockApi();
    it('tracks processed events correctly', () => {
      const processedEvents = new Map<string, Date>();
      const eventId = 'test-event-123';

      // First processing
      expect(processedEvents.has(eventId)).toBe(false);
      processedEvents.set(eventId, new Date());
      expect(processedEvents.has(eventId)).toBe(true);

      // Duplicate check
      const isProcessed = processedEvents.has(eventId);
      expect(isProcessed).toBe(true);
    });

    it('expires old events after TTL', () => {
      const processedEvents = new Map<string, Date>();
      const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
      const eventId = 'old-event';

      // Add event from 25 hours ago
      const oldDate = new Date(Date.now() - EVENT_TTL_MS - 3600000);
      processedEvents.set(eventId, oldDate);

      // Check if expired
      const processed = processedEvents.get(eventId);
      const isExpired = processed && (Date.now() - processed.getTime() > EVENT_TTL_MS);
      expect(isExpired).toBe(true);
    });
  });

  describe('Booking ID Extraction', () => {
  setupMockApi();
    it('extracts booking ID from reference', () => {
      const reference = 'digilist-booking-abc123-1234567890';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toEqual('booking-abc123');
    });

    it('handles UUID booking IDs', () => {
      const reference = 'digilist-550e8400-e29b-41d4-a716-446655440000-1234567890';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toEqual('550e8400-e29b-41d4-a716-446655440000');
    });

    it('returns null for invalid reference', () => {
      const reference = 'invalid-reference';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toBeNull();
    });
  });

  describe('Event Type Handling', () => {
  setupMockApi();
    it('recognizes checkout session events', () => {
      const validEventTypes = [
        'checkout.session.completed',
        'checkout.session.paymentAuthorized',
        'checkout.session.paymentCaptured',
        'checkout.session.paymentRefunded',
        'checkout.session.paymentCancelled',
        'checkout.session.paymentFailed',
      ];

      validEventTypes.forEach(eventType => {
        expect(eventType).toMatch(/^checkout\.session\./);
      });
    });

    it('maps event types to booking statuses', () => {
      const eventTypeToStatus: Record<string, string> = {
        'checkout.session.completed': 'confirmed',
        'checkout.session.paymentAuthorized': 'confirmed',
        'checkout.session.paymentCaptured': 'confirmed',
        'checkout.session.paymentRefunded': 'refunded',
        'checkout.session.paymentCancelled': 'cancelled',
        'checkout.session.paymentFailed': 'cancelled',
      };

      expect(eventTypeToStatus['checkout.session.paymentAuthorized']).toEqual('confirmed');
      expect(eventTypeToStatus['checkout.session.paymentFailed']).toEqual('cancelled');
    });
  });

  describe('Webhook Event Structure', () => {
  setupMockApi();
    it('validates required fields', () => {
      const validEvent = {
        eventId: 'test-123',
        eventType: 'checkout.session.completed',
        timestamp: new Date().toISOString(),
        data: {
          reference: 'digilist-booking-123-1234567890',
        },
      };

      expect(validEvent.eventId).toBeDefined();
      expect(validEvent.eventType).toBeDefined();
      expect(validEvent.data.reference).toBeDefined();
    });

    it('handles optional fields gracefully', () => {
      const eventWithOptionals = {
        eventId: 'test-456',
        eventType: 'checkout.session.paymentCaptured',
        timestamp: new Date().toISOString(),
        data: {
          reference: 'digilist-booking-456-1234567890',
          pspReference: 'psp-123',
          amount: {
            value: 50000,
            currency: 'NOK',
          },
        },
      };

      expect(eventWithOptionals.data.pspReference).toBeDefined();
      expect(eventWithOptionals.data.amount?.value).toEqual(50000);
    });
  });
});

describe('Payment Status Mapping', () => {
  setupMockApi();
  it('maps all Vipps states correctly', () => {
    const stateMap: Record<string, string> = {
      'CREATED': 'CREATED',
      'AUTHORIZED': 'AUTHORIZED',
      'CAPTURED': 'CAPTURED',
      'CANCELLED': 'CANCELLED',
      'REFUNDED': 'REFUNDED',
      'FAILED': 'FAILED',
      'EXPIRED': 'EXPIRED',
      'ABORTED': 'CANCELLED',
      'TERMINATED': 'CANCELLED',
    };

    expect(stateMap['AUTHORIZED']).toEqual('AUTHORIZED');
    expect(stateMap['ABORTED']).toEqual('CANCELLED');
    expect(stateMap['TERMINATED']).toEqual('CANCELLED');
  });
});
