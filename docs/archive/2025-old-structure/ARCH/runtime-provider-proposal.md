# RuntimeProvider Technical Proposal

**Date:** 2026-01-20  
**Status:** Proposed  
**Author:** Architecture Audit  
**Reviewers:** TBD

---

## Overview

This document proposes a new `@xala/runtime` package that provides a unified `RuntimeProvider` component for all Xala/Digilist frontend applications. The RuntimeProvider consolidates 8-12 providers into a single composable tree, enforcing thin-app compliance and enabling consistent DI patterns across apps.

---

## Goals

1. **Eliminate provider sprawl** - Single provider mount per app
2. **Enforce thin-app rule** - Apps contain only routes and wrappers
3. **Enable testability** - `createRuntime()` factory for testing/Storybook
4. **Standardize DX** - Consistent hooks for all cross-cutting concerns
5. **Prevent regressions** - CI gates block provider sprawl

---

## Non-Goals

1. **Replace BrowserRouter** - Routing remains app-specific
2. **Change DS components** - Blocks continue using existing hooks
3. **Modify auth flow** - AuthProvider behavior unchanged
4. **Bundle reduction** - Performance is maintained, not primary goal

---

## Package Structure

```
packages/runtime/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts                    # Public exports
    RuntimeProvider.tsx         # Main composed provider
    createRuntime.ts            # Factory for testing/Storybook
    types.ts                    # TypeScript definitions
    
    providers/
      index.ts
      NotificationCenterProvider.tsx  # Consolidated from apps
      ToastProvider.tsx               # Consolidated from DS/apps
      CapabilityProvider.tsx          # Moved from backoffice
      AccountContextProvider.tsx      # Moved from minside
      RoleProvider.tsx                # Abstracted from backoffice
    
    hooks/
      index.ts
      useLocalization.ts        # Re-export from @xala/i18n
      useSDK.ts                 # SDK client access
      useRBAC.ts                # Role/capability checking
      useFeatureFlags.ts        # Feature flag evaluation
      useTenantContext.ts       # Tenant/org context
      useNotificationCenter.ts  # Notification modal control
      useToast.ts               # Toast notifications
    
    utils/
      index.ts
      config.ts                 # Runtime configuration helpers
```

---

## API Design

### RuntimeProvider Component

```typescript
import { RuntimeProvider } from '@xala/runtime';

// In app main.tsx or App.tsx (ONLY place it's mounted)
function App() {
  return (
    <RuntimeProvider
      config={{
        // Required
        appType: 'backoffice', // | 'minside' | 'web' | 'saas-admin' | 'monitoring' | 'docs-learning'
        
        // SDK Configuration
        apiUrl: import.meta.env.VITE_API_URL,
        wsUrl: import.meta.env.VITE_WS_URL,
        tenantId: import.meta.env.VITE_TENANT_ID,
        licenseKey: import.meta.env.VITE_LICENSE_KEY,
        
        // Localization
        locale: 'nb', // Initial locale
        
        // Theme
        theme: 'digilist',
        colorScheme: 'auto', // | 'light' | 'dark'
        
        // Auth (optional overrides)
        authConfig: {
          loginPath: '/login',
          debug: import.meta.env.DEV,
        },
        
        // Feature flags (optional)
        featureFlags: {
          newBookingFlow: true,
          betaFeatures: false,
        },
      }}
    >
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </RuntimeProvider>
  );
}
```

### RuntimeConfig Type

```typescript
interface RuntimeConfig {
  // App identification
  appType: AppType;
  
  // SDK configuration
  apiUrl: string;
  wsUrl?: string;
  tenantId?: string;
  licenseKey?: string;
  defaultHeaders?: Record<string, string>;
  
  // Localization
  locale?: SupportedLocale;
  translations?: TranslationsRegistry;
  
  // Theme
  theme?: ThemeId;
  colorScheme?: ColorScheme;
  size?: 'sm' | 'md' | 'lg';
  
  // Auth
  authConfig?: Partial<AuthConfig>;
  
  // RBAC
  allowedRoles?: UserRole[];
  
  // Feature flags
  featureFlags?: Record<string, boolean>;
  
  // Callbacks
  onAuthError?: (error: Error) => void;
  onRealtimeDisconnect?: () => void;
}

type AppType = 
  | 'web' 
  | 'minside' 
  | 'backoffice' 
  | 'saas-admin' 
  | 'monitoring' 
  | 'docs-learning';
```

### createRuntime Factory

For testing and Storybook:

```typescript
import { createRuntime } from '@xala/runtime';

// In test file
describe('MyComponent', () => {
  it('renders for admin user', () => {
    const runtime = createRuntime({
      appType: 'backoffice',
      locale: 'en',
      mockUser: {
        id: 'test-user',
        name: 'Test Admin',
        email: 'admin@test.no',
        role: 'admin',
      },
      featureFlags: {
        newBookingFlow: true,
      },
    });
    
    render(
      <runtime.Provider>
        <MyComponent />
      </runtime.Provider>
    );
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});

// In Storybook preview.tsx
const runtime = createRuntime({
  appType: 'web',
  locale: 'nb',
  mockUser: { role: 'citizen' },
});

export const decorators = [
  (Story) => (
    <runtime.Provider>
      <Story />
    </runtime.Provider>
  ),
];
```

