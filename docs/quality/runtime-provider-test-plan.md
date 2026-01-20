# RuntimeProvider Test Plan

**Date:** 2026-01-20  
**Status:** Planned  
**Scope:** Testing strategy for RuntimeProvider migration

---

## Overview

This document defines the testing strategy for the RuntimeProvider migration, including unit tests, integration tests, E2E tests, and CI gates. The goal is to ensure zero regressions during migration while establishing guardrails to prevent future provider sprawl.

---

## Test Categories

### 1. Unit Tests

Test individual RuntimeProvider components and hooks in isolation.

### 2. Integration Tests

Test RuntimeProvider with DS blocks and app components.

### 3. E2E Tests

Test full user journeys across migrated apps.

### 4. CI Gates

Automated checks to prevent regressions and enforce patterns.

---

## Unit Tests

### RuntimeProvider Tests

**File:** `packages/runtime/src/__tests__/RuntimeProvider.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { RuntimeProvider } from '../RuntimeProvider';

describe('RuntimeProvider', () => {
  const defaultConfig = {
    appType: 'web' as const,
    apiUrl: 'https://api.test.no',
    tenantId: 'test-tenant',
  };

  it('renders children', () => {
    render(
      <RuntimeProvider config={defaultConfig}>
        <div>Child Content</div>
      </RuntimeProvider>
    );
    
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('provides I18n context', () => {
    function TestComponent() {
      const { t } = useLocalization();
      return <span>{t('common.save')}</span>;
    }
    
    render(
      <RuntimeProvider config={defaultConfig}>
        <TestComponent />
      </RuntimeProvider>
    );
    
    expect(screen.getByText('Lagre')).toBeInTheDocument();
  });

  it('provides theme context', () => {
    function TestComponent() {
      const { colorScheme } = useTheme();
      return <span>{colorScheme}</span>;
    }
    
    render(
      <RuntimeProvider config={{ ...defaultConfig, colorScheme: 'dark' }}>
        <TestComponent />
      </RuntimeProvider>
    );
    
    expect(screen.getByText('dark')).toBeInTheDocument();
  });

  it('provides query client', () => {
    function TestComponent() {
      const { queryClient } = useSDK();
      return <span>{queryClient ? 'has-client' : 'no-client'}</span>;
    }
    
    render(
      <RuntimeProvider config={defaultConfig}>
        <TestComponent />
      </RuntimeProvider>
    );
    
    expect(screen.getByText('has-client')).toBeInTheDocument();
  });

  it('throws if apiUrl is missing in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    expect(() => {
      render(
        <RuntimeProvider config={{ appType: 'web' } as any}>
          <div>Test</div>
        </RuntimeProvider>
      );
    }).toThrow('apiUrl is required');
    
    process.env.NODE_ENV = originalEnv;
  });
});
```

### createRuntime Tests

**File:** `packages/runtime/src/__tests__/createRuntime.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { createRuntime } from '../createRuntime';
import { useAuth } from '@xala/auth';
import { useRBAC } from '../hooks';

describe('createRuntime', () => {
  it('creates a runtime with default config', () => {
    const runtime = createRuntime({ appType: 'web' });
    
    expect(runtime.Provider).toBeDefined();
    expect(runtime.queryClient).toBeDefined();
  });

  it('provides mock user when specified', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: {
        id: 'test-id',
        name: 'Test User',
        email: 'test@test.no',
        role: 'admin',
      },
    });
    
    function TestComponent() {
      const { user, isAuthenticated } = useAuth();
      return (
        <div>
          <span>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
          <span>{user?.name}</span>
        </div>
      );
    }
    
    render(
      <runtime.Provider>
        <TestComponent />
      </runtime.Provider>
    );
    
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('allows overriding locale', () => {
    const runtime = createRuntime({
      appType: 'web',
      locale: 'en',
    });
    
    function TestComponent() {
      const { locale } = useLocalization();
      return <span>{locale}</span>;
    }
    
    render(
      <runtime.Provider>
        <TestComponent />
      </runtime.Provider>
    );
    
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('allows custom query client', () => {
    const customClient = new QueryClient();
    const runtime = createRuntime({
      appType: 'web',
      queryClient: customClient,
    });
    
    expect(runtime.queryClient).toBe(customClient);
  });

  it('provides mock capabilities', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { role: 'admin' },
      mockCapabilities: ['CAP_BOOKING_APPROVE', 'CAP_USER_ADMIN'],
    });
    
    function TestComponent() {
      const { hasCapability } = useRBAC();
      return (
        <span>
          {hasCapability('CAP_BOOKING_APPROVE') ? 'can-approve' : 'cannot-approve'}
        </span>
      );
    }
    
    render(
      <runtime.Provider>
        <TestComponent />
      </runtime.Provider>
    );
    
    expect(screen.getByText('can-approve')).toBeInTheDocument();
  });
});
```

