/**
 * Unit Tests for Realtime React Hooks
 * Tests the useRealtimeMonitoring hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useRealtimeMonitoring } from '@digilist/api/use-realtime';
import type { RealtimeEvent, RealtimeEventHandler } from '@digilist/api/realtime';

// Mock the realtimeClient module
vi.mock('../../realtime', () => ({
  realtimeClient: {
    onMonitoring: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
    isConnected: false,
  },
}));

// Import the mocked module after mocking
import { realtimeClient } from '@digilist/api/realtime';

// SKIPPED
describe.skip('useRealtimeMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Hook Subscription', () => {
    it('should subscribe to monitoring events on mount', () => {
      const unsubscribe = vi.fn();
      realtimeClient.onMonitoring.mockReturnValue(unsubscribe);

      renderHook(() => useRealtimeMonitoring());

      expect(realtimeClient.onMonitoring).toHaveBeenCalledTimes(1);
      expect(realtimeClient.onMonitoring).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should unsubscribe from monitoring events on unmount', () => {
      const unsubscribe = vi.fn();
      realtimeClient.onMonitoring.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useRealtimeMonitoring());

      expect(unsubscribe).not.toHaveBeenCalled();

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Handler', () => {
    it('should call handler when monitoring event is received', () => {
      const handler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(handler));

      expect(capturedHandler).not.toBeNull();

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: { metric: 'cpu', value: 75 },
        timestamp: '2026-01-16T10:00:00Z',
        tenantId: 'test-tenant',
      };

      capturedHandler!(mockEvent);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle monitoring event with performance data', () => {
      const handler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(handler));

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: {
          metric: 'response_time',
          value: 250,
          endpoint: '/api/bookings',
          statusCode: 200,
        },
        timestamp: '2026-01-16T10:00:00Z',
      };

      capturedHandler!(mockEvent);

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle monitoring event with error data', () => {
      const handler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(handler));

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: {
          metric: 'error_rate',
          value: 0.05,
          errors: [
            { code: 'DB_TIMEOUT', count: 3 },
            { code: 'VALIDATION_ERROR', count: 2 },
          ],
        },
        timestamp: '2026-01-16T10:00:00Z',
      };

      capturedHandler!(mockEvent);

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should work without a handler', () => {
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring());

      expect(capturedHandler).not.toBeNull();

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: { metric: 'memory', value: 85 },
      };

      // Should not throw when no handler is provided
      expect(() => capturedHandler!(mockEvent)).not.toThrow();
    });
  });

  describe('Handler Updates', () => {
    it('should use latest handler when event is received', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      const { rerender } = renderHook(
        ({ handler }: { handler?: RealtimeEventHandler }) => useRealtimeMonitoring(handler),
        {
          initialProps: { handler: handler1 },
        }
      );

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: { metric: 'disk', value: 60 },
      };

      capturedHandler!(mockEvent);
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      // Update handler
      rerender({ handler: handler2 });

      capturedHandler!(mockEvent);
      expect(handler1).toHaveBeenCalledTimes(1); // Still 1
      expect(handler2).toHaveBeenCalledTimes(1); // Now called
    });

    it('should handle handler being removed', () => {
      const handler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      const { rerender } = renderHook(
        ({ handler }: { handler?: RealtimeEventHandler }) => useRealtimeMonitoring(handler),
        {
          initialProps: { handler },
        }
      );

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: { metric: 'network', value: 120 },
      };

      capturedHandler!(mockEvent);
      expect(handler).toHaveBeenCalledTimes(1);

      // Remove handler
      rerender({ handler: undefined });

      // Should not throw when handler is removed
      expect(() => capturedHandler!(mockEvent)).not.toThrow();
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('Multiple Events', () => {
    it('should handle multiple monitoring events', () => {
      const handler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(handler));

      const events: RealtimeEvent[] = [
        { type: 'monitoring', data: { metric: 'cpu', value: 75 } },
        { type: 'monitoring', data: { metric: 'memory', value: 85 } },
        { type: 'monitoring', data: { metric: 'disk', value: 60 } },
      ];

      events.forEach(event => capturedHandler!(event));

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, events[0]);
      expect(handler).toHaveBeenNthCalledWith(2, events[1]);
      expect(handler).toHaveBeenNthCalledWith(3, events[2]);
    });
  });

  describe('Re-subscription', () => {
    it('should not re-subscribe on re-renders', () => {
      const unsubscribe = vi.fn();
      realtimeClient.onMonitoring.mockReturnValue(unsubscribe);

      const { rerender } = renderHook(() => useRealtimeMonitoring());

      expect(realtimeClient.onMonitoring).toHaveBeenCalledTimes(1);

      rerender();
      rerender();
      rerender();

      // Should still only be called once (subscription happens in useEffect with empty deps)
      expect(realtimeClient.onMonitoring).toHaveBeenCalledTimes(1);
      expect(unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('Admin-Only Hook', () => {
    it('should be usable in admin contexts', () => {
      const adminHandler = vi.fn();
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(adminHandler));

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: {
          metric: 'system_health',
          status: 'healthy',
          services: {
            database: 'up',
            cache: 'up',
            queue: 'up',
          },
        },
        timestamp: '2026-01-16T10:00:00Z',
      };

      capturedHandler!(mockEvent);

      expect(adminHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle handler throwing an error gracefully', () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      let capturedHandler: RealtimeEventHandler | null = null;

      realtimeClient.onMonitoring.mockImplementation((cb: RealtimeEventHandler) => {
        capturedHandler = cb;
        return vi.fn();
      });

      renderHook(() => useRealtimeMonitoring(handler));

      const mockEvent: RealtimeEvent = {
        type: 'monitoring',
        data: { metric: 'cpu', value: 75 },
      };

      // The hook itself shouldn't throw - error handling is in realtimeClient
      expect(() => capturedHandler!(mockEvent)).toThrow('Handler error');
      expect(handler).toHaveBeenCalledWith(mockEvent);
    });
  });
});
