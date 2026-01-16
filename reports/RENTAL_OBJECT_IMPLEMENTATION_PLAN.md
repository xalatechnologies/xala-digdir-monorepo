# RENTAL OBJECT REFACTOR - IMPLEMENTATION PLAN

**Date**: 2026-01-16  
**Status**: PLANNING  
**Goal**: Complete listing → rental object migration with V3 model

---

## EXECUTIVE SUMMARY

Migrate from `listing` to `rental_object` across all layers with:
- **4 Categories**: LOKALER_OG_BANER, UTSTYR_OG_INVENTAR, KJORETOY_OG_TRANSPORT, OPPLEVELSER_OG_ARRANGEMENT
- **3 Time Modes**: PERIOD, SLOT, ALL_DAY
- **3 Features**: INVENTORY, SHARED_CAPACITY, PACKAGES
- **SDK-first**: All apps consume SDK, no raw fetch
- **RFC7807**: Consistent error format everywhere

---

## PHASE 1: SCHEMA & DATABASE (Day 1)

### 1.1 Create Seed Tables
```
rental_object_categories (4 rows)
booking_time_modes (3 rows)
rental_object_features (3 rows)
rule_sets (5+ reusable rules)
```

### 1.2 Update rental_objects Table
```sql
ALTER TABLE rental_objects ADD COLUMN category_key VARCHAR(50) DEFAULT 'LOKALER_OG_BANER';
ALTER TABLE rental_objects ADD COLUMN time_mode VARCHAR(20) DEFAULT 'PERIOD';
ALTER TABLE rental_objects ADD COLUMN features JSONB DEFAULT '[]';
ALTER TABLE rental_objects ADD COLUMN rule_set_key VARCHAR(50);
ALTER TABLE rental_objects ADD COLUMN inventory_total INTEGER;
```

### 1.3 Create blackouts Table
```sql
CREATE TABLE blackouts (
  id UUID PRIMARY KEY,
  rental_object_id UUID REFERENCES rental_objects(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255),
  reason TEXT
);
```

### 1.4 Migration Script
- Migrate existing `type` → `category_key`
- Migrate existing `category` → `category_key` 
- Drop legacy columns after verification

---

## PHASE 2: API LAYER (Day 1-2)

### 2.1 Endpoints to Create/Update
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/rental-objects` | List with filters |
| GET | `/api/rental-objects/:id` | Single object |
| POST | `/api/rental-objects` | Create |
| PUT | `/api/rental-objects/:id` | Update |
| DELETE | `/api/rental-objects/:id` | Delete |
| GET | `/api/rental-objects/:id/availability` | Calendar truth |
| GET | `/api/rental-objects/categories` | Category metadata |
| GET | `/api/rental-objects/time-modes` | Time mode metadata |
| POST | `/api/rental-objects/:id/blackouts` | Create blackout |
| DELETE | `/api/blackouts/:id` | Remove blackout |

### 2.2 Availability Response (Calendar Truth)
```typescript
interface AvailabilityResponse {
  rentalObjectId: string;
  timeMode: 'PERIOD' | 'SLOT' | 'ALL_DAY';
  range: { start: string; end: string };
  
  // Calendar blocks
  bookings: BookingSlot[];
  blackouts: BlackoutSlot[];
  
  // Capacity (if applicable)
  inventory?: { total: number; available: number };
  capacity?: { total: number; booked: number };
  
  // Slot grid (if SLOT mode)
  slots?: SlotDefinition[];
}
```

### 2.3 RBAC per Endpoint
| Endpoint | Roles |
|----------|-------|
| GET list/detail | PUBLIC |
| POST/PUT/DELETE | ADMIN, CASEWORKER |
| Blackouts | ADMIN, CASEWORKER |
| Availability | PUBLIC |

### 2.4 RFC7807 Errors
```typescript
{
  type: 'https://api.digilist.no/errors/not-found',
  title: 'Rental Object Not Found',
  status: 404,
  detail: 'No rental object exists with ID xyz',
  instance: '/api/rental-objects/xyz'
}
```

---

## PHASE 3: CLIENT SDK (Day 2-3)

### 3.1 Types to Create
```typescript
// types/rental-object.ts
export type CategoryKey = 'LOKALER_OG_BANER' | 'UTSTYR_OG_INVENTAR' | 'KJORETOY_OG_TRANSPORT' | 'OPPLEVELSER_OG_ARRANGEMENT';
export type TimeMode = 'PERIOD' | 'SLOT' | 'ALL_DAY';
export type Feature = 'INVENTORY' | 'SHARED_CAPACITY' | 'PACKAGES';

