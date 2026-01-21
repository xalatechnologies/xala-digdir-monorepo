# Domain Leak Anti-Pattern

> **Keep Domain Out of Platform**
> **Layer:** Anti-Patterns

---

## The Anti-Pattern

Domain-specific concepts appearing in platform-level code.

```typescript
// ❌ DOMAIN LEAK - Platform code mentioning domain concepts
// packages/platform/src/ui/patterns/BookingCard.tsx
export function BookingCard({ booking }: { booking: BookingDTO }) {
  // "Booking" is a domain concept
  return <Card>{booking.rentalObjectName}</Card>;
}
```

---

## Why It's Harmful

1. **Platform cannot be extracted** - Domain code tangled in platform
2. **Not reusable** - Other domains can't use the platform
3. **Tight coupling** - Platform changes affect domain and vice versa
4. **Vocabulary pollution** - Platform uses domain terms

---

## Types of Domain Leaks

### 1. Domain Terms in Platform

```typescript
// ❌ DOMAIN LEAK - Platform using domain vocabulary
// packages/platform/src/ui/components/ListingCard.tsx
export function ListingCard({ listing }) { ... }

// packages/platform/src/sdk/BookingService.ts
export class BookingService { ... }
```

**Correct:**

```typescript
// ✅ CORRECT - Platform uses generic vocabulary
// packages/platform/src/ui/patterns/ResourceCard.tsx
export function ResourceCard({ resource }: ResourceCardProps) { ... }

// packages/platform/src/sdk/BaseService.ts
export class BaseService { ... }
```

### 2. Domain Types in Platform

```typescript
// ❌ DOMAIN LEAK - Platform importing domain types
// packages/platform/src/hooks/useBookings.ts
import { BookingDTO } from '@digilist/domain';

export function useBookings(): BookingDTO[] { ... }
```

**Correct:**

```typescript
// ✅ CORRECT - Domain extends platform base
// packages/platform/src/hooks/useResources.ts
export function useResources<T>(): T[] { ... }

// packages/digilist-sdk/src/hooks/useBookings.ts
import { useResources } from '@xalatechnologies/platform/sdk';
import { BookingDTO } from '@digilist/domain';

export function useBookings() {
  return useResources<BookingDTO>('/api/domain/bookings');
}
```

### 3. Domain Business Rules in Platform

```typescript
// ❌ DOMAIN LEAK - Business rules in platform
// packages/platform/src/validators/booking.ts
export function validateBooking(data: unknown) {
  // These are Digilist-specific booking rules
  if (data.duration < 1) throw new Error('Min 1 hour');
  if (data.duration > 8) throw new Error('Max 8 hours');
}
```

**Correct:**

```typescript
// ✅ CORRECT - Platform provides generic validation infrastructure
// packages/platform/src/validators/index.ts
export function createValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown) => schema.parse(data);
}

// packages/digilist-domain/src/validators/booking.ts
import { createValidator } from '@xalatechnologies/platform';
import { BookingCreateSchema } from './schemas';

export const validateBooking = createValidator(BookingCreateSchema);
```

### 4. Domain UI in Platform

```typescript
// ❌ DOMAIN LEAK - Domain-specific UI in platform
// packages/platform/src/ui/blocks/BookingFormModal.tsx
export function BookingFormModal({ rentalObject, onBook }) {
  // This knows about rental objects and booking flow
}
```

**Correct:**

```typescript
// ✅ CORRECT - Platform provides generic pattern
// packages/platform/src/ui/patterns/FormWizardModal.tsx
export function FormWizardModal({ steps, onSubmit }) { ... }

// packages/digilist-ui/src/features/booking/BookingFormModal.tsx
import { FormWizardModal } from '@xalatechnologies/platform/ui/patterns';

export function BookingFormModal({ rentalObject, onBook }) {
  const steps = buildBookingSteps(rentalObject);
  return <FormWizardModal steps={steps} onSubmit={onBook} />;
}
```

---

## Banned Terms in Platform

These terms MUST NOT appear in `@xalatechnologies/*` packages:

| Banned Term | Generic Alternative |
|-------------|---------------------|
| `listing` | `resource`, `item` |
| `facility` | `feature`, `amenity` |
| `booking` | `reservation`, `slot` |
| `rentalObject` | `resource` |
| `kommune` | `organization`, `tenant` |
| `season` | `period`, `cycle` |

**Enforcement:**

```bash
# Check for banned terms
pnpm verify:terms
```

ESLint rule: `@xalatechnologies/governance/no-banned-terms`

---

## Detection Checklist

Ask these questions when reviewing platform code:

1. **Would this code make sense in a different domain?**
   - If NO → it's a domain leak

2. **Does the name reference a specific business concept?**
   - "Booking", "Listing", "Season" → domain leak
   - "Resource", "Item", "Period" → platform OK

3. **Does it import from `@digilist/*`?**
   - If YES → domain leak

4. **Could we remove Digilist and still use this code?**
   - If NO → domain leak

---

## Migration Path

When you find a domain leak:

### Step 1: Identify the Generic Pattern

```typescript
// Current (domain leak)
function BookingCard({ booking }: { booking: BookingDTO }) { ... }

// Generic version
function ResourceCard({ resource }: ResourceCardProps) { ... }
```

### Step 2: Create Platform Pattern

Move to `packages/platform/src/ui/patterns/` with generic props.

### Step 3: Create Domain Wrapper

Create thin wrapper in `packages/digilist-ui/src/features/`:

```typescript
// packages/digilist-ui/src/features/booking/BookingCard.tsx
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import { mapBookingToResource } from './mappers';

export function BookingCard({ booking }) {
  return <ResourceCard resource={mapBookingToResource(booking)} />;
}
```

### Step 4: Update Consumers

```typescript
// Before
import { BookingCard } from '@xala/ds';

// After
import { BookingCard } from '@digilist/ui/features/booking';
```

---

## Verification

```bash
# Check platform for domain terms
grep -rE "(listing|facility|booking|rentalObject|kommune|season)" packages/platform/src

# Check platform for domain imports
grep -r "@digilist" packages/platform/src

# Run full verification
pnpm verify:boundaries
pnpm verify:terms
```
