# SDK Architecture - Purpose & Design
## Understanding @xala/sdk-core, @digilist/client-sdk, and the Platform

---

## Question

**"Since we implemented everything in API, what is the purpose of xala-sdk or xala/platform?"**

---

## Architecture Overview

### The Three-Layer SDK Architecture

```
┌──────────────────────────────────────────────────────────────┐
│   Layer 5: Frontend Apps (web, backoffice, minside)         │
│   - Pure presentation & orchestration                        │
│   - NO business logic, NO data transformations               │
│   - Import hooks and use SDK services                        │
└────────────────────────┬─────────────────────────────────────┘
                         │ imports
                         ▼
┌──────────────────────────────────────────────────────────────┐
│   Layer 4: @digilist/client-sdk (Domain SDK)                 │
│   - 30+ domain services (bookingService, rentalObjectService)│
│   - 50+ React Query hooks (useBookings, useRentalObjects)    │
│   - WebSocket realtime client                                │
│   - Domain-specific business logic                           │
└────────────────────────┬─────────────────────────────────────┘
                         │ uses types from
                         ▼
┌──────────────────────────────────────────────────────────────┐
│   Layer 3: @xala/contracts (API Contracts)                   │
│   - Zod validation schemas                                   │
│   - Projection DTOs (UI-ready data shapes)                   │
│   - TypeScript types (shared between API and frontend)       │
└────────────────────────┬─────────────────────────────────────┘
                         │ depends on
                         ▼
┌──────────────────────────────────────────────────────────────┐
│   Layer 2: @xala/sdk-core (Generic Infrastructure)           │
│   - HTTP client (Fetch API wrapper)                          │
│   - RFC 7807 error handling (ApiError class)                 │
│   - Query key factory (React Query patterns)                 │
│   - Retry logic & Dead Letter Queue (DLQ)                    │
│   - Schema-agnostic, domain-independent utilities            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP requests to
                         ▼
┌──────────────────────────────────────────────────────────────┐
│   Layer 1: apps/api (Fastify Backend)                        │
│   - Business logic & domain rules                            │
│   - PostgreSQL + Drizzle ORM                                 │
│   - Authentication & RBAC                                    │
│   - Audit logging & compliance                               │
│   - Multi-tenant data isolation                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Why SDK? Six Critical Reasons

### 1. Type Safety & Contract Enforcement

**Problem Without SDK:**
```typescript
// ❌ No types, no validation, runtime errors
const response = await fetch('/api/bookings');
const bookings = await response.json(); // any type!
```

**Solution With SDK:**
```typescript
// ✅ Full TypeScript types, compile-time safety
import { useBookings } from '@digilist/client-sdk/hooks';

const { data: bookings, isLoading, error } = useBookings();
//      ^-- BookingProjection[] - IntelliSense, auto-completion!
```

**Files Involved:**
- `packages/contracts/src/projections/booking.ts` - Defines BookingProjection type
- `packages/client-sdk/src/hooks/use-bookings.ts` - Exports typed hook
- `apps/minside/src/routes/bookings.tsx` - Consumes typed data

---

### 2. Single Source of Truth (No Duplication)

**Problem Without SDK:**
```typescript
// ❌ Type definitions duplicated in every app
// apps/web/types.ts
interface Booking { id: string; userId: string; /* ... */ }

// apps/backoffice/types.ts
interface Booking { id: string; userId: string; /* ... */ } // DUPLICATE!

// apps/minside/types.ts
interface Booking { id: string; userId: string; /* ... */ } // DUPLICATE!
```

**Solution With SDK:**
```typescript
// ✅ One definition, imported everywhere
// packages/contracts/src/projections/booking.ts
export interface BookingProjection {
  id: string;
  userId: string;
  // ... defined ONCE
}

