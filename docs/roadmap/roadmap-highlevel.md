# DIGILIST / XALA — HIGH-LEVEL ROADMAP

**Purpose:** Regain clarity. Start with "must exist" platform functionality, then deepen layer-by-layer.

**Core Rules:**
- `rental_object` is the bookable unit. Everything else hangs off it.
- Feature flags control modules end-to-end (API + SDK + UI), but core must always work.
- All changes follow the layer drill-down pattern: DB → API → Contracts → SDK → Apps → Tests

**Drill-Down Pattern:**
For any roadmap item, implement in this exact order:
1. **DB** - Tables + constraints + RLS
2. **API** - Endpoints + policies + RFC7807 errors
3. **Contracts/DTOs** - Stable shape, projections
4. **Client-SDK** - Services + hooks + query keys
5. **Apps** - Routes + screens + components
6. **Tests** - API + SDK + E2E

---

## LEVEL 0 — PRODUCT "ABSOLUTE CORE"

> **What must work no matter what**
>
> If Level 0 isn't 100% stable, do not expand scope.

### 0.1 Identity + Session

**Goal:** Consistent authentication and session management across all apps.

**Acceptance Criteria:**
- [ ] Login works consistently across web/minside/backoffice
- [ ] Session endpoint is deterministic (no redirect loops)
- [ ] RBAC works (admin vs user roles)
- [ ] Tenant isolation always enforced
- [ ] Logout clears session completely
- [ ] Deep link preservation after login
- [ ] Cross-subdomain SSO with `.digilist.no` cookies

**Impacted Modules:**
- **DB:** `platform.users`, `platform.sessions`, `platform.org_memberships`, `platform.permission_assignments`
- **API:** `apps/api/src/modules/auth/` (idporten.controller, session.service)
- **Contracts:** `@xala/contracts` - Auth DTOs, session payload
- **SDK:** `@digilist/client-sdk/services/authService`, `useAuth()` hook
- **Apps:** All apps - login routes, auth guards, session provider

**Tests Required:**
- [ ] E2E: Login flow (BankID + demo)
- [ ] E2E: Session persistence across apps
- [ ] E2E: Deep link preservation
- [ ] E2E: Logout clears session
- [ ] Integration: Session API endpoints
- [ ] Unit: RBAC guards

**Feature Flag:** N/A (core, always enabled)

**Status:** ✅ STABLE (locked as of 2026-01-17)

---

### 0.2 Rental Objects

**Goal:** Core bookable resource management - list, search, view details.

**Acceptance Criteria:**
- [ ] List rental objects with pagination
- [ ] Search by name/description
- [ ] Filter by category, amenities, capacity
- [ ] Details page shows images, description, rules, pricing summary
- [ ] Availability preview on details page
- [ ] Category browsing
- [ ] Publish/unpublish status
- [ ] Multi-tenant isolation (only show tenant's objects)

**Impacted Modules:**
- **DB:** `domain.rental_objects`, `domain.categories`, `domain.amenities`
- **API:** `apps/api/src/modules/rental-objects/`
- **Contracts:** `ListingProjectionDTO`, `ListingDetailDTO`
- **SDK:** `@digilist/client-sdk/services/listingService`, `useListings()` hook
- **Apps:**
  - `apps/web` - Public listing discovery
  - `apps/backoffice` - Listing management
  - `apps/minside` - User browsing

**Tests Required:**
- [ ] E2E: Browse listings as public user
- [ ] E2E: View listing details
- [ ] E2E: Filter and search
- [ ] E2E: Admin creates/edits listing
- [ ] Integration: Listing API endpoints
- [ ] Unit: Listing service methods

**Feature Flag:** N/A (core, always enabled)

**Status:** 🟡 IN PROGRESS

---

### 0.3 Availability + Booking

**Goal:** Users can check availability, create bookings, and manage them.

**Acceptance Criteria:**
- [ ] Availability calendar shows available/blocked/booked slots
- [ ] Server-side availability calculation
- [ ] Create booking (single time slot)
- [ ] View booking details
- [ ] Cancel booking (with policy checks)
- [ ] Booking approval flow (if required by rental_object)
- [ ] Conflict prevention (no double bookings)
- [ ] Booking status: pending/approved/rejected/cancelled

**Impacted Modules:**
- **DB:** `domain.bookings`, `domain.availability`, `domain.blocks`
- **API:**
  - `apps/api/src/modules/bookings/`
  - `apps/api/src/modules/availability/`
- **Contracts:** `BookingProjectionDTO`, `AvailabilityDTO`
- **SDK:**
  - `@digilist/client-sdk/services/bookingService`
  - `@digilist/client-sdk/services/availabilityService`
  - `useBookings()`, `useAvailability()` hooks
- **Apps:**
  - `apps/web` - Booking creation flow
  - `apps/minside` - My bookings
  - `apps/backoffice` - Booking queue, approval

**Tests Required:**
- [ ] E2E: Check availability
- [ ] E2E: Create booking (user flow)
- [ ] E2E: View my bookings
- [ ] E2E: Cancel booking
- [ ] E2E: Admin approves/rejects booking
- [ ] Integration: Availability calculation
- [ ] Integration: Conflict detection
- [ ] Unit: Booking service validation

**Feature Flag:** N/A (core, always enabled)

**Status:** 🟡 IN PROGRESS

---

### 0.4 Notifications (Minimum Viable)

**Goal:** Users receive notifications for booking lifecycle events.

**Acceptance Criteria:**
- [ ] Booking created → notification
- [ ] Booking approved → notification
- [ ] Booking rejected → notification (with reason)
- [ ] Booking cancelled → notification
- [ ] User can view notification list
- [ ] Mark notification as read
- [ ] At least in-app notifications work
- [ ] Real-time updates (WebSocket)

**Impacted Modules:**
- **DB:** `domain.notifications`, `domain.notification_preferences`
- **API:**
  - `apps/api/src/modules/notifications/`
  - WebSocket server integration
- **Contracts:** `NotificationDTO`, `NotificationPreferencesDTO`
- **SDK:**
  - `@digilist/client-sdk/services/notificationService`
  - `useNotifications()` hook
  - Realtime client
- **Apps:**
  - All apps - Notification bell component
  - `apps/minside` - Notification center

**Tests Required:**
- [ ] E2E: Receive notification on booking created
- [ ] E2E: Real-time notification delivery
- [ ] E2E: Mark as read
- [ ] Integration: Notification service
- [ ] Unit: Notification triggers

**Feature Flag:** N/A (core, always enabled for in-app)

**Status:** 🟡 IN PROGRESS

---

## LEVEL 1 — CORE DOMAIN MODULES

> **Must-have for municipal SaaS**

### 1.1 Calendar & Blocking

**Goal:** Administrators can block time slots for maintenance or closures.

**Acceptance Criteria:**
- [ ] Admin can create blocks (maintenance/closed)
- [ ] Blocks visible to users in availability calendar
- [ ] Block types: maintenance, closed, private event
- [ ] Recurring blocks (e.g., closed every Monday)
- [ ] Block overrides bookings (prevent conflicts)

**Impacted Modules:**
- **DB:** `domain.blocks`, `domain.block_recurrence`
- **API:** `apps/api/src/modules/blocks/`
- **Contracts:** `BlockDTO`, `BlockRecurrenceDTO`
- **SDK:**
  - `@digilist/client-sdk/services/blockService`
  - `useBlocks()` hook
- **Apps:**
  - `apps/backoffice` - Block management UI
  - `apps/web` - Display blocks in calendar

**Tests Required:**
- [ ] E2E: Admin creates block
- [ ] E2E: Block prevents booking
- [ ] E2E: User sees block in calendar
- [ ] Integration: Block conflict detection
- [ ] Unit: Recurring block calculation

**Feature Flag:** `modules.calendar_blocking`

**Status:** ⚪ NOT STARTED

---

### 1.2 Pricing (Minimum Viable)

**Goal:** Rental objects have configurable pricing, users see quote before booking.

**Acceptance Criteria:**
- [ ] Pricing groups (standard, member, student, senior)
- [ ] Price matrix per rental_object (hourly/daily rates)
- [ ] Booking quote endpoint (calculate total before booking)
- [ ] Display pricing on listing details
- [ ] Support for discounts (basic)

**Impacted Modules:**
- **DB:** `domain.pricing_groups`, `domain.pricing_rules`, `domain.discount_codes`
- **API:** `apps/api/src/modules/pricing/`
- **Contracts:** `PricingDTO`, `BookingQuoteDTO`
- **SDK:**
  - `@digilist/client-sdk/services/pricingService`
  - `usePricing()` hook
- **Apps:**
  - `apps/web` - Display pricing, quote preview
  - `apps/backoffice` - Pricing configuration

**Tests Required:**
- [ ] E2E: View pricing on listing
- [ ] E2E: Get booking quote
- [ ] E2E: Admin configures pricing
- [ ] Integration: Pricing calculation
- [ ] Unit: Discount code validation

**Feature Flag:** `modules.pricing`

**Status:** ⚪ NOT STARTED

---

### 1.3 Backoffice Essentials

**Goal:** Administrators have essential tools to manage the platform.

**Acceptance Criteria:**
- [ ] Bookings queue (pending approvals)
- [ ] Approve/reject booking with reason
- [ ] Rental object management (CRUD, publish/unpublish)
- [ ] Basic reporting export (CSV)
- [ ] Dashboard with key metrics
- [ ] Audit log viewer

**Impacted Modules:**
- **DB:** (Uses existing tables + `compliance.audit_logs`)
- **API:**
  - `apps/api/src/modules/admin/`
  - `apps/api/src/modules/reports/`
- **Contracts:** `AdminDashboardDTO`, `ReportExportDTO`
- **SDK:**
  - `@digilist/client-sdk/services/adminService`
  - `@digilist/client-sdk/services/reportsService`
  - `useAdminDashboard()` hook
- **Apps:**
  - `apps/backoffice` - Full admin portal

**Tests Required:**
- [ ] E2E: View pending bookings queue
- [ ] E2E: Approve booking
- [ ] E2E: Export report
- [ ] E2E: Manage listing
- [ ] Integration: Admin endpoints RBAC
- [ ] Unit: Report generation

**Feature Flag:** N/A (core backoffice)

**Status:** 🟡 IN PROGRESS

---

## LEVEL 2 — "ENTERPRISE SaaS" PLATFORM MODULES

> **Essential for multi-tenant SaaS platform**

### 2.1 Module-Based Feature Flags

**Goal:** Control platform features at tenant and global level.

**Acceptance Criteria:**
- [ ] Modules registry (define available modules)
- [ ] `platform.tenant_modules` storage
- [ ] `effectiveModules` in session payload
- [ ] All apps/SDK/API gated consistently
- [ ] Admin can enable/disable modules per tenant
- [ ] Feature flag checks in SDK services
- [ ] UI components hidden when module disabled

**Impacted Modules:**
- **DB:** `platform.modules`, `platform.tenant_modules`, `platform.feature_flags`
- **API:**
  - `apps/api/src/modules/feature-flags/`
  - Middleware for module checks
- **Contracts:** `ModuleDTO`, `FeatureFlagDTO`, `SessionPayload.effectiveModules`
- **SDK:**
  - `@digilist/client-sdk/services/featureFlagService`
  - `useFeatureFlags()` hook
  - Module guards in services
- **Apps:**
  - All apps - Feature flag provider
  - `apps/backoffice` - Module management UI

**Tests Required:**
- [ ] E2E: Admin enables module for tenant
- [ ] E2E: Feature appears in UI after enable
- [ ] E2E: Feature hidden when disabled
- [ ] Integration: Module guard middleware
- [ ] Unit: Feature flag resolution

**Feature Flag:** N/A (this IS the feature flag system)

**Status:** ⚪ NOT STARTED

**Priority:** HIGH (enables all other optional modules)

---

### 2.2 Billing (Platform-Level)

**Goal:** Tenant subscription and billing management.

**Acceptance Criteria:**
- [ ] Plans (free, basic, pro, enterprise)
- [ ] Subscription management per tenant
- [ ] Entitlements (module access, usage limits)
- [ ] Module entitlements per tenant
- [ ] Usage tracking (bookings, users, storage)
- [ ] Billing cycle calculation
- [ ] Invoice generation

**Impacted Modules:**
- **DB:** `saas.plans`, `saas.subscriptions`, `saas.entitlements`, `saas.invoices`, `saas.usage_logs`
- **API:** `apps/api/src/modules/billing/`
- **Contracts:** `PlanDTO`, `SubscriptionDTO`, `EntitlementDTO`
- **SDK:**
  - `@digilist/client-sdk/services/billingService`
  - `useBilling()` hook
- **Apps:**
  - `apps/backoffice` - Subscription management
  - Platform admin - Plan configuration

**Tests Required:**
- [ ] E2E: View subscription details
- [ ] E2E: Upgrade/downgrade plan
- [ ] Integration: Entitlement checks
- [ ] Integration: Usage tracking
- [ ] Unit: Billing cycle calculation

**Feature Flag:** N/A (platform-level)

**Status:** ⚪ NOT STARTED

---

### 2.3 Audit + Monitoring

**Goal:** Comprehensive audit trail and operational monitoring.

**Acceptance Criteria:**
- [ ] Audit events for all critical actions (CRUD, auth, booking lifecycle)
- [ ] Audit log storage with retention policies
- [ ] Operational logs + error events
- [ ] System status dashboard
- [ ] Performance metrics
- [ ] Error alerting
- [ ] Audit log viewer (backoffice)
- [ ] GDPR-compliant (Article 30 processing records)

**Impacted Modules:**
- **DB:** `compliance.audit_logs`, `monitoring.health_checks`, `monitoring.metrics`
- **API:**
  - `apps/api/src/modules/audit/`
  - `apps/api/src/modules/monitoring/`
  - Audit middleware
- **Contracts:** `AuditEventDTO`, `HealthCheckDTO`, `MetricDTO`
- **SDK:**
  - `@digilist/client-sdk/services/auditService`
  - `@digilist/client-sdk/services/monitoringService`
  - `useAuditLogs()` hook
- **Apps:**
  - `apps/backoffice` - Audit log viewer
  - Platform admin - System monitoring dashboard

**Tests Required:**
- [ ] E2E: View audit logs
- [ ] E2E: Filter audit logs by user/action
- [ ] Integration: Audit event creation
- [ ] Integration: Health check endpoint
- [ ] Unit: Audit event serialization

**Feature Flag:** N/A (compliance requirement, always enabled)

**Status:** 🟡 IN PROGRESS (audit logs exist, monitoring TBD)

---

### 2.4 GDPR Baseline

**Goal:** GDPR compliance foundations (consent, retention, data subject requests).

**Acceptance Criteria:**
- [ ] Consent storage (purpose, timestamp, version)
- [ ] Consent management UI
- [ ] Retention policies configuration
- [ ] DSAR (Data Subject Access Request) workflow
- [ ] Data export (user data package)
- [ ] Data deletion (right to be forgotten)
- [ ] Processing records (Article 30)
- [ ] Privacy policy versioning

**Impacted Modules:**
- **DB:** `compliance.gdpr_consents`, `compliance.gdpr_requests`, `compliance.retention_policies`
- **API:** `apps/api/src/modules/gdpr/`
- **Contracts:** `GDPRConsentDTO`, `GDPRRequestDTO`, `DataExportDTO`
- **SDK:**
  - `@digilist/client-sdk/services/gdprService`
  - `useGDPRConsents()` hook
- **Apps:**
  - `apps/minside` - Consent management, DSAR form
  - `apps/backoffice` - DSAR request processing

**Tests Required:**
- [ ] E2E: User gives consent
- [ ] E2E: User withdraws consent
- [ ] E2E: User requests data export
- [ ] E2E: User requests deletion
- [ ] Integration: DSAR processing
- [ ] Unit: Retention policy application

**Feature Flag:** N/A (compliance requirement, always enabled)

**Status:** ⚪ NOT STARTED

---

## LEVEL 3 — UX MODULES

> **Valuable features that can be toggled per tenant**

### 3.1 Messaging

**Goal:** User-admin communication via conversations.

**Acceptance Criteria:**
- [ ] Create conversation (user <-> admin)
- [ ] Send/receive messages
- [ ] Message thread view
- [ ] Internal notes (admin only, not visible to user)
- [ ] Notification on new message
- [ ] Unread message count
- [ ] Message attachments (optional)
- [ ] Real-time message delivery (WebSocket)

**Impacted Modules:**
- **DB:** `domain.conversations`, `domain.messages`, `domain.message_attachments`
- **API:** `apps/api/src/modules/conversations/`
- **Contracts:** `ConversationDTO`, `MessageDTO`
- **SDK:**
  - `@digilist/client-sdk/services/conversationService`
  - `useConversations()` hook
  - Realtime message events
- **Apps:**
  - `apps/minside` - User messaging UI
  - `apps/backoffice` - Admin messaging UI

**Tests Required:**
- [ ] E2E: User sends message
- [ ] E2E: Admin replies
- [ ] E2E: Real-time message delivery
- [ ] E2E: Internal notes (admin only)
- [ ] Integration: Conversation API
- [ ] Unit: Message validation

**Feature Flag:** `modules.messaging`

**Status:** 🟡 PARTIAL (tables exist, UI TBD)

---

### 3.2 Favorites

**Goal:** Users can save favorite rental objects for quick access.

**Acceptance Criteria:**
- [ ] Add rental object to favorites
- [ ] Remove from favorites
- [ ] View favorites list
- [ ] Favorites count indicator
- [ ] Favorites page in minside
- [ ] Sort favorites by recently added

**Impacted Modules:**
- **DB:** `domain.favorites`
- **API:** `apps/api/src/modules/favorites/`
- **Contracts:** `FavoriteDTO`
- **SDK:**
  - `@digilist/client-sdk/services/favoriteService`
  - `useFavorites()` hook
- **Apps:**
  - `apps/web` - Favorite button on listings
  - `apps/minside` - Favorites page

**Tests Required:**
- [ ] E2E: Add to favorites
- [ ] E2E: Remove from favorites
- [ ] E2E: View favorites list
- [ ] Integration: Favorites API
- [ ] Unit: Favorite service

**Feature Flag:** `modules.favorites`

**Status:** ⚪ NOT STARTED

---

### 3.3 Activities

**Goal:** Event/activity calendar with registration and capacity management.

**Acceptance Criteria:**
- [ ] Activity calendar (browse upcoming activities)
- [ ] Activity details (description, date, capacity)
- [ ] Register for activity
- [ ] Cancel registration
- [ ] Capacity handling (waitlist when full)
- [ ] Activity categories
- [ ] Admin creates/manages activities

**Impacted Modules:**
- **DB:** `domain.activities`, `domain.activity_registrations`, `domain.activity_categories`
- **API:** `apps/api/src/modules/activities/`
- **Contracts:** `ActivityDTO`, `ActivityRegistrationDTO`
- **SDK:**
  - `@digilist/client-sdk/services/activityService`
  - `useActivities()` hook
- **Apps:**
  - `apps/web` - Activity calendar
  - `apps/minside` - My registrations
  - `apps/backoffice` - Activity management

**Tests Required:**
- [ ] E2E: Browse activities
- [ ] E2E: Register for activity
- [ ] E2E: Cancel registration
- [ ] E2E: Admin creates activity
- [ ] Integration: Capacity limits
- [ ] Unit: Registration validation

**Feature Flag:** `modules.activities`

**Status:** ⚪ NOT STARTED

---

### 3.4 Reviews/Ratings

**Goal:** Users can rate and review rental objects after use.

**Acceptance Criteria:**
- [ ] Leave review after booking completed
- [ ] Star rating (1-5)
- [ ] Written review (optional)
- [ ] View reviews on listing details
- [ ] Review moderation (admin can hide inappropriate reviews)
- [ ] Average rating display
- [ ] Review sorting (newest, highest rated)

**Impacted Modules:**
- **DB:** `domain.reviews`, `domain.review_moderation`
- **API:** `apps/api/src/modules/reviews/`
- **Contracts:** `ReviewDTO`, `ReviewModerationDTO`
- **SDK:**
  - `@digilist/client-sdk/services/reviewService`
  - `useReviews()` hook
- **Apps:**
  - `apps/web` - Display reviews
  - `apps/minside` - Leave review after booking
  - `apps/backoffice` - Review moderation

**Tests Required:**
- [ ] E2E: Leave review
- [ ] E2E: View reviews
- [ ] E2E: Admin moderates review
- [ ] Integration: Review validation
- [ ] Unit: Rating calculation

**Feature Flag:** `modules.reviews`

**Status:** ⚪ NOT STARTED

---

## LEVEL 4 — INTEGRATIONS

> **Each integration is a module**

### 4.1 Authentication Providers

#### ID-porten

**Goal:** Norwegian national identity provider integration.

**Acceptance Criteria:**
- [ ] OAuth flow with ID-porten
- [ ] User profile sync (name, DOB, address)
- [ ] Session management
- [ ] Token refresh
- [ ] Logout

**Impacted Modules:**
- **DB:** `platform.users` (ID-porten attributes)
- **API:** `apps/api/src/modules/auth/idporten.controller.ts`
- **Contracts:** `IDPortenUserDTO`
- **SDK:** `@digilist/client-sdk/services/idportenService`
- **Apps:** All apps - Login button

**Tests Required:**
- [ ] E2E: Login with ID-porten
- [ ] Integration: OAuth flow
- [ ] Unit: Token handling

**Feature Flag:** `integrations.auth.idporten`

**Status:** ✅ STABLE (BankID via Signicat)

#### BankID/Signicat

**Goal:** BankID authentication via Signicat REST API.

**Acceptance Criteria:**
- [ ] BankID session creation
- [ ] User authentication
- [ ] Session callback handling
- [ ] Profile sync

**Impacted Modules:**
- **DB:** `platform.users`
- **API:** `apps/api/src/modules/auth/idporten.controller.ts` (uses Signicat)
- **Contracts:** `BankIDUserDTO`
- **SDK:** `@digilist/client-sdk/services/idportenService`
- **Apps:** All apps - Login button

**Tests Required:**
- [ ] E2E: Login with BankID
- [ ] Integration: Signicat REST API
- [ ] Unit: Session handling

**Feature Flag:** `integrations.auth.bankid`

**Status:** ✅ STABLE (locked as of 2026-01-17)

---

### 4.2 Payments

#### Vipps (Checkout)

**Goal:** Norwegian mobile payment integration for booking payments.

**Acceptance Criteria:**
- [ ] Create Vipps payment
- [ ] Payment confirmation webhook
- [ ] Payment status tracking
- [ ] Refund handling
- [ ] Payment receipt

**Impacted Modules:**
- **DB:** `domain.payments`, `domain.payment_logs`
- **API:** `apps/api/src/modules/payments/vipps.controller.ts`
- **Contracts:** `PaymentDTO`, `VippsPaymentDTO`
- **SDK:**
  - `@digilist/client-sdk/services/paymentService`
  - `usePayments()` hook
- **Apps:**
  - `apps/web` - Checkout flow
  - `apps/minside` - Payment history

**Tests Required:**
- [ ] E2E: Complete Vipps payment
- [ ] Integration: Vipps webhook
- [ ] Unit: Payment validation

**Feature Flag:** `integrations.payments.vipps`

**Status:** ⚪ NOT STARTED

#### Stripe (Billing)

**Goal:** Stripe integration for platform subscription billing.

**Acceptance Criteria:**
- [ ] Stripe customer creation
- [ ] Subscription management
- [ ] Invoice handling
- [ ] Payment method management
- [ ] Webhook handling

**Impacted Modules:**
- **DB:** `saas.subscriptions`, `saas.payment_methods`
- **API:** `apps/api/src/modules/billing/stripe.controller.ts`
- **Contracts:** `StripeSubscriptionDTO`
- **SDK:** `@digilist/client-sdk/services/billingService`
- **Apps:** `apps/backoffice` - Subscription management

**Tests Required:**
- [ ] E2E: Subscribe to plan
- [ ] Integration: Stripe webhook
- [ ] Unit: Subscription sync

**Feature Flag:** `integrations.payments.stripe`

**Status:** ⚪ NOT STARTED

---

### 4.3 Email/SMS Providers

#### Postmark (Email)

**Goal:** Transactional email delivery.

**Acceptance Criteria:**
- [ ] Email sending via Postmark API
- [ ] Template management
- [ ] Delivery tracking
- [ ] Bounce handling
- [ ] Email logs

**Impacted Modules:**
- **DB:** `domain.email_logs`
- **API:** `apps/api/src/modules/notifications/providers/postmark.ts`
- **Contracts:** `EmailLogDTO`
- **SDK:** (Internal service, not exposed)
- **Apps:** N/A (backend only)

**Tests Required:**
- [ ] Integration: Send email
- [ ] Integration: Track delivery
- [ ] Unit: Template rendering

**Feature Flag:** `integrations.notifications.postmark`

**Status:** ⚪ NOT STARTED

#### Twilio (SMS)

**Goal:** SMS notification delivery.

**Acceptance Criteria:**
- [ ] SMS sending via Twilio API
- [ ] Delivery status tracking
- [ ] SMS logs
- [ ] Rate limiting

**Impacted Modules:**
- **DB:** `domain.sms_logs`
- **API:** `apps/api/src/modules/notifications/providers/twilio.ts`
- **Contracts:** `SMSLogDTO`
- **SDK:** (Internal service, not exposed)
- **Apps:** N/A (backend only)

**Tests Required:**
- [ ] Integration: Send SMS
- [ ] Integration: Track delivery
- [ ] Unit: Message validation

**Feature Flag:** `integrations.notifications.twilio`

**Status:** ⚪ NOT STARTED

---

## LEVEL 5 — ADVANCED

> **Optional "later" features, still module-gated**

### 5.1 RAG Support / Knowledge Base

**Goal:** AI-powered knowledge base for support and policy guidance.

**Acceptance Criteria:**
- [ ] Document ingestion (policies, FAQs, guides)
- [ ] Vector embeddings storage
- [ ] Natural language query
- [ ] Link answers to rental objects & policies
- [ ] Admin document management
- [ ] Search history and analytics

**Impacted Modules:**
- **DB:** `domain.knowledge_sources`, `domain.embeddings`, `domain.queries`
- **API:** `apps/api/src/modules/knowledge-base/`
- **Contracts:** `KnowledgeSourceDTO`, `QueryResultDTO`
- **SDK:**
  - `@digilist/client-sdk/services/knowledgeBaseService`
  - `useKnowledgeBase()` hook
- **Apps:**
  - `apps/web` - Support chat widget
  - `apps/backoffice` - Document management

**Tests Required:**
- [ ] E2E: Query knowledge base
- [ ] E2E: Admin adds document
- [ ] Integration: Document ingestion
- [ ] Integration: Vector search
- [ ] Unit: Query processing

**Feature Flag:** `modules.knowledge_base`

**Status:** ⚪ NOT STARTED

---

### 5.2 SEO/GEO

**Goal:** SEO optimization and geographic search capabilities.

**Acceptance Criteria:**
- [ ] SEO metadata per listing
- [ ] Sitemap generation
- [ ] Structured data (schema.org)
- [ ] Geocoding for listings
- [ ] Geo-based search (find listings near me)
- [ ] Map view
- [ ] Distance calculation

**Impacted Modules:**
- **DB:** `domain.rental_objects` (geo columns), `domain.seo_metadata`
- **API:**
  - `apps/api/src/modules/seo/`
  - `apps/api/src/modules/geo/`
- **Contracts:** `SEOMetadataDTO`, `GeoLocationDTO`
- **SDK:**
  - `@digilist/client-sdk/services/seoService`
  - `@digilist/client-sdk/services/geoService`
  - `useGeoSearch()` hook
- **Apps:**
  - `apps/web` - Map view, geo search
  - `apps/backoffice` - SEO management

**Tests Required:**
- [ ] E2E: Geo search
- [ ] E2E: View map
- [ ] Integration: Geocoding API
- [ ] Unit: Distance calculation

**Feature Flag:** `modules.geo`, `modules.seo`

**Status:** ⚪ NOT STARTED

---

### 5.3 Reporting Builder

**Goal:** Custom report configuration and scheduled delivery.

**Acceptance Criteria:**
- [ ] Report templates (bookings, revenue, utilization)
- [ ] Custom report builder (select fields, filters, grouping)
- [ ] Scheduled report delivery (daily, weekly, monthly)
- [ ] Export formats (CSV, PDF, Excel)
- [ ] Report history
- [ ] Email delivery

**Impacted Modules:**
- **DB:** `domain.report_configs`, `domain.report_schedules`, `domain.report_history`
- **API:** `apps/api/src/modules/reporting/`
- **Contracts:** `ReportConfigDTO`, `ReportScheduleDTO`, `ReportResultDTO`
- **SDK:**
  - `@digilist/client-sdk/services/reportingService`
  - `useReports()` hook
- **Apps:**
  - `apps/backoffice` - Report builder UI

**Tests Required:**
- [ ] E2E: Create custom report
- [ ] E2E: Schedule report
- [ ] E2E: Export report
- [ ] Integration: Report generation
- [ ] Unit: Report query builder

**Feature Flag:** `modules.advanced_reporting`

**Status:** ⚪ NOT STARTED

---

## CURRENT STATE — LEVEL 0 CHECKLIST

> **What to validate first (to regain confidence)**

### Step 1: Freeze "Level 0" Checklist

| Item | Status | Notes |
|------|--------|-------|
| **0.1 Identity + Session** |
| Login works across apps | ✅ | Stable (BankID via Signicat) |
| Session endpoint deterministic | ✅ | No redirect loops |
| RBAC works (admin vs user) | ✅ | Role-based access control |
| Tenant isolation enforced | ✅ | Multi-tenant working |
| **0.2 Rental Objects** |
| List + search rental objects | 🟡 | API exists, UI needs validation |
| Details page stable | 🟡 | Needs E2E test |
| Categories working | 🟡 | DB schema exists, needs validation |
| **0.3 Availability + Booking** |
| Availability calendar | 🟡 | API exists, needs UI validation |
| Create booking | 🟡 | Flow exists, needs E2E test |
| View booking | 🟡 | Needs validation |
| Cancel booking | 🟡 | Needs validation |
| Approval flow | 🟡 | Admin approve/reject exists |
| **0.4 Notifications** |
| In-app notifications | 🟡 | DB schema exists, needs UI validation |
| Real-time delivery | ❌ | WebSocket integration TBD |

### Step 2: Validate ONE Canonical Flow

**Suggested Flow:** "User books → Admin approves → User sees notification"

**Acceptance Criteria:**
1. [ ] User logs in (BankID or demo)
2. [ ] User browses rental objects
3. [ ] User checks availability
4. [ ] User creates booking
5. [ ] Admin sees booking in queue
6. [ ] Admin approves booking
7. [ ] User receives notification
8. [ ] User views approved booking in minside

**Tests Required:**
- [ ] E2E test covering full flow
- [ ] API integration tests for each step
- [ ] WebSocket notification delivery test

### Step 3: Add Feature Flag System (Priority)

Before expanding beyond Level 0, implement **Level 2.1 (Module-Based Feature Flags)** to control all future optional modules.

**Acceptance Criteria:**
- [ ] DB: `platform.modules`, `platform.tenant_modules` tables
- [ ] API: Feature flag middleware
- [ ] SDK: `useFeatureFlags()` hook
- [ ] Apps: Feature flag provider
- [ ] Backoffice: Module management UI

---

## APPENDIX: Feature Flag Keys

| Flag Key | Level | Description |
|----------|-------|-------------|
| N/A | 0 | Core (always enabled) |
| `modules.calendar_blocking` | 1.1 | Calendar blocking |
| `modules.pricing` | 1.2 | Pricing system |
| `modules.messaging` | 3.1 | User-admin messaging |
| `modules.favorites` | 3.2 | Favorites |
| `modules.activities` | 3.3 | Activities |
| `modules.reviews` | 3.4 | Reviews/ratings |
| `integrations.auth.idporten` | 4.1 | ID-porten auth |
| `integrations.auth.bankid` | 4.1 | BankID auth |
| `integrations.payments.vipps` | 4.2 | Vipps payments |
| `integrations.payments.stripe` | 4.2 | Stripe billing |
| `integrations.notifications.postmark` | 4.3 | Postmark email |
| `integrations.notifications.twilio` | 4.3 | Twilio SMS |
| `modules.knowledge_base` | 5.1 | RAG support |
| `modules.geo` | 5.2 | Geographic search |
| `modules.seo` | 5.2 | SEO optimization |
| `modules.advanced_reporting` | 5.3 | Custom reporting |

---

## APPENDIX: Layer Drill-Down Checklist

For any roadmap item, complete these steps in order:

### A) Database

- [ ] Design tables + columns
- [ ] Add constraints (FK, unique, check)
- [ ] Create schema migration
- [ ] Add indexes for performance
- [ ] Configure RLS (row-level security)
- [ ] Seed sample data

### B) API

- [ ] Define endpoints (REST routes)
- [ ] Implement controllers
- [ ] Add validation (Zod schemas)
- [ ] Enforce policies (RBAC)
- [ ] Add audit logging
- [ ] Add RFC7807 error handling
- [ ] Write API tests

### C) Contracts/DTOs

- [ ] Define Zod schemas
- [ ] Create projection DTOs
- [ ] Add TypeScript types
- [ ] Export from `@xala/contracts`
- [ ] Version control (if breaking changes)

### D) Client-SDK

- [ ] Implement service class
- [ ] Add methods (CRUD + domain methods)
- [ ] Add React Query hooks
- [ ] Define query keys
- [ ] Add error handling
- [ ] Write SDK tests

### E) Apps

- [ ] Create routes
- [ ] Build components
- [ ] Add forms (if needed)
- [ ] Integrate SDK hooks
- [ ] Add loading/error states
- [ ] Add i18n translations
- [ ] Follow design system (@xala/ds)

### F) Tests

- [ ] Unit tests (services, utils)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (user flows)
- [ ] Accessibility tests
- [ ] Performance tests (if needed)

---

## APPENDIX: Deployment Checklist

Before deploying ANY changes:

- [ ] Verify database schemas exist and tables are in correct schemas
- [ ] Rebuild ALL dependent apps after SDK changes (`pnpm -r build`)
- [ ] Test authentication (both BankID and demo login)
- [ ] Check API logs for errors (`pm2 logs xala-api`)
- [ ] Verify cookies are set with correct domain in browser dev tools
- [ ] Monitor for 10 minutes after deployment
- [ ] Run design system compliance scan (`pnpm scan:all`)
- [ ] Run i18n localization scan (`pnpm scan:i18n`)
- [ ] Run duplicate code scanner (`pnpm scan:duplicates`)

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-17 | 1.0 | Initial roadmap created based on high-level structure |

---

**End of Roadmap**
