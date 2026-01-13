# @digilist/client-sdk

Enterprise-grade, type-safe SDK for the Digilist API with **24 services**,
**WebSocket real-time events**, and **React Query hooks**.

## Installation

```bash
npm install @digilist/client-sdk
# or
pnpm add @digilist/client-sdk
```

## Quick Start

```typescript
import {
    bookingService,
    initializeClient,
    listingService,
    realtimeClient,
} from "@digilist/client-sdk";

// Initialize client (call once at app startup)
initializeClient({
    baseUrl: "https://api.digilist.no",
    tenantId: "your-tenant-id",
});

// Use any service
const listings = await listingService.getAll();
const booking = await bookingService.create({
    listingId: "uuid",
    startTime: "2026-01-15T10:00:00Z",
    endTime: "2026-01-15T11:00:00Z",
});

// Real-time events
realtimeClient.connect({ url: "wss://api.digilist.no/ws/audit" });
realtimeClient.onAudit((event) => console.log("Audit:", event));
```

## Available Services (24)

### 🔐 Authentication

| Service       | Description                   | Role   |
| ------------- | ----------------------------- | ------ |
| `authService` | Login, logout, session, OAuth | Public |

```typescript
import { authService } from "@digilist/client-sdk";

// Login
const { data } = await authService.login({ email, password });

// Get current session
const session = await authService.getSession();

// Logout
await authService.logout();
```

### 📋 Listings & Bookings

| Service                | Description                   | Role           |
| ---------------------- | ----------------------------- | -------------- |
| `listingService`       | Full listing CRUD             | Saksbehandler+ |
| `publicListingService` | Public read-only listings     | Public         |
| `bookingService`       | Booking CRUD, confirm, cancel | User+          |
| `calendarService`      | Calendar views                | User+          |
| `allocationService`    | Time blocking                 | Saksbehandler+ |
| `availabilityService`  | Check availability            | Public         |

```typescript
import {
    bookingService,
    listingService,
    publicListingService,
} from "@digilist/client-sdk";

// Public: Get published listings
const listings = await publicListingService.getPublished({
    category: "sports",
});

// Get listing details
const listing = await listingService.getById("uuid");

// Create booking
const booking = await bookingService.create({
    listingId: "uuid",
    startTime: "2026-01-15T10:00:00Z",
    endTime: "2026-01-15T11:00:00Z",
    notes: "Birthday party",
});

// Confirm booking (Saksbehandler only)
await bookingService.confirm("booking-id");

// Cancel booking
await bookingService.cancel("booking-id", "Customer request");
```

### 👥 Users & Organizations

| Service               | Description             | Role  |
| --------------------- | ----------------------- | ----- |
| `userService`         | User management         | Admin |
| `organizationService` | Organization management | Admin |

```typescript
import { organizationService, userService } from "@digilist/client-sdk";

// List users
const users = await userService.getAll({ role: "saksbehandler" });

// Create organization
const org = await organizationService.create({
    name: "Skien IL",
    email: "kontakt@skienil.no",
});
```

### 💬 Conversations & Notifications

| Service               | Description                 | Role  |
| --------------------- | --------------------------- | ----- |
| `conversationService` | Messages between user/admin | User+ |
| `notificationService` | Email, push, SMS, in-app    | Admin |

```typescript
import { conversationService, notificationService } from "@digilist/client-sdk";

// Get conversations
const conversations = await conversationService.getAll({ status: "open" });

// Send message
await conversationService.sendMessage("conversation-id", {
    content: "Thanks for your inquiry!",
    senderType: "admin",
});

// Send email notification
await notificationService.sendEmail({
    to: "user@example.com",
    subject: "Booking Confirmed",
    body: "Your booking has been confirmed.",
});
```

### 📊 Reports & Dashboard

| Service            | Description                           | Role           |
| ------------------ | ------------------------------------- | -------------- |
| `dashboardService` | Stats, activity, quick actions        | Saksbehandler+ |
| `reportsService`   | Booking, revenue, utilization reports | Saksbehandler+ |

```typescript
import { dashboardService, reportsService } from "@digilist/client-sdk";

// Dashboard stats
const stats = await dashboardService.getStats();

// Booking report
const report = await reportsService.getBookingReport({
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    groupBy: "week",
});
```

### ⚙️ Settings & Configuration

| Service           | Description             | Role        |
| ----------------- | ----------------------- | ----------- |
| `settingsService` | Tenant/user settings    | Admin       |
| `tenantService`   | Subscriptions, licenses | TenantAdmin |

```typescript
import { settingsService, tenantService } from "@digilist/client-sdk";

// Get tenant settings
const settings = await settingsService.getTenantSettings();

// Update booking policy
await settingsService.updateBookingPolicy({
    autoConfirm: false,
    requireApproval: true,
});

// Get subscription
const subscription = await tenantService.getSubscription();
```

### 🔌 Integrations

| Service               | Description         | Role  |
| --------------------- | ------------------- | ----- |
| `rcoService`          | RCO access control  | Admin |
| `vismaService`        | Visma ERP/invoicing | Admin |
| `vippsService`        | Vipps payments      | Admin |
| `calendarSyncService` | Google/Outlook sync | User+ |

```typescript
import { rcoService, vismaService } from "@digilist/client-sdk";

// Get RCO door status
const status = await rcoService.getDoorStatus();

// Create Visma invoice
const invoice = await vismaService.createInvoice({
    bookingId: "uuid",
    customerId: "customer-id",
});
```

### 📅 Seasonal Leases

