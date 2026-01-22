# Frequently Asked Questions (FAQ)

> Last Updated: January 16, 2026

Common questions and answers for developers working with the Digilist/Xala platform. This guide covers monorepo setup, design system usage, SDK integration, theme management, and deployment workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Monorepo & Development](#monorepo--development)
3. [Design System & Components](#design-system--components)
4. [SDK & API Integration](#sdk--api-integration)
5. [Theme & Styling](#theme--styling)
6. [Testing & Quality](#testing--quality)
7. [Build & Deployment](#build--deployment)
8. [Architecture & Patterns](#architecture--patterns)

---

## Getting Started

### Q: What is the Digilist/Xala platform?

**A:** Digilist (also known as Xala) is a Norwegian municipal booking and resource management system. It's a multi-tenant SaaS platform serving Norwegian municipalities (kommuner) with features for:
- Resource and rental object management
- Booking and allocation systems
- Audit-compliant event logging
- Multi-theme support (Digdir Designsystemet)
- Real-time updates via WebSocket
- Role-based access control (RBAC)

The platform is **production-live** and must maintain high standards for security, compliance, and performance.

---

### Q: What technologies does the platform use?

**A:** The stack includes:

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- TanStack React Query (data fetching)
- Digdir Designsystemet (design system)
- Mapbox GL (maps)

**Backend:**
- Fastify (API server)
- Drizzle ORM
- PostgreSQL (database)
- WebSocket (real-time)

**Monorepo:**
- Turborepo (build orchestration)
- pnpm workspaces (package management)

**Key Packages:**
- `@digilist/client-sdk` - Enterprise SDK for API integration
- `@xala/ds` - Design system facade
- `@xala/ds-themes` - Theme management

---

### Q: How do I set up my development environment?

**A:** Follow these steps:

```bash
# 1. Clone the repository
git clone https://github.com/your-org/xala-digdir-monorepo.git
cd xala-digdir-monorepo

# 2. Install pnpm (if not already installed)
npm install -g pnpm

# 3. Install dependencies
pnpm install

# 4. Build all packages
pnpm build

# 5. Start all apps in development mode
pnpm dev
```

**Apps will be available at:**
- Web: http://localhost:5173
- Backoffice: http://localhost:5174
- MinSide: http://localhost:5175 (if configured)

**First-time setup:**
- Copy `.env.example` to `.env` in each app
- Configure `VITE_API_URL` and `VITE_TENANT_ID`
- Run `pnpm tokens:create && pnpm tokens:build` to generate theme tokens

---

## Monorepo & Development

### Q: How is the monorepo structured?

**A:** The repository uses Turborepo with pnpm workspaces:

```
xala-digdir-monorepo/
├── apps/
│   ├── web/              # Public-facing app (port 5173)
│   ├── backoffice/       # Admin portal (port 5174)
│   └── minside/          # User dashboard
├── packages/
│   ├── client-sdk/       # @digilist/client-sdk
│   ├── ds/               # @xala/ds (design system facade)
│   ├── ds-themes/        # @xala/ds-themes (theme registry)
│   ├── ds-registry/      # Documentation
│   ├── i18n/             # Internationalization
│   └── eslint-config/    # Shared ESLint config
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

**Key points:**
- Apps import from packages using workspace protocol
- Turborepo handles build orchestration and caching
- Each app is independently deployable

---

### Q: How do I add a new app to the monorepo?

**A:** Follow these steps:

**1. Create app directory:**
```bash
cd apps/
mkdir my-new-app
cd my-new-app
pnpm init
```

**2. Install dependencies:**
```bash
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom typescript vite
pnpm add @xala/ds @digilist/client-sdk
```

**3. Create Vite config** (`vite.config.ts`):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175, // Choose unique port
  },
  resolve: {
    alias: {
      '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
      '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
      '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
    },
  },
});
```

**4. Update root `package.json`:**
```json
{
  "scripts": {
    "dev:my-new-app": "pnpm --filter my-new-app dev",
    "build:my-new-app": "pnpm --filter my-new-app build"
  }
}
```

**5. Create entry point** (`src/main.tsx`):
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeClient } from '@digilist/client-sdk';
import { DesignsystemetProvider } from '@xala/ds';
import '@xala/ds/styles'; // Import ONCE

initializeClient({
  baseUrl: import.meta.env.VITE_API_URL,
  tenantId: import.meta.env.VITE_TENANT_ID,
});

function App() {
  return (
    <DesignsystemetProvider theme="digdir">
      <h1>My New App</h1>
    </DesignsystemetProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**6. Add to Turborepo pipeline** in root `turbo.json` if needed.

---

### Q: How do I run just one app instead of all apps?

**A:** Use pnpm's filter flag:

```bash
# Run specific app
pnpm --filter web dev
pnpm --filter backoffice dev

# Or use convenience scripts
pnpm dev:web
pnpm dev:backoffice

# Build specific app
pnpm --filter web build

# Run tests for specific package
pnpm --filter @digilist/client-sdk test
```

---

### Q: What's the difference between `pnpm install` and `pnpm build`?

**A:**

**`pnpm install`:**
- Installs dependencies from npm registry
- Creates `node_modules/` directories
- Generates/updates `pnpm-lock.yaml`
- Does NOT build packages

**`pnpm build`:**
- Compiles TypeScript packages
- Generates `dist/` folders
- Runs through Turborepo pipeline
- Required before first `pnpm dev`

**When to use each:**
```bash
# After cloning repo or pulling major changes
pnpm install

# Before first development session
pnpm build

# When you change package source code
cd packages/client-sdk
pnpm build
```

---

### Q: Why do I get "Cannot find module '@digilist/client-sdk'"?

**A:** This happens when packages aren't built. Fix:

```bash
# From monorepo root
pnpm build

# Or build specific package
cd packages/client-sdk
pnpm build
```

**Vite uses path aliases** (defined in `vite.config.ts`) to resolve workspace packages during development. These aliases point to the **source code** in `packages/*/src`, so you need to build packages that export compiled types.

---

## Design System & Components

### Q: Why can't I import `@digdir/designsystemet-react` directly?

**A:** Direct imports are **forbidden by architecture rules**. You must use the `@xala/ds` facade:

**Reason:**
- Centralizes design system imports
- Allows custom component composition
- Enforces consistency
- Enables version upgrades in one place
- ESLint rule enforces this (`digdir/prefer-ds-components`)

**Correct pattern:**
```tsx
// ❌ WRONG
import { Button } from '@digdir/designsystemet-react';
import '@digdir/designsystemet-css';

// ✅ CORRECT
import { Button } from '@xala/ds';
```

**Exception:** Only `packages/ds/src/styles.ts` can import from `@digdir/*` packages.

---

### Q: Where do I import design system styles?

**A:** Import `@xala/ds/styles` **exactly once** in your app's entry point:

```tsx
// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@xala/ds/styles'; // ← Import ONCE here

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**DO NOT:**
- Import in multiple files
- Import in component files
- Import `@digdir/designsystemet-css` directly
- Import theme CSS files manually (handled by `@xala/ds/styles`)

---

### Q: How do I create a new component?

**A:** Follow the [Component Creation Checklist](../COMPONENT_CREATION_CHECKLIST.md):

**1. Determine component category:**
- **Primitives** - Re-export from Digdir (Button, Input, Card)
- **Composed** - Combine primitives (PageHeader, FilterBar)
- **Blocks** - Business logic (RentalObjectCard, KPICard)
- **Shells** - Application layout (AppShell)

**2. Create component file:**
```bash
# Create in appropriate category
touch packages/ds/src/composed/MyComponent.tsx
```

**3. Implement with design tokens:**
```tsx
// packages/ds/src/composed/MyComponent.tsx
import React from 'react';
import { Card, Heading } from '@digdir/designsystemet-react';

export interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export const MyComponent = ({ title, children }: MyComponentProps) => {
  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-6)',
        borderRadius: 'var(--ds-border-radius-md)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Heading level={2} data-size="sm">{title}</Heading>
      <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
        {children}
      </div>
    </Card>
  );
};
```

**4. Export from index:**
```typescript
// packages/ds/src/index.ts
export { MyComponent } from './composed/MyComponent';
export type { MyComponentProps } from './composed/MyComponent';
```

**5. Use in apps:**
```tsx
import { MyComponent } from '@xala/ds';

function MyPage() {
  return <MyComponent title="Hello">Content</MyComponent>;
}
```

**Rules:**
- ✅ Use design tokens for ALL styling
- ✅ Use `<Heading>` and `<Paragraph>` for typography
- ✅ Make components accessible (ARIA, semantic HTML)
- ❌ No hardcoded colors, spacing, or font sizes
- ❌ No inline styles (use tokens instead)

---

### Q: What are design tokens and why must I use them?

**A:** Design tokens are CSS custom properties that define all visual design decisions:

```css
/* Colors */
--ds-color-neutral-text-default
--ds-color-accent-base-default

/* Spacing */
--ds-spacing-4   /* ~16px */
--ds-spacing-6   /* ~24px */

/* Typography */
--ds-font-size-md
--ds-font-weight-semibold

/* Border radius */
--ds-border-radius-md
```

**Why use them:**
1. **Consistency** - Same values across all components
2. **Theme support** - Light/dark mode works automatically
3. **Maintainability** - Change once, update everywhere
4. **Accessibility** - Proper contrast ratios built-in
5. **Responsive** - Tokens adapt to viewport size

**Enforcement:**
- ESLint rules catch hardcoded values (`digdir/no-hardcoded-colors`)
- Scanner tools validate token usage (`pnpm scan:tokens`)
- Code reviews reject non-token usage

**Example:**
```tsx
// ❌ WRONG - Hardcoded values
<div style={{ color: '#333', padding: '16px', fontSize: '14px' }}>

// ✅ CORRECT - Design tokens
<div style={{
  color: 'var(--ds-color-neutral-text-default)',
  padding: 'var(--ds-spacing-4)',
  fontSize: 'var(--ds-font-size-sm)',
}}>
```

See [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md) for complete reference.

---

### Q: How do I find the right design token to use?

**A:** Use this workflow:

**1. Search generated theme first:**
```bash
grep "text-default" packages/ds-themes/generated/digilist.css
grep "spacing" packages/ds-themes/generated/digilist.css
```

**2. Search extension tokens:**
```bash
grep "color" packages/ds-themes/themes/digilist-extensions.css
```

**3. Check Design Tokens Guide:**
- See [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md) for complete token reference
- Organized by category (color, spacing, typography, etc.)

**4. If token doesn't exist, create extension:**
```css
/* packages/ds-themes/themes/digilist-extensions.css */
:root {
  /* Document purpose */
  --digilist-sidebar-background: var(--ds-color-neutral-surface-subtle);
}
```

**Common token patterns:**

| Need | Token Pattern |
|------|---------------|
| Text color | `--ds-color-neutral-text-{default\|subtle\|muted}` |
| Background | `--ds-color-neutral-background-{default\|subtle}` |
| Surface (cards) | `--ds-color-neutral-surface-{default\|hover\|active}` |
| Primary action | `--ds-color-accent-base-{default\|hover}` |
| Spacing | `--ds-spacing-{1-30}` |
| Font size | `--ds-font-size-{xs\|sm\|md\|lg\|xl}` |
| Border radius | `--ds-border-radius-{sm\|md\|lg\|xl}` |

---

## SDK & API Integration

### Q: Why must I use the SDK instead of fetch()?

**A:** The **SDK-FIRST RULE** is a non-negotiable architecture requirement:

**Why it exists:**
1. **Type safety** - TypeScript types for all DTOs
2. **Consistency** - Standardized error handling (RFC 7807)
3. **Audit compliance** - Automatic audit logging
4. **Multi-tenancy** - Tenant context included automatically
5. **Caching** - React Query integration built-in
6. **Real-time** - WebSocket updates coordinated with queries
7. **Maintainability** - API changes handled in one place

**Correct pattern:**
```tsx
// ❌ WRONG - Direct API call
const response = await fetch('/api/rental-objects');
const rentalObjects = await response.json();

// ✅ CORRECT - Use SDK hook
import { useRentalObjects } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data: rentalObjects, isLoading, error } = useRentalObjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{rentalObjects.map(...)}</div>;
}
```

**If SDK lacks a method:**
- **DO NOT** bypass with fetch()
- **DO** report the gap to the team
- **DO** request SDK enhancement

See [CLAUDE.md](../../CLAUDE.md#sdk-first-rule) for complete rules.

---

### Q: How do I initialize the SDK?

**A:** Call `initializeClient()` in your app's entry point:

```tsx
// apps/web/src/main.tsx
import { initializeClient } from '@digilist/client-sdk';

initializeClient({
  baseUrl: import.meta.env.VITE_API_URL,
  tenantId: import.meta.env.VITE_TENANT_ID,
});

// Then render app
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

**Environment variables** (in `.env`):
```bash
VITE_API_URL=https://api.digilist.no
VITE_TENANT_ID=your-kommune-id
```

**Must initialize before:**
- Using any SDK hooks
- Rendering components that use SDK
- Making any API calls

---

### Q: What SDK services are available?

**A:** The SDK provides 24+ services in `packages/client-sdk/src/services/`:

**Core Services:**
- `authService` - Authentication and authorization
- `rentalObjectService` - Rental object management
- `bookingService` - Booking CRUD operations
- `allocationService` - Resource allocation
- `organizationService` - Kommune/organization management

**Support Services:**
- `auditService` - Audit log queries
- `notificationService` - Push notifications
- `conversationService` - Messaging
- `integrationService` - Third-party integrations
- `reportsService` - Analytics and reporting

**Utility Services:**
- `dashboardService` - Dashboard data aggregation
- `monitoringService` - System health monitoring
- `discountCodeService` - Discount code management

**Each service exports:**
- Service methods (e.g., `rentalObjectService.getAll()`)
- React Query hooks (e.g., `useRentalObjects()`)
- TypeScript types (e.g., `RentalObjectDTO`)

---

### Q: How do I handle errors from the SDK?

**A:** The SDK uses RFC 7807 Problem Details format:

```tsx
import { useRentalObjects } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data, error } = useRentalObjects();

  if (error) {
    // error.type - URI identifying error type
    // error.title - Human-readable summary
    // error.status - HTTP status code
    // error.detail - Detailed explanation

    return (
      <div>
        <h2>{error.title}</h2>
        <p>{error.detail}</p>
        <small>Status: {error.status}</small>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

**All errors follow this interface:**
```typescript
interface ProblemDetails {
  type: string;      // e.g., "/errors/not-found"
  title: string;     // e.g., "Rental Object Not Found"
  status: number;    // e.g., 404
  detail?: string;   // e.g., "Rental object with ID 123 does not exist"
}
```

---

### Q: How do I invalidate cache after mutations?

**A:** Use React Query's `invalidateQueries`:

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { rentalObjectService } from '@digilist/client-sdk';

function UpdateRentalObjectForm() {
  const queryClient = useQueryClient();

  const handleSubmit = async (data) => {
    // Perform mutation
    await rentalObjectService.update(id, data);

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['rentalObjects'] });
    queryClient.invalidateQueries({ queryKey: ['rentalObject', id] });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Common query keys:**
- `['rentalObjects']` - All rental objects
- `['rentalObject', id]` - Single rental object
- `['bookings']` - All bookings
- `['booking', id]` - Single booking
- `['organizations']` - All organizations

---

## Theme & Styling

### Q: How do theme tokens work?

**A:** Theme tokens are CSS custom properties that change based on theme settings:

**Theme Configuration:**
```tsx
import { DesignsystemetProvider } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider
      theme="digdir"           // Theme name
      colorScheme="auto"       // "light" | "dark" | "auto"
      size="md"                // "sm" | "md" | "lg"
      typography="primary"     // Font family variant
    >
      {/* Your app */}
    </DesignsystemetProvider>
  );
}
```

**How it works:**
1. Provider sets `data-*` attributes on `<html>` element
2. CSS selects tokens based on these attributes
3. Components use tokens via `var(--ds-*)`

**Example:**
```css
/* Light mode */
:root, [data-color-scheme="light"] {
  --ds-color-neutral-background-default: #ffffff;
}

/* Dark mode */
[data-color-scheme="dark"] {
  --ds-color-neutral-background-default: #1a1a1a;
}

/* Auto mode (follows system preference) */
@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    --ds-color-neutral-background-default: #1a1a1a;
  }
}
```

**In components:**
```tsx
<div style={{
  backgroundColor: 'var(--ds-color-neutral-background-default)'
}}>
  {/* Automatically light or dark based on theme */}