### Hook Tests

**File:** `packages/runtime/src/hooks/__tests__/useRBAC.test.tsx`

```typescript
import { renderHook } from '@testing-library/react';
import { createRuntime } from '../../createRuntime';
import { useRBAC } from '../useRBAC';

describe('useRBAC', () => {
  it('throws if used outside RuntimeProvider', () => {
    expect(() => {
      renderHook(() => useRBAC());
    }).toThrow('useRBAC must be used within RuntimeProvider');
  });

  it('returns isAdmin true for admin users', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { role: 'admin' },
    });
    
    const { result } = renderHook(() => useRBAC(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isCaseHandler).toBe(false);
  });

  it('returns isCaseHandler true for case_handler users', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { role: 'case_handler' },
    });
    
    const { result } = renderHook(() => useRBAC(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isCaseHandler).toBe(true);
  });

  it('hasCapability returns true for granted capabilities', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { role: 'admin' },
      mockCapabilities: ['CAP_BOOKING_APPROVE'],
    });
    
    const { result } = renderHook(() => useRBAC(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.hasCapability('CAP_BOOKING_APPROVE')).toBe(true);
    expect(result.current.hasCapability('CAP_USER_DELETE')).toBe(false);
  });

  it('hasAnyCapability works correctly', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { role: 'admin' },
      mockCapabilities: ['CAP_BOOKING_APPROVE'],
    });
    
    const { result } = renderHook(() => useRBAC(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.hasAnyCapability([
      'CAP_BOOKING_APPROVE',
      'CAP_USER_DELETE',
    ])).toBe(true);
    
    expect(result.current.hasAnyCapability([
      'CAP_USER_DELETE',
      'CAP_ORG_ADMIN',
    ])).toBe(false);
  });
});
```

**File:** `packages/runtime/src/hooks/__tests__/useFeatureFlags.test.tsx`

```typescript
import { renderHook } from '@testing-library/react';
import { createRuntime } from '../../createRuntime';
import { useFeatureFlags } from '../useFeatureFlags';

describe('useFeatureFlags', () => {
  it('returns false for undefined flags', () => {
    const runtime = createRuntime({ appType: 'web' });
    
    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.isEnabled('unknownFlag')).toBe(false);
  });

  it('returns true for enabled flags', () => {
    const runtime = createRuntime({
      appType: 'web',
      featureFlags: {
        newBookingFlow: true,
        betaFeatures: false,
      },
    });
    
    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: runtime.Provider,
    });
    
    expect(result.current.isEnabled('newBookingFlow')).toBe(true);
    expect(result.current.isEnabled('betaFeatures')).toBe(false);
  });
});
```

---

## Integration Tests

### DS Block with RuntimeProvider

**File:** `packages/runtime/src/__tests__/integration/ds-blocks.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { createRuntime } from '../../createRuntime';
import { RentalObjectCard } from '@xala/ds';

describe('DS Blocks with RuntimeProvider', () => {
  it('RentalObjectCard renders with localized text', () => {
    const runtime = createRuntime({
      appType: 'web',
      locale: 'nb',
    });
    
    const mockRentalObject = {
      id: '1',
      name: 'Test Hall',
      slug: 'test-hall',
      category: { name: 'Idrettshall' },
      images: [],
      priceDisplay: '500 kr/time',
    };
    
    render(
      <runtime.Provider>
        <RentalObjectCard rentalObject={mockRentalObject} />
      </runtime.Provider>
    );
    
    expect(screen.getByText('Test Hall')).toBeInTheDocument();
    expect(screen.getByText('Idrettshall')).toBeInTheDocument();
  });

  it('BookingConfirmation shows localized confirmation', () => {
    const runtime = createRuntime({
      appType: 'web',
      locale: 'nb',
    });
    
    const mockBooking = {
      id: 'booking-1',
      status: 'confirmed',
      rentalObject: { name: 'Test Hall' },
      startTime: '2026-01-20T10:00:00',
      endTime: '2026-01-20T12:00:00',
    };
    
    render(
      <runtime.Provider>
        <BookingConfirmation booking={mockBooking} />
      </runtime.Provider>
    );
    
    expect(screen.getByText(/bekreft/i)).toBeInTheDocument();
  });
});
```

