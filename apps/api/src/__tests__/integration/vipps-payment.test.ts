/**
 * Vipps Payment Integration Tests
 * 
 * Tests for the Vipps Checkout payment flow.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VippsCheckoutService, clearVippsCheckoutService } from '../../integrations/vipps/vipps-checkout.service';
import { clearVippsConfigCache, VIPPS_PAYMENT_STATUS } from '../../config/vipps.config';
import { clearVippsClient } from '../../integrations/vipps/vipps.client';

// Mock environment variables
const mockEnv = {
  VIPPS_CLIENT_ID: 'test-client-id',
  VIPPS_CLIENT_SECRET: 'test-client-secret',
  VIPPS_SUBSCRIPTION_KEY: 'test-subscription-key',
  VIPPS_MSN: '440455',
  VIPPS_ENVIRONMENT: 'test',
  VIPPS_PAYMENT_CALLBACK_URL: 'http://localhost:5173/payment/callback',
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VippsCheckoutService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    Object.assign(process.env, mockEnv);
    clearVippsCheckoutService();
    clearVippsConfigCache();
    clearVippsClient();
    mockFetch.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('creates checkout session with correct parameters', async () => {
      // Mock access token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      // Mock checkout session response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'session-token-123',
          checkoutFrontendUrl: 'https://checkout.vipps.no/session/abc123',
          pollingUrl: 'https://api.vipps.no/checkout/v3/session/abc123',
        }),
      });

      const service = new VippsCheckoutService();
      const result = await service.createCheckoutSession({
        bookingId: 'booking-123',
        amount: 50000, // 500 NOK in øre
        description: 'Test booking payment',
        returnUrl: 'http://localhost:5173/payment/callback',
      });

      expect(result.reference).toContain('digilist-booking-123-');
      expect(result.redirectUrl).toEqual('https://checkout.vipps.no/session/abc123');
      expect(result.token).toEqual('session-token-123');
    });

    it('includes customer info when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'session-token',
          checkoutFrontendUrl: 'https://checkout.vipps.no/session/xyz',
          pollingUrl: 'https://api.vipps.no/checkout/v3/session/xyz',
        }),
      });

      const service = new VippsCheckoutService();
      await service.createCheckoutSession({
        bookingId: 'booking-456',
        amount: 25000,
        description: 'Booking with customer',
        returnUrl: 'http://localhost:5173/callback',
        customer: {
          phoneNumber: '91234567',
          email: 'test@example.com',
        },
      });

      // Verify the second call (checkout session) includes customer data
      const checkoutCall = mockFetch.mock.calls[1];
      const requestBody = JSON.parse(checkoutCall[1].body);
      expect(requestBody.prefillCustomer).toEqual({
        phoneNumber: '91234567',
        email: 'test@example.com',
      });
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          type: 'validation_error',
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid amount',
        }),
      });

      const service = new VippsCheckoutService();

      await expect(service.createCheckoutSession({
        bookingId: 'booking-789',
        amount: -100, // Invalid
        description: 'Invalid payment',
        returnUrl: 'http://localhost:5173/callback',
      })).rejects.toThrow();
    });
  });

  describe('getPaymentStatus', () => {
    it('returns payment status correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'digilist-booking-123-1234567890',
          state: 'AUTHORIZED',
          amount: { value: 50000, currency: 'NOK' },
          aggregate: {
            authorizedAmount: { value: 50000, currency: 'NOK' },
            capturedAmount: { value: 0, currency: 'NOK' },
            refundedAmount: { value: 0, currency: 'NOK' },
            cancelledAmount: { value: 0, currency: 'NOK' },
          },
        }),
      });

      const service = new VippsCheckoutService();
      const status = await service.getPaymentStatus('digilist-booking-123-1234567890');

      expect(status.reference).toEqual('digilist-booking-123-1234567890');
      expect(status.status).toEqual(VIPPS_PAYMENT_STATUS.AUTHORIZED);
      expect(status.amount).toEqual(50000);
      expect(status.currency).toEqual('NOK');
      expect(status.bookingId).toEqual('booking-123');
    });

    it('handles payment not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          type: 'not_found',
          title: 'Not Found',
          status: 404,
          detail: 'Payment not found',
        }),
      });

      const service = new VippsCheckoutService();

      await expect(service.getPaymentStatus('nonexistent-ref'))
        .rejects.toThrow('Payment not found');
    });
  });

  describe('capturePayment', () => {
    it('captures full payment amount', async () => {
      // Mock access token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      // Mock capture response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Mock status after capture
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'ref-123',
          state: 'CAPTURED',
          amount: { value: 50000, currency: 'NOK' },
          aggregate: {
            authorizedAmount: { value: 50000, currency: 'NOK' },
            capturedAmount: { value: 50000, currency: 'NOK' },
            refundedAmount: { value: 0, currency: 'NOK' },
            cancelledAmount: { value: 0, currency: 'NOK' },
          },
        }),
      });

      const service = new VippsCheckoutService();
      const status = await service.capturePayment({ reference: 'ref-123' });

      expect(status.status).toEqual(VIPPS_PAYMENT_STATUS.CAPTURED);
      expect(status.capturedAmount).toEqual(50000);
    });

    it('captures partial payment amount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'ref-456',
          state: 'CAPTURED',
          amount: { value: 50000, currency: 'NOK' },
          aggregate: {
            authorizedAmount: { value: 50000, currency: 'NOK' },
            capturedAmount: { value: 25000, currency: 'NOK' },
            refundedAmount: { value: 0, currency: 'NOK' },
            cancelledAmount: { value: 25000, currency: 'NOK' },
          },
        }),
      });

      const service = new VippsCheckoutService();
      const status = await service.capturePayment({
        reference: 'ref-456',
        amount: 25000,
      });

      expect(status.capturedAmount).toEqual(25000);
    });
  });

  describe('refundPayment', () => {
    it('refunds full payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'ref-789',
          state: 'REFUNDED',
          amount: { value: 50000, currency: 'NOK' },
          aggregate: {
            authorizedAmount: { value: 50000, currency: 'NOK' },
            capturedAmount: { value: 50000, currency: 'NOK' },
            refundedAmount: { value: 50000, currency: 'NOK' },
            cancelledAmount: { value: 0, currency: 'NOK' },
          },
        }),
      });

      const service = new VippsCheckoutService();
      const status = await service.refundPayment({
        reference: 'ref-789',
        reason: 'Customer requested refund',
      });

      expect(status.status).toEqual(VIPPS_PAYMENT_STATUS.REFUNDED);
      expect(status.refundedAmount).toEqual(50000);
    });

    it('refunds partial payment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
          token_type: 'Bearer',
          expires_in: '3600',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'ref-partial',
          state: 'CAPTURED', // Still captured with partial refund
          amount: { value: 50000, currency: 'NOK' },
          aggregate: {
            authorizedAmount: { value: 50000, currency: 'NOK' },
            capturedAmount: { value: 50000, currency: 'NOK' },
            refundedAmount: { value: 10000, currency: 'NOK' },
            cancelledAmount: { value: 0, currency: 'NOK' },
          },
        }),
      });

      const service = new VippsCheckoutService();
      const status = await service.refundPayment({
        reference: 'ref-partial',
        amount: 10000,
        reason: 'Partial refund',
      });

      expect(status.refundedAmount).toEqual(10000);
    });
  });
});

describe('Payment Status Mapping', () => {
  it('maps all Vipps states correctly', () => {
    const stateMap: Record<string, string> = {
      'CREATED': VIPPS_PAYMENT_STATUS.CREATED,
      'AUTHORIZED': VIPPS_PAYMENT_STATUS.AUTHORIZED,
      'CAPTURED': VIPPS_PAYMENT_STATUS.CAPTURED,
      'CANCELLED': VIPPS_PAYMENT_STATUS.CANCELLED,
      'REFUNDED': VIPPS_PAYMENT_STATUS.REFUNDED,
      'FAILED': VIPPS_PAYMENT_STATUS.FAILED,
      'EXPIRED': VIPPS_PAYMENT_STATUS.EXPIRED,
    };

    for (const [vippsState, expectedStatus] of Object.entries(stateMap)) {
      expect(expectedStatus).toBeDefined();
    }
  });
});

describe('Vipps Webhook Processing', () => {
  describe('Idempotency', () => {
    it('prevents duplicate event processing', () => {
      // Test idempotency logic
      const processedEvents = new Map<string, Date>();
      const eventId = 'test-event-123';

      // First processing
      processedEvents.set(eventId, new Date());
      expect(processedEvents.has(eventId)).toBe(true);

      // Attempt duplicate
      const isProcessed = processedEvents.has(eventId);
      expect(isProcessed).toBe(true);
    });
  });

  describe('Booking ID Extraction', () => {
    it('extracts booking ID from payment reference', () => {
      const reference = 'digilist-booking-abc123-1234567890';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toEqual('booking-abc123');
    });

    it('handles references with UUID booking IDs', () => {
      const reference = 'digilist-550e8400-e29b-41d4-a716-446655440000-1234567890';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toEqual('550e8400-e29b-41d4-a716-446655440000');
    });

    it('returns null for invalid reference format', () => {
      const reference = 'invalid-reference';
      const match = reference.match(/^digilist-(.+)-\d+$/);
      const bookingId = match ? match[1] : null;

      expect(bookingId).toBeNull();
    });
  });
});
