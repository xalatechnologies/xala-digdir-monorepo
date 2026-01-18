# @digilist/database-schema

Modular Drizzle ORM schemas and seed data for the Digilist platform.

## Why This Package?

**Problem:** Drizzle Kit hangs when generating migrations from large monolithic schema files (900+ lines).

**Solution:** Extract schemas into focused, isolated packages that Drizzle Kit can process efficiently.

**Bonus:** Centralized seed data management alongside schema definitions.

## Structure

```
@digilist/database-schema/
├── src/
│   ├── schemas.ts          # PostgreSQL schema namespaces
│   ├── entitlements.ts     # Entitlements & feature flags tables
│   └── index.ts            # Package exports
├── migrations/             # Auto-generated migrations
├── drizzle.config.ts       # Drizzle Kit configuration
└── package.json
```

## Usage

### In API

```typescript
import { 
  planEntitlements, 
  tenantEntitlementOverrides,
  routePolicies,
  navPolicies 
} from '@digilist/database-schema/entitlements';

// Use in queries
const overrides = await db
  .select()
  .from(tenantEntitlementOverrides)
  .where(eq(tenantEntitlementOverrides.tenantId, tenantId));
```

### Generate Migrations

```bash
cd packages/database-schema
pnpm db:generate
```

This will create migration files in `packages/database-schema/migrations/`.

### Copy Migrations to API

```bash
cp packages/database-schema/migrations/*.sql apps/api/drizzle/
```

### Import Seed Data

```bash
cd packages/database-schema
export DATABASE_URL="postgresql://..."
pnpm seed
```

This will import:
- Route policies (20+ routes across all apps)
- Navigation policies (hierarchical nav structure)
- Plan entitlements (Free, Pro, Enterprise defaults)

**Note:** Plan entitlements require plans to exist in `saas.plans` table first.

## Seed Data

Seed data is stored in `seeds/` directory:

```
seeds/
├── route-policies.json       # Route access control
├── nav-policies.json          # Navigation structure
├── plan-entitlements.json     # Plan defaults
└── import.ts                  # Import script
```

### Editing Seed Data

1. Edit JSON files in `seeds/`
2. Run `pnpm seed` to import
3. Data is idempotent (uses `onConflictDoNothing`)

## Benefits

✅ **Fast migration generation** - Small, focused schemas  
✅ **No hanging** - Drizzle Kit processes efficiently  
✅ **Modular** - Easy to maintain and extend  
✅ **Type-safe** - Full TypeScript support  
✅ **Reusable** - Can be used across multiple apps

## Adding New Schemas

1. Create new schema file in `src/` (e.g., `src/analytics.ts`)
2. Export from `src/index.ts`
3. Update `drizzle.config.ts` if needed
4. Run `pnpm db:generate`
