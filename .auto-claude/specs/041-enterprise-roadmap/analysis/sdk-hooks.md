# SDK Hooks and React Query Patterns

## Overview

The `@digilist/client-sdk` provides a comprehensive set of React Query hooks for data fetching, mutations, and real-time updates. This document analyzes the patterns, conventions, and architecture used across all hooks.

**Location:** `packages/client-sdk/src/hooks/`

---

## Hook Inventory

### Total Hook Count: 170+ hooks across 20 files

| Category | File | Hook Count | Purpose |
|----------|------|------------|---------|
| Auth | `use-auth.ts` | 6 | Session management, login/logout |
| Listings | `use-listings.ts` | 24 | Listing CRUD, public listings, media |
| Bookings | `use-bookings.ts` | 17 | Booking lifecycle, calendar, allocations |
| Organizations | `use-organizations.ts` | 19 | Org/user management, GDPR compliance |
| Audit | `use-audit.ts` | 5 | Audit log queries |
| Realtime | `use-realtime.ts` | 10 | WebSocket event subscriptions |
| Notifications | `use-notifications.ts` | 7 | Notification management |
| Push Notifications | `use-push-notifications.ts` | 9 | Push subscription management |
| Integrations | `use-integrations.ts` | 19 | Third-party integrations |
| Conversations | `use-conversations.ts` | 10 | Messaging system |
| Blocks | `use-blocks.ts` | 6 | Calendar blocking |
| Seasonal Leases | `use-seasonal-leases.ts` | 9 | Seasonal lease management |
| Reviews | `use-reviews.ts` | 12 | Review system |
| Reports | `use-reports.ts` | 13 | Dashboard and analytics |
| Search | `use-search.ts` | 8 | Global search, saved filters |
| Economy | `use-economy.ts` | 24 | Invoicing, billing, credit notes |
| Billing | `use-billing.ts` | 10 | User/org billing (MinSide) |
| Season Applications | `use-season-applications.ts` | 9 | Season application workflow |
| Seasons | `use-seasons.ts` | 11 | Season lifecycle management |
| Geocoding | `use-geocode.ts` | 2 | Location geocoding |
| Accessibility | `use-accessibility-monitoring.ts` | 2 | A11y monitoring |
| Help | `useHelp.ts` | 5 | FAQ, guides, training |

---

## Query Keys Factory Pattern

### Location: `packages/client-sdk/src/hooks/query-keys.ts`

The SDK uses a centralized query key factory for cache management, invalidation, and prefetching.

### Pattern Structure

```typescript
export const queryKeys = {
  domain: {
    all: ['domain'] as const,
    lists: () => [...queryKeys.domain.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.domain.lists(), params] as const,
    details: () => [...queryKeys.domain.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.domain.details(), id] as const,
  },
}
```

### Key Hierarchy

```
domain
  ├── all           → ['domain']                    (base for all queries)
  ├── lists()       → ['domain', 'list']            (all list queries)
  ├── list(params)  → ['domain', 'list', params]    (specific filtered list)
  ├── details()     → ['domain', 'detail']          (all detail queries)
  └── detail(id)    → ['domain', 'detail', id]      (specific entity)
```

### Domain Coverage

| Domain | Key Prefix | Nested Keys |
|--------|------------|-------------|
| `auth` | `['auth']` | session, providers, permissions |
| `listings` | `['listings']` | list, detail, slug, availability, stats |
| `public` | `['public']` | listings, listing, availability, categories, cities, municipalities, featured |
| `bookings` | `['bookings']` | list, detail, my, recurring, pricing, paymentReconciliation, paymentHistory |
| `calendar` | `['calendar']` | events, slots |
| `allocations` | `['allocations']` | list |
| `organizations` | `['organizations']` | list, detail, members |
| `users` | `['users']` | list, detail, me, consents |
| `conversations` | `['conversations']` | list, detail, messages |
| `dashboard` | `['dashboard']` | kpis |
| `reports` | `['reports']` | usage, revenue, bookings |
| `audit` | `['audit']` | list, detail, stats, resource, user |
| `notifications` | `['notifications']` | list, my, unreadCount |
| `pushNotifications` | `['pushNotifications']` | subscriptions, preferences |
| `discountCodes` | `['discountCodes']` | list, detail |
| `reviews` | `['reviews']` | list, detail, byListing, byUser, stats |
| `settings` | `['settings']` | tenant, integrations |
| `integrations` | `['integrations']` | rco, visma, vipps, brreg, nif, calendar |
| `economy` | `['economy']` | invoiceBases, salesDocuments, creditNotes, statistics |
| `search` | `['search']` | results, typeahead, recent, savedFilters |

---

## Query Hook Patterns

### Basic Query Hook

```typescript
export function useEntities(params?: QueryParams) {
  return useQuery({
    queryKey: queryKeys.entities.list(params),
    queryFn: () => entityService.getAll(params),
  });
}
```

### Query with Conditional Enabling

```typescript
export function useEntity(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.entities.detail(id),
    queryFn: () => entityService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}
```

