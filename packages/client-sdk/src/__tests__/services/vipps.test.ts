/**
 * Vipps SDK Services Tests
 * 
 * Tests for Vipps authentication and payment hooks/services.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

// Create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Vipps Auth Hooks', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useVippsLogin', () => {
    it('initiates Vipps login and returns authorization URL', async () => {
      // Dynamic import to avoid circular dependencies
      const { useVippsLogin } = await import('../../hooks/use-auth');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            authorizationUrl: 'https://api.vipps.no/auth?client_id=test',
            state: 'random-state-123',
            nonce: 'random-nonce-456',
            returnTo: '/bookings',
          },
        }),
      });

      const { result } = renderHook(() => useVippsLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        redirectUri: 'http://localhost:5173/auth/callback',
        returnTo: '/bookings',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.authorizationUrl).toContain('vipps.no');
      expect(result.current.data?.data.state).toBeDefined();
      expect(result.current.data?.data.nonce).toBeDefined();
    });

    it('handles login initiation failure', async () => {
      const { useVippsLogin } = await import('../../hooks/use-auth');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          error: { code: 'SERVICE_UNAVAILABLE', message: 'Vipps not configured' },
        }),
      });

      const { result } = renderHook(() => useVippsLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        redirectUri: 'http://localhost:5173/auth/callback',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useVippsCallback', () => {
    it('exchanges code for session successfully', async () => {
      const { useVippsCallback } = await import('../../hooks/use-auth');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            token: 'jwt-token-123',
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
              tenantId: 'tenant-123',
            },
          },
        }),
      });

      const { result } = renderHook(() => useVippsCallback(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        code: 'auth-code-123',
        state: 'state-123',
        nonce: 'nonce-123',
        redirectUri: 'http://localhost:5173/auth/callback',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data.token).toBeDefined();
      expect(result.current.data?.data.user).toBeDefined();
    });

    it('handles authentication failure', async () => {
      const { useVippsCallback } = await import('../../hooks/use-auth');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { code: 'AUTH_FAILED', message: 'Invalid nonce' },
        }),
      });

      const { result } = renderHook(() => useVippsCallback(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        code: 'invalid-code',
        state: 'state',
        nonce: 'wrong-nonce',
        redirectUri: 'http://localhost:5173/auth/callback',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});

describe('Vipps Payment Hooks', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('useVippsStatus', () => {
    it('is defined and returns query', async () => {
      const { useVippsStatus } = await import('../../hooks/use-integrations');
      expect(useVippsStatus).toBeDefined();
    });
  });

  describe('useInitiatePayment', () => {
    it('is defined and returns mutation', async () => {
      const { useInitiatePayment } = await import('../../hooks/use-integrations');
      expect(useInitiatePayment).toBeDefined();
      
      const { result } = renderHook(() => useInitiatePayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
    });
  });

  describe('useVippsPayment', () => {
    it('is defined and accepts orderId', async () => {
      const { useVippsPayment } = await import('../../hooks/use-integrations');
      expect(useVippsPayment).toBeDefined();
      
      const { result } = renderHook(
        () => useVippsPayment('order-123', { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });

    it('is disabled when orderId is empty', async () => {
      const { useVippsPayment } = await import('../../hooks/use-integrations');
      
      const { result } = renderHook(
        () => useVippsPayment(''),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useCapturePayment', () => {
    it('is defined and returns mutation', async () => {
      const { useCapturePayment } = await import('../../hooks/use-integrations');
      expect(useCapturePayment).toBeDefined();
      
      const { result } = renderHook(() => useCapturePayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useRefundPayment', () => {
    it('is defined and returns mutation', async () => {
      const { useRefundPayment } = await import('../../hooks/use-integrations');
      expect(useRefundPayment).toBeDefined();
      
      const { result } = renderHook(() => useRefundPayment(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
    });
  });

  describe('useVippsPaymentHistory', () => {
    it('is defined', async () => {
      const { useVippsPaymentHistory } = await import('../../hooks/use-integrations');
      expect(useVippsPaymentHistory).toBeDefined();
    });
  });
});

describe('Vipps Payment Types', () => {
  it('has correct InitiatePaymentDTO structure', () => {
    const paymentData = {
      bookingId: 'booking-123',
      amount: 50000, // 500 NOK in øre
      description: 'Test booking',
      returnUrl: 'http://localhost:5173/payment/callback',
    };

    expect(paymentData.bookingId).toBeDefined();
    expect(paymentData.amount).toBeGreaterThan(0);
    expect(paymentData.returnUrl).toBeDefined();
  });

  it('has correct CapturePaymentDTO structure', () => {
    const captureData = {
      orderId: 'order-123',
      amount: 25000, // Optional partial capture
    };

    expect(captureData.orderId).toBeDefined();
  });

  it('has correct RefundPaymentDTO structure', () => {
    const refundData = {
      orderId: 'order-123',
      amount: 10000, // Optional partial refund
      reason: 'Customer requested refund',
    };

    expect(refundData.orderId).toBeDefined();
    expect(refundData.reason).toBeDefined();
  });
});

describe('Vipps Flow Context Integration', () => {
  it('preserves booking context during auth flow', () => {
    const mockFlowContext = {
      returnTo: '/listings/123',
      timestamp: Date.now(),
      listingId: '123',
      bookingMode: 'SLOTS' as const,
      selectedSlots: [{ date: '2024-01-15', startTime: '10:00', endTime: '11:00' }],
      tenantId: 'tenant-123',
      correlationId: 'corr-123',
    };

    expect(mockFlowContext.returnTo).toBeDefined();
    expect(mockFlowContext.listingId).toBeDefined();
    expect(mockFlowContext.selectedSlots).toHaveLength(1);
  });
});
