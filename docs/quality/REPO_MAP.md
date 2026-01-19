# Repository Map

**Generated:** 2026-01-19  
**Auditor:** Platform Auditor + Contract-First Governor  
**Purpose:** Complete inventory of DigiList codebase architecture

---

## Repository Structure Overview

```
xala-digdir-monorepo/
├── apps/              # Frontend apps + API server
├── packages/          # Shared packages
├── infra/             # Infrastructure as code
├── docs/              # Documentation
├── tests/             # E2E test suites
└── scripts/           # Utility scripts
```

---

## 1. Applications (`apps/`)

### 1.1 API Server (`apps/api/`)
**Type:** Backend (Node.js + Fastify)  
**Purpose:** Unified API layer (DK - DigiKontakt)  
**Port:** 3000 (dev), 8080 (prod)

#### Structure
```
apps/api/src/
├── modules/           # 72 API controllers (domain modules)
├── schemas/           # Zod validation schemas
├── services/          # Cross-module services
├── middleware/        # Auth, RLS, webhooks
├── core/              # Platform core (error handling, logging)
├── database/          # Drizzle ORM connection
├── domain/            # Policy engine + adapters
├── integrations/      # External services (Vipps, etc.)
└── workers/           # Background jobs
```

#### Key Modules (72 controllers)
| Module | Controller | Service | Status |
|--------|------------|---------|--------|
| **Auth** | auth.controller.ts, idporten.controller.ts, idporten-oidc.controller.ts | session.service.ts | ✅ |
| **Bookings** | booking.controller.ts, booking-contracts.controller.ts | booking.service.ts | ✅ |
| **Rental Objects** | rental-object.controller.ts | rental-object.service.ts | ✅ |
| **Organizations** | organizations.controller.ts, brreg.controller.ts | organizations.service.ts | ✅ |
| **Users** | user.controller.ts, tenant-admin-user.controller.ts | user.service.ts | ✅ |
| **Calendar** | calendar.controller.ts, calendar-contracts.controller.ts | calendar.service.ts | ✅ |
| **Menu** | menu.controller.ts | menu-resolution.service.ts | ✅ |
| **Capabilities** | capabilities.controller.ts | capabilities.service.ts | ✅ |
| **Notifications** | notifications.controller.ts, notification-preferences.controller.ts | notification.service.ts, delivery.service.ts | ✅ |
| **Messages** | messages.controller.ts, templates.controller.ts | messages.service.ts | ✅ |
| **GDPR** | gdpr.controller.ts | gdpr.service.ts | ✅ |
| **Audit** | audit.controller.ts | - | ✅ |
| **Custody** | custody.controller.ts | custody.service.ts, custody.evaluator.ts | ✅ |
| **Seasons** | seasons.controller.ts, season-applications.controller.ts | seasons.service.ts | ✅ |
| **Allocations** | allocations.controller.ts | - | ✅ |
| **Pricing** | pricing.controller.ts | pricing.service.ts | ✅ |
| **Reports** | reports.controller.ts | reports.service.ts | ✅ |
| **Search** | search.controller.ts, global-search.controller.ts | search.service.ts | ✅ |
| **Dashboard** | dashboard.controller.ts, org-dashboard.controller.ts | dashboard.service.ts | ✅ |
| **Favorites** | favorites.controller.ts | favorites.service.ts | ✅ |
| **Reviews** | reviews.controller.ts | - | ✅ |
| **Storage** | storage.controller.ts | storage.service.ts | ✅ |
| **Integrations** | integrations.controller.ts, integration-credentials.controller.ts | - | ✅ |
| **Billing** | billing.controller.ts | - | ✅ |
| **SaaS** | saas.controller.ts | saas.service.ts | ✅ |
| **Tenant Admin** | tenant-admin.controller.ts, tenant.controller.ts | tenant.service.ts | ✅ |
| **Feature Flags** | - | feature-flags.service.ts | ✅ |
| **Monitoring** | monitoring.controller.ts | monitoring.service.ts | ✅ |
| **Webhooks** | vipps-webhook.controller.ts | - | ✅ |
| **WebSocket** | websocket.controller.ts | websocket.service.ts | ✅ |

#### Domain Layer
```
apps/api/src/domain/
├── policy-engine.ts        # Centralized policy engine
├── registry.ts             # Module registry
├── types.ts                # Domain types
└── adapters/               # Domain adapters
    ├── booking.adapter.ts
    ├── pricing.adapter.ts
    └── base.adapter.ts
```

---

