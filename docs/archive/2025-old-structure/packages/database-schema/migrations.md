# Database Schema Migration Guide

## Overview

This guide explains how to work with database migrations using the `@digilist/database-schema` package.

## Quick Start

### Generate Migration

```bash
cd packages/database-schema
pnpm db:generate
```

### Apply Migration (Development)

```bash
cd packages/database-schema
export DATABASE_URL="postgresql://digilist:digilist@localhost:5432/digilist_dev"
pnpm db:push
```

### Apply Migration (Production)

1. Copy migration file to API:
   ```bash
   cp packages/database-schema/migrations/00XX_*.sql apps/api/drizzle/
   ```

2. Run migration:
   ```bash
   cd apps/api
   pnpm db:migrate
   ```

## Adding New Tables

### Step 1: Determine the Module

| Table Type | Module | Example |
|------------|--------|---------|
| Core identity | `src/core/` | users, tenants |
| Business logic | `src/domain/` | bookings, reviews |
| Auth/sessions | `src/platform/` | sessions, grants |
| Entitlements | `src/saas/` | plans, flags |
| Audit | `src/compliance/` | audit_logs |

### Step 2: Create Table File

```typescript
// packages/database-schema/src/domain/reviews.ts
import {
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { domainSchema } from '../schemas';
import { tenants, users } from '../core';
import { rentalObjects } from './rental-objects';

export const reviews = domainSchema.table('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('reviews_tenant_idx').on(table.tenantId),
  userIdx: index('reviews_user_idx').on(table.userId),
  rentalObjectIdx: index('reviews_rental_object_idx').on(table.rentalObjectId),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
```

### Step 3: Export from Module Index

```typescript
// packages/database-schema/src/domain/index.ts
export * from './rental-objects';
export * from './bookings';
export * from './reviews';  // Add this line
```

### Step 4: Generate Migration

```bash
cd packages/database-schema
pnpm db:generate
```

This will create a new SQL file in `migrations/`.

### Step 5: Review Migration

Check the generated SQL:

```bash
cat migrations/00XX_*.sql
```

### Step 6: Apply Migration

For development:
```bash
pnpm db:push
```

For production:
```bash
cp migrations/00XX_*.sql ../apps/api/drizzle/
cd ../apps/api
pnpm db:migrate
```

## Schema Conventions

### Primary Keys

Always use UUID with defaultRandom:

```typescript
id: uuid('id').primaryKey().defaultRandom(),
```

### Foreign Keys

Use references with onDelete behavior:

```typescript
tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
```

### Timestamps

Always include createdAt and updatedAt:

```typescript
createdAt: timestamp('created_at').notNull().defaultNow(),
updatedAt: timestamp('updated_at').notNull().defaultNow(),
```

### Indexes

Name with `{table}_{column}_idx` pattern:

```typescript
}, (table) => ({
  tenantIdx: index('my_table_tenant_idx').on(table.tenantId),
}));
```

### Type Exports

Always export inferred types:

```typescript
export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

## Troubleshooting

### Drizzle Kit Hangs

You're probably running on the wrong directory. Always run from `packages/database-schema`, not `apps/api`.

### Circular Dependency Error

Check your imports. Use relative imports to parent modules:

```typescript
// ✅ Correct
import { tenants } from '../core';

// ❌ Wrong
import { tenants } from '../index';
```

### Migration Not Detecting Changes

Rebuild the package first:

```bash
pnpm build
pnpm db:generate
```
