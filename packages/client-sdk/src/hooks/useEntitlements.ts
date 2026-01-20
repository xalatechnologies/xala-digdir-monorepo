/**
 * Entitlements Hooks
 * React hooks for consuming entitlements in frontend applications
 */

import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../services';
import { queryKeys } from '../query-keys';

export interface EffectiveEntitlements {
  tenantId: string;
  userId: string;
  subscription: {
    planId: string;
    planName: string;
    status: string;
    tier: string;
  } | null;
  enabledModules: string[];
  enabledFeatures: string[];
  enabledIntegrations: string[];
  integrationStatuses: Record<string, {
    status: string;
    lastValidatedAt?: string;
    validationError?: string;
  }>;
  routes: Record<string, boolean>;
  navItems: Record<string, NavItem[]>;
  evaluatedAt: string;
  cacheUntil: string;
}

export interface NavItem {
  key: string;
  labelKey: string;
  routeKey?: string;
  iconKey?: string;
  parentKey?: string;
  order: number;
}

/**
 * Hook to get effective entitlements for current user
 * Automatically caches and respects ETag headers
 */
export function useEntitlements() {
  return useQuery({
    queryKey: queryKeys.entitlements.current(),
    queryFn: async () => {
      const response = await fetch('/api/me/entitlements', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entitlements');
      }

      return response.json() as Promise<EffectiveEntitlements>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if user can access a specific route
 */
export function useCanRoute(routeKey: string): boolean {
  const { data: entitlements } = useEntitlements();
  return entitlements?.routes[routeKey] ?? false;
}

/**
 * Hook to check if a feature is enabled
 */
export function useCanFeature(featureKey: string): boolean {
  const { data: entitlements } = useEntitlements();
  return entitlements?.enabledFeatures.includes(featureKey) ?? false;
}

/**
 * Hook to check if a module is enabled
 */
export function useCanModule(moduleKey: string): boolean {
  const { data: entitlements } = useEntitlements();
  return entitlements?.enabledModules.includes(moduleKey) ?? false;
}

/**
 * Hook to check if an integration is enabled and configured
 */
export function useIntegrationStatus(integrationKey: string) {
  const { data: entitlements } = useEntitlements();
  
  const isEnabled = entitlements?.enabledIntegrations.includes(integrationKey) ?? false;
  const status = entitlements?.integrationStatuses[integrationKey];

  return {
    isEnabled,
    isConfigured: status?.status === 'OK',
    status: status?.status || 'MISSING',
    lastValidatedAt: status?.lastValidatedAt,
    validationError: status?.validationError,
  };
}

/**
 * Hook to get navigation items for a specific app
 */
export function useNavItems(app: string) {
  return useQuery({
    queryKey: queryKeys.entitlements.navItems(app),
    queryFn: async () => {
      const response = await fetch(`/api/nav/${app}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nav items');
      }

      const data = await response.json();
      return data.items as NavItem[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!app,
  });
}

/**
 * Component guard for route protection
 */
export function RouteGuard({ 
  routeKey, 
  fallback, 
  children 
}: { 
  routeKey: string; 
  fallback?: ReactNode; 
  children: ReactNode;
}) {
  const canAccess = useCanRoute(routeKey);
  const { isLoading } = useEntitlements();

  if (isLoading) {
    return null; // or loading spinner
  }

  if (!canAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Component guard for feature gating
 */
export function FeatureGuard({ 
  featureKey, 
  fallback, 
  children 
}: { 
  featureKey: string; 
  fallback?: ReactNode; 
  children: ReactNode;
}) {
  const isEnabled = useCanFeature(featureKey);
  const { isLoading } = useEntitlements();

  if (isLoading) {
    return null;
  }

  if (!isEnabled) {
    return fallback || null;
  }

  return <>{children}</>;
}