### 1.2 Web App (`apps/web/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Public booking portal  
**Deployment:** https://digilist.no

#### Structure
```
apps/web/src/
├── pages/                  # Page wrappers
├── features/               # Feature-specific components
│   ├── rental-object-details/
│   └── reviews/
├── components/             # Local components (should be minimal)
├── hooks/                  # UI-only hooks
├── providers/              # Context providers
└── lib/                    # Utilities (Sentry)
```

**Component Count:** 100 files  
**Routes:** 6 pages

---

### 1.3 Backoffice App (`apps/backoffice/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Municipal/org admin dashboard  
**Deployment:** https://admin.digilist.no

#### Structure
```
apps/backoffice/src/
├── routes/                 # Page wrappers (50+ pages)
├── features/               # Feature modules
│   ├── rental-objects/     # Rental object management
│   ├── calendar/           # Calendar management
│   ├── settings/           # Settings tabs
│   └── reviews/            # Review moderation
├── components/             # Local components (should be minimal)
│   ├── layout/             # AppLayout, Header, Sidebar (⚠️ should be DS)
│   ├── gdpr/               # GDPR components
│   ├── seasons/            # Season components
│   └── organizations/      # Org components
└── hooks/                  # RBAC, capabilities, demo login
```

**Component Count:** 223 files  
**Routes:** 70+ pages

---

### 1.4 MinSide App (`apps/minside/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Citizen/org member portal  
**Deployment:** https://minside.digilist.no

#### Structure
```
apps/minside/src/
├── routes/                 # Page wrappers (26 pages)
├── features/               # Feature modules
│   ├── seasons/            # Season applications
│   └── settings/           # User settings
├── components/             # Local components
│   ├── layout/             # AppLayout, Header, Sidebar (⚠️ should be DS)
│   ├── gdpr/               # GDPR components (⚠️ duplicate)
│   └── notifications/      # Notification preferences
└── providers/              # Account context
```

**Component Count:** 93 files  
**Routes:** 26 pages

---

### 1.5 SaaS Admin App (`apps/saas-admin/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Platform super admin  
**Deployment:** https://super.digilist.no

#### Structure
```
apps/saas-admin/src/
├── routes/                 # Page wrappers (12 pages)
├── components/             # Local components
│   └── layout/             # AppLayout, Header, Sidebar (⚠️ should be DS)
├── services/               # App-specific services (⚠️ should be SDK)
└── hooks/                  # Navigation, demo login
```

**Component Count:** 61 files  
**Routes:** 12 pages  
**CSS Files:** 9 `.module.css` (⚠️ violation)

---

### 1.6 Monitoring App (`apps/monitoring/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Operational monitoring dashboard  
**Deployment:** https://ops.digilist.no

#### Structure
```
apps/monitoring/src/
├── routes/                 # Page wrappers
├── features/               # Monitoring features
│   ├── testing/            # Test results
│   ├── settings/           # Settings (⚠️ duplicate from minside)
│   └── seasons/            # Seasons (⚠️ duplicate from minside)
└── components/             # Layout (⚠️ duplicate from minside)
```

**Component Count:** 102 files  
**Routes:** ~25 pages

---

### 1.7 Docs Learning App (`apps/docs-learning/`)
**Type:** Frontend (React + Vite)  
**Purpose:** Documentation and learning portal  
**Deployment:** https://docs.digilist.no

#### Structure
```
apps/docs-learning/src/
├── routes/                 # Doc pages (8 pages)
├── components/             # Doc-specific components
│   ├── layout/             # DocsLayout, DocsHeader, DocsSidebar
│   └── toc/                # Table of contents
└── providers/              # Toast provider
```

**Component Count:** ~30 files  
**CSS Files:** 10 `.module.css` (acceptable for docs app)

---

## 2. Packages (`packages/`)

### 2.1 Database Schema (`packages/database-schema/`)
**Type:** Database layer (Drizzle ORM)  
**Purpose:** Single source of truth for DB schema

#### Structure
```
packages/database-schema/src/
├── compliance/             # Audit logs, GDPR requests
├── core/                   # Tenants, organizations, users
├── domain/                 # Bookings, rental objects, allocations
├── platform/               # Sessions, memberships, translations
├── saas/                   # Entitlements, menu system
└── schemas.ts              # Schema namespace exports
```

#### Schema Namespaces (5)
| Schema | Tables | Purpose |
|--------|--------|---------|
| `platform` | 8 | Auth, sessions, translations, memberships |
| `domain` | 3 | Rental objects, bookings, allocations |
| `compliance` | 1 | Audit logs (append-only) |
| `saas` | 7 | Plans, entitlements, menu policies, route policies |
| `core` | 3 | Tenants, organizations, users |

