# Non-Negotiables

> **Rules That CANNOT Be Violated Under Any Circumstances**
> **Load Priority:** 2 (ALWAYS)

---

## Boundary Rules

### Rule 1: Platform Never Imports Domain

```typescript
// ❌ FORBIDDEN - Platform importing domain
// In ANY file under packages/platform/* or @xalatechnologies/*
import { anything } from '@digilist/sdk';
import { anything } from '@digilist/ui';
import { anything } from '@digilist/domain';
```

**Enforcement:** ESLint rule `@xalatechnologies/governance/no-domain-imports`

### Rule 2: Frontend Never Imports Server-Only

```typescript
// ❌ FORBIDDEN - In apps/web, apps/minside, apps/backoffice, etc.
import { anything } from '@xalatechnologies/platform-schema';
import { anything } from '@xalatechnologies/enterprise/server';
import { anything } from '@digilist/database-schema';
```

**Enforcement:** ESLint rule `@xalatechnologies/governance/no-server-imports`

### Rule 3: Domain Schema Does NOT Re-export Platform

```typescript
// ❌ FORBIDDEN - In @digilist/database-schema
export * from '@xalatechnologies/platform-schema'; // NEVER

// ✅ CORRECT - Separate imports for consumers
import { tenants } from '@xalatechnologies/platform-schema';
import { rentalObjects } from '@digilist/database-schema';
```

---

## Data Access Rules

### Rule 4: SDK-First (No Direct Fetch)

```typescript
// ❌ FORBIDDEN - In any app
const data = await fetch('/api/bookings');
const data = await axios.get('/api/bookings');

// ✅ CORRECT - Always use SDK
import { useBookings } from '@digilist/sdk/hooks';
const { data } = useBookings();
```

### Rule 5: Contract-First (No Local Types)

```typescript
// ❌ FORBIDDEN - In apps
type Booking = { id: string; date: Date; }; // Local type

// ✅ CORRECT - Import from contracts
import { BookingDTO } from '@digilist/domain';
```

---

## UI Rules

### Rule 6: Design System First (No Direct @digdir)

```typescript
// ❌ FORBIDDEN - In apps
import { Button } from '@digdir/designsystemet-react';

// ✅ CORRECT - Use platform UI
import { Button } from '@xalatechnologies/platform/ui';
```

### Rule 7: i18n First (No Hardcoded Strings)

```tsx
// ❌ FORBIDDEN
<Heading>Velkommen</Heading>
<Button>Submit</Button>

// ✅ CORRECT
const t = useT();
<Heading>{t('common.welcome')}</Heading>
<Button>{t('common.submit')}</Button>
```

---

## Architecture Rules

### Rule 8: Thin Apps (No Business Logic)

```tsx
// ❌ FORBIDDEN - Business logic in app
function BookingPage() {
  const canBook = user.role === 'admin' || user.permissions.includes('booking.create');
  const price = basePrice * (1 - discount) + fees;
  // ...
}

// ✅ CORRECT - Logic in SDK/API, app just orchestrates
function BookingPage() {
  const { canBook, calculatedPrice } = useBookingContext();
  // Just render based on SDK-provided values
}
```

### Rule 9: Audit-First (All Mutations Logged)

Every state mutation MUST have an audit trail:
- `who` - User ID
- `what` - Action type
- `when` - Timestamp
- `tenantId` - Tenant context
- `ip/ua` - Client info

### Rule 10: RFC 7807 (Problem Details)

All errors MUST conform to:

```typescript
interface ProblemDetails {
  type: string;    // URI identifying error
  title: string;   // Human-readable summary
  status: number;  // HTTP status
  detail?: string; // Explanation
}
```

---

## Banned Terms in Platform

The following terms are BANNED in platform packages:

| Banned | Use Instead |
|--------|-------------|
| `listing` | `rentalObject` |
| `facility` | `amenity` |

**Enforcement:** ESLint rule `@xalatechnologies/governance/no-banned-terms`

---

## Verification Commands

```bash
# Verify all boundaries
pnpm verify:boundaries

# Verify no banned terms in platform
pnpm verify:terms

# Full governance check
pnpm -F @xalatechnologies/governance verify
```

---

## Violation Response

If ANY of these rules cannot be satisfied:

1. **STOP** - Do not proceed with code generation
2. **REPORT** - Explain which rule blocks the task
3. **ASK** - Request guidance from user

**Never work around these rules. They exist for legal, security, and architectural integrity.**