export interface RentalObject {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  categoryKey: CategoryKey;
  timeMode: TimeMode;
  features: Feature[];
  status: string;
  capacity?: number;
  inventoryTotal?: number;
  requiresApproval: boolean;
  images: string[];
  pricing: Pricing;
  metadata: Record<string, unknown>;
}
```

### 3.2 Service Methods
```typescript
// services/rental-object.service.ts
class RentalObjectService {
  list(params?: RentalObjectQuery): Promise<PaginatedResponse<RentalObject>>;
  getById(id: string): Promise<SingleResponse<RentalObject>>;
  create(data: CreateRentalObject): Promise<SingleResponse<RentalObject>>;
  update(id: string, data: UpdateRentalObject): Promise<SingleResponse<RentalObject>>;
  delete(id: string): Promise<void>;
  getAvailability(id: string, range: DateRange): Promise<AvailabilityResponse>;
  getCategories(): Promise<Category[]>;
  getTimeModes(): Promise<TimeMode[]>;
}
```

### 3.3 React Hooks
```typescript
// hooks/use-rental-objects.ts
export function useRentalObjects(params?: RentalObjectQuery);
export function useRentalObject(id: string);
export function useRentalObjectAvailability(id: string, range: DateRange);
export function useCreateRentalObject();
export function useUpdateRentalObject();
export function useDeleteRentalObject();
export function useCategories();
export function useTimeModes();
```

### 3.4 Remove Legacy
- Delete `listing.service.ts`
- Delete `use-listings.ts`
- Update all exports in index.ts

---

## PHASE 4: DEMO SEEDS (Day 3)

### 4.1 Seed Order
```
001_categories.ts         → 4 categories
002_time_modes.ts         → 3 time modes
003_features.ts           → 3 features
004_rule_sets.ts          → 5 rule sets
005_tenant.ts             → Demo tenant
006_users.ts              → 4 demo users
007_rental_objects.ts     → 40+ objects across all categories
008_bookings.ts           → 20+ demo bookings
009_blackouts.ts          → 5+ blackout periods
```

### 4.2 Demo Objects per Category
| Category | Count | Examples |
|----------|-------|----------|
| LOKALER_OG_BANER | 25 | Kulturhuset, Idrettshall, Møterom |
| UTSTYR_OG_INVENTAR | 8 | Partytelt x3, Projektor x5 |
| KJORETOY_OG_TRANSPORT | 4 | Kommunebil, Elektrisk sykkel |
| OPPLEVELSER_OG_ARRANGEMENT | 5 | Konferanse, Workshop, Kurs |

### 4.3 Demo Calendar States
- Bookings: pending, approved, confirmed, completed
- Blackouts: holiday, maintenance, reserved
- Inventory: show "x igjen"
- Capacity: show "plasser igjen"

---

## PHASE 5: APPS & COMPONENTS (Day 4)

### 5.1 Reusable Components
| Component | Purpose |
|-----------|---------|
| `RentalObjectCard` | List/grid item display |
| `RentalObjectFilters` | Category/status filters |
| `AvailabilityCalendar` | Unified calendar (3 variants) |
| `InventoryBadge` | Show remaining inventory |
| `CapacityBadge` | Show remaining capacity |
| `CategoryBadge` | Category with icon |
| `TimeModeBadge` | Time mode indicator |
| `BlackoutIndicator` | Show blocked periods |

### 5.2 Calendar Component Variants
```typescript
<AvailabilityCalendar
  rentalObjectId="xyz"
  timeMode="PERIOD"   // → timeline drag-select
  // OR
  timeMode="SLOT"     // → slot grid
  // OR
  timeMode="ALL_DAY"  // → day cards
/>
```

### 5.3 App Routes
| Route | Component | SDK Hook |
|-------|-----------|----------|
| `/rental-objects` | RentalObjectListPage | useRentalObjects() |
| `/rental-objects/:id` | RentalObjectDetailsPage | useRentalObject() |
| `/admin/rental-objects` | AdminRentalObjectsPage | useRentalObjects() |
| `/admin/rental-objects/new` | CreateRentalObjectPage | useCreateRentalObject() |

---

## PHASE 6: VERIFICATION (Day 5)

### 6.1 Contract Matrix
Generate: API Route ↔ SDK Function ↔ App Screen ↔ Component(s)

### 6.2 Automated Checks
- [ ] No "listing" in API/SDK/UI code
- [ ] All endpoints have SDK functions
- [ ] All SDK functions have types
- [ ] RFC7807 shape on all errors
- [ ] No raw fetch in apps

### 6.3 Playwright Tests
- [ ] Browse rental objects (public)
- [ ] View details with calendar
- [ ] Admin create rental object
- [ ] Booking flow per time mode
- [ ] Blackout visibility

### 6.4 Build Verification
```bash
pnpm typecheck
pnpm test
pnpm build
```

---

## TIMELINE SUMMARY

| Day | Phase | Deliverables |
|-----|-------|--------------|
| 1 | DB Schema | Tables, migrations, seed data |
| 2 | API | Endpoints, RBAC, RFC7807 |
| 3 | SDK | Types, services, hooks |
| 3 | Seeds | Full demo data |
| 4 | Apps | Components, routes |
| 5 | Verify | Tests, matrix, cleanup |

---

## SUCCESS CRITERIA

- [ ] Zero "listing" references in public API/SDK
- [ ] 4 categories seeded and functional
- [ ] 3 time modes with correct calendar UI
- [ ] 40+ rental objects in demo
- [ ] SDK 100% covers API
- [ ] Apps use SDK only (no fetch)
- [ ] All tests pass
- [ ] Demo flows work end-to-end

---

**Status**: Ready to execute  
**Next Step**: Start Phase 1 - Schema updates
