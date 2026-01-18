# PRP — Product Requirements & Planning (Execution Plan)
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Project:** Digilist (Web + MinSide + Backoffice + SaaS Admin + API + Client SDK)

---

## 1) Purpose

This PRP defines a phased execution plan that is:
- **non-breaking** for the existing Digilist runtime
- **control-plane driven** (SaaS Admin governs entitlements/custody/integrations)
- **evidence-driven** (coverage matrices + test artifacts as deliverables, not “nice to have”)

This plan is optimized for:
- municipal procurement readiness
- high confidence releases
- scalable development with agents

---

## 2) Delivery Principles & Guardrails

1) **Audit → Analyze → Implement**
- Always inventory current repo behavior before change.
- Every change must include coverage evidence.

2) **Contract-first**
- DTOs/contracts are updated before UI changes.
- SDK drift is blocked in CI.

3) **Policy-driven access**
- Authorization decisions are centralized:
  - RBAC + entitlements + custody evaluated together via policy service.

4) **Minimal breaking changes**
- Prefer additive schema (new tables) + soft-deprecations.
- Do not rename existing core tables unless strictly necessary.

5) **Quality gates are part of delivery**
- PRs must pass:
  - lint/typecheck/no-console
  - unit + integration + contract tests
  - Playwright smoke per app
  - i18n key completeness + hardcoded string checks
  - a11y checks on critical flows

---

## 3) Program Structure

### 3.1 Workstreams
- **WS1 Contracts & SDK**
- **WS2 API & Domain Engines (booking/calendar, custody, entitlements)**
- **WS3 Apps (Web, MinSide, Backoffice, SaaS Admin)**
- **WS4 Quality & Compliance (testing, a11y/i18n, security, performance)**
- **WS5 Observability & Ops (Sentry, logs, monitors, incident dashboard)**

### 3.2 Environments
- Local dev
- Staging (CI deploy)
- Production

---

## 4) Milestones & Phases

> Each phase includes explicit “Evidence Deliverables”.

### Phase 0 — Repo Audit & Baseline (Mandatory)
**Goal:** Know what exists; freeze terminology; avoid accidental regressions.

**Deliverables**
- `/docs/quality/inventory.md` (apps, routes, endpoints, schema, jobs)
- `/docs/quality/coverage-matrix.md` (initial mapping, can be partial)
- `/docs/quality/app-audit-web.md`, `/minside`, `/backoffice`, `/saas-admin`
- Contract baseline snapshot + CI gate proof

**Exit Criteria**
- All apps build and run in staging
- Baseline smoke tests established for each app
- No-console gate and env validation defined (even if not fully enforced yet)

---

### Phase 1 — Contract & SDK Hardening
**Goal:** Contract-first becomes enforceable; SDK-first becomes mandatory.

**Epics**
- E1: DTO source-of-truth and drift prevention
- E2: SDK services + hooks standardization
- E3: RFC7807 + correlationId standardization

**Key Stories**
- S1.1 Define DTO versioning strategy and CI diff gate
- S1.2 Ensure every endpoint has typed request/response DTO
- S1.3 Ensure client SDK covers 100% of endpoints used by UIs
- S1.4 Enforce “no direct fetch in UI” rule (lint + grep + review)

**Evidence Deliverables**
- Contract diff report artifact in CI
- `/docs/quality/contracts.md`
- Unit tests for RFC7807 mapping + correlationId propagation

**Exit Criteria**
- Any contract drift breaks CI
- UIs compile with SDK-only data access

---

### Phase 2 — Entitlements / Feature Flags (Modules, Integrations, Features, Routes, Sidebar)
**Goal:** One deterministic engine controls feature access per tenant/plan/role/context.

**Epics**
- E4: Entitlements taxonomy + evaluation engine
- E5: Route policies + nav policies per app
- E6: SaaS Admin editor + audit history

**Key Stories**
- S2.1 Define ModuleKey/FeatureKey/IntegrationKey/RouteKey/NavItemKey registries
- S2.2 Implement entitlements precedence rules:
  - kill switch > tenant override > plan defaults > role restriction