// All apps import the same type
import type { BookingProjection } from '@xala/contracts/projections';
```

**Benefit:** Change API response format → Update contract → All apps get new types automatically

---

### 3. Centralized Error Handling (RFC 7807)

**Problem Without SDK:**
```typescript
// ❌ Manual error parsing in every component
try {
  const response = await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(data) });
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 422) {
      // Handle validation errors
      error.errors.forEach(e => { /* ... */ });
    } else if (response.status === 401) {
      // Handle auth errors
      window.location.href = '/login';
    } else if (response.status >= 500) {
      // Handle server errors
      showErrorToast('Something went wrong');
    }
  }
} catch (error) {
  // Handle network errors
}
```

**Solution With SDK:**
```typescript
// ✅ Automatic RFC 7807 error handling
try {
  await bookingService.createBooking(data);
} catch (error) {
  if (error.isValidationError()) {
    // 422 - Show field errors
    const fieldErrors = error.getAllFieldErrors();
    showFieldErrors(fieldErrors);
  } else if (error.isAuthError()) {
    // 401 - Already handled by SDK (auto-refresh or redirect)
  } else if (error.isServerError()) {
    // 5xx - Show generic error
    showErrorToast(error.detail);
  }
}
```

**Files Involved:**
- `packages/sdk-core/src/errors/api-error.ts` - ApiError class with type guards
- `packages/sdk-core/src/http/fetch-client.ts` - Automatic error conversion
- `apps/api/src/utils/response.ts` - API returns RFC 7807 format

---

### 4. Authentication & Multi-Tenancy (Automatic Headers)

**Problem Without SDK:**
```typescript
// ❌ Manually add headers to every request
const response = await fetch('/api/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'X-Tenant-Id': 'oslo-kommune',
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});
```

**Solution With SDK:**
```typescript
// ✅ Configure once, works everywhere
initializeClient({
  baseUrl: 'https://api.digilist.no',
  tenantId: 'oslo-kommune',  // Automatic X-Tenant-Id header
  token: jwt,                 // Automatic Authorization header
});

// Now all SDK calls automatically include these headers
await bookingService.getAll(); // Headers added automatically!
```

**Files Involved:**
- `packages/sdk-core/src/http/fetch-client.ts` - Adds headers automatically (lines 46-73)
- `apps/minside/src/main.tsx` - Initializes client once at app startup

**Your Auth Fix Benefits This:**
- You added 401 interceptor in `fetch-client.ts` (lines 108-142)
- Now ALL SDK calls automatically refresh tokens on 401
- Frontend apps don't need to handle auth logic!

---

### 5. React Query Integration (Caching & State Management)

**Problem Without SDK:**
```typescript
// ❌ Manual state management, no caching, no refetching
const [bookings, setBookings] = useState<Booking[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  setIsLoading(true);
  fetch('/api/bookings')
    .then(r => r.json())
    .then(data => setBookings(data))
    .catch(e => setError(e))
    .finally(() => setIsLoading(false));
}, []); // When to refetch? How to invalidate cache?
```

**Solution With SDK:**
```typescript
// ✅ Automatic caching, background refetching, error handling
const { data: bookings, isLoading, error, refetch } = useBookings();

// React Query handles:
// - Caching (data persists across component remounts)
// - Background refetching (on window focus)
// - Automatic retry (on network errors)
// - Loading states (isLoading, isFetching)
// - Error states (error handling)
// - Optimistic updates (mutations)
```

**Files Involved:**
- `packages/client-sdk/src/hooks/use-bookings.ts` - useBookings hook
- `packages/sdk-core/src/query/key-factory.ts` - Query key management

---

### 6. Projection DTOs (Pre-Computed Data - No Transformers!)

**Problem Without SDK:**
```typescript
// ❌ Frontend does data transformation (FORBIDDEN in this codebase!)
const rentalObject = await fetch('/api/rental-objects/123').then(r => r.json());

// Frontend transforms data for UI (BAD!)
const displayPrice = `${rentalObject.price} NOK/${rentalObject.priceUnit === 'hour' ? 'time' : 'dag'}`;
const isAvailable = rentalObject.status === 'active' && rentalObject.bookings.length === 0;
const categoryLabel = rentalObject.category === 'sports' ? 'Sport og fritid' : 'Andre';
```

**Solution With SDK (Projection DTOs):**
```typescript
// ✅ API sends UI-ready data (projection DTOs)
interface RentalObjectCardProjection {
  id: string;
  name: string;
  priceDisplay: "100 NOK/time";        // ✅ Pre-formatted by API!
  categoryI18nKey: "rental.sports";    // ✅ Pre-computed translation key!
  isAvailable: boolean;                 // ✅ Pre-computed status!
  primaryImageUrl: string;              // ✅ Pre-selected image!
}

