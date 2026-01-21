# Banned Imports

> **What NOT to Import**
> **Layer:** Anti-Patterns

---

## Category 1: Server-Only in Frontend

### The Pattern

```typescript
// ❌ BANNED - In apps/web, apps/minside, apps/backoffice, etc.
import { tenants, users } from '@xalatechnologies/platform-schema';
import { rentalObjects, bookings } from '@digilist/database-schema';
import { evaluateFlag } from '@xalatechnologies/enterprise/server';
```

### Why It's Banned

- Database schemas contain Drizzle ORM code requiring Node.js
- Server entrypoints may access secrets, file system, etc.
- Frontend bundles would include server code
- Security risk: exposes internal structure

### Detection

ESLint rule: `@xalatechnologies/governance/no-server-imports`

```bash
grep -r "@xalatechnologies/platform-schema" apps/web/src && echo "VIOLATION"
grep -r "@digilist/database-schema" apps/minside/src && echo "VIOLATION"
grep -r "enterprise/server" apps/backoffice/src && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Use SDK for data access
import { useUsers } from '@digilist/sdk/hooks';
import { useFeatureFlag } from '@xalatechnologies/enterprise';

// SDK handles API calls internally
const { data: users } = useUsers();
const isEnabled = useFeatureFlag('new-feature');
```

---

## Category 2: Direct Designsystemet in Apps

### The Pattern

```typescript
// ❌ BANNED - In any app
import { Button, Card, Heading } from '@digdir/designsystemet-react';
import '@digdir/designsystemet-css';
```

### Why It's Banned

- Bypasses platform UI facade
- Loses custom theme configuration
- Inconsistent component usage
- Hard to update across apps

### Detection

```bash
grep -r "@digdir/designsystemet" apps/*/src && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Use platform UI facade
import { Button, Card, Heading } from '@xalatechnologies/platform/ui';
```

---

## Category 3: Domain in Platform Packages

### The Pattern

```typescript
// ❌ BANNED - In any @xalatechnologies/* package
import { BookingDTO } from '@digilist/domain';
import { useBookings } from '@digilist/sdk';
import { RentalObjectCard } from '@digilist/ui';
```

### Why It's Banned

- Platform must be domain-agnostic
- Platform cannot depend on domain
- Prevents platform extraction
- Creates circular dependencies

### Detection

ESLint rule: `@xalatechnologies/governance/no-domain-imports`

```bash
grep -r "@digilist" packages/platform/src && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Platform provides base classes
// Domain extends platform
// packages/platform/src/sdk/base-service.ts
export class BaseService { ... }

// packages/digilist-sdk/src/services/booking.service.ts
import { BaseService } from '@xalatechnologies/platform/sdk';
export class BookingService extends BaseService { ... }
```

---

## Category 4: Domain in Platform-Only Apps

### The Pattern

```typescript
// ❌ BANNED - In apps/saas-admin, apps/monitoring-global, apps/docs-global
import { useBookings } from '@digilist/sdk';
import { RentalObjectCard } from '@digilist/ui';
import { BookingDTO } from '@digilist/domain';
```

### Why It's Banned

- These apps are platform-level (manage all tenants/domains)
- Must work without any specific domain installed
- Domain coupling prevents multi-product use

### Detection

```bash
grep -r "@digilist" apps/saas-admin/src && echo "VIOLATION"
grep -r "@digilist" apps/monitoring-global/src && echo "VIOLATION"
grep -r "@digilist" apps/docs-global/src && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Use platform-only packages
import { Button } from '@xalatechnologies/platform/ui';
import { useTenants } from '@xalatechnologies/platform/runtime';
import { FeatureFlags } from '@xalatechnologies/enterprise';
```

---

## Category 5: Re-exports Across Boundaries

### The Pattern

```typescript
// ❌ BANNED - In @digilist/database-schema
export * from '@xalatechnologies/platform-schema';
// This makes domain depend on platform AND re-expose it
```

### Why It's Banned

- Muddies ownership boundaries
- Makes dependency graph unclear
- Consumers can't tell where types come from
- Updates to platform affect domain unexpectedly

### Detection

```bash
grep -r "export \* from '@xalatechnologies" packages/schema/src && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Consumers import from both
// In consumer code:
import { tenants } from '@xalatechnologies/platform-schema';
import { rentalObjects } from '@digilist/database-schema';
```

---

## Category 6: Deep Relative Imports

### The Pattern

```typescript
// ❌ BANNED
import { something } from '../../../../shared/utils';
import { config } from '../../../config/index';
```

### Why It's Banned

- Fragile to refactoring
- Hard to understand dependency
- Should be in a package

### Detection

```bash
grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" apps packages && echo "VIOLATION"
```

### Correct Alternative

```typescript
// ✅ CORRECT - Use package imports
import { something } from '@digilist/sdk/utils';
import { config } from '@xalatechnologies/platform/config';
```

---

## Summary Table

| Import Pattern | Where Banned | Why |
|----------------|--------------|-----|
| `@xalatechnologies/platform-schema` | Frontend apps | Server-only |
| `@digilist/database-schema` | Frontend apps | Server-only |
| `*/enterprise/server` | Frontend apps | Server-only |
| `@digdir/designsystemet-*` | All apps | Use facade |
| `@digilist/*` | Platform packages | Platform is domain-agnostic |
| `@digilist/*` | Platform-only apps | These apps are domain-agnostic |
| `export * from '@xalatechnologies/*'` | Domain packages | No re-exports |
| `../../../*` | Everywhere | Use packages |

---

## Enforcement

All banned imports are enforced via:

1. **ESLint rules** - Immediate feedback in editor
2. **Pre-commit hooks** - Block commits with violations
3. **CI pipeline** - Fail builds with violations

```bash
# Run full verification
pnpm verify:boundaries
```
