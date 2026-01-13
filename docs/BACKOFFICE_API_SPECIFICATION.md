# Digilist Backoffice - Complete API Specification

**Document Version:** 1.0
**Last Updated:** 2026-01-13
**API Base URL:** `https://api.digilist.no`

---

## Table of Contents

1. [User Roles & Permissions](#1-user-roles--permissions)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [API Endpoints by Module](#3-api-endpoints-by-module)
4. [Database Schema Requirements](#4-database-schema-requirements)
5. [User Stories & Case Studies](#5-user-stories--case-studies)
6. [Services & Controllers](#6-services--controllers)
7. [Data Types & Enums](#7-data-types--enums)

---

## 1. User Roles & Permissions

### 1.1 Role Hierarchy

| Role | Norwegian | Access Level | Description |
|------|-----------|--------------|-------------|
| `admin` | Administrator | Full | System-wide access, all modules, user management |
| `saksbehandler` | Saksbehandler | Operational | Handle requests, bookings, calendar, messages |
| `user` | Bruker | Limited | View own bookings, send messages |

### 1.2 Permission Matrix

| Module | Admin | Saksbehandler | User |
|--------|-------|---------------|------|
| **Dashboard** | Full | Read | - |
| **Listings** | CRUD | CRUD | Read (public) |
| **Calendar** | Full | Full | Read own |
| **Requests** | Full | Full | - |
| **Bookings** | Full | Full | Read/Create own |
| **Seasonal Leases** | Full | Full | - |
| **Messages** | Full | Full | Send/Read own |
| **Organizations** | Full | Read | - |
| **Users** | Full | - | Read own |
| **Reports** | Full | Read | - |
| **Settings** | Full | - | - |

### 1.3 Role-Based Access Control (RBAC) Endpoints

```
GET  /api/authz/permissions      # Get current user's permissions
GET  /api/authz/check            # Check specific permission
```

**Request: Check Permission**
```json
{
  "resource": "listings",
  "action": "create"
}
```

**Response:**
```json
{
  "allowed": true,
  "role": "admin",
  "permissions": ["listings:create", "listings:read", "listings:update", "listings:delete"]
}
```

---

## 2. Authentication & Authorization

### 2.1 Required Headers

All API requests must include:

```http
X-Tenant-Id: <tenant-uuid>
X-License-Key: <license-key>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### 2.2 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Initiate OAuth login |
| POST | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/csrf` | Get CSRF token |
| POST | `/api/auth/email` | Email/password login |
| GET | `/api/auth/providers` | List available auth providers |

### 2.3 Session Response

```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "Ola Nordmann",
      "role": "admin",
      "tenantId": "tenant-uuid"
    },
    "expiresAt": "2026-01-14T12:00:00Z",
    "permissions": ["listings:*", "bookings:*", "users:*"]
  }
}
```

---

## 3. API Endpoints by Module

### 3.1 Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

---

### 3.2 Dashboard Module

**Purpose:** Real-time overview of system status

#### Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/kpis` | Get dashboard KPIs | admin, saksbehandler |

#### KPIs Response Schema

```typescript
interface DashboardKPIs {
  activeListings: number;      // Count of published listings
  pendingRequests: number;     // Pending booking requests
  todayBookings: number;       // Bookings today
  weekBookings: number;        // Bookings this week
  monthRevenue: number;        // Revenue this month (NOK)
  previousMonthRevenue: number;
  revenueGrowth: number;       // Percentage change
  topListings: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}
```

---

### 3.3 Listings Module (Lokaler & Ressurser)

**Purpose:** Manage all bookable items (spaces, equipment, services)

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/listings` | `type`, `status`, `search`, `page`, `limit` | List all listings | all |
| GET | `/api/listings/:id` | - | Get single listing | all |
| GET | `/api/listings/slug/:slug` | - | Get by slug | all |
| POST | `/api/listings` | - | Create listing | admin, saksbehandler |
| PUT | `/api/listings/:id` | - | Update listing | admin, saksbehandler |
| PUT | `/api/listings/:id/publish` | - | Publish listing | admin, saksbehandler |
| PUT | `/api/listings/:id/archive` | - | Archive listing | admin, saksbehandler |
| DELETE | `/api/listings/:id` | - | Delete listing | admin |
| GET | `/api/listings/:id/availability` | `startDate`, `endDate` | Get availability | all |
| POST | `/api/listings/:id/media` | - | Upload media | admin, saksbehandler |
| DELETE | `/api/listings/:id/media/:mediaId` | - | Delete media | admin, saksbehandler |
| GET | `/api/listings/:id/stats` | - | Get statistics | admin, saksbehandler |
| GET | `/api/categories` | - | List categories | all |

#### Listing Types

| Type | Description | Norwegian |
|------|-------------|-----------|
| `SPACE` | Physical spaces (rooms, halls) | Lokaler |
| `RESOURCE` | Equipment, items | Utstyr |
| `SERVICE` | Services offered | Tjenester |
| `EVENT` | Time-bound events | Arrangementer |
| `VEHICLE` | Vehicle rentals | Kjøretøy |

#### Create Listing Request

```json
{
  "name": "Storstue A",
  "slug": "storstue-a",
  "type": "SPACE",
  "description": "Stor møtesal med moderne AV-utstyr",
  "images": ["https://cdn.example.com/room-a.jpg"],
  "pricing": {
    "basePrice": 500,
    "currency": "NOK",
    "unit": "hour"
  },
  "capacity": 50,
  "metadata": {
    "address": "Storgata 1",
    "city": "Oslo",
    "postalCode": "0123",
    "facilities": ["WiFi", "Projektor", "Whiteboard"],
    "openingHours": {
      "monday": { "open": "08:00", "close": "22:00" },
      "tuesday": { "open": "08:00", "close": "22:00" }
    }
  }
}
```

---

### 3.4 Calendar Module

**Purpose:** Visual planning and conflict detection

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/calendar/events` | `listingId`, `startDate`, `endDate` | Get calendar events | admin, saksbehandler |
| GET | `/api/availability/slots` | `listingId`, `date`, `duration` | Get available slots | all |
| POST | `/api/allocations` | - | Create allocation (block) | admin, saksbehandler |
| DELETE | `/api/allocations/:id` | - | Delete allocation | admin, saksbehandler |

#### Calendar Event Response

```json
{
  "data": [
    {
      "id": "event-uuid",
      "listingId": "listing-uuid",
      "listingName": "Storstue A",
      "title": "Booking: Idrettslag",
      "startTime": "2026-01-15T09:00:00Z",
      "endTime": "2026-01-15T12:00:00Z",
      "status": "confirmed",
      "bookingId": "booking-uuid",
      "userName": "Per Hansen",
      "organizationName": "Oslo Idrettslag",
      "color": "#4CAF50"
    }
  ]
}
```

#### Create Allocation (Block Time)

```json
{
  "listingId": "listing-uuid",
  "title": "Vedlikehold",
  "startTime": "2026-01-20T08:00:00Z",
  "endTime": "2026-01-20T16:00:00Z",
  "status": "maintenance",
  "notes": "Gulvslipning",
  "recurring": {
    "frequency": "weekly",
    "endDate": "2026-03-01",
    "weekdays": [1, 3, 5]
  }
}
```

---

### 3.5 Requests Module (Forespørsler)

**Purpose:** Handle incoming booking requests

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/bookings` | `status=pending` | Get pending requests | admin, saksbehandler |
| PUT | `/api/bookings/:id/confirm` | - | Approve request | admin, saksbehandler |
| PUT | `/api/bookings/:id/cancel` | - | Reject request | admin, saksbehandler |

#### Request Workflow States

```
pending → confirmed → completed
pending → cancelled
```

---

### 3.6 Bookings Module

**Purpose:** Manage all confirmed bookings

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/bookings` | `status`, `listingId`, `userId`, `page` | List bookings | admin, saksbehandler |
| GET | `/api/bookings/:id` | - | Get single booking | all |
| POST | `/api/bookings` | - | Create booking | all |
| PUT | `/api/bookings/:id` | - | Update booking | admin, saksbehandler |
| PUT | `/api/bookings/:id/status` | - | Change status | admin, saksbehandler |
| DELETE | `/api/bookings/:id` | - | Cancel booking | admin, saksbehandler |
| GET | `/api/bookings/pricing` | `listingId`, `startTime`, `endTime` | Calculate price | all |
| GET | `/api/bookings/my` | - | Get user's bookings | user |
| GET | `/api/bookings/recurring` | - | List recurring | admin, saksbehandler |
| POST | `/api/bookings/recurring` | - | Create recurring | admin, saksbehandler |

#### Booking Statuses

| Status | Norwegian | Description |
|--------|-----------|-------------|
| `pending` | Venter | Awaiting confirmation |
| `confirmed` | Bekreftet | Booking confirmed |
| `cancelled` | Kansellert | Booking cancelled |
| `completed` | Fullført | Booking completed |

#### Payment Statuses

| Status | Norwegian | Description |
|--------|-----------|-------------|
| `unpaid` | Ikke betalt | Payment pending |
| `paid` | Betalt | Payment received |
| `partial` | Delvis betalt | Partial payment |
| `refunded` | Refundert | Payment refunded |

#### Create Booking Request

```json
{
  "listingId": "listing-uuid",
  "startTime": "2026-01-20T14:00:00Z",
  "endTime": "2026-01-20T17:00:00Z",
  "notes": "Årsmøte for idrettslaget",
  "metadata": {
    "attendees": 25,
    "equipment": ["Projektor", "Mikrofon"]
  }
}
```

---

### 3.7 Seasonal Leases Module (Sesongleie)

**Purpose:** Long-term rental agreements

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/seasonal-leases` | `status`, `organizationId`, `listingId` | List leases | admin, saksbehandler |
| GET | `/api/seasonal-leases/:id` | - | Get single lease | admin, saksbehandler |
| POST | `/api/seasonal-leases` | - | Create lease | admin, saksbehandler |
| PUT | `/api/seasonal-leases/:id` | - | Update lease | admin, saksbehandler |
| PUT | `/api/seasonal-leases/:id/terminate` | - | Terminate lease | admin |

#### Seasonal Lease Statuses

| Status | Norwegian | Description |
|--------|-----------|-------------|
| `active` | Aktiv | Currently active |
| `upcoming` | Kommende | Future start date |
| `expired` | Utløpt | Past end date |
| `cancelled` | Kansellert | Manually cancelled |

#### Create Seasonal Lease Request

```json
{
  "listingId": "listing-uuid",
  "organizationId": "org-uuid",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30",
  "weekdays": [1, 3],
  "startTime": "18:00",
  "endTime": "21:00",
  "totalPrice": 25000,
  "notes": "Håndballtrening, 2 ganger ukentlig"
}
```

#### Weekday Mapping

| Value | Day | Norwegian |
|-------|-----|-----------|
| 0 | Sunday | Søndag |
| 1 | Monday | Mandag |
| 2 | Tuesday | Tirsdag |
| 3 | Wednesday | Onsdag |
| 4 | Thursday | Torsdag |
| 5 | Friday | Fredag |
| 6 | Saturday | Lørdag |

---

### 3.8 Messages Module (Meldinger)

**Purpose:** Communication between staff and users

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/conversations` | `status`, `unreadOnly` | List conversations | admin, saksbehandler, user |
| GET | `/api/conversations/:id` | - | Get conversation | all |
| GET | `/api/conversations/:id/messages` | `page`, `limit` | Get messages | all |
| POST | `/api/conversations` | - | Create conversation | all |
| POST | `/api/conversations/:id/messages` | - | Send message | all |
| PUT | `/api/conversations/:id/resolve` | - | Mark resolved | admin, saksbehandler |
| PUT | `/api/conversations/:id/read` | - | Mark as read | all |

#### Conversation Statuses

| Status | Norwegian | Description |
|--------|-----------|-------------|
| `active` | Aktiv | Open conversation |
| `resolved` | Løst | Issue resolved |
| `archived` | Arkivert | No longer active |

#### Message Sender Types

| Type | Description |
|------|-------------|
| `user` | End user |
| `admin` | Staff member |
| `system` | Automated message |

#### Send Message Request

```json
{
  "conversationId": "conv-uuid",
  "content": "Hei! Vi har mottatt din forespørsel og behandler den nå.",
  "attachments": ["https://cdn.example.com/doc.pdf"]
}
```

---

### 3.9 Organizations Module

**Purpose:** Manage organizations (clubs, businesses)

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/organizations` | `status`, `search` | List organizations | admin, saksbehandler |
| GET | `/api/organizations/:id` | - | Get organization | admin, saksbehandler |
| POST | `/api/organizations` | - | Create organization | admin |
| PUT | `/api/organizations/:id` | - | Update organization | admin |
| DELETE | `/api/organizations/:id` | - | Delete organization | admin |
| GET | `/api/organizations/:id/members` | - | List members | admin, saksbehandler |
| POST | `/api/organizations/:id/members` | - | Add member | admin |
| PUT | `/api/organizations/:id/members/:memberId` | - | Update member | admin |
| DELETE | `/api/organizations/:id/members/:memberId` | - | Remove member | admin |
| POST | `/api/organizations/:id/verify` | - | Request verification | admin |
| GET | `/api/organizations/:id/bookings` | - | Get org bookings | admin, saksbehandler |

#### Organization Statuses

| Status | Norwegian | Description |
|--------|-----------|-------------|
| `active` | Aktiv | Active organization |
| `inactive` | Inaktiv | Temporarily inactive |
| `suspended` | Suspendert | Suspended access |

#### Actor Types (Pricing Discounts)

| Actor Type | Norwegian | Discount | Verification |
|------------|-----------|----------|--------------|
| `private` | Privatperson | 0% | No |
| `business` | Bedrift | 0% | Optional (BRREG) |
| `sports_club` | Idrettslag | 30% | NIF verification |
| `youth_organization` | Ungdomsorg. | 50% | Required |
| `school` | Skole | 100% | Required |
| `municipality` | Kommune | 100% | Required |

---

### 3.10 Users Module

**Purpose:** Manage backoffice users

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/users` | `role`, `status`, `search` | List users | admin |
| GET | `/api/users/:id` | - | Get user | admin |
| GET | `/api/users/me` | - | Get current user | all |
| POST | `/api/users` | - | Create user | admin |
| PUT | `/api/users/:id` | - | Update user | admin |
| PUT | `/api/users/me` | - | Update self | all |
| PUT | `/api/users/:id/deactivate` | - | Deactivate user | admin |
| PUT | `/api/users/:id/reactivate` | - | Reactivate user | admin |

#### GDPR Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users/me/data` | Export personal data | all |
| DELETE | `/api/users/me` | Delete account | all |
| GET | `/api/users/me/consents` | Get consents | all |
| PUT | `/api/users/me/consents` | Update consents | all |

---

### 3.11 Reports Module

**Purpose:** Analytics and reporting

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/reports` | - | List available reports | admin, saksbehandler |
| GET | `/api/reports/usage` | `period`, `startDate`, `endDate`, `listingId` | Usage report | admin, saksbehandler |
| GET | `/api/reports/revenue` | `period`, `startDate`, `endDate` | Revenue report | admin |
| GET | `/api/reports/bookings` | `startDate`, `endDate` | Booking stats | admin, saksbehandler |
| GET | `/api/reports/organizations` | `startDate`, `endDate` | Organization activity | admin |
| POST | `/api/reports/export` | - | Export report | admin |

#### Report Periods

| Period | Norwegian | Description |
|--------|-----------|-------------|
| `day` | Dag | Daily breakdown |
| `week` | Uke | Weekly breakdown |
| `month` | Måned | Monthly breakdown |
| `quarter` | Kvartal | Quarterly breakdown |
| `year` | År | Yearly breakdown |

#### Export Formats

| Format | MIME Type |
|--------|-----------|
| `pdf` | application/pdf |
| `excel` | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| `csv` | text/csv |

#### Usage Report Response

```json
{
  "data": [
    {
      "period": "2026-01",
      "listingId": "listing-uuid",
      "listingName": "Storstue A",
      "totalBookings": 45,
      "totalHours": 135,
      "utilizationRate": 0.68,
      "revenue": 67500
    }
  ]
}
```

---

### 3.12 Audit Module

**Purpose:** Activity logging and traceability

#### Endpoints

| Method | Endpoint | Query Params | Description | Roles |
|--------|----------|--------------|-------------|-------|
| GET | `/api/audit` | `resource`, `action`, `userId`, `startDate`, `endDate` | Get audit logs | admin |
| GET | `/api/audit/:id` | - | Get audit event | admin |

#### Audit Event Schema

```json
{
  "id": "audit-uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "userName": "Ola Nordmann",
  "resource": "bookings",
  "action": "create",
  "resourceId": "booking-uuid",
  "changes": {
    "before": null,
    "after": { "status": "pending" }
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-01-13T10:30:00Z"
}
```

---

### 3.13 Public Endpoints (No Auth)

**Purpose:** Public-facing API for website/widgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/listings` | Public listing search |
| GET | `/api/public/listings/:id` | Public listing details |
| GET | `/api/public/listings/:id/availability` | Public availability |
| GET | `/api/public/categories` | Public categories |
| GET | `/api/public/cities` | Cities with listings |
| GET | `/api/public/municipalities` | Municipalities |
| GET | `/api/public/featured` | Featured listings |

### 3.14 Widget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widgets/listings` | Widget listing data |
| GET | `/api/widgets/embed.js` | Embeddable script |
| GET | `/api/widgets/calendar` | Calendar widget data |

### 3.15 Shareable Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/share/:token` | Get shareable link data |
| POST | `/api/share` | Create shareable link |

### 3.16 Discount Codes

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/discount-codes` | List discount codes | admin |
| POST | `/api/discount-codes` | Create discount code | admin |
| POST | `/api/discount-codes/validate` | Validate code | all |

---

## 4. Database Schema Requirements

### 4.1 Core Tables

```sql
-- Tenants (Multi-tenant support)
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings (Bookable items)
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  listing_type TEXT NOT NULL, -- SPACE, RESOURCE, SERVICE, EVENT, VEHICLE
  booking_model TEXT NOT NULL, -- TIME_RANGE, SLOT, ALL_DAY, QUANTITY
  status TEXT DEFAULT 'draft',
  capacity INTEGER,
  quantity INTEGER,
  default_bookable_unit_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookable Units
CREATE TABLE bookable_units (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES listings(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  unit_type TEXT,
  bookable_mode TEXT,
  charge_unit TEXT,
  capacity INTEGER,
  min_capacity INTEGER,
  base_price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'NOK',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  time_policy_id UUID,
  extra JSONB
);

-- Time Policies
CREATE TABLE booking_time_policies (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  bookable_unit_id UUID REFERENCES bookable_units(id),
  bookable_mode TEXT,
  timezone TEXT DEFAULT 'Europe/Oslo',
  slot_step_minutes INTEGER DEFAULT 60,
  default_duration_minutes INTEGER DEFAULT 60,
  min_duration_minutes INTEGER DEFAULT 60,
  max_duration_minutes INTEGER,
  min_lead_time_minutes INTEGER DEFAULT 60,
  max_advance_days INTEGER DEFAULT 90,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES listings(id),
  bookable_unit_id UUID,
  user_id UUID NOT NULL,
  organization_id UUID,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price_cents INTEGER,
  currency TEXT DEFAULT 'NOK',
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allocations (Anti-double booking)
CREATE TABLE allocations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES listings(id),
  booking_id UUID REFERENCES bookings(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  quantity INTEGER DEFAULT 1,
  allocation_type TEXT, -- BOOKING, BLOCK, MAINTENANCE, SEASONAL
  status TEXT DEFAULT 'active'
);

-- Seasonal Leases
CREATE TABLE seasonal_leases (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES listings(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekdays INTEGER[] NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'active',
  total_price_cents INTEGER,
  currency TEXT DEFAULT 'NOK',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  organization_number TEXT,
  actor_type TEXT DEFAULT 'private',
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  status TEXT DEFAULT 'active',
  verified BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  booking_id UUID,
  subject TEXT,
  status TEXT DEFAULT 'active',
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_type TEXT NOT NULL, -- user, admin, system
  sender_id UUID,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  user_name TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Indexes (Required)

```sql
-- Listings
CREATE INDEX idx_listings_tenant ON listings(tenant_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_type ON listings(listing_type);

-- Bookings
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(starts_at, ends_at);

-- Allocations (Critical for availability)
CREATE INDEX idx_allocations_listing ON allocations(listing_id);
CREATE INDEX idx_allocations_dates ON allocations(starts_at, ends_at);
CREATE INDEX idx_allocations_status ON allocations(status);

-- Seasonal Leases
CREATE INDEX idx_seasonal_listing ON seasonal_leases(listing_id);
CREATE INDEX idx_seasonal_org ON seasonal_leases(organization_id);
CREATE INDEX idx_seasonal_dates ON seasonal_leases(start_date, end_date);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Audit
CREATE INDEX idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_resource ON audit_log(resource, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
```

---

## 5. User Stories & Case Studies

### 5.1 Administrator Stories

#### US-A1: System Overview
**As an** Administrator
**I want to** see a dashboard with key metrics
**So that** I can monitor system health at a glance

**Acceptance Criteria:**
- See count of active listings
- See pending booking requests
- See today's and this week's bookings
- See revenue comparison (this month vs last month)
- Quick links to common actions

#### US-A2: User Management
**As an** Administrator
**I want to** manage backoffice users and their roles
**So that** I can control who has access to what

**Acceptance Criteria:**
- List all users with search/filter
- Create new users with role assignment
- Deactivate users (soft delete)
- View user activity history

#### US-A3: Organization Verification
**As an** Administrator
**I want to** verify organizations for discount eligibility
**So that** approved clubs get the correct pricing

**Acceptance Criteria:**
- View pending verification requests
- Check BRREG data for businesses
- Check NIF registry for sports clubs
- Approve/reject with reason

---

### 5.2 Saksbehandler (Case Handler) Stories

#### US-S1: Process Booking Request
**As a** Saksbehandler
**I want to** review and process incoming booking requests
**So that** users get timely responses

**Acceptance Criteria:**
- View all pending requests in a queue
- See applicant details and organization
- See requested time and conflicts
- Approve (creates booking) or reject (with reason)
- Send message to applicant

#### US-S2: Calendar Management
**As a** Saksbehandler
**I want to** view and manage the booking calendar
**So that** I can plan and prevent conflicts

**Acceptance Criteria:**
- View by day/week/month
- View by resource (listing)
- Drag-and-drop to reschedule
- Block time for maintenance
- See seasonal leases as background events

#### US-S3: Create Seasonal Lease
**As a** Saksbehandler
**I want to** create recurring seasonal leases
**So that** organizations have guaranteed time slots

**Acceptance Criteria:**
- Select listing and organization
- Define date range (start/end)
- Select weekdays (e.g., Mon, Wed)
- Set time slot (e.g., 18:00-21:00)
- Calculate total price
- System blocks calendar automatically

#### US-S4: Handle Messages
**As a** Saksbehandler
**I want to** communicate with users about their bookings
**So that** questions and issues are resolved

**Acceptance Criteria:**
- View all conversations (inbox)
- Filter by unread/booking-related
- Send messages with attachments
- Mark conversations as resolved

---

### 5.3 Case Studies

#### Case Study 1: Sports Hall Booking System

**Scenario:** Bærum Kommune manages 15 sports halls used by 50+ local clubs.

**Requirements:**
1. **Seasonal Leases:** Handball clubs need Mon/Wed 18-21 for the entire season
2. **Single Bookings:** Schools book for special events
3. **Pricing:**
   - Sports clubs (NIF verified): 30% discount
   - Schools: Free
   - Private: Full price
4. **Calendar:** Staff needs overview of all halls
5. **Reports:** Monthly usage and revenue reports

**API Usage:**
```
# Seasonal lease for handball club
POST /api/seasonal-leases
{
  "listingId": "hall-1-uuid",
  "organizationId": "handball-club-uuid",
  "startDate": "2026-01-01",
  "endDate": "2026-06-30",
  "weekdays": [1, 3],
  "startTime": "18:00",
  "endTime": "21:00"
}

# Check availability for school event
GET /api/listings/hall-1-uuid/availability?startDate=2026-02-15&endDate=2026-02-15

# Monthly usage report
GET /api/reports/usage?period=month&startDate=2026-01-01&endDate=2026-01-31
```

---

#### Case Study 2: Community Center Room Rental

**Scenario:** Kulturhuset has meeting rooms, a conference hall, and equipment for rent.

**Requirements:**
1. **Multiple Listing Types:**
   - Spaces: Meeting rooms, conference hall
   - Equipment: Projector, microphone set
2. **Combined Bookings:** User books room + equipment together
3. **Approval Workflow:** Large hall requires manual approval
4. **Messages:** Users can ask questions before booking

**API Usage:**
```
# List all listings by type
GET /api/listings?type=SPACE
GET /api/listings?type=RESOURCE

# Create booking request (requires approval)
POST /api/bookings
{
  "listingId": "conference-hall-uuid",
  "startTime": "2026-02-20T09:00:00Z",
  "endTime": "2026-02-20T17:00:00Z",
  "metadata": {
    "attendees": 100,
    "equipment": ["projector-uuid", "microphone-uuid"]
  }
}

# Staff approves
PUT /api/bookings/{id}/confirm

# User asks question via messages
POST /api/conversations
{
  "userId": "user-uuid",
  "bookingId": "booking-uuid",
  "subject": "Spørsmål om AV-utstyr",
  "initialMessage": "Er det mulig å få ekstra mikrofoner?"
}
```

---

#### Case Study 3: Multi-Location Management

**Scenario:** Idrettsservice manages facilities across 5 municipalities.

**Requirements:**
1. **Multi-Tenant:** Each municipality is a separate tenant
2. **Shared Users:** Some staff work across municipalities
3. **Reporting:** Per-tenant and aggregate reports
4. **RBAC:** Admin sees all, saksbehandler sees own tenant

**API Flow:**
```
# Staff logs in
POST /api/auth/login

# Session includes tenant context
GET /api/auth/session
Response: { "tenantId": "barum-uuid", "role": "saksbehandler" }

# All API calls scoped to tenant
Headers: X-Tenant-Id: barum-uuid

# Admin can switch tenant context
Headers: X-Tenant-Id: oslo-uuid

# Aggregate report (admin only)
GET /api/reports/usage?aggregate=true
```

---

## 6. Services & Controllers

### 6.1 Controller Layer (Fastify Routes)

```
src/routes/
├── auth.ts           # Authentication endpoints
├── bookings.ts       # Booking CRUD + status management
├── calendar.ts       # Calendar events + allocations
├── conversations.ts  # Messages + conversations
├── health.ts         # Health checks
├── listings.ts       # Listing CRUD + availability
├── organizations.ts  # Organization management
├── public.ts         # Public endpoints (no auth)
├── reports.ts        # Analytics + audit
├── seasonal-leases.ts# Seasonal lease management
├── users.ts          # User management + GDPR
└── widgets.ts        # Embed widgets
```

### 6.2 Service Layer

```typescript
// services/
├── auth.service.ts           # Authentication logic
├── booking.service.ts        # Booking business logic
├── calendar.service.ts       # Calendar + availability
├── conversation.service.ts   # Messaging logic
├── listing.service.ts        # Listing management
├── organization.service.ts   # Organization logic
├── pricing.service.ts        # Price calculation + discounts
├── report.service.ts         # Report generation
├── seasonal-lease.service.ts # Seasonal lease logic
├── user.service.ts           # User management
└── audit.service.ts          # Audit logging
```

### 6.3 Service Responsibilities

#### BookingService
```typescript
class BookingService {
  // Create booking (validates availability, calculates price)
  async create(dto: CreateBookingDTO, userId: string): Promise<Booking>

  // Confirm pending booking (admin/saksbehandler)
  async confirm(id: string, userId: string): Promise<Booking>

  // Cancel booking (releases allocation)
  async cancel(id: string, userId: string, reason?: string): Promise<Booking>

  // Calculate price with discounts
  async calculatePrice(listingId: string, start: Date, end: Date, actorType: string): Promise<number>
}
```

#### CalendarService
```typescript
class CalendarService {
  // Get events for date range
  async getEvents(params: CalendarQueryParams): Promise<CalendarEvent[]>

  // Check availability for time range
  async checkAvailability(listingId: string, start: Date, end: Date): Promise<boolean>

  // Create allocation (blocks time)
  async createAllocation(dto: CreateAllocationDTO): Promise<Allocation>

  // Get available slots
  async getAvailableSlots(listingId: string, date: Date, duration: number): Promise<TimeSlot[]>
}
```

#### SeasonalLeaseService
```typescript
class SeasonalLeaseService {
  // Create lease (auto-creates allocations)
  async create(dto: CreateSeasonalLeaseDTO): Promise<SeasonalLease>

  // Generate allocations for lease period
  async generateAllocations(lease: SeasonalLease): Promise<void>

  // Terminate lease (releases future allocations)
  async terminate(id: string): Promise<SeasonalLease>
}
```

#### PricingService
```typescript
class PricingService {
  // Calculate base price
  async calculateBasePrice(listing: Listing, hours: number): Promise<number>

  // Apply actor discount
  async applyDiscount(price: number, actorType: string): Promise<number>

  // Validate discount code
  async validateDiscountCode(code: string): Promise<DiscountCode | null>
}
```

### 6.4 Middleware

```typescript
// middleware/
├── tenant.middleware.ts     # Extract and validate X-Tenant-Id
├── auth.middleware.ts       # JWT validation + user context
├── rbac.middleware.ts       # Role-based access control
├── audit.middleware.ts      # Log API calls
└── error.middleware.ts      # Error handling
```

---

## 7. Data Types & Enums

### 7.1 Listing Types

```typescript
type ListingType =
  | 'SPACE'     // Physical spaces
  | 'RESOURCE'  // Equipment
  | 'SERVICE'   // Services
  | 'EVENT'     // Events
  | 'VEHICLE'   // Vehicles
  | 'OTHER';    // Custom
```

### 7.2 Booking Models

```typescript
type BookingModel =
  | 'TIME_RANGE'  // Start + end time
  | 'SLOT'        // Pre-defined slots
  | 'ALL_DAY'     // Full day
  | 'QUANTITY'    // Quantity-based
  | 'CAPACITY'    // Capacity-based
  | 'PACKAGE';    // Package deals
```

### 7.3 Status Enums

```typescript
// Listing status
type ListingStatus = 'draft' | 'published' | 'archived' | 'maintenance';

// Booking status
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Payment status
type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

// Allocation status
type AllocationStatus = 'confirmed' | 'pending' | 'blocked' | 'maintenance';

// Seasonal lease status
type SeasonalLeaseStatus = 'active' | 'upcoming' | 'expired' | 'cancelled';

// Conversation status
type ConversationStatus = 'active' | 'resolved' | 'archived';

// Organization status
type OrganizationStatus = 'active' | 'inactive' | 'suspended';

// User status
type UserStatus = 'active' | 'inactive' | 'suspended';
```

### 7.4 User Roles

```typescript
type UserRole = 'admin' | 'saksbehandler' | 'user';

// Norwegian translations
const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  user: 'Bruker'
};
```

### 7.5 Actor Types (Pricing)

```typescript
type ActorType =
  | 'private'           // 0% discount
  | 'business'          // 0% discount
  | 'sports_club'       // 30% discount (NIF verified)
  | 'youth_organization'// 50% discount
  | 'school'            // 100% discount
  | 'municipality';     // 100% discount

const actorDiscounts: Record<ActorType, number> = {
  private: 0,
  business: 0,
  sports_club: 0.30,
  youth_organization: 0.50,
  school: 1.00,
  municipality: 1.00
};
```

### 7.6 Pricing Units

```typescript
type PricingUnit = 'hour' | 'day' | 'booking' | 'week' | 'month';

const pricingUnitLabels: Record<PricingUnit, string> = {
  hour: 'time',
  day: 'dag',
  booking: 'booking',
  week: 'uke',
  month: 'måned'
};
```

### 7.7 Report Types

```typescript
type ReportType = 'usage' | 'revenue' | 'bookings' | 'organizations';
type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
type ExportFormat = 'pdf' | 'excel' | 'csv';
```

---

## Appendix A: Response Formats

### Standard Success Response

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-01-13T10:00:00Z"
  }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      { "field": "startTime", "message": "Must be in the future" }
    ]
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-01-13T10:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., double booking) |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Appendix B: Norwegian Integrations

### B.1 BankID Authentication
- OAuth 2.0 flow for secure login
- Age verification (18+ requirement)

### B.2 Vipps Payments
- Checkout flow integration
- Recurring payments support

### B.3 ID-porten
- Government identity provider
- Used for municipal applications

### B.4 Brønnøysund Registry (BRREG)
- Verify business organization numbers
- Lookup company information

### B.5 RCO Access Control
- Electronic lock integration
- Access code generation for bookings

### B.6 Visma ERP
- Invoice generation
- Accounting sync

---

**Document End**

*Generated: 2026-01-13*
*Version: 1.0*
