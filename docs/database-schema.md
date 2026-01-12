# Database Schema

This document describes the core database schema for the DIGILIST booking system.

## Schema Overview

The booking system uses a multi-tenant architecture with the following core entities:

| Table | Purpose |
|-------|---------|
| `listings` | Primary Bookable Entity |
| `bookable_units` | Unit of Availability |
| `booking_time_policies` | Time Constraints |
| `bookings` | Booking Records |
| `allocations` | Anti-Double Booking |

## Core Tables

### 1. domain.listings - Primary Bookable Entity

```sql
CREATE TABLE domain.listings (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  org_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  listing_type text NOT NULL, -- 'SPACE' | 'RESOURCE' | 'EVENT' | 'SERVICE' | 'VEHICLE' | 'OTHER'
  booking_model text NOT NULL, -- 'TIME_RANGE' | 'SLOT' | 'ALL_DAY' | 'QUANTITY' | 'CAPACITY' | 'PACKAGE'
  status text DEFAULT 'draft', -- 'draft' | 'published' | 'archived' | 'maintenance'
  capacity integer,
  quantity integer,
  default_bookable_unit_id uuid REFERENCES domain.bookable_units(id),
  metadata jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

**Listing Types:**
- `SPACE` - Physical spaces (rooms, halls, venues)
- `RESOURCE` - Equipment or resources
- `EVENT` - Time-bound events
- `SERVICE` - Services offered
- `VEHICLE` - Vehicles for rental
- `OTHER` - Other bookable items

**Booking Models:**
- `TIME_RANGE` - Book for a specific time range
- `SLOT` - Book specific time slots
- `ALL_DAY` - Full day bookings
- `QUANTITY` - Book a quantity of items
- `CAPACITY` - Book seats/capacity
- `PACKAGE` - Package bookings

### 2. domain.bookable_units - Unit of Availability

```sql
CREATE TABLE domain.bookable_units (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES domain.listings(id),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  unit_type text, -- 'space' | 'equipment' | 'resource' | 'service'
  bookable_mode text, -- 'time_slot' | 'date_range' | 'hybrid'
  charge_unit text, -- 'per_slot' | 'per_hour' | 'per_day' | 'per_week' | 'per_booking' | 'per_unit_quantity'
  capacity integer,
  min_capacity integer,
  base_price_cents integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'NOK',
  is_default boolean DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  time_policy_id uuid,
  extra jsonb
);
```

**Unit Types:**
- `space` - Physical space
- `equipment` - Equipment/gear
- `resource` - General resource
- `service` - Service offering

**Bookable Modes:**
- `time_slot` - Fixed time slots
- `date_range` - Flexible date ranges
- `hybrid` - Combination of both

**Charge Units:**
- `per_slot` - Per time slot
- `per_hour` - Hourly rate
- `per_day` - Daily rate
- `per_week` - Weekly rate
- `per_booking` - Flat per booking
- `per_unit_quantity` - Per unit/item

### 3. domain.booking_time_policies - Time Constraints

```sql
CREATE TABLE domain.booking_time_policies (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  bookable_unit_id uuid REFERENCES domain.bookable_units(id),
  bookable_mode text, -- 'time_slot' | 'date_range' | 'hybrid'
  timezone text DEFAULT 'Europe/Oslo',
  slot_step_minutes integer DEFAULT 60,
  default_duration_minutes integer DEFAULT 60,
  min_duration_minutes integer DEFAULT 60,
  max_duration_minutes integer,
  day_checkin_time text,  -- HH:mm
  day_checkout_time text, -- HH:mm
  min_days integer,
  max_days integer,
  min_lead_time_minutes integer DEFAULT 60,
  max_advance_days integer DEFAULT 90,
  buffer_before_minutes integer DEFAULT 0,
  buffer_after_minutes integer DEFAULT 0,
  rounding text DEFAULT 'ceil',
  enforce_boundary_alignment boolean DEFAULT true
);
```

**Key Time Constraints:**
- `slot_step_minutes` - Granularity of time slots
- `min_lead_time_minutes` - Minimum advance booking time
- `max_advance_days` - How far ahead bookings are allowed
- `buffer_before/after_minutes` - Buffer time between bookings

### 4. domain.bookings - Booking Records

```sql
CREATE TABLE domain.bookings (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES domain.listings(id),
  bookable_unit_id uuid REFERENCES domain.bookable_units(id),
  user_id uuid NOT NULL,
  status text, -- 'pending' | 'confirmed' | 'cancelled' | 'completed'
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  quantity integer DEFAULT 1,
  total_price_cents integer,
  currency text DEFAULT 'NOK',
  notes text,
  metadata jsonb,
  created_at timestamptz DEFAULT NOW()
);
```

**Booking Statuses:**
- `pending` - Awaiting confirmation
- `confirmed` - Booking confirmed
- `cancelled` - Booking cancelled
- `completed` - Booking completed

### 5. domain.allocations - Anti-Double Booking

```sql
CREATE TABLE domain.allocations (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES domain.listings(id),
  booking_id uuid REFERENCES domain.bookings(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  quantity integer DEFAULT 1,
  allocation_type text, -- 'BOOKING' | 'BLOCK' | 'MAINTENANCE' | 'SEASONAL'
  status text -- 'active' | 'released' | 'expired'
);
```

**Allocation Types:**
- `BOOKING` - Regular booking allocation
- `BLOCK` - Manual blocking
- `MAINTENANCE` - Maintenance period
- `SEASONAL` - Seasonal closure

## Supporting Tables

| Table | Purpose |
|-------|---------|
| `listing_media` | Images/videos for listings |
| `listing_categories` | Category taxonomy |
| `listing_event_details` | Event-specific data |
| `pricing_rules` | Dynamic pricing logic |
| `availability_rules` | Operating hours, blackouts |
| `activity_calendar` | Calendar events |
| `payments` | Payment records |
| `invoices` | Invoice generation |
| `refunds` | Refund processing |
| `add_ons` | Optional extras (e.g., equipment rental) |
| `recurring_bookings` | Recurring booking patterns |
| `shareable_links` | Public booking links |

## Entity Relationships

```
tenant
  └── org
       └── listings
            ├── bookable_units
            │    └── booking_time_policies
            ├── bookings
            │    └── allocations
            ├── listing_media
            ├── pricing_rules
            └── availability_rules
```

## Notes

- All tables use `uuid` primary keys
- Multi-tenant architecture with `tenant_id` on all tables
- Prices stored in cents (`*_cents` columns) to avoid floating point issues
- Timestamps use `timestamptz` for timezone awareness
- Default timezone is `Europe/Oslo`
- Currency defaults to `NOK` (Norwegian Krone)
