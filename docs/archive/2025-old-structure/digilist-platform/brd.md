# BRD — Business Requirements Document (Digilist)
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Product:** Digilist (Web + MinSide + Backoffice + SaaS Admin)  
**Vendor:** Xala Technologies AS

---

## 1) Executive Summary

Digilist is a Norwegian municipal booking SaaS that enables municipalities and partner organizations to:
- publish and manage **listings** (bookable resources)
- support multiple booking modes and accurate availability calendars
- delegate operational responsibility (“custody”) for listings to organizations and users
- operate the solution via a centralized SaaS Admin control plane with licensing, entitlements, billing, and integrations
- comply with public-sector requirements (WCAG, GDPR) and provide auditability and operational transparency

---

## 2) Stakeholders & Business Actors

### 2.1 Primary stakeholders
- **Municipality / Tenant Owner**
  - needs governance, compliance, control, and stable operations
- **Tenant Admin / Admin (Backoffice)**
  - manages listings, rules, users, organizations, delegation, and operations
- **Saksbehandler (Backoffice)**
  - processes approvals/declines and maintains correct decision workflows
- **Partner Organizations (Backoffice org model)**
  - can be granted custody and manage delegated resources
- **Organization Admin / Member**
  - manages delegated resources on behalf of their organization
- **Citizens / End Users**
  - discover and book listings with high usability and trust
- **Platform Operator (SaaS Admin)**
  - manages tenants, subscriptions, entitlements, integrations, monitoring, and support

### 2.2 Supporting stakeholders
- IT/Security officers
- Accessibility reviewers
- Procurement evaluators
- Support / operations team
- Integration partners (locks, archive, payment providers)

---

## 3) Business Goals & Outcomes

### 3.1 Municipality outcomes
1) Reduce manual handling and fragmented booking processes.
2) Ensure accurate, transparent availability and consistent booking rules.
3) Enable safe delegation of responsibility to partner organizations without losing oversight.
4) Provide auditability and compliance for decisions and changes.

### 3.2 End-user outcomes (citizens & org users)
1) Quickly find and book relevant listings.
2) Understand rules and availability clearly.
3) Receive predictable outcomes (confirmation, approvals, updates) with minimal friction.
4) Use the platform in Norwegian Bokmål and English with accessible UX.

### 3.3 Platform operator outcomes
1) Scale to many tenants with consistent governance.
2) Monetize modules/features through plans and entitlements.
3) Detect issues quickly through incident monitoring and release tracking.
4) Integrate external systems safely with per-tenant configuration management.

---

## 4) Business Scope

### 4.1 In scope
- Listings lifecycle and data governance
- Booking with multiple modes (single-slot, in-game, recurring)
- Calendar accuracy including blackouts/maintenance
- Delegation model (custody) for listing management
- Entitlements/feature flags that control:
  - modules
  - integrations
  - features
  - routes
  - sidebar items per role/context
- SaaS Admin:
  - tenants, plans, subscriptions
  - license keys
  - billing lifecycle + webhook robustness
  - integrations catalog and per-tenant configs
  - audit and incident dashboards
- Compliance:
  - WCAG baseline
  - GDPR by design principles
- Evidence-driven quality approach

### 4.2 Out of scope (for current BRD)
- Full bespoke municipal case processing beyond booking (unless explicitly required later)
- Custom-built payment gateway (uses providers)
- Replacement of national registries (consumes them)

---

## 5) Key Business Concepts

### 5.1 Listing (Bookable resource)
A listing represents any municipal resource that can be reserved or requested, such as:
- lokaler (haller, rom, kulturhus)
- arrangementer
- steder
- utstyr/tjenester (if enabled)

Listings are owned by a tenant and governed by its administrators.

### 5.2 Two organization concepts (must remain distinct)
1) **Backoffice organizations**
   - tenant-controlled umbrella/partner organizations (governance model)
   - used for delegation and operational responsibility
2) **MinSide organizations**
   - user-affiliated membership orgs loaded at sign-in (end-user context)
   - used for “booking on behalf of org” and visibility context

This separation is required to prevent governance confusion and data leakage.

### 5.3 Custody (delegation of responsibility)
Custody allows a tenant to delegate listing responsibility to:
- one or multiple organizations
- one or multiple users
- both at the same time

Custody is scope-based:
- edit listing content
- manage images/media
- manage maintenance/blackouts
- manage bookings and approvals (if allowed)
- delegate to org members (if explicitly enabled)

This provides a real-world governance model: municipalities can let partner organizations manage subsets of resources.

### 5.4 Entitlements / Feature Flags
Entitlements determine what a tenant and its roles can see and do, depending on:
- plan/subscription
- tenant overrides
- environment (staging/prod)
- role/context restrictions

This enables:
- configurable deliveries for different tenants
- controlled rollout of features
- monetization and license control

### 5.5 Control Plane vs Runtime
- SaaS Admin is the control plane: config, licenses, entitlements, integrations.
- Runtime apps enforce the effective config: Web, MinSide, Backoffice, API.

---

## 6) Business Rules (Authoritative)

### 6.1 Tenant and data isolation
- Data and operations must be isolated per tenant.
- Cross-tenant access is forbidden.

### 6.2 Role governance (RBAC)
- Roles define baseline authority.
- UI visibility must reflect roles, but server enforcement is mandatory.

### 6.3 Custody governance (ABAC)
- A listing can have multiple custodians (users and/or organizations).
- Custody can be time-bound and revocable.
- Custody scopes must be explicitly defined and enforced.
- Subdelegation is allowed ONLY when:
  - organization has a custody grant allowing subdelegation
  - org admin assigns to member
  - member scopes are subset of parent scopes

### 6.4 Booking rule governance
- Booking rules are enforced by the API (not the UI).
- Availability must reflect bookings, reservations, and blackouts.
- Overlapping bookings must be prevented.

### 6.5 Entitlements governance
Entitlements must control:
- modules
- integrations
- features
- routes
- sidebar items

Precedence must be deterministic:
1) global kill switch
2) tenant override
3) plan defaults
4) role restrictions (least privilege wins)

### 6.6 Auditability (public-sector expectation)
- All significant actions must be auditable:
  - listing changes
  - booking decisions (approve/decline)
  - custody grants and subgrants
  - entitlements and integration changes
  - license key operations
- Audit records must include actor, timestamp, before/after, and correlationId.

### 6.7 Localization
- Norwegian Bokmål must be default.
- English must be supported.
- No hardcoded user-facing strings in UI.

### 6.8 Accessibility
- WCAG 2.1 AA baseline is mandatory for critical journeys:
  - search → details → booking
  - login and context switching
  - admin listing management

---

## 7) Business Use Cases (High-value)

### UC-1: Citizen books a listing (Web)
**Actor:** User  
**Outcome:** Booking confirmed or requested  
**Notes:** Supports single-slot, in-game, recurring; login boundary returns to same flow.

### UC-2: Saksbehandler approves/declines booking (Backoffice)
**Actor:** Saksbehandler  
**Outcome:** Booking status updated + citizen notified + audit written.

### UC-3: Tenant Admin delegates custody to an organization (Backoffice)
**Actor:** Tenant Admin  
**Outcome:** Organization gains scoped management rights for selected listings.

### UC-4: Org Admin subdelegates custody to member (MinSide/Backoffice)
**Actor:** Org Admin  
**Outcome:** Member can perform maintenance or booking management on assigned listings.

### UC-5: SaaS Admin enforces feature access via entitlements
**Actor:** SaaS Admin  
**Outcome:** Tenant sees only enabled modules/routes/nav items; server blocks disabled features.

### UC-6: Billing webhook changes subscription status
**Actor:** Billing provider (system)  
**Outcome:** Subscription changes reflected; entitlements recalculated; audit and incident monitoring cover failures.

---

## 8) Compliance & Governance Requirements

### 8.1 GDPR
Business requirements:
- minimize stored personal data
- protect sensitive identifiers
- ensure audit trail does not store unnecessary PII
- retention policies for audit/incident logs must be configurable

### 8.2 WCAG
- critical journeys must be accessible
- keyboard navigation must be supported
- automated a11y scans as part of delivery evidence

### 8.3 Operational transparency
- runtime failures must be visible (incident dashboard)
- “new errors after release” must be trackable
- synthetic monitors must validate core flows

---

## 9) Business KPIs / Success Measures

Municipality KPIs:
- reduction in manual handling time for booking approvals
- improved utilization of listings (occupancy rate)
- reduced booking conflicts and cancellations due to confusion

End-user KPIs:
- booking completion rate
- time to find a listing
- support tickets related to booking confusion

Operator KPIs:
- mean time to detect incidents (<5 minutes)
- mean time to resolve incidents
- rate of regressions after release

Quality KPIs:
- 100% schema coverage mapped to tests
- 100% endpoint coverage for allow/deny tests
- accessibility baseline pass rate on critical routes

---

## 10) Assumptions & Dependencies

Assumptions:
- The platform uses SDK-first integration across apps.
- Entitlements and custody are centrally enforced in the API and mirrored in UI.
- Audit logs are append-only.

Dependencies:
- Billing provider and webhook contract (Stripe/Vipps)
- Integration partners (locks, archive, email, maps)
- Identity provider(s) (BankID/ID-porten/SSO), depending on tenant needs

---

## 11) Open Business Questions

1) Should custody allow “booking approval” scope for org custodians by default, or must it be explicitly enabled per tenant?
2) Should custody grants be limited to Backoffice organizations only, or can MinSide membership orgs also be custodians?
3) What is the baseline retention policy expected for audit and incidents in municipal settings?
4) Which integrations are mandatory for MVP vs premium modules?

---