# @digilist/client-sdk

The Client SDK is the official TypeScript client for interacting with the Xala Diglist API. It provides type-safe access to all API endpoints, handles authentication, and enforces contract compliance.

## Overview

The SDK is generated from the OpenAPI specification and provides:
- **Type-safe API calls** with full TypeScript support
- **Automatic authentication** handling
- **Projection DTOs** for direct consumption
- **React hooks** for common operations
- **Error handling** with RFC 7807 compliance

## Installation

```bash
# In your app directory
pnpm add @digilist/client-sdk
```

## Configuration

```tsx
// apps/backoffice/src/lib/sdk.ts
import { createSdk } from '@digilist/client-sdk';

export const sdk = createSdk({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3002',
  auth: {
    getToken: async () => {
      // Return JWT token
      return localStorage.getItem('jwt_token');
    },
    refreshToken: async () => {
      // Refresh token logic
    },
  },
});
```

## Core Features

### 1. Type Safety
All API responses are fully typed based on the OpenAPI specification:

```typescript
import type { 
  ListingProjectionDTO,
  BookingProjectionDTO,
  UserProjectionDTO 
} from '@digilist/client-sdk';

// Direct usage without transformation
const listing: ListingProjectionDTO = await sdk.listing.getById(id);
```

### 2. Authentication
Automatic token handling for authenticated requests:

```typescript
// Public endpoint - no auth required
const listings = await sdk.listing.findPublic();

// Authenticated endpoint - token automatically added
const myListings = await sdk.listing.findMy();
```

### 3. React Hooks
Pre-built hooks for common operations:

```tsx
import { useListings, useCreateBooking } from '@digilist/client-sdk/hooks';

function ListingList() {
  const { data: listings, isLoading, error } = useListings();
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return (
    <div>
      {listings?.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

## API Services

### Listing Service
```typescript
// Find listings
const listings = await sdk.listing.findMany({
  filter: { organizationId: 'org-123' },
  sort: { createdAt: 'desc' },
  pagination: { page: 1, limit: 20 }
});

// Get single listing
const listing = await sdk.listing.getById('listing-123');

// Create listing
const created = await sdk.listing.create({
  title: 'Meeting Room',
  description: 'Large meeting room with projector',
  // ... other fields
});

// Update listing
const updated = await sdk.listing.update('listing-123', {
  title: 'Updated Title'
});

// Delete listing
await sdk.listing.delete('listing-123');
```

### Booking Service
```typescript
// Create booking
const booking = await sdk.booking.create({
  listingId: 'listing-123',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T12:00:00Z',
  purpose: 'Team meeting'
});

// Find bookings
const bookings = await sdk.booking.findMany({
  filter: { userId: 'user-123' }
});

// Cancel booking
await sdk.booking.cancel('booking-123');
```

### User Service
```typescript
// Get current user
const user = await sdk.user.getCurrent();

// Update profile
await sdk.user.updateProfile({
  name: 'John Doe',
  email: 'john@example.com'
});

// Change role (admin only)
await sdk.user.changeRole('user-123', 'admin');
```

### Organization Service
```typescript
// Get organization
const org = await sdk.organization.getById('org-123');

// Update organization
await sdk.organization.update('org-123', {
  name: 'New Org Name',
  settings: { allowPublicBookings: true }
});
```

## Error Handling

The SDK provides structured error handling following RFC 7807:

```typescript
try {
  const listing = await sdk.listing.getById('invalid-id');
} catch (error) {
  if (error.isApiError) {
    // Type-safe error handling
    console.error('Error type:', error.type);
    console.error('Error title:', error.title);
    console.error('Error status:', error.status);
    console.error('Error details:', error.detail);
  }
}
```

## React Hooks Reference

### Query Hooks
```typescript
// Listings
const useListings = (filters?: ListingFilters) => UseQueryResult<ListingProjectionDTO[]>
const useListing = (id: string) => UseQueryResult<ListingProjectionDTO>
const useMyListings = () => UseQueryResult<ListingProjectionDTO[]>

// Bookings
const useBookings = (filters?: BookingFilters) => UseQueryResult<BookingProjectionDTO[]>
const useBooking = (id: string) => UseQueryResult<BookingProjectionDTO>
const useMyBookings = () => UseQueryResult<BookingProjectionDTO[]>

