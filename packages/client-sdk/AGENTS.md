# @digilist/client-sdk - AGENTS.md

Guidance for agentic coding assistants working with the Domain SDK.

## Package Overview

`@digilist/client-sdk` is the **domain-specific SDK** for the Xala/Digilist platform. It provides:

- **30+ Services** - Business domain operations
- **50+ React Query Hooks** - Data fetching and mutations
- **WebSocket Realtime** - Live updates
- **Type-Safe APIs** - Full TypeScript support

## Architecture

```
@digilist/client-sdk
├── Depends on: @xala/sdk-core (HTTP, errors, retry)
├── Depends on: @xala/contracts (types, projections)
└── Exports: services, hooks, types
```

## Module Structure

```
packages/client-sdk/
├── src/
│   ├── core/             # Re-exports from @xala/sdk-core
│   ├── services/         # Domain services (30+)
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts
│   │   ├── rental-object.service.ts
│   │   └── ...
│   ├── hooks/            # React Query hooks (50+)
│   │   ├── use-auth.ts
│   │   ├── use-bookings.ts
│   │   ├── use-rental-objects.ts
│   │   └── ...
│   ├── realtime/         # WebSocket client
│   ├── types/            # Re-exports from @xala/contracts
│   └── index.ts
├── package.json
└── tsup.config.ts
```

## Essential Commands

```bash
# Build package
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Watch mode
pnpm dev
```

## Key Dependencies

```json
{
  "dependencies": {
    "@xala/sdk-core": "workspace:^",
    "@xala/contracts": "workspace:^",
    "@tanstack/react-query": ">=5.0.0"
  }
}
```

## Code Style Guidelines

### Services Pattern
```typescript
// Services are pure functions that use the HTTP client
export const bookingService = {
  async getBookings(params?: QueryParams) {
    return getClient().get<BookingProjection[]>('/api/bookings', { params });
  },
  
  async createBooking(data: CreateBooking) {
    return getClient().post<BookingProjection>('/api/bookings', data);
  },
};
```

### Hooks Pattern
```typescript
// Hooks wrap services with React Query
export function useBookings(params?: QueryParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingService.getBookings(params),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
  });
}
```

### Type Imports
```typescript
// Types from @xala/contracts
import type { 
  CreateBooking,
  BookingProjection 
} from '@xala/contracts/projections';

// Core utilities from @xala/sdk-core
import { getClient, ApiError } from '@xala/sdk-core';
```

## Import Rules

### ✅ Correct Imports
```typescript
// Core utilities
import { getClient, ApiError } from '@xala/sdk-core';
import { withRetry } from '@xala/sdk-core/retry';

// Types
import type { BookingProjection } from '@xala/contracts/projections';
import { CreateBookingSchema } from '@xala/contracts/schemas';
```

### ❌ Wrong Imports
```typescript
// Don't use fetch directly
import fetch from 'node-fetch';  // ❌

// Don't define types locally (use contracts)
interface Booking { ... }  // ❌
```

## When Modifying This Package

1. **Use @xala/sdk-core for HTTP** - Don't implement custom fetch
2. **Use @xala/contracts for types** - Don't duplicate type definitions
3. **Follow hooks pattern** - Use React Query consistently
4. **Update tests** - All services and hooks need tests
5. **Rebuild after changes** - `pnpm build`

## Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test -- --run src/__tests__/booking.test.ts

# Coverage
pnpm test:coverage
```

## Common Services

| Service | Purpose |
|---------|---------|
| `authService` | Authentication |
| `bookingService` | Booking CRUD |
| `rentalObjectService` | Listing management |
| `organizationService` | Organizations |
| `userService` | User management |
| `auditService` | Audit log queries |
| `notificationService` | Notifications |
| `reportsService` | Analytics |