- S2.3 Implement `GET /me/entitlements` with ETag/TTL
- S2.4 Implement API enforcement middleware (deny if not entitled)
- S2.5 Implement UI integration:
  - route guards
  - sidebar visibility/disabled states with reason keys (i18n)
- S2.6 SaaS Admin screens to configure:
  - plan entitlements
  - tenant overrides
  - route/nav policies
- S2.7 Audit events for every change

**Evidence Deliverables**
- `/docs/quality/entitlements-matrix.md` (role × modules/features/routes/nav)
- Unit tests: precedence, determinism, caching correctness
- Integration tests: enforcement + cross-tenant isolation
- Playwright: verify sidebar changes per role and context in each app
- i18n checks: label keys exist nb/en; no hardcoded nav strings

**Exit Criteria**
- A feature can be disabled centrally and disappears/blocks across all apps
- Server-side enforcement proven by tests
- UI matches effective entitlements

---

### Phase 3 — Custody / Delegation (Listing ↔ User/Org ↔ Org Member Subdelegation)
**Goal:** Delegate responsibility for listings to orgs/users at scale, with scoped permissions.

**Epics**
- E7: Custody schema + evaluation engine (ABAC)
- E8: Backoffice custody management + bulk assignment
- E9: Org Admin subdelegation to members
- E10: “My managed listings” experiences in MinSide and Backoffice

**Key Stories**
- S3.1 Implement custody grants (user/org) with scopes and time windows
- S3.2 Implement subgrants (org admin → member) within parent scope
- S3.3 Implement policy integration:
  - `can()` checks include custody scopes
- S3.4 Implement Backoffice custody tab on listing:
  - assign to users/orgs
  - bulk assign (10 locals to Kulturuus)
- S3.5 Implement MinSide “managed listings” list:
  - org admin sees delegated listings
  - member sees subdelegated listings
- S3.6 Ensure audit trail for custody changes

**Evidence Deliverables**
- `/docs/quality/custody-matrix.md` (scopes × roles × contexts)
- Unit tests: scope subset rules; time windows
- Integration tests: mixed custody (user+org+multi), IDOR protection
- E2E:
  - Admin bulk assigns listings to org → Org Admin sees them
  - Org Admin subdelegates to member → member can do maintenance only
- Security tests: privilege escalation attempts blocked

**Exit Criteria**
- Multi-entity delegation works (users + orgs + both)
- Org subdelegation constrained and auditable
- Enforcement proven server-side + UI aligned

---

### Phase 4 — Web: Dynamic Calendar + Booking Modes (Most Comprehensive)
**Goal:** Public/Authenticated web is correct and resilient for real bookings.

**Epics**
- E11: Listing discovery & filters
- E12: Listing details page (all sections/tabs)
- E13: Calendar correctness (availability, blackouts, conflicts)
- E14: Booking modes: single-slot, in-game, recurring
- E15: Auth boundary “return to same step”

**Key Stories**
- S4.1 Discovery: filters, sorting, pagination; performance budgets
- S4.2 Listing details: validate all tabs/sections render correct data
- S4.3 Calendar shows:
  - occupied/reserved/disabled/blackouts
  - timezone Europe/Oslo + DST edges
- S4.4 Booking flows end-to-end:
  - SINGLE_SLOT create + confirm
  - IN_GAME reserve TTL + confirm/expire
  - RECURRING preview conflicts + partial failures + create series
- S4.5 i18n: nb/en completeness; no hardcoded strings
- S4.6 WCAG baseline and keyboard-only booking flow

**Evidence Deliverables**
- Playwright packs for all web journeys
- Axe reports on critical pages
- Localization key completeness report
- Load test report for availability and booking endpoints

**Exit Criteria**
- Web booking flows proven correct by E2E
- Calendar accuracy proven under real-world cases

---

### Phase 5 — Backoffice & MinSide Role Completeness
**Goal:** Each role has correct access, UI, and enforcement.

**Epics**
- E16: Backoffice Admin/Tenant Admin operations
- E17: Backoffice Saksbehandler operations
- E18: Backoffice Org Admin/Org Member operations (custody-driven)
- E19: MinSide private + org context switching