### Auth Flow with RuntimeProvider

**File:** `packages/runtime/src/__tests__/integration/auth-flow.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRuntime } from '../../createRuntime';
import { ProtectedRoute } from '@xala/ds';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('Auth Flow with RuntimeProvider', () => {
  it('redirects unauthenticated user to login', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: null,
    });
    
    render(
      <runtime.Provider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </runtime.Provider>
    );
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows authenticated user to access protected route', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { id: '1', role: 'admin' },
    });
    
    render(
      <runtime.Provider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </runtime.Provider>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('denies access for wrong role', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      mockUser: { id: '1', role: 'citizen' },
    });
    
    render(
      <runtime.Provider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <div>Admin Panel</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </runtime.Provider>
    );
    
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
```

---

## E2E Tests

### Smoke Test: App Boot

**File:** `tests/e2e/runtime-provider/app-boot.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('RuntimeProvider App Boot', () => {
  test('web app boots with RuntimeProvider', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to hydrate
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    
    // Verify localization works
    await expect(page.locator('text=Utforsk')).toBeVisible();
  });

  test('backoffice app boots with RuntimeProvider', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    
    // Verify login page renders
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
    
    // Verify localization works
    await expect(page.locator('text=Logg inn')).toBeVisible();
  });

  test('minside app boots with RuntimeProvider', async ({ page }) => {
    await page.goto('http://localhost:5174/login');
    
    // Verify login page renders
    await expect(page.locator('[data-testid="login-page"]')).toBeVisible();
  });
});
```

### Language Switch Test

**File:** `tests/e2e/runtime-provider/language-switch.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('switches language and persists', async ({ page }) => {
    await page.goto('/');
    
    // Initial language is Norwegian
    await expect(page.locator('text=Utforsk')).toBeVisible();
    
    // Open language switcher
    await page.click('[data-testid="language-switcher"]');
    
    // Select English
    await page.click('text=English');
    
    // Verify language changed
    await expect(page.locator('text=Explore')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Verify language persisted
    await expect(page.locator('text=Explore')).toBeVisible();
  });
});
```

### Menu Render Test

**File:** `tests/e2e/runtime-provider/menu-render.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Role-Based Menu Rendering', () => {
  test('admin sees full menu', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5175/login');
    await page.fill('[data-testid="email-input"]', 'admin@test.no');
    await page.click('[data-testid="demo-login-button"]');
    
    // Wait for dashboard
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Verify admin menu items
    await expect(page.locator('text=Brukere')).toBeVisible();
    await expect(page.locator('text=Innstillinger')).toBeVisible();
    await expect(page.locator('text=Audit')).toBeVisible();
  });

  test('case_handler sees limited menu', async ({ page }) => {
    // Login as case handler
    await page.goto('http://localhost:5175/login');
    await page.fill('[data-testid="email-input"]', 'handler@test.no');
    await page.click('[data-testid="demo-login-button"]');
    
    // Wait for work queue
    await expect(page.locator('[data-testid="work-queue"]')).toBeVisible();
    
    // Verify limited menu
    await expect(page.locator('text=Arbeidskø')).toBeVisible();
    await expect(page.locator('text=Brukere')).not.toBeVisible();
  });
});
```

### Booking List Test

**File:** `tests/e2e/runtime-provider/booking-list.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Booking List with SDK', () => {
  test('loads bookings via SDK', async ({ page }) => {
    // Login
    await page.goto('http://localhost:5175/login');
    await page.fill('[data-testid="email-input"]', 'admin@test.no');
    await page.click('[data-testid="demo-login-button"]');
    
    // Navigate to bookings
    await page.click('text=Bookinger');
    
    // Wait for bookings to load
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    
    // Verify data loaded (at least one row or empty state)
    const rows = page.locator('[data-testid="booking-row"]');
    const emptyState = page.locator('[data-testid="empty-state"]');
    
    await expect(rows.or(emptyState).first()).toBeVisible();
  });
});
```

---

## Negative Tests

### Missing Provider Tests