### Query with Custom Stale Time

```typescript
export function useAuthProviders() {
  return useQuery({
    queryKey: queryKeys.auth.providers(),
    queryFn: () => authService.getProviders(),
    staleTime: Infinity, // Providers don't change often
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: queryKeys.public.categories(),
    queryFn: () => publicListingService.getCategories(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
```

### Query with Multi-Parameter Dependencies

```typescript
export function useBookingPricing(listingId: string, startTime: string, endTime: string) {
  return useQuery({
    queryKey: queryKeys.bookings.pricing(listingId, startTime, endTime),
    queryFn: () => bookingService.calculatePricing(listingId, startTime, endTime),
    enabled: !!listingId && !!startTime && !!endTime,
  });
}
```

### Query with Retry Configuration

```typescript
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authService.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Mutation Hook Patterns

### Basic Create Mutation

```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntityDTO) => entityService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.lists() });
    },
  });
}
```

### Update Mutation with ID Parameter

```typescript
export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEntityDTO }) =>
      entityService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.lists() });
    },
  });
}
```

### Delete Mutation

```typescript
export function useDeleteEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entities.all });
    },
  });
}
```

### Auth Mutation with Token Management

```typescript
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      queryClient.setQueryData(queryKeys.auth.session(), response);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuthToken();
      queryClient.removeQueries({ queryKey: queryKeys.auth.session() });
      queryClient.clear();
    },
  });
}
```

### File Upload Mutation with Compression

```typescript
export function useUploadListingMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, files, options }: UploadMediaParams) => {
      const shouldCompress = options?.compress !== false;
      const processedFiles = shouldCompress
        ? await Promise.all(
            files.map(async (file) => {
              if (isImageFile(file)) {
                try {
                  return await compressImage(file, options?.compressionOptions);
                } catch {
                  return file;
                }
              }
              return file;
            })
          )
        : files;

      return listingService.uploadMedia(id, processedFiles, options);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
    },
  });
}
```

### Workflow/State Transition Mutations

```typescript
// Booking lifecycle
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingDTO }) =>
      bookingService.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
  });
}

// Listing lifecycle
export function usePublishListing() { /* ... */ }
export function useUnpublishListing() { /* ... */ }
export function useArchiveListing() { /* ... */ }
export function useRestoreListing() { /* ... */ }

// Seasonal lease lifecycle
export function useApproveSeasonalLease() { /* ... */ }
export function useRejectSeasonalLease() { /* ... */ }
export function useCancelSeasonalLease() { /* ... */ }
```

---

## Cache Invalidation Patterns

### Single Entity Invalidation

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.entities.detail(id) });
```

### List Invalidation (All Parameters)

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.entities.lists() });
```

### Full Domain Invalidation

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.entities.all });
```

### Cross-Domain Invalidation

```typescript
// When a booking changes, also invalidate calendar
onSuccess: (_, { id }) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
},
```

### Direct Cache Update (Optimistic)

```typescript
queryClient.setQueryData(queryKeys.auth.session(), response);
```

### Cache Clear (Logout)

```typescript
queryClient.clear();
```

---

## Realtime Hook Patterns

### Connection Hook

```typescript
export function useRealtimeConnection(config?: Partial<RealtimeClientConfig>) {
  const [isConnected, setIsConnected] = useState(realtimeClient.isConnected);

  useEffect(() => {
    if (!config?.url) return;

    realtimeClient.connect({
      url: config.url,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      tenantId: config.tenantId,
    });

    const unsubscribe = realtimeClient.on('connected', () => {
      setIsConnected(true);
    });

    return () => {
      unsubscribe();
    };
  }, [/* deps */]);

  return isConnected;
}
```

### Event Subscription with Cache Invalidation

```typescript
export function useRealtimeBookings(handler?: RealtimeEventHandler) {
  const queryClient = useQueryClient();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = realtimeClient.onBooking((event) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });

      // Call custom handler if provided
      handlerRef.current?.(event);
    });

    return unsubscribe;
  }, [queryClient]);
}
```

### Badge Count Hook

```typescript
export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeClient.on('notification', (event) => {
      if (event.data && typeof event.data === 'object' && 'unreadCount' in event.data) {
        setUnreadCount((event.data as { unreadCount: number }).unreadCount);
      }
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return { unreadCount, markAsRead };
}
```

### Send Hook

```typescript
export function useRealtimeSend() {
  const send = useCallback((data: unknown) => {
    realtimeClient.send(data);
  }, []);

  const ping = useCallback(() => {
    realtimeClient.ping();
  }, []);

  return { send, ping, isConnected: realtimeClient.isConnected };
}
```

---

## Naming Conventions

### Query Hooks

