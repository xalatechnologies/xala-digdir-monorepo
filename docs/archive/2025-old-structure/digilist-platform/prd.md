# PRD — Digilist Platform (Web + MinSide + Backoffice + SaaS Admin)
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Owner:** Xala Technologies AS  
**Product:** Digilist (Norwegian municipal booking SaaS)

---

## 1) Overview

Digilist is a **multi-tenant SaaS platform** for Norwegian municipalities and partner organizations to **publish, manage, delegate, and book** rentable resources (bookable items) with strong governance, compliance, and operational control.

The platform consists of four applications:
- **Web (Public + Authenticated):** search/discovery, listing details, dynamic calendar, booking flows
- **MinSide:** end-user dashboard (private + organization context) for bookings, delegated responsibilities, org features
- **Backoffice:** administrative UI for **Admin/Tenant Admin**, **Saksbehandler**, and **Org Admin/Org Member** operational tasks
- **SaaS Admin (Control Plane):** tenants, plans, subscriptions, **license keys**, **entitlements/feature flags**, billing, integrations, and audit governance

This PRD includes:
- product goals and scope
- users/roles and experiences
- epics and user stories
- core domain concepts including **custody/delegation** and **entitlements**
- real-world scenarios and acceptance criteria
- compliance and non-functional requirements (WCAG/GDPR/security/runtime assurance)
- testability requirements at product level (what must be provable)

---

## 2) Goals

### 2.1 Primary goals
1. Enable municipalities to manage and publish **bookable resources** with accurate rules, availability, and pricing.
2. Enable users to find and book resources using a **dynamic calendar** with support for:
   - single-slot booking
   - in-game booking (short TTL reserve-confirm)
   - recurring booking (preview conflicts + partial success policy)
3. Provide operational workflows for approvals, cancellations, maintenance windows, and reporting.
4. Provide a **custody/delegation** model so tenant admins can delegate responsibility per resource to:
   - users
   - organizations
   - multiple of each simultaneously
   and allow org admins to sub-delegate to members (within scope).
5. Provide a **control plane** (SaaS Admin) for:
   - subscriptions & billing
   - issuing and managing license keys
   - entitlements / feature flags (modules, integrations, features, routes, sidebar items per role/context)
6. Ensure compliance and operational readiness:
   - WCAG 2.1 AA baseline
   - GDPR by design (minimization, retention, DSAR surfaces where applicable)
   - strong observability: runtime incidents visible in SaaS dashboard within minutes

### 2.2 Secondary goals
- Support integrations (e.g., locks/door systems, archive/journal, payment providers) in a controlled, testable way.
- Provide evidence-driven quality (traceability matrix, coverage evidence) suitable for municipal procurement evaluation.

---

## 3) Non-Goals (for this PRD scope)
- Building a full CMS or marketing site (beyond what is required for discovery and booking).
- Replacing external billing providers with a custom payment gateway.
- Full automation of all municipal case processing beyond booking approvals (out of scope unless specified in requirements).

---

## 4) Product Principles

1. **Control-plane vs Runtime separation**
   - SaaS Admin controls policies and configuration.
   - Runtime apps (Web/MinSide/Backoffice/API) consume effective policies and enforce them.

2. **RBAC + ABAC Hybrid**
   - RBAC is the base: role decides default powers.
   - ABAC adds resource-scoped custody and feature entitlements.
   - “UI hiding” is not security; server enforcement is mandatory.

3. **Contract-first & SDK-first**
   - API contracts/DTOs are the source of truth.
   - Frontends must integrate via Client SDK (services + hooks).

4. **Evidence-driven quality**
   - Features are not “done” unless test evidence exists:
     - unit + integration + contract + e2e + security + a11y + i18n checks

5. **Localization-first**
   - Norwegian Bokmål is primary; English is required.
   - No hardcoded strings in user-facing UI.

---

## 5) Personas & Roles