**File:** `packages/runtime/src/__tests__/negative/missing-provider.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { useLocalization, useRBAC, useSDK } from '../../hooks';

describe('Missing Provider Detection', () => {
  const originalError = console.error;
  
  beforeEach(() => {
    // Suppress expected error logs
    console.error = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
  });

  it('useLocalization throws without RuntimeProvider', () => {
    function TestComponent() {
      useLocalization();
      return null;
    }
    
    expect(() => render(<TestComponent />)).toThrow(
      'useLocalization must be used within RuntimeProvider'
    );
  });

  it('useRBAC throws without RuntimeProvider', () => {
    function TestComponent() {
      useRBAC();
      return null;
    }
    
    expect(() => render(<TestComponent />)).toThrow(
      'useRBAC must be used within RuntimeProvider'
    );
  });

  it('useSDK throws without RuntimeProvider', () => {
    function TestComponent() {
      useSDK();
      return null;
    }
    
    expect(() => render(<TestComponent />)).toThrow(
      'useSDK must be used within RuntimeProvider'
    );
  });

  it('DS block throws helpful error without I18nProvider', () => {
    // This tests the existing DS behavior, not RuntimeProvider
    // Ensures DS blocks fail gracefully when context missing
    function TestComponent() {
      const { t } = useT();
      return <span>{t('test.key')}</span>;
    }
    
    expect(() => render(<TestComponent />)).toThrow();
  });
});
```

### Invalid Config Tests

**File:** `packages/runtime/src/__tests__/negative/invalid-config.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { RuntimeProvider } from '../../RuntimeProvider';

describe('Invalid Configuration', () => {
  it('throws if appType is missing', () => {
    expect(() => {
      render(
        <RuntimeProvider config={{} as any}>
          <div>Test</div>
        </RuntimeProvider>
      );
    }).toThrow('appType is required');
  });

  it('throws if appType is invalid', () => {
    expect(() => {
      render(
        <RuntimeProvider config={{ appType: 'invalid' as any }}>
          <div>Test</div>
        </RuntimeProvider>
      );
    }).toThrow('Invalid appType');
  });

  it('warns if apiUrl missing in development', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    
    render(
      <RuntimeProvider config={{ appType: 'web' }}>
        <div>Test</div>
      </RuntimeProvider>
    );
    
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('apiUrl not provided')
    );
    
    warnSpy.mockRestore();
  });
});
```

---

## CI Gates

### ESLint Rules

**File:** `packages/eslint-config/rules/runtime-provider-rules.js`

```javascript
module.exports = {
  rules: {
    // Prevent provider imports in routes/pages
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            importNames: ['createContext'],
            message: 'Use @xala/runtime hooks instead of creating contexts in apps.',
          },
        ],
        patterns: [
          {
            group: ['**/providers/**', '**/contexts/**'],
            message: 'Import from @xala/runtime instead of local providers.',
          },
          {
            group: ['@tanstack/react-query'],
            importNames: ['QueryClientProvider', 'QueryClient'],
            message: 'QueryClient is provided by @xala/runtime. Import hooks from @digilist/client-sdk.',
          },
        ],
      },
    ],
  },
};
```

### Custom Lint Rules

**File:** `packages/eslint-config/rules/no-direct-fetch.js`

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct fetch/axios calls in apps',
    },
    messages: {
      noDirectFetch: 'Use @digilist/client-sdk services instead of direct fetch/axios.',
    },
  },
  create(context) {
    const filename = context.getFilename();
    
    // Only apply to apps/ directory
    if (!filename.includes('/apps/')) {
      return {};
    }
    
    // Skip API directory
    if (filename.includes('/apps/api/')) {
      return {};
    }
    
    return {
      CallExpression(node) {
        // Check for fetch()
        if (node.callee.name === 'fetch') {
          context.report({
            node,
            messageId: 'noDirectFetch',
          });
        }
        
        // Check for axios.get/post/etc
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'axios'
        ) {
          context.report({
            node,
            messageId: 'noDirectFetch',
          });
        }
      },
    };
  },
};
```

**File:** `packages/eslint-config/rules/no-multiple-i18n-init.js`

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure only one I18nProvider per app',
    },
    messages: {
      multipleI18nInit: 'I18nProvider should only be mounted once per app (in RuntimeProvider).',
    },
  },
  create(context) {
    const filename = context.getFilename();
    
    // Only apply to apps/ directory, skip main.tsx and App.tsx
    if (!filename.includes('/apps/')) return {};
    if (filename.endsWith('main.tsx')) return {};
    if (filename.endsWith('App.tsx')) return {};
    
    return {
      JSXElement(node) {
        if (
          node.openingElement.name.name === 'I18nProvider' ||
          node.openingElement.name.name === 'RuntimeProvider'
        ) {
          context.report({
            node,
            messageId: 'multipleI18nInit',
          });
        }
      },
    };
  },
};
```

