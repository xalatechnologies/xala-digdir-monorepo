import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  TenantConfig,
  TenantConfigProviderConfig,
  TenantConfigContextValue,
  TenantTheme,
  TenantBranding,
  TenantLocalization,
} from './types';

const TenantConfigContext = createContext<TenantConfigContextValue | null>(
  null
);

export interface TenantConfigProviderProps {
  children: ReactNode;
  config?: TenantConfigProviderConfig;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue as T;
    }
    if (typeof current !== 'object') {
      return defaultValue as T;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return (current ?? defaultValue) as T;
}

/**
 * TenantConfigProvider - React context provider for tenant-specific configuration
 *
 * Provides tenant configuration functionality including:
 * - Theme configuration
 * - Feature toggles
 * - Localization settings
 * - Branding configuration
 * - Remote configuration loading
 *
 * @example
 * ```tsx
 * <TenantConfigProvider config={{
 *   tenantId: 'kommune-123',
 *   config: {
 *     tenantId: 'kommune-123',
 *     theme: { primaryColor: '#0066cc' },
 *     features: { bookings: true, messaging: false }
 *   }
 * }}>
 *   <App />
 * </TenantConfigProvider>
 * ```
 */
export function TenantConfigProvider({
  children,
  config: providerConfig = {},
}: TenantConfigProviderProps) {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(
    providerConfig.config ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const tenantId = providerConfig.tenantId ?? tenantConfig?.tenantId ?? null;

  // Fetch remote configuration
  const loadConfig = useCallback(async () => {
    if (!providerConfig.remoteUrl || !tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = providerConfig.remoteUrl.replace('{tenantId}', tenantId);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to load tenant configuration: ${response.status}`
        );
      }

      const config = await response.json();
      setTenantConfig(config);
      providerConfig.onConfigLoaded?.(config);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Unknown error loading tenant configuration');
      setError(error);
      providerConfig.onConfigError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [providerConfig.remoteUrl, tenantId]);

  // Load configuration on mount if remoteUrl is provided
  useEffect(() => {
    if (providerConfig.remoteUrl && tenantId) {
      loadConfig();
    }
  }, [providerConfig.remoteUrl, tenantId]);

  const reload = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  const getConfig = useCallback(
    <T = unknown>(path: string, defaultValue?: T): T => {
      if (!tenantConfig) {
        return defaultValue as T;
      }
      return getNestedValue<T>(
        tenantConfig as unknown as Record<string, unknown>,
        path,
        defaultValue
      );
    },
    [tenantConfig]
  );

  const isFeatureEnabled = useCallback(
    (feature: string): boolean => {
      if (!tenantConfig?.features) {
        return false;
      }

      // Check standard features first
      const standardFeature =
        tenantConfig.features[feature as keyof typeof tenantConfig.features];
      if (typeof standardFeature === 'boolean') {
        return standardFeature;
      }

      // Check custom features
      return tenantConfig.features.custom?.[feature] ?? false;
    },
    [tenantConfig?.features]
  );

  const theme: TenantTheme | null = tenantConfig?.theme ?? null;
  const branding: TenantBranding | null = tenantConfig?.branding ?? null;
  const localization: TenantLocalization | null =
    tenantConfig?.localization ?? null;

  const value: TenantConfigContextValue = {
    config: tenantConfig,
    tenantId,
    isLoading,
    error,
    reload,
    getConfig,
    isFeatureEnabled,
    theme,
    branding,
    localization,
  };

  return (
    <TenantConfigContext.Provider value={value}>
      {children}
    </TenantConfigContext.Provider>
  );
}

/**
 * Hook to access tenant configuration
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, theme, isFeatureEnabled } = useTenantConfig();
 *
 *   return (
 *     <div style={{ color: theme?.primaryColor }}>
 *       {isFeatureEnabled('bookings') && <BookingSection />}
 *       <h1>{config?.branding?.name}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenantConfig(): TenantConfigContextValue {
  const context = useContext(TenantConfigContext);

  if (!context) {
    throw new Error(
      'useTenantConfig must be used within a TenantConfigProvider'
    );
  }

  return context;
}

/**
 * Convenience hook to get current tenant ID
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const tenantId = useTenantId();
 *   return <span>Tenant: {tenantId}</span>;
 * }
 * ```
 */
export function useTenantId(): string | null {
  const { tenantId } = useTenantConfig();
  return tenantId;
}

/**
 * Convenience hook to get tenant theme
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTenantTheme();
 *   return (
 *     <div style={{ backgroundColor: theme?.primaryColor }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useTenantTheme(): TenantTheme | null {
  const { theme } = useTenantConfig();
  return theme;
}

/**
 * Convenience hook to check if a tenant feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasBookings = useTenantFeature('bookings');
 *   return hasBookings ? <BookingUI /> : null;
 * }
 * ```
 */
export function useTenantFeature(feature: string): boolean {
  const { isFeatureEnabled } = useTenantConfig();
  return isFeatureEnabled(feature);
}
