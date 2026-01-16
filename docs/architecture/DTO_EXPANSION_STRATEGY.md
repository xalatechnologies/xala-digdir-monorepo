# DTO Expansion Strategy: Additive, Non-Breaking Migration

**Created:** 2026-01-17  
**Status:** ARCHITECTURAL BLUEPRINT  
**Pattern:** Enterprise Read-Model Projection

---

## Core Principle

**Only one place computes "effective view models": the API.**  
UI never joins, never derives, never interprets permissions. It just renders DTOs.

---

## ✅ What Stays Stable (Contract Stability)

### Existing Endpoints (NO BREAKING CHANGES)
```typescript
// Core DTOs - FROZEN (only add optional fields)
interface RentalObjectDTO {
  id: string;
  tenantId: string;
  categoryKey: string;
  timeMode: 'PERIOD' | 'HOURLY' | 'DAILY';
  name: string;
  description?: string;
  status: string;
  capacity?: number;
  images?: ImageDTO[];
  // ✅ Can add NEW optional fields
  // ❌ Cannot remove or rename existing fields
}

interface BookingDTO {
  id: string;
  rentalObjectId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  // Stable contract
}

interface TimeBlockDTO {
  id: string;
  rentalObjectId: string;
  blockType: string;
  startAt: string;
  endAt: string;
  // Stable contract
}
```

### Stable API Routes
```
✅ GET  /api/rental-objects
✅ GET  /api/rental-objects/:id
✅ POST /api/rental-objects
✅ GET  /api/bookings
✅ POST /api/bookings
✅ GET  /api/time-blocks
✅ POST /api/sessions/login
✅ POST /api/sessions/refresh
```

### Stable Patterns
- ✅ Contract-first (OpenAPI → TypeScript)
- ✅ RFC 7807 errors
- ✅ Zero transformers rule (client SDK)
- ✅ JWT 3-cookie session system

---

## 🆕 What Changes (Additive Only)

### Phase 1: New Resource Endpoints (Minimal Disruption)

Add endpoints that **don't disturb existing flows**:

```typescript
// Amenities
GET    /api/amenities
GET    /api/rental-objects/:id/amenities
POST   /api/amenities                          // Admin only
PUT    /api/rental-objects/:id/amenities       // Bulk assign

// Add-ons
GET    /api/addons
GET    /api/rental-objects/:id/addons
POST   /api/addons                             // Admin only

// Pricing
GET    /api/pricing-groups
GET    /api/rental-objects/:id/pricing
POST   /api/rental-objects/:id/pricing/quote  // Calculate quote
GET    /api/pricing-groups/:id/members        // Users in group

// Availability
GET    /api/rental-objects/:id/availability/calendar
POST   /api/rental-objects/:id/availability/check

// Opening Hours
GET    /api/rental-objects/:id/opening-hours
PUT    /api/rental-objects/:id/opening-hours
GET    /api/rental-objects/:id/exceptions     // Exception days

// Metadata
GET    /api/metadata-definitions
GET    /api/rental-objects/:id/metadata
PUT    /api/rental-objects/:id/metadata

// Conversations (Support)
GET    /api/conversations
GET    /api/conversations/:id
POST   /api/conversations
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages

// Notifications
GET    /api/notifications
PUT    /api/notifications/:id/read
POST   /api/notifications/preferences

// SEO (Admin only)
GET    /api/rental-objects/:id/seo
PUT    /api/rental-objects/:id/seo

// Geo Areas
GET    /api/geo-areas
GET    /api/geo-areas/:id/rental-objects

// Support
GET    /api/support/help-articles
GET    /api/support/tickets
POST   /api/support/tickets

// Knowledge Base (RAG)
GET    /api/kb/search
POST   /api/kb/ask                             // AI-powered Q&A
```

### Phase 2: Unified Read Models (Projection DTOs)

**The Key Innovation**: Single endpoint with expand mechanics.

```typescript
// Unified Details Projection
GET /api/rental-objects/:id/details?expand=pricing,addons,amenities,metadata,seo,geo,availability

// Response: RentalObjectDetailsDTO
interface RentalObjectDetailsDTO {
  // Core (always included)
  core: RentalObjectDTO;
  
  // Expanded sections (opt-in via query param)
  pricing?: {
    groups: PricingGroupDTO[];
    rules: PriceRuleDTO[];
    deposits?: DepositDTO[];
  };
  
  addons?: AddOnDTO[];
  
  amenities?: {
    grouped: Record<string, AmenityDTO[]>;
    flat: AmenityDTO[];
  };
  
  metadata?: Record<string, MetadataValueDTO>;
  
  seo?: SeoMetadataDTO;
  
  geo?: {
    area?: GeoAreaDTO;
    coordinates?: GeoCoordinatesDTO;
  };
  
  availability?: {
    openingHours: OpeningHoursDTO[];
    exceptions: ExceptionDayDTO[];
    nextAvailable?: string;
  };
  
  // Meta
  _expanded: string[]; // ['pricing', 'amenities']
}
```

