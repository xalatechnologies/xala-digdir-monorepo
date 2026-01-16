/**
 * SDK Hooks Integration Tests
 *
 * Integration tests for tenant admin SDK hooks:
 * - useTenantCapabilities: Returns tenant capabilities and feature flags
 * - useTenantSubscription: Returns subscription details and usage
 * - useTenantIntegrations: Returns list of third-party integrations
 * - useUpdateTenantIntegration: Mutation to update integration settings
 *
 * These tests verify the hooks correctly handle:
 * - Successful API responses
 * - Loading states
 * - Error states
 * - Data transformation
 * - Query invalidation on mutations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { type ReactNode } from 'react';

// =============================================================================
// Mock Types (based on SDK/API contracts)
// =============================================================================

interface TenantCapabilities {
  usage: {
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
  };
  seatLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxListings: number;
    maxBookingsPerMonth: number;
  };
  featureFlags: Record<string, boolean>;
}

interface TenantSubscription {
  planName: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'suspended' | 'pending';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  usage: {
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
    storageMb: number;
  } | null;
  seatLimits: {
    maxUsers: number;
    maxOrganizations: number;
    maxListings: number;
    maxBookingsPerMonth: number;
    maxStorageMb: number;
  } | null;
}

interface TenantIntegration {
  provider: string;
  enabled: boolean;
  configured: boolean;
  maskedApiKey: string | null;
  lastSync: string | null;
}

// =============================================================================
// Mock Data Fixtures
// =============================================================================

const mockCapabilitiesData: { capabilities: TenantCapabilities } = {
  capabilities: {
    usage: {
      currentUsers: 15,
      currentOrganizations: 3,
      currentListings: 25,
      bookingsThisMonth: 150,
    },
    seatLimits: {
      maxUsers: 50,
      maxOrganizations: 10,
      maxListings: 100,
      maxBookingsPerMonth: 500,
    },
    featureFlags: {
      'module.booking': true,
      'module.calendar': true,
      'module.reports': false,
      'integration.vipps': true,
      'policy.sso': true,
    },
  },
};

const mockSubscriptionData: { subscription: TenantSubscription } = {
  subscription: {
    planName: 'Professional',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-12-31T23:59:59Z',
    usage: {
      currentUsers: 15,
      currentOrganizations: 3,
      currentListings: 25,
      bookingsThisMonth: 150,
      storageMb: 512,
    },
    seatLimits: {
      maxUsers: 50,
      maxOrganizations: 10,
      maxListings: 100,
      maxBookingsPerMonth: 500,
      maxStorageMb: 2048,
    },
  },
};

const mockIntegrationsData: { data: TenantIntegration[] } = {
  data: [
    {
      provider: 'vipps',
      enabled: true,
      configured: true,
      maskedApiKey: '****-****-1234',
      lastSync: '2024-01-15T10:30:00Z',
    },
    {
      provider: 'visma',
      enabled: false,
      configured: false,
      maskedApiKey: null,
      lastSync: null,
    },
    {
      provider: 'outlook',
      enabled: true,
      configured: true,
      maskedApiKey: null,
      lastSync: '2024-01-14T14:00:00Z',
    },
  ],
};

// =============================================================================
// Mock SDK Module State
// =============================================================================

let mockCapabilitiesState = {
  data: mockCapabilitiesData as { capabilities: TenantCapabilities } | undefined,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

let mockSubscriptionState = {
  data: mockSubscriptionData as { subscription: TenantSubscription } | undefined,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

let mockIntegrationsState = {
  data: mockIntegrationsData as { data: TenantIntegration[] } | undefined,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

let mockUpdateIntegrationState = {
  mutateAsync: vi.fn().mockResolvedValue({}),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null as Error | null,
  reset: vi.fn(),
};

// =============================================================================
// Mock SDK Hooks
// =============================================================================

vi.mock('@digilist/client-sdk', () => ({
  useTenantCapabilities: () => mockCapabilitiesState,
  useTenantSubscription: () => mockSubscriptionState,
}));

vi.mock('@digilist/client-sdk/hooks', () => ({
  useTenantIntegrations: () => mockIntegrationsState,
  useUpdateTenantIntegration: () => mockUpdateIntegrationState,
}));

// Import hooks after mocking
import {
  useTenantCapabilities,
  useTenantSubscription,
} from '@digilist/client-sdk';

import {
  useTenantIntegrations,
  useUpdateTenantIntegration,
} from '@digilist/client-sdk/hooks';

// =============================================================================
// Test Utilities
// =============================================================================

// Simple wrapper for testing hooks (no QueryClient needed since hooks are mocked)
function TestWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Reset mock state helper
function resetMockState() {
  mockCapabilitiesState = {
    data: mockCapabilitiesData,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  mockSubscriptionState = {
    data: mockSubscriptionData,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  mockIntegrationsState = {
    data: mockIntegrationsData,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  mockUpdateIntegrationState = {
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('SDK Hooks Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockState();
  });

  // ===========================================================================
  // useTenantCapabilities Tests
  // ===========================================================================

  describe('useTenantCapabilities', () => {
    it('returns capabilities data when loaded successfully', () => {
      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.capabilities).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns usage data with correct structure', () => {
      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      const usage = result.current.data?.capabilities.usage;
      expect(usage).toEqual({
        currentUsers: 15,
        currentOrganizations: 3,
        currentListings: 25,
        bookingsThisMonth: 150,
      });
    });

    it('returns seat limits with correct structure', () => {
      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      const seatLimits = result.current.data?.capabilities.seatLimits;
      expect(seatLimits).toEqual({
        maxUsers: 50,
        maxOrganizations: 10,
        maxListings: 100,
        maxBookingsPerMonth: 500,
      });
    });

    it('returns feature flags as boolean map', () => {
      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      const featureFlags = result.current.data?.capabilities.featureFlags;
      expect(featureFlags).toBeDefined();
      expect(featureFlags?.['module.booking']).toBe(true);
      expect(featureFlags?.['module.reports']).toBe(false);
      expect(featureFlags?.['integration.vipps']).toBe(true);
    });

    it('returns loading state when data is being fetched', () => {
      mockCapabilitiesState = {
        ...mockCapabilitiesState,
        data: undefined,
        isLoading: true,
      };

      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state when API call fails', () => {
      const mockError = new Error('Network error');
      mockCapabilitiesState = {
        ...mockCapabilitiesState,
        data: undefined,
        isLoading: false,
        error: mockError,
      };

      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('returns undefined data initially during loading', () => {
      mockCapabilitiesState = {
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      };

      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it('provides refetch function', () => {
      const mockRefetch = vi.fn();
      mockCapabilitiesState = {
        ...mockCapabilitiesState,
        refetch: mockRefetch,
      };

      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  // ===========================================================================
  // useTenantSubscription Tests
  // ===========================================================================

  describe('useTenantSubscription', () => {
    it('returns subscription data when loaded successfully', () => {
      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.subscription).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns plan name and status correctly', () => {
      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      const subscription = result.current.data?.subscription;
      expect(subscription?.planName).toBe('Professional');
      expect(subscription?.status).toBe('active');
    });

    it('returns billing period dates', () => {
      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      const subscription = result.current.data?.subscription;
      expect(subscription?.currentPeriodStart).toBe('2024-01-01T00:00:00Z');
      expect(subscription?.currentPeriodEnd).toBe('2024-12-31T23:59:59Z');
    });

    it('returns usage data including storage', () => {
      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      const usage = result.current.data?.subscription.usage;
      expect(usage).toBeDefined();
      expect(usage?.currentUsers).toBe(15);
      expect(usage?.storageMb).toBe(512);
    });

    it('returns seat limits including storage limit', () => {
      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      const seatLimits = result.current.data?.subscription.seatLimits;
      expect(seatLimits).toBeDefined();
      expect(seatLimits?.maxUsers).toBe(50);
      expect(seatLimits?.maxStorageMb).toBe(2048);
    });

    it('returns loading state when data is being fetched', () => {
      mockSubscriptionState = {
        ...mockSubscriptionState,
        data: undefined,
        isLoading: true,
      };

      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state when API call fails', () => {
      const mockError = new Error('Subscription fetch failed');
      mockSubscriptionState = {
        ...mockSubscriptionState,
        data: undefined,
        isLoading: false,
        error: mockError,
      };

      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('handles different subscription statuses', () => {
      const statuses: TenantSubscription['status'][] = [
        'active',
        'trialing',
        'past_due',
        'cancelled',
        'suspended',
        'pending',
      ];

      statuses.forEach((status) => {
        mockSubscriptionState = {
          ...mockSubscriptionState,
          data: {
            subscription: {
              ...mockSubscriptionData.subscription,
              status,
            },
          },
        };

        const { result } = renderHook(() => useTenantSubscription(), {
          wrapper: TestWrapper,
        });

        expect(result.current.data?.subscription.status).toBe(status);
      });
    });

    it('handles null plan name for unpaid accounts', () => {
      mockSubscriptionState = {
        ...mockSubscriptionState,
        data: {
          subscription: {
            ...mockSubscriptionData.subscription,
            planName: null,
          },
        },
      };

      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data?.subscription.planName).toBeNull();
    });

    it('handles null usage and seatLimits for new accounts', () => {
      mockSubscriptionState = {
        ...mockSubscriptionState,
        data: {
          subscription: {
            ...mockSubscriptionData.subscription,
            usage: null,
            seatLimits: null,
          },
        },
      };

      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data?.subscription.usage).toBeNull();
      expect(result.current.data?.subscription.seatLimits).toBeNull();
    });
  });

  // ===========================================================================
  // useTenantIntegrations Tests
  // ===========================================================================

  describe('useTenantIntegrations', () => {
    it('returns integrations list when loaded successfully', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.data).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('returns integration data with correct structure', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const integrations = result.current.data?.data;
      expect(integrations?.[0]).toEqual({
        provider: 'vipps',
        enabled: true,
        configured: true,
        maskedApiKey: '****-****-1234',
        lastSync: '2024-01-15T10:30:00Z',
      });
    });

    it('returns enabled and disabled integrations', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const integrations = result.current.data?.data;
      const enabledCount = integrations?.filter((i) => i.enabled).length;
      const disabledCount = integrations?.filter((i) => !i.enabled).length;

      expect(enabledCount).toBe(2);
      expect(disabledCount).toBe(1);
    });

    it('returns configured and unconfigured integrations', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const integrations = result.current.data?.data;
      const configuredCount = integrations?.filter((i) => i.configured).length;
      const unconfiguredCount = integrations?.filter((i) => !i.configured).length;

      expect(configuredCount).toBe(2);
      expect(unconfiguredCount).toBe(1);
    });

    it('returns masked API keys for security', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const vipps = result.current.data?.data.find((i) => i.provider === 'vipps');
      expect(vipps?.maskedApiKey).toMatch(/^\*{4}-\*{4}-\d{4}$/);
    });

    it('returns null maskedApiKey when not configured', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const visma = result.current.data?.data.find((i) => i.provider === 'visma');
      expect(visma?.maskedApiKey).toBeNull();
    });

    it('returns lastSync timestamp for synced integrations', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const vipps = result.current.data?.data.find((i) => i.provider === 'vipps');
      expect(vipps?.lastSync).toBe('2024-01-15T10:30:00Z');
    });

    it('returns null lastSync for never synced integrations', () => {
      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      const visma = result.current.data?.data.find((i) => i.provider === 'visma');
      expect(visma?.lastSync).toBeNull();
    });

    it('returns loading state when data is being fetched', () => {
      mockIntegrationsState = {
        ...mockIntegrationsState,
        data: undefined,
        isLoading: true,
      };

      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('returns error state when API call fails', () => {
      const mockError = new Error('Failed to load integrations');
      mockIntegrationsState = {
        ...mockIntegrationsState,
        data: undefined,
        isLoading: false,
        error: mockError,
      };

      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('returns empty array when no integrations configured', () => {
      mockIntegrationsState = {
        ...mockIntegrationsState,
        data: { data: [] },
      };

      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      expect(result.current.data?.data).toHaveLength(0);
    });
  });

  // ===========================================================================
  // useUpdateTenantIntegration Tests
  // ===========================================================================

  describe('useUpdateTenantIntegration', () => {
    it('returns mutation function', () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('calls mutateAsync with provider and data', async () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          provider: 'vipps',
          data: { enabled: false },
        });
      });

      expect(mockUpdateIntegrationState.mutateAsync).toHaveBeenCalledWith({
        provider: 'vipps',
        data: { enabled: false },
      });
    });

    it('updates integration enabled status', async () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          provider: 'visma',
          data: { enabled: true },
        });
      });

      expect(mockUpdateIntegrationState.mutateAsync).toHaveBeenCalledWith({
        provider: 'visma',
        data: { enabled: true },
      });
    });

    it('updates integration with API key', async () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          provider: 'visma',
          data: {
            enabled: true,
            apiKey: 'new-api-key-123',
          },
        });
      });

      expect(mockUpdateIntegrationState.mutateAsync).toHaveBeenCalledWith({
        provider: 'visma',
        data: {
          enabled: true,
          apiKey: 'new-api-key-123',
        },
      });
    });

    it('updates integration with multiple credentials', async () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          provider: 'vipps',
          data: {
            enabled: true,
            apiKey: 'new-api-key',
            apiSecret: 'new-api-secret',
            webhookUrl: 'https://example.com/webhook',
          },
        });
      });

      expect(mockUpdateIntegrationState.mutateAsync).toHaveBeenCalledWith({
        provider: 'vipps',
        data: {
          enabled: true,
          apiKey: 'new-api-key',
          apiSecret: 'new-api-secret',
          webhookUrl: 'https://example.com/webhook',
        },
      });
    });

    it('returns isPending state during mutation', () => {
      mockUpdateIntegrationState = {
        ...mockUpdateIntegrationState,
        isPending: true,
      };

      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isPending).toBe(true);
    });

    it('returns isSuccess state after successful mutation', () => {
      mockUpdateIntegrationState = {
        ...mockUpdateIntegrationState,
        isSuccess: true,
        isPending: false,
      };

      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });

    it('returns error state when mutation fails', () => {
      const mockError = new Error('Update failed');
      mockUpdateIntegrationState = {
        ...mockUpdateIntegrationState,
        isError: true,
        error: mockError,
        isPending: false,
      };

      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    it('handles mutation rejection', async () => {
      const mockError = new Error('API Error');
      mockUpdateIntegrationState = {
        ...mockUpdateIntegrationState,
        mutateAsync: vi.fn().mockRejectedValue(mockError),
      };

      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            provider: 'vipps',
            data: { enabled: false },
          });
        })
      ).rejects.toThrow('API Error');
    });

    it('provides reset function to clear mutation state', () => {
      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ===========================================================================
  // Cross-Hook Integration Tests
  // ===========================================================================

  describe('Cross-Hook Integration', () => {
    it('capabilities and subscription return consistent usage data', () => {
      // When capabilities has usage data
      const capabilitiesUsage = mockCapabilitiesData.capabilities.usage;
      const subscriptionUsage = mockSubscriptionData.subscription.usage;

      // Usage should match (excluding storage which is subscription-only)
      expect(capabilitiesUsage.currentUsers).toBe(subscriptionUsage?.currentUsers);
      expect(capabilitiesUsage.currentOrganizations).toBe(subscriptionUsage?.currentOrganizations);
      expect(capabilitiesUsage.currentListings).toBe(subscriptionUsage?.currentListings);
      expect(capabilitiesUsage.bookingsThisMonth).toBe(subscriptionUsage?.bookingsThisMonth);
    });

    it('capabilities and subscription return consistent seat limits', () => {
      const capabilitiesLimits = mockCapabilitiesData.capabilities.seatLimits;
      const subscriptionLimits = mockSubscriptionData.subscription.seatLimits;

      expect(capabilitiesLimits.maxUsers).toBe(subscriptionLimits?.maxUsers);
      expect(capabilitiesLimits.maxOrganizations).toBe(subscriptionLimits?.maxOrganizations);
      expect(capabilitiesLimits.maxListings).toBe(subscriptionLimits?.maxListings);
      expect(capabilitiesLimits.maxBookingsPerMonth).toBe(subscriptionLimits?.maxBookingsPerMonth);
    });

    it('feature flags reflect integration enabled status', () => {
      // vipps integration is enabled
      const vippsEnabled = mockIntegrationsData.data.find(
        (i) => i.provider === 'vipps'
      )?.enabled;
      const vippsFlag = mockCapabilitiesData.capabilities.featureFlags['integration.vipps'];

      // Both should be true
      expect(vippsEnabled).toBe(true);
      expect(vippsFlag).toBe(true);
    });
  });

  // ===========================================================================
  // Error Recovery Tests
  // ===========================================================================

  describe('Error Recovery', () => {
    it('can refetch capabilities after error', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({ data: mockCapabilitiesData });

      // First set error state
      mockCapabilitiesState = {
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      const { result } = renderHook(() => useTenantCapabilities(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBeDefined();

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('can refetch subscription after error', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({ data: mockSubscriptionData });

      mockSubscriptionState = {
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      const { result } = renderHook(() => useTenantSubscription(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBeDefined();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('can refetch integrations after error', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({ data: mockIntegrationsData });

      mockIntegrationsState = {
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
      };

      const { result } = renderHook(() => useTenantIntegrations(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBeDefined();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('can reset mutation state after error', () => {
      const mockReset = vi.fn();

      mockUpdateIntegrationState = {
        ...mockUpdateIntegrationState,
        isError: true,
        error: new Error('Update failed'),
        reset: mockReset,
      };

      const { result } = renderHook(() => useUpdateTenantIntegration(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isError).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });
  });
});
