# Deprecation Notice

## Schemas in this directory are being migrated to @digilist/contracts

As of the schema consolidation update, all shared domain schemas should be imported from `@digilist/contracts`.

### Migration Status

| Schema | Status | Target Location |
|--------|--------|-----------------|
| `favorites.schema.ts` | ✅ MIGRATED | `@digilist/contracts/schemas` |
| `pricing.schema.ts` | ✅ MIGRATED | `@digilist/contracts/schemas` |
| `price-rules.schema.ts` | ✅ MIGRATED | `@digilist/contracts/schemas` |
| `user-group.schema.ts` | ✅ MIGRATED | `@digilist/contracts/schemas` |
| `rental-object.schema.ts` | ⚠️ DUPLICATE | Already in `@digilist/contracts` |
| `booking.schema.ts` | ⚠️ DUPLICATE | Already in `@digilist/contracts` |
| `user.schema.ts` | ⚠️ DUPLICATE | Already in `@digilist/contracts` |
| `tenant.schema.ts` | 🔒 STAYS LOCAL | API-specific tenant validation |
| `monitoring.schema.ts` | 🔒 STAYS LOCAL | Internal monitoring schemas |
| `calendar.schema.ts` | 🔒 STAYS LOCAL | API-specific calendar logic |
| `saas.schema.ts` | 📋 PENDING | Evaluate for migration |
| `events.schema.ts` | 📋 PENDING | Evaluate for migration |
| `idporten.schema.ts` | 🔒 STAYS LOCAL | Auth-specific schemas |
| `bankid.schema.ts` | 🔒 STAYS LOCAL | Auth-specific schemas |
| `vipps.schema.ts` | 🔒 STAYS LOCAL | Auth-specific schemas |

### Migration Guide

#### Before (deprecated)

```typescript
// ❌ Deprecated - importing from local schemas
import { CreateFavoriteSchema, PricingQuoteRequestSchema } from '../../schemas/favorites.schema';
import { CreatePriceRuleSchema } from '../../schemas/price-rules.schema';
```

#### After (recommended)

```typescript
// ✅ Recommended - importing from contracts package
import {
  CreateFavoriteSchema,
  PricingQuoteRequestSchema,
  CreatePriceRuleSchema,
  CreateUserGroupSchema,
} from '@digilist/contracts/schemas';
```

### What stays local?

Some API-specific schemas will remain local:

- `tenant.schema.ts` - Tenant-specific validation with secrets
- `monitoring.schema.ts` - Internal monitoring schemas
- `calendar.schema.ts` - API-specific calendar logic
- `idporten.schema.ts`, `bankid.schema.ts`, `vipps.schema.ts` - Auth provider schemas

### What has been migrated to @digilist/contracts?

The following schemas have been consolidated into `@digilist/contracts`:

1. **favorites.schema.ts** - Favorites/wishlist system schemas
2. **pricing.schema.ts** - Pricing quote calculation schemas
3. **price-rules.schema.ts** - Pricing rules and listing rules schemas
4. **user-group.schema.ts** - User group schemas for access control

### Benefits

1. **Shared validation** - API and SDK use same schemas
2. **Type consistency** - Types derived from same source
3. **OpenAPI generation** - Schemas generate API docs
4. **Breaking change detection** - CI detects contract changes
5. **Single source of truth** - No duplicate schema definitions

---

**Last Updated:** 2026-01-22
**Migration Phase:** API-1 Schema Consolidation