### Phase 3: Dashboard Projections (High-Fidelity UX)

```typescript
// User Dashboard (Minside)
GET /api/users/me/dashboard

interface UserDashboardDTO {
  upcomingBookings: BookingDTO[];
  recentActivity: ActivityDTO[];
  notifications: NotificationDTO[];
  favorites: RentalObjectSearchCardDTO[];
  recommendations?: RentalObjectSearchCardDTO[];
}

// Organization Dashboard (Backoffice)
GET /api/organizations/:id/dashboard

interface OrgDashboardDTO {
  stats: {
    totalBookings: number;
    pendingApprovals: number;
    revenue: MoneyDTO;
    occupancyRate: number;
  };
  recentBookings: BookingDTO[];
  rentalObjects: RentalObjectSearchCardDTO[];
  pendingApprovals: BookingDTO[];
}

// Search Results (Optimized for Discovery)
GET /api/rental-objects/search?category=LOKALER&amenities=wifi,parking

interface SearchResultsDTO {
  results: RentalObjectSearchCardDTO[];
  facets: SearchFacetsDTO;
  pagination: PaginationDTO;
}

interface RentalObjectSearchCardDTO {
  id: string;
  name: string;
  category: CategoryDTO;
  images: ImageDTO[];
  pricing?: {
    from: MoneyDTO;
    to?: MoneyDTO;
  };
  amenities: string[]; // Icon keys only
  nextAvailable?: string;
  distance?: DistanceDTO;
}
```

---

## 📦 New DTO Contracts (Contract-First)

### Minimal Critical Set (Phase 1)

```typescript
// 1. Rental Object Details (Projection)
interface RentalObjectDetailsDTO {
  core: RentalObjectDTO;
  pricing?: PricingProjectionDTO;
  addons?: AddOnDTO[];
  amenities?: AmenityGroupedDTO;
  availability?: AvailabilityProjectionDTO;
  metadata?: Record<string, MetadataValueDTO>;
}

// 2. Availability Calendar
interface AvailabilityCalendarDTO {
  rentalObjectId: string;
  month: string; // '2026-01'
  days: AvailabilityDayDTO[];
  blocks: TimeBlockDTO[];
  bookings: BookingSlotDTO[];
}

interface AvailabilityDayDTO {
  date: string; // '2026-01-15'
  status: 'available' | 'partial' | 'booked' | 'blocked';
  openingHours?: { start: string; end: string }[];
  availableSlots?: number;
}

// 3. Booking Quote (Pricing Projection)
interface BookingQuoteDTO {
  rentalObjectId: string;
  userId: string;
  startTime: string;
  endTime: string;
  basePrice: MoneyDTO;
  addons: AddOnLineItemDTO[];
  discounts: DiscountLineItemDTO[];
  taxes: TaxLineItemDTO[];
  deposit?: MoneyDTO;
  total: MoneyDTO;
  breakdown: PriceBreakdownDTO[];
}

// 4. Amenity (Shared)
interface AmenityDTO {
  id: string;
  code: string;
  name: string;
  groupCode?: string;
  groupName?: string;
  iconKey?: string;
}

// 5. Add-on (Shared)
interface AddOnDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  pricingModel: 'PER_BOOKING' | 'PER_HOUR' | 'PER_DAY' | 'PER_UNIT';
  basePrice: MoneyDTO;
  isRequired: boolean;
  maxUnits?: number;
}

// 6. Pricing Group
interface PricingGroupDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
  memberCount?: number;
}

// 7. Notification
interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// 8. Conversation + Message
interface ConversationDTO {
  id: string;
  subject?: string;
  participants: UserBaseDTO[];
  lastMessage?: MessagePreviewDTO;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: string;
}

interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: AttachmentDTO[];
  readAt?: string;
  createdAt: string;
}
```

### Supporting DTOs (Reusable)

```typescript
// Money (Norwegian locale)
interface MoneyDTO {
  amount: number;        // In minor units (øre)
  currency: string;      // 'NOK'
  formatted: string;     // 'kr 1.234,56'
}

// Image
interface ImageDTO {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  sortOrder: number;
}

// Category
interface CategoryDTO {
  key: string;
  name: string;        // Localized
  description?: string;
}

// Metadata Value
interface MetadataValueDTO {
  definitionCode: string;
  name: string;
  value: string | number | boolean | Date;
  valueType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE';
  unit?: string;
}

// Pagination
interface PaginationDTO {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Distance (Geo)
interface DistanceDTO {
  meters: number;
  formatted: string;  // '2,5 km'
}
```

---

## 🔄 Client SDK Structure (Additive Services)

