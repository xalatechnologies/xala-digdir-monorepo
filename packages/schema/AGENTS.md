# Agent Instructions: @digilist/database-schema

> This file provides context for AI coding agents working with the database schema package.

## Package Purpose

This package is the **SINGLE SOURCE OF TRUTH** for all Drizzle ORM database schemas. Do NOT define database tables anywhere else.

## Key Rules for Agents

### ✅ DO

1. **Import from this package** when working with database tables:
   ```typescript
   import { tenants, users, bookings } from '@digilist/database-schema';
   ```

2. **Add new tables to appropriate modules**:
   - Core tables (tenants, users, orgs) → `src/core/`
   - Business entities → `src/domain/`
   - Auth/permissions → `src/platform/`
   - Entitlements/flags → `src/saas/`
   - Audit/compliance → `src/compliance/`

3. **Run migration generation after schema changes**:
   ```bash
   cd packages/database-schema
   pnpm db:generate
   ```

4. **Export new tables from module index**:
   ```typescript
   // In src/domain/index.ts
   export * from './new-table';
   ```

### ❌ DO NOT

1. **Do NOT define tables in `apps/api/src/database/schema/`** - that file only re-exports from this package

2. **Do NOT create circular imports** - always import from parent modules:
   ```typescript
   // ✅ Correct
   import { tenants } from '../core';
   
   // ❌ Wrong - creates circular dependency
   import { tenants } from '../index';
   ```

3. **Do NOT modify `index.legacy.ts`** - it exists only for backward compatibility

4. **Do NOT use Drizzle Kit on the API schema** - it will hang. Use this package instead.

## Module Dependency Graph

```
schemas.ts (no deps)
    ↓
core/ (depends on schemas)
    ↓
domain/ (depends on core)
    ↓
platform/ (depends on core, domain)
    ↓
saas/ (depends on schemas only)
    ↓
compliance/ (depends on core)
```

## Schema Definitions (pgSchema)

| Schema | Purpose | Location |
|--------|---------|----------|
| `platformSchema` | Core infrastructure | `platform.*` |
| `domainSchema` | Business logic | `domain.*` |
| `saasSchema` | Multi-tenancy | `saas.*` |
| `complianceSchema` | Audit/governance | `compliance.*` |
| `monitoringSchema` | Observability | `monitoring.*` |

## Common Tasks

### Add a New Table

1. Create file in correct module:
   ```typescript
   // src/domain/reviews.ts
   import { domainSchema } from '../schemas';
   import { tenants, users } from '../core';
   
   export const reviews = domainSchema.table('reviews', {
     id: uuid('id').primaryKey().defaultRandom(),
     tenantId: uuid('tenant_id').references(() => tenants.id),
     // ... columns
   });
   ```

2. Export from module index:
   ```typescript
   // src/domain/index.ts
   export * from './reviews';
   ```

3. Generate migration:
   ```bash
   pnpm db:generate
   ```

### Add Seed Data

1. Create JSON file in `seeds/`:
   ```json
   // seeds/reviews.json
   [{ "id": "...", "tenantId": "...", ... }]
   ```

2. Update `seeds/import.ts` to import the data

### Query Tables in API

```typescript
import { tenants, users } from '@digilist/database-schema';
import { eq } from 'drizzle-orm';

const tenant = await db.select().from(tenants).where(eq(tenants.slug, 'demo'));
```

## Entitlements System

The SaaS module contains a complete entitlements system:

- `planEntitlements` - What each plan includes
- `routePolicies` - Which roles can access which routes
- `navPolicies` - Which nav items are visible
- `tenantEntitlementOverrides` - Per-tenant customizations
- `globalKillSwitches` - Emergency feature disable

Use these for RBAC and feature flag checks.

## Seeds Available

| File | Records | Purpose |
|------|---------|---------|
| `route-policies.json` | 20 | Route access control |
| `nav-policies.json` | 14 | Navigation visibility |
| `plan-entitlements.json` | 35 | Plan features |