</div>
```

---

### Q: How do I add custom theme tokens?

**A:** Create extension tokens in `packages/ds-themes/themes/digilist-extensions.css`:

```css
@layer ds.app {
  /* Light mode tokens */
  :root, [data-color-scheme="light"] {
    --digilist-sidebar-width: 240px;
    --digilist-header-height: 64px;
    --digilist-sidebar-background: var(--ds-color-neutral-surface-subtle);
    --digilist-custom-accent: #1F4080;
  }

  /* Dark mode tokens */
  [data-color-scheme="dark"] {
    --digilist-sidebar-background: var(--ds-color-neutral-surface-default);
    --digilist-custom-accent: #9EDBE5; /* Better contrast in dark mode */
  }

  /* Auto mode (dark) */
  @media (prefers-color-scheme: dark) {
    [data-color-scheme="auto"] {
      --digilist-sidebar-background: var(--ds-color-neutral-surface-default);
      --digilist-custom-accent: #9EDBE5;
    }
  }
}
```

**Rules:**
- Use `--digilist-*` prefix for custom tokens
- Define for all color schemes (light, dark, auto)
- Reference Digdir tokens when possible (`var(--ds-*)`)
- Document purpose in comments

**Usage:**
```tsx
<div style={{
  width: 'var(--digilist-sidebar-width)',
  backgroundColor: 'var(--digilist-sidebar-background)',
}}>
```

---

### Q: How do I regenerate theme tokens?

**A:** After modifying `designsystemet.config.json`:

```bash
# 1. Generate new tokens from config
pnpm tokens:create