### Existing Services (NO CHANGES)
```typescript
// packages/client-sdk/src/services/
rentalObjects.service.ts     // ✅ Keep stable
bookings.service.ts          // ✅ Keep stable
sessions.service.ts          // ✅ Keep stable
```

### New Services (Phase 1)
```typescript
// packages/client-sdk/src/services/
rentalObjectDetails.service.ts   // 🆕 Unified details projection
amenities.service.ts             // 🆕 Amenity management
addons.service.ts                // 🆕 Add-on management
pricing.service.ts               // 🆕 Pricing groups & quotes
availability.service.ts          // 🆕 Calendar & availability
metadata.service.ts              // 🆕 Metadata definitions
conversations.service.ts         // 🆕 Messaging
notifications.service.ts         // 🆕 Notifications
support.service.ts               // 🆕 Help & tickets
```

### New Hooks (React Query)
```typescript
// packages/client-sdk/src/hooks/

// Rental Object Details
export function useRentalObjectDetails(
  id: string,
  expand?: ('pricing' | 'amenities' | 'addons' | 'metadata' | 'availability')[]
) {
  return useQuery({
    queryKey: ['rental-objects', id, 'details', expand],
    queryFn: () => rentalObjectDetailsService.get(id, { expand }),
  });
}

// Availability Calendar
export function useAvailabilityCalendar(
  rentalObjectId: string,
  params: { month: string; timeMode?: string }
) {
  return useQuery({
    queryKey: ['availability', rentalObjectId, 'calendar', params],
    queryFn: () => availabilityService.getCalendar(rentalObjectId, params),
  });
}

// Booking Quote
export function useBookingQuote(input: BookingQuoteInput) {
  return useQuery({
    queryKey: ['bookings', 'quote', input],
    queryFn: () => pricingService.calculateQuote(input),
    enabled: !!input.startTime && !!input.endTime,
  });
}

// Amenities
export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: () => amenitiesService.list(),
  });
}

export function useRentalObjectAmenities(rentalObjectId: string) {
  return useQuery({
    queryKey: ['rental-objects', rentalObjectId, 'amenities'],
    queryFn: () => amenitiesService.forRentalObject(rentalObjectId),
  });
}

// Conversations
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsService.list(),
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages'],
    queryFn: () => conversationsService.getMessages(conversationId),
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list(),
  });
}
```

---

## 🚀 phased Rollout Plan

### Phase 0: Freeze Contracts (Day 1)
- ✅ Document all existing DTOs as "stable"
- ✅ Create OpenAPI schema for existing endpoints
- ✅ Add validation: only allow new optional fields
- ✅ No breaking changes allowed

### Phase 1: New Tables + Minimal Endpoints (Week 1-2)
**Migrations**: 0018-0021 (Case Management, Templates, Search, Notifications)

**New Endpoints**:
```
POST /api/amenities
POST /api/addons
POST /api/pricing-groups
GET  /api/rental-objects/:id/amenities
GET  /api/rental-objects/:id/addons
GET  /api/rental-objects/:id/pricing
```

**Impact**: Zero disruption, features are opt-in.

### Phase 2: Unified Details Projection (Week 3)
**Endpoint**:
```
GET /api/rental-objects/:id/details?expand=pricing,amenities,addons,metadata,availability
```

**Client SDK**:
```typescript
// New service
rentalObjectDetailsService.get(id, { expand: ['pricing', 'amenities'] })

// New hook
useRentalObjectDetails(id, ['pricing', 'amenities'])
```

**Impact**: Replaces multiple API calls with one optimized query.

### Phase 3: Update Apps Gradually (Week 4-6)
1. **Backoffice** (easiest) - Full details view
2. **Web** - Search + discovery
3. **Minside** - User dashboard

**Strategy**: Feature flags for new UI components.

### Phase 4: Dashboard Projections (Week 7-8)
```
GET /api/users/me/dashboard
GET /api/organizations/:id/dashboard
GET /api/rental-objects/search
```

**Impact**: High-fidelity UX with minimal API calls.

---

## ✅ Quality Gates

Before marking any phase complete:

1. ✅ OpenAPI schema generated and validated
2. ✅ TypeScript types auto-generated (no manual sync)
3. ✅ Client SDK service + hooks implemented
4. ✅ Zero transformers rule validated (no data manipulation in UI)
5. ✅ Existing tests still pass (regression check)
6. ✅ New integration tests for new endpoints
7. ✅ Feature flag controls rollout

---

## 🎯 Success Criteria

- **No breaking changes** to existing endpoints
- **Single API call** for complex views (details projection)
- **Zero transformers** in client SDK
- **Gradual migration** app-by-app
- **Feature flags** control visibility

---

**Next Step**: Create OpenAPI schemas for Phase 1 endpoints and generate TypeScript contracts.
