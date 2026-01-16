/**
 * Tenant Admin Test Utilities
 *
 * Provides test helpers for rendering components with all necessary providers:
 * - QueryClientProvider (TanStack Query)
 * - I18nProvider (internationalization)
 * - AuthProvider (authentication context)
 * - MemoryRouter (routing)
 *
 * Usage:
 * ```tsx
 * import { renderWithProviders, createMockUser } from 'tests/helpers/tenant-admin-test-utils';
 *
 * it('renders dashboard', () => {
 *   renderWithProviders(<DashboardPage />);
 *   expect(screen.getByRole('heading')).toBeInTheDocument();
 * });
 * ```
 */
import { type ReactElement, type ReactNode, createContext, useContext } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { I18nProvider } from '@xala/i18n';
import { vi } from 'vitest';

// =============================================================================
// Auth Types (mirroring tenant-admin auth structure)
// =============================================================================

export type TenantAdminRole = 'tenant_admin' | 'billing_admin' | 'tech_admin' | 'viewer';

export interface TenantAdminUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: TenantAdminRole[];
}

export interface AuthContextType {
  user: TenantAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTenantAdmin: boolean;
  isBillingAdmin: boolean;
  isTechAdmin: boolean;
  login: (provider?: string) => void;
  logout: () => Promise<void>;
  checkRole: (role: TenantAdminRole) => boolean;
}

// =============================================================================
// Mock Auth Context
// =============================================================================

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// Default Mock User
// =============================================================================

export const DEFAULT_MOCK_USER: TenantAdminUser = {
  id: 'test-user-001',
  name: 'Test Admin',
  email: 'admin@test-tenant.no',
  tenantId: 'test-tenant-001',
  roles: ['tenant_admin', 'billing_admin', 'tech_admin'],
};

// =============================================================================
// User Factory Functions
// =============================================================================

/**
 * Create a mock user with specific roles for testing RBAC scenarios
 */
export function createMockUser(overrides?: Partial<TenantAdminUser>): TenantAdminUser {
  return {
    ...DEFAULT_MOCK_USER,
    ...overrides,
  };
}

/**
 * Create a tenant admin user (full access)
 */
export function createTenantAdmin(): TenantAdminUser {
  return createMockUser({
    roles: ['tenant_admin', 'billing_admin', 'tech_admin'],
  });
}

/**
 * Create a billing admin user (subscription/billing access only)
 */
export function createBillingAdmin(): TenantAdminUser {
  return createMockUser({
    id: 'billing-admin-001',
    name: 'Billing Admin',
    email: 'billing@test-tenant.no',
    roles: ['billing_admin'],
  });
}

/**
 * Create a tech admin user (integrations/technical access only)
 */
export function createTechAdmin(): TenantAdminUser {
  return createMockUser({
    id: 'tech-admin-001',
    name: 'Tech Admin',
    email: 'tech@test-tenant.no',
    roles: ['tech_admin'],
  });
}

/**
 * Create a viewer user (read-only access)
 */
export function createViewer(): TenantAdminUser {
  return createMockUser({
    id: 'viewer-001',
    name: 'Viewer User',
    email: 'viewer@test-tenant.no',
    roles: ['viewer'],
  });
}

// =============================================================================
// Mock Auth Provider
// =============================================================================

interface MockAuthProviderProps {
  children: ReactNode;
  user?: TenantAdminUser | null;
  isLoading?: boolean;
  onLogin?: (provider?: string) => void;
  onLogout?: () => Promise<void>;
}

/**
 * Mock auth provider for testing authentication and RBAC scenarios
 */
export function MockAuthProvider({
  children,
  user = DEFAULT_MOCK_USER,
  isLoading = false,
  onLogin,
  onLogout,
}: MockAuthProviderProps) {
  const checkRole = (role: TenantAdminRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isTenantAdmin: user?.roles.includes('tenant_admin') ?? false,
    isBillingAdmin: user?.roles.includes('billing_admin') ?? false,
    isTechAdmin: user?.roles.includes('tech_admin') ?? false,
    login: onLogin ?? vi.fn(),
    logout: onLogout ?? vi.fn().mockResolvedValue(undefined),
    checkRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Provider Options
// =============================================================================

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for MemoryRouter
   * @default '/'
   */
  route?: string;
  /**
   * Additional routes for MemoryRouter
   */
  initialEntries?: MemoryRouterProps['initialEntries'];
  /**
   * Mock user for auth context (null for unauthenticated)
   */
  user?: TenantAdminUser | null;
  /**
   * Auth loading state
   */
  isAuthLoading?: boolean;
  /**
   * Custom QueryClient instance
   */
  queryClient?: QueryClient;
  /**
   * Callback for login action
   */
  onLogin?: (provider?: string) => void;
  /**
   * Callback for logout action
   */
  onLogout?: () => Promise<void>;
}

// =============================================================================
// renderWithProviders
// =============================================================================

/**
 * Renders a component with all necessary providers for testing tenant-admin components.
 *
 * Wraps components with:
 * - QueryClientProvider (fresh QueryClient with retry disabled)
 * - I18nProvider (internationalization)
 * - MockAuthProvider (authentication context)
 * - MemoryRouter (routing)
 *
 * @example
 * ```tsx
 * // Basic usage
 * renderWithProviders(<DashboardPage />);
 *
 * // With specific route
 * renderWithProviders(<SubscriptionPage />, { route: '/subscription' });
 *
 * // With unauthenticated state
 * renderWithProviders(<LoginPage />, { user: null });
 *
 * // With specific role for RBAC testing
 * renderWithProviders(<BrandingPage />, {
 *   user: createBillingAdmin(), // Should show access denied
 * });
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    initialEntries,
    user = DEFAULT_MOCK_USER,
    isAuthLoading = false,
    queryClient,
    onLogin,
    onLogout,
    ...renderOptions
  }: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  // Create a fresh QueryClient for each test to avoid state leakage
  const testQueryClient =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests for faster failures
          gcTime: 0, // Disable garbage collection caching
        },
        mutations: {
          retry: false,
        },
      },
    });

  // Determine router entries
  const routerEntries = initialEntries ?? [route];

  function AllProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <I18nProvider>
          <MockAuthProvider
            user={user}
            isLoading={isAuthLoading}
            onLogin={onLogin}
            onLogout={onLogout}
          >
            <MemoryRouter initialEntries={routerEntries}>{children}</MemoryRouter>
          </MockAuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    );
  }

  const result = render(ui, { wrapper: AllProviders, ...renderOptions });

  return {
    ...result,
    queryClient: testQueryClient,
  };
}

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Create a fresh QueryClient for testing with default options
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wait for all queries to settle (useful after mutations)
 */
export async function waitForQuerySettlement(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