**Total Tables:** ~22 tables

---

### 2.2 Contracts (`packages/contracts/`)
**Type:** Shared API contracts (Zod schemas + TS types)  
**Purpose:** Contract-first API design

#### Structure
```
packages/contracts/src/
├── schemas/                # Zod validation schemas
│   ├── booking.schema.ts
│   ├── rental-object.schema.ts
│   ├── organization.schema.ts
│   ├── user.schema.ts
│   ├── capabilities.schema.ts
│   ├── custody.schema.ts
│   └── common.schema.ts
├── projections/            # UI projection DTOs
│   ├── booking.projection.ts
│   ├── rental-object.projection.ts
│   ├── organization.projection.ts
│   ├── user.projection.ts
│   └── menu.ts
├── monitoring/             # Monitoring DTOs
└── modules/                # Module registry
```

#### Exported Types (40+)
- **Common:** Pagination, ProblemDetails (RFC7807), Money, Timestamps
- **Rental Objects:** RentalObject, CreateRentalObjectDTO, RentalObjectCategory, BookingTimeMode
- **Bookings:** Booking, BookingStatus, CreateBookingDTO, BookingQuoteRequest
- **Organizations:** Organization, OrganizationType, OrganizationStatus
- **Users:** User, UserRole, UserStatus, ConsentPreferences
- **Capabilities:** Capability, UIHints, FeatureFlags
- **Custody:** CustodyGrant, CustodyScope, GranteeType

---

### 2.3 Client SDK (`packages/client-sdk/`)
**Type:** API client (React Query)  
**Purpose:** Type-safe API client for all frontends

#### Structure
```
packages/client-sdk/src/
├── services/               # 58 API service clients
├── hooks/                  # 89 React Query hooks
├── query-keys/             # Query key factories
├── types/                  # DTO type exports
└── config/                 # SDK configuration
```

#### Service Coverage (58 services)
| Domain | Services | Coverage |
|--------|----------|----------|
| Auth | auth.service.ts, idporten.service.ts | ✅ |
| Bookings | booking.service.ts | ✅ |
| Rental Objects | rental-object.service.ts | ✅ |
| Organizations | organization.service.ts, brreg.service.ts | ✅ |
| Users | user.service.ts, tenant-admin-user.service.ts | ✅ |
| Calendar | calendar.service.ts | ✅ |
| Notifications | notification.service.ts, notification-system.service.ts | ✅ |
| Messages | conversation.service.ts, templates.service.ts | ✅ |
| GDPR | gdpr.service.ts | ✅ |
| Seasons | season.service.ts, season-application.service.ts | ✅ |
| Pricing | pricing.service.ts | ✅ |
| Reports | reports.service.ts | ✅ |
| Search | search.service.ts | ✅ |
| Dashboard | dashboard.service.ts, org-dashboard.service.ts | ✅ |
| Integrations | integrations.service.ts, integration-credentials.service.ts | ✅ |
| SaaS | saas.service.ts, modules.service.ts | ✅ |
| Monitoring | monitoring.service.ts, monitoring-extended.service.ts | ✅ |

#### Hook Coverage (89 hooks)
All services have corresponding React Query hooks (use*, useMutation*, useInfinite*).

---

### 2.4 Design System (`packages/ds/`)
**Type:** UI component library  
**Purpose:** Single source of truth for UI patterns

#### Structure
```
packages/ds/src/
├── tokens/                 # Design tokens
├── primitives/             # 16 primitive components
├── composed/               # 80+ composed components
├── blocks/                 # 45+ business blocks
├── shells/                 # 4 application shells
├── types/                  # Type definitions
├── hooks/                  # UI-only hooks
└── utils/                  # Utilities
```

#### Component Inventory
| Category | Count | Examples |
|----------|-------|----------|
| Primitives | 16 | Container, Grid, Stack, Badge, Card |
| Composed | 80+ | PageHeader, DataTable, Drawer, Modal, ListToolbar |
| Blocks | 45+ | RentalObjectCard, StatusBadges, BookingFormModal |
| Shells | 4 | AppShell, DashboardSidebar, DashboardContent |

**Icon Registry:** 60+ SVG icons (Lucide-based)

---

### 2.5 i18n (`packages/i18n/`)
**Type:** Internationalization  
**Purpose:** Localization for nb-NO (primary) and en-US