# 2. Build CSS files
pnpm tokens:build

# 3. Copy to app public folders
for app in web backoffice minside; do
  mkdir -p apps/$app/public/themes
  cp packages/ds-themes/generated/digilist.css apps/$app/public/themes/
  cp packages/ds-themes/themes/digilist-extensions.css apps/$app/public/themes/
done

# 4. Restart dev server
pnpm dev
```

**Hard refresh browser** (Cmd+Shift+R / Ctrl+Shift+R) to clear cached CSS.

---

### Q: How do I switch themes at runtime?

**A:** Use the `DesignsystemetProvider` with state:

```tsx
import { DesignsystemetProvider } from '@xala/ds';
import { useState } from 'react';

function App() {
  const [theme, setTheme] = useState<'digdir' | 'altinn' | 'uutilsynet'>('digdir');

  return (
    <DesignsystemetProvider theme={theme}>
      <header>
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
          <option value="digdir">Digdir</option>
          <option value="altinn">Altinn</option>
          <option value="uutilsynet">Utsynet</option>
        </select>
      </header>
      {/* Your app */}
    </DesignsystemetProvider>
  );
}
```

**Available themes:**
- `digdir` - Default Digdir theme
- `altinn` - Altinn theme
- `uutilsynet` - Utsynet theme
- `portal` - Portal theme

Themes are registered in `packages/ds-themes/src/index.ts`.

---

## Testing & Quality

### Q: How do I run tests?

**A:** Use these commands:

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run E2E tests (Playwright)
pnpm test:e2e

# Run E2E tests with browser visible
pnpm test:e2e --headed

# Run tests for specific package
pnpm --filter @digilist/client-sdk test
```

