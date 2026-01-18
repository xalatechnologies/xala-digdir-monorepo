/**
 * Retry Infrastructure Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  withRetry,
  isRetryableError,
  DEFAULT_RETRY_POLICY,
  CRITICAL_RETRY_POLICY,
  clearDLQ,
  getDLQEntries,
  getDLQStats,
} from '../retry/retry';
import { ApiError } from '../errors/api-error';

describe('Retry Infrastructure', () => {
  beforeEach(() => {
    clearDLQ();
  });

  describe('isRetryableError', () => {
    it('should return true for retryable status codes', () => {
      const error408 = new ApiError({ type: '/e', title: 'Timeout', status: 408 });
      const error429 = new ApiError({ type: '/e', title: 'Rate Limit', status: 429 });
      const error503 = new ApiError({ type: '/e', title: 'Unavailable', status: 503 });

      expect(isRetryableError(error408, DEFAULT_RETRY_POLICY)).toBe(true);
      expect(isRetryableError(error429, DEFAULT_RETRY_POLICY)).toBe(true);
      expect(isRetryableError(error503, DEFAULT_RETRY_POLICY)).toBe(true);
    });

    it('should return false for non-retryable status codes', () => {
      const error400 = new ApiError({ type: '/e', title: 'Bad Request', status: 400 });
      const error404 = new ApiError({ type: '/e', title: 'Not Found', status: 404 });

      expect(isRetryableError(error400, DEFAULT_RETRY_POLICY)).toBe(false);
      expect(isRetryableError(error404, DEFAULT_RETRY_POLICY)).toBe(false);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network error');
      (error as Error & { code?: string }).code = 'NETWORK_ERROR';

      expect(isRetryableError(error, DEFAULT_RETRY_POLICY)).toBe(true);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue({ data: 'success' });

      const result = await withRetry(operation, {
        operationType: 'test',
        operationId: 'test-1',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ data: 'success' });
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new ApiError({ type: '/e', title: 'Error', status: 503 }))
        .mockResolvedValueOnce({ data: 'success' });

      const result = await withRetry(operation, {
        operationType: 'test',
        operationId: 'test-2',
        policy: { ...DEFAULT_RETRY_POLICY, initialDelayMs: 10 },
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Bad Request', status: 400 }));

      const result = await withRetry(operation, {
        operationType: 'test',
        operationId: 'test-3',
        policy: { ...DEFAULT_RETRY_POLICY, initialDelayMs: 10 },
      });

      expect(result.success).toBe(false);
      // 400 is not a retryable status code, should break immediately
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new ApiError({ type: '/e', title: 'Error', status: 503 }))
        .mockResolvedValueOnce('ok');

      await withRetry(operation, {
        operationType: 'test',
        operationId: 'test-4',
        policy: { ...DEFAULT_RETRY_POLICY, initialDelayMs: 10 },
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.objectContaining({ attempt: 1 }),
        expect.any(Error)
      );
    });

    it('should send to DLQ after max attempts', async () => {
      const onDLQ = vi.fn();
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Error', status: 503 }));

      const result = await withRetry(operation, {
        operationType: 'payment',
        operationId: 'order-123',
        tenantId: 'tenant-1',
        payload: { amount: 100 },
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 2, initialDelayMs: 10 },
        onDLQ,
      });

      expect(result.success).toBe(false);
      expect(result.dlq).toBe(true);
      expect(onDLQ).toHaveBeenCalledTimes(1);
      expect(onDLQ).toHaveBeenCalledWith(
        expect.objectContaining({
          operationType: 'payment',
          operationId: 'order-123',
          payload: { amount: 100 },
          tenantId: 'tenant-1',
        })
      );
    });

    it('should use critical policy for more retries', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Error', status: 503 }));

      await withRetry(operation, {
        operationType: 'test',
        operationId: 'test-critical',
        policy: { ...CRITICAL_RETRY_POLICY, initialDelayMs: 1 },
      });

      expect(operation).toHaveBeenCalledTimes(CRITICAL_RETRY_POLICY.maxAttempts);
    });
  });

  describe('DLQ Management', () => {
    it('should store and retrieve DLQ entries', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Error', status: 503 }));

      await withRetry(operation, {
        operationType: 'payment',
        operationId: 'order-123',
        tenantId: 'tenant-1',
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, initialDelayMs: 1 },
        onDLQ: async () => {},
      });

      const entries = getDLQEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].operationType).toBe('payment');
    });

    it('should filter DLQ entries by operation type', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Error', status: 503 }));

      await withRetry(operation, {
        operationType: 'payment',
        operationId: 'p1',
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, initialDelayMs: 1 },
        onDLQ: async () => {},
      });

      await withRetry(operation, {
        operationType: 'email',
        operationId: 'e1',
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, initialDelayMs: 1 },
        onDLQ: async () => {},
      });

      const paymentEntries = getDLQEntries({ operationType: 'payment' });
      expect(paymentEntries).toHaveLength(1);
    });

    it('should provide DLQ statistics', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new ApiError({ type: '/e', title: 'Error', status: 503 }));

      await withRetry(operation, {
        operationType: 'payment',
        operationId: 'p1',
        tenantId: 'tenant-1',
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, initialDelayMs: 1 },
        onDLQ: async () => {},
      });

      await withRetry(operation, {
        operationType: 'payment',
        operationId: 'p2',
        tenantId: 'tenant-2',
        policy: { ...DEFAULT_RETRY_POLICY, maxAttempts: 1, initialDelayMs: 1 },
        onDLQ: async () => {},
      });

      const stats = getDLQStats();
      expect(stats.total).toBe(2);
      expect(stats.byOperationType['payment']).toBe(2);
      expect(stats.byTenant['tenant-1']).toBe(1);
      expect(stats.byTenant['tenant-2']).toBe(1);
    });
  });
});
