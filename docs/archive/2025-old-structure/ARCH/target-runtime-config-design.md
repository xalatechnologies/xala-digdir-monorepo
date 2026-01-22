# Target Runtime and Config Design

**Date:** 2026-01-20  
**Status:** Implemented (packages/runtime)

---

## Overview

This document describes the centralized runtime architecture for DigiList applications. The goal is to make apps "presentation shells" that only contain routes and wrappers.

---

## RuntimeProvider Composition Order

The RuntimeProvider composes providers in a specific order to ensure dependencies are available:

```
RuntimeProvider
├── 1. QueryClientProvider        (SDK data layer)
├── 2. ThemeProvider              (color scheme state)
├── 3. I18nProvider               (locale: 'nb')
├── 4. DesignsystemetProvider     (Digdir tokens + theme)
├── 5. DialogProvider             (modal dialogs)
├── 6. ErrorBoundary              (RFC7807 error mapping)
├── 7. AuthProvider               (session + OAuth)
├── 8. FeatureFlagsProvider       (DK flags)
├── 9. TenantProvider             (multi-tenant context)
├── 10. NotificationCenterProvider (notifications UI)
└── children                       (App routes)
```

**File:** `packages/runtime/src/RuntimeProvider.tsx`

---

## AppProfile Schema

Each app is identified by an `appType` that determines runtime behavior:

```typescript
type AppType = 
  | 'web'           // Public-facing booking site
  | 'minside'       // Citizen self-service portal
  | 'backoffice'    // Tenant admin panel
  | 'saas-admin'    // Platform admin
  | 'monitoring'    // Observability dashboard
  | 'docs-learning' // Documentation site
  | 'storybook';    // Component development

interface RuntimeConfig {
  appType: AppType;
  apiUrl: string;
  wsUrl?: string;
  tenantId: string;
  licenseKey: string;
  locale?: SupportedLocale;     // Default: 'nb'
  theme?: ThemeId;              // Default: 'digilist'
  colorScheme?: ColorScheme;    // Default: 'auto'
  authConfig?: AuthConfig;
  features?: Record<string, boolean>;
}
```

**File:** `packages/runtime/src/types.ts`

---

## Env Schema ✅ IMPLEMENTED (packages/config)

Environment variables are validated at startup using Zod:

```typescript
import { validateEnv, createAppConfig } from '@xala/config';

// Validate environment at startup
const env = validateEnv(import.meta.env);

// Create all config at once
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
```

**Location:** `packages/config/src/env-schema.ts`

### Validated Variables:

| Variable | Required | Default |
|----------|----------|---------|
| VITE_API_URL | Yes | https://api.digilist.no |
| VITE_WS_URL | No | - |
| VITE_TENANT_ID | Yes | default |
| VITE_LICENSE_KEY | Yes | dev-key |
| VITE_SENTRY_DSN | No | - |

### Usage in Apps:

```typescript
// Before: 20 lines of duplicate config per app
// After: 3 lines

import { validateEnv, createAppConfig } from '@xala/config';
const env = validateEnv(import.meta.env);
const { sdkConfig, runtimeConfig } = createAppConfig('backoffice', env);
```

---

## Hook Contracts

RuntimeProvider exposes hooks for all cross-cutting concerns:

### useLocalization

```typescript
import { useLocalization, useT } from '@xala/runtime';

function MyComponent() {
  const { locale, setLocale, t } = useLocalization();
  // or simply:
  const t = useT();
  
  return <span>{t('booking.title')}</span>;
}
```

**File:** `packages/runtime/src/hooks/useLocalization.ts`

### useSDK

```typescript
import { useSDK } from '@xala/runtime';

function MyComponent() {
  const { queryClient, apiUrl, isOnline } = useSDK();
  
  // Use with @tanstack/react-query
  const { data } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchBookings(apiUrl),
  });
}
```

**File:** `packages/runtime/src/hooks/useSDK.ts`

### useRBAC

```typescript
import { useRBAC } from '@xala/runtime';

function AdminButton() {
  const { hasCapability, isAdmin, isTenantAdmin } = useRBAC();
  
  if (!hasCapability('write:bookings')) return null;
  
  return <Button>Create Booking</Button>;
}
```