**Test files:**
- Unit tests: `**/*.{test,spec}.{ts,tsx}`
- E2E tests: `tests/e2e/**/*.spec.ts`

**Test runners:**
- Vitest (unit/integration)
- Playwright (E2E)

---

### Q: How do I run the design system scanners?

**A:** Use scanner commands to enforce compliance:

```bash
# Run all scanners (recommended before commit)
pnpm scan

# Specific scanners
pnpm scan:tokens        # Check token usage
pnpm scan:components    # Check component patterns
pnpm scan:a11y          # Check accessibility
pnpm scan:compliance    # Check design compliance

# Strict mode (warnings become errors)
pnpm scan:strict

# Auto-fix issues where possible
pnpm scan:fix

# JSON output for CI/CD
pnpm scan:compliance:json

# Run all scans
pnpm scan:all
```

**What scanners check:**
- No hardcoded colors, spacing, typography
- Proper component imports (`@xala/ds` not `@digdir/*`)
- asChild single child requirement
- Button type attributes
- Interactive label associations
- Design token compliance

---

### Q: How do I write tests for SDK hooks?

**A:** Use Vitest with React Testing Library:

```tsx
// packages/client-sdk/src/hooks/useRentalObjects.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRentalObjects } from './useRentalObjects';

describe('useRentalObjects', () => {
  it('fetches rental objects successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useRentalObjects(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[0]).toHaveProperty('title');
  });
});
```

