# DigiList Architecture

> **LLM Training Document**
> **Purpose:** System overview for AI agents working on DigiList
> **Last Updated:** 2026-01-20

---

## System Overview

DigiList is a Norwegian municipal booking and resource management SaaS platform. It enables citizens to book public facilities (sports halls, meeting rooms, equipment) while providing administrators tools for management.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  web / minside / backoffice / monitoring / saas-admin        │
│  docs-learning                                               │
│  (React 18, @xala/ds, @xala/runtime)                        │
├─────────────────────────────────────────────────────────────┤
│                    RUNTIME LAYER                             │
│  @xala/runtime (RuntimeProvider)                             │
│  (Provider Composition, Config, DI)                          │
├─────────────────────────────────────────────────────────────┤
│                    SDK LAYER                                 │
│  @digilist/client-sdk                                        │
│  (Services, React Query Hooks, Realtime)                     │
├─────────────────────────────────────────────────────────────┤
│                    CONTRACT LAYER                            │
│  @xala/contracts                                             │
│  (Zod Schemas, DTOs, Projections)                           │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER                                 │
│  apps/api (Fastify)                                          │
│  (Controllers, Services, Middleware)                         │
├─────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                         │
│  PostgreSQL + Drizzle ORM                                    │
│  (platform / domain / compliance / monitoring / saas)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Boundaries

### Apps (Presentation Only)

| App | Purpose | Port |
|-----|---------|------|
| `apps/web` | Public booking portal | 5173 |
| `apps/minside` | Citizen self-service | 5174 |
| `apps/backoffice` | Tenant admin panel | 5175 |
| `apps/monitoring` | Observability dashboard | 5176 |
| `apps/saas-admin` | Platform administration | 5177 |
| `apps/docs-learning` | Documentation site | 5178 |
| `apps/api` | Fastify API server | 3000 |

**App Rules:**
- Routes and wrappers ONLY
- No business logic
- No styling (except root.css)
- No providers (use RuntimeProvider)
- SDK hooks for all data

### Core Packages

| Package | Purpose | May Import |
|---------|---------|------------|
| `@xala/runtime` | Provider composition | ds, i18n, auth |
| `@xala/ds` | Design System facade | @digdir/* |
| `@xala/i18n` | Localization | (standalone) |
| `@xala/auth` | Authentication | (standalone) |
| `@xala/contracts` | Types/schemas | zod |
| `@digilist/client-sdk` | API client + hooks | contracts |

### Dependency Rules

```
apps/* → @xala/runtime → @xala/ds
                       → @xala/i18n
                       → @xala/auth
                       
apps/* → @digilist/client-sdk → @xala/contracts

FORBIDDEN:
apps/* → @digdir/*
apps/* → @tanstack/react-query (use SDK)
apps/* → fetch/axios (use SDK)
packages/ds → apps/*
packages/* → apps/*
```

---

## Runtime DI Model

### RuntimeProvider

All apps use `@xala/runtime` RuntimeProvider for dependency injection:

```tsx
// main.tsx - THE ONLY PATTERN
import { RuntimeProvider } from '@xala/runtime';

<RuntimeProvider config={{
  appType: 'backoffice',
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

RuntimeProvider internally composes:

```
1. QueryClientProvider     (SDK data layer)
2. ThemeProvider           (color scheme state)
3. I18nProvider            (locale - GUARANTEED FIRST)
4. DesignsystemetProvider  (Digdir tokens)
5. DialogProvider          (modal dialogs)
6. ErrorBoundary           (RFC7807 errors)
7. AuthProvider            (session + OAuth)
8. FeatureFlagsProvider    (feature toggles)
9. TenantProvider          (multi-tenant context)
10. NotificationCenterProvider (notifications)
```

### Hooks from Runtime

```tsx
import { useNotificationCenter } from '@xala/runtime';
import { useFeatureFlags } from '@xala/runtime';
import { useRBAC } from '@xala/runtime';
import { useLocalization, useT } from '@xala/i18n';
```

---

## Thin App Definition

A "thin app" contains ONLY:

```
apps/{app}/src/
├── main.tsx       # RuntimeProvider mount only
├── App.tsx        # BrowserRouter + Routes only
├── root.css       # Minimal global styles
├── routes/        # Page components (route wrappers)
└── providers/     # App-specific only (e.g., AccountContext)
```

### What Apps MUST NOT Contain

- ❌ Provider composition (use RuntimeProvider)
- ❌ Business logic (move to SDK/API)
- ❌ Data transformation (use projections)
- ❌ Custom CSS files (use DS tokens)
- ❌ Direct @digdir imports (use @xala/ds)
- ❌ fetch/axios calls (use SDK hooks)
- ❌ QueryClient setup (in RuntimeProvider)

---

## Multi-Tenant Architecture

### Tenant Isolation

```
Request → Auth Middleware → Tenant Resolution → Scoped Data Access
              │                    │
              └── JWT Cookie       └── X-Tenant-ID header
```

### Database Schemas

```sql
platform.*     -- users, tenants, sessions, organizations
domain.*       -- bookings, rental_objects, allocations
compliance.*   -- audit_logs, gdpr_requests
monitoring.*   -- health, metrics, logs
saas.*         -- billing, subscriptions, usage
```

---

## Key Directories

```
/
├── ai/                    # AI governance system (THIS)
├── apps/                  # Frontend applications
├── packages/              # Shared packages
│   ├── runtime/           # RuntimeProvider
│   ├── ds/                # Design System
│   ├── i18n/              # Localization
│   ├── auth/              # Authentication
│   ├── client-sdk/        # API SDK
│   └── contracts/         # Types/schemas
├── infra/                 # Infrastructure
├── docs/                  # Documentation
│   ├── ARCH/              # Architecture docs
│   ├── QUALITY/           # Audit reports
│   └── LLM/               # LLM training
└── .agent/                # Agent skills/workflows
```

---

## Data Flow

### Read Flow

```
Component → SDK Hook (useBookings) → SDK Service → HTTP Request
                                                        ↓
                                                   API Controller
                                                        ↓
                                                   Service Layer
                                                        ↓
                                                   Drizzle ORM
                                                        ↓
                                                   PostgreSQL
```

### Write Flow

```
Form Submit → SDK Mutation (useCreateBooking) → SDK Service → HTTP POST
                                                                   ↓
                                                              Validation (Zod)
                                                                   ↓
                                                              Service + Audit
                                                                   ↓
                                                              PostgreSQL TX
                                                                   ↓
                                                              WebSocket Broadcast
                                                                   ↓
                                                              React Query Invalidation
```

---

## Environment Variables

### Standard Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no
VITE_TENANT_ID=default
VITE_LICENSE_KEY=xxx
```

### Access Pattern

```tsx
// ✅ In main.tsx only (passed to RuntimeProvider)
const config = {
  apiUrl: import.meta.env.VITE_API_URL,
};

// ❌ Never in components
const apiUrl = import.meta.env.VITE_API_URL; // FORBIDDEN
```

---

## File References

For detailed specifications, see:

- `/ai/PRINCIPLES.md` - Design philosophy
- `/ai/DS_RULES.md` - Design System rules
- `/ai/SDK_RULES.md` - SDK usage rules
- `/ai/ANTI_PATTERNS.md` - What NOT to do
- `/docs/ARCH/target-runtime-config-design.md` - Runtime spec
