# Claude Instructions: @xalatechnologies/database-schema

> **CRITICAL**: Read this file before making ANY database-related changes.

## What This Package Is

`@xalatechnologies/database-schema` is the **platform-agnostic foundation** for all SaaS database table definitions.

**Why it exists**: This package provides the core database tables that any SaaS application needs - tenants, users, organizations, sessions, permissions, entitlements, and compliance tracking. Domain-specific tables (like bookings, rental objects, etc.) should be defined in separate domain packages.

## Package Scope

### What belongs here (platform-agnostic):
- Tenant management
- User management
- Organization management
- Session management
- Permission assignments (generic)
- Entitlements and plans
- Feature flags
- Menu system
- Audit logs
- GDPR requests

### What does NOT belong here (domain-specific):
- Business domain entities (bookings, products, orders, etc.)
- Domain-specific permission assignments
- Domain-specific access grants
- Any table with domain terminology (listings, facilities, etc.)

## Module Structure

```
src/
├── schemas.ts              # pgSchema definitions
├── core/                   # Foundation tables
│   ├── tenants.ts         # Tenant management
│   ├── organizations.ts   # Organization management
│   └── users.ts           # User management
├── platform/              # Infrastructure tables
│   ├── sessions.ts        # Authentication sessions
│   ├── memberships.ts     # Org memberships & permissions
│   ├── translations.ts    # i18n translations
│   └── auth-demo-tokens.ts # Demo auth tokens
├── saas/                  # Multi-tenancy tables
│   ├── entitlements.ts    # Plans, entitlements, policies
│   └── menu-system.ts     # Menu & navigation system
└── compliance/            # Governance tables
    ├── audit-logs.ts      # Audit trail
    └── gdpr-requests.ts   # GDPR compliance
```

## Mandatory Rules

### Rule 1: No Domain-Specific References

This package must NOT reference any domain-specific tables or terminology.

```typescript
// ❌ WRONG - Domain-specific
import { rentalObjects } from '../domain';
rentalObjectId: uuid('rental_object_id').references(() => rentalObjects.id)

// ✅ CORRECT - Generic reference
resourceType: varchar('resource_type', { length: 50 }).notNull(),
resourceId: uuid('resource_id').notNull(),
```

### Rule 2: Use Generic Names

Avoid domain-specific terminology in table and column names.

```typescript
// ❌ WRONG - Domain-specific
maxListings: integer('max_listings'),
enabledRentalObjectCategories: text('enabled_rental_object_categories'),

// ✅ CORRECT - Generic
maxResources: integer('max_resources'),
enabledCategories: text('enabled_categories'),
```

### Rule 3: Respect Module Dependencies

Import from parent modules only. Never import from `../index.ts`.

```typescript
// ✅ CORRECT
import { tenants, users } from '../core';

// ❌ WRONG - Creates circular dependency
import { tenants } from '../index';
```

### Rule 4: Use Correct Schema

Each module has its own PostgreSQL schema:

| Module | pgSchema | Use For |
|--------|----------|---------|
| core | `platformSchema` | tenants, users, orgs |
| platform | `platformSchema` | sessions, permissions |
| saas | `saasSchema` | entitlements, plans, menus |
| compliance | `complianceSchema` | audit logs, GDPR |

## How Domain Packages Extend This

Domain packages (like `@digilist/database-schema`) should:

1. Import this package as a dependency
2. Re-export platform tables
3. Add domain-specific tables in a `domain/` folder
4. Add domain-specific permission tables that reference domain entities

```typescript
// packages/digilist-database-schema/src/index.ts
export * from '@xalatechnologies/database-schema';
export * from './domain';
```

## Quick Reference

### Importing Tables

```typescript
// In domain packages
import { tenants, users, organizations } from '@xalatechnologies/database-schema';
import { sessions, orgMemberships } from '@xalatechnologies/database-schema/platform';
import { plans, routePolicies } from '@xalatechnologies/database-schema/saas';
import { auditLogs, gdprRequests } from '@xalatechnologies/database-schema/compliance';
```

### Adding a New Platform Table

1. Identify the correct module (core/platform/saas/compliance)
2. Create the table file in that module
3. Use generic names and references
4. Export from the module's index.ts
5. Update tsup.config.ts if adding new entry points

### Type Exports

Always export both select and insert types:

```typescript
export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

## Troubleshooting

### "Cannot find module '@xalatechnologies/database-schema'"

Run `pnpm install` in the monorepo root.

### TypeScript errors about missing references

Check that you're not accidentally importing domain-specific tables. This package should have NO domain dependencies.
