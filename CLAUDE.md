# CLAUDE.md - Digilist Domain Repository

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

> **Domain Repository:** This is the Digilist domain repository containing
> rental object and booking management functionality. Platform infrastructure
> is consumed from `@xalatechnologies/platform` npm package.

---

## System Context

**Digilist** is a Norwegian municipal booking and resource management system.

**Domain Characteristics:**
- Multi-tenant (kommune-level isolation)
- Rental object management (boat slips, parking, recreational facilities)
- Booking workflow (request → approval → confirmation)
- Seasonal allocation management
- SDK-driven (@digilist/client-sdk is THE integration layer)
- GDPR compliant (consent management, data subject rights)

**Platform Dependencies (from @xalatechnologies/platform):**
- Authentication (BankID, ID-porten, Vipps)
- Design system (@xalatechnologies/platform/ui)
- i18n infrastructure (@xalatechnologies/platform/i18n)
- RFC 7807 error handling
- Observability (metrics, logging)

---

## Repository Structure

```
xala-digilist/
├── apps/
│   ├── api/                    # Domain API (port 4000)
│   ├── web/                    # Public discovery (port 5173)
│   ├── dashboard/              # User dashboard (port 5174) [renamed from minside]
│   ├── backoffice/             # Admin portal (port 5175)
│   ├── monitoring/             # Domain monitoring (port 5178)
│   └── docs-learning/          # Documentation (port 5179)
│
├── packages/
│   ├── client-sdk/             # @digilist/client-sdk (domain services)
│   ├── contracts/              # @digilist/contracts (Zod schemas, types)
│   ├── ui/                     # @digilist/ui (domain components)
│   ├── runtime/                # @digilist/runtime (app configuration)
│   ├── schema/                 # @digilist/database-schema (domain tables)
│   ├── testing/                # @digilist/testing
│   └── testing-e2e/            # @digilist/testing-e2e
│
├── docs/                       # Domain documentation
├── scripts/                    # Domain scripts
└── infra/                      # Infrastructure configuration
```

---

## Non-Negotiable Rules

### 1. SDK-FIRST RULE

```
❌ NEVER generate direct API calls (fetch, axios, graphql)
✅ ONLY use @digilist/client-sdk
```

If SDK lacks a method → **report gap, do NOT bypass**.

```tsx
// ❌ WRONG
const response = await fetch("/api/bookings");

// ✅ CORRECT
import { useBookings } from "@digilist/client-sdk/hooks";

function MyComponent() {
  const { data, isLoading } = useBookings();
}
```

### 2. DOMAIN TERMINOLOGY

Use **correct domain terminology**:

| ✅ Correct | ❌ Incorrect |
|------------|--------------|
| rentalObject | listing, facility |
| booking | reservation |
| organization | kommune (in code) |
| dashboard | minside (legacy) |

### 3. PLATFORM IMPORTS

```typescript
// ✅ CORRECT - Platform packages from npm
import { Button, Card } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useT } from '@xalatechnologies/platform/i18n';

// ✅ CORRECT - Domain packages (local)
import { useBookings } from '@digilist/client-sdk/hooks';
import { RentalObjectCard } from '@digilist/ui';
import { BookingSchema } from '@digilist/contracts';

// ❌ WRONG - Direct design system imports
import { Button } from '@digdir/designsystemet-react';

// ❌ WRONG - Platform source paths
import { ... } from '../../../platform/src/...';
```

### 4. NO BUSINESS LOGIC IN UI

- React components = orchestration + rendering only
- All logic lives in: API services, SDK services, typed hooks
- Components should be presentational

### 5. i18n LOCALIZATION-FIRST

```
❌ NEVER use hardcoded strings in UI components
✅ ALWAYS use t() function from @xalatechnologies/platform/i18n
✅ ALWAYS define translations in both nb.ts AND en.ts
```