// Frontend ONLY renders (no logic, no transformations)
<Card>
  <img src={rentalObject.primaryImageUrl} />
  <h2>{rentalObject.name}</h2>
  <p>{rentalObject.priceDisplay}</p>
  <Badge>{t(rentalObject.categoryI18nKey)}</Badge>
  {rentalObject.isAvailable && <Button>Book nå</Button>}
</Card>
```

**Key Architecture Rule:**
```typescript
// ❌ FORBIDDEN - No transformers in frontend
function toCardModel(rentalObject) {
  return { displayName: rentalObject.name, /* ... */ };
}

// ✅ CORRECT - Use projection DTOs directly
function RentalObjectCard({ rentalObject }: { rentalObject: RentalObjectCardProjection }) {
  return <Card>{rentalObject.name}</Card>;
}
```

**Files Involved:**
- `packages/contracts/src/projections/rental-object.ts` - Projection DTOs
- `apps/api/src/modules/rental-objects/projection.mapper.ts` - API creates projections
- `apps/minside/src/features/rental-objects/RentalObjectCard.tsx` - Frontend renders projections

---

## What is "xala/platform"?

### Answer: There is No Separate "xala/platform" Package

Based on codebase search:
- ❌ No package named `@xala/platform`
- ❌ No directory named `platform/`

### "Platform" Likely Refers To:

1. **The Entire Monorepo Ecosystem**
   - Repository name: `xala-digdir-monorepo`
   - Contains: API, SDK, Frontend Apps, Design System
   - This IS the platform

2. **@xala/sdk-core (Generic Platform Utilities)**
   - Generic, schema-agnostic infrastructure
   - HTTP client, errors, retry, query keys
   - Reusable across any domain

3. **The API Backend (apps/api)**
   - The platform backend service
   - Handles business logic, data persistence

### Naming Convention

```
@xala/*        → Generic, reusable packages (sdk-core, contracts, ds, i18n)
@digilist/*    → Domain-specific packages (client-sdk for Digilist platform)
```

---

## Real-World Example: How Your Auth Fix Flows Through Architecture

### You Fixed Authentication in API Layer

**File Modified:** `apps/api/src/modules/auth/auth.controller.ts`
- ✅ Session endpoint self-verification
- ✅ Cache-Control headers on all auth endpoints
- ✅ JWT token validation

### SDK Automatically Benefits (No Code Changes Needed!)

**File Modified:** `packages/sdk-core/src/http/fetch-client.ts`
- ✅ 401 interceptor with automatic token refresh
- ✅ Sends cookies with `credentials: 'include'`
- ✅ Emits `auth:expired` event on final failure

### Contracts Define Data Shape

**Files:** `packages/contracts/src/schemas/auth.ts`
- ✅ AuthResponse type
- ✅ UserSession type
- ✅ LoginCredentials type

### Domain SDK Exposes Hooks

**Files:** `packages/client-sdk/src/hooks/use-auth.ts`
- ✅ `useAuth()` - Get current user
- ✅ `useLogin()` - Login mutation
- ✅ `useLogout()` - Logout mutation
- ✅ `useSession()` - Session query

### Apps Just Use It (Zero Auth Logic!)

**File:** `apps/minside/src/routes/login.tsx`
```typescript
const { login, isLoading } = useLogin();

const handleSubmit = async (data) => {
  await login(data); // That's it! SDK handles everything:
  // ✅ Sends request with correct headers
  // ✅ Handles errors (validation, auth, network)
  // ✅ Updates React Query cache
  // ✅ Triggers automatic token refresh if needed
};
```

**Result:** Your API authentication fixes automatically work in all three frontend apps without touching their code!

---

## Key Architectural Rules (From CLAUDE.md)

### SDK-FIRST RULE

```typescript
// ❌ FORBIDDEN - Never bypass SDK
const response = await fetch('/api/rental-objects');
const data = await response.json();

// ❌ FORBIDDEN - Never import axios or other HTTP libraries
import axios from 'axios';
await axios.get('/api/rental-objects');

// ✅ CORRECT - Always use SDK
import { useRentalObjects } from '@digilist/client-sdk/hooks';
const { data, isLoading } = useRentalObjects();
```

**Why This Rule Exists:**
1. **Consistency** - All apps use the same integration layer
2. **Type Safety** - Catch errors at compile time, not runtime
3. **Maintainability** - Update API contracts in one place
4. **Testability** - Mock SDK services, not HTTP calls
5. **Performance** - Built-in caching, retry, error handling
6. **Security** - Automatic auth headers, CSRF protection

---

## Summary

### The SDK Exists To:

✅ **Provide type-safe API access** - Full TypeScript types, IntelliSense
✅ **Eliminate boilerplate** - Auth, caching, errors handled automatically
✅ **Enforce architectural boundaries** - No direct fetch() allowed
✅ **Enable contract-first development** - API and frontend share types
✅ **Support projection DTOs** - No transformers in frontend
✅ **Centralize integration logic** - One place to fix, all apps benefit

### The SDK Does NOT Replace the API

The API is still the source of truth for:
- ✅ Business logic
- ✅ Data persistence
- ✅ Authentication & authorization
- ✅ Multi-tenant isolation
- ✅ Audit logging

The SDK is the **integration layer** between API and frontend apps.

### "xala/platform" Refers To:

- The entire monorepo system (xala-digdir-monorepo)
- Or specifically @xala/sdk-core (generic utilities)
- Not a separate package - it's the architecture itself

---

## Benefits You've Already Experienced

When you implemented the auth fix:

1. **Changed API** - Session endpoint, Cache-Control headers
2. **Updated SDK** - 401 interceptor, token refresh
3. **Zero Frontend Changes** - All 3 apps (web, backoffice, minside) automatically work!

This is the power of the SDK architecture: **Fix once, benefit everywhere.**

---

## Files Referenced

### SDK Core Layer
- `packages/sdk-core/src/http/fetch-client.ts` - HTTP client with auth
- `packages/sdk-core/src/errors/api-error.ts` - RFC 7807 errors
- `packages/sdk-core/src/query/key-factory.ts` - Query key management

### Contracts Layer
- `packages/contracts/src/projections/` - Projection DTOs
- `packages/contracts/src/schemas/` - Zod schemas

### Domain SDK Layer
- `packages/client-sdk/src/services/` - 30+ domain services
- `packages/client-sdk/src/hooks/` - 50+ React Query hooks

### API Layer
- `apps/api/src/modules/auth/` - Authentication module
- `apps/api/src/modules/bookings/` - Booking module
- `apps/api/src/modules/rental-objects/` - Rental object module

### Frontend Apps
- `apps/minside/src/routes/login.tsx` - Uses useLogin() hook
- `apps/backoffice/src/routes/dashboard.tsx` - Uses useBookings() hook
- `apps/web/src/features/rental-object-details/` - Uses useRentalObjects() hook

---

## Conclusion

**You asked:** "What is the purpose of xala-sdk if we implemented everything in API?"

**Answer:** The SDK is the **bridge** between your API and frontend apps. It provides:
- Type safety
- Automatic error handling
- Authentication & multi-tenancy
- React Query integration
- Projection DTOs (pre-computed data)

Without the SDK, every frontend app would need to:
- Duplicate type definitions
- Handle auth headers manually
- Parse API errors manually
- Manage caching & state manually
- Transform data for UI (FORBIDDEN in this codebase)

With the SDK, frontend apps are **pure presentation** - they just render data and orchestrate user interactions. All integration complexity is handled by the SDK.

**Your auth fix proves this:** You updated the API and SDK, and all three frontend apps automatically benefited without code changes!