### 5.1 Roles (platform-wide)
- **Public (anonymous)**
- **User (private authenticated)**
- **Org Member (authenticated, organization context)**
- **Org Admin (authenticated, can manage org membership and delegated custody)**
- **Saksbehandler (case handler)**
- **Admin / Tenant Admin (tenant-level authority)**
- **SaaS Admin (platform operator / super admin)**

### 5.2 Organization concepts (must remain separate)
- **Backoffice Organizations (tenant-governed umbrella/partner orgs):**
  Managed by Tenant Admin; used for governance and delegation of resources.
- **MinSide Organizations (user-affiliated membership orgs):**
  Loaded at sign-in from registries; represent user membership context only.
These two organization concepts must not be conflated in data, policies, or UI.

---

## 6) Core Concepts

### 6.1 Listing (Bookable Resource)
A **listing** is the platform’s single term for any bookable resource (lokaler, arrangementer, steder, utstyr, etc.).  
(“facility” must never appear in code/contracts/docs.)

Listings support:
- metadata (title, description, images)
- location/address (optional geocode)
- capacity and attributes
- availability/calendar configuration
- rules (booking modes, approval rules, deadlines, age constraints)
- pricing (where enabled)
- integrations (where enabled)

### 6.2 Booking Modes
- **SINGLE_SLOT:** normal selection and confirmation
- **IN_GAME:** short-lived reservation with TTL and confirm step
- **RECURRING:** weekly/monthly patterns with conflict preview and partial failures

### 6.3 Maintenance / Blackouts
Admins/custodians can block availability for:
- maintenance
- blackout periods
- disabled slots
These must be visible in Web calendar and enforce booking denial.

### 6.4 Custody & Delegation (NEW CORE)
A listing can be delegated to:
- 1..N **Users**
- 1..N **Organizations**
- and both simultaneously.

Delegation is scope-based (examples):
- view admin panels
- edit listing
- manage images
- manage maintenance/blackouts
- manage bookings (approve/deny/override)
- pricing/reporting (if enabled)
- sub-delegate to org members (optional)

Org Admins can assign custody to members only if:
- organization has custody grant with subdelegation allowed
- member is within that org
- assigned scopes are subset of parent scopes

### 6.5 Entitlements / Feature Flags (Control Plane)
Must control:
- **Modules** (whole domains)
- **Integrations** (enabled + configuration completeness)
- **Features** (fine-grained toggles)
- **Routes** (allowed/denied per role/context)
- **Sidebar items** (visible/hidden/disabled per role/context)

Precedence (deterministic):
1. global kill switch
2. tenant override
3. plan defaults
4. role restrictions (least privilege wins)

### 6.6 Observability & Runtime Assurance
Runtime failures must not be “surprises”.
- Sentry (errors + performance) with releases + sourcemaps
- structured logs with correlationId
- synthetic Playwright monitors against staging/prod
- incident ingest into SaaS dashboard: “new after release”, “spikes”, “top errors”

---

## 7) High-Level Customer Journeys (Real-World Scenarios)

### 7.1 Public discovery → booking
1. Public user searches for listings.
2. Opens listing details and reviews rules and calendar.
3. Selects time slot (or recurring pattern).
4. If login required: redirected to login and returned to same step.
5. Confirms booking; payment may be required.
6. Receives confirmation; calendar updates.

### 7.2 Approval-based booking
1. User submits request.
2. Saksbehandler reviews, approves/denies.
3. User gets status updates; audit logs reflect decision.

### 7.3 Delegation scenario (Steinkjer example)
1. Tenant Admin selects 10 listings and delegates custody to “Kulturhus” org.
2. Org Admin sees “managed listings” in MinSide/Backoffice.
3. Org Admin assigns one listing to a member for maintenance duties.
4. Member blocks a maintenance window; Web calendar shows blackout; bookings denied accordingly.
5. All actions appear in audit log and SaaS incident dashboard if errors occur.

