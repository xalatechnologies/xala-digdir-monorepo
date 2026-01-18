# Database Schema Package

> **Single Source of Truth** for all Drizzle ORM schema definitions in the Digilist platform.

## Overview

This package contains all database table definitions, organized into logical modules. It is designed to:

1. **Eliminate circular dependencies** that caused Drizzle Kit to hang
2. **Enable automatic migration generation** via `pnpm db:generate`
3. **Provide type-safe exports** for all database tables
4. **Centralize schema governance** in one package

## Package Structure

```
@digilist/database-schema/
├── src/
│   ├── schemas.ts           # pgSchema definitions (platform, domain, saas, etc.)
│   ├── core/                # Foundation tables (no external dependencies)
│   │   ├── tenants.ts       # Multi-tenant foundation
│   │   ├── organizations.ts # Organization hierarchy
│   │   ├── users.ts         # User accounts
│   │   └── index.ts
│   ├── domain/              # Business entities
│   │   ├── rental-objects.ts # Core rental inventory
│   │   ├── bookings.ts      # Booking transactions
│   │   └── index.ts
│   ├── platform/            # Infrastructure tables
│   │   ├── sessions.ts      # Authentication sessions
│   │   ├── memberships.ts   # Org memberships, permissions
│   │   └── index.ts
│   ├── saas/                # Multi-tenancy & entitlements
│   │   ├── entitlements.ts  # 7 entitlement tables
│   │   └── index.ts
│   ├── compliance/          # Audit & governance
│   │   ├── audit-logs.ts    # Activity tracking
│   │   └── index.ts
│   └── index.ts             # Master export
├── seeds/                   # Seed data
│   ├── route-policies.json
│   ├── nav-policies.json
│   ├── plan-entitlements.json
│   └── import.ts
├── migrations/              # Auto-generated SQL
└── drizzle.config.ts
```

## Modules

### Core Module (`/core`)
Foundation tables with no external dependencies.

| Table | Description |
|-------|-------------|
| `tenants` | Multi-tenant root entity |
| `organizations` | Hierarchical org structure |
| `users` | User accounts with RBAC roles |

### Domain Module (`/domain`)
Business logic entities.

| Table | Description |
|-------|-------------|
| `rentalObjects` | Rental inventory items |
| `bookings` | Booking transactions |

### Platform Module (`/platform`)
Infrastructure and authentication.

| Table | Description |
|-------|-------------|
| `sessions` | JWT refresh token sessions |
| `orgMemberships` | Organization membership |
| `accessGrants` | Resource access grants |
| `permissionAssignments` | User-level permissions |
| `caseHandlerScopes` | Case handler assignments |

### SaaS Module (`/saas`)
Entitlements and feature flags.

| Table | Description |
|-------|-------------|
| `planEntitlements` | Base entitlements per plan |
| `tenantEntitlementOverrides` | Tenant-specific overrides |
| `integrationConfigs` | Integration configurations |
| `routePolicies` | Route-level access control |
| `navPolicies` | Navigation visibility |
| `globalKillSwitches` | Emergency disable |
| `entitlementAuditLog` | Change tracking |

### Compliance Module (`/compliance`)
Audit and governance.

| Table | Description |
|-------|-------------|
| `auditLogs` | Activity audit trail |

## Usage

### Importing Tables

```typescript
// Import everything
import { tenants, users, bookings } from '@digilist/database-schema';

// Import from specific module
import { tenants, users } from '@digilist/database-schema/core';
import { planEntitlements } from '@digilist/database-schema/saas';

// Import types
import type { Tenant, User, Booking } from '@digilist/database-schema';
```

### Generating Migrations

```bash
cd packages/database-schema
pnpm db:generate   # Generate SQL migrations
pnpm db:push       # Push schema to database (dev only)
```

### Importing Seeds

```bash
cd packages/database-schema
export DATABASE_URL="postgresql://..."
pnpm seed
```

## Schema Conventions

1. **All tables use UUID primary keys** with `defaultRandom()`
2. **All tables have `createdAt` and `updatedAt`** timestamps
3. **Foreign keys use `onDelete: 'cascade'`** for dependent tables
4. **Indexes are named** with `{table}_{column}_idx` pattern
5. **Each module has its own pgSchema** (platform, domain, saas, compliance, monitoring)

## Adding New Tables

1. Create table file in appropriate module (e.g., `src/domain/new-table.ts`)
2. Export from module's `index.ts`
3. Run `pnpm db:generate` to create migration
4. Copy migration to `apps/api/drizzle/` if needed