### CI Workflow

**File:** `.github/workflows/runtime-provider-checks.yml`

```yaml
name: RuntimeProvider Compliance

on:
  pull_request:
    paths:
      - 'apps/**'
      - 'packages/runtime/**'

jobs:
  lint-providers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run RuntimeProvider lint rules
        run: pnpm eslint apps --rule '@xala/no-direct-fetch: error'
      
      - name: Check for provider sprawl
        run: |
          # Fail if providers found outside runtime package
          PROVIDER_FILES=$(find apps -name "*Provider*.tsx" -o -name "*Context*.tsx" | grep -v node_modules | grep -v test)
          if [ -n "$PROVIDER_FILES" ]; then
            echo "ERROR: Provider files found in apps (should be in @xala/runtime):"
            echo "$PROVIDER_FILES"
            exit 1
          fi
      
      - name: Check for multiple I18nProvider
        run: |
          # Count I18nProvider occurrences per app
          for app in apps/*/; do
            COUNT=$(grep -r "I18nProvider" "$app/src" --include="*.tsx" | wc -l)
            if [ "$COUNT" -gt 1 ]; then
              echo "ERROR: Multiple I18nProvider found in $app"
              exit 1
            fi
          done

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run RuntimeProvider unit tests
        run: pnpm -F @xala/runtime test:run
      
      - name: Run integration tests
        run: pnpm -F @xala/runtime test:integration
```

---

## Test Coverage Requirements

### Minimum Coverage

| Package | Statement | Branch | Function | Line |
|---------|-----------|--------|----------|------|
| @xala/runtime | 80% | 75% | 80% | 80% |

### Critical Paths (100% Coverage Required)

- RuntimeProvider render
- createRuntime factory
- All public hooks (useLocalization, useRBAC, useSDK, etc.)
- Error boundary behavior
- Missing provider detection

---

## Test Data

### Mock Users

```typescript
export const mockUsers = {
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@test.no',
    role: 'admin' as const,
    grantedRoles: ['admin'],
    tenantId: 'test-tenant',
  },
  caseHandler: {
    id: 'handler-1',
    name: 'Case Handler',
    email: 'handler@test.no',
    role: 'case_handler' as const,
    grantedRoles: ['case_handler'],
    tenantId: 'test-tenant',
  },
  dualRole: {
    id: 'dual-1',
    name: 'Dual Role User',
    email: 'dual@test.no',
    role: 'admin' as const,
    grantedRoles: ['admin', 'case_handler'],
    tenantId: 'test-tenant',
  },
  citizen: {
    id: 'citizen-1',
    name: 'Citizen User',
    email: 'citizen@test.no',
    role: 'citizen' as const,
    grantedRoles: [],
    tenantId: 'test-tenant',
  },
};
```

### Mock Organizations

```typescript
export const mockOrganizations = [
  {
    id: 'org-1',
    name: 'Test Idrettslag',
    organizationNumber: '987654321',
    type: 'sports_club',
  },
  {
    id: 'org-2',
    name: 'Test Kulturforening',
    organizationNumber: '123456789',
    type: 'cultural_org',
  },
];
```

---

## Appendix: Test File Locations

```
packages/runtime/
  src/
    __tests__/
      RuntimeProvider.test.tsx
      createRuntime.test.tsx
      integration/
        ds-blocks.test.tsx
        auth-flow.test.tsx
      negative/
        missing-provider.test.tsx
        invalid-config.test.tsx
    hooks/
      __tests__/
        useRBAC.test.tsx
        useFeatureFlags.test.tsx
        useLocalization.test.tsx
        useSDK.test.tsx
        useTenantContext.test.tsx

tests/
  e2e/
    runtime-provider/
      app-boot.spec.ts
      language-switch.spec.ts
      menu-render.spec.ts
      booking-list.spec.ts

packages/eslint-config/
  rules/
    runtime-provider-rules.js
    no-direct-fetch.js
    no-multiple-i18n-init.js

.github/
  workflows/
    runtime-provider-checks.yml
```
