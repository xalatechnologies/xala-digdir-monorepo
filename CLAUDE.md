# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

---

## System Context

You are operating inside the **Xala / Digilist Platform** - a Norwegian
municipal booking and resource management system.

**System Characteristics:**

- Multi-tenant (kommune-level isolation)
- Audit-first (all mutations logged for compliance)
- SDK-driven (@digilist/client-sdk is THE integration layer)
- RFC 7807 compliant (Problem Details for errors)
- RBAC enforced (role-based access control)
- GDPR compliant (consent management, data subject rights, Article 30 audit trails)
- Multi-channel notifications (in-app, email, SMS, push with WebSocket realtime)
- Production live

---

## Monorepo Structure

This is a **Turborepo** using **pnpm workspaces**.

```
xala-digdir-monorepo/
├── apps/                           # Applications
│   ├── web/                        # Public web app (port 5173)
│   ├── backoffice/                 # Admin portal (port 5175)
│   ├── minside/                    # User portal (port 5174)
│   └── api/                        # Fastify API server (port 4000)
│
├── packages/                       # Shared packages
│   ├── client-sdk/                 # Enterprise SDK ⭐
│   ├── ds/                         # Design System facade ⭐
│   ├── ds-themes/                  # Theme CSS files
│   ├── ds-registry/                # Component documentation
│   ├── i18n/                       # Internationalization ⭐
│   └── eslint-config/              # Shared ESLint rules
│
├── tests/                          # Consolidated test structure ⭐
│   ├── e2e/                        # Playwright E2E tests
│   ├── unit/                       # Vitest unit tests
│   ├── integration/                # Integration tests
│   ├── performance/                # Performance tests
│   ├── security/                   # Security tests
│   ├── fixtures/                   # Test data
│   ├── helpers/                    # Test utilities
│   ├── reports/                    # Test output (gitignored)
│   ├── screenshots/                # E2E screenshots (gitignored)
│   └── artifacts/                  # Test artifacts (gitignored)
│
├── scripts/                        # Build & deployment scripts
├── docs/                           # Documentation
└── (root config files)
```

### Applications (apps/)

- **apps/web** - Public-facing Vite + React app (port 5173)
  - Public listing discovery and booking initiation
  - SEO-optimized, mobile-first design
  - [CLAUDE.md](./apps/web/CLAUDE.md) | [AGENTS.md](./apps/web/AGENTS.md)

- **apps/backoffice** - Admin portal Vite + React app (port 5175)
  - Protected admin application with RBAC
  - Listing/booking management, reports, integrations
  - Real-time updates via WebSocket
  - [CLAUDE.md](./apps/backoffice/CLAUDE.md) | [AGENTS.md](./apps/backoffice/AGENTS.md)

- **apps/minside** - User dashboard Vite + React app (port 5174)
  - User portal for booking management
  - Mobile-optimized, GDPR-compliant
  - Notification center, profile management
  - [CLAUDE.md](./apps/minside/CLAUDE.md) | [AGENTS.md](./apps/minside/AGENTS.md)

- **apps/api** - Fastify API server (port 4000)
  - Backend with 30+ feature modules
  - PostgreSQL + Drizzle ORM
  - Audit logging, multi-tenant isolation
  - WebSocket server for real-time events
  - [CLAUDE.md](./apps/api/CLAUDE.md) | [AGENTS.md](./apps/api/AGENTS.md)

### Packages (packages/)

- **@digilist/client-sdk** - Enterprise-grade SDK with 24+ services, WebSocket
  realtime, React Query hooks
  - [CLAUDE.md](./packages/client-sdk/CLAUDE.md) | [AGENTS.md](./packages/client-sdk/AGENTS.md)

- **@xala/ds** - UI facade (ONLY allowed import for Designsystemet components)
  - Re-exports @digdir/designsystemet-react
  - Custom composed components, blocks, shells
  - Single CSS import point
  - [CLAUDE.md](./packages/ds/CLAUDE.md) | [AGENTS.md](./packages/ds/AGENTS.md)

