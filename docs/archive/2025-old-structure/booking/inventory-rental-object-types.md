# Inventory: Rental Object Types

**Date:** 2026-01-19  
**Status:** Canonical Reference  
**Version:** 1.0

---

## Overview

This document catalogs all **rental object types** (utleieobjekter) in the Digilist platform, their categories, and how they map to booking behavior.

---

## 1. Category System

### 1.1 Four Primary Categories

The platform uses a **4-category system** that determines default booking behavior and UI presentation.

```typescript
type RentalObjectCategory =
  | 'LOKALER_OG_BANER'           // Venues and courts
  | 'UTSTYR_OG_INVENTAR'         // Equipment and inventory
  | 'KJORETOY_OG_TRANSPORT'      // Vehicles and transport
  | 'OPPLEVELSER_OG_ARRANGEMENT'; // Experiences and events
```

### 1.2 Category Properties

| Category | Norwegian Label | Default Time Mode | Typical Booking Pattern |
|----------|-----------------|-------------------|------------------------|
| `LOKALER_OG_BANER` | Lokaler og baner | `PERIOD` | Time slots, hourly |
| `UTSTYR_OG_INVENTAR` | Utstyr og inventar | `ALL_DAY` | Daily pickup/return |
| `KJORETOY_OG_TRANSPORT` | Kjøretøy og transport | `ALL_DAY` | Daily/multi-day rental |
| `OPPLEVELSER_OG_ARRANGEMENT` | Opplevelser og arrangement | `SLOT` | Fixed event times |

### 1.3 Category Configuration

**API Source:** `GET /api/rental-objects/categories`  
**SDK:** `rentalObjectService.getCategories()`

```typescript
interface CategoryDTO {
  key: RentalObjectCategory;
  label: string;
  labelKey: string; // i18n key
  icon?: string;
  defaultTimeMode: BookingTimeMode;
  bookingFeatures: {
    allowRecurring: boolean;
    allowInGame: boolean;
    allowSeasonRental: boolean;
    defaultDurationMinutes?: number;
  };
}
```

---

## 2. Time Modes

### 2.1 Three Time Modes

```typescript
type BookingTimeMode = 'PERIOD' | 'SLOT' | 'ALL_DAY';
```

| Time Mode | Description | Calendar Granularity | Example |
|-----------|-------------|---------------------|---------|
| `PERIOD` | Continuous time range | `TIME_SLOTS` (15/30/60 min) | "Book 10:00-14:00" |
| `SLOT` | Fixed duration slots | `TIME_SLOTS` (fixed size) | "Book the 10:00 slot" |
| `ALL_DAY` | Full day bookings | `ALL_DAY` | "Book Tuesday" |

### 2.2 Time Mode to Calendar Mapping

**Location:** `BookingWidgetPlacement.tsx` → `getCalendarModeForBookingMode()`

```typescript
function getCalendarModeForBookingMode(
  bookingMode: BookingMode
): 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY' {
  switch (bookingMode) {
    case 'SINGLE_SLOT':
    case 'IN_GAME':
    case 'RECURRING':
      return 'TIME_SLOTS';
    case 'ALL_DAY':
      return 'ALL_DAY';
    case 'RANGE':
    case 'SEASON_RENTAL':
      return 'MULTI_DAY';
    default:
      return 'TIME_SLOTS';
  }
}
```

---

## 3. Rental Object Schema

### 3.1 Database Schema

**Location:** `packages/database-schema/src/domain/rental-objects.ts`

```typescript
rentalObjects = domainSchema.table('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  organizationId: uuid('organization_id'),
  
  // Identity
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  
  // Classification
  categoryKey: varchar('category_key', { length: 50 }).default('LOKALER_OG_BANER'),
  timeMode: varchar('time_mode', { length: 20 }).default('PERIOD'),
  
  // Booking configuration
  features: jsonb('features').default([]),
  ruleSetKey: varchar('rule_set_key', { length: 50 }),
  requiresApproval: boolean('requires_approval').default(false),
  
  // Capacity
  capacity: integer('capacity'),
  inventoryTotal: integer('inventory_total'),
  
  // Media and pricing
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  
  // Status
  status: varchar('status', { length: 50 }).default('draft'),
  
  // Metadata
  metadata: jsonb('metadata').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 3.2 SDK Type Definition

**Location:** `packages/client-sdk/src/types/rental-object.ts`

```typescript
interface RentalObject {
  id: string;
  tenantId: string;
  organizationId?: string;
  