---

## Build & Deployment

### Q: How do I build for production?

**A:** Use the build command:

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter backoffice build

# Test production build locally
pnpm build && pnpm preview
```

**Build output:**
- Apps: `apps/*/dist/`
- Packages: `packages/*/dist/`

**Vite optimizations:**
- Code splitting
- Tree shaking
- Minification
- Content hashing for cache busting

---

### Q: How do I deploy?

**A:** Use the deployment scripts:

```bash
# Deploy specific app
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside

# Deploy all apps
pnpm deploy:all

# Setup SSL certificates (first time)
pnpm deploy:ssl
```

**Deployment process:**
1. Builds app for production
2. Copies theme files to public folder
3. Uploads to server via rsync/SSH
4. Updates server configuration

**Manual deployment:**
```bash
# 1. Build
pnpm build

# 2. Copy to server
rsync -avz --delete \
  apps/web/dist/ \
  user@server:/var/www/html/web-test.digilist.no/

# 3. Verify
curl https://web-test.digilist.no/
```

See [Deployment Guide](../DEPLOYMENT_GUIDE.md) for detailed instructions.

---

### Q: How do I verify a production build locally?

**A:** Use the preview command:

```bash
# Build and preview
pnpm build
pnpm preview

# Or in one command
pnpm build && pnpm preview
```

This serves the production build locally at http://localhost:4173 (or next available port).

**What to test:**
- ✅ All pages load without errors
- ✅ Styles and themes work correctly
- ✅ API calls succeed (use production API or mock)
- ✅ Images and assets load
- ✅ Dark mode toggles work
- ✅ No console errors

---

### Q: What's the difference between dev and production builds?

**A:**

| Aspect | Development (`pnpm dev`) | Production (`pnpm build`) |
|--------|--------------------------|---------------------------|
| **Server** | Vite dev server | Static files |
| **Speed** | Instant HMR | N/A (pre-built) |
| **Size** | Large, unoptimized | Optimized, minified |
| **Source maps** | Full, inline | External or none |
| **Code splitting** | Minimal | Aggressive |
| **Caching** | Disabled | Content hashes |
| **Environment** | `.env` or `.env.development` | `.env.production` |

**Always test production builds before deploying:**
```bash
pnpm build && pnpm preview
```

---

## Architecture & Patterns

### Q: What is the "no transformers" rule?

**A:** Frontend components must use SDK DTOs directly without transformation:

**Forbidden patterns:**
```tsx
// ❌ WRONG - Transformer function
function toCardModel(rentalObject: RentalObjectDTO) {
  return {
    displayName: rentalObject.name,
    url: `/rental-objects/${rentalObject.id}`,
  };
}

