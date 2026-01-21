# SDK-First Pattern

> **How to Access Data**
> **Layer:** Patterns

---

## Principle

**All data access goes through the SDK. No exceptions.**

```
┌───────────┐      ┌──────────────┐      ┌────────────┐
│   App     │ ───▶ │  SDK Hooks   │ ───▶ │    API     │
│ Component │      │  & Services  │      │   Server   │
└───────────┘      └──────────────┘      └────────────┘
     ❌
     │
     └───── FORBIDDEN: Direct fetch/axios ─────┘
```

---

## Correct Pattern

### Using SDK Hooks

```tsx
// ✅ CORRECT - Use SDK hooks
import { useBookings, useRentalObject } from '@digilist/sdk/hooks';

function BookingList() {
  const { data: bookings, isLoading, error } = useBookings({
    status: 'confirmed',
    fromDate: new Date(),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <ul>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </ul>
  );
}
```

### Using SDK Services

```tsx
// ✅ CORRECT - Use SDK services for mutations
import { bookingService } from '@digilist/sdk';

async function handleCreateBooking(data: CreateBookingInput) {
  try {
    const booking = await bookingService.create(data);
    toast.success(t('booking.created'));
    return booking;
  } catch (error) {
    if (isProblemDetails(error)) {
      toast.error(error.title);
    }
    throw error;
  }
}
```

---

## Forbidden Patterns

### Direct fetch()

```tsx
// ❌ FORBIDDEN - Direct fetch
function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch('/api/bookings')  // NEVER DO THIS
      .then(r => r.json())
      .then(setBookings);
  }, []);
}
```

### Direct axios

```tsx
// ❌ FORBIDDEN - Direct axios
import axios from 'axios';

async function createBooking(data) {
  const response = await axios.post('/api/bookings', data); // NEVER
  return response.data;
}
```

### React Query without SDK

```tsx
// ❌ FORBIDDEN - React Query with direct fetch
const { data } = useQuery({
  queryKey: ['bookings'],
  queryFn: () => fetch('/api/bookings').then(r => r.json()), // NEVER
});
```

---

## SDK Architecture

### Service Layer

```typescript
// @digilist/sdk/src/services/booking.service.ts
import { BaseService } from '@xalatechnologies/platform/sdk';

class BookingService extends BaseService {
  async list(params?: BookingListParams): Promise<BookingDTO[]> {
    return this.get('/api/domain/bookings', { params });
  }

  async create(data: CreateBookingInput): Promise<BookingDTO> {
    return this.post('/api/domain/bookings', data);
  }

  async cancel(id: string): Promise<void> {
    return this.post(`/api/domain/bookings/${id}/cancel`);
  }
}

export const bookingService = new BookingService();
```

### Hook Layer

```typescript
// @digilist/sdk/src/hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services';

export function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.list(params),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
    enabled: !!id,
  });
}
```

---

## When SDK Method Doesn't Exist

If the SDK lacks a method you need:

1. **STOP** - Do not bypass with direct fetch
2. **Check** - Is this a valid API endpoint?
3. **Add** - Create the SDK method first
4. **Use** - Then use the new SDK method

```typescript
// Step 1: Add to service
class BookingService extends BaseService {
  // New method
  async getAvailability(objectId: string, date: Date): Promise<Slot[]> {
    return this.get(`/api/domain/rental-objects/${objectId}/availability`, {
      params: { date: date.toISOString() },
    });
  }
}

// Step 2: Add hook
export function useAvailability(objectId: string, date: Date) {
  return useQuery({
    queryKey: ['availability', objectId, date],
    queryFn: () => bookingService.getAvailability(objectId, date),
    enabled: !!objectId && !!date,
  });
}

// Step 3: Use in component
const { data: slots } = useAvailability(objectId, selectedDate);
```

---

## Error Handling

SDK automatically handles RFC 7807 errors:

```typescript
import { isProblemDetails, ProblemDetails } from '@xalatechnologies/platform/sdk';

try {
  await bookingService.create(data);
} catch (error) {
  if (isProblemDetails(error)) {
    // Structured error with type, title, status, detail
    console.error(error.title); // "Slot no longer available"
    console.error(error.detail); // "The slot was booked by another user"
  }
}
```

---

## Caching & Invalidation

SDK hooks use React Query caching:

```typescript
// Automatic cache invalidation after mutation
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
```

---

## Verification

```bash
# Check for direct fetch in apps
grep -rE "fetch\(" apps/*/src --include="*.tsx" --include="*.ts" | grep -v node_modules

# Check for axios imports
grep -r "from 'axios'" apps/*/src --include="*.tsx" --include="*.ts"

# These should return empty if SDK-first is followed
```