  // Identity
  name: string;
  slug: string;
  description?: string;
  
  // Classification
  category: RentalObjectCategory;
  subcategory?: string;
  tags?: string[];
  
  // Booking
  timeMode: BookingTimeMode;
  bookingFeatures?: BookingFeatures;
  
  // Properties
  status: RentalObjectStatus;
  images: string[];
  pricing?: RentalObjectPricing;
  capacity?: number;
  fixedLocation: boolean;
  location?: RentalObjectLocation;
  rules?: RentalObjectRules;
  metadata?: RentalObjectMetadata;
  
  // Computed
  averageRating?: number;
  reviewCount?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Booking Features

### 4.1 Feature Flags

**Location:** `packages/client-sdk/src/types/rental-object.ts`

```typescript
interface BookingFeatures {
  // Inventory management
  inventory?: {
    enabled: boolean;
    total: number;
    policy?: 'FIFO' | 'CONCURRENT';
  };
  
  // Shared capacity (e.g., room with 20 seats)
  sharedCapacity?: {
    enabled: boolean;
    total: number;
    policy?: 'PER_SLOT' | 'PER_DAY';
  };
  
  // Package deals
  packages?: {
    enabled: boolean;
    items: PackageDefinition[];
  };
}
```

### 4.2 Booking Configuration

**API Projection:** `BookingConfigDTO` from `GET /api/rental-objects/:id`

```typescript
interface BookingConfigDTO {
  // Mode availability
  modes: {
    available: BookingMode[];
    default: BookingMode;
  };
  
  // Time constraints
  slotDurationMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes?: number;
  bufferMinutes?: number;
  
  // Advance booking
  minAdvanceMinutes: number;
  maxAdvanceDays: number;
  allowSameDayBooking: boolean;
  
  // Approval workflow
  requiresApproval: boolean;
  autoConfirmAfterApproval: boolean;
  
  // Cancellation
  cancellationDeadlineHours: number;
  refundPolicy: 'FULL' | 'PARTIAL' | 'NONE';
  
  // Pricing
  pricing: RentalObjectPricing;
  
  // Recurring constraints (if recurring enabled)
  recurringConstraints?: RecurringConstraintsDTO;
  
  // In-game constraints (if in-game enabled)
  inGameConstraints?: InGameConstraintsDTO;
}
```

---

## 5. Status Lifecycle

### 5.1 Rental Object Status

```typescript
type RentalObjectStatus = 'draft' | 'published' | 'archived';
```

| Status | Visibility | Bookable | Editable |
|--------|------------|----------|----------|
| `draft` | Admin only | ❌ | ✅ |
| `published` | Public | ✅ | ✅ |
| `archived` | Admin only | ❌ | ⚠️ Limited |

### 5.2 Status Transitions

```
                    publish()
  ┌─────────┐ ────────────────► ┌──────────────┐
  │  draft  │                   │  published   │
  └─────────┘ ◄──────────────── └──────────────┘
                  unpublish()          │
                                       │ archive()
                                       ▼
                               ┌──────────────┐
                               │  archived    │
                               └──────────────┘
                                       │
                                       │ restore()
                                       ▼
                               ┌──────────────┐
                               │    draft     │
                               └──────────────┘
```

---

## 6. Pricing Model

### 6.1 Base Pricing

**Location:** `packages/client-sdk/src/types/rental-object.ts`

```typescript
interface RentalObjectPricing {
  basePrice: number;
  currency: string; // Default: 'NOK'
  unit: PricingUnit;
  
  // Modifiers
  weekendModifier?: number; // e.g., 1.5 = 50% increase
  memberDiscount?: number;  // e.g., 0.2 = 20% discount
}

type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';
```

### 6.2 Pricing Labels (Norwegian)

```typescript
const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  hour: 'time',
  day: 'dag',
  booking: 'booking',
  week: 'uke',
  month: 'måned',
};
```

---

## 7. Location and Rules

### 7.1 Location

```typescript
interface RentalObjectLocation {
  address?: string;
  city?: string;
  postalCode?: string;
  municipality?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
```

### 7.2 Booking Rules

```typescript
interface RentalObjectRules {
  // Deposit
  deposit?: {
    required: boolean;
    amount: number;
    currency?: string;
  };
  
  // Pickup/return
  pickup?: {
    location: string;
    instructions?: string;
  };
  
  // Requirements
  ageRequirement?: number;
  licenseRequired?: boolean;
  
  // Cancellation
  cancellation?: {
    hoursNotice: number;
    refundPercent: number;
  };
}
```

---

## 8. API Projections

### 8.1 List Projection

**Endpoint:** `GET /api/rental-objects`

Lightweight projection for lists and search results:
- Basic identity (id, name, slug)
- Category and status
- Pricing summary
- Image thumbnail
- Location city

### 8.2 Detail Projection

**Endpoint:** `GET /api/rental-objects/:id`

Full projection with all data for detail pages:
- Complete object data
- Booking configuration
- Opening hours
- Facilities and amenities
- FAQ items
- Related objects

### 8.3 Calendar Config Projection

**Endpoint:** `GET /api/rental-objects/:id/calendar-config`

Specialized projection for calendar rendering:
- Granularity
- Slot size
- Opening hours
- Booking types
- Permissions
- Available actions

---

## 9. Category-Specific Behaviors

### 9.1 LOKALER_OG_BANER (Venues)

| Feature | Default | Note |
|---------|---------|------|
| Time Mode | `PERIOD` | Hourly slots |
| Recurring | ✅ Enabled | Weekly practices |
| In-Game | ❌ Disabled | N/A |
| Season Rental | ✅ Enabled | Season leagues |
| Approval | Configurable | Usually required |
| Capacity | Required | Room capacity |

### 9.2 UTSTYR_OG_INVENTAR (Equipment)

| Feature | Default | Note |
|---------|---------|------|
| Time Mode | `ALL_DAY` | Daily rental |
| Recurring | ⚠️ Limited | Monthly equipment rental |
| In-Game | ❌ Disabled | N/A |
| Season Rental | ❌ Disabled | N/A |
| Approval | Usually required | Manual checkout |
| Inventory | Required | Stock count |

### 9.3 KJORETOY_OG_TRANSPORT (Vehicles)

| Feature | Default | Note |
|---------|---------|------|
| Time Mode | `ALL_DAY` | Daily/multi-day |
| Recurring | ❌ Disabled | N/A |
| In-Game | ❌ Disabled | N/A |
| Season Rental | ⚠️ Limited | Long-term lease |
| Approval | Required | License check |
| Deposit | Required | Vehicle deposit |

### 9.4 OPPLEVELSER_OG_ARRANGEMENT (Events)

| Feature | Default | Note |
|---------|---------|------|
| Time Mode | `SLOT` | Fixed start times |
| Recurring | ⚠️ Limited | Weekly classes |
| In-Game | ✅ Enabled | Last-minute registration |
| Season Rental | ❌ Disabled | N/A |
| Approval | Usually not | Instant confirmation |
| Capacity | Required | Participant limit |

---

## 10. Implementation Locations

### Database
- `packages/database-schema/src/domain/rental-objects.ts`
- `apps/api/src/database/schema/rental-objects.ts`

### API
- `apps/api/src/modules/rental-objects/rental-object.controller.ts`
- `apps/api/src/modules/rental-objects/rental-object.service.ts`
- `apps/api/src/modules/rental-objects/rental-object.projections.ts`
- `apps/api/src/schemas/rental-object.schema.ts`
- `apps/api/src/domain/rental-objects/rental-object.ts`

### Client SDK
- `packages/client-sdk/src/services/rental-object.service.ts`
- `packages/client-sdk/src/types/rental-object.ts`
- `packages/client-sdk/src/hooks/use-rental-objects.ts`

### UI
- `apps/web/src/pages/RentalObjectDetailPage.tsx`
- `apps/backoffice/src/features/rental-objects/`
- `apps/backoffice/src/routes/rental-objects.tsx`