function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectDTO }) {
  const model = toCardModel(rentalObject);
  return <Card>{model.displayName}</Card>;
}
```

**Correct patterns:**
```tsx
// ✅ CORRECT - Use Projection DTO directly
import { RentalObjectCardProjectionDTO } from '@digilist/client-sdk/types';

function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectCardProjectionDTO }) {
  return <Card>{rentalObject.title}</Card>;
}
```

**Why this rule exists:**
1. Backend controls data shape
2. No duplicate business logic in frontend
3. Type safety preserved
4. Performance (no runtime transforms)
5. Maintainability

**What you CAN'T do:**
- `toXxx()`, `fromXxx()`, `mapXxx()`, `adaptXxx()` functions
- `*VM`, `*ViewModel`, `*UiModel` types
- Reshaping API DTOs before rendering
- Computing permissions/actions in frontend
- `select:` in React Query that transforms data

**What you CAN do:**
- Use Projection DTOs from SDK
- Read `dto.permissions` and `dto.availableActions`
- Display data as-is

See [ARCHITECTURE_NO_TRANSFORMERS.md](../ARCHITECTURE_NO_TRANSFORMERS.md).

---

### Q: What is the audit-first principle?

**A:** All state mutations MUST be auditable for compliance:

**Requirements:**
- Any action that changes data must be logged
- Audit log includes: `who`, `what`, `when`, `tenantId`, `ip/ua`
- If action can't be audited, **block implementation**

**Example:**
```tsx
// When creating a booking
const booking = await bookingService.create(data);
// SDK automatically logs audit event:
// {
//   type: 'booking.created',
//   userId: currentUser.id,
//   tenantId: 'kommune-123',
//   timestamp: '2026-01-16T12:00:00Z',
//   ip: '192.168.1.1',
//   userAgent: 'Mozilla/5.0...',
//   data: { bookingId: booking.id }
// }
```

**Why this matters:**
- Legal requirement for Norwegian municipalities
- Compliance with GDPR and data protection laws
- Debugging and incident investigation
- User accountability

---

### Q: What is RBAC and how does it work?

**A:** Role-Based Access Control defines what users can do based on their role:

**How it works:**
1. User has one or more roles (e.g., `admin`, `kommune_user`, `booking_agent`)
2. Backend enforces permissions based on roles
3. Frontend reads capabilities from DTOs

**In components:**
```tsx
import { RentalObjectCardProjectionDTO } from '@digilist/client-sdk/types';

