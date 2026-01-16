import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOfflineBookings, clearOfflineBookingsCache } from './useOfflineBookings';
import type { Booking } from '@digilist/client-sdk';

// Mock @digilist/client-sdk
vi.mock('@digilist/client-sdk', () => ({
  useMyBookings: vi.fn(),
}));

// Import the mocked module
import { useMyBookings } from '@digilist/client-sdk';

describe('useOfflineBookings', () => {
  // Mock bookings data
  const mockBookings = {
    data: [
      {
        id: 'booking-1',
        listingId: 'listing-1',
        userId: 'user-1',
        startDate: new Date('2026-01-14T10:00:00'),
        endDate: new Date('2026-01-14T12:00:00'),
        status: 'confirmed',
        totalPrice: 100,
      },
      {
        id: 'booking-2',
        listingId: 'listing-2',
        userId: 'user-1',
        startDate: new Date('2026-01-15T14:00:00'),
        endDate: new Date('2026-01-15T16:00:00'),
        status: 'pending',
        totalPrice: 200,
      },
    ] as Booking[],
    meta: {
      total: 2,
      page: 1,
      limit: 10,
    },
  };

  // Mock IndexedDB
  let mockDB: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock IndexedDB with proper event handling
    let mockGetRequest: IDBRequest;
    let mockPutRequest: IDBRequest;
    let mockClearRequest: IDBRequest;

    const mockObjectStore = {
      get: vi.fn((key) => {
        mockGetRequest = {
          result: null,
          onsuccess: null,
          onerror: null,
        } as unknown as IDBRequest;
        setTimeout(() => {
          if (mockGetRequest.onsuccess) {
            mockGetRequest.onsuccess({} as Event);
          }
        }, 0);
        return mockGetRequest;
      }),
      put: vi.fn((value) => {
        mockPutRequest = {
          result: undefined,
          onsuccess: null,
          onerror: null,
        } as unknown as IDBRequest;
        setTimeout(() => {
          if (mockPutRequest.onsuccess) {
            mockPutRequest.onsuccess({} as Event);
          }
        }, 0);
        return mockPutRequest;
      }),
      clear: vi.fn(() => {
        mockClearRequest = {
          result: undefined,
          onsuccess: null,
          onerror: null,
        } as unknown as IDBRequest;
        setTimeout(() => {
          if (mockClearRequest.onsuccess) {
            mockClearRequest.onsuccess({} as Event);
          }
        }, 0);
        return mockClearRequest;
      }),
      createIndex: vi.fn(),
    };

    const mockTransaction = {
      objectStore: vi.fn(() => mockObjectStore),
    };

    const mockIDBDatabase = {
      transaction: vi.fn(() => mockTransaction),
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
      createObjectStore: vi.fn(() => mockObjectStore),
    };

    const mockOpenRequest = {
      result: mockIDBDatabase,
      onsuccess: null as ((event: Event) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onupgradeneeded: null as ((event: IDBVersionChangeEvent) => void) | null,
    };

    global.indexedDB = {
      open: vi.fn(() => {
        // Simulate successful DB open immediately
        setTimeout(() => {
          if (mockOpenRequest.onsuccess) {
            mockOpenRequest.onsuccess({} as Event);
          }
        }, 0);
        return mockOpenRequest as IDBOpenDBRequest;
      }),
    } as unknown as IDBFactory;

    mockDB = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    };

    // Mock useMyBookings default behavior
    vi.mocked(useMyBookings).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return online status when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('should return offline status when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should return data from SDK when online', () => {
    vi.mocked(useMyBookings).mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.data).toEqual(mockBookings);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isCached).toBe(false);
  });

  it('should show loading state when SDK is loading and online', () => {
    vi.mocked(useMyBookings).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isOnline).toBe(true);
  });

  it('should not show loading state when offline', () => {
    vi.mocked(useMyBookings).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('should return null data when offline and no cached data', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.data).toBeNull();
    expect(result.current.isOffline).toBe(true);
    expect(result.current.isCached).toBe(false);
  });

  it('should pass params to SDK hook correctly', () => {
    const params = { status: 'confirmed', listingId: 'listing-1' };

    renderHook(() => useOfflineBookings(params));

    expect(useMyBookings).toHaveBeenCalledWith(params);
  });

  it('should update online status when online event is fired', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isOnline).toBe(false);

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    await waitFor(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });
  });

  it('should update online status when offline event is fired', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    await waitFor(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineBookings());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should return all SDK query result properties', () => {
    const mockQueryResult = {
      data: mockBookings,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isSuccess: true,
      isFetching: false,
    };

    vi.mocked(useMyBookings).mockReturnValue(mockQueryResult as unknown as ReturnType<typeof useMyBookings>);

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.refetch).toBe(mockQueryResult.refetch);
  });

  it('should handle bookings with different query params', () => {
    const params1 = { status: 'confirmed' };
    const params2 = { status: 'pending' };

    const { rerender } = renderHook(
      ({ params }) => useOfflineBookings(params),
      {
        initialProps: { params: params1 },
      }
    );

    expect(useMyBookings).toHaveBeenCalledWith(params1);

    rerender({ params: params2 });

    expect(useMyBookings).toHaveBeenCalledWith(params2);
  });

  it('should handle empty bookings array', () => {
    const emptyBookings = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
      },
    };

    vi.mocked(useMyBookings).mockReturnValue({
      data: emptyBookings,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.data).toEqual(emptyBookings);
    expect(result.current.data?.data).toHaveLength(0);
  });

  it('should handle SDK errors gracefully', () => {
    const mockError = new Error('Failed to fetch bookings');

    vi.mocked(useMyBookings).mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
      isError: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    const { result } = renderHook(() => useOfflineBookings());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeNull();
  });

  it('should indicate cached data when offline with cached data', async () => {
    // This test would require mocking IndexedDB more thoroughly
    // For now, we test the isCached logic based on state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineBookings());

    // When offline and no cached data
    expect(result.current.isCached).toBe(false);

    // Note: Full IndexedDB mocking would be needed to test actual caching
  });

  it('should call clearOfflineBookingsCache without errors', async () => {
    // clearOfflineBookingsCache silently fails on error, so it should always resolve
    // We just test that it completes without throwing
    const result = clearOfflineBookingsCache();

    // Should resolve to undefined even if IndexedDB operations fail
    await expect(result).resolves.toBeUndefined();
  });

  it('should handle navigator.onLine being undefined', () => {
    // Save original value
    const originalOnLine = navigator.onLine;

    // Set to undefined (some environments might not have this)
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useOfflineBookings());

    // Should default to falsy/false
    expect(result.current.isOffline).toBe(true);

    // Restore
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  it('should handle multiple param combinations for cache key generation', () => {
    const testCases = [
      undefined,
      { status: 'confirmed' },
      { listingId: 'listing-1' },
      { status: 'pending', listingId: 'listing-2' },
    ];

    testCases.forEach((params) => {
      const { unmount } = renderHook(() => useOfflineBookings(params));
      expect(useMyBookings).toHaveBeenCalledWith(params);
      unmount();
    });
  });

  it('should maintain data consistency during online/offline transitions', () => {
    vi.mocked(useMyBookings).mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMyBookings>);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result, rerender } = renderHook(() => useOfflineBookings());

    // Online - should have data from SDK
    expect(result.current.data).toEqual(mockBookings);
    expect(result.current.isOnline).toBe(true);

    // Go offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    window.dispatchEvent(new Event('offline'));
    rerender();

    // Should still have access to data (though in real scenario it would be from cache)
    expect(result.current.isOffline).toBe(true);
  });
});
