# apps/api - Domain API Server

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **api** app is the Fastify-based **Domain API** server for Digilist rental booking. It provides domain-specific business logic, data persistence, and real-time events for rental objects, bookings, calendar, seasons, and related features.

**IMPORTANT:** This API is **DOMAIN-ONLY**. Platform modules (auth, tenant, user, organizations, etc.) are in `apps/platform-api` (port 4001).

**Port:** 4000
**URL (local):** http://localhost:4000
**URL (production):** https://api.digilist.no
**Health check:** `/health`

---

## Domain vs Platform Split

### What Belongs Here (Domain)

Domain-specific modules for Digilist rental booking:

- **Rental Objects** - Rental object CRUD, categories, amenities
- **Bookings** - Booking management, cart, confirmation
- **Calendar** - Availability, time slots, blocks
- **Seasons** - Season management, seasonal leases
- **Custody** - Custody state machine
- **Search** - Domain-specific search
- **Pricing** - Pricing rules, discount codes
- **Reviews** - Review management
- **Allocations** - Resource allocations
- **Conversations** - Messaging (domain context)
- **Favorites** - User favorites
- **Dashboard** - Domain dashboard data
- **Reports** - Domain reports

### What Does NOT Belong Here (Platform)

Platform modules are in `apps/platform-api`:

- Authentication (auth, authz, idporten)
- User management
- Tenant management
- Organizations
- GDPR compliance
- Audit logging
- Notifications
- Feature flags
- SaaS admin (billing, plans, entitlements)
- Storage
- Translations (system)
- WebSocket infrastructure

---

## Directory Structure

```
apps/api/
├── src/
│   ├── main.ts              # Entry point
│   ├── core/                # Core infrastructure
│   │   ├── container.ts     # DI container
│   │   ├── module.ts        # Module loader
│   │   └── auth/            # JWT validation (shared)
│   ├── adapters/
│   │   └── fastify.adapter.ts
│   ├── database/
│   │   └── schema/          # Domain schema imports
│   ├── graphql/
│   │   └── schema.ts        # GraphQL schema
│   └── modules/             # Domain modules ONLY
│       ├── rental-objects/
│       ├── booking/
│       ├── bookings/
│       ├── calendar/
│       ├── availability/
│       ├── blocks/
│       ├── seasons/
│       ├── seasonal-lease/
│       ├── custody/
│       ├── search/
│       ├── pricing/
│       ├── discount-codes/
│       ├── reviews/
│       ├── favorites/
│       ├── amenities/
│       ├── addons/
│       ├── allocations/
│       ├── conversations/
│       ├── messages/
│       ├── dashboard/
│       ├── reports/
│       ├── domain/
│       ├── backoffice/
│       ├── profile/
│       ├── public/
│       ├── help/
│       ├── share/
│       ├── widgets/
│       ├── metadata/
│       ├── minside/
│       └── bulk/
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @digilist/api dev        # Start dev server with hot reload
pnpm --filter @digilist/api build      # Build for production
pnpm --filter @digilist/api start      # Start production server

# From this directory
pnpm dev                               # Start dev server (port 4000)
pnpm build                             # Build for production
pnpm start                             # Start production server

# Database commands
pnpm db:generate                       # Generate migrations
pnpm db:migrate                        # Run migrations
pnpm db:seed                           # Seed database
pnpm db:studio                         # Open Drizzle Studio
```

---

## API Architecture

### RFC 7807 Problem Details

ALL errors MUST conform to RFC 7807:

```typescript
interface ProblemDetails {
  type: string;      // URI identifying error type
  title: string;     // Human-readable summary
  status: number;    // HTTP status code
  detail?: string;   // Human-readable explanation
  instance?: string; // URI reference to specific occurrence
}
```

### Multi-Tenant Isolation

ALL queries MUST be scoped to tenant:

```typescript
// CORRECT - Tenant-scoped query
const rentalObjects = await db.select()
  .from(rentalObjects)
  .where(eq(rentalObjects.tenantId, request.tenantId));

// WRONG - No tenant isolation
const rentalObjects = await db.select().from(rentalObjects);
```

### Cross-API Communication

For platform operations, call the Platform API:

```typescript
// Domain API needs to validate auth token
// Token validation uses shared JWT secret

// For user details, call Platform API
const response = await fetch('http://localhost:4001/api/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Module Structure

Each module follows this structure:

```
modules/rental-objects/
├── rental-object.controller.ts   # Route handlers
├── rental-object.service.ts      # Business logic
├── rental-object.repository.ts   # Data access
├── rental-object.schema.ts       # Zod validation schemas
├── rental-object.types.ts        # TypeScript types
└── index.ts                      # Exports
```

---

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xala

# JWT (shared with platform API)
JWT_SECRET=your-secret-key

# Platform API (for cross-API calls)
PLATFORM_API_URL=http://localhost:4001

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

---

## Testing

```bash
# Unit tests
pnpm test

# E2E API tests
pnpm test:e2e

# Specific module tests
pnpm test src/modules/rental-objects/
```

---

## When in Doubt

1. Is this domain-specific? -> Put it here
2. Is this platform/infrastructure? -> Put it in `apps/platform-api`
3. Does this use tenant-scoped queries? -> YES, always
4. Does this follow RFC 7807? -> YES, always
5. Check root CLAUDE.md for architecture rules

---

## CRITICAL: No Platform Imports

The following imports are BANNED in domain modules:

```typescript
// BANNED IMPORTS - Use Platform API instead
import { ... } from '../auth';           // Use token validation only
import { ... } from '../user';           // Call Platform API
import { ... } from '../tenant';         // Call Platform API
import { ... } from '../organizations';  // Call Platform API
import { ... } from '../gdpr';           // In Platform API
import { ... } from '../audit';          // In Platform API
import { ... } from '../notifications';  // In Platform API
import { ... } from '../saas';           // In Platform API
```

---

**Last Updated:** 2026-01-21
**Status:** Domain-Only (Platform modules extracted to platform-api)
**Port:** 4000