**Key Stories**
- S5.1 Role-based sidebars and routes driven by entitlements
- S5.2 Server denies forbidden routes/actions with RFC7807
- S5.3 Case handling: approvals/declines, audit trail
- S5.4 MinSide context switch changes available features dynamically
- S5.5 Custody actions appear where entitled and scoped

**Evidence Deliverables**
- Role matrix documents
- Integration tests per endpoint for allow/deny/wrong tenant/org
- Playwright journeys per role per app
- i18n + a11y checks per critical role route

**Exit Criteria**
- No cross-role privilege leakage
- UI matches server enforcement across roles and contexts

---

### Phase 6 — SaaS Admin (Licensing, Billing, Integrations, Governance)
**Goal:** Control plane is production-ready and safe.

**Epics**
- E20: Plan/subscription lifecycle
- E21: License keys issuance/rotation/revocation (hash storage)
- E22: Billing webhooks (signature, idempotency, ordering)
- E23: Integrations config + secrets rotation + health checks
- E24: Audit + incident dashboards

**Evidence Deliverables**
- Integration tests for webhook idempotency and signatures
- Security tests for secret leakage
- E2E governance journeys
- Incident pipeline validated end-to-end

**Exit Criteria**
- Entitlements and governance safe to operate at scale
- Billing-driven entitlement changes are consistent

---

### Phase 7 — Quality, Security, Performance & Runtime Assurance (Continuous)
**Goal:** Eliminate “passes tests but fails in runtime”.

**Epics**
- E25: CI quality gates
- E26: SAST/DAST baseline
- E27: Performance + load + concurrency testing
- E28: Mutation testing for critical cores
- E29: Observability, monitors, incident routing

**Exit Criteria**
- Runtime errors show in SaaS incident dashboard within minutes
- Synthetic monitors catch broken deployments
- No-console and env validation prevent common runtime drift

---

## 5) Epics → Stories → Tasks (Blueprint)

> Use this as the structure for planning.json / Jira.

### Epic E7: Custody & Delegation
- Story: Add custody grant schema
  - Tasks: migration + constraints + indexes
- Story: Add custody evaluation service
  - Tasks: can() integration + unit tests
- Story: Add Admin UI custody tab
  - Tasks: SDK hooks + UI + E2E
- Story: Add Org subdelegation
  - Tasks: API + constraints + E2E
- Story: Bulk assignment
  - Tasks: endpoint + UI + performance tests

### Epic E4: Entitlements Engine
- Story: define key registries
- Story: evaluation engine
- Story: route/nav policies
- Story: SaaS Admin editor + audit
- Story: runtime apps consume effective entitlements

### Epic E14: Booking Modes
- Story: recurring preview endpoint
- Story: recurring create
- Story: in-game reservation TTL
- Story: single-slot improvements
- Story: Playwright packs and concurrency tests

---

## 6) Test Strategy Embedded in Plan

### 6.1 Required test suites per epic
Every epic must include:
- Unit tests (logic and policy)
- Integration tests (API + DB)
- Contract tests (DTO/SDK)
- Playwright E2E (user journeys)
- Security tests (IDOR/escalation)
- i18n key completeness + hardcoded string detection
- a11y baseline checks (Axe)
- Performance tests for hot paths (when applicable)

### 6.2 Evidence artifacts
Each pipeline must publish:
- coverage report
- contract diff report
- schema coverage report
- a11y summary
- performance report (where run)
- security scan report

---

## 7) Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Permission complexity (RBAC+ABAC+entitlements) | High | single policy engine + matrix-driven tests |
| Contract drift between API/SDK | High | contract diff gate in CI |
| Runtime drift after deploy | High | env validation + no-console + synthetic monitors |
| i18n regressions | Medium | key completeness + hardcoded string detection in CI |
| Calendar correctness edge cases | High | DST tests + recurring conflict preview + concurrency tests |
| Billing webhook anomalies | High | signature + idempotency + ordering tests |

---

## 8) Definition of Done (DoD)

A feature is “Done” only when:
1) contracts updated and published
2) SDK updated and used by UIs
3) unit + integration + contract tests exist
4) Playwright E2E journey exists
5) i18n + a11y checks pass
6) audit events emitted for mutations
7) monitoring/incident behavior defined for failures

---