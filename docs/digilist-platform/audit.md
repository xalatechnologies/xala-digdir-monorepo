# MASTER IMPLEMENTATION PROMPT (Audit → Analyze → Code)
## Goal
Implement a complete quality + runtime assurance layer for Digilist across API + SDK + Web + Backoffice + MinSide + SaaS Admin, with:
1) Fully enumerated `schema-coverage.json` (all tables/columns/constraints/indexes)
2) Stable Playwright `data-testid` coverage rules + CI enforcement (no brittle selectors)
3) Policy-engine test pack (order + denial reasons) + API guards calling the same `can()`
4) Synthetic monitors (cron) + secrets for staging/prod
5) Incidents ingestion: DAL `incidents.upsertFromSentry()` + SaaS Admin UI to view/act

## Non-negotiable rules
- Terminology: use **listing** (never facility); app name is **MinSide**
- Keep existing behavior non-breaking; changes must be additive and guarded by env/feature flags when needed
- SDK-first + contract-first: API responses must match shared DTOs; UI must not compute business rules
- RFC7807 errors + correlationId propagated end-to-end
- Tenant isolation must be enforced for every resource access (no IDOR)
- WCAG + i18n: no hardcoded strings in UI; all user-visible text must use translation keys
- Logging/incident ingest: never store PII/secrets

---

# PHASE 0 — Repo audit (mandatory)
1) Inventory current:
   - DB migrations (tables, columns, constraints, indexes, enums)
   - Existing test frameworks (unit/integration/e2e), Playwright config, CI pipelines
   - Current policy/authorization code (RBAC, entitlements, feature flags)
   - Current observability (Sentry config, logging, audit logs, dashboards)
2) Produce a short “diff map”:
   - Missing tables in schema coverage
   - Missing test IDs
   - Missing data-testid usage patterns
   - Missing policy denial reasons/ordering tests
   - Missing synthetic monitors
   - Missing incidents DAL + UI surface

Output: `/docs/quality/audit-quality-gap-report.md`

---

# PHASE 1 — Expand schema coverage (100% enumeration)
## Deliverable
Create/Update:
- `/docs/quality/schema-coverage.json`

## Requirements
- Enumerate **ALL** tables that exist in current migrations (no exceptions)
- For each table:
  - list every column (name/type/nullable)
  - list every constraint (PK/FK/UQ/CHECK/partial unique)
  - list every index (name/columns, include partial indexes + GIN/GiST if any)
- For each column/constraint/index include:
  - at least one test ID in `tests[]` that will be implemented or already exists
- Include enums in `enums[]` with full value lists + tests

## Validation
- Add a CI script that compares schema-coverage.json vs live schema generated from migrations in a fresh DB:
  - fail if coverage is missing any table/column/constraint/index/enum
  - output a useful diff

## Files to add
- `/scripts/schema/generate-schema-snapshot.ts` (or .js)
- `/scripts/schema/verify-schema-coverage.ts`
- Wire to CI: `pnpm verify:schema-coverage`

Acceptance: CI fails if any schema drift is not covered.

---

# PHASE 2 — Playwright data-testid stability rules + enforcement
## Deliverables
1) `/docs/quality/data-testid-rules.md`
2) `/tests/e2e/config/testIds.ts` (canonical registry)
3) `/scripts/check-e2e-selectors.js` (forbid brittle selectors)
4) CI hook: fail if Playwright specs use `text=` or `.class` selectors

## data-testid rules (MANDATORY)
- naming: lowercase kebab-case
- semantic only (no styling terms)
- stable across i18n
- patterns:
  - `page-<routeKey>`
  - `btn-<action>`, `inp-<field>`, `tab-<name>`, `list-<name>`, `row-<entity>-<id>`
  - calendar: `calendar-root`, `calendar-cell-YYYY-MM-DD`, `calendar-legend-*`
- required global:
  - `app-shell`, `toast-root`, `lang-switch`, `lang-nb`, `lang-en`, `lang-current`
- required per app:
  - Web: `search-input`, `search-submit`, `listing-card`, `listing-title`, `listing-calendar`, booking step ids
  - MinSide: `dashboard-root`, `context-switch`, `context-private`, `context-org`, `managed-listings-root`
  - Backoffice: `sidebar-root`, `nav-item-<key>`, `listing-form`, `btn-save`, `custody-root`
  - SaaS Admin: `tenants-root`, `plans-root`, `entitlements-root`, `license-keys-root`, `incidents-root`

