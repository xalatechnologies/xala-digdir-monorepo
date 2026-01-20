# DigiList SDK Rules

> **LLM Training Document**
> **Purpose:** SDK usage rules for AI agents
> **Last Updated:** 2026-01-20

---

## Core Rule

**All data access MUST go through `@digilist/client-sdk`.** Direct fetch/axios is FORBIDDEN.

```tsx
// ✅ ONLY THIS
import { useBookings, useCreateBooking } from '@digilist/client-sdk';

// ❌ NEVER THIS  
await fetch('/api/bookings');
await axios.get('/api/users');
```

---

## SDK Structure

```
packages/client-sdk/
├── src/
│   ├── services/         # API service classes
│   ├── hooks/            # React Query hooks
│   ├── providers/        # RealtimeProvider
│   ├── types/            # TypeScript types
│   └── index.ts          # Exports
```

---

## Hook Patterns

### Query Hooks (Read)

```tsx
import { useBookings, useBookingById, useRentalObjects } from '@digilist/client-sdk';

// List
const { data: bookings, isLoading, error } = useBookings();

// With filters
const { data } = useBookings({ status: 'pending', limit: 10 });

// By ID
const { data: booking } = useBookingById(id);

// Dependent query
const { data: rentalObject } = useRentalObjectById(booking?.rentalObjectId, {
  enabled: !!booking?.rentalObjectId,
});
```

### Mutation Hooks (Write)

```tsx
import { useCreateBooking, useUpdateBooking, useCancelBooking } from '@digilist/client-sdk';

// Create
const createBooking = useCreateBooking();
await createBooking.mutateAsync({
  title: 'Team Meeting',
  rentalObjectId: '123',
  startTime: new Date(),
});

// Update
const updateBooking = useUpdateBooking();
await updateBooking.mutateAsync({
  id: '123',
  data: { title: 'Updated Title' },
});

// Delete/Cancel
const cancelBooking = useCancelBooking();
await cancelBooking.mutateAsync({
  id: '123',
  reason: 'User requested',
});
```

---

## DTO Usage

### Import from Contracts

```tsx
import type { 
  BookingDTO,
  BookingCardProjection,
  CreateBookingInput,
  UpdateBookingInput,
} from '@xala/contracts';
```

### No Local Types

```tsx
// ❌ FORBIDDEN
interface Booking {
  id: string;
  title: string;
  // ...
}

// ✅ CORRECT
import type { BookingDTO } from '@xala/contracts';
```

---

## Error Handling

### RFC 7807 Format

All API errors follow RFC 7807:

```typescript
interface ProblemDetails {
  type: string;         // Error type URI
  title: string;        // Human-readable title
  status: number;       // HTTP status
  detail?: string;      // Explanation
  errors?: Record<string, string[]>; // Field errors
}
```

### Error Categories

```typescript
type ErrorCategory =
  | 'validation'    // 400
  | 'auth'          // 401
  | 'forbidden'     // 403
  | 'not_found'     // 404
  | 'conflict'      // 409
  | 'server'        // 500
  | 'network';      // Connection failed
```

### Handling Pattern

```tsx
import { parseApiError } from '@digilist/client-sdk';

const { data, error } = useBookings();

if (error) {
  const parsed = parseApiError(error);
  
  switch (parsed.category) {
    case 'auth':
      navigate('/login');
      break;
    case 'forbidden':
      return <AccessDenied />;
    case 'not_found':
      return <NotFound />;
    default:
      return <ErrorScreen error={parsed} />;
  }
}
```

---

## Cache Management

### Query Key Patterns

```typescript
// Standard keys
['bookings']                    // List
['bookings', { status: 'pending' }] // Filtered list
['booking', id]                 // Single item
['rentalObjects']               // List
['rentalObject', slug]          // By slug
```

### Automatic Invalidation

SDK mutations auto-invalidate:

```typescript
// useCreateBooking invalidates ['bookings']
// useUpdateBooking invalidates ['booking', id], ['bookings']
// useCancelBooking invalidates ['booking', id], ['bookings']
```

### Manual Invalidation

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific
queryClient.invalidateQueries(['bookings']);

// Invalidate pattern
queryClient.invalidateQueries(['booking']);
```

---

## Realtime Integration

### RealtimeProvider

```tsx
// Already in RuntimeProvider, but if needed directly:
import { RealtimeProvider } from '@digilist/client-sdk';

<RealtimeProvider
  wsUrl={import.meta.env.VITE_WS_URL}
  tenantId={import.meta.env.VITE_TENANT_ID}
>
  {children}
</RealtimeProvider>
```

### Realtime Events

```tsx
import { useRealtimeBookings } from '@digilist/client-sdk';

// Subscribes to booking updates
const { data: bookings } = useRealtimeBookings();
// Automatically updates when WebSocket receives events
```

---

## Service Patterns

### For Custom Logic

```tsx
import { bookingService } from '@digilist/client-sdk/services';

// Direct service call (rare, prefer hooks)
const booking = await bookingService.getById(id);
const bookings = await bookingService.list({ status: 'pending' });
```

---

## Available Hooks

### Bookings
```tsx
useBookings()
useBookingById(id)
useCreateBooking()
useUpdateBooking()
useCancelBooking()
useConfirmBooking()
```

### Rental Objects
```tsx
useRentalObjects()
useRentalObjectBySlug(slug)
useRentalObjectById(id)
useCreateRentalObject()
useUpdateRentalObject()
```

### Users
```tsx
useCurrentUser()
useUsers()
useUserById(id)
```

### Organizations
```tsx
useOrganizations()
useOrganizationById(id)
useOrganizationMembers(orgId)
```

### Calendar
```tsx
useCalendarEvents(rentalObjectId, dateRange)
useAvailability(rentalObjectId, date)
```

### Messages
```tsx
useConversations()
useConversationById(id)
useMessages(conversationId)
useSendMessage()
```

---

## SDK Rules Summary

| Rule | Description |
|------|-------------|
| No fetch/axios | Use SDK hooks |
| No local types | Import from @xala/contracts |
| No transformation | Use projections directly |
| No manual cache | SDK handles invalidation |
| Handle errors | Use parseApiError |

---

## Adding New Hooks

When API adds new endpoint:

### 1. Add Service Method
```typescript
// services/booking.service.ts
async getUpcoming(): Promise<BookingDTO[]> {
  return this.get('/bookings/upcoming');
}
```

### 2. Add Hook
```typescript
// hooks/useUpcomingBookings.ts
export function useUpcomingBookings() {
  return useQuery({
    queryKey: ['bookings', 'upcoming'],
    queryFn: () => bookingService.getUpcoming(),
  });
}
```

### 3. Export
```typescript
// index.ts
export { useUpcomingBookings } from './hooks/useUpcomingBookings';
```
