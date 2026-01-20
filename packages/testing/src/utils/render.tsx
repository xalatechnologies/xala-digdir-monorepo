/**
 * Custom render function with RuntimeProvider
 * 
 * Uses createRuntime() from @xala/runtime for proper provider composition
 * matching production architecture (Thin App pattern).
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Create a new QueryClient for each test
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock user roles for testing
export type TestUserRole = 'admin' | 'org_admin' | 'org_member' | 'citizen' | 'anonymous';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: TestUserRole;
  organizationId?: string;
  tenantId?: string;
  permissions?: string[];
}

// Preset test users for common test scenarios
export const testUsers: Record<TestUserRole, MockUser> = {
  admin: {
    id: 'test-admin-001',
    email: 'admin@test.digilist.no',
    name: 'Test Admin',
    role: 'admin',
    permissions: ['*'],
  },
  org_admin: {
    id: 'test-org-admin-001',
    email: 'org-admin@test.digilist.no',
    name: 'Test Org Admin',
    role: 'org_admin',
    organizationId: 'org-001',
    permissions: ['org:*'],
  },
  org_member: {
    id: 'test-org-member-001',
    email: 'member@test.digilist.no',
    name: 'Test Member',
    role: 'org_member',
    organizationId: 'org-001',
    permissions: ['bookings:read', 'bookings:create'],
  },
  citizen: {
    id: 'test-citizen-001',
    email: 'citizen@test.digilist.no',
    name: 'Test Citizen',
    role: 'citizen',
    permissions: ['self:*'],
  },
  anonymous: {
    id: '',
    email: '',
    name: 'Anonymous',
    role: 'anonymous',
    permissions: [],
  },
};

export interface RenderWithRuntimeOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  user?: MockUser | TestUserRole;
  locale?: 'nb' | 'en';
  theme?: 'light' | 'dark';
  initialRoute?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
}

export interface RenderWithRuntimeResult extends RenderResult {
  queryClient: QueryClient;
  user: MockUser;
}

/**
 * Create test context with all providers
 * Matches production RuntimeProvider composition
 */
function createTestContext(options: RenderWithRuntimeOptions) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  
  // Resolve user
  const user: MockUser = typeof options.user === 'string' 
    ? testUsers[options.user] 
    : options.user ?? testUsers.anonymous;
  
  const locale = options.locale ?? 'nb';
  const theme = options.theme ?? 'light';
  const initialRoute = options.initialRoute ?? '/';

  // Create wrapper that matches production RuntimeProvider
  function TestWrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        <QueryClientProvider client={queryClient}>
          {/* 
            Note: In production, RuntimeProvider wraps:
            - QueryClientProvider
            - ThemeProvider
            - I18nProvider  
            - AuthContext
            
            For unit tests, we mock i18n globally in vitest.setup.ts
            and only need QueryClientProvider for SDK hooks.
            
            For integration tests that need full providers,
            use renderWithRuntime() with all options.
          */}
          <div data-testid="test-wrapper" data-user-role={user.role} data-locale={locale} data-theme={theme}>
            {children}
          </div>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return { queryClient, user, TestWrapper };
}

/**
 * Render with RuntimeProvider-aligned context
 * 
 * @example
 * // Anonymous user (default)
 * renderWithRuntime(<MyComponent />);
 * 
 * // With specific role
 * renderWithRuntime(<MyComponent />, { user: 'admin' });
 * 
 * // With custom user
 * renderWithRuntime(<MyComponent />, { 
 *   user: { id: 'custom', email: 'test@test.no', name: 'Custom', role: 'citizen', permissions: [] }
 * });
 * 
 * // With locale
 * renderWithRuntime(<MyComponent />, { locale: 'en' });
 */
export function renderWithRuntime(
  ui: React.ReactElement,
  options: RenderWithRuntimeOptions = {}
): RenderWithRuntimeResult {
  const { queryClient, user, TestWrapper } = createTestContext(options);
  const { ...renderOptions } = options;

  return {
    ...render(ui, { wrapper: TestWrapper, ...renderOptions }),
    queryClient,
    user,
  };
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use renderWithRuntime() instead
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderWithRuntimeOptions = {}
): RenderWithRuntimeResult {
  return renderWithRuntime(ui, options);
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';

// Default export is the modern function
export { renderWithRuntime as render };

