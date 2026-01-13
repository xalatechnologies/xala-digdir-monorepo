# @digilist/client-sdk

Type-safe SDK for the Digilist Backoffice API with React Query hooks.

## Features

- 🔒 **Type-safe** - Full TypeScript support with comprehensive type definitions
- ⚡ **React Query Integration** - Built-in hooks with smart caching and
  invalidation
- 🏗️ **SOLID Architecture** - Modular services following clean architecture
  principles
- 🇳🇴 **Norwegian Integrations** - Support for BankID, Vipps, BRREG, NIF, and
  more
- 📦 **Tree-shakable** - Import only what you need

## Installation

```bash
npm install @digilist/client-sdk

# Peer dependencies (if using React hooks)
npm install @tanstack/react-query react
```

## Quick Start

### Initialize the Client

```typescript
import { initializeClient } from "@digilist/client-sdk";

initializeClient({
    baseUrl: "https://api.digilist.no",
    tenantId: "your-tenant-id",
    onUnauthorized: () => {
        // Handle 401 errors (e.g., redirect to login)
        window.location.href = "/login";
    },
});
```

### Using Services Directly

```typescript
import { bookingService, listingService } from "@digilist/client-sdk";

// Get listings
const { data, meta } = await listingService.getAll({
    type: "SPACE",
    limit: 10,
});

// Create a booking
const booking = await bookingService.create({
    listingId: "listing-123",
    startTime: "2026-01-15T10:00:00Z",
    endTime: "2026-01-15T12:00:00Z",
});
```

### Using React Query Hooks

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateBooking, useListings } from "@digilist/client-sdk";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ListingsPage />
        </QueryClientProvider>
    );
}

function ListingsPage() {
    const { data, isLoading, error } = useListings({ status: "published" });
    const createBooking = useCreateBooking();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ul>
            {data?.data.map((listing) => (
                <li key={listing.id}>
                    {listing.name} - {listing.pricing.basePrice}{" "}
                    {listing.pricing.currency}
                    <button
                        onClick={() =>
                            createBooking.mutate({
                                listingId: listing.id,
                                startTime: new Date(),
                                endTime: new Date(Date.now() + 3600000),
                            })}
                    >
                        Book Now
                    </button>
                </li>
            ))}
        </ul>
    );
}
```

## API Reference

### Core

```typescript
import {
    ApiError,
    clearAuthToken,
    getClient,
    initializeClient,
    setAuthToken,
    setTenantId,
} from "@digilist/client-sdk";
```

### Services

| Service                | Description                           |
| ---------------------- | ------------------------------------- |
| `authService`          | Authentication and session management |
| `listingService`       | Listing CRUD operations               |
| `publicListingService` | Public listing discovery (no auth)    |
| `bookingService`       | Booking management                    |
| `calendarService`      | Calendar events                       |
| `allocationService`    | Time slot allocations                 |
| `availabilityService`  | Availability checking                 |
| `organizationService`  | Organization management               |
| `userService`          | User management and GDPR              |
| `settingsService`      | Tenant settings                       |
| `rcoService`           | RCO access control                    |
| `vismaService`         | Visma ERP integration                 |
| `brregService`         | Norwegian business registry           |
| `nifService`           | Norwegian sports federation           |
| `vippsService`         | Vipps payments                        |
| `calendarSyncService`  | External calendar sync                |

### React Query Hooks

#### Auth

- `useSession()` - Get current session
- `useLogin()` - Login mutation
- `useLogout()` - Logout mutation
- `useAuthProviders()` - Get OAuth providers

#### Listings

- `useListings(params?)` - List listings
- `useListing(id)` - Get single listing
- `useListingBySlug(slug)` - Get by slug
- `useCreateListing()` - Create mutation
- `useUpdateListing()` - Update mutation
- `useDeleteListing()` - Delete mutation
- `usePublicListings(params?)` - Public listings (no auth)
- `useFeaturedListings()` - Featured listings

#### Bookings

- `useBookings(params?)` - List bookings
- `useBooking(id)` - Get single booking
- `useMyBookings(params?)` - Current user's bookings
- `useCreateBooking()` - Create mutation
- `useConfirmBooking()` - Confirm mutation
- `useCancelBooking()` - Cancel mutation
- `useBookingPricing(listingId, start, end)` - Calculate pricing
- `useCalendarEvents(params?)` - Calendar events
- `useAvailabilitySlots(params)` - Available time slots

#### Organizations & Users

- `useOrganizations(params?)` - List organizations
- `useOrganization(id)` - Get single organization
- `useUsers(params?)` - List users
- `useCurrentUser()` - Get current user
- `useConsents()` - GDPR consents
- `useExportData()` - GDPR data export

#### Integrations

- `useRcoStatus()` - RCO connection status
- `useRcoLocks()` - Connected locks
- `useGenerateAccessCode()` - Generate access code
- `useVismaStatus()` - Visma connection status
- `useVismaInvoices()` - List invoices
- `useBrregLookup(orgNumber)` - Lookup in BRREG
- `useVippsStatus()` - Vipps connection status
- `useInitiatePayment()` - Start Vipps payment

## Types

Import types directly:

```typescript
import type {
    Booking,
    BookingStatus,
    Listing,
    ListingQueryParams,
    Organization,
    User,
} from "@digilist/client-sdk/types";
```

## Error Handling

```typescript
import { ApiError } from "@digilist/client-sdk";

try {
    await bookingService.create(data);
} catch (error) {
    if (error instanceof ApiError) {
        console.error(`Error ${error.code}: ${error.message}`);
        console.error("Status:", error.status);
        console.error("Details:", error.details);
    }
}
```

## Configuration

```typescript
interface ApiClientConfig {
    baseUrl: string;
    tenantId?: string;
    licenseKey?: string;
    token?: string;
    timeout?: number;
    onUnauthorized?: () => void;
    onError?: (error: Error) => void;
    defaultHeaders?: Record<string, string>;
}
```

## License

MIT © Xala Technologies
