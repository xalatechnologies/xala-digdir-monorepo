# Deprecation Notice

## Types in this directory are deprecated

As of v2.0, all type definitions should be imported from `@xala/contracts`.

### Migration Guide

#### Before (deprecated)

```typescript
// ❌ Deprecated - importing from local types
import type { RentalObject, Booking, User } from '@digilist/client-sdk/types';
```

#### After (recommended)

```typescript
// ✅ Recommended - importing from contracts package
import type { RentalObject, Booking, User } from '@xala/contracts/types';

// ✅ For projections (UI-ready DTOs)
import type { RentalObjectCardProjection } from '@xala/contracts/projections';
```

### Why?

1. **Single Source of Truth** - Types are derived from Zod schemas in `@xala/contracts`
2. **Schema-Agnostic** - DB schema changes don't affect SDK types
3. **OpenAPI Generation** - Types can be auto-generated from contracts
4. **API Validation** - Same schemas validate API requests and SDK responses

### Files to be removed in v3.0

- `rental-object.ts` → Use `@xala/contracts/schemas`
- `booking.ts` → Use `@xala/contracts/schemas`
- `organization.ts` → Use `@xala/contracts/schemas`
- `auth.ts` → Use `@xala/contracts/schemas`
- `projection-dtos.ts` → Use `@xala/contracts/projections`

### Timeline

- **v2.0** - Deprecation warnings added, re-exports from `@xala/contracts`
- **v2.5** - All new types added only to `@xala/contracts`
- **v3.0** - Local type files removed, breaking change