function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectCardProjectionDTO }) {
  // Read permissions from DTO
  const canEdit = rentalObject.permissions?.canEdit ?? false;
  const canDelete = rentalObject.permissions?.canDelete ?? false;

  // Read available actions
  const actions = rentalObject.availableActions ?? [];

  return (
    <Card>
      <h3>{rentalObject.title}</h3>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
      {actions.includes('publish') && <button>Publish</button>}
    </Card>
  );
}
```

**Rules:**
- ✅ Read permissions from DTOs
- ✅ Show/hide UI based on capabilities
- ❌ Never hardcode role checks in frontend
- ❌ Never assume user has permission

See [PLATFORM_ROLES_SPECIFICATION.md](../PLATFORM_ROLES_SPECIFICATION.md).

---

### Q: What does "multi-tenant" mean?

**A:** The platform serves multiple Norwegian municipalities (kommuner) with data isolation:

**How it works:**
- Each kommune has a unique `tenantId`
- All API calls include tenant context
- Data is isolated at database query level
- Users can only access their kommune's data

**In SDK initialization:**
```tsx
initializeClient({
  baseUrl: 'https://api.digilist.no',
  tenantId: 'bergen-kommune', // Specific kommune
});
```

**SDK automatically:**
- Adds `tenantId` to all requests
- Filters data by tenant
- Prevents cross-tenant data leakage

**You must:**
- Always initialize SDK with correct `tenantId`
- Never bypass SDK (maintains tenant isolation)
- Never hardcode tenant-specific logic

---

### Q: What terminology should I use?

**A:** Use these preferred terms:

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| **rental_object** | listing, facility, resource |
| **kommune** | municipality, tenant |
| **booking** | reservation, appointment |
| **allocation** | assignment, distribution |
| **projection DTO** | view model, UI model |

**Example:**
```tsx
// ✅ CORRECT
function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectCardProjectionDTO }) {
  return <div>{rentalObject.title}</div>;
}

