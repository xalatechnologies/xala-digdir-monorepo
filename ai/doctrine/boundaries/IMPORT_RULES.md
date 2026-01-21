# Import Rules

> **What Can Import What**
> **Layer:** Boundaries

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────┐
│                        IMPORT PERMISSION MATRIX                      │
├─────────────────────────┬───────────┬───────────┬──────────┬────────┤
│                         │ Platform  │ Domain    │ Server   │ Tooling│
│         FROM →          │ Universal │ Universal │ Only     │ Only   │
│         INTO ↓          │           │           │          │        │
├─────────────────────────┼───────────┼───────────┼──────────┼────────┤
│ Platform Universal      │    ✅     │    ❌     │    ❌    │   ❌   │
│ Domain Universal        │    ✅     │    ✅     │    ❌    │   ❌   │
│ Server-Only             │    ✅     │    ✅     │    ✅    │   ❌   │
│ Tooling                 │    ✅     │    ✅     │    ✅    │   ✅   │
│ Domain Apps             │    ✅     │    ✅     │    ❌    │   ❌   │
│ Platform Apps           │    ✅     │    ❌     │    ❌    │   ❌   │
└─────────────────────────┴───────────┴───────────┴──────────┴────────┘
```

---

## Detailed Rules

### Platform Universal Packages

**Can import:**
```typescript
// ✅ Other platform universal packages
import { z } from 'zod';
import { Button } from '@digdir/designsystemet-react';
import { BaseService } from '@xalatechnologies/platform/sdk';
```

**Cannot import:**
```typescript
// ❌ Domain packages (FORBIDDEN)
import { BookingDTO } from '@digilist/domain';
import { useBookings } from '@digilist/sdk';
import { RentalObjectCard } from '@digilist/ui';

// ❌ Server-only packages (FORBIDDEN)
import { tenants } from '@xalatechnologies/platform-schema';
import { evaluateFlag } from '@xalatechnologies/enterprise/server';
```

### Domain Universal Packages

**Can import:**
```typescript
// ✅ Platform universal
import { BaseService } from '@xalatechnologies/platform/sdk';
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';

// ✅ Other domain universal
import { BookingDTO } from '@digilist/domain';
import { BookingService } from '@digilist/sdk';
```

**Cannot import:**
```typescript
// ❌ Server-only packages (FORBIDDEN)
import { rentalObjects } from '@digilist/database-schema';
import { tenants } from '@xalatechnologies/platform-schema';
```

### Domain Apps (web, minside, backoffice)

**Can import:**
```typescript
// ✅ Platform universal
import { Button } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/runtime';

// ✅ Domain universal
import { useBookings } from '@digilist/sdk/hooks';
import { RentalObjectCard } from '@digilist/ui';
```

**Cannot import:**
```typescript
// ❌ Server-only packages (FORBIDDEN)
import { tenants } from '@xalatechnologies/platform-schema';
import { rentalObjects } from '@digilist/database-schema';

// ❌ Direct @digdir (use @xalatechnologies/platform/ui)
import { Button } from '@digdir/designsystemet-react';
```

### Platform-Only Apps (saas-admin, monitoring-global, docs-global)

**Can import:**
```typescript
// ✅ Platform universal only
import { Button } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/runtime';
import { FeatureFlags } from '@xalatechnologies/enterprise';
```

**Cannot import:**
```typescript
// ❌ Domain packages (FORBIDDEN - these are platform-only apps)
import { useBookings } from '@digilist/sdk';
import { RentalObjectCard } from '@digilist/ui';

// ❌ Server-only packages (FORBIDDEN)
import { tenants } from '@xalatechnologies/platform-schema';
```

### Server Packages (api, platform-api)

**Can import:**
```typescript
// ✅ Platform universal
import { BookingDTO } from '@digilist/domain';

// ✅ Server-only packages
import { tenants, users } from '@xalatechnologies/platform-schema';
import { rentalObjects, bookings } from '@digilist/database-schema';
import { evaluateFlag } from '@xalatechnologies/enterprise/server';

// ✅ Node.js built-ins
import { readFile } from 'fs/promises';
import crypto from 'crypto';
```

---

## Alias Rules

### Banned Direct Imports

```typescript
// ❌ FORBIDDEN - Direct Designsystemet in apps
import { Button } from '@digdir/designsystemet-react';
import '@digdir/designsystemet-css';

// ✅ CORRECT - Use platform UI facade
import { Button } from '@xalatechnologies/platform/ui';
```

### Relative Import Depth

```typescript
// ❌ FORBIDDEN - Deep relative imports
import { something } from '../../../../shared/utils';

// ✅ CORRECT - Use package imports
import { something } from '@digilist/sdk/utils';
```

---

## ESLint Enforcement

### no-server-imports Rule

```javascript
// .eslintrc.js
{
  rules: {
    '@xalatechnologies/governance/no-server-imports': 'error'
  }
}
```

Triggers on:
- `@xalatechnologies/platform-schema` in frontend
- `@xalatechnologies/enterprise/server` in frontend
- `@digilist/database-schema` in frontend

### no-domain-imports Rule

```javascript
// For platform packages
{
  rules: {
    '@xalatechnologies/governance/no-domain-imports': 'error'
  }
}
```

Triggers on:
- `@digilist/*` in any `@xalatechnologies/*` package

---

## Verification Commands

```bash
# Check all import rules
pnpm verify:boundaries

# Check specific patterns
grep -r "@digilist" packages/platform/src && exit 1 || echo "OK: Platform clean"
grep -r "@xalatechnologies/platform-schema" apps/web/src && exit 1 || echo "OK: Frontend clean"
```
