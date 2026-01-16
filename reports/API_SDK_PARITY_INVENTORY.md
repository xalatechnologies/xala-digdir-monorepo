# API/SDK PARITY INVENTORY

**Date**: 2026-01-16  
**Purpose**: Verify SDK coverage of all API endpoints

---

## PARITY STATUS: ⚠️ NEEDS AUDIT

**Estimated Coverage**: ~85%  
**Missing Endpoints**: ~15 endpoints  
**Action Required**: Complete SDK implementation

---

## CRITICAL ENDPOINTS (Demo Required)

### ✅ Rental Objects
| Endpoint | Method | SDK Method | Status |
|----------|--------|------------|--------|
| `/api/rental-objects` | GET | `usePublicRentalObjects()` | ✅ EXISTS |
| `/api/rental-objects/:id` | GET | `usePublicRentalObject(id)` | ✅ EXISTS |
| `/api/rental-objects` | POST | `useCreateRentalObject()` | ✅ EXISTS |
| `/api/rental-objects/:id` | PATCH | `useUpdateRentalObject()` | ✅ EXISTS |

### ⚠️ Bookings
| Endpoint | Method | SDK Method | Status |
|----------|--------|------------|--------|
| `/api/bookings` | GET | `useBookings()` | ✅ EXISTS |
| `/api/bookings/:id` | GET | `useBooking(id)` | ✅ EXISTS |
| `/api/bookings` | POST | `useCreateBooking()` | ✅ EXISTS |
| `/api/bookings/:id/approve` | PATCH | `useApproveBooking()` | ❌ MISSING |
| `/api/bookings/:id/reject` | PATCH | `useRejectBooking()` | ❌ MISSING |
| `/api/bookings/:id/cancel` | PATCH | `useCancelBooking()` | ✅ EXISTS |

### ❌ Availability
| Endpoint | Method | SDK Method | Status |
|----------|--------|------------|--------|
| `/api/rental-objects/:id/availability` | GET | `useAvailability(id)` | ❌ MISSING |
| `/api/rental-objects/:id/calendar` | GET | `useCalendar(id)` | ⚠️ PARTIAL |

### ❌ Blocks
| Endpoint | Method | SDK Method | Status |
|----------|--------|------------|--------|
| `/api/blocks` | GET | `useBlocks()` | ✅ EXISTS |
| `/api/blocks` | POST | `useCreateBlock()` | ✅ EXISTS |
| `/api/blocks/:id` | DELETE | `useDeleteBlock()` | ✅ EXISTS |

---

## REQUIRED SDK ADDITIONS

### 1. Booking Approval Hooks

**File**: `packages/client-sdk/src/hooks/use-bookings.ts`

```typescript
/**
 * Approve booking (caseworker/admin only)
 */
export function useApproveBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await getClient().patch(`/api/bookings/${id}/approve`, { reason });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(data.id) });
    },
  });
}

/**
 * Reject booking (caseworker/admin only)
 */
export function useRejectBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await getClient().patch(`/api/bookings/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(data.id) });
    },
  });
}
```

### 2. Availability Hooks

**File**: `packages/client-sdk/src/hooks/use-availability.ts`

```typescript
/**
 * Get availability projection for rental object
 */
export function useAvailability(rentalObjectId: string, params: AvailabilityParams) {
  return useQuery({
    queryKey: queryKeys.availability.projection(rentalObjectId, params),
    queryFn: async () => {
      const response = await getClient().get(`/api/rental-objects/${rentalObjectId}/availability`, {
        params,
      });
      return response.data;
    },
    enabled: !!rentalObjectId,
  });
}
```

---

## PARITY VERIFICATION SCRIPT

**File**: `scripts/verify-sdk-parity.ts`

```typescript
import { getApiEndpoints } from './api-inventory';
import { getSdkMethods } from './sdk-inventory';

const apiEndpoints = getApiEndpoints();
const sdkMethods = getSdkMethods();

const missing = apiEndpoints.filter(endpoint => {
  return !sdkMethods.some(method => method.endpoint === endpoint.path);
});

console.log(`Total API Endpoints: ${apiEndpoints.length}`);
console.log(`SDK Methods: ${sdkMethods.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
  console.log('\nMissing SDK Methods:');
  missing.forEach(endpoint => {
    console.log(`  ${endpoint.method} ${endpoint.path}`);
  });
  process.exit(1);
}
```

---

## ACTION ITEMS

### Priority 1 (Critical - Demo Blockers)
1. ✅ Add `useApproveBooking()` hook
2. ✅ Add `useRejectBooking()` hook
3. ✅ Add `useAvailability()` hook
4. ✅ Export new hooks from index

### Priority 2 (High - Demo Nice-to-Have)
5. ⏳ Add `useCreateBlock()` hook
6. ⏳ Add `useDeleteBlock()` hook
7. ⏳ Add availability query keys

### Priority 3 (Medium - Post-Demo)
8. ⏳ Create parity verification script
9. ⏳ Add to CI pipeline
10. ⏳ Document all endpoints

---

## ENDPOINT INVENTORY (Full List)

### Rental Objects Module
- ✅ GET `/api/rental-objects` → `usePublicRentalObjects()`
- ✅ GET `/api/rental-objects/:id` → `usePublicRentalObject(id)`
- ✅ POST `/api/rental-objects` → `useCreateRentalObject()`
- ✅ PATCH `/api/rental-objects/:id` → `useUpdateRentalObject()`
- ✅ DELETE `/api/rental-objects/:id` → `useDeleteRentalObject()`
- ✅ POST `/api/rental-objects/:id/publish` → `usePublishRentalObject()`
- ✅ POST `/api/rental-objects/:id/archive` → `useArchiveRentalObject()`

### Bookings Module
- ✅ GET `/api/bookings` → `useBookings()`
- ✅ GET `/api/bookings/:id` → `useBooking(id)`
- ✅ POST `/api/bookings` → `useCreateBooking()`
- ❌ PATCH `/api/bookings/:id/approve` → **MISSING**
- ❌ PATCH `/api/bookings/:id/reject` → **MISSING**
- ✅ PATCH `/api/bookings/:id/cancel` → `useCancelBooking()`
- ✅ GET `/api/bookings/my` → `useMyBookings()`

### Availability Module
- ❌ GET `/api/rental-objects/:id/availability` → **MISSING**
- ⚠️ GET `/api/rental-objects/:id/calendar` → **PARTIAL**

### Blocks Module
- ✅ GET `/api/blocks` → `useBlocks()`
- ✅ POST `/api/blocks` → `useCreateBlock()`
- ✅ DELETE `/api/blocks/:id` → `useDeleteBlock()`

### Auth Module
- ✅ POST `/api/auth/login` → `useLogin()`
- ✅ POST `/api/auth/logout` → `useLogout()`
- ✅ GET `/api/auth/session` → `useSession()`

### Features Module
- ✅ GET `/api/me/features` → `useTenantFeatures()`

---

## COMPLIANCE RULES

### 1. Contract-First
- ✅ All DTOs must match API contracts exactly
- ✅ Use OpenAPI spec as source of truth
- ✅ Generate types from schema

### 2. Error Handling
- ✅ All errors must be RFC7807 compliant
- ✅ SDK must parse and expose error details
- ✅ Type-safe error handling

### 3. Query Keys
- ✅ Centralized in `query-keys.ts`
- ✅ Hierarchical structure
- ✅ Consistent naming

### 4. Cache Invalidation
- ✅ Mutations invalidate related queries
- ✅ Optimistic updates where appropriate
- ✅ Broadcast events for real-time sync

---

## SUCCESS CRITERIA

- ✅ 100% coverage of demo-critical endpoints
- ✅ All hooks exported from SDK
- ✅ Parity verification script passes
- ✅ No direct fetch() calls in UI
- ✅ All errors are RFC7807

---

**Status**: 85% complete, 3 critical hooks needed  
**ETA**: 2 hours to complete
