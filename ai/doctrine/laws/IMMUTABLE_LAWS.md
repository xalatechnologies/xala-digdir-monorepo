# Immutable Laws

> **Principles That NEVER Change**
> **Layer:** Laws (Highest authority)

---

## Law 1: Dependency Direction

**Platform flows DOWN. Domain flows UP.**

```
Platform → Domain → App
   ↓          ↓        ↓
 Provides  Extends  Consumes
```

**Corollary:** A package at layer N may only import from layers 0..N-1.

---

## Law 2: Single Source of Truth

Every piece of information has exactly ONE authoritative location:

| Information | Source of Truth |
|-------------|-----------------|
| API contracts | `@xala/contracts` or `@digilist/domain` |
| Database schema | `@xalatechnologies/platform-schema` + `@digilist/database-schema` |
| UI components | `@xalatechnologies/platform/ui` |
| Translations | `@xalatechnologies/platform/i18n` + domain overlays |
| Configuration | Environment variables + `@xalatechnologies/platform/config` |

---

## Law 3: Audit Trail Requirement

**All state mutations MUST be auditable.**

Required fields:
- `actor_id` - Who performed the action
- `action_type` - What was done
- `target_id` - What was affected
- `tenant_id` - In which tenant context
- `timestamp` - When it happened
- `ip_address` / `user_agent` - Origin information

**No exceptions. This is legally required.**

---

## Law 4: Contract-First Design

**Types are defined ONCE, at the contract layer.**

```typescript
// ✅ CORRECT - Type defined in contracts
// @xala/contracts or @digilist/domain
export interface BookingDTO { ... }

// ✅ CORRECT - Type imported in consumer
import { BookingDTO } from '@digilist/domain';

// ❌ FORBIDDEN - Type redefined locally
interface Booking { ... } // NEVER in apps
```

---

## Law 5: Presentation-Logic Separation

**UI renders. API decides.**

| Responsibility | Location |
|----------------|----------|
| Business rules | API / Domain services |
| Permissions check | API / RBAC layer |
| Data validation | API / Contract validators |
| Price calculation | API / Domain services |
| State transitions | API / State machines |
| **Rendering data** | UI components |
| **User input** | UI components |
| **Navigation** | UI components |

---

## Law 6: Multi-Tenancy Isolation

**Tenant data NEVER crosses boundaries.**

- All queries include `tenant_id` filter
- All mutations validate tenant ownership
- No global queries without explicit authorization
- Tenant context established at authentication

---

## Law 7: Error Transparency

**Errors MUST be structured, not arbitrary.**

RFC 7807 Problem Details format:
```json
{
  "type": "https://api.digilist.no/errors/booking/slot-unavailable",
  "title": "Time slot is no longer available",
  "status": 409,
  "detail": "The requested slot 14:00-15:00 was booked by another user"
}
```

---

## Law 8: Explicit Over Implicit

**No magic. All behavior MUST be traceable.**

- No auto-registration of routes
- No implicit dependency injection
- No convention-based file discovery
- All imports explicit
- All configurations explicit

---

## Law 9: Fail Fast Principle

**Errors surface at the earliest possible point.**

```typescript
// ✅ CORRECT - Validate at boundary
export function createBooking(data: unknown) {
  const parsed = BookingCreateSchema.parse(data); // Fails immediately
  return service.create(parsed);
}

// ❌ FORBIDDEN - Late validation
export function createBooking(data: any) {
  // ... lots of code ...
  if (!data.date) throw new Error('Missing date'); // Too late
}
```

---

## Law 10: Reproducibility

**Same input → Same output. Always.**

- No random behavior without seeding
- No time-dependent logic without clock injection
- No environment-dependent paths without configuration
- Tests MUST be deterministic