```tsx
// ❌ WRONG
<Heading>Velg rolle</Heading>

// ✅ CORRECT
import { useT } from '@xalatechnologies/platform/i18n';

function MyComponent() {
  const t = useT();
  return <Heading>{t('auth.roleSelection.title')}</Heading>;
}
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Build all packages and apps
pnpm build

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Verify domain boundaries
./scripts/verify-domain-boundaries.sh

# Verify SDK structure
./scripts/verify-sdk-structure.sh

# Verify modules registration
pnpm verify:modules
```

---

## Database Schema

Domain tables are in the `domain` schema:

```sql
CREATE SCHEMA IF NOT EXISTS domain;

-- Domain tables:
-- rental_objects, bookings, allocations, seasonal_leases,
-- conversations, messages, seasons, season_applications,
-- priority_rules, access_grants
```

Platform tables (users, tenants, organizations, sessions) are in the `platform` schema.

---

## Domain SDK Services

The `@digilist/client-sdk` provides domain-specific services:

### Booking Domain
- `bookingService` - Booking CRUD, approval workflow
- `calendarService` - Availability, calendar views
- `pricingService` - Price calculation, quotes
- `allocationsService` - Resource allocation management
- `favoritesService` - User favorites

### Rental Objects
- `rentalObjectService` - Rental object CRUD
- `amenitiesService` - Amenities management
- `blocksService` - Block/unavailability management

### Seasonal Management
- `seasonService` - Season configuration
- `seasonApplicationService` - Application workflow

### Engagement
- `conversationService` - Messaging
- `reviewService` - Reviews and ratings

### Business
- `dashboardService` - Dashboard data
- `reportsService` - Analytics and reporting
- `discountCodesService` - Discount code management

---

## Domain Components (@digilist/ui)

Feature kits wrap platform patterns for domain use:

```typescript
// Feature kits available:
import { RentalObjectCard, RentalObjectGrid } from '@digilist/ui/features/rental-objects';
import { BookingFormModal, PriceSummaryCard } from '@digilist/ui/features/booking';
import { SeasonCard, VenueCard } from '@digilist/ui/features/seasons';
```

---

## Testing

All tests are organized under `packages/testing/`:

```
packages/testing/
├── suites/
│   ├── unit/          # Vitest unit tests
│   ├── e2e/           # Playwright E2E tests
│   │   ├── backoffice/
│   │   ├── dashboard/   # (renamed from minside)
│   │   └── web/
│   └── integration/   # Integration tests
├── mocks/             # Mock implementations
├── fixtures/          # Test data
└── reports/           # Test output (gitignored)
```

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│  FRONTEND (React)                       │
│  apps/web, apps/dashboard, apps/backoffice
│  - Orchestration only                   │
│  - Uses SDK hooks                       │
│  - No API calls, no business logic      │
├─────────────────────────────────────────┤
│  SDK (@digilist/client-sdk)             │
│  - Domain services                      │
│  - React Query hooks                    │
│  - WebSocket realtime                   │
├─────────────────────────────────────────┤
│  PLATFORM (@xalatechnologies/platform)  │
│  - UI components, auth, i18n            │
│  - Consumed from npm                    │
├─────────────────────────────────────────┤
│  API (apps/api)                         │
│  - Domain business logic                │
│  - Drizzle ORM / PostgreSQL             │
│  - Multi-tenant isolation               │
└─────────────────────────────────────────┘
```

---

## Production Constraints

- System is live, multi-tenant, and regulated
- Any change impacts multiple municipalities
- Audit trails are legally required

**Forbidden phrases:**
- "In a real system you would…"
- "For simplicity…"
- "This is just a prototype…"

---

## When in Doubt

1. Check if SDK method exists → use it
2. Check if @digilist/ui component exists → use it
3. Check platform docs for auth/i18n/design system
4. Verify domain terminology (rentalObject, not listing)
5. Run verification scripts before committing

**If any rule cannot be satisfied, STOP and report the gap.**

---

## Platform Documentation Reference

For platform-level details, refer to:
- Authentication: `@xalatechnologies/platform` documentation
- Design System: `@xalatechnologies/platform/ui` documentation
- i18n: `@xalatechnologies/platform/i18n` documentation

---

**Last Updated:** 2026-01-21
**Repository Type:** Domain Repository (Digilist)
