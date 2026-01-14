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
- Production live

---

## Monorepo Structure

This is a **Turborepo** using **pnpm workspaces**.

### Applications (apps/)

- **apps/web** - Public-facing Vite + React app (port 5173)
- **apps/backoffice** - Admin portal Vite + React app (port 5174)
- **apps/minside** - User dashboard Vite + React app

### Packages (packages/)

- **@digilist/client-sdk** - Enterprise-grade SDK with 24+ services, WebSocket
  realtime, React Query hooks
- **@xala/ds** - UI facade (ONLY allowed import for Designsystemet components)
- **@xala/ds-themes** - Theme URL registry for runtime switching (digdir,
  altinn, uutilsynet, portal)
- **@xala/ds-registry** - Documentation and examples
- **@xala/i18n** - Internationalization utilities
- **@xala/eslint-config** - Shared ESLint with design system guardrails

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

### Services (24+)

Located in `packages/client-sdk/src/services/`:

- `allocationService` - Resource allocation management
- `auditService` - Audit log queries
- `authService` - Authentication
- `bookingService` - Booking CRUD
- `conversationService` - Messaging
- `dashboardService` - Dashboard data
- `discountCodeService` - Discount codes
- `integrationService` - Third-party integrations
- `listingService` - Listing management
- `monitoringService` - System monitoring
- `notificationService` - Push notifications
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

### Unit Tests (Vitest)

Located in `**/*.{test,spec}.{ts,tsx}`:

- Design system components: `packages/ds/src/**/*.test.tsx`
- App components: `apps/*/src/**/*.test.tsx`
- SDK services: `packages/client-sdk/src/**/*.test.ts`

Configuration: `vitest.config.ts`

### E2E Tests (Playwright)

Located in `tests/e2e/`:

Run with: `pnpm test:e2e`

Configuration: `playwright.config.ts`

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
