# Xala Platform LLM Training Material

> Reference document for LLM agents working on the Xala/Digilist platform. Contains architectural patterns, coding standards, and examples for consistent code generation.

---

## 1. Platform Overview

### Monorepo Structure

```
xala-digdir-monorepo/
├── apps/                    # Frontend applications (6)
│   ├── web/                 # Public booking portal
│   ├── backoffice/          # Tenant admin panel
│   ├── minside/             # Citizen self-service
│   ├── monitoring/          # Observability dashboard
│   ├── saas-admin/          # Platform administration
│   └── docs-learning/       # Documentation site
├── packages/                # Shared packages (15+)
│   ├── runtime/             # RuntimeProvider (provider composition)
│   ├── ds/                  # Design System facade
│   ├── i18n/                # Localization
│   ├── auth/                # Authentication
│   ├── client-sdk/          # API SDK with React Query hooks
│   ├── contracts/           # Shared types and schemas
│   └── ...
└── infra/                   # Infrastructure configs
```

### Key Architectural Principles

1. **Thin Apps** - Apps contain only routes and app-specific providers
2. **DS-First** - All UI from `@xala/ds`, never `@digdir/*` directly
3. **SDK-First** - All API calls through `@digilist/client-sdk`, never `fetch()`
4. **Contracts-First** - Types from `@xala/contracts`, never local definitions
5. **i18n-First** - All strings via `t()`, never hardcoded

---

## 2. RuntimeProvider Pattern (CRITICAL)

### The Problem Before

Apps had 8-12 nested providers, duplicated across all apps:

```tsx
// ❌ OLD PATTERN (FORBIDDEN)
<QueryClientProvider>
  <ThemeProvider>
    <I18nProvider>
      <DesignsystemetProvider>
        <DialogProvider>
          <ErrorBoundary>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ErrorBoundary>
        </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### The Solution: RuntimeProvider

```tsx
// ✅ NEW PATTERN (MANDATORY)
// main.tsx
import { RuntimeProvider } from '@xala/runtime';

<RuntimeProvider config={{
  appType: 'web',
  apiUrl: import.meta.env.VITE_API_URL,
  tenantId: import.meta.env.VITE_TENANT_ID,
  locale: 'nb',
  theme: 'digilist',
  colorScheme: 'auto',
}}>
  <App />
</RuntimeProvider>
```

### Provider Composition Order

RuntimeProvider internally composes in deterministic order:

```
1. QueryClientProvider     // SDK data layer
2. ThemeProvider           // Color scheme state
3. I18nProvider            // Locale: 'nb' (GUARANTEED FIRST)
4. DesignsystemetProvider  // Digdir tokens + theme
5. DialogProvider          // Modal dialogs
6. ErrorBoundary           // RFC7807 error mapping
7. AuthProvider            // Session + OAuth
8. FeatureFlagsProvider    // Feature toggles
9. TenantProvider          // Multi-tenant context
10. NotificationCenterProvider // Notifications UI
```

### Key Benefit: t() Always Works

I18nProvider is always mounted before any component renders. No more:
- "Cannot read properties of null (reading 't')"
- Missing translations at startup
- Race conditions with locale loading

---

## 3. App Entry Point Pattern

### main.tsx (ONLY place for RuntimeProvider)

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RuntimeProvider } from '@xala/runtime';
import { initializeClient } from '@digilist/client-sdk';
import '@xala/ds/styles';
import './root.css';
import { App } from './App';

// Initialize SDK
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'default',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeProvider
      config={{
        appType: 'backoffice', // web | backoffice | minside | monitoring | saas-admin | docs-learning
        apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
        wsUrl: import.meta.env.VITE_WS_URL,
        tenantId: import.meta.env.VITE_TENANT_ID || 'default',
        licenseKey: import.meta.env.VITE_LICENSE_KEY || 'dev-key',
        locale: 'nb',
        theme: 'digilist',
        colorScheme: 'auto',
      }}
    >
      <App />
    </RuntimeProvider>
  </React.StrictMode>,
);
```

