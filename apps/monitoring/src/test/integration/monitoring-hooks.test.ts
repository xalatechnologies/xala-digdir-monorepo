/**
 * Integration Tests for Monitoring Hooks
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useMonitoringOverview,
  useIncidents,
  useSyntheticMonitors,
} from '@digilist/client-sdk/hooks';
import {
  mockMonitoringOverview,
  mockIncidents,
  mockSyntheticMonitors,
} from '../fixtures/monitoring-data';

// Mock the monitoring service
vi.mock('@digilist/client-sdk', async () => {
  const actual = await vi.importActual('@digilist/client-sdk');
  return {
    ...actual,
    monitoringExtendedService: {
      getOverview: vi.fn().mockResolvedValue(mockMonitoringOverview),
      getIncidents: vi.fn().mockResolvedValue({
        data: mockIncidents,
        meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
      }),
      getSyntheticMonitors: vi.fn().mockResolvedValue({
        data: mockSyntheticMonitors,
        meta: { total: 2 },
      }),
    },
  };
});

describe('Monitoring Hooks Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useMonitoringOverview', () => {
    it('fetches monitoring overview data', async () => {
      const { result } = renderHook(() => useMonitoringOverview(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMonitoringOverview);
      expect(result.current.data?.health.status).toBe('healthy');
      expect(result.current.data?.metrics.cpu).toBe(45);
    });

    it('handles loading state', () => {
      const { result } = renderHook(() => useMonitoringOverview(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useIncidents', () => {
    it('fetches incidents list', async () => {
      const { result } = renderHook(() => useIncidents(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(2);
      expect(result.current.data?.data[0].title).toBe('API Latency Spike');
    });

    it('supports filtering', async () => {
      const filter = { severity: ['critical'] };
      const { result } = renderHook(() => useIncidents(filter), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useSyntheticMonitors', () => {
    it('fetches synthetic monitors', async () => {
      const { result } = renderHook(() => useSyntheticMonitors(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(2);
      expect(result.current.data?.data[0].name).toBe('API Health Check');
    });
  });
});