#### Structure
```
packages/i18n/src/
├── locales/                # JSON translation files
│   ├── nb/                 # Norwegian (30 files)
│   └── en/                 # English (30 files)
├── hooks.ts                # useT, useLocale hooks
├── context.tsx             # I18nProvider
└── formatters.ts           # Date, currency, number formatters
```

**Translation Keys:** 2000+ keys across 30 namespaces

---

### 2.6 Testing Packages
#### a) `packages/testing/`
**Purpose:** Unit/integration test utilities

#### b) `packages/testing-e2e/`
**Purpose:** Playwright E2E test suites

**Test Files:** 154 files, 137 `.ts`

---

### 2.7 Other Packages
| Package | Purpose | Status |
|---------|---------|--------|
| `auth` | Authentication utilities | ✅ |
| `sdk-core` | Base SDK functionality | ✅ |
| `observability` | Monitoring, logging | ✅ |
| `ds-registry` | DS component registry | ✅ |
| `ds-themes` | Theme tokens | ✅ |
| `docs-content` | MDX content for docs | ✅ |
| `eslint-config` | Shared ESLint rules | ✅ |

---

## 3. Infrastructure (`infra/`)

```
infra/
├── docker/                 # Docker compose configs
├── pm2/                    # Process manager configs
├── secrets/                # Encrypted secrets (age)
├── env/                    # Environment templates
├── scripts/                # Deployment scripts
└── docs/                   # Infrastructure guides
```

---

## 4. Critical Architecture Patterns

### 4.1 Data Flow (Request Chain)
```
Client Browser
    ↓
DS Component (displays)
    ↓
App Wrapper (maps DTO → props)
    ↓
SDK Hook (React Query)
    ↓
API Service (HTTP client)
    ↓
DK API Controller (validates, authorizes)
    ↓
Domain Service (business logic)
    ↓
Database Repository (Drizzle ORM)
    ↓
PostgreSQL (with RLS)
```

### 4.2 Contract Flow (Type Safety)
```
Database Schema (Drizzle)
    ↓
DAO/Repository (query builders)
    ↓
Domain Entities (internal types)
    ↓
Zod Schemas (@xala/contracts)
    ↓
DTO Types (exported from contracts)
    ↓
API Responses (validated)
    ↓
SDK Services (typed clients)
    ↓
React Query Hooks (typed queries)
    ↓
App Wrappers (DTO → Block props)
    ↓
DS Blocks (display components)
```

### 4.3 Module Dependencies (Expected)
```
Identity/Access
    ↓
SaaS Control Plane
    ↓
Organizations
    ↓
Rental Objects
    ↓
Booking Engine
    ↓
Calendar & Availability
    ↓
Messaging/Notifications
```

---

## 5. Identified Gaps (Preliminary)

### 5.1 App Violations
| Issue | Count | Impact |
|-------|-------|--------|
| CSS files in apps | 19 | HIGH |
| Duplicate layout components | 4 apps | HIGH |
| Duplicate GDPR components | 2 apps | MEDIUM |
| Duplicate season components | 2 apps | MEDIUM |
| Business logic in app hooks | 30+ | MEDIUM |

### 5.2 Contract Drift
| Issue | Evidence | Impact |
|-------|----------|--------|
| API controller count (72) vs SDK services (58) | Missing SDK wrappers? | MEDIUM |
| Direct @digdir imports | 9 files | LOW |

### 5.3 Test Coverage
| Layer | Status |
|-------|--------|
| Unit tests (DS) | Partial |
| Unit tests (API services) | Unknown |
| Integration tests (API endpoints) | Partial |
| E2E tests | 154 files (good) |

---

## 6. Repository Metrics

| Metric | Value |
|--------|-------|
| **Total Files** | ~3500+ |
| **TypeScript Files** | ~1800 |
| **React Components** | ~800 |
| **Apps** | 7 |
| **Packages** | 13 |
| **API Controllers** | 72 |
| **SDK Services** | 58 |
| **SDK Hooks** | 89 |
| **DS Components** | 145+ |
| **Database Tables** | ~22 |
| **Test Files** | 650+ |

---

## Next Steps

1. **Module Dependency Audit** (STEP 1) - Map relationships between 72 API modules
2. **Contract Verification** (STEP 2) - Verify DB → API → SDK → DS alignment
3. **Gap Matrix** (STEP 3) - Document all violations with evidence
4. **Remediation Plan** (STEP 4) - Prioritize fixes
5. **Test Gap Audit** (STEP 5) - Identify missing test coverage

---

*This repository map is the baseline for all subsequent audit steps.*