// Users
const useUsers = (filters?: UserFilters) => UseQueryResult<UserProjectionDTO[]>
const useUser = (id: string) => UseQueryResult<UserProjectionDTO>
const useCurrentUser = () => UseQueryResult<UserProjectionDTO>
```

### Mutation Hooks
```typescript
// Listings
const useCreateListing = () => UseMutationResult<ListingProjectionDTO, Error, CreateListingDTO>
const useUpdateListing = () => UseMutationResult<ListingProjectionDTO, Error, UpdateListingDTO>
const useDeleteListing = () => UseMutationResult<void, Error, string>

// Bookings
const useCreateBooking = () => UseMutationResult<BookingProjectionDTO, Error, CreateBookingDTO>
const useCancelBooking = () => UseMutationResult<void, Error, string>
```

## Query Keys

The SDK exports query keys for cache management:

```typescript
import { queryKeys } from '@digilist/client-sdk';

// Invalidate listings cache
queryClient.invalidateQueries({
  queryKey: queryKeys.listing.all
});

// Prefetch listing
queryClient.prefetchQuery({
  queryKey: queryKeys.listing.byId(id),
  queryFn: () => sdk.listing.getById(id)
});
```

## Advanced Usage

### Custom Fetch Options
```typescript
// Override default options
const listings = await sdk.listing.findMany({}, {
  timeout: 10000,
  retries: 3,
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

### Batch Operations
```typescript
// Batch create
const listings = await sdk.listing.batchCreate([
  { title: 'Room 1' },
  { title: 'Room 2' },
  { title: 'Room 3' }
]);

// Batch update
await sdk.listing.batchUpdate([
  { id: '1', title: 'Updated 1' },
  { id: '2', title: 'Updated 2' }
]);
```

### Real-time Updates
```typescript
// Subscribe to listing updates
const unsubscribe = sdk.listing.subscribe(id, (listing) => {
  console.log('Listing updated:', listing);
});

// Unsubscribe when done
unsubscribe();
```

## Testing

The SDK provides test utilities for mocking:

```typescript
import { createMockSdk, mockListing } from '@digilist/client-sdk/test';

// Mock SDK for tests
const mockSdk = createMockSdk({
  listing: {
    getById: jest.fn().mockResolvedValue(mockListing)
  }
});

// Use in component tests
render(<ListingCard listing={mockListing} sdk={mockSdk} />);
```

## Best Practices

### 1. Use Projection DTOs Directly
```typescript
// ✅ Correct - use DTO directly
function ListingCard({ listing }: { listing: ListingProjectionDTO }) {
  return <h2>{listing.title}</h2>;
}

// ❌ Wrong - don't transform
function ListingCard({ listing }: { listing: any }) {
  const model = toViewModel(listing); // Never do this!
  return <h2>{model.title}</h2>;
}
```

### 2. Handle Permissions
```typescript
function ListingActions({ listing }: { listing: ListingProjectionDTO }) {
  const canEdit = listing.permissions.canEdit;
  const canDelete = listing.permissions.canDelete;
  
  return (
    <>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </>
  );
}
```

### 3. Use Hooks for Data Fetching
```typescript
// ✅ Use hooks
function ListingList() {
  const { data: listings } = useListings();
  // render listings
}

// ❌ Don't use SDK directly in components
function ListingList() {
  const [listings, setListings] = useState([]);
  useEffect(() => {
    sdk.listing.findMany().then(setListings);
  }, []);
  // render listings
}
```

## Versioning

The SDK follows semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

API version is included in the SDK package name:
```typescript
import { createSdk } from '@digilist/client-sdk/v1';
```

## Migration Guide

### From v0 to v1
1. Update import paths
2. Use new hook names
3. Update error handling
4. Migrate to projection DTOs

See [Migration Guide](./migration-v1.md) for detailed instructions.

## Troubleshooting

### Common Issues

#### Authentication Errors
```typescript
// Check token is set
console.log(await sdk.auth.getToken());

// Refresh token
await sdk.auth.refreshToken();
```

#### Type Errors
```typescript
// Ensure you're using the latest types
import type { LatestProjectionDTO } from '@digilist/client-sdk';
```

#### Network Errors
```typescript
// Check connectivity
await sdk.health.check();

// View request logs
sdk.debug.enableLogs();
```

## Contributing

When contributing to the SDK:
1. Update OpenAPI spec first
2. Generate new types
3. Add tests for new features
4. Update documentation

## Related Documentation

- [API Documentation](../apps/04-api.md)
- [Contract-First Guide](../guides/01-contract-first.md)
- [Testing Strategy](../guides/02-testing.md)
