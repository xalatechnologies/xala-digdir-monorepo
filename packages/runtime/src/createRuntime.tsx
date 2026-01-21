/**
 * @xala/runtime - createRuntime
 *
 * Factory function for creating runtime instances for testing and Storybook.
 * Provides a simplified setup with mock capabilities.
 *
 * Usage in tests:
 * ```tsx
 * import { createRuntime } from '@xala/runtime';
 *
 * const runtime = createRuntime({
 *   mockUser: { role: 'admin' },
 *   locale: 'en',
 * });
 *
 * render(<MyComponent />, { wrapper: runtime.Provider });
 * ```
 *
 * Usage in Storybook:
 * ```tsx
 * const runtime = createRuntime({ mockUser: null });
 * export const decorators = [(Story) => <runtime.Provider><Story /></runtime.Provider>];
 * ```
 */

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@xala/i18n';
import { ThemeProvider, DialogProvider } from '@xalatechnologies/platform/ui';
import type {
  CreateRuntimeOptions,
  RuntimeInstance,
  MockUser,
  FeatureFlagsContext,
  TenantContext,
} from './types';

// ============================================================================
// Mock Contexts for Testing
// ============================================================================

const MockAuthContext = React.createContext<{
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} | null>(null);

const MockFeatureFlagsContext = React.createContext<FeatureFlagsContext | null>(null);
const MockTenantContext = React.createContext<TenantContext | null>(null);

// ============================================================================
// Mock Providers
// ============================================================================

interface MockAuthProviderProps {
  user: MockUser | null;
  children: ReactNode;
}

function MockAuthProvider({ user, children }: MockAuthProviderProps) {
  const value = React.useMemo(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading: false,
  }), [user]);

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

interface MockFeatureFlagsProviderProps {
  flags: Record<string, boolean>;
  children: ReactNode;
}

function MockFeatureFlagsProvider({ flags, children }: MockFeatureFlagsProviderProps) {
  const value = React.useMemo<FeatureFlagsContext>(() => ({
    isEnabled: (flag: string) => flags[flag] ?? false,
    getVariant: <T,>(flag: string, defaultValue: T) => (flags[flag] as unknown as T) ?? defaultValue,
    flags,
  }), [flags]);

  return (
    <MockFeatureFlagsContext.Provider value={value}>
      {children}
    </MockFeatureFlagsContext.Provider>
  );
}

interface MockTenantProviderProps {
  organizations: TenantContext['organizations'];
  children: ReactNode;
}

function MockTenantProvider({ organizations, children }: MockTenantProviderProps) {
  const [accountType, setAccountType] = React.useState<'personal' | 'organization'>('personal');
  const [selectedOrgId, setSelectedOrgId] = React.useState<string | null>(null);

  const value = React.useMemo<TenantContext>(() => ({
    tenantId: 'test-tenant',
    tenantName: 'Test Tenant',
    accountType,
    selectedOrganization: organizations.find(o => o.id === selectedOrgId) ?? null,
    organizations,
    switchToPersonal: () => {
      setAccountType('personal');
      setSelectedOrgId(null);
    },
    switchToOrganization: (orgId: string) => {
      setAccountType('organization');
      setSelectedOrgId(orgId);
    },
  }), [accountType, selectedOrgId, organizations]);

  return (
    <MockTenantContext.Provider value={value}>
      {children}
    </MockTenantContext.Provider>
  );
}

// ============================================================================
// createRuntime Factory
// ============================================================================

/**
 * Creates a runtime instance for testing or Storybook.
 *
 * @param options - Configuration options for the mock runtime
 * @returns RuntimeInstance with Provider component and utilities
 */
export function createRuntime(options: CreateRuntimeOptions = {}): RuntimeInstance {
  const {
    // appType reserved for future use
    locale = 'nb',
    mockUser = null,
    mockOrganizations = [],
    featureFlags = {},
    queryClient,
    skipI18n = false,
  } = options;

  // Create or use provided QueryClient
  const qc = queryClient ?? new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  // Build the provider component
  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    let content = children;

    // Wrap with mock tenant context
    content = (
      <MockTenantProvider organizations={mockOrganizations}>
        {content}
      </MockTenantProvider>
    );

    // Wrap with feature flags
    content = (
      <MockFeatureFlagsProvider flags={featureFlags}>
        {content}
      </MockFeatureFlagsProvider>
    );

    // Wrap with mock auth
    content = (
      <MockAuthProvider user={mockUser}>
        {content}
      </MockAuthProvider>
    );

    // Wrap with dialog provider
    content = (
      <DialogProvider>
        {content}
      </DialogProvider>
    );

    // Wrap with I18n (unless skipped)
    if (!skipI18n) {
      content = (
        <I18nProvider initialLocale={locale}>
          {content}
        </I18nProvider>
      );
    }

    // Wrap with theme
    content = (
      <ThemeProvider>
        {content}
      </ThemeProvider>
    );

    // Wrap with QueryClient
    content = (
      <QueryClientProvider client={qc}>
        {content}
      </QueryClientProvider>
    );

    return <>{content}</>;
  };

  return {
    Provider,
    queryClient: qc,
    mockUser,
  };
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Default runtime for quick testing.
 * Uses sensible defaults suitable for most component tests.
 */
export const defaultTestRuntime = createRuntime({
  appType: 'web',
  locale: 'nb',
  mockUser: null,
  featureFlags: {},
});

/**
 * Admin runtime for testing admin-only features.
 */
export const adminTestRuntime = createRuntime({
  appType: 'backoffice',
  locale: 'nb',
  mockUser: {
    id: 'test-admin',
    name: 'Test Admin',
    email: 'admin@test.no',
    role: 'admin',
  },
  mockCapabilities: ['*'], // All capabilities
  featureFlags: {},
});

/**
 * Creates a wrapper function compatible with Testing Library's render.
 *
 * Usage:
 * ```tsx
 * render(<Component />, { wrapper: createTestWrapper() });
 * ```
 */
export function createTestWrapper(options?: CreateRuntimeOptions) {
  const runtime = createRuntime(options);
  return runtime.Provider;
}
