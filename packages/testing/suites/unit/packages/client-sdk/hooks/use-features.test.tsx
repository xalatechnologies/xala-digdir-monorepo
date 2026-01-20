/**
 * Feature Flags Hooks Tests
 * Tests for React hooks that access tenant features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useTenantFeatures,
  useFeature,
  useCategory,
  useEnabledCategories,
  useFeatureFlags,
  useAnyFeature,
  useAllFeatures,
} from '@digilist/api/use-features';
import * as clientFactory from '@digilist/api/core/client-factory';

// Mock the client factory
vi.mock('../../core/client-factory');

// SKIPPED
describe.skip('Feature Flags Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: any;

  const mockTenantFeatures = {
    data: {
      tenantId: 'tenant-123',
      tenantName: 'Test Tenant',
      enabledRentalObjectCategories: ['LOCALE', 'ARRANGEMENT'],
      featureFlags: {
        'backoffice.orgManagement': true,
        'backoffice.reporting': false,
        'backoffice.auditLog': true,
        'web.ratings': false,
      },
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Mock the API client
    vi.mocked(clientFactory.getClient).mockReturnValue({
      get: vi.fn().mockResolvedValue(mockTenantFeatures),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as any);
  });

  describe('useTenantFeatures', () => {
    it('should fetch tenant features', async () => {
      const { result } = renderHook(() => useTenantFeatures(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTenantFeatures.data);
    });

    it('should cache tenant features', async () => {
      const { result: result1 } = renderHook(() => useTenantFeatures(), { wrapper });
      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      const { result: result2 } = renderHook(() => useTenantFeatures(), { wrapper });
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // Should only call API once due to caching
      expect(clientFactory.getClient().get).toHaveBeenCalledTimes(1);
    });

    it('should use correct query key', async () => {
      const { result } = renderHook(() => useTenantFeatures(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clientFactory.getClient().get).toHaveBeenCalledWith('/api/me/features');
    });
  });

  describe('useFeature', () => {
    it('should return true for enabled feature', async () => {
      const { result } = renderHook(() => useFeature('backoffice.orgManagement'), { wrapper });

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('should return false for disabled feature', async () => {
      const { result } = renderHook(() => useFeature('backoffice.reporting'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });

    it('should return false for non-existent feature', async () => {
      const { result } = renderHook(() => useFeature('nonexistent.feature'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });

    it('should return false while loading', () => {
      const { result } = renderHook(() => useFeature('backoffice.orgManagement'), { wrapper });

      expect(result.current).toBe(false);
    });
  });

  describe('useCategory', () => {
    it('should return true for enabled category', async () => {
      const { result } = renderHook(() => useCategory('LOCALE'), { wrapper });

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('should return false for disabled category', async () => {
      const { result } = renderHook(() => useCategory('EQUIPMENT'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });

    it('should be case-sensitive', async () => {
      const { result } = renderHook(() => useCategory('locale'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });
  });

  describe('useEnabledCategories', () => {
    it('should return all enabled categories', async () => {
      const { result } = renderHook(() => useEnabledCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual(['LOCALE', 'ARRANGEMENT']);
      });
    });

    it('should return empty array while loading', () => {
      const { result } = renderHook(() => useEnabledCategories(), { wrapper });

      expect(result.current).toEqual([]);
    });
  });

  describe('useFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual({
          'backoffice.orgManagement': true,
          'backoffice.reporting': false,
          'backoffice.auditLog': true,
          'web.ratings': false,
        });
      });
    });

    it('should return empty object while loading', () => {
      const { result } = renderHook(() => useFeatureFlags(), { wrapper });

      expect(result.current).toEqual({});
    });
  });

  describe('useAnyFeature', () => {
    it('should return true if any feature is enabled', async () => {
      const { result } = renderHook(
        () => useAnyFeature(['backoffice.reporting', 'backoffice.orgManagement']),
        { wrapper }
      );

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('should return false if all features are disabled', async () => {
      const { result } = renderHook(
        () => useAnyFeature(['backoffice.reporting', 'web.ratings']),
        { wrapper }
      );

      await waitFor(() => expect(result.current).toBe(false));
    });

    it('should return false for empty array', async () => {
      const { result } = renderHook(() => useAnyFeature([]), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });
  });

  describe('useAllFeatures', () => {
    it('should return true if all features are enabled', async () => {
      const { result } = renderHook(
        () => useAllFeatures(['backoffice.orgManagement', 'backoffice.auditLog']),
        { wrapper }
      );

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('should return false if any feature is disabled', async () => {
      const { result } = renderHook(
        () => useAllFeatures(['backoffice.orgManagement', 'backoffice.reporting']),
        { wrapper }
      );

      await waitFor(() => expect(result.current).toBe(false));
    });

    it('should return true for empty array', async () => {
      const { result } = renderHook(() => useAllFeatures([]), { wrapper });

      await waitFor(() => expect(result.current).toBe(true));
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(clientFactory.getClient).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      const { result } = renderHook(() => useTenantFeatures(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should return false for features when error occurs', async () => {
      vi.mocked(clientFactory.getClient).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      } as any);

      const { result } = renderHook(() => useFeature('backoffice.orgManagement'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });
  });

  describe('Reactivity', () => {
    it('should update when features change', async () => {
      const { result, rerender } = renderHook(() => useFeature('backoffice.reporting'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));

      // Update mock data
      vi.mocked(clientFactory.getClient).mockReturnValue({
        get: vi.fn().mockResolvedValue({
          data: {
            ...mockTenantFeatures.data,
            featureFlags: {
              ...mockTenantFeatures.data.featureFlags,
              'backoffice.reporting': true,
            },
          },
        }),
      } as any);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['features', 'tenant'] });
      rerender();

      await waitFor(() => expect(result.current).toBe(true));
    });
  });
});