### CreateRuntimeOptions Type

```typescript
interface CreateRuntimeOptions extends Partial<RuntimeConfig> {
  // Testing helpers
  mockUser?: Partial<User> | null;
  mockSession?: Partial<Session>;
  mockCapabilities?: Capability[];
  mockOrganizations?: Organization[];
  
  // Query client override
  queryClient?: QueryClient;
  
  // Skip certain providers (for isolated testing)
  skipAuth?: boolean;
  skipRealtime?: boolean;
  skipI18n?: boolean;
}

interface RuntimeInstance {
  Provider: React.FC<{ children: React.ReactNode }>;
  queryClient: QueryClient;
  mockUser: User | null;
}
```

---

## Hook Contracts

### useLocalization

Re-export from `@xala/i18n` with consistent API:

```typescript
import { useLocalization } from '@xala/runtime';

function MyComponent() {
  const { t, locale, setLocale } = useLocalization();
  
  return (
    <div>
      <p>{t('greeting.hello')}</p>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  );
}
```

### useSDK

Access to SDK client and query utilities:

```typescript
import { useSDK } from '@xala/runtime';

function MyComponent() {
  const { client, queryClient, isOnline } = useSDK();
  
  // Direct client access (rare)
  const response = await client.get('/api/custom-endpoint');
  
  // Invalidate queries
  queryClient.invalidateQueries({ queryKey: ['bookings'] });
}
```

### useRBAC

Capability-based access control:

```typescript
import { useRBAC } from '@xala/runtime';

function MyComponent() {
  const { 
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities,
    effectiveRole,
    isAdmin,
    isCaseHandler,
  } = useRBAC();
  
  if (!hasCapability('CAP_BOOKING_APPROVE')) {
    return null;
  }
  
  return <ApproveButton />;
}
```

### useFeatureFlags

Feature flag evaluation:

```typescript
import { useFeatureFlags } from '@xala/runtime';

function MyComponent() {
  const { isEnabled, getVariant } = useFeatureFlags();
  
  if (isEnabled('newBookingFlow')) {
    return <NewBookingFlow />;
  }
  
  return <LegacyBookingFlow />;
}
```

### useTenantContext

Tenant and organization context:

```typescript
import { useTenantContext } from '@xala/runtime';

function MyComponent() {
  const {
    tenantId,
    tenantName,
    accountType,          // 'personal' | 'organization'
    selectedOrganization,
    organizations,
    switchToPersonal,
    switchToOrganization,
  } = useTenantContext();
  
  return <div>Current: {tenantName}</div>;
}
```

### useNotificationCenter

Notification modal control:

```typescript
import { useNotificationCenter } from '@xala/runtime';

function HeaderBell() {
  const { openNotificationCenter, unreadCount } = useNotificationCenter();
  
  return (
    <NotificationBell 
      count={unreadCount} 
      onClick={openNotificationCenter} 
    />
  );
}
```

---

## Provider Composition Order

The RuntimeProvider internally composes providers in this order (outer to inner):

```
RuntimeProvider
  1. QueryClientProvider     # SDK data layer
  2. ThemeProvider           # Theme state (light/dark/auto)
  3. I18nProvider            # Localization
  4. DesignsystemetProvider  # Design tokens
  5. DialogProvider          # Modal management
  6. ErrorBoundary           # Error handling
  7. AuthProvider            # Authentication
  8. CapabilityProvider      # RBAC capabilities
  9. AccountContextProvider  # Tenant/org context (conditional)
  10. RealtimeProvider       # WebSocket (conditional)
  11. NotificationProvider   # Notification center
  12. ToastProvider          # Toast notifications
  13. Children               # App content
```

### Composition Rationale

1. **QueryClientProvider first** - All hooks need query client
2. **ThemeProvider early** - Affects all visual components
3. **I18nProvider before DS** - DS components may use translations
4. **AuthProvider before RBAC** - Capabilities depend on user
5. **RealtimeProvider late** - Needs auth context
6. **Notification/Toast last** - UI overlays on top of content

---

## Storybook Integration

### Preview Configuration

```typescript
// packages/ds/.storybook/preview.tsx
import { createRuntime } from '@xala/runtime';

const runtime = createRuntime({
  appType: 'web',
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  mockUser: null, // Not authenticated by default
  featureFlags: {
    showExperimentalBlocks: true,
  },
});

const withRuntime: Decorator = (Story, context) => {
  // Allow per-story locale override
  const locale = context.globals.locale || 'nb';
  
  return (
    <runtime.Provider locale={locale}>
      <Story />
    </runtime.Provider>
  );
};

export const decorators = [withRuntime];

export const globalTypes = {
  locale: {
    name: 'Locale',
    defaultValue: 'nb',
    toolbar: {
      icon: 'globe',
      items: ['nb', 'en'],
    },
  },
};
```

### Story-Level Overrides

