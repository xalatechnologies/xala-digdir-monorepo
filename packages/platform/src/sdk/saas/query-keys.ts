/**
 * SaaS Query Keys - @xalatechnologies/platform/sdk/saas
 * 
 * Standardized query keys for React Query cache management
 */
import type { SaasTenantQueryParams, PlanQueryParams, FeatureFlagsQueryParams } from './types';

export const saasQueryKeys = {
  all: ['saas'] as const,

  // Me (Current admin)
  me: () => [...saasQueryKeys.all, 'me'] as const,

  // Tenants
  tenants: {
    all: () => [...saasQueryKeys.all, 'tenants'] as const,
    lists: () => [...saasQueryKeys.tenants.all(), 'list'] as const,
    list: (params?: SaasTenantQueryParams) =>
      [...saasQueryKeys.tenants.lists(), params ?? {}] as const,
    details: () => [...saasQueryKeys.tenants.all(), 'detail'] as const,
    detail: (id: string) => [...saasQueryKeys.tenants.details(), id] as const,
    flags: (id: string) => [...saasQueryKeys.tenants.detail(id), 'flags'] as const,
    billing: (id: string) => [...saasQueryKeys.tenants.detail(id), 'billing'] as const,
    secrets: (id: string) => [...saasQueryKeys.tenants.detail(id), 'secrets'] as const,
    categories: (id: string) =>
      [...saasQueryKeys.tenants.detail(id), 'categories'] as const,
  },

  // Plans
  plans: {
    all: () => [...saasQueryKeys.all, 'plans'] as const,
    lists: () => [...saasQueryKeys.plans.all(), 'list'] as const,
    list: (params?: PlanQueryParams) =>
      [...saasQueryKeys.plans.lists(), params ?? {}] as const,
    details: () => [...saasQueryKeys.plans.all(), 'detail'] as const,
    detail: (id: string) => [...saasQueryKeys.plans.details(), id] as const,
  },

  // Feature Flags
  featureFlags: {
    all: () => [...saasQueryKeys.all, 'featureFlags'] as const,
    catalog: (params?: FeatureFlagsQueryParams) =>
      [...saasQueryKeys.featureFlags.all(), 'catalog', params ?? {}] as const,
  },

  // Billing
  billing: {
    all: () => [...saasQueryKeys.all, 'billing'] as const,
    overview: () => [...saasQueryKeys.billing.all(), 'overview'] as const,
  },

  // Scanners (Monitoring)
  scanners: {
    all: () => [...saasQueryKeys.all, 'scanners'] as const,
    status: (scanner: string) => [...saasQueryKeys.scanners.all(), 'status', scanner] as const,
    lastResult: (scanner: string) => [...saasQueryKeys.scanners.all(), 'result', scanner] as const,
    allStatuses: () => [...saasQueryKeys.scanners.all(), 'statuses'] as const,
  },

  // Audit Log
  audit: {
    all: () => [...saasQueryKeys.all, 'audit'] as const,
    lists: () => [...saasQueryKeys.audit.all(), 'list'] as const,
    list: (params?: object) => [...saasQueryKeys.audit.lists(), params ?? {}] as const,
    stats: () => [...saasQueryKeys.audit.all(), 'stats'] as const,
    detail: (id: string) => [...saasQueryKeys.audit.all(), 'detail', id] as const,
  },
} as const;