| Service                | Description           | Role           |
| ---------------------- | --------------------- | -------------- |
| `seasonalLeaseService` | Long-term allocations | Saksbehandler+ |

```typescript
import { seasonalLeaseService } from "@digilist/client-sdk";

// Create seasonal lease
const lease = await seasonalLeaseService.create({
    listingId: "hall-a",
    organizationId: "org-uuid",
    season: "2026-vår",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    weeklySlots: [
        { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
        { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
    ],
});

// Approve lease
await seasonalLeaseService.approve(lease.data.id);
```

### 🏷️ Discount Codes

| Service               | Description            | Role  |
| --------------------- | ---------------------- | ----- |
| `discountCodeService` | Promo codes management | Admin |

```typescript
import { discountCodeService } from "@digilist/client-sdk";

// Create discount code
const code = await discountCodeService.create({
    code: "SUMMER2026",
    type: "percentage",
    value: 20,
    validUntil: "2026-08-31",
});

// Validate code (public)
const result = await discountCodeService.validate("SUMMER2026");
```

### 🔍 Monitoring & Audit

| Service             | Description            | Role  |
| ------------------- | ---------------------- | ----- |
| `auditService`      | Audit logs             | Admin |
| `monitoringService` | System health, metrics | Admin |

```typescript
import { auditService, monitoringService } from "@digilist/client-sdk";

// Get audit logs
const logs = await auditService.getAll({
    resource: "booking",
    action: "create",
    startDate: "2026-01-01",
});

// Get system health
const health = await monitoringService.getHealth();
```

---

## Real-time Events (WebSocket)

```typescript
import { createAuditWebSocketUrl, realtimeClient } from "@digilist/client-sdk";

// Connect to audit stream
realtimeClient.connect({
    url: createAuditWebSocketUrl("https://api.digilist.no"),
    autoReconnect: true,
});

// Subscribe to events
realtimeClient.onAudit((event) => console.log("Audit:", event));
realtimeClient.onBooking((event) => console.log("Booking:", event));
realtimeClient.onMessage((event) => console.log("Message:", event));

// Subscribe to all events
realtimeClient.onAll((event) => console.log("Event:", event));

// Disconnect
realtimeClient.disconnect();
```

---

## React Query Hooks

All services have corresponding React Query hooks for easy data fetching.

```tsx
import {
    useBookings,
    useCreateBooking,
    useListings,
} from "@digilist/client-sdk";

function MyComponent() {
    // Fetch listings
    const { data: listings, isLoading } = useListings({ status: "published" });

    // Fetch bookings
    const { data: bookings } = useBookings({ status: "confirmed" });

    // Create booking mutation
    const createBooking = useCreateBooking();

    const handleBook = () => {
        createBooking.mutate({
            listingId: "uuid",
            startTime: "2026-01-15T10:00:00Z",
            endTime: "2026-01-15T11:00:00Z",
        });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            {listings.data.map((listing) => (
                <div key={listing.id}>{listing.name}</div>
            ))}
        </div>
    );
}
```

---

## Error Handling

The SDK uses RFC 7807 Problem Details for errors.

```typescript
import { ApiError } from '@digilist/client-sdk';

try {
  await bookingService.create({ ... });
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);     // 400, 401, 403, 404, 500
    console.log('Code:', error.code);         // 'VALIDATION_ERROR', 'UNAUTHORIZED', etc.
    console.log('Message:', error.message);   // Human-readable message
    console.log('Details:', error.details);   // Additional context
  }
}
```

### Error Codes

| Code               | Status | Description              |
| ------------------ | ------ | ------------------------ |
| `VALIDATION_ERROR` | 400    | Invalid request data     |
| `UNAUTHORIZED`     | 401    | Authentication required  |
| `FORBIDDEN`        | 403    | Insufficient permissions |
| `NOT_FOUND`        | 404    | Resource not found       |
| `CONFLICT`         | 409    | Resource already exists  |
| `INTERNAL_ERROR`   | 500    | Server error             |

---

## Response Types

All responses follow a standard envelope:

```typescript
// Success response
interface SuccessResponse<T> {
    data: T;
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Error response (RFC 7807)
interface ProblemDetails {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    errors?: ValidationError[];
}
```

---

## Configuration

```typescript
import {
    initializeClient,
    setAuthToken,
    setTenantId,
} from "@digilist/client-sdk";

// Full configuration
initializeClient({
    baseUrl: "https://api.digilist.no",
    tenantId: "your-tenant-id",
    authToken: "jwt-token", // Optional
    defaultHeaders: { // Optional
        "X-Request-Id": generateRequestId(),
    },
    timeout: 30000, // Optional, default 30s
});

// Update auth token dynamically
setAuthToken("new-jwt-token");

// Switch tenant
setTenantId("different-tenant-id");
```

---

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
    AuditLogEntry,
    Booking,
    Conversation,
    DashboardStats,
    Listing,
    Organization,
    SeasonalLease,
    User,
} from "@digilist/client-sdk";
```

---

## Role-Based Access

| Role              | Services                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| **Public**        | `authService`, `publicListingService`, `availabilityService`                |
| **User**          | + `bookingService`, `calendarService`, `conversationService`                |
| **Saksbehandler** | + `allocationService`, `reportsService`, `seasonalLeaseService`             |
| **Admin**         | + `userService`, `organizationService`, `settingsService`, all integrations |
| **TenantAdmin**   | + `tenantService` (subscriptions, licenses)                                 |

---

## License

MIT © Xala Technologies