- **@xala/ds-themes** - Theme URL registry for runtime switching (digdir,
  altinn, uutilsynet, portal)

- **@xala/ds-registry** - Documentation and examples

- **@xala/i18n** - Internationalization utilities
  - Norwegian (nb) and English (en) translations
  - React hooks (useT)
  - [CLAUDE.md](./packages/i18n/CLAUDE.md) | [AGENTS.md](./packages/i18n/AGENTS.md)

- **@xala/eslint-config** - Shared ESLint with design system guardrails
  - Custom rules for design tokens
  - Component pattern enforcement
  - Compliance scanner
  - [CLAUDE.md](./packages/eslint-config/CLAUDE.md) | [AGENTS.md](./packages/eslint-config/AGENTS.md)

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATIONS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │  apps/web   │  │ apps/minside │  │ apps/backoffice│         │
│  │ (port 5173) │  │ (port 5174)  │  │  (port 5175)   │         │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘         │
│         │                │                   │                  │
│         └────────────────┼───────────────────┘                  │
│                          │                                      │
│                          ▼                                      │
│         ┌────────────────────────────────────────┐              │
│         │      @digilist/client-sdk ⭐          │              │
│         │  (30+ services, React Query hooks)    │              │
│         └────────────────┬───────────────────────┘              │
│                          │                                      │
│                          ▼                                      │
│         ┌────────────────────────────────────────┐              │
│         │          apps/api ⭐                   │              │
│         │  (Fastify, PostgreSQL, WebSocket)     │              │
│         │     https://api.digilist.no           │              │
│         └────────────────────────────────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      UI COMPONENTS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │  apps/web   │  │ apps/minside │  │ apps/backoffice│         │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘         │
│         │                │                   │                  │
│         └────────────────┼───────────────────┘                  │
│                          │                                      │
│                          ▼                                      │
│         ┌────────────────────────────────────────┐              │
│         │            @xala/ds ⭐                 │              │
│         │    (Design System Facade)             │              │
│         │   - Primitives (re-exported)          │              │
│         │   - Composed (custom)                 │              │
│         │   - Blocks (business)                 │              │
│         │   - Shells (layouts)                  │              │
│         └────────────────┬───────────────────────┘              │
│                          │                                      │
│                          ▼                                      │
│         ┌────────────────────────────────────────┐              │
│         │  @digdir/designsystemet-react          │              │
│         │  @digdir/designsystemet-css            │              │
│         │  (Norwegian Design System)             │              │
│         └────────────────────────────────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    INTERNATIONALIZATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │  apps/web   │  │ apps/minside │  │ apps/backoffice│         │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘         │
│         │                │                   │                  │
│         └────────────────┼───────────────────┘                  │
│                          │                                      │
│                          ▼                                      │
│         ┌────────────────────────────────────────┐              │
│         │          @xala/i18n ⭐                 │              │
│         │  (Norwegian & English translations)    │              │
│         │         useT() hook                    │              │
│         └────────────────────────────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Import Rules (Critical)

```typescript
// ✅ CORRECT - Apps import from facades
import { Button } from '@xala/ds';              // Design system
import { useListings } from '@digilist/client-sdk/hooks';  // SDK hooks
import { useT } from '@xala/i18n';              // Translations

// ❌ WRONG - Direct imports forbidden
import { Button } from '@digdir/designsystemet-react';  // ❌
import axios from 'axios';                              // ❌
```

