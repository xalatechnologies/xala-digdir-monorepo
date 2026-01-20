# @xala/runtime Package

## Purpose

Centralized runtime provider package that composes all cross-cutting concerns into a single `RuntimeProvider`. This eliminates provider sprawl and guarantees consistent context availability across all apps.

## Usage

```tsx
// main.tsx - ALL APPS MUST USE THIS PATTERN
import { RuntimeProvider } from '@xala/runtime';

<RuntimeProvider config={{
  appType: 'web', // 'backoffice' | 'minside' | 'monitoring' | 'saas-admin' | 'docs-learning'
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
}}>
  <App />
</RuntimeProvider>
```

## Provider Composition Order

RuntimeProvider internally composes in deterministic order:
1. QueryClientProvider (SDK data layer)
2. ThemeProvider (color scheme state)
3. I18nProvider (locale: 'nb')
4. DesignsystemetProvider (Digdir tokens + theme)
5. DialogProvider (modal dialogs)
6. ErrorBoundary (RFC7807 error mapping)
7. AuthProvider (session + OAuth)
8. FeatureFlagsProvider (feature toggles)
9. TenantProvider (multi-tenant context)
10. NotificationCenterProvider (notifications UI)

## Hooks

```typescript
import { useLocalization, useT } from '@xala/runtime';
import { useSDK } from '@xala/runtime';
import { useRBAC } from '@xala/runtime';
import { useFeatureFlags } from '@xala/runtime';
import { useNotificationCenter } from '@xala/runtime';
```

## Key Benefit: t() Issue SOLVED

I18nProvider is always mounted before any component renders. No more:
- "Cannot read properties of null (reading 't')"
- Missing translations at startup
- Race conditions with locale loading

## Testing

```typescript
import { createRuntime, createTestWrapper } from '@xala/runtime';

// For Storybook
const { RuntimeWrapper } = createRuntime({ locale: 'nb', theme: 'digilist' });

// For unit tests
const wrapper = createTestWrapper({ mockAuth: { user: mockUser } });
render(<Component />, { wrapper });
```

## FORBIDDEN Patterns

```tsx
// ❌ NEVER manually compose providers
<QueryClientProvider>
  <ThemeProvider>
    <I18nProvider>
      ...
    </I18nProvider>
  </ThemeProvider>
</QueryClientProvider>

// ❌ NEVER import providers directly in App.tsx
import { ThemeProvider } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

// ✅ ALWAYS use RuntimeProvider in main.tsx only
import { RuntimeProvider } from '@xala/runtime';
```

## App.tsx Rules

App.tsx must be a THIN routing layer only:
- ✅ BrowserRouter
- ✅ Routes
- ✅ App-specific providers only (AccountContextProvider, etc.)
- ❌ Core provider composition
- ❌ QueryClient creation
- ❌ Theme state management
- ❌ SDK initialization