| Pattern | Example | Purpose |
|---------|---------|---------|
| `use{Entity}s` | `useBookings`, `useListings` | Paginated list query |
| `use{Entity}` | `useBooking`, `useListing` | Single entity by ID |
| `useMy{Entity}s` | `useMyBookings`, `useMyReviews` | Current user's entities |
| `use{Entity}By{Field}` | `useListingBySlug` | Query by alternate key |
| `use{Entity}Stats` | `useListingStats`, `useAuditStats` | Statistics/aggregates |
| `usePublic{Entity}` | `usePublicListings`, `usePublicCategories` | No-auth public data |
| `use{Integration}Status` | `useRcoStatus`, `useVismaStatus` | Integration health |

### Mutation Hooks

| Pattern | Example | Purpose |
|---------|---------|---------|
| `useCreate{Entity}` | `useCreateBooking` | Create operation |
| `useUpdate{Entity}` | `useUpdateBooking` | Update operation |
| `useDelete{Entity}` | `useDeleteBooking` | Delete operation |
| `use{Action}{Entity}` | `useConfirmBooking`, `useCancelBooking` | State transition |
| `useUpload{Entity}Media` | `useUploadListingMedia` | File upload |
| `useSync{Integration}` | `useSyncVisma`, `useSyncCalendar` | Integration sync |

### Realtime Hooks

| Pattern | Example | Purpose |
|---------|---------|---------|
| `useRealtime{Entity}` | `useRealtimeBookings` | Entity event subscription |
| `useRealtimeConnection` | - | WebSocket connection management |
| `useRealtimeSend` | - | Send messages via WebSocket |

---

## Type Patterns

### Re-exported Types from Hooks

```typescript
// Types exported from hooks for consumer convenience
export type { AuditLogEntry, AuditQueryParams, AuditStats } from './use-audit';

export type {
  GeocodedItem,
  UseGeocodeListingsOptions,
  UseGeocodeListingsResult,
} from './use-geocode';

export type {
  UseAccessibilityMonitoringOptions,
  AccessibilityMonitoringAPI,
  AccessibilityMonitoringConfig,
  // ... more accessibility types
} from './use-accessibility-monitoring';
```

### Type Aliases for Backwards Compatibility

```typescript
// Re-export as alias for backwards compatibility
export type AuditEvent = AuditLogEntry;
```

---

## Special Patterns

### Deprecated Hooks (Transformer Migration)

```typescript
/**
 * Get public listings transformed to UI format
 * @deprecated API now returns screen-ready projection DTOs directly via usePublicListings()
 */
export function usePublicUiListings(params?: PublicListingParams) {
  // API now returns projection DTOs, no transformation needed
  return usePublicListings(params);
}
```

### Domain-Specific Query Keys Export

Some hooks export their own query keys for external use:

```typescript
// From use-conversations.ts
export { conversationKeys };

// From use-blocks.ts
export { blockKeys };

// From use-billing.ts
export { billingKeys };

// From use-reports.ts
export { reportKeys };

// From use-season-applications.ts
export { seasonApplicationKeys };

// From use-seasons.ts
export { seasonKeys };

// From use-seasonal-leases.ts
export { seasonalLeaseKeys };
```

---

## Integration with Services

### Service Import Pattern

```typescript
import {
  bookingService,
  calendarService,
  allocationService,
  availabilityService
} from '../services/booking.service';
```

### Service Method Mapping

| Hook | Service Method |
|------|---------------|
| `useBookings(params)` | `bookingService.getAll(params)` |
| `useBooking(id)` | `bookingService.getById(id)` |
| `useCreateBooking()` | `bookingService.create(data)` |
| `useUpdateBooking()` | `bookingService.update(id, data)` |
| `useConfirmBooking()` | `bookingService.confirm(id)` |
| `useCancelBooking()` | `bookingService.cancel(id, data)` |

---

## GDPR Compliance Hooks

Located in `use-organizations.ts`:

```typescript
// Export user data (GDPR portability)
export function useExportData() {
  return useMutation({
    mutationFn: () => userService.exportData(),
  });
}

// Delete account (GDPR erasure)
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Consent management
export function useConsents() { /* query */ }
export function useUpdateConsents() { /* mutation */ }
```

---

## Gaps and Recommendations

### Identified Gaps

1. **Error Handling**: No standardized `onError` callbacks in mutations
2. **Optimistic Updates**: Limited use of optimistic updates for better UX
3. **Prefetching**: No prefetch utilities exported
4. **Infinite Queries**: No `useInfiniteQuery` implementations for pagination
5. **Suspense Mode**: No `useSuspenseQuery` variants

### Recommendations

1. Add standardized error handling with RFC 7807 Problem Details
2. Implement optimistic updates for common mutations (confirm, cancel)
3. Export prefetch utilities for route transitions
4. Add infinite query variants for large lists
5. Consider adding Suspense-ready query variants

---

## Summary

The SDK hooks layer provides:

- **170+ hooks** covering all platform domains
- **Centralized query key management** via factory pattern
- **Consistent naming conventions** for discoverability
- **Proper cache invalidation** for data consistency
- **WebSocket integration** for real-time updates
- **GDPR compliance hooks** for privacy requirements
- **File upload handling** with compression

All hooks follow the SDK-first principle - they wrap service calls and never make direct API requests, ensuring proper tenant isolation, authentication, and audit logging.