```typescript
// SomeComponent.stories.tsx
import { createRuntime } from '@xala/runtime';

export default {
  title: 'Blocks/AdminPanel',
  component: AdminPanel,
};

// Story with admin user
export const AsAdmin = {
  decorators: [
    (Story) => {
      const runtime = createRuntime({
        mockUser: { role: 'admin' },
      });
      return <runtime.Provider><Story /></runtime.Provider>;
    },
  ],
};

// Story with case handler
export const AsCaseHandler = {
  decorators: [
    (Story) => {
      const runtime = createRuntime({
        mockUser: { role: 'case_handler' },
      });
      return <runtime.Provider><Story /></runtime.Provider>;
    },
  ],
};
```

---

## Thin-App Alignment Rules

### Allowed in Apps

```
apps/*/
  src/
    main.tsx              # Mounts RuntimeProvider + BrowserRouter
    App.tsx               # Routes only (no providers)
    routes/               # Page components
    pages/                # Page components (legacy)
    components/           # App-specific layouts/wrappers ONLY
    hooks/                # App-specific hooks (minimize)
    lib/                  # App-specific utilities (minimize)
```

### NOT Allowed in Apps

```
apps/*/
  src/
    providers/            # FORBIDDEN - use @xala/runtime
    contexts/             # FORBIDDEN - use @xala/runtime
    services/             # FORBIDDEN - use @digilist/client-sdk
```

### ESLint Rules

```javascript
// packages/eslint-config/rules/runtime-provider.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/providers/*', '**/contexts/*'],
            message: 'Import from @xala/runtime instead of local providers.',
          },
        ],
      },
    ],
  },
};
```

---

## Migration Path

### Phase 1: Create Package (Week 1)

1. Create `packages/runtime` with basic structure
2. Implement RuntimeProvider with existing providers
3. Implement createRuntime for testing
4. Add basic tests

### Phase 2: Migrate saas-admin (Week 2)

1. Update saas-admin to use RuntimeProvider
2. Remove local providers
3. Update tests
4. Verify all functionality

### Phase 3: Migrate Simple Apps (Week 3)

1. Migrate docs-learning
2. Migrate monitoring
3. Remove duplicate providers

### Phase 4: Migrate Complex Apps (Week 4-5)

1. Move BackofficeRoleProvider to runtime
2. Move CapabilityProvider to runtime
3. Migrate backoffice
4. Migrate minside
5. Migrate web

### Phase 5: CI Gates (Week 6)

1. Add ESLint rules
2. Add CI checks
3. Document in AGENTS.md/CLAUDE.md
4. Archive old provider code

---

## Backwards Compatibility

### During Migration

Both patterns work simultaneously:

```typescript
// Old pattern (still works)
<QueryClientProvider client={queryClient}>
  <I18nProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </I18nProvider>
</QueryClientProvider>

// New pattern
<RuntimeProvider config={...}>
  <App />
</RuntimeProvider>
```

### Hook Compatibility

All existing hooks continue to work:

| Hook | Package | Status |
|------|---------|--------|
| `useT()` | @xala/i18n | Unchanged |
| `useAuth()` | @xala/auth | Unchanged |
| `useTheme()` | @xala/ds | Unchanged |
| `useQuery()` | @tanstack/react-query | Unchanged |
| SDK hooks | @digilist/client-sdk | Unchanged |

### New Convenience Hooks

| Hook | Package | Behavior |
|------|---------|----------|
| `useLocalization()` | @xala/runtime | Re-exports useI18n |
| `useSDK()` | @xala/runtime | SDK client access |
| `useRBAC()` | @xala/runtime | Capability checking |
| `useFeatureFlags()` | @xala/runtime | Flag evaluation |
| `useTenantContext()` | @xala/runtime | Tenant/org context |

---

## Error Handling

### Missing Provider Detection

```typescript
// In hooks
export function useRBAC() {
  const context = useContext(RBACContext);
  
  if (!context) {
    throw new Error(
      'useRBAC must be used within RuntimeProvider. ' +
      'Ensure your app is wrapped with <RuntimeProvider>.'
    );
  }
  
  return context;
}
```

### Development Warnings

```typescript
// In RuntimeProvider
if (process.env.NODE_ENV === 'development') {
  if (!config.apiUrl) {
    console.warn(
      '[RuntimeProvider] apiUrl not provided. ' +
      'SDK calls will fail. Set VITE_API_URL environment variable.'
    );
  }
}
```

---

## Open Questions

1. **Should RoleProvider be app-specific or shared?**
   - Backoffice has unique dual-role logic
   - Could be configurable in RuntimeProvider

2. **How to handle app-specific feature flags?**
   - Server-driven vs. build-time
   - Per-app flag namespacing

3. **WebSocket URL configuration**
   - Some apps don't need realtime
   - Make RealtimeProvider conditional

4. **Storybook performance**
   - Full RuntimeProvider may be heavy
   - Consider lightweight mock mode

---

## References

- [Runtime Provider Audit](./runtime-provider-audit.md)
- [Runtime Provider Impact Report](./runtime-provider-impact-report.md)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Testing Library Wrapper Pattern](https://testing-library.com/docs/react-testing-library/setup#custom-render)
