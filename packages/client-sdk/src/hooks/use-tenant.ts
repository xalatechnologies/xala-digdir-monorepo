/**
 * Tenant Admin Hooks
 * Hooks for tenant administration including capabilities and subscription data
 */

import { useQuery } from '@tanstack/react-query';

// Query keys for tenant admin hooks
export const tenantKeys = {
  all: ['tenant'] as const,
  capabilities: () => [...tenantKeys.all, 'capabilities'] as const,
  subscription: () => [...tenantKeys.all, 'subscription'] as const,
  integrations: () => [...tenantKeys.all, 'integrations'] as const,
};

/**
 * Usage data type for tenant capabilities
 */
export interface TenantUsage {
  currentUsers: number;
  currentOrganizations: number;
  currentListings: number;
  bookingsThisMonth: number;
}

/**
 * Seat limits type for tenant
 */
export interface TenantSeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
}

/**
 * Feature flags map
 */
export interface TenantFeatureFlags {
  [key: string]: boolean;
}

/**
 * Tenant capabilities response
 */
export interface TenantCapabilities {
  usage: TenantUsage;
  seatLimits: TenantSeatLimits;
  featureFlags: TenantFeatureFlags;
}

/**
 * Tenant subscription data
 */
export interface TenantSubscription {
  status: 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';
  planName: string;
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: TenantUsage;
  seatLimits: TenantSeatLimits;
}

/**
 * Integration settings
 */
export interface IntegrationSettings {
  id: string;
  name: string;
  enabled: boolean;
  type: 'access_control' | 'invoicing' | 'calendar' | 'payment' | 'analytics' | 'other';
  description?: string;
  configRequired: boolean;
  credentials?: {
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Mock data for capabilities (demo mode)
 */
const mockCapabilities: TenantCapabilities = {
  usage: {
    currentUsers: 12,
    currentOrganizations: 5,
    currentListings: 45,
    bookingsThisMonth: 328,
  },
  seatLimits: {
    maxUsers: 25,
    maxOrganizations: 10,
    maxListings: 100,
    maxBookingsPerMonth: 500,
  },
  featureFlags: {
    'module.seasonal_leases': true,
    'module.messaging': true,
    'module.reviews': true,
    'integration.visma': true,
    'integration.rco_access': false,
    'integration.vipps': true,
    'policy.require_org_for_booking': false,
    'policy.allow_anonymous_booking': true,
    'module.audit_log': true,
    'module.custom_branding': true,
    'module.api_access': false,
    'integration.google_calendar': true,
  },
};

/**
 * Mock data for subscription (demo mode)
 */
const mockSubscription: TenantSubscription = {
  status: 'active',
  planName: 'Professional',
  planId: 'pro-monthly',
  currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  usage: mockCapabilities.usage,
  seatLimits: mockCapabilities.seatLimits,
};

/**
 * Mock integrations data
 */
const mockIntegrations: IntegrationSettings[] = [
  {
    id: 'visma',
    name: 'Visma Business',
    enabled: true,
    type: 'invoicing',
    description: 'Integration for invoice generation and accounting',
    configRequired: true,
    credentials: {
      apiKey: '****-****-****-****',
    },
  },
  {
    id: 'rco-access',
    name: 'RCO Access Control',
    enabled: false,
    type: 'access_control',
    description: 'Smart lock integration for automated access',
    configRequired: true,
  },
  {
    id: 'vipps',
    name: 'Vipps',
    enabled: true,
    type: 'payment',
    description: 'Mobile payment integration',
    configRequired: true,
    credentials: {
      merchantId: '12345',
    },
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    enabled: true,
    type: 'calendar',
    description: 'Calendar sync for bookings',
    configRequired: false,
  },
];

/**
 * Hook to fetch tenant capabilities
 * Returns usage stats, seat limits, and feature flags
 */
export function useTenantCapabilities() {
  return useQuery({
    queryKey: tenantKeys.capabilities(),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { capabilities: mockCapabilities };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch tenant subscription details
 * Returns plan info, status, and usage limits
 */
export function useTenantSubscription() {
  return useQuery({
    queryKey: tenantKeys.subscription(),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { subscription: mockSubscription };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch tenant integrations
 * Returns list of available and configured integrations
 */
export function useTenantIntegrations() {
  return useQuery({
    queryKey: tenantKeys.integrations(),
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { integrations: mockIntegrations };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update an integration's enabled status or credentials
 */
export function useUpdateTenantIntegration() {
  // This is a mutation hook - for now return a mock implementation
  return {
    mutateAsync: async (data: { id: string; enabled?: boolean; credentials?: Record<string, string> }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, id: data.id };
    },
    isPending: false,
    isError: false,
    error: null,
  };
}
