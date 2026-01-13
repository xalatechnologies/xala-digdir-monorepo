# Digilist Platform - Roles & Applications Specification

**Document Version:** 1.0
**Last Updated:** 2026-01-13
**Platform:** Digilist Booking System

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Application Architecture](#2-application-architecture)
3. [User Roles](#3-user-roles)
4. [Application Specifications](#4-application-specifications)
5. [SDK Alignment](#5-sdk-alignment)
6. [User Stories by Role](#6-user-stories-by-role)

---

## 1. Platform Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIGILIST PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   PUBLIC     │  │    USER      │  │  BACKOFFICE  │          │
│  │   WEBSITE    │  │  DASHBOARD   │  │    ADMIN     │          │
│  │              │  │              │  │              │          │
│  │ - Discovery  │  │ - My Books   │  │ - All Books  │          │
│  │ - Search     │  │ - Messages   │  │ - Calendar   │          │
│  │ - Booking    │  │ - Profile    │  │ - Reports    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │   @xala/sdk │                              │
│                    │  API Client │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │  Digilist   │                              │
│                    │     API     │                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Application Domains

| Application | Domain | Primary Users | Auth Required |
|-------------|--------|---------------|---------------|
| Public Website | `digilist.no` | Anonymous | No |
| User Dashboard | `min.digilist.no` | End Users | Yes |
| Backoffice | `backoffice.digilist.no` | Staff | Yes |
| Tenant Admin | `admin.digilist.no` | Tenant Owners | Yes |

---

## 2. Application Architecture

### 2.1 Public Website (No Auth)

**Purpose:** Discovery and initial booking flow

**Features:**
- Listing search and filtering
- Listing detail pages
- Availability checking
- Initial booking request (redirects to login)
- Embedded widgets

**API Scope:**
- Public endpoints only (`/api/public/*`)
- Widget endpoints (`/api/widgets/*`)
- No tenant header required

### 2.2 User Dashboard (End User)

**Purpose:** Self-service portal for end users

**Features:**
- View own bookings
- Send messages to staff
- Manage profile
- Organization membership
- GDPR data access

**API Scope:**
- Authenticated endpoints
- Scoped to own data (`userId` filter)
- Limited to `user` role permissions

### 2.3 Backoffice (Staff)

**Purpose:** Operational management

**Features:**
- Process booking requests
- Calendar management
- Seasonal lease management
- User communication
- Basic reporting

**API Scope:**
- Full authenticated access
- Admin and Saksbehandler roles
- Tenant-scoped data

### 2.4 Tenant Admin (Platform Admin)

**Purpose:** Tenant configuration and oversight

**Features:**
- Tenant settings
- User management
- Organization management
- Full reporting
- Audit logs
- Integrations setup

**API Scope:**
- Admin role only
- Tenant configuration
- Cross-tenant for super admin

---

## 3. User Roles

### 3.1 Role Definitions

```typescript
type UserRole =
  | 'super_admin'    // Platform owner (cross-tenant)
  | 'admin'          // Tenant administrator
  | 'saksbehandler'  // Case handler / staff
  | 'user';          // End user
```

### 3.2 Role Hierarchy

```
super_admin (Platform Level)
    │
    └── admin (Tenant Level)
            │
            ├── saksbehandler (Operational)
            │
            └── user (Self-service)
```

### 3.3 Detailed Permission Matrix

#### Dashboard Access

| Feature | Super Admin | Admin | Saksbehandler | User |
|---------|-------------|-------|---------------|------|
| Platform KPIs | ✅ | ❌ | ❌ | ❌ |
| Tenant KPIs | ✅ | ✅ | ✅ | ❌ |
| Quick Actions | ✅ | ✅ | ✅ | ❌ |
| Alerts | ✅ | ✅ | ✅ | ❌ |

#### Listings

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All | ✅ | ✅ | ✅ | ❌ |
| View Published | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ |
| Publish/Archive | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

#### Bookings

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All | ✅ | ✅ | ✅ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ |
| Create (Admin) | ✅ | ✅ | ✅ | ❌ |
| Create (Self) | ✅ | ✅ | ✅ | ✅ |
| Confirm/Cancel | ✅ | ✅ | ✅ | ❌ |
| Cancel Own | ✅ | ✅ | ✅ | ✅* |

*User can cancel own bookings within cancellation policy

#### Calendar

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View Full Calendar | ✅ | ✅ | ✅ | ❌ |
| View Availability | ✅ | ✅ | ✅ | ✅ |
| Create Allocation | ✅ | ✅ | ✅ | ❌ |
| Delete Allocation | ✅ | ✅ | ✅ | ❌ |

#### Seasonal Leases

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All | ✅ | ✅ | ✅ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ |
| Terminate | ✅ | ✅ | ❌ | ❌ |

#### Messages

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All Conversations | ✅ | ✅ | ✅ | ❌ |
| View Own Conversations | ✅ | ✅ | ✅ | ✅ |
| Send Messages | ✅ | ✅ | ✅ | ✅ |
| Resolve Conversations | ✅ | ✅ | ✅ | ❌ |

#### Organizations

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All | ✅ | ✅ | ✅ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Verify | ✅ | ✅ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | Org Admin |

#### Users

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| View All | ✅ | ✅ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | Self Only |
| Deactivate | ✅ | ✅ | ❌ | ❌ |

#### Reports

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| Dashboard KPIs | ✅ | ✅ | ✅ | ❌ |
| Usage Reports | ✅ | ✅ | ✅ | ❌ |
| Revenue Reports | ✅ | ✅ | ❌ | ❌ |
| Organization Reports | ✅ | ✅ | ❌ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ |

#### Settings

| Action | Super Admin | Admin | Saksbehandler | User |
|--------|-------------|-------|---------------|------|
| Tenant Settings | ✅ | ✅ | ❌ | ❌ |
| Integrations | ✅ | ✅ | ❌ | ❌ |
| Payment Config | ✅ | ✅ | ❌ | ❌ |
| Discount Codes | ✅ | ✅ | ❌ | ❌ |

---

## 4. Application Specifications

### 4.1 Public Website

#### Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with featured listings |
| Search | `/search` | Listing search with filters |
| Listing Detail | `/listings/:slug` | Single listing details |
| Categories | `/categories` | Category browser |
| About | `/about` | About page |
| Contact | `/contact` | Contact form |

#### API Endpoints Used

```typescript
// Public Discovery
GET /api/public/listings
GET /api/public/listings/:id
GET /api/public/listings/:id/availability
GET /api/public/categories
GET /api/public/cities
GET /api/public/municipalities
GET /api/public/featured

// Widget Integration
GET /api/widgets/listings
GET /api/widgets/embed.js
GET /api/widgets/calendar
```

#### SDK Hooks Required

```typescript
// New hooks for public app
usePublicListings(params?: PublicListingParams)
usePublicListing(id: string)
usePublicAvailability(listingId: string, params: AvailabilityParams)
usePublicCategories()
useFeaturedListings()
useCities()
useMunicipalities()
```

---

### 4.2 User Dashboard

#### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview of user's activity |
| My Bookings | `/bookings` | List of user's bookings |
| Booking Detail | `/bookings/:id` | Single booking details |
| New Booking | `/book/:listingId` | Create new booking |
| Messages | `/messages` | Conversation list |
| Conversation | `/messages/:id` | Single conversation |
| Profile | `/profile` | User profile settings |
| Organization | `/organization` | Organization membership |
| Privacy | `/privacy` | GDPR data management |

#### API Endpoints Used

```typescript
// User's Bookings
GET /api/bookings/my
GET /api/bookings/:id
POST /api/bookings
DELETE /api/bookings/:id (cancel own)

// Availability (for booking flow)
GET /api/listings/:id/availability
GET /api/availability/slots

// User's Messages
GET /api/conversations (filtered by userId)
GET /api/conversations/:id
GET /api/conversations/:id/messages
POST /api/conversations
POST /api/conversations/:id/messages
PUT /api/conversations/:id/read

// User Profile
GET /api/users/me
PUT /api/users/me

// GDPR
GET /api/users/me/data
DELETE /api/users/me
GET /api/users/me/consents
PUT /api/users/me/consents

// Organization (if member)
GET /api/organizations/:id (own org)
GET /api/organizations/:id/members
```

#### SDK Hooks Required

```typescript
// User-specific hooks
useMyBookings(params?: MyBookingParams)
useMyConversations()
useMyOrganization()

// Profile management
useCurrentUser()
useUpdateProfile()
useGdprExport()
useDeleteAccount()
useConsents()
useUpdateConsents()

// Booking flow
useCreateBooking()
useCancelMyBooking()
```

---

### 4.3 Backoffice (Case Handler)

#### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPIs and quick actions |
| Requests | `/requests` | Pending booking requests |
| Bookings | `/bookings` | All bookings |
| Booking Detail | `/bookings/:id` | Single booking |
| Calendar | `/calendar` | Visual calendar |
| Listings | `/listings` | Manage listings |
| Listing Detail | `/listings/:id` | Edit listing |
| Seasons | `/seasons` | Seasonal leases |
| Messages | `/messages` | All conversations |
| Organizations | `/organizations` | Organization list (read) |

#### API Endpoints Used

```typescript
// Dashboard
GET /api/dashboard/kpis

// Requests (Pending Bookings)
GET /api/bookings?status=pending
PUT /api/bookings/:id/confirm
PUT /api/bookings/:id/cancel

// All Bookings
GET /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id
PUT /api/bookings/:id/status

// Calendar
GET /api/calendar/events
GET /api/availability/slots
POST /api/allocations
DELETE /api/allocations/:id

// Listings
GET /api/listings
GET /api/listings/:id
POST /api/listings
PUT /api/listings/:id
PUT /api/listings/:id/publish
PUT /api/listings/:id/archive
POST /api/listings/:id/media
DELETE /api/listings/:id/media/:mediaId

// Seasonal Leases
GET /api/seasonal-leases
GET /api/seasonal-leases/:id
POST /api/seasonal-leases
PUT /api/seasonal-leases/:id

// Messages
GET /api/conversations
GET /api/conversations/:id
GET /api/conversations/:id/messages
POST /api/conversations/:id/messages
PUT /api/conversations/:id/resolve
PUT /api/conversations/:id/read

// Organizations (read-only for saksbehandler)
GET /api/organizations
GET /api/organizations/:id

// Reports (limited)
GET /api/reports/usage
GET /api/reports/bookings
```

#### SDK Hooks Required

All hooks from existing SDK plus:

```typescript
// Request handling
usePendingRequests()
useApproveRequest()
useRejectRequest()

// Calendar operations
useCalendarEvents(params: CalendarParams)
useCreateAllocation()
useDeleteAllocation()

// Reports
useDashboardKPIs()
useUsageReport(params: ReportParams)
useBookingStats(params: ReportParams)
```

---

### 4.4 Tenant Admin

#### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Admin dashboard |
| Users | `/users` | User management |
| User Detail | `/users/:id` | Edit user |
| Organizations | `/organizations` | Organization management |
| Org Detail | `/organizations/:id` | Edit organization |
| Reports | `/reports` | Full reporting |
| Audit | `/audit` | Audit logs |
| Settings | `/settings` | Tenant settings |
| Integrations | `/integrations` | External integrations |
| Discount Codes | `/discounts` | Manage discounts |

#### API Endpoints Used

```typescript
// All Backoffice endpoints plus:

// User Management
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
PUT /api/users/:id/deactivate
PUT /api/users/:id/reactivate

// Organization Management
POST /api/organizations
PUT /api/organizations/:id
DELETE /api/organizations/:id
POST /api/organizations/:id/verify
POST /api/organizations/:id/members
PUT /api/organizations/:id/members/:memberId
DELETE /api/organizations/:id/members/:memberId

// Seasonal Lease Termination
PUT /api/seasonal-leases/:id/terminate

// Full Reports
GET /api/reports/revenue
GET /api/reports/organizations
POST /api/reports/export

// Audit Logs
GET /api/audit
GET /api/audit/:id

// Discount Codes
GET /api/discount-codes
POST /api/discount-codes
PUT /api/discount-codes/:id
DELETE /api/discount-codes/:id
POST /api/discount-codes/validate

// Settings (tenant-specific)
GET /api/settings
PUT /api/settings
GET /api/settings/integrations
PUT /api/settings/integrations/:provider
```

#### SDK Hooks Required

All hooks plus:

```typescript
// User management
useUsers(params?: UserParams)
useUser(id: string)
useCreateUser()
useUpdateUser()
useDeactivateUser()
useReactivateUser()

// Organization management
useCreateOrganization()
useUpdateOrganization()
useDeleteOrganization()
useVerifyOrganization()
useOrganizationMembers(orgId: string)
useAddOrganizationMember()
useUpdateOrganizationMember()
useRemoveOrganizationMember()

// Full reports
useRevenueReport(params: ReportParams)
useOrganizationReport(params: ReportParams)
useExportReport()

// Audit
useAuditLogs(params?: AuditParams)
useAuditEvent(id: string)

// Discount codes
useDiscountCodes()
useCreateDiscountCode()
useUpdateDiscountCode()
useDeleteDiscountCode()
useValidateDiscountCode()

// Settings
useTenantSettings()
useUpdateTenantSettings()
useIntegrationSettings()
useUpdateIntegrationSettings()
```

---

## 5. SDK Alignment

### 5.1 Missing Types to Add

```typescript
// =============================================================================
// Authentication Types
// =============================================================================

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  loginUrl: string;
}

// =============================================================================
// Public API Types
// =============================================================================

export interface PublicListingParams {
  type?: ListingType;
  city?: string;
  municipality?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface City {
  code: string;
  name: string;
  listingCount: number;
}

export interface Municipality {
  code: string;
  name: string;
  county: string;
  listingCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  listingCount: number;
  parentId?: string;
  children?: Category[];
}

// =============================================================================
// Discount Code Types
// =============================================================================

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  listingIds?: string[];
  actorTypes?: ActorType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeDTO {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minBookingValue?: number;
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  listingIds?: string[];
  actorTypes?: ActorType[];
}

export interface ValidateDiscountResult {
  valid: boolean;
  code?: DiscountCode;
  discountAmount?: number;
  reason?: string;
}

// =============================================================================
// Audit Types
// =============================================================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  resourceId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditQueryParams {
  resource?: string;
  action?: string;
  userId?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Settings Types
// =============================================================================

export interface TenantSettings {
  id: string;
  tenantId: string;
  displayName: string;
  logo?: string;
  primaryColor?: string;
  timezone: string;
  currency: string;
  language: string;
  bookingSettings: BookingSettings;
  notificationSettings: NotificationSettings;
  paymentSettings: PaymentSettings;
}

export interface BookingSettings {
  requireApproval: boolean;
  defaultLeadTimeMinutes: number;
  maxAdvanceDays: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationHours: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmation: boolean;
  bookingReminder: boolean;
  reminderHoursBefore: number;
}

export interface PaymentSettings {
  enabled: boolean;
  provider: 'vipps' | 'stripe' | 'invoice';
  requirePaymentUpfront: boolean;
  vatRate: number;
}

export interface IntegrationSettings {
  bankid: { enabled: boolean; clientId?: string };
  vipps: { enabled: boolean; merchantId?: string };
  idporten: { enabled: boolean; clientId?: string };
  visma: { enabled: boolean; companyId?: string };
  brreg: { enabled: boolean };
  rco: { enabled: boolean; apiKey?: string };
  outlook: { enabled: boolean };
  googleCalendar: { enabled: boolean };
}

// =============================================================================
// GDPR Types
// =============================================================================

export interface GdprDataExport {
  user: User;
  bookings: Booking[];
  conversations: Conversation[];
  organizations: Organization[];
  auditEvents: AuditEvent[];
  exportedAt: string;
}

export interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  updatedAt: string;
}
```

### 5.2 Missing Services to Add

```typescript
// services/api.ts additions

// =============================================================================
// Authentication Services
// =============================================================================

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const client = getApiClient();
  return client.post<AuthSession>('/api/auth/email', credentials);
}

export async function logout(): Promise<void> {
  const client = getApiClient();
  return client.post<void>('/api/auth/logout');
}

export async function getSession(): Promise<AuthSession> {
  const client = getApiClient();
  return client.get<AuthSession>('/api/auth/session');
}

export async function refreshToken(): Promise<AuthSession> {
  const client = getApiClient();
  return client.post<AuthSession>('/api/auth/refresh');
}

export async function getAuthProviders(): Promise<{ data: OAuthProvider[] }> {
  const client = getApiClient();
  return client.get<{ data: OAuthProvider[] }>('/api/auth/providers');
}

// =============================================================================
// Public API Services
// =============================================================================

export async function getPublicListings(params?: PublicListingParams): Promise<PaginatedResponse<Listing>> {
  const client = getApiClient();
  return client.request<PaginatedResponse<Listing>>('/api/public/listings', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
    skipTenantHeader: true,
  });
}

export async function getPublicListing(id: string): Promise<SingleResponse<Listing>> {
  const client = getApiClient();
  return client.request<SingleResponse<Listing>>(`/api/public/listings/${id}`, {
    method: 'GET',
    skipTenantHeader: true,
  });
}

export async function getPublicAvailability(listingId: string, params: AvailabilityQueryParams): Promise<{ data: TimeSlot[] }> {
  const client = getApiClient();
  return client.request<{ data: TimeSlot[] }>(`/api/public/listings/${listingId}/availability`, {
    method: 'GET',
    params: params as unknown as Record<string, string | number | boolean | undefined>,
    skipTenantHeader: true,
  });
}

export async function getPublicCategories(): Promise<{ data: Category[] }> {
  const client = getApiClient();
  return client.request<{ data: Category[] }>('/api/public/categories', {
    method: 'GET',
    skipTenantHeader: true,
  });
}

export async function getFeaturedListings(): Promise<{ data: Listing[] }> {
  const client = getApiClient();
  return client.request<{ data: Listing[] }>('/api/public/featured', {
    method: 'GET',
    skipTenantHeader: true,
  });
}

export async function getCities(): Promise<{ data: City[] }> {
  const client = getApiClient();
  return client.request<{ data: City[] }>('/api/public/cities', {
    method: 'GET',
    skipTenantHeader: true,
  });
}

export async function getMunicipalities(): Promise<{ data: Municipality[] }> {
  const client = getApiClient();
  return client.request<{ data: Municipality[] }>('/api/public/municipalities', {
    method: 'GET',
    skipTenantHeader: true,
  });
}

// =============================================================================
// User's Own Data Services
// =============================================================================

export async function getMyBookings(params?: BookingQueryParams): Promise<PaginatedResponse<Booking>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<Booking>>('/api/bookings/my', params as Record<string, string | number | boolean | undefined>);
}

export async function cancelMyBooking(id: string, reason?: string): Promise<SingleResponse<Booking>> {
  const client = getApiClient();
  return client.put<SingleResponse<Booking>>(`/api/bookings/${id}/cancel`, { reason });
}

// =============================================================================
// GDPR Services
// =============================================================================

export async function exportMyData(): Promise<GdprDataExport> {
  const client = getApiClient();
  return client.get<GdprDataExport>('/api/users/me/data');
}

export async function deleteMyAccount(): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.delete<{ success: boolean }>('/api/users/me');
}

export async function getMyConsents(): Promise<SingleResponse<ConsentSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<ConsentSettings>>('/api/users/me/consents');
}

export async function updateMyConsents(consents: Partial<ConsentSettings>): Promise<SingleResponse<ConsentSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<ConsentSettings>>('/api/users/me/consents', consents);
}

// =============================================================================
// Discount Code Services
// =============================================================================

export async function getDiscountCodes(): Promise<PaginatedResponse<DiscountCode>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<DiscountCode>>('/api/discount-codes');
}

export async function createDiscountCode(data: CreateDiscountCodeDTO): Promise<SingleResponse<DiscountCode>> {
  const client = getApiClient();
  return client.post<SingleResponse<DiscountCode>>('/api/discount-codes', data);
}

export async function updateDiscountCode(id: string, data: Partial<CreateDiscountCodeDTO>): Promise<SingleResponse<DiscountCode>> {
  const client = getApiClient();
  return client.put<SingleResponse<DiscountCode>>(`/api/discount-codes/${id}`, data);
}

export async function deleteDiscountCode(id: string): Promise<{ success: boolean }> {
  const client = getApiClient();
  return client.delete<{ success: boolean }>(`/api/discount-codes/${id}`);
}

export async function validateDiscountCode(code: string, listingId?: string): Promise<ValidateDiscountResult> {
  const client = getApiClient();
  return client.post<ValidateDiscountResult>('/api/discount-codes/validate', { code, listingId });
}

// =============================================================================
// Audit Services
// =============================================================================

export async function getAuditLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditEvent>> {
  const client = getApiClient();
  return client.get<PaginatedResponse<AuditEvent>>('/api/audit', params as Record<string, string | number | boolean | undefined>);
}

export async function getAuditEvent(id: string): Promise<SingleResponse<AuditEvent>> {
  const client = getApiClient();
  return client.get<SingleResponse<AuditEvent>>(`/api/audit/${id}`);
}

// =============================================================================
// Settings Services
// =============================================================================

export async function getTenantSettings(): Promise<SingleResponse<TenantSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<TenantSettings>>('/api/settings');
}

export async function updateTenantSettings(data: Partial<TenantSettings>): Promise<SingleResponse<TenantSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<TenantSettings>>('/api/settings', data);
}

export async function getIntegrationSettings(): Promise<SingleResponse<IntegrationSettings>> {
  const client = getApiClient();
  return client.get<SingleResponse<IntegrationSettings>>('/api/settings/integrations');
}

export async function updateIntegrationSettings(provider: string, data: Record<string, unknown>): Promise<SingleResponse<IntegrationSettings>> {
  const client = getApiClient();
  return client.put<SingleResponse<IntegrationSettings>>(`/api/settings/integrations/${provider}`, data);
}
```

### 5.3 Missing Hooks to Add

```typescript
// hooks/useAuth.ts
export const authKeys = {
  session: ['auth', 'session'] as const,
  providers: ['auth', 'providers'] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => getSession(),
    retry: false,
  });
}

export function useAuthProviders() {
  return useQuery({
    queryKey: authKeys.providers,
    queryFn: () => getAuthProviders(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session, data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.session });
    },
  });
}

// hooks/usePublic.ts
export const publicKeys = {
  listings: (params?: PublicListingParams) => ['public', 'listings', params] as const,
  listing: (id: string) => ['public', 'listing', id] as const,
  availability: (listingId: string, params: AvailabilityQueryParams) =>
    ['public', 'availability', listingId, params] as const,
  categories: ['public', 'categories'] as const,
  featured: ['public', 'featured'] as const,
  cities: ['public', 'cities'] as const,
  municipalities: ['public', 'municipalities'] as const,
};

export function usePublicListings(params?: PublicListingParams) {
  return useQuery({
    queryKey: publicKeys.listings(params),
    queryFn: () => getPublicListings(params),
  });
}

export function usePublicListing(id: string) {
  return useQuery({
    queryKey: publicKeys.listing(id),
    queryFn: () => getPublicListing(id),
    enabled: !!id,
  });
}

export function usePublicAvailability(listingId: string, params: AvailabilityQueryParams) {
  return useQuery({
    queryKey: publicKeys.availability(listingId, params),
    queryFn: () => getPublicAvailability(listingId, params),
    enabled: !!listingId && !!params.startDate,
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: publicKeys.categories,
    queryFn: () => getPublicCategories(),
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: publicKeys.featured,
    queryFn: () => getFeaturedListings(),
  });
}

export function useCities() {
  return useQuery({
    queryKey: publicKeys.cities,
    queryFn: () => getCities(),
  });
}

export function useMunicipalities() {
  return useQuery({
    queryKey: publicKeys.municipalities,
    queryFn: () => getMunicipalities(),
  });
}

// hooks/useMyData.ts
export const myDataKeys = {
  bookings: (params?: BookingQueryParams) => ['my', 'bookings', params] as const,
  consents: ['my', 'consents'] as const,
};

export function useMyBookings(params?: BookingQueryParams) {
  return useQuery({
    queryKey: myDataKeys.bookings(params),
    queryFn: () => getMyBookings(params),
  });
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelMyBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my', 'bookings'] });
    },
  });
}

export function useGdprExport() {
  return useMutation({
    mutationFn: () => exportMyData(),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => deleteMyAccount(),
  });
}

export function useMyConsents() {
  return useQuery({
    queryKey: myDataKeys.consents,
    queryFn: () => getMyConsents(),
  });
}

export function useUpdateMyConsents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consents: Partial<ConsentSettings>) => updateMyConsents(consents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myDataKeys.consents });
    },
  });
}

// hooks/useDiscountCodes.ts
export const discountCodeKeys = {
  all: ['discountCodes'] as const,
  list: () => [...discountCodeKeys.all, 'list'] as const,
};

export function useDiscountCodes() {
  return useQuery({
    queryKey: discountCodeKeys.list(),
    queryFn: () => getDiscountCodes(),
  });
}

export function useCreateDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountCodeDTO) => createDiscountCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscountCodeDTO> }) =>
      updateDiscountCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountCodeKeys.list() });
    },
  });
}

export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: ({ code, listingId }: { code: string; listingId?: string }) =>
      validateDiscountCode(code, listingId),
  });
}

// hooks/useAudit.ts
export const auditKeys = {
  all: ['audit'] as const,
  list: (params?: AuditQueryParams) => [...auditKeys.all, 'list', params] as const,
  detail: (id: string) => [...auditKeys.all, 'detail', id] as const,
};

export function useAuditLogs(params?: AuditQueryParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogs(params),
  });
}

export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => getAuditEvent(id),
    enabled: !!id,
  });
}

// hooks/useSettings.ts
export const settingsKeys = {
  tenant: ['settings', 'tenant'] as const,
  integrations: ['settings', 'integrations'] as const,
};

export function useTenantSettings() {
  return useQuery({
    queryKey: settingsKeys.tenant,
    queryFn: () => getTenantSettings(),
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TenantSettings>) => updateTenantSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.tenant });
    },
  });
}

export function useIntegrationSettings() {
  return useQuery({
    queryKey: settingsKeys.integrations,
    queryFn: () => getIntegrationSettings(),
  });
}

export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: Record<string, unknown> }) =>
      updateIntegrationSettings(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.integrations });
    },
  });
}
```

---

## 6. User Stories by Role

### 6.1 Public User (Anonymous)

#### US-PUB-1: Discover Listings
**As a** visitor
**I want to** browse available spaces and equipment
**So that** I can find what I need

**Acceptance Criteria:**
- View featured listings on homepage
- Filter by city, category, price range
- See availability calendar
- View listing details with images

#### US-PUB-2: Check Availability
**As a** visitor
**I want to** see when a space is available
**So that** I can plan my booking

**Acceptance Criteria:**
- View calendar with available/booked times
- Select dates to check availability
- See pricing for selected period
- Redirect to login when trying to book

---

### 6.2 End User (Logged In)

#### US-USER-1: Make a Booking
**As a** registered user
**I want to** book a space or equipment
**So that** I can use it for my event

**Acceptance Criteria:**
- Select listing and time slot
- Add notes/requirements
- Apply discount code if available
- Receive confirmation email

#### US-USER-2: View My Bookings
**As a** user
**I want to** see all my bookings
**So that** I can track my reservations

**Acceptance Criteria:**
- View upcoming and past bookings
- Filter by status
- Cancel bookings within policy
- See booking details

#### US-USER-3: Communicate with Staff
**As a** user
**I want to** send messages about my booking
**So that** I can ask questions or report issues

**Acceptance Criteria:**
- Start new conversation
- View conversation history
- Attach files if needed
- Receive notifications

#### US-USER-4: Manage Privacy
**As a** user
**I want to** control my personal data
**So that** I comply with my privacy preferences

**Acceptance Criteria:**
- Export all my data (GDPR)
- Delete my account
- Manage consent preferences

---

### 6.3 Saksbehandler (Case Handler)

#### US-SAKS-1: Process Booking Requests
**As a** case handler
**I want to** review and approve booking requests
**So that** users get timely responses

**Acceptance Criteria:**
- View pending requests queue
- See applicant and organization details
- Check for calendar conflicts
- Approve or reject with message

#### US-SAKS-2: Manage Calendar
**As a** case handler
**I want to** view and manage the booking calendar
**So that** I can prevent conflicts and plan

**Acceptance Criteria:**
- View by day/week/month
- View by resource
- Block time for maintenance
- See seasonal leases

#### US-SAKS-3: Handle Customer Communication
**As a** case handler
**I want to** respond to user messages
**So that** issues are resolved quickly

**Acceptance Criteria:**
- View all conversations
- Filter unread messages
- Send responses
- Mark as resolved

---

### 6.4 Administrator

#### US-ADMIN-1: Manage Users
**As an** administrator
**I want to** manage backoffice users
**So that** the right people have access

**Acceptance Criteria:**
- Create new staff accounts
- Assign roles (admin, saksbehandler)
- Deactivate users
- View user activity

#### US-ADMIN-2: Manage Organizations
**As an** administrator
**I want to** manage customer organizations
**So that** they get correct pricing and access

**Acceptance Criteria:**
- Create organizations
- Verify for discounts (NIF, BRREG)
- Manage members
- View organization activity

#### US-ADMIN-3: View Reports
**As an** administrator
**I want to** see usage and revenue reports
**So that** I can make informed decisions

**Acceptance Criteria:**
- View usage by listing
- View revenue by period
- Export to PDF/Excel
- Compare periods

#### US-ADMIN-4: View Audit Logs
**As an** administrator
**I want to** see system activity
**So that** I can track changes and issues

**Acceptance Criteria:**
- View all system events
- Filter by resource, action, user
- Export audit trail

#### US-ADMIN-5: Configure Settings
**As an** administrator
**I want to** configure tenant settings
**So that** the system works as needed

**Acceptance Criteria:**
- Set booking policies
- Configure notifications
- Manage discount codes
- Set up integrations

---

## Appendix A: API Endpoint Summary by Application

### Public Website Endpoints
```
GET /api/public/listings
GET /api/public/listings/:id
GET /api/public/listings/:id/availability
GET /api/public/categories
GET /api/public/cities
GET /api/public/municipalities
GET /api/public/featured
GET /api/widgets/*
```

### User Dashboard Endpoints
```
GET /api/auth/session
GET /api/bookings/my
GET /api/bookings/:id
POST /api/bookings
PUT /api/bookings/:id/cancel
GET /api/conversations (own)
POST /api/conversations
POST /api/conversations/:id/messages
GET /api/users/me
PUT /api/users/me
GET /api/users/me/data
DELETE /api/users/me
GET /api/users/me/consents
PUT /api/users/me/consents
```

### Backoffice Endpoints (Saksbehandler)
```
GET /api/dashboard/kpis
GET /api/bookings (all with filters)
PUT /api/bookings/:id/confirm
PUT /api/bookings/:id/cancel
GET /api/calendar/events
POST /api/allocations
DELETE /api/allocations/:id
GET /api/listings (all)
POST /api/listings
PUT /api/listings/:id
GET /api/seasonal-leases (all)
POST /api/seasonal-leases
GET /api/conversations (all)
GET /api/organizations (read)
GET /api/reports/usage
GET /api/reports/bookings
```

### Tenant Admin Endpoints (Additional)
```
GET /api/users
POST /api/users
PUT /api/users/:id
PUT /api/users/:id/deactivate
POST /api/organizations
PUT /api/organizations/:id
DELETE /api/organizations/:id
POST /api/organizations/:id/verify
PUT /api/seasonal-leases/:id/terminate
GET /api/reports/revenue
GET /api/reports/organizations
POST /api/reports/export
GET /api/audit
GET /api/discount-codes
POST /api/discount-codes
GET /api/settings
PUT /api/settings
```

---

**Document End**

*Generated: 2026-01-13*
*Version: 1.0*
