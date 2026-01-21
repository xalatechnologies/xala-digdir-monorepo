# Runbook: Fix Boundary Violation

> **Step-by-step guide for fixing boundary violations**
> **Layer:** Runbooks

---

## Detecting Violations

### Run Verification

```bash
# Full boundary check
pnpm verify:boundaries

# Check for specific patterns
grep -r "@digilist" packages/platform/src
grep -r "@xalatechnologies/platform-schema" apps/web/src
grep -r "@digdir/designsystemet" apps/*/src
```

### Common Violation Types

1. **Server import in frontend** - `@xalatechnologies/platform-schema` in app
2. **Domain import in platform** - `@digilist/*` in platform package
3. **Direct Designsystemet** - `@digdir/*` in app instead of platform UI
4. **Re-export across boundary** - Domain re-exporting platform

---

## Fix: Server Import in Frontend

### Problem

```typescript
// ❌ In apps/web/src/components/UserProfile.tsx
import { users } from '@xalatechnologies/platform-schema';

function UserProfile() {
  const user = users.findOne({ id }); // Direct DB access
}
```

### Solution

1. **Create/use SDK service**

```typescript
// packages/client-sdk/src/services/user.service.ts
import { BaseService } from '@xalatechnologies/platform/sdk';

class UserService extends BaseService {
  async getProfile(userId: string) {
    return this.get(`/api/platform/users/${userId}`);
  }
}

export const userService = new UserService();
```

2. **Create/use SDK hook**

```typescript
// packages/client-sdk/src/hooks/useUser.ts
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getProfile(userId),
  });
}
```

3. **Update component**

```typescript
// ✅ In apps/web/src/components/UserProfile.tsx
import { useUser } from '@digilist/sdk/hooks';

function UserProfile({ userId }) {
  const { data: user, isLoading } = useUser(userId);
  // Render using SDK data
}
```

---

## Fix: Domain Import in Platform

### Problem

```typescript
// ❌ In packages/platform/src/ui/patterns/BookingCard.tsx
import { BookingDTO } from '@digilist/domain';

export function BookingCard({ booking }: { booking: BookingDTO }) {
  // Domain-specific component in platform
}
```

### Solution

1. **Create generic platform pattern**

```typescript
// packages/platform/src/ui/patterns/ReservationCard.tsx
export interface ReservationCardProps {
  id: string;
  title: string;
  datetime: string;
  status: { label: string; color: string };
  location?: string;
  onClick?: () => void;
}

export function ReservationCard(props: ReservationCardProps) {
  // Generic implementation
}
```

2. **Create domain wrapper in feature kit**

```typescript
// packages/digilist-ui/src/features/booking/BookingCard.tsx
import { ReservationCard } from '@xalatechnologies/platform/ui/patterns';
import type { BookingDTO } from '@digilist/domain';

function mapBookingToReservation(booking: BookingDTO, t: TFunction) {
  return {
    id: booking.id,
    title: booking.rentalObjectName,
    datetime: booking.formattedDateTime,
    status: booking.displayStatus,
    location: booking.location?.address,
  };
}

export function BookingCard({ booking, t, onClick }) {
  const props = mapBookingToReservation(booking, t);
  return <ReservationCard {...props} onClick={onClick} />;
}
```

3. **Update imports in apps**

```typescript
// Before
import { BookingCard } from '@xala/ds'; // or platform

// After
import { BookingCard } from '@digilist/ui/features/booking';
```

---

## Fix: Direct Designsystemet Import

### Problem

```typescript
// ❌ In apps/web/src/pages/HomePage.tsx
import { Button, Card, Heading } from '@digdir/designsystemet-react';
import '@digdir/designsystemet-css';
```

### Solution

1. **Update imports to platform UI**

```typescript
// ✅ In apps/web/src/pages/HomePage.tsx
import { Button, Card, Heading } from '@xalatechnologies/platform/ui';
// CSS is imported once in main.tsx
```

2. **Ensure CSS is imported in entry point**

```typescript
// apps/web/src/main.tsx
import '@xalatechnologies/platform/ui/styles';
```

---

## Fix: Re-export Across Boundary

### Problem

```typescript
// ❌ In packages/digilist-schema/src/index.ts
export * from '@xalatechnologies/platform-schema';
export * from './domain';
```

### Solution

1. **Remove re-export**

```typescript
// ✅ In packages/digilist-schema/src/index.ts
// Domain tables ONLY - no platform re-export
export * from './domain';
```

2. **Update consumers to import from correct source**

```typescript
// In API code
import { tenants, users } from '@xalatechnologies/platform-schema';
import { rentalObjects, bookings } from '@digilist/database-schema';
```

---

## Verification After Fix

```bash
# 1. Run boundary check again
pnpm verify:boundaries

# 2. Build affected packages
pnpm build

# 3. Type check
pnpm typecheck

# 4. Run tests
pnpm test:run

# 5. Verify specific patterns are gone
grep -r "@digilist" packages/platform/src && echo "STILL BROKEN" || echo "FIXED"
```

---

## Prevention

### ESLint Rules

Ensure these rules are enabled:

```javascript
// .eslintrc.js
{
  rules: {
    '@xalatechnologies/governance/no-server-imports': 'error',
    '@xalatechnologies/governance/no-domain-imports': 'error',
    '@xalatechnologies/governance/no-banned-terms': 'error',
  }
}
```

### Pre-commit Hook

```bash
# .husky/pre-commit
pnpm verify:boundaries || exit 1
```

### CI Pipeline

```yaml
# .github/workflows/ci.yml
- name: Boundary Check
  run: pnpm verify:boundaries
```

---

## Common Mistakes When Fixing

### Mistake 1: Moving logic to wrong layer

```typescript
// ❌ Moving DB logic from component to another component
// Still wrong - logic should be in API/SDK

// ✅ Move to SDK service, expose via hook
```

### Mistake 2: Creating wrapper that's too thick

```typescript
// ❌ 200+ line "wrapper" with business logic
// That's not a wrapper, it's a new component with logic

// ✅ Wrapper should be <50 lines, just mapping props
```

### Mistake 3: Using `any` to avoid type issues

```typescript
// ❌ Using any to make imports work
import { something } from '@digilist/domain' as any;

// ✅ Fix the actual boundary, use proper types
```

---

## Escalation

If you can't fix a boundary violation:

1. Check if the API endpoint exists
2. Check if the SDK service exists
3. If neither → the feature may need backend work first
4. Document the gap and create a task for backend team