// ❌ WRONG
function FacilityCard({ facility }: { facility: FacilityViewModel }) {
  return <div>{facility.displayName}</div>;
}
```

---

### Q: How do I handle feature flags?

**A:** Currently, the platform doesn't have a formal feature flag system. Features are either:

1. **Environment-based** - Controlled by environment variables
2. **Role-based** - Controlled by RBAC permissions

**Environment-based:**
```tsx
const ENABLE_NEW_FEATURE = import.meta.env.VITE_ENABLE_NEW_FEATURE === 'true';

function MyComponent() {
  return (
    <>
      {ENABLE_NEW_FEATURE && <NewFeature />}
      <ExistingFeature />
    </>
  );
}
```

**Role-based:**
```tsx
function MyComponent() {
  const { data: user } = useCurrentUser();

  return (
    <>
      {user.permissions.canAccessBeta && <BetaFeature />}
      <MainFeature />
    </>
  );
}
```

---

## Quick Reference

### Essential Commands

```bash
# Setup
pnpm install              # Install dependencies
pnpm build                # Build all packages

# Development
pnpm dev                  # Start all apps
pnpm --filter web dev     # Start specific app
pnpm test                 # Run tests in watch mode
pnpm test:run             # Run tests once

# Quality
pnpm lint                 # Run ESLint
pnpm format               # Format code
pnpm scan                 # Run design system scanners
pnpm scan:strict          # Strict mode (warnings = errors)

# Themes
pnpm tokens:create        # Generate tokens from config
pnpm tokens:build         # Build theme CSS files

# Deployment
pnpm build                # Production build
pnpm preview              # Preview production build
pnpm deploy:web           # Deploy web app
pnpm deploy:all           # Deploy all apps

# Testing
pnpm test                 # Unit tests (watch mode)
pnpm test:run             # Unit tests (once)
pnpm test:coverage        # With coverage report
pnpm test:e2e             # E2E tests (Playwright)
```

### Key Files

```
CLAUDE.md                           # AI assistant guidelines
docs/DESIGN_TOKENS_GUIDE.md         # Token reference
docs/COMPONENT_CREATION_CHECKLIST.md # Component patterns
docs/DEPLOYMENT_GUIDE.md            # Deployment instructions
docs/reference/02-troubleshooting.md # Issue solutions
packages/ds-themes/generated/digilist.css         # Generated tokens
packages/ds-themes/themes/digilist-extensions.css # Custom tokens
designsystemet.config.json          # Theme configuration
```

### Architecture Rules

| Rule | Description |
|------|-------------|
| **SDK-First** | All API calls through `@digilist/client-sdk` |
| **No Transformers** | Use projection DTOs directly, no reshaping |
| **Design Tokens Only** | No hardcoded colors, spacing, typography |
| **Use @xala/ds** | Never import `@digdir/*` directly |
| **Audit-First** | All mutations must be auditable |
| **RBAC** | Read permissions from DTOs, not hardcoded |

---

## Still Have Questions?

1. **Check the guides:**
   - [Deployment Guide](../DEPLOYMENT_GUIDE.md)
   - [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md)
   - [Component Creation Checklist](../COMPONENT_CREATION_CHECKLIST.md)
   - [Troubleshooting Reference](./02-troubleshooting.md)

2. **Search the codebase:**
   ```bash
   grep -r "your search term" docs/
   grep -r "ComponentName" packages/
   ```

3. **Check existing implementations:**
   - Look at similar components in `packages/ds/src/`
   - Review app code in `apps/*/src/`

4. **Ask the team** - If documentation doesn't answer your question, please ask and help us improve these docs!

---

## Contributing to This FAQ

Found a common question not covered here? Please add it:

1. Follow Q&A format
2. Provide clear, actionable answers
3. Include code examples
4. Link to relevant documentation
5. Test your solutions before documenting

Keep this FAQ current as the platform evolves.