### App.tsx (Routes ONLY)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@xala/ds';
import { useOAuthCallback } from '@xala/auth';

// App-specific providers only (if needed)
import { AccountContextProvider } from './providers/AccountContextProvider';

function OAuthCallbackHandler() {
  useOAuthCallback();
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <OAuthCallbackHandler />
      <AccountContextProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </Route>
        </Routes>
      </AccountContextProvider>
    </BrowserRouter>
  );
}
```

---

## 4. Component Patterns

### Page Component

```tsx
import { ContentLayout, ContentSection, LoadingFallback } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useBookings } from '@digilist/client-sdk';

export function BookingsPage() {
  const t = useT();
  const { data: bookings, isLoading, error } = useBookings();

  if (isLoading) return <LoadingFallback />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <ContentLayout title={t('bookings.title')}>
      <ContentSection>
        <BookingsList bookings={bookings} />
      </ContentSection>
    </ContentLayout>
  );
}
```

### Using Runtime Hooks

```tsx
import { useNotificationCenter, useFeatureFlags, useRBAC } from '@xala/runtime';
import { useT } from '@xala/i18n';

function Header() {
  const t = useT();
  const { openNotificationCenter } = useNotificationCenter();
  const { isEnabled } = useFeatureFlags();
  const { hasCapability } = useRBAC();

  return (
    <header>
      <h1>{t('app.name')}</h1>
      {isEnabled('notifications') && (
        <NotificationBell onClick={openNotificationCenter} />
      )}
      {hasCapability('admin:write') && (
        <AdminButton />
      )}
    </header>
  );
}
```

---

## 5. Import Rules

### ALLOWED Imports

```tsx
// ✅ Design System
import { Button, Card, DataTable, AppShell } from '@xala/ds';

// ✅ Localization  
import { useT, useI18n } from '@xala/i18n';

// ✅ SDK Hooks
import { useBookings, useCreateBooking, useUser } from '@digilist/client-sdk';

// ✅ Runtime Hooks
import { useNotificationCenter, useFeatureFlags, useRBAC } from '@xala/runtime';

// ✅ Contracts
import type { BookingDTO, CreateBookingInput } from '@xala/contracts';

// ✅ Auth
import { useAuth, useOAuthCallback, ProtectedRoute } from '@xala/auth';
```

### FORBIDDEN Imports

```tsx
// ❌ Direct Digdir imports
import { Button } from '@digdir/designsystemet-react';

// ❌ Direct React Query in apps (use SDK hooks)
import { useQuery, useMutation } from '@tanstack/react-query';

// ❌ Direct fetch/axios
const data = await fetch('/api/bookings');

// ❌ Provider imports in App.tsx
import { ThemeProvider } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
```

---

## 6. File Naming and Structure

### App Structure

```
apps/{app}/
├── src/
│   ├── main.tsx           # RuntimeProvider ONLY
│   ├── App.tsx            # Routes ONLY
│   ├── root.css           # Minimal global styles
│   ├── routes/            # Page components
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   └── settings/
│   ├── components/        # App-specific components (minimize!)
│   │   └── layout/
│   │       └── Header.tsx
│   └── providers/         # App-specific providers ONLY
│       └── AccountContextProvider.tsx
├── vite.config.ts
└── tsconfig.json
```

### Naming Conventions

```
BookingsPage.tsx      # Page component (route)
BookingCard.tsx       # Display component
BookingForm.tsx       # Form component
useBookingActions.ts  # Custom hook
booking.types.ts      # Types
booking.utils.ts      # Utilities
```

---

## 7. Testing Patterns

### Unit Test with Runtime

```tsx
import { render, screen } from '@testing-library/react';
import { createTestWrapper } from '@xala/runtime';
import { BookingCard } from './BookingCard';

const wrapper = createTestWrapper({
  locale: 'nb',
  mockAuth: { user: { id: '1', name: 'Test', role: 'admin' } },
});