Acceptance: E2E tests do not depend on i18n text; selectors are stable.

---

# PHASE 3 — Policy-engine test pack + API guard wiring
## Deliverables
1) Policy unit tests:
   - `UT.POLICY.DENIAL_REASONS`
   - `UT.POLICY.ORDERING`
   - `UT.ENTITLEMENTS.PRECEDENCE`
   - `UT.CUSTODY.SUBSET.ENFORCED`
2) API guard that calls the same `can()`:
   - `requireCan(action, resourceResolver)`
3) Apply guard to critical endpoints first:
   - custody grants/subgrants
   - listing blackouts/maintenance
   - booking approve/decline
   - SaaS admin entitlements/licenses

## Denial reasons must be deterministic
- `authz.auth.required`
- `authz.role.denied`
- `ent.module.disabled`
- `ent.feature.disabled`
- `custody.scope.missing`
- `policy.resource.missing`

## RFC7807
All denies return RFC7807 with the reason key, plus correlationId.

Acceptance: Policy decisions are unit tested and reused in API guards (single source of truth).

---

# PHASE 4 — Synthetic monitors (staging + prod)
## Deliverables
1) `.github/workflows/synthetic-monitors-staging.yml`
2) `.github/workflows/synthetic-monitors-prod.yml`
3) Playwright monitor specs (fast, smoke-only):
   - `MONITOR.WEB.SMOKE`: search → listing → calendar visible
   - `MONITOR.MINSIDE.SMOKE`: login → dashboard visible
   - `MONITOR.BACKOFFICE.SMOKE`: login → sidebar visible
   - `MONITOR.SAAS_ADMIN.SMOKE`: login → incidents page visible

## Secrets
- `MONITOR_STAGING_BASE_URL`, `MONITOR_STAGING_LOGIN_URL`, `INCIDENT_INGEST_SECRET_STAGING`
- `MONITOR_PROD_BASE_URL`, `MONITOR_PROD_LOGIN_URL`, `INCIDENT_INGEST_SECRET_PROD`

Acceptance: Monitors run every 15 minutes; failures are visible in CI and can trigger incident ingest (optional).

---

# PHASE 5 — Incidents DAL upsert + SaaS Admin UI
## Deliverables (Backend)
1) DB additions (if missing):
   - incidents table with grouping unique constraint
   - recommended: `tenant_group_key = coalesce(tenant_id::text, 'GLOBAL')`
   - unique: `(source, app, tenant_group_key, fingerprint)`
2) DAL:
   - `incidents.upsertFromSentry(input)` implements deterministic grouping and increments count
3) Ingest endpoint:
   - `POST /incidents/ingest/sentry`
   - header auth: `x-incident-secret`
   - safe ingestion: no PII, no secrets
4) Read endpoints for SaaS Admin:
   - `GET /saas/incidents?...`
   - `POST /saas/incidents/{id}/ack`
   - `POST /saas/incidents/{id}/resolve`
5) Audit:
   - ack/resolve must generate audit events

## Deliverables (SaaS Admin UI)
1) Page:
   - routeKey `SAAS_INCIDENTS`
   - `data-testid="incidents-root"`
2) Filters:
   - status/app/tenant/release
3) Table:
   - rows `incident-row-<id>`
   - actions `btn-ack-<id>`, `btn-resolve-<id>`
4) E2E:
   - ingest → incidents appear
   - ack changes status
   - resolve changes status
   - filtering works

Acceptance: Incident ingest creates/upserts rows; SaaS Admin can view/ack/resolve; actions audited.

---

# Final checklist (must be green before merge)
- `pnpm verify:schema-coverage` ✅
- `pnpm test:policy` ✅ (order + denial reasons)
- `pnpm test:e2e` ✅ (stable selectors + a11y + i18n checks on key flows)
- `pnpm test:e2e:monitors` ✅
- Incidents ingest integration test ✅
- SaaS Admin incidents E2E ✅

## Output required
- A short summary in `/docs/quality/IMPLEMENTED.md` listing:
  - new scripts
  - new tests and IDs
  - new endpoints/routes
  - any migration added