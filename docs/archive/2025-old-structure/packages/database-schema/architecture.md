# Database Schema Architecture

## Overview

The `@digilist/database-schema` package is the **single source of truth** for all Drizzle ORM database schema definitions in the Digilist platform.

## Why This Package Exists

### Problem

The original monolithic schema file in `apps/api/src/database/schema/index.ts` (912 lines) caused Drizzle Kit to hang indefinitely during migration generation. Multiple files with circular imports made the problem worse.

### Solution

We created a dedicated package with:

1. **Modular structure** - Tables organized by domain (core, domain, platform, saas, compliance)
2. **Dependency ordering** - Modules import only from parent modules, preventing circular deps
3. **Centralized governance** - One place for all schema definitions
4. **Automatic migration generation** - Drizzle Kit works correctly on this package

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   @digilist/database-schema             │
├─────────────────────────────────────────────────────────┤
│  schemas.ts  ──────────────────────────────────────┐    │
│       ↓                                            │    │
│  ┌─────────┐                                       │    │
│  │  core/  │ tenants, organizations, users         │    │
│  └────┬────┘                                       │    │
│       ↓                                            │    │
│  ┌─────────┐                                       │    │
│  │ domain/ │ rental-objects, bookings              │    │
│  └────┬────┘                                       │    │
│       ↓                                            │    │
│  ┌──────────┐                                      │    │
│  │platform/ │ sessions, memberships, permissions   │    │
│  └──────────┘                                      │    │
│                                                    │    │
│  ┌─────────┐  ┌────────────┐                       │    │
│  │  saas/  │  │ compliance/│                       │    │
│  │         │  │            │                       │    │
│  │7 tables │  │ audit_logs │ ←── schemas.ts ───────┘    │
│  └─────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓ re-exports
┌─────────────────────────────────────────────────────────┐
│              apps/api/src/database/schema/              │
│                                                         │
│  index.ts ────→ re-exports from @digilist/database-schema
│  index.legacy.ts ───→ backup of original 912-line file  │
└─────────────────────────────────────────────────────────┘
```

## Module Breakdown

### Core Module (3 tables)

Foundation tables with no external dependencies.

| Table | Schema | Purpose |
|-------|--------|---------|
| `tenants` | platform | Multi-tenant root entity |
| `organizations` | platform | Hierarchical org structure |
| `users` | platform | User accounts with RBAC |

### Domain Module (2 tables)

Business logic entities.

| Table | Schema | Purpose |
|-------|--------|---------|
| `rentalObjects` | domain | Rental inventory |
| `bookings` | domain | Booking transactions |

### Platform Module (5 tables)

Infrastructure and authentication.

| Table | Schema | Purpose |
|-------|--------|---------|
| `sessions` | platform | JWT refresh sessions |
| `orgMemberships` | platform | Org membership |
| `accessGrants` | domain | Resource access |
| `permissionAssignments` | platform | User permissions |
| `caseHandlerScopes` | platform | Handler assignments |

### SaaS Module (7 tables)

Entitlements and feature flags.

| Table | Schema | Purpose |
|-------|--------|---------|
| `planEntitlements` | saas | Plan features |
| `tenantEntitlementOverrides` | saas | Tenant overrides |
| `integrationConfigs` | saas | Integration settings |
| `routePolicies` | saas | Route access |
| `navPolicies` | saas | Nav visibility |
| `globalKillSwitches` | saas | Emergency disable |
| `entitlementAuditLog` | saas | Change tracking |

### Compliance Module (1 table)

Audit and governance.

| Table | Schema | Purpose |
|-------|--------|---------|
| `auditLogs` | compliance | Activity audit trail |

## Usage

### Installation

The package is already a workspace dependency. Just import:

```typescript
import { tenants, users, bookings } from '@digilist/database-schema';
```

### Migration Generation

```bash
cd packages/database-schema
pnpm db:generate
```

### Seed Data Import

```bash
cd packages/database-schema
export DATABASE_URL="postgresql://..."
pnpm seed
```

## Related Documentation

- [Package README](../../packages/database-schema/README.md)
- [Agent Instructions](../../packages/database-schema/AGENTS.md)
- [Claude Instructions](../../packages/database-schema/CLAUDE.md)