describe('BookingCard', () => {
  it('shows booking title', () => {
    render(<BookingCard booking={mockBooking} />, { wrapper });
    expect(screen.getByText(mockBooking.title)).toBeInTheDocument();
  });
});
```

### Storybook with Runtime

```tsx
import { createRuntime } from '@xala/runtime';

const { RuntimeWrapper } = createRuntime({
  locale: 'nb',
  theme: 'digilist',
});

export default {
  title: 'Components/BookingCard',
  component: BookingCard,
  decorators: [(Story) => <RuntimeWrapper><Story /></RuntimeWrapper>],
};
```

---

## 8. Verification Commands

```bash
# Check RuntimeProvider usage (should be 6)
grep -l "RuntimeProvider" apps/*/src/main.tsx | wc -l

# Find provider violations (should be 0)
grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"

# Count local providers (minimize)
find apps/*/src/providers -name "*.tsx" | wc -l

# Build all apps
for app in web backoffice minside monitoring saas-admin docs-learning; do
  cd apps/$app && npm run build
done

# Check for direct fetch (should be 0 in apps)
grep -rE "fetch\(" apps/*/src --include="*.tsx" | wc -l
```

---

## 9. Migration Checklist

When creating or modifying an app:

- [ ] `main.tsx` uses `RuntimeProvider` only
- [ ] `App.tsx` has only `BrowserRouter` + `Routes`
- [ ] No provider imports in `App.tsx` (except app-specific)
- [ ] No `QueryClient` creation in app
- [ ] All hooks from `@xala/runtime` for contexts
- [ ] All UI from `@xala/ds`
- [ ] All API calls via `@digilist/client-sdk` hooks
- [ ] All strings via `useT()`
- [ ] Build passes: `npm run build`

---

## 10. Code Generation Examples

### Prompt: "Create a new page for managing organizations"

```tsx
// apps/backoffice/src/routes/organizations/OrganizationsPage.tsx
import { ContentLayout, ContentSection, DataTable, Button } from '@xala/ds';
import { useT } from '@xala/i18n';
import { useOrganizations, useCreateOrganization } from '@digilist/client-sdk';
import { PlusIcon } from '@xala/ds';

export function OrganizationsPage() {
  const t = useT();
  const { data: orgs, isLoading } = useOrganizations();
  const createOrg = useCreateOrganization();

  const columns = [
    { key: 'name', header: t('organization.name') },
    { key: 'memberCount', header: t('organization.members') },
    { key: 'createdAt', header: t('common.created') },
  ];

  return (
    <ContentLayout
      title={t('organizations.title')}
      actions={
        <Button onClick={() => createOrg.mutate({})}>
          <PlusIcon /> {t('organizations.create')}
        </Button>
      }
    >
      <ContentSection>
        <DataTable
          columns={columns}
          data={orgs ?? []}
          loading={isLoading}
        />
      </ContentSection>
    </ContentLayout>
  );
}
```

### Prompt: "Add form for creating booking"

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBookingSchema, CreateBookingDTO } from '@xala/contracts';
import { useCreateBooking } from '@digilist/client-sdk';
import { Button, Input, FormField, Dialog } from '@xala/ds';
import { useT } from '@xala/i18n';

interface BookingFormProps {
  onClose: () => void;
}

export function BookingForm({ onClose }: BookingFormProps) {
  const t = useT();
  const createBooking = useCreateBooking();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateBookingDTO>({
    resolver: zodResolver(CreateBookingSchema),
  });

  const onSubmit = async (data: CreateBookingDTO) => {
    await createBooking.mutateAsync(data);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} title={t('booking.create')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label={t('booking.title')} error={errors.title?.message}>
          <Input {...register('title')} />
        </FormField>
        <FormField label={t('booking.date')} error={errors.startDate?.message}>
          <Input type="date" {...register('startDate')} />
        </FormField>
        <Button type="submit" loading={createBooking.isPending}>
          {t('common.save')}
        </Button>
      </form>
    </Dialog>
  );
}
```

---

**Last Updated:** 2026-01-20
**Status:** Active
**Apps Migrated:** 6/6 (100%)
**Total LOC Reduction:** 41%