**See [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for complete directory trees.**

---

## Development Commands

### Essential Commands

```bash
# Install dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Build all packages and apps
pnpm build

# Run linting (includes guardrail checks)
pnpm lint

# Format code
pnpm format
```

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run

# Generate coverage report
pnpm test:coverage

# Run E2E tests (Playwright)
pnpm test:e2e
```

### Package-Specific Development

```bash
# Work on specific app
cd apps/web && pnpm dev

# Work on SDK
cd packages/client-sdk && pnpm dev

# Run SDK tests
cd packages/client-sdk && pnpm test
```

### Design System Compliance

```bash
# Full scan with default rules
pnpm scan

# Strict mode (all rules as errors)
pnpm scan:strict

# Scan design tokens only
pnpm scan:tokens

# Scan component patterns only
pnpm scan:components

# Scan accessibility issues
pnpm scan:a11y

# Auto-fix where possible
pnpm scan:fix

# Compliance scan (colors, spacing, typography)
pnpm scan:compliance

# JSON output for CI/CD
pnpm scan:compliance:json

# Run all scans
pnpm scan:all
```

### i18n Localization Compliance

```bash
# Scan entire minside app for hardcoded strings
node scripts/scan-i18n.js apps/minside/src

# Scan specific directory
node scripts/scan-i18n.js apps/minside/src/routes

# Scan single file
node scripts/scan-i18n.js apps/minside/src/components/MyComponent.tsx

# View detailed JSON report
cat i18n-scan-report.json
```

**Exit codes:**
- 0: No localization issues found
- 1: Hardcoded strings detected (MUST fix before committing)

### Theme Generation

```bash
# Create theme tokens from config
pnpm tokens:create

# Build theme CSS files
pnpm tokens:build
```

### Deployment

```bash
# Deploy specific app
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside

# Deploy all apps
pnpm deploy:all

# Setup SSL certificates
pnpm deploy:ssl
```

---

## Non-Negotiable Rules

### 1. SDK-FIRST RULE

```
❌ NEVER generate direct API calls (fetch, axios, graphql)
✅ ONLY use @digilist/client-sdk
```

If SDK lacks a method → **report gap, do NOT bypass**.

**Example:**

```tsx
// ❌ WRONG
const response = await fetch("/api/listings");

// ✅ CORRECT
import { useListings } from "@digilist/client-sdk/hooks";

function MyComponent() {
  const { data, isLoading } = useListings();
  // ...
}
```

### 2. NO BUSINESS LOGIC IN UI

- React components = orchestration + rendering only
- All logic lives in: API, SDK services, typed hooks
- Components should be presentational

### 3. RFC 7807 COMPLIANCE

All errors MUST conform to Problem Details:

```typescript
interface ProblemDetails {
  type: string; // URI identifying error type
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail?: string; // Human-readable explanation
}
```

### 4. AUDIT-FIRST PRINCIPLE

- Any state mutation MUST be auditable
- If action is not logged → **block implementation**
- Required audit fields: `who`, `what`, `when`, `tenantId`, `ip/ua`

### 5. RBAC IS SOURCE OF TRUTH

- Feature access derives from role matrix
- No role checks hardcoded in UI
- Use capability-based guards

### 6. DESIGNSYSTEMET GUARDRAILS

```
❌ NEVER import @digdir/* directly in apps
✅ ONLY import from @xala/ds
```

**Critical Rules:**

- Import `@xala/ds/styles` exactly once in main.tsx
- Use `DesignsystemetProvider` for theme controls
- No custom UI components in apps
- No hardcoded colors, spacing, or typography
- No raw HTML elements (use @xala/ds components)
- No inline styles (use design tokens)

**Example:**

```tsx
// ❌ WRONG
import { Button } from "@digdir/designsystemet-react";
import "@digdir/designsystemet-css";

// ✅ CORRECT
import { Button } from "@xala/ds";
```

### 7. ZERO TRANSFORMERS (Contract-First)

```
❌ FORBIDDEN in apps/:
- toXxx(), fromXxx(), mapXxx(), adaptXxx() functions
- *VM, *ViewModel, *UiModel types
- Reshaping API DTOs before rendering
- Computing permissions/actions in frontend
- "select:" in useQuery that transforms data

✅ REQUIRED:
- Use Projection DTOs directly from SDK
- Read permissions from dto.permissions
- Read actions from dto.availableActions
- Components accept SDK types as props
```

**Terminology: Use "listing" (never facility)**

**Example:**

```tsx
// ❌ WRONG - Transformer
function toCardModel(listing) {
  return { ...listing, displayName: listing.name };
}

// ✅ CORRECT - Use Projection DTO directly
function ListingCard({ listing }: { listing: ListingCardProjectionDTO }) {
  return <Card>{listing.title}</Card>;
}
```

### 8. i18n LOCALIZATION-FIRST

```
❌ NEVER use hardcoded strings in UI components
❌ NEVER show untranslated text to users (Norwegian or English)
✅ ALWAYS use t() function from @xala/i18n
✅ ALWAYS define translations in both nb.ts AND en.ts
```

All user-facing text MUST go through the i18n system:

**Required Pattern:**

```tsx
// ❌ WRONG - Hardcoded strings
<Heading>Velg rolle</Heading>
<Button>Submit</Button>
<Text>Loading...</Text>

// ✅ CORRECT - Use t() function
import { useT } from '@xala/i18n';

function MyComponent() {
  const t = useT();
  return (
    <>
      <Heading>{t('auth.roleSelection.title')}</Heading>
      <Button>{t('common.submit')}</Button>
      <Text>{t('common.loading')}</Text>
    </>
  );
}
```

**When adding new text:**

1. Add key to `packages/i18n/src/locales/nb.ts` (Norwegian)
2. Add key to `packages/i18n/src/locales/en.ts` (English)
3. Use `t('namespace.key')` in component
4. Rebuild i18n package: `pnpm -F @xala/i18n build`

**Key naming convention:**

- `common.*` - Shared strings (save, cancel, loading, error)
- `auth.*` - Authentication pages
- `nav.*` - Navigation items
- `dashboard.*` - Dashboard page
- `listings.*` - Listing management
- `bookings.*` - Booking management
- `backoffice.*` - Backoffice-specific UI
- `gdpr.*` - GDPR consent and data subject requests
- `notifications.*` - Notification system UI

**If i18n key is missing → STOP and add it first.**

### i18n Localization Scanner

**Before committing code, ALWAYS run the i18n scanner to verify compliance:**

```bash
# Scan entire app
node scripts/scan-i18n.js apps/minside/src

# Scan specific directory
node scripts/scan-i18n.js apps/minside/src/routes

# Scan single file
node scripts/scan-i18n.js apps/minside/src/routes/settings.tsx
```

**The scanner detects:**
- ✅ Hardcoded text in JSX elements
- ✅ String props (title, label, placeholder, description, etc.)
- ✅ Alert/confirm messages
- ✅ Missing `useT()` imports in files with user-facing text
- ✅ Object values that should be localized

**The scanner intelligently ignores:**
- ✅ Already localized strings using `t()`
- ✅ URLs, file paths, CSS classes, data attributes
- ✅ Code identifiers (camelCase, types, constants)
- ✅ Environment variables, technical strings

**Scanner output:**
- Console report with file-by-file breakdown
- JSON report: `i18n-scan-report.json` (for CI/CD integration)
- Exit code 1 if issues found (fails CI builds)

**If scanner finds issues → FIX them before committing.**

See `docs/I18N_SCAN_REPORT_2026-01-15.md` for detailed analysis.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  FRONTEND (React)                           │
│  - apps/web, apps/backoffice, apps/minside  │
│  - Orchestration only                       │
│  - Uses SDK hooks                           │
│  - No API calls, no business logic          │
├─────────────────────────────────────────────┤
│  SDK (@digilist/client-sdk)                 │
│  - packages/client-sdk                      │
│  - Typed services (24+ services)            │
│  - React Query hooks                        │
│  - Realtime WebSocket client                │
│  - RFC 7807 error handling                  │
├─────────────────────────────────────────────┤
│  UI FACADE (@xala/ds)                       │
│  - packages/ds                              │
│  - Re-exports Designsystemet components     │
│  - Primitives, Composed, Blocks, Shells     │
│  - Theme provider and utilities             │
├─────────────────────────────────────────────┤
│  API (Fastify)                              │
│  - Business logic                           │
│  - Persistence (Drizzle/Postgres)           │
│  - Audit logging                            │
│  - Multi-tenant isolation                   │
└─────────────────────────────────────────────┘
```

**Cross-layer imports are FORBIDDEN.**

---

## SDK Architecture

The `@digilist/client-sdk` package provides:

### Services (30+)

Located in `packages/client-sdk/src/services/`:

- `allocationService` - Resource allocation management
- `auditService` - Audit log queries
- `authService` - Authentication
- `bookingService` - Booking CRUD
- `conversationService` - Messaging
- `dashboardService` - Dashboard data
- `discountCodeService` - Discount codes
- `gdprService` - GDPR consent and data subject requests
- `integrationService` - Third-party integrations
- `listingService` - Listing management
- `monitoringService` - System monitoring
- `notificationService` - Push notifications and preferences
- `notificationSystemService` - Multi-channel notifications with templates
- `organizationService` - Organization/Kommune management
- `reportsService` - Analytics and reporting
- And more...

### React Query Hooks

Located in `packages/client-sdk/src/hooks/`:

```tsx
import {
  useAuth,
  useBookings,
  useListings,
  useOrganizations,
  // ... 20+ hooks
} from "@digilist/client-sdk/hooks";
```

### Realtime WebSocket Client

Located in `packages/client-sdk/src/realtime/`:

```tsx
import { realtimeClient } from "@digilist/client-sdk";

realtimeClient.connect({
  url: "wss://api.digilist.no/ws/audit",
  tenantId: "your-tenant",
  autoReconnect: true,
});

realtimeClient.onAudit((event) => {
  console.log("Audit event:", event);
});
```

### Initialization

```tsx
import { initializeClient } from "@digilist/client-sdk";

initializeClient({
  baseUrl: "https://api.digilist.no",
  tenantId: "your-tenant-id",
});
```

---

## Design System Component Hierarchy

### Primitives (Low-level)

Re-exported from `@digdir/designsystemet-react`:

- Layout: `Container`, `Grid`, `Stack`
- Forms: `Button`, `Input`, `Select`, `Checkbox`, `Radio`
- Display: `Card`, `Badge`, `Avatar`, `Tag`
- Typography: `Heading`, `Paragraph`, `Label`

### Composed (Mid-level)

Custom components built from primitives:

- `ContentLayout`, `ContentSection`
- `PageHeader`, `AppHeader`
- `Navigation`, `NavigationLink`
- `FilterBar`, `Drawer`
- `HeaderLogo`, `HeaderSearch`, `HeaderActions`

### Blocks (Business logic)

Domain-specific components:

- `StatsGrid`, `KPICard`
- `ListingCard`, `BookingCard`

### Shells (Application level)

- `AppShell` - Complete application layout with header, nav, content area

**Example:**

```tsx
import { AppShell, ContentLayout, ContentSection, Grid } from "@xala/ds";

function MyApp() {
  return (
    <AppShell title="My App">
      <ContentLayout>
        <ContentSection title="Dashboard">
          <Grid columns="repeat(3, 1fr)" gap={24}>
            <Card>Content</Card>
          </Grid>
        </ContentSection>
      </ContentLayout>
    </AppShell>
  );
}
```

---

## Theme System

### Available Themes

- `digdir` - Default Digdir theme
- `altinn` - Altinn theme
- `uutilsynet` - Utsynet theme
- `portal` - Portal theme

### Theme Provider

```tsx
import { DesignsystemetProvider } from "@xala/ds";

function App() {
  return (
    <DesignsystemetProvider
      theme="digdir"
      colorScheme="auto"
      size="md"
      typography="primary"
    >
      {/* Your app */}
    </DesignsystemetProvider>
  );
}
```

### Data Attributes

Set on `<html>` element:

- `data-color-scheme`: `"auto" | "light" | "dark"`
- `data-size`: `"sm" | "md" | "lg"`
- `data-typography`: `"primary" | "secondary"`

---

## Testing Strategy

### Test Organization (REQUIRED STRUCTURE)

All tests MUST be organized under the `tests/` directory:

```
tests/
├── unit/              # Vitest unit tests
│   ├── sdk/          # SDK service tests
│   ├── components/   # React component tests
│   ├── hooks/        # React hooks tests
│   └── utils/        # Utility function tests
├── e2e/              # Playwright E2E tests
│   ├── auth/        # Authentication flows
│   ├── booking/     # Booking journeys
│   ├── scenarios/   # Real-world scenarios
│   └── stories/     # User stories
├── integration/      # Integration tests
│   ├── api/         # API integration
│   └── services/    # Service integration
├── performance/      # Performance tests
├── security/        # Security/penetration tests
├── fixtures/        # Test data & fixtures
├── helpers/         # Shared test utilities
├── reports/         # All test output (gitignored)
│   ├── unit/       # Vitest HTML reports
│   ├── e2e/        # Playwright HTML reports
│   ├── coverage/   # Coverage reports
│   ├── compliance/ # Design system scans
│   └── i18n/       # Localization scans
├── screenshots/     # E2E failure screenshots (gitignored)
└── artifacts/       # Other test artifacts (gitignored)
```

**⚠️ CRITICAL RULES:**
- All test files MUST go in the appropriate `tests/` subdirectory
- All test output (reports, screenshots, artifacts) MUST go in `tests/reports/`, `tests/screenshots/`, or `tests/artifacts/`
- NEVER create test folders at the root level (e.g., `test-results/`, `playwright-report/`, `reports/`)
- Legacy scattered folders are deprecated and will be removed

### Unit Tests (Vitest)

Located in `tests/unit/` AND co-located with source code:

- **Co-located tests** (preferred for packages): `packages/*/src/**/*.{test,spec}.{ts,tsx}`
- **Organized tests** (preferred for integration): `tests/unit/{sdk,components,hooks,utils}/`

Configuration: `vitest.config.ts`

**Commands:**
```bash
pnpm test              # Run all unit tests (watch mode)
pnpm test:run          # Run once
pnpm test:coverage     # With coverage report → tests/reports/coverage/
```

### E2E Tests (Playwright)

Located in `tests/e2e/`:
- `tests/e2e/auth/` - Authentication and RBAC flows
- `tests/e2e/booking/` - Booking flows
- `tests/e2e/scenarios/` - Real-world user scenarios
- `tests/e2e/stories/` - User story tests

Configuration: `playwright.config.ts`

**Commands:**
```bash
pnpm test:e2e                    # Run all E2E tests
pnpm test:e2e:auth               # Auth tests only
pnpm test:e2e tests/e2e/auth/    # Specific folder
```

**Output:**
- Reports: `tests/reports/e2e/`
- Screenshots: `tests/screenshots/`
- Videos: `tests/artifacts/videos/`

### Integration Tests

Located in `tests/integration/`:
- `tests/integration/api/` - API endpoint integration
- `tests/integration/services/` - Service-to-service integration

### Performance Tests

Located in `tests/performance/`:
- Load testing
- Response time benchmarks
- Memory leak detection

### Security Tests

Located in `tests/security/`:
- OWASP Top 10 coverage
- Penetration testing
- Vulnerability scans

### Test Helpers & Fixtures

**Helpers**: `tests/helpers/`
- Shared test utilities
- Custom matchers
- Test setup functions

**Fixtures**: `tests/fixtures/`
- Mock data
- Seed data
- Test configurations

---

## ESLint Guardrails

Custom rules in `packages/eslint-config/rules/`:

### Design Token Rules

- `digdir/no-hardcoded-colors` - Enforce design token usage
- `digdir/no-hardcoded-spacing` - No px/rem values
- `digdir/no-hardcoded-typography` - No font-size/weight
- `digdir/no-hardcoded-border-radius` - Use token values

### Component Pattern Rules

- `digdir/as-child-single-child` - Enforce single child with asChild
- `digdir/require-button-type` - Buttons must have explicit type
- `digdir/require-interactive-labels` - Labels need htmlFor
- `digdir/prefer-ds-components` - Use @xala/ds over raw HTML
- `digdir/require-provider` - Enforce DesignsystemetProvider

### Import Restrictions

- Block direct `@digdir/*` imports in apps
- Only `packages/ds/src/styles.ts` can import theme CSS

---

## UI Rules

| Rule       | Correct       | Incorrect             |
| :--------- | :------------ | :-------------------- |
| Components | `@xala/ds`    | Raw HTML, `@digdir/*` |
| Styling    | Design tokens | Inline styles         |
| Data       | SDK hooks     | `fetch()`, axios      |
| Constants  | i18n keys     | Magic strings         |

---

## Failure Modes

**STOP and ask for clarification if:**

- SDK method does not exist
- Role matrix is ambiguous
- Audit event type is undefined
- Tenant context is missing
- Error contract is unclear
- Design token is not available
- Component pattern violates guardrails

---

## Vite Configuration

Apps use Vite with SDK path aliases:

```typescript
// apps/web/vite.config.ts
resolve: {
  alias: {
    '@digilist/client-sdk': path.resolve(__dirname, '../../packages/client-sdk/src'),
    '@digilist/client-sdk/hooks': path.resolve(__dirname, '../../packages/client-sdk/src/hooks'),
    '@digilist/client-sdk/types': path.resolve(__dirname, '../../packages/client-sdk/src/types'),
  },
}
```

---

## Development URLs

- Web app: http://localhost:5173
- Backoffice: http://localhost:5174
- API health: http://localhost:3002/health

---

## Key Patterns

### Feature-Based Organization

Apps use feature folders:

```
apps/web/src/
├── features/
│   ├── listing-details/
│   │   ├── adapters/
│   │   ├── presenters/
│   │   └── types.ts
│   └── bookings/
├── providers/
├── routes/
└── components/
```

### Realtime Provider Pattern

Wrap app in RealtimeProvider for WebSocket events:

```tsx
import { RealtimeProvider } from "./providers/RealtimeProvider";

function App() {
  return (
    <RealtimeProvider>
      <YourApp />
    </RealtimeProvider>
  );
}
```

### Internationalization

Use `@xala/i18n` for translations:

```tsx
import { useTranslation } from "@xala/i18n";

function MyComponent() {
  const { t } = useTranslation();
  return <Heading>{t("dashboard.title")}</Heading>;
}
```

---

## Production Constraints

### Assume Production Context

- System is live, multi-tenant, and regulated
- Any change impacts multiple municipalities
- Audit trails are legally required
- Performance matters (map rendering, realtime updates)

**Forbidden phrases:**

- "In a real system you would…"
- "For simplicity…"
- "This is just a prototype…"

### Multi-Tenancy

- All API calls include `tenantId`
- Data isolation at query level
- No cross-tenant data leakage
- Kommune-specific configuration

---

## Common Pitfalls

1. **Bypassing the SDK** - Always use `@digilist/client-sdk`, never direct
   fetch()
2. **Direct Designsystemet imports** - Always use `@xala/ds` facade
3. **Hardcoded values** - Use design tokens, no magic numbers/colors
4. **Missing audit logging** - All mutations must be auditable
5. **Business logic in components** - Keep components presentational
6. **Ignoring realtime events** - Consider WebSocket updates for live data
7. **Missing RBAC checks** - Use capability-based guards
8. **Non-compliant errors** - Follow RFC 7807 Problem Details format

---

## When in Doubt

1. Check if SDK method exists → use it
2. Check if @xala/ds component exists → use it
3. Check if design token exists → use it
4. Verify audit logging → ensure mutation is logged
5. Confirm RBAC guard → ensure proper authorization

**If any rule cannot be satisfied, STOP and report the gap.**
