# Claude Instructions: @digilist/database-schema

> **CRITICAL**: Read this file before making ANY database-related changes.

## What This Package Is

`@digilist/database-schema` is the **SINGLE SOURCE OF TRUTH** for all database table definitions in the Digilist platform.

**Why it exists**: The original monolithic schema file (912 lines) caused Drizzle Kit to hang indefinitely. This package solves that by organizing tables into dependency-ordered modules.

## Mandatory Rules

### Rule 1: Never Define Tables Elsewhere

All database tables MUST be defined in this package. The API's schema folder (`apps/api/src/database/schema/`) only re-exports from this package.

```typescript
// ✅ CORRECT - Define in package
// packages/database-schema/src/domain/new-table.ts
export const newTable = domainSchema.table('new_table', { ... });

// ❌ WRONG - Never define in API
// apps/api/src/database/schema/new-table.ts
export const newTable = ... // DON'T DO THIS
```

### Rule 2: Respect Module Dependencies

Import from parent modules only. Never import from `../index.ts` - it creates circular dependencies.

```typescript
// ✅ CORRECT
import { tenants, users } from '../core';
import { rentalObjects } from '../domain';

// ❌ WRONG - Creates circular dependency
import { tenants } from '../index';
import { tenants } from '../../index';
```

### Rule 3: Use Correct Schema

Each module has its own PostgreSQL schema:

| Module | pgSchema | Use For |
|--------|----------|---------|
| core | `platformSchema` | tenants, users, orgs |
| domain | `domainSchema` | bookings, rentals, reviews |
| platform | `platformSchema` | sessions, permissions |
| saas | `saasSchema` | entitlements, plans |
| compliance | `complianceSchema` | audit logs |

### Rule 4: Always Generate Migrations

After any schema change:

```bash
cd packages/database-schema
pnpm db:generate
```

Then copy the migration to `apps/api/drizzle/` if deploying to production.

## Quick Reference

### Adding a New Table

```typescript
// 1. Create file: src/domain/my-table.ts
import { uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { domainSchema } from '../schemas';
import { tenants } from '../core';

export const myTable = domainSchema.table('my_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('my_table_tenant_idx').on(table.tenantId),
}));

export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;

// 2. Add to src/domain/index.ts
export * from './my-table';

// 3. Generate migration
// pnpm db:generate
```

### Module Locations

| If table is about... | Put it in... |
|---------------------|--------------|
| Core identity (users, orgs, tenants) | `src/core/` |
| Business logic (bookings, rentals) | `src/domain/` |
| Auth/sessions/permissions | `src/platform/` |
| Entitlements/feature flags/plans | `src/saas/` |
| Audit logs/compliance | `src/compliance/` |

### Importing in API Code

```typescript
// In any API module
import { tenants, users, bookings, rentalObjects } from '@digilist/database-schema';
import type { Tenant, User, Booking } from '@digilist/database-schema';

// For entitlements specifically
import { planEntitlements, routePolicies } from '@digilist/database-schema/saas';
```

## Troubleshooting

### "Cannot find module '@digilist/database-schema'"

Run `pnpm install` in the monorepo root.

### "Drizzle Kit hangs"

You're probably running it on the API schema. Run it on this package instead:

```bash
cd packages/database-schema  # NOT apps/api
pnpm db:generate
```

### Circular dependency error

Check your imports. Use `../core` or `../domain`, never `../index`.

## Files to Never Modify

- `apps/api/src/database/schema/index.legacy.ts` - Backup, do not touch
- `apps/api/drizzle.config.ts` - Points to API schema, will hang

## Files You Will Modify

- `packages/database-schema/src/{module}/*.ts` - Schema definitions
- `packages/database-schema/src/{module}/index.ts` - Module exports
- `packages/database-schema/seeds/*.json` - Seed data