**File:** `packages/runtime/src/hooks/useRBAC.ts`

### useFeatureFlags

```typescript
import { useFeatureFlags } from '@xala/runtime';

function NewFeature() {
  const { isEnabled, getValue } = useFeatureFlags();
  
  if (!isEnabled('new-booking-flow')) return null;
  
  return <NewBookingFlow />;
}
```

**File:** `packages/runtime/src/RuntimeProvider.tsx` (inline)

### useNotificationCenter

```typescript
import { useNotificationCenter } from '@xala/runtime';

function Header() {
  const { openNotificationCenter, isOpen } = useNotificationCenter();
  
  return <BellIcon onClick={openNotificationCenter} />;
}
```

**File:** `packages/runtime/src/RuntimeProvider.tsx` (inline)

---

## Storybook 10 Integration

Storybook mounts runtime via `createRuntime()` factory:

```typescript
// packages/ds/.storybook/preview.tsx
import { createRuntime } from '@xala/runtime';

const { RuntimeWrapper } = createRuntime({
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
  mockAuth: {
    isAuthenticated: true,
    user: { name: 'Storybook User', role: 'tenant-admin' },
  },
  mockFlags: {
    'new-feature': true,
  },
});

export const decorators = [
  (Story) => (
    <RuntimeWrapper>
      <Story />
    </RuntimeWrapper>
  ),
];
```

**File:** `packages/runtime/src/createRuntime.tsx`

### Testing Integration

```typescript
// Example test file
import { createTestWrapper } from '@xala/runtime';

const wrapper = createTestWrapper({
  locale: 'nb',
  mockAuth: { user: { role: 'admin' } },
});

describe('BookingCard', () => {
  it('renders', () => {
    render(<BookingCard booking={mockBooking} />, { wrapper });
    expect(screen.getByText('Booking')).toBeInTheDocument();
  });
});
```

---

## Import Boundaries (Enforcement)

### Apps MAY import:
- `@xala/runtime` - RuntimeProvider, hooks
- `@xala/ds` - DS components and blocks
- `@digilist/client-sdk` - SDK hooks only
- `react-router-dom` - Routing utilities

### Apps MUST NOT import:
- Any `*Provider` from packages (except RuntimeProvider)
- `@tanstack/react-query` directly (use SDK hooks)
- Direct env access (use `getEnv()` from config)
- Theme tokens directly (use DS)

### DS MUST NOT import:
- Any app code
- RuntimeProvider (blocks get context via hooks)

### Packages MAY import:
- Other packages (respecting dependency order)
- NOT from apps

---

## CI Gates (Planned)

```yaml
# .github/workflows/thin-app-check.yml
- name: Check no Provider imports in pages
  run: |
    grep -r "import.*Provider" apps/*/src/routes --include="*.tsx" && exit 1 || exit 0

- name: Check no direct fetch in apps
  run: |
    grep -rE "fetch\(|axios\." apps/*/src --include="*.ts" --include="*.tsx" && exit 1 || exit 0

- name: Check no env access in apps
  run: |
    grep -r "process\.env\|import\.meta\.env" apps/*/src/routes --include="*.tsx" && exit 1 || exit 0
```

---

## Migration Checklist

For each app migration:

- [ ] Update `main.tsx` to use RuntimeProvider
- [ ] Update `App.tsx` to contain only BrowserRouter + Routes
- [ ] Remove local provider imports from pages
- [ ] Delete unused local provider files
- [ ] Update imports to use @xala/runtime hooks
- [ ] Verify build passes
- [ ] Verify app boots and renders correctly

---

## File Structure

```
packages/runtime/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # Public exports
    ├── types.ts              # Type definitions
    ├── RuntimeProvider.tsx   # Main provider composition
    ├── createRuntime.tsx     # Test/Storybook factory
    ├── hooks/
    │   ├── index.ts
    │   ├── useLocalization.ts
    │   ├── useSDK.ts
    │   └── useRBAC.ts
    ├── providers/            # (Future) Internal providers
    └── utils/                # (Future) Utilities
```
