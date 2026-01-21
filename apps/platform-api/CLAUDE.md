# apps/platform-api - Platform API Server

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **platform-api** app is a domain-agnostic Fastify-based API server that provides platform-level services. This API contains ONLY infrastructure and platform modules that are NOT tied to any specific domain (like Digilist's rental/booking domain).

**Port:** 4001
**URL (local):** http://localhost:4001
**Health check:** `/health`

---

## CRITICAL: Platform-Only Rules

### NO DOMAIN IMPORTS

This API is STRICTLY platform-only. The following imports are BANNED:

```typescript
// BANNED IMPORTS - NEVER USE THESE
import { ... } from '@digilist/*';           // Domain SDK
import { ... } from '@digilist/ui';           // Domain UI
import { ... } from '@digilist/domain';       // Domain contracts
import { ... } from '@digilist/sdk';          // Domain services

// ALLOWED IMPORTS
import { ... } from '@xalatechnologies/platform';        // Platform package
import { ... } from '@xalatechnologies/platform/config'; // Platform config
import { ... } from '@xalatechnologies/platform/auth';   // Platform auth
import { ... } from '@digilist/database-schema';         // Database (shared)
```

### Banned Terms in Platform Code

The following terms are BANNED in this codebase:

- `listing` - Use `resource` instead
- `facility` - Use `amenity` instead
- `rental` - Use `resource` instead
- `booking` - This is domain-specific
- `rentalObject` - This is domain-specific

### What Belongs Here

Platform modules that are domain-agnostic:

- **Authentication** - JWT, OAuth, SSO providers
- **Authorization** - RBAC, permissions, access control
- **Audit** - Audit logging, compliance tracking
- **Tenant Management** - Multi-tenancy infrastructure
- **User Management** - User CRUD, profiles
- **Health** - Health checks, readiness probes
- **Metrics** - Prometheus metrics, observability
- **Feature Flags** - Feature toggle management
- **Notifications** - Notification infrastructure (not domain templates)
- **Storage** - File storage service
- **Translations** - i18n infrastructure
- **SaaS Admin** - Plans, billing, subscriptions

### What Does NOT Belong Here

Domain-specific modules (these stay in `apps/api`):

- Rental Objects / Listings
- Bookings / Reservations
- Calendar / Availability
- Seasons / Seasonal Leases
- Reviews
- Search (domain-specific)
- Organizations (if domain-specific)

---

## Directory Structure

```
apps/platform-api/
├── src/
│   ├── main.ts              # Entry point
│   ├── core/                # Core infrastructure
│   │   ├── container.ts     # DI container
│   │   ├── decorators.ts    # Route/injectable decorators
│   │   ├── module.ts        # Module loader
│   │   ├── auth/            # JWT service, middleware
│   │   ├── errors/          # RFC 7807 error handling
│   │   └── validation/      # Zod validation utilities
│   ├── adapters/
│   │   └── fastify.adapter.ts  # Fastify setup
│   ├── middleware/
│   │   ├── auth-cookie.middleware.ts
│   │   ├── csrf.middleware.ts
│   │   └── rbac.ts
│   └── modules/             # Platform modules ONLY
│       ├── health/
│       ├── auth/
│       ├── tenant/
│       ├── user/
│       ├── audit/
│       ├── saas/
│       ├── storage/
│       ├── notifications/
│       └── translations/
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xalatechnologies/platform-api dev    # Start dev server
pnpm --filter @xalatechnologies/platform-api build  # Build for production
pnpm --filter @xalatechnologies/platform-api start  # Start production server

# From this directory
pnpm dev     # Start dev server with hot reload (port 4001)
pnpm build   # Build for production
pnpm start   # Start production server
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
const users = await db.select()
  .from(users)
  .where(eq(users.tenantId, request.tenantId));

// WRONG - No tenant isolation
const users = await db.select().from(users);
```

### Audit Logging

ALL state mutations MUST be audited:

```typescript
await auditLog({
  action: 'user:create',
  resource: 'user',
  resourceId: user.id,
  tenantId: request.tenantId,
  userId: request.userId,
  changes: userData,
});
```

---

## Verification

Run these commands to verify platform-only compliance:

```bash
# Check for banned imports
grep -r "@digilist/" src/ --include="*.ts"
# Should return NO results

# Check for banned terms
grep -rE "(listing|rental|booking)" src/ --include="*.ts"
# Should return NO results (except comments explaining the ban)
```

---

## When in Doubt

1. Is this domain-specific? -> Put it in `apps/api` instead
2. Does this import from `@digilist/*`? -> STOP, wrong codebase
3. Does this use banned terms? -> Refactor to platform-neutral terms
4. Is this reusable across domains? -> Belongs here
5. Check root CLAUDE.md for architecture rules

---

**Last Updated:** 2026-01-21
**Status:** New
**Port:** 4001