### 7.4 SaaS Admin governance
1. SaaS Admin creates plan and enables modules (e.g., recurring booking).
2. Tenant subscribes; SaaS Admin issues license key.
3. Tenant Admin sees only enabled modules/routes in Backoffice.
4. Feature flag toggles update effective config across apps.
5. Billing webhook updates subscription status; entitlements adjust accordingly.

---

## 8) Epics

### EPIC A — Platform Foundations (Contracts, SDK, Compliance Baselines)
- Contract-first DTOs, RFC7807 errors, correlation IDs
- Client SDK services + hooks (single integration path)
- Localization framework (nb/en)
- Accessibility baseline for UI patterns
- Observability foundation (Sentry + logs + tracing hooks)

### EPIC B — Listings & Calendar Engine
- listing lifecycle (draft/published/archived)
- details page data model and UI sections
- availability computation + calendar rendering
- maintenance/blackout management

### EPIC C — Booking Engine (All Modes)
- single slot booking end-to-end
- in-game booking with TTL
- recurring booking preview + create + partial failures
- approvals and cancellation policies

### EPIC D — Backoffice Role Operations
- Admin/Tenant Admin operations (full)
- Saksbehandler operations (restricted)
- Org Admin / Org Member operations (custody-driven, restricted)
- reporting, audit viewer (where enabled)

### EPIC E — MinSide (Private + Org Context)
- dashboards
- context switching
- my bookings
- managed listings (custody)
- org membership flows (where enabled)

### EPIC F — SaaS Admin (Control Plane)
- tenants, plans, subscriptions
- license keys issuance/rotation/revocation
- entitlements editor (modules/integrations/features/routes/sidebar per role/context)
- billing + webhooks
- integrations catalog + secret rotation + health checks
- governance + audit

### EPIC G — Custody & Delegation (NEW CORE)
- grants (user/org) + scopes + time windows
- sub-delegation (org admin → members)
- effective permission evaluation
- UI & API enforcement + audit

### EPIC H — Quality, Security, and Runtime Assurance
- full test suites + coverage evidence
- SAST/DAST baseline
- load tests for hot paths
- mutation tests for critical policy engines
- synthetic monitoring + incident pipeline to SaaS dashboard

---

## 9) User Stories (Representative, not exhaustive)

### 9.1 Web (Public/User)
- As a public user, I can search/filter listings and view listing details with all tabs/sections.
- As a user, I can book a single slot and receive confirmation.
- As a user, I can attempt a recurring booking and preview conflicts before confirming.
- As a user, if I must login, I return to the same booking step after authentication.
- As a user, I can see maintenance/blackout periods and cannot book blocked slots.
- As a user, I can switch language (nb/en) and never see untranslated/hardcoded strings.

### 9.2 MinSide (Private + Org Context)
- As a user, I can see my upcoming bookings and cancellations.
- As an org member, I can switch to my org context and see org-allowed features only.
- As an org admin, I can view listings my org has custody for.
- As an org admin, I can assign a member to manage maintenance for a listing (within scope).

### 9.3 Backoffice (Admin/Saksbehandler/Org roles)
- As Tenant Admin, I can create and manage listings, rules, and availability.
- As Tenant Admin, I can delegate listing custody to organizations and users (bulk assign).
- As Saksbehandler, I can approve/deny bookings but cannot change tenant settings.
- As Org Admin, I can manage only the listings delegated to my organization.
- As Org Member, I can see only what I am allowed to see and cannot escalate privileges.

### 9.4 SaaS Admin (Control Plane)
- As SaaS Admin, I can create plans with module/feature entitlements.
- As SaaS Admin, I can issue and rotate a tenant’s license key securely.
- As SaaS Admin, I can enable/disable an integration per tenant and validate configuration.
- As Billing Admin, I can view subscription status changes and webhook events.
- As SaaS Admin, I can see incidents/errors per app, tenant, release, and act quickly.

---

## 10) Functional Requirements (FR)

### FR-1 Listings
- FR-1.1 Create, update, publish, archive listings.
- FR-1.2 Listing details must show accurate data (no UI-invented business logic).
- FR-1.3 Listing details must include dynamic calendar with correct availability states.

### FR-2 Booking Modes
- FR-2.1 Support SINGLE_SLOT bookings.
- FR-2.2 Support IN_GAME booking TTL reservation-confirm flow.
- FR-2.3 Support RECURRING booking with preview and conflict handling.

### FR-3 Approvals & Maintenance
- FR-3.1 Support approval-required bookings with saksbehandler workflow.
- FR-3.2 Support maintenance/blackout blocks visible in calendar.

### FR-4 Custody & Delegation
- FR-4.1 Support N:M delegation between listings and users/orgs.
- FR-4.2 Support scoped permissions per custody grant.
- FR-4.3 Support org admin sub-delegation to members within scope.
- FR-4.4 Support time-bound grants and revocations.
- FR-4.5 Enforce server-side authorization for all custody scopes.
- FR-4.6 Produce audit logs for all custody changes.

### FR-5 Entitlements / Feature Flags
- FR-5.1 Control modules/integrations/features per tenant/plan/environment.
- FR-5.2 Control routes and sidebar items per role/context.
- FR-5.3 Deterministic precedence and effective config view.
- FR-5.4 Enforce entitlements server-side and mirror in UI.
- FR-5.5 Audit all entitlement changes.

### FR-6 SaaS Admin
- FR-6.1 Tenants, plans, subscriptions lifecycle.
- FR-6.2 License keys issuance/rotation/revocation; keys must never be logged.
- FR-6.3 Billing integration with idempotent, signature-verified webhooks.
- FR-6.4 Integrations management with secret rotation and health checks.

### FR-7 Localization & Accessibility
- FR-7.1 nb/en supported across all apps; nb default.
- FR-7.2 No hardcoded user-facing strings; key completeness must be enforced in CI.
- FR-7.3 WCAG 2.1 AA baseline for critical routes and flows.

### FR-8 Observability & Incident Management
- FR-8.1 Errors/performance traces captured with releases + sourcemaps.
- FR-8.2 Incidents ingested into SaaS dashboard with grouping and regression views.
- FR-8.3 Synthetic Playwright checks against staging/prod.

---

## 11) Non-Functional Requirements (NFR)

### NFR-1 Security
- Strong auth posture; protect against IDOR, injection, privilege escalation.
- Secrets never logged; redaction everywhere.
- Security headers and TLS best practices.
- SAST + dependency scanning in CI; DAST baseline nightly.

### NFR-2 Performance & Reliability
- Booking collision/concurrency correctness.
- Availability endpoints must scale with load.
- Webhooks must be idempotent and robust to retries/out-of-order events.

### NFR-3 Compliance
- GDPR by design: minimization, retention configuration, DSAR surfaces where implemented.
- WCAG 2.1 AA baseline + keyboard navigation.

### NFR-4 Maintainability
- Policy decisions centralized and deterministic.
- Minimal breaking changes; strict contracts; consistent SDK usage.

---

## 12) Acceptance Criteria (Product-Level)

1. A tenant can operate at least 40 listings with full booking and admin workflows.
2. Booking modes work end-to-end and calendar is accurate for availability, blackouts, and conflicts.
3. Custody can be delegated to multiple users and orgs simultaneously; org admin sub-delegation works and is constrained.
4. Entitlements can hide/disable modules/integrations/features/routes/sidebar items per role/context and are enforced server-side.
5. All user-facing UI supports nb/en with no missing keys and no hardcoded strings.
6. WCAG checks pass baseline on critical routes.
7. Runtime failures are detected quickly and visible in SaaS dashboard incident module.

---

## 13) Open Questions
1. Which billing provider(s) are in scope now (Stripe, Vipps, both)?
2. Do custody scopes include pricing/reporting now or in later phase?
3. Should org members manage bookings directly or only maintenance (default: least privilege)?
4. What is the required retention period for audit and incident records per municipality?

---