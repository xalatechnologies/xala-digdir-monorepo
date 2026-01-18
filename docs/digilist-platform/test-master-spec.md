# TEST MASTER SPEC — Digilist Platform (Source of Truth)
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Scope:** API + Client SDK + Web + MinSide + Backoffice + SaaS Admin  
**Status:** Canonical quality baseline (non-negotiable)

> This document is the authoritative testing blueprint for Digilist.  
> A feature is **not complete** unless it is covered here and has verifiable evidence.

---

## 0) Quality Objectives (Hard Guarantees)

1. **Zero blind spots**
   - Every schema element, endpoint, route, role capability, feature flag, custody scope, and integration path is covered by tests or explicitly excluded with rationale.

2. **Runtime confidence**
   - Passing CI implies production readiness.
   - Runtime failures are detected, surfaced, and correlated within minutes.

3. **Deterministic governance**
   - RBAC + Entitlements + Custody decisions are deterministic, audited, and test-proven.

4. **Public-sector readiness**
   - WCAG 2.1 AA baseline verified.
   - GDPR-by-design behaviors validated.
   - Auditability proven with before/after evidence.

---

## 1) Test Taxonomy (Required Suites)

### 1.1 Unit Tests (Fast, Deterministic)
**Purpose:** Prove correctness of pure logic.

Must cover:
- Policy engine (`can()`): RBAC + entitlements + custody
- Entitlements evaluation (precedence, determinism, caching)
- Custody scope subset rules and time windows
- Booking rules (approval, cancellation, TTL expiry)
- Calendar availability calculations
- Validation logic (DTOs, RFC7807 mapping)
- Env validation schemas

**Rules**
- No I/O, no network, no DB.
- Mutation testing required for:
  - policy engine
  - entitlements evaluation
  - custody evaluation
  - booking conflict detection

---

### 1.2 Integration Tests (API + Real DB)
**Purpose:** Prove enforcement and data correctness.

Must cover:
- Migrations-from-scratch (fresh DB)
- Constraints, indexes, enums
- Multi-tenant isolation
- AuthZ enforcement (403/404) for:
  - roles
  - entitlements
  - custody scopes
- Booking overlap prevention
- Webhook signature + idempotency
- Audit events emission

**Rules**
- Use real DB engine.
- No mocking of authZ or policy layer.
- Every endpoint must have at least:
  - one allow test
  - one deny test

---

### 1.3 Contract Tests (SDK-first)
**Purpose:** Prevent API ↔ SDK drift.

Must cover:
- Request/response DTO snapshots
- Enum stability
- RFC7807 shape
- CorrelationId presence
- Pagination/filter contracts

**Rules**
- Any breaking contract change fails CI.
- SDK regeneration is automatic and gated.

---

### 1.4 E2E Tests (Playwright)
**Purpose:** Prove real user journeys.

**Apps**
- Web (most comprehensive)
- MinSide
- Backoffice
- SaaS Admin

**Rules**
- No test-only APIs.
- Must use Client SDK paths.
- Every critical journey must:
  - assert UI
  - assert network responses
  - assert server enforcement

---

### 1.5 Accessibility (WCAG 2.1 AA)
**Purpose:** Public-sector compliance.

Must cover:
- Axe scans on critical routes
- Keyboard-only journeys:
  - search → details → booking
  - login → dashboard → context switch
  - admin listing management

---

### 1.6 Localization (nb/en)
**Purpose:** Prevent translation regressions.

Must cover:
- Key completeness (nb + en)
- No hardcoded user-facing strings (AST + heuristic scan)
- Locale-aware date/time/number formatting

---

### 1.7 Security
**Purpose:** Prevent exploitation.

Must cover:
- IDOR (swap IDs)
- Privilege escalation
- Injection (input validation)
- Secrets leakage
- Security headers
- Dependency scanning (SCA)
- SAST (semgrep or equivalent)
- DAST baseline (nightly)

---

### 1.8 Performance & Reliability
**Purpose:** Handle real-world load.

Must cover:
- Listing search
- Availability queries
- Booking create (single + recurring)
- Entitlement evaluation hot path
- Webhook bursts

---

### 1.9 Runtime Assurance
**Purpose:** Catch issues after deploy.

Must cover:
- no-console gate (prod paths)
- env validation at boot
- Sentry releases + sourcemaps
- Synthetic Playwright monitors
- Incident ingest to SaaS dashboard

---

## 2) Schema Coverage Specification (NO COLUMN LEFT BEHIND)

### 2.1 Coverage Rules
For **every table, column, enum, constraint, index**:
- at least one test that:
  - inserts valid data
  - rejects invalid data
- referenced in `/docs/quality/schema-coverage.json`

### 2.2 Mandatory Tables (Non-exhaustive)
- tenants
- users
- user_roles
- bo_organizations
- bo_org_memberships
- ms_organizations
- ms_org_memberships
- listings
- listing_images
- listing_rules
- listing_blackouts
- bookings
- booking_series
- booking_series_items
- listing_custody_grants
- listing_custody_subgrants
- plans
- subscriptions
- plan_entitlements
- tenant_entitlement_overrides
- route_policies
- nav_policies
- integration_configs
- license_keys
- audit_events
- incidents

**Acceptance**
- 100% of schema elements mapped to tests or explicitly excluded with rationale.

---

## 3) Roles & Context Matrix (Authoritative)

### 3.1 Roles
- PUBLIC
- USER
- ORG_MEMBER
- ORG_ADMIN
- SAKSBEHANDLER
- ADMIN / TENANT_ADMIN
- SAAS_ADMIN

### 3.2 Contexts
- none (public)
- private user
- org context (MinSide membership org)
- backoffice org context

### 3.3 Test Rule
For each `(role × context × app)`:
- verify:
  - visible routes
  - hidden/disabled routes
  - server enforcement on deep-links

---

## 4) Entitlements Test Matrix

### 4.1 Dimensions
- Modules
- Integrations
- Features
- Routes
- Sidebar items

### 4.2 Required Tests
- Plan default enables/disables feature
- Tenant override supersedes plan
- Kill switch overrides everything
- Role restriction reduces access
- UI reflects effective entitlements
- API denies forbidden access

### 4.3 Evidence
- `/docs/quality/entitlements-matrix.md`
- Playwright screenshots per role/context

---

## 5) Custody & Delegation Test Matrix (NEW CORE)

### 5.1 Scenarios (ALL REQUIRED)
1. User-only custody
2. Org-only custody
3. Mixed custody (user + org)
4. Multiple orgs same listing
5. Org admin subdelegates to member
6. Time-bound custody expires
7. Revocation takes effect immediately
8. Scope subset enforced for subgrants
9. Cross-tenant leakage blocked
10. Privilege escalation attempt blocked

### 5.2 Scopes to Test
- RO_VIEW
- RO_EDIT
- RO_MEDIA
- RO_MAINTENANCE
- RO_BOOKING_MANAGE
- RO_PRICING
- RO_REPORTING
- RO_DELEGATE

### 5.3 Evidence
- Unit tests (scope math)
- Integration tests (enforcement)
- E2E:
  - Admin bulk assigns listings to org
  - Org admin subdelegates
  - Member performs allowed action only

---

## 6) Web E2E Master Pack (MOST COMPREHENSIVE)

### 6.1 Discovery
- search, filter, sort, pagination
- performance budget assertions

### 6.2 Listing Details
- all sections/tabs rendered
- no UI-derived business logic
- i18n correctness

### 6.3 Calendar
- available
- reserved
- booked
- blackout/maintenance
- timezone Europe/Oslo + DST edges

### 6.4 Booking Modes
- SINGLE_SLOT
- IN_GAME (TTL expire/confirm)
- RECURRING:
  - preview conflicts
  - partial failures
  - series creation

### 6.5 Auth Boundary
- redirect to login
- return to same step

---

## 7) Backoffice E2E Packs

### 7.1 Admin / Tenant Admin
- listing lifecycle
- rules + blackouts
- custody assignment (bulk)
- entitlements visibility
- audit verification

### 7.2 Saksbehandler
- approvals/declines
- forbidden admin paths blocked

### 7.3 Org Admin / Org Member
- delegated listings only
- subdelegation flows
- forbidden escalation blocked

---

## 8) MinSide E2E Packs

### 8.1 Private Context
- my bookings
- cancellations
- i18n + a11y

### 8.2 Org Context
- context switching
- managed listings (custody)
- role-based features

---

## 9) SaaS Admin E2E Packs

### 9.1 Governance
- tenants, plans, subscriptions
- license key issue/rotate/revoke
- entitlements editor

### 9.2 Billing
- webhook signature validation
- idempotency
- ordering

### 9.3 Integrations
- enable/disable
- config validation
- secret rotation
- health checks

### 9.4 Incidents & Audit
- incident ingestion
- grouping
- regression after release
- audit before/after diff

---

## 10) CI/CD Quality Gates (MANDATORY)

### PR Pipeline
- lint + typecheck
- no-console
- unit + integration
- contract tests
- Playwright smoke (1 journey/app)
- i18n + a11y smoke

### Nightly
- full Playwright
- DAST
- load tests
- mutation tests
- extended a11y sweeps

---

## 11) Evidence Artifacts (Required Outputs)

- coverage report
- schema-coverage.json
- contract-diff report
- entitlements-matrix.md
- custody-matrix.md
- a11y reports
- security scan reports
- performance reports
- synthetic monitor results

---

## 12) Definition of Done (Global)

A feature is **DONE** only if:
1. Covered in this spec
2. Tests exist and pass
3. Evidence artifacts are published
4. Audit events emitted
5. Runtime monitoring defined
6. No regressions in entitlements or custody

---

## 13) Governance Rule

> **If it is not testable, it is not shippable.**  
> **If it is not observable, it is not acceptable.**  
> **If it is not auditable, it is not compliant.**

This Test Master Spec is immutable without review and versioning.