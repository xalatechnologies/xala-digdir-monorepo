# @digilist/client-sdk - CLAUDE.md

This file provides guidance to Claude Code when working with the Domain SDK.

---

## Package Purpose

`@digilist/client-sdk` is the **primary integration layer** between frontend apps and the API. All frontend apps MUST use this SDK for API access - direct `fetch()` or `axios` calls are forbidden.

**Key Principles**:
1. SDK-FIRST - All API access goes through the SDK
2. Type-Safe - Full TypeScript with inferred types from @xala/contracts
3. Cached - React Query for efficient data management
4. Realtime - WebSocket support for live updates

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Frontend Apps                          │
│  apps/web, apps/backoffice, apps/minside        │
├─────────────────────────────────────────────────┤
│        @digilist/client-sdk (This Package)      │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────┐ │
│  │  Services   │ │    Hooks     │ │ Realtime │ │
│  │  (30+)      │ │   (50+)      │ │   WS     │ │
│  └─────────────┘ └──────────────┘ └──────────┘ │
│                      │                          │
│           ┌──────────┴──────────┐               │
│           │    API Router       │               │
│           │ (Platform vs Domain)│               │
│           └──────────┬──────────┘               │
├─────────────────────────────────────────────────┤
│              @xala/contracts                     │
│  Zod schemas, projections, TypeScript types     │
├─────────────────────────────────────────────────┤
│              @xala/sdk-core                      │
│  HTTP client, errors, retry, query keys         │
├──────────────────────┬──────────────────────────┤
│    Platform API      │      Domain API          │
│    Port 4001         │      Port 4000           │
│  - auth, authz       │  - rental-objects        │
│  - users, tenants    │  - bookings, calendar    │
│  - organizations     │  - seasons, reviews      │
│  - audit, GDPR       │  - pricing, allocations  │
│  - notifications     │  - conversations         │
│  - SaaS, billing     │  - dashboard, reports    │
└──────────────────────┴──────────────────────────┘
```

---

## Initialization

### Single API Mode (Legacy)
```typescript
import { initializeClient } from '@digilist/client-sdk';

// All requests go to a single API
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: 'oslo-kommune',
  defaultHeaders: {
    'Accept-Language': 'nb',
  },
});
```

### Dual API Mode (Recommended)
```typescript
import { initializeClient } from '@digilist/client-sdk';

// Requests are automatically routed to the correct API
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',          // Domain API
  platformApiUrl: import.meta.env.VITE_PLATFORM_API_URL || 'https://platform.digilist.no', // Platform API
  tenantId: 'oslo-kommune',
  defaultHeaders: {
    'Accept-Language': 'nb',
  },
});
```

### Local Development
```typescript
initializeClient({
  baseUrl: 'http://localhost:4000',          // Domain API
  platformApiUrl: 'http://localhost:4001',   // Platform API
  tenantId: 'test-tenant',
});
```

---

## API Routing

The SDK automatically routes requests to the correct API based on the endpoint path:

### Platform API Routes (port 4001)
- `/api/auth/*` - Authentication
- `/api/users/*`, `/api/me` - User management
- `/api/tenants/*`, `/api/tenant/*` - Tenant management
- `/api/organizations/*` - Organization management
- `/api/permissions/*`, `/api/roles/*` - RBAC
- `/api/audit/*`, `/api/gdpr/*` - Compliance
- `/api/notifications/*` - Notifications
- `/api/billing/*`, `/api/saas/*` - SaaS management
- `/api/integrations/*` - External integrations

### Domain API Routes (port 4000)
- `/api/rental-objects/*` - Rental objects
- `/api/bookings/*` - Bookings
- `/api/calendar/*`, `/api/availability/*` - Calendar
- `/api/seasons/*` - Seasons
- `/api/reviews/*`, `/api/favorites/*` - User engagement
- `/api/pricing/*` - Pricing
- `/api/dashboard/*`, `/api/reports/*` - Analytics

### Manual Route Checking
```typescript
import { isPlatformPath, isDomainPath } from '@digilist/client-sdk';

isPlatformPath('/api/auth/login');    // true
isPlatformPath('/api/bookings');       // false
isDomainPath('/api/rental-objects');   // true
isDomainPath('/api/users/me');         // false
```

---

## Services

Located in `src/services/`. Each service exports methods for API operations.

### Example: Booking Service
```typescript
import { getClient } from '@xala/sdk-core';
import type { 
  CreateBooking, 
  BookingProjection 
} from '@xala/contracts/projections';

export const bookingService = {
  async getBookings(params?: { page?: number; limit?: number }) {
    return getClient().get<{ data: BookingProjection[]; meta: PaginationMeta }>(
      '/api/bookings',
      { params }
    );
  },
  
  async getBooking(id: string) {
    return getClient().get<{ data: BookingProjection }>(`/api/bookings/${id}`);
  },
  
  async createBooking(data: CreateBooking) {
    return getClient().post<{ data: BookingProjection }>('/api/bookings', data);
  },
  
  async cancelBooking(id: string, reason?: string) {
    return getClient().post<{ data: BookingProjection }>(
      `/api/bookings/${id}/cancel`,
      { reason }
    );
  },
};
```

### Available Services

| Service | Module | Purpose |
|---------|--------|---------|
| `authService` | `use-auth` | Authentication, session |
| `bookingService` | `use-bookings` | Bookings CRUD |
| `rentalObjectService` | `use-rental-objects` | Listings management |
| `organizationService` | `use-organizations` | Organizations |
| `userService` | `use-organizations` | Users |
| `auditService` | `use-audit` | Audit logs |
| `capabilitiesService` | `use-capabilities` | RBAC capabilities |
| `notificationService` | `use-notifications` | Notifications |
| `conversationService` | `use-conversations` | Messaging |
| `reportsService` | `use-reports` | Reports & analytics |
| `gdprService` | `use-gdpr` | Data subject requests |
| `integrationService` | `use-integrations` | Third-party integrations |

---

## Hooks

Located in `src/hooks/`. Each hook wraps a service with React Query.

### Query Hooks
```typescript
import { useBookings, useBooking } from '@digilist/client-sdk/hooks';

function BookingList() {
  const { data, isLoading, error } = useBookings({ page: 1, limit: 20 });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <BookingTable bookings={data.data} />;
}

function BookingDetail({ id }: { id: string }) {
  const { data } = useBooking(id);
  return <BookingCard booking={data.data} />;
}
```

### Mutation Hooks
```typescript
import { useCreateBooking, useCancelBooking } from '@digilist/client-sdk/hooks';

function BookingForm() {
  const { mutate: createBooking, isPending } = useCreateBooking();
  
  const handleSubmit = (data: CreateBooking) => {
    createBooking(data, {
      onSuccess: (result) => {
        toast.success('Booking created!');
        navigate(`/bookings/${result.data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  
  return <Form onSubmit={handleSubmit} disabled={isPending} />;
}
```

### Capabilities Hooks
```typescript
import { 
  useBackofficeCapabilities, 
  useHasCapability 
} from '@digilist/client-sdk/hooks';

function AdminPanel() {
  const { data } = useBackofficeCapabilities();
  const canViewReports = useHasCapability('CAP_REPORTS_VIEW', 'backoffice');
  
  return (
    <Nav>
      <NavLink to="/dashboard">Dashboard</NavLink>
      {data?.data.uiHints?.showReports && (
        <NavLink to="/reports">Reports</NavLink>
      )}
      {canViewReports && <ReportsWidget />}
    </Nav>
  );
}
```

---

## Realtime WebSocket

```typescript
import { realtimeClient } from '@digilist/client-sdk';

// Connect
realtimeClient.connect({
  url: 'wss://api.digilist.no/ws',
  tenantId: 'oslo-kommune',
  token: accessToken,
  autoReconnect: true,
});

// Subscribe to events
realtimeClient.onBooking((event) => {
  if (event.type === 'BOOKING_CREATED') {
    queryClient.invalidateQueries(['bookings']);
  }
});

realtimeClient.onNotification((notification) => {
  showToast(notification);
});

// Disconnect on cleanup
realtimeClient.disconnect();
```

---

## Error Handling

All errors are RFC 7807 compliant using `ApiError` from `@xala/sdk-core`:

```typescript
import { ApiError } from '@xala/sdk-core';

try {
  await bookingService.createBooking(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      // Show field errors
      const emailErrors = error.getFieldErrors('email');
    } else if (error.isAuthError()) {
      // Redirect to login
      navigate('/login');
    } else if (error.isNotFoundError()) {
      // Show 404 page
    }
  }
}
```

---

## Query Keys

Query keys are generated using factories from `@xala/sdk-core`:

```typescript
import { createQueryKeyFactory } from '@xala/sdk-core/query';

export const bookingKeys = createQueryKeyFactory<{ status?: string }>('bookings');

// Usage
bookingKeys.all();                    // ['bookings']
bookingKeys.lists();                  // ['bookings', 'list']
bookingKeys.list({ status: 'pending' }); // ['bookings', 'list', { status: 'pending' }]
bookingKeys.detail('123');            // ['bookings', 'detail', '123']
```

---

## Testing

```bash
# Run all tests
pnpm test

# Specific test file
pnpm test -- --run src/__tests__/booking.test.ts

# Coverage report
pnpm test:coverage
```

---

## Non-Negotiable Rules

1. **SDK-FIRST** - Apps MUST use this SDK, never direct fetch
2. **TYPES FROM CONTRACTS** - Use @xala/contracts types
3. **CORE FROM SDK-CORE** - Use @xala/sdk-core utilities
4. **RFC 7807 ERRORS** - All errors use ApiError
5. **REACT QUERY** - All data fetching uses hooks

---

## Dependencies

```json
{
  "@xala/sdk-core": "workspace:^",
  "@xala/contracts": "workspace:^",
  "@tanstack/react-query": "^5.0.0"
}
```

---

## Deprecation Notice

Local types in `src/types/` are deprecated. Import from `@xala/contracts` instead:

```typescript
// ❌ Deprecated
import type { Booking } from '@digilist/client-sdk/types';

// ✅ Correct  
import type { BookingProjection } from '@xala/contracts/projections';
```

---

## 🔒 CRITICAL LESSONS LEARNED (2026-01-17)

> **⚠️ MANDATORY READING**
> 
> These lessons come from a 4-hour production debugging session that fixed critical authentication issues.
> **ALL developers working on packages/client-sdk MUST read these.**

### Required Reading

1. **`docs/architecture/AUTHENTICATION_SYSTEM.md`** (comprehensive)
   - Complete authentication flow
   - Cookie architecture
   - Database schema requirements
   - Troubleshooting guide

2. **`docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`** (detailed)
   - Root cause analysis
   - 10 critical lessons learned
   - Anti-patterns to avoid
   - Process improvements

3. **Root `CLAUDE.md`** → Critical Lessons Learned section

4. **Root `AI_RULES.md`** → Hard Lines section

### Recommended AI Skill for packages/client-sdk

When working on packages/client-sdk, use: **client-sdk-expert**

Available in: `.claude/skills/client-sdk-expert/`

### Critical Rules for packages/client-sdk

1. **Database Schema:** Tables MUST be in named schemas (platform, domain, compliance)
2. **Authentication:** System is LOCKED - no changes without approval
3. **Deployment:** Follow mandatory checklist in AI_RULES.md
4. **Testing:** Test authentication after ANY deployment
5. **Documentation:** Update docs when making significant changes

### Quick Validation

Before deploying changes to packages/client-sdk:

```bash
# 1. Verify database schemas
psql -d digilist_prod -c "\dn"

# 2. Rebuild if SDK changed
pnpm -F packages/client-sdk build

# 3. Test locally
pnpm -F packages/client-sdk dev

# 4. Deploy
# (Follow deployment checklist)

# 5. Test authentication
# - BankID login → Dashboard
# - Demo login → Dashboard
# - Check browser cookies
```

---

**Last Updated:** 2026-01-17
**Status:** Production Stable
**Next Review:** After significant changes
