# SRSD — Software Requirements Specification Document (Digilist)
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Scope:** API + Client SDK + Web + MinSide + Backoffice + SaaS Admin  
**Primary language:** Norwegian Bokmål (nb), secondary English (en)

---

## 1) System Context & Architecture

### 1.1 System Components

**Control Plane**
- **SaaS Admin**
  - tenants, plans, subscriptions, licenses
  - entitlements/feature flags (modules/integrations/features/routes/nav)
  - billing + webhook ingestion
  - integrations catalog + config + secret rotation
  - governance + audit + incident dashboard

**Runtime Plane**
- **API**
  - contract-first endpoints + RFC7807 errors
  - authn/authz middleware
  - entitlement and custody enforcement
  - booking engine + calendar/availability
  - audit logging + observability hooks
- **Client SDK**
  - typed DTOs, services, hooks, query keys
  - single integration point for all UIs
- **Backoffice**
  - Admin/Tenant Admin + Saksbehandler + Org Admin/Org Member
- **MinSide**
  - private dashboard + organization context (membership orgs)
  - “managed listings” (custody-driven)
- **Web**
  - public discovery + listing details + dynamic calendar + booking flows

### 1.2 Architectural Style
- **SDK-first, contract-first**
- **Policy-driven**
- **RBAC + ABAC hybrid**
  - RBAC: base role permissions
  - ABAC: entitlements + custody + context constraints
- **No business logic in UI**
  - UI renders projections; API is source of truth
- **Deterministic governance**
  - entitlements evaluation is deterministic and auditable

### 1.3 Non-breaking principle
Changes must be incremental and preserve existing Digilist behavior unless explicitly versioned (contract evolution).

---

## 2) Terminology & Naming

### 2.1 Key terms
- **Listing**: any bookable resource (lokale, arrangement, sted, utstyr, etc.).  
  **Must not use “facility” anywhere.**
- **Tenant**: a municipality or customer instance (tenant_id).
- **Backoffice organization**: tenant-controlled umbrella/partner orgs, governance layer.
- **MinSide organization**: user-affiliated membership orgs loaded at sign-in (end-user context).
- **Custody**: delegation of listing management scopes to users/orgs.
- **Entitlements**: feature access determined by plan/subscription/overrides.

### 2.2 Booking modes
- SINGLE_SLOT
- IN_GAME
- RECURRING

---

## 3) Data Model (Schema Types)

> NOTE: Names below are canonical. If the repo uses different table names (e.g., `listings`), map 1:1 but keep the conceptual model identical.

### 3.1 Common Types (Enums)

**App / Context**
- `AppKey = 'api' | 'web' | 'minside' | 'backoffice' | 'saas-admin'`

**Roles**
- `RoleKey = 'PUBLIC' | 'USER' | 'ORG_MEMBER' | 'ORG_ADMIN' | 'SAKSBEHANDLER' | 'ADMIN' | 'TENANT_ADMIN' | 'SAAS_ADMIN' | 'BILLING_ADMIN' | 'SUPPORT_ADMIN' | 'AUDITOR'`

**Listing lifecycle**
- `ListingStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'`

**Booking modes**
- `BookingMode = 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING'`

**Booking status**
- `BookingStatus = 'DRAFT' | 'REQUESTED' | 'RESERVED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED'`

**Approval policy**
- `ApprovalPolicy = 'NONE' | 'REQUIRED' | 'CONDITIONAL'`

**Blackout type**
- `BlackoutType = 'MAINTENANCE' | 'BLACKOUT' | 'DISABLED'`

**Entitlements keys**
- `ModuleKey` (examples): `BOOKING`, `APPROVALS`, `REPORTING`, `AUDIT`, `BILLING`, `INTEGRATIONS`, `EXPORTS`, `ORGS`, `CUSTODY`
- `IntegrationKey` (examples): `RCO`, `ACOS`, `PAYMENT`, `EMAIL`, `MAPBOX`, `STORAGE`
- `FeatureKey` (examples): `BOOKING_RECURRING`, `BOOKING_IN_GAME`, `CALENDAR_BLACKOUTS`, `RATINGS`, `ORG_DASHBOARD`, `DSAR_EXPORT`
- `RouteKey` stable IDs (per app)
- `NavItemKey` stable IDs (per app)

**Custody**
- `CustodyGranteeType = 'USER' | 'ORG'`
- `CustodyScopeKey`:
  - `RO_VIEW`
  - `RO_EDIT`
  - `RO_MEDIA`
  - `RO_MAINTENANCE`
  - `RO_BOOKING_MANAGE`
  - `RO_PRICING`
  - `RO_REPORTING`
  - `RO_DELEGATE`

---

## 4) Database Schema (Canonical Tables)

### 4.1 Tenancy & Identity

#### `tenants`
- `id uuid pk`
- `name text not null`
- `status text not null` (ACTIVE/SUSPENDED)
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### `users`
- `id uuid pk`
- `tenant_id uuid not null fk tenants(id)`
- `email text null` (depends on auth provider)
- `name text null`
- `national_id text null` (if BankID/ID-porten)
- `status text not null` (ACTIVE/LOCKED)
- `created_at`, `updated_at`

**Constraints**
- unique: `(tenant_id, email)` where email not null
- unique: `(tenant_id, national_id)` where national_id not null

#### `user_roles`
- `id uuid pk`
- `tenant_id uuid not null`
- `user_id uuid not null fk users(id)`
- `role RoleKey not null`
- unique `(tenant_id, user_id, role)`

---

### 4.2 Organizations (Two Concepts)

#### A) Backoffice organizations (tenant-governed)
`bo_organizations`
- `id uuid pk`
- `tenant_id uuid not null`
- `name text not null`
- `status text not null`
- `created_at`, `updated_at`

`bo_org_memberships`
- `id uuid pk`
- `tenant_id uuid not null`
- `org_id uuid not null fk bo_organizations(id)`
- `user_id uuid not null fk users(id)`
- `org_role RoleKey not null` (ORG_ADMIN/ORG_MEMBER only here)
- unique `(tenant_id, org_id, user_id)`

#### B) MinSide organizations (membership context)
If stored locally:
`ms_organizations`
- `id uuid pk`
- `tenant_id uuid not null`
- `external_ref text not null` (registry id)
- `name text not null`

`ms_org_memberships`
- `tenant_id uuid not null`
- `org_id uuid not null fk ms_organizations(id)`
- `user_id uuid not null fk users(id)`
- `role RoleKey not null` (ORG_ADMIN/ORG_MEMBER)
- unique `(tenant_id, org_id, user_id)`

**Requirement**
- These org models MUST remain separate (no accidental join logic across bo/ms).

---

### 4.3 Listings (Rental Objects)

#### `listings`
- `id uuid pk`
- `tenant_id uuid not null fk tenants(id)`
- `status ListingStatus not null`
- `title text not null`
- `description text null`
- `type text not null` (your listing type taxonomy)
- `category text null` (taxonomy)
- `address text null`
- `geo_lat numeric null`
- `geo_lng numeric null`
- `capacity int null`
- `timezone text not null default 'Europe/Oslo'`
- `created_at`, `updated_at`

#### `listing_images`
- `id uuid pk`
- `tenant_id uuid not null`
- `listing_id uuid not null fk listings(id)`
- `url text not null`
- `alt_text text null`
- `sort_order int not null default 0`
- unique `(tenant_id, listing_id, url)`

#### `listing_rules`
- `id uuid pk`
- `tenant_id uuid not null`
- `listing_id uuid not null unique`
- `approval_policy ApprovalPolicy not null`
- `min_age int null`
- `cancellation_deadline_hours int null`
- `requires_terms_acceptance bool not null default true`
- `allowed_booking_modes BookingMode[] not null` (must include at least one)
- `max_booking_duration_minutes int null`
- `created_at`, `updated_at`

---

### 4.4 Availability & Blackouts

#### `listing_blackouts`
- `id uuid pk`
- `tenant_id uuid not null`
- `listing_id uuid not null fk listings(id)`
- `type BlackoutType not null`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `reason text null`
- `created_by_user_id uuid not null fk users(id)`
- `created_at`, `updated_at`

**Constraints**
- `ends_at > starts_at`
- index: `(tenant_id, listing_id, starts_at, ends_at)`

---

### 4.5 Booking

#### `bookings`
- `id uuid pk`
- `tenant_id uuid not null`
- `listing_id uuid not null fk listings(id)`
- `created_by_user_id uuid not null fk users(id)`
- `org_context_id uuid null` (if booking on behalf of org)
- `booking_mode BookingMode not null`
- `status BookingStatus not null`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `reserved_until timestamptz null` (IN_GAME TTL)
- `approval_required bool not null default false`
- `approved_by_user_id uuid null`
- `approved_at timestamptz null`
- `decline_reason text null`
- `created_at`, `updated_at`

**Constraints**
- `ends_at > starts_at`
- prevent overlaps (implementation strategy: conflict query + transaction lock; optionally exclusion constraint)

#### `booking_series` (for recurring)
- `id uuid pk`
- `tenant_id uuid not null`
- `created_by_user_id uuid not null`
- `listing_id uuid not null`
- `rrule text not null` (or structured recurrence fields)
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `status text not null` (ACTIVE/CANCELLED)
- `created_at`, `updated_at`

#### `booking_series_items`
- `id uuid pk`
- `tenant_id uuid not null`
- `series_id uuid not null fk booking_series(id)`
- `booking_id uuid null fk bookings(id)` (null if conflict/uncreated)
- `occurrence_start timestamptz not null`
- `occurrence_end timestamptz not null`
- `state text not null` (CREATED/CONFLICT/SKIPPED)
- `reason text null`

---

### 4.6 Custody & Delegation (NEW CORE)

#### `listing_custody_grants`
- `id uuid pk`
- `tenant_id uuid not null`
- `listing_id uuid not null fk listings(id)`
- `grantee_type CustodyGranteeType not null` (USER/ORG)
- `grantee_id uuid not null` (users.id or bo_organizations.id)
- `scopes CustodyScopeKey[] not null`
- `can_subdelegate bool not null default false`
- `effective_from timestamptz null`
- `effective_to timestamptz null`
- `status text not null default 'ACTIVE'` (ACTIVE/REVOKED)
- `revoked_at timestamptz null`
- `revoked_by_user_id uuid null`
- `created_by_user_id uuid not null`
- `created_at`, `updated_at`

**Constraints**
- ensure `(tenant_id, listing_id, grantee_type, grantee_id)` unique for ACTIVE grants
- time window validity if both provided: `effective_to > effective_from`
- scopes must not be empty
- tenant consistency enforced (listing belongs to tenant; grantee belongs to tenant)

#### `listing_custody_subgrants` (org admin → member)
- `id uuid pk`
- `tenant_id uuid not null`
- `parent_grant_id uuid not null fk listing_custody_grants(id)`
- `org_id uuid not null` (must equal parent grantee_id)
- `member_user_id uuid not null fk users(id)`
- `scopes CustodyScopeKey[] not null` (subset of parent scopes)
- `effective_from timestamptz null`
- `effective_to timestamptz null`
- `status text not null default 'ACTIVE'`
- `revoked_at timestamptz null`
- `revoked_by_user_id uuid null`
- `created_by_user_id uuid not null`
- `created_at`, `updated_at`

**Constraints**
- unique `(tenant_id, parent_grant_id, member_user_id)` for ACTIVE
- scopes subset rule enforced at service layer + tests
- only valid if parent grant is ORG + can_subdelegate=true

---

### 4.7 Entitlements / Feature Flags (Control Plane)

#### `plans`
- `id uuid pk`
- `name text not null`
- `status text not null` (DRAFT/PUBLISHED/ARCHIVED)
- `created_at`, `updated_at`

#### `subscriptions`
- `id uuid pk`
- `tenant_id uuid not null`
- `plan_id uuid not null fk plans(id)`
- `status text not null` (TRIAL/ACTIVE/PAUSED/CANCELLED/GRACE/EXPIRED)
- `current_period_start`, `current_period_end`
- `created_at`, `updated_at`

#### `plan_entitlements`
- `id uuid pk`
- `plan_id uuid not null`
- `key_type text not null` (MODULE/INTEGRATION/FEATURE)
- `key text not null`
- `enabled bool not null`
- unique `(plan_id, key_type, key)`

#### `tenant_entitlement_overrides`
- `id uuid pk`
- `tenant_id uuid not null`
- `key_type text not null`
- `key text not null`
- `enabled bool not null`
- `reason text null`
- `created_by_user_id uuid not null`
- `created_at`, `updated_at`
- unique `(tenant_id, key_type, key)`

#### `route_policies`
- `id uuid pk`
- `app AppKey not null`
- `route_key text not null`
- `required_roles RoleKey[] null`
- `required_modules ModuleKey[] null`
- `required_features FeatureKey[] null`
- unique `(app, route_key)`

#### `nav_policies`
- `id uuid pk`
- `app AppKey not null`
- `nav_item_key text not null`
- `label_i18n_key text not null`
- `route_key text null`
- `required_roles RoleKey[] null`
- `required_modules ModuleKey[] null`
- `required_features FeatureKey[] null`
- `visibility_mode text not null` (VISIBLE/HIDDEN/DISABLED)
- `disabled_reason_i18n_key text null`
- unique `(app, nav_item_key)`

#### `integration_configs`
- `id uuid pk`
- `tenant_id uuid not null`
- `integration_key IntegrationKey not null`
- `config_json jsonb not null`
- `status text not null` (OK/MISSING/INVALID/DISABLED)
- `last_validated_at timestamptz null`
- `created_at`, `updated_at`
- unique `(tenant_id, integration_key)`

#### `license_keys`
- `id uuid pk`
- `tenant_id uuid not null`
- `key_hash text not null` (store hash only)
- `status text not null` (ACTIVE/REVOKED/EXPIRED)
- `expires_at timestamptz null`
- `created_at`, `updated_at`
- unique `(tenant_id, key_hash)`

---

### 4.8 Audit & Incidents

#### `audit_events` (append-only)
- `id uuid pk`
- `tenant_id uuid not null`
- `actor_user_id uuid null`
- `actor_role RoleKey null`
- `app AppKey not null`
- `action text not null`
- `entity_type text not null`
- `entity_id uuid null`
- `before jsonb null`
- `after jsonb null`
- `correlation_id text not null`
- `created_at timestamptz not null`

#### `incidents` (SaaS dashboard)
- `id uuid pk`
- `source text not null` (SENTRY/LOGS/MONITOR)
- `severity text not null` (INFO/WARN/ERROR/CRITICAL)
- `app AppKey not null`
- `tenant_id uuid null`
- `org_id uuid null`
- `release text null`
- `fingerprint text not null`
- `title text not null`
- `status text not null` (OPEN/ACK/RESOLVED)
- `first_seen_at timestamptz not null`
- `last_seen_at timestamptz not null`
- `count int not null default 1`
- `link text null`
- `created_at`, `updated_at`

---

## 5) API Contracts & Error Model

### 5.1 Contract-first DTOs
- DTOs must be single source of truth (OpenAPI or typed schema).
- Client SDK generation must be in CI; drift fails build.

### 5.2 Error format (RFC7807)
All errors must return:
- `application/problem+json`
- fields: `type`, `title`, `status`, `detail`, `instance`
- extensions:
  - `correlationId`
  - `errorCode`
  - `errors` (field-level validation, when applicable)

### 5.3 Correlation IDs
- Every request generates or propagates a correlationId.
- Must appear in: response headers, RFC7807 body, logs, and Sentry events.

---

## 6) Authorization & Policy Engine

### 6.1 Unified policy evaluation
All enforcement must call a single policy service function:

`can(actor, actionScope, resource, context) -> Decision`

**Inputs**
- actor: userId, tenantId, roles[], orgContext?
- actionScope: Role/Feature/Custody scope keys
- resource: listing_id, booking_id, org_id etc.
- context: app, routeKey, feature flags, custody grants

**Decision**
- ALLOW / DENY / READONLY
- optional `reasonKey` (i18n)

### 6.2 Enforcement Layers
- API middleware/guards enforce RBAC + entitlements + custody.
- Services must re-check critical operations (defense in depth).
- UI uses SDK `useEntitlements()` and `useCan()` to hide/disable but not authorize.

### 6.3 Custody enforcement
Custody scopes grant resource-scoped abilities:
- direct user grants
- org grants (user membership in org)
- org subgrants (member assigned by org admin)
Union scopes across active grants, constrained by:
- time windows
- tenant isolation
- parent-scope subset rules
Least privilege wins in conflicts.

---

## 7) Localization & Accessibility Requirements

### 7.1 Localization (nb/en)
- All UI strings must reference i18n keys.
- CI must fail if:
  - any key missing in nb/en
  - any hardcoded user-facing string detected (AST/heuristic allowlist)
- Date/number/currency formatting must be locale-aware.

### 7.2 WCAG 2.1 AA baseline
- Critical routes must pass automated Axe checks.
- Keyboard navigation smoke tests for booking flow and admin critical flows.
- Accessible components must be used (design system).

---

## 8) Observability & Runtime Assurance

### 8.1 Sentry
- Integrate in API + Web + MinSide + Backoffice + SaaS Admin
- Upload sourcemaps and create releases
- Tag events:
  - app, environment, release, correlationId
  - tenantId/orgId as safe IDs (no PII)

### 8.2 Logging
- Structured JSON logs
- Redaction of secrets and sensitive fields
- Always include correlationId

### 8.3 Synthetic Monitoring
- Scheduled Playwright smoke against staging/prod:
  - web: search → open listing → calendar render → booking preview
  - minside: login → dashboard render → org switch
  - backoffice: login → listing manage screen loads
  - saas-admin: view tenant → entitlements page loads

### 8.4 Incident ingest into SaaS dashboard
- Sentry webhook -> API ingest -> incidents table
- Group by fingerprint + “new after release” regression view

---

## 9) Testability Requirements (System-Level)

This SRSD requires that the implementation supports:
1) **Schema coverage**: every table/column/constraint tested
2) **Contract coverage**: DTO/SDK drift prevented
3) **Policy coverage**: RBAC + entitlements + custody tested for allow/deny across roles and contexts
4) **E2E coverage**: Playwright journeys per app and per role
5) **Security coverage**: IDOR/injection/escalation scenarios proven blocked
6) **A11y + i18n**: automated checks in CI
7) **Runtime assurance**: no-console gate + env validation + synthetic monitors

---

## 10) Open Questions (Engineering Decisions)
1) Overlap prevention strategy: DB exclusion constraints vs transactional conflict detection?
2) Billing provider(s): Stripe, Vipps, both?
3) Which org model is currently persisted vs fetched at login?
4) Are listing types/categories fixed enums or dynamic taxonomy from DB?

---