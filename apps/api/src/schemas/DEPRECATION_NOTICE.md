# Deprecation Notice

## Schemas in this directory are being migrated

As of the schema-agnostic architecture update, all shared schemas should be imported from `@xala/contracts`.

### Migration Guide

#### Before (deprecated)

```typescript
// ❌ Deprecated - importing from local schemas
import { RentalObjectSchema, BookingSchema } from '../schemas';
```

#### After (recommended)

```typescript
// ✅ Recommended - importing from contracts package
import { RentalObjectSchema, BookingSchema } from '@xala/contracts/schemas';
import type { RentalObject, Booking } from '@xala/contracts/types';
```

### What stays local?

Some API-specific schemas will remain local:

- `tenant.schema.ts` - Tenant-specific validation with secrets
- `monitoring.schema.ts` - Internal monitoring schemas
- `calendar.schema.ts` - API-specific calendar logic

### What moves to @xala/contracts?

- `rental-object.schema.ts` - Core domain schemas
- `booking.schema.ts` - Core domain schemas
- `user.schema.ts` - Core domain schemas
- `organization.schema.ts` - Core domain schemas

### Benefits

1. **Shared validation** - API and SDK use same schemas
2. **Type consistency** - Types derived from same source
3. **OpenAPI generation** - Schemas generate API docs
4. **Breaking change detection** - CI detects contract changes
