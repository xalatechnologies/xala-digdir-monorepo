# MASTER PROMPT — Digilist Contract-First “API → SDK → Frontend-Ready” Architecture (Multi-App, RBAC-First, TypeScript)

You are a principal/staff platform architect (API + client architecture) tasked
with producing a complete, implementable solution for Digilist.

You MUST base your approach on widely adopted industry principles from:

- **Facebook/Relay thinking**: declarative data dependencies, stable IDs,
  normalized caching, “view-driven” data contracts (principles, not necessarily
  GraphQL).
  [oai_citation:0‡relay.dev](https://relay.dev/docs/principles-and-architecture/thinking-in-graphql/?utm_source=chatgpt.com)
- **Airbnb experience**: balancing frontend flexibility with backend stability
  (contract discipline, schema governance, evolution).
  [oai_citation:1‡Medium](https://medium.com/airbnb-engineering/reconciling-graphql-and-thrift-at-airbnb-a97e8d290712?utm_source=chatgpt.com)
- **Backend-for-Frontend / Experience API** patterns for multi-client needs
  (public web, backoffice, dashboards).
  [oai_citation:2‡Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends?utm_source=chatgpt.com)
- **REST API design best practices** + consistent error semantics and
  pagination/filtering.
  [oai_citation:3‡Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design?utm_source=chatgpt.com)
- **TanStack Query server-state** caching/invalidation/SSR hydration patterns.
  [oai_citation:4‡tanstack.com](https://tanstack.com/query/latest/docs/react/guides/query-invalidation?utm_source=chatgpt.com)

## Context & Constraints (Non-Negotiable)

- The bookable resource is called **listing** (NEVER “facility”).
- The system uses **RFC7807** errors consistently for all APIs.
- Roles: **Public**, **User**, **Saksbehandler**, **Admin**, **TenantAdmin**.
- Authentication/authorization is **rule-based (RBAC source of truth)**.
  Frontends never “guess”.
- We have multiple apps that must reuse the same SDK + response contracts:
  1. Public website (discovery → details → availability → checkout)
  2. Backoffice (admin + case handlers/saksbehandler)
  3. Organization & user dashboards (“My bookings”, org memberships,
     billing/receipts, etc.)
- Goal: **No per-app transformer layers**. If any mapping exists, it must be
  centralized as:
  - API “projections” (experience DTOs) OR
  - SDK “selectors” (pure helpers), not duplicated in apps.

---

# OUTPUTS YOU MUST PRODUCE

## Deliverable A — Reference Architecture (End-to-End)

Create a full architecture with 3 layers:

1. **API contract layer** (DTOs and projection endpoints)
2. **TypeScript SDK layer** (`@digilist/client-sdk`) (transport + types +
   errors + optional runtime validation)
3. **Shared hooks layer** (`@digilist/query` or similar) (TanStack Query cache +
   keys + invalidation + SSR strategy)
4. Optional **UI state layer** (`@digilist/ui-state` with Zustand) for UI-only
   state

Explain how each layer prevents “transformers” in apps while still enabling
view-ready UX.

## Deliverable B — DTO & Response Contract Standard (“Digilist API Contract”)

Write a strict standard that every endpoint must follow, including:

### B1) Naming & Versioning Rules

- DTO naming: `ListingSummaryDTO`, `ListingDetailsDTO`,
  `ListingCardProjectionDTO`, `BookingQuoteDTO`, etc.
- Versioning strategy: additive changes only; breaking changes via explicit
  versioning (path or header) and deprecation policy.
- Field naming conventions, enum conventions, nullability rules.

### B2) Envelope Rules (Consistency)

Decide and enforce one approach:

- Option 1: **Resource-first** (top-level object/array)
- Option 2: **Envelope**: `{ data, meta, links, trace }` If envelope is used,
  define for:
- single item, list, paginated list, empty results.

### B3) Filtering / Sorting / Pagination Standard

Define:

- query params: `filter[...]`, `sort`, `page[limit]`, `page[cursor]` OR offset
  rules
- response meta: `meta.page`, `meta.total`, `meta.nextCursor`
- stable sorting keys, default sort per collection
- how to avoid pagination drift

### B4) RFC7807 Error Contract (Strict)

Define:

- required: `type`, `title`, `status`, `detail`, `instance`
- extensions: `traceId`, `correlationId`, `errorCode`, `fieldErrors[]`,
  `policyReasonKey` Provide 4 examples:

1. validation (fieldErrors)
2. unauthorized
3. forbidden (include policy reason)
4. conflict (optimistic concurrency / duplicate booking)

### B5) Caching, Concurrency, Idempotency

- GET caching: ETag/If-None-Match guidance, cache headers for stable resources.
- PATCH/PUT concurrency: ETag/If-Match required on write.
- POST idempotency: Idempotency-Key for payment/booking creation.
- Replay safety: how retries are handled.

### B6) Localization Strategy (Multi-app friendly)

Choose one and standardize:

- Prefer: API returns **i18n keys + params** (frontends resolve), OR
- API resolves strings via `Accept-Language`. Define fallback rules and missing
  key behavior.

---

## Deliverable C — Projection Endpoints (“Experience DTOs”) Strategy

You MUST design a system that makes responses “frontend-ready” without per-app
transformers.

### C1) Principle

Adopt “view-driven” data contracts: design endpoints around
**screens/workflows** instead of raw entities, similar to the benefits Relay
aims for (colocated data needs and stable normalized IDs), even if you keep
REST.
[oai_citation:5‡relay.dev](https://relay.dev/docs/principles-and-architecture/thinking-in-graphql/?utm_source=chatgpt.com)

### C2) Required Projection Endpoint Catalog

Create a minimum set of endpoints per app:

#### Public Web (anonymous → auth gate)

- Search listings (card projection)
- Listing details (public projection)
- Availability calendar/slots (range projection)
- Price quote preview (policy + breakdown)
- Checkout init (auth required)
- Booking confirmation projection

#### Org/User Dashboard

- “My bookings” list projection (filters: status, date range)
- Booking details projection (actions allowed)
- Org memberships & entitlements
- Payments/receipts projection (if applicable)

#### Backoffice (Admin + Saksbehandler)

- Listing management projection (editable fields + constraints)
- Booking review queue projection (approval workflow)
- Booking details for review (policy reasons, audit references)
- Rules/config projections:
  - price groups
  - seasons
  - LIA
  - blackout periods
- Audit log projection
- Reporting projections

For each projection endpoint, provide:

- Request params
- Response DTO fields
- `permissions` object
- `actions` array (enabled/disabled + reasonKey)
- `policyDecisions` array (ruleId, decision, reasonKey, params)

### C3) Include/Expand Rules (If Allowed)

If you permit `?include=...`:

- allowlist only
- max depth 1
- never changes the base DTO shape unpredictably
- caching implications explained

---

## Deliverable D — Authorization-First Response Design

Define the standard way every DTO conveys what the user can do.

### D1) Standard AuthZ payload

All relevant DTOs include:

- `permissions: { canBook, canApprove, canEditListing, canRefund, ... }`
- `availableActions: [{ action, enabled, reasonKey, constraints }]`
- `policyDecisions: [{ policyId, decision, reasonKey, params }]`

### D2) Redaction Rules (Field-level security)

Define one consistent approach:

- omit fields OR return `null` OR `redacted: true` Explain how to type this
  safely in TypeScript (so UI can’t accidentally assume it exists).

### D3) Tenant/Org context

Define:

- how tenantId/orgId context is derived
- how role + claims are enforced
- how “same endpoint” returns different actions based on RBAC

---

## Deliverable E — TypeScript Client SDK (`@digilist/client-sdk`)

Design the SDK so every app integrates the same way.

### E1) Responsibilities

- typed endpoints for all projection DTOs
- unified fetch client (base URL, headers, auth)
- RFC7807 parsing to typed error classes
- correlationId propagation (and exposing it to apps)
- optional runtime validation (Zod recommended for boundary safety; explain
  trade-offs)

### E2) Non-responsibilities

- no React imports
- no per-app mapping
- no UI state

### E3) SDK Structure

Provide a complete folder layout:

- `/client` (fetch, interceptors, auth)
- `/types` (DTOs, enums)
- `/endpoints` (group by controller/use-case)
- `/errors` (ProblemDetails types, guards)
- `/selectors` (pure helpers to derive view slices; must be deterministic and
  unit-testable)
- `/realtime` (websocket event contracts and helpers)

### E4) Codegen Strategy (If OpenAPI exists)

- generate base types
- keep “curated” DTO aliases stable
- add contract tests that fail on breaking changes

---

## Deliverable F — Shared Hooks Package (Performance: load once + cache + reuse)

Use TanStack Query patterns for server-state caching and invalidation.
[oai_citation:6‡tanstack.com](https://tanstack.com/query/v4/docs/react/guides/caching?utm_source=chatgpt.com)

### F1) Canonical Query Key Contract (Single Source of Truth)

Define keys like:

- `listing.search(paramsHash)`
- `listing.details(listingId, context)`
- `listing.availability(listingId, from, to, context)`
- `booking.mine(filters, context)`
- `booking.details(bookingId, context)`
- `config.priceGroups(context)`
- `config.seasons(context)`
- `config.lia(context)`
- `audit.events(filters, context)`

Include “context” composition rules (tenantId, orgId, role scope) so caches
don’t leak across contexts.

### F2) Caching & Invalidation Policy

Create specific rules:

- `staleTime` and `gcTime` guidance per resource type
- invalidation after mutations (what to invalidate, what to patch)
- optimistic updates only where safe; otherwise invalidate (describe the
  trade-off).
  [oai_citation:7‡GitHub](https://github.com/TanStack/query/discussions/677?utm_source=chatgpt.com)

### F3) Prefetch Strategy

- on listing hover: prefetch listing details + 30-day availability + quote
  config
- on navigation to dashboard tab: prefetch bookings list and summaries

### F4) SSR Strategy (Next.js)

- QueryClient provider location
- dehydration/hydration
- avoid double-fetch
- “stale on mount” behavior control
  [oai_citation:8‡tanstack.com](https://tanstack.com/query/v4/docs/react/guides/ssr?utm_source=chatgpt.com)

### F5) Realtime (WebSocket)

Define:

- event types (BookingCreated, BookingUpdated, ListingUpdated,
  AvailabilityChanged, RuleConfigChanged)
- for each event: patch which queries vs invalidate which queries

---

## Deliverable G — Zustand Policy (UI State Only)

Define a strict separation:

- Zustand = UI-only (filters, selected date range, wizard step, open drawers)
- TanStack Query = server state Explain why this matches “server cache vs client
  state” best practice.

---

## Deliverable H — Concrete Examples (MUST)

Provide concrete DTOs + endpoint + hook + usage examples for:

1. **listing**
2. **booking**
3. **price group**
4. **season**
5. **LIA** Include:

- Entity DTO (if used internally/for backoffice forms)
- Projection DTO for at least 1 real screen (public + backoffice + dashboard)
- A hook signature
- A component example that uses the hook WITHOUT transformations (only
  rendering + minimal formatting)

Example must include:

- `permissions`
- `availableActions`
- `policyDecisions`
- RFC7807 error example for one flow

---

## Deliverable I — Step-by-step Implementation Plan

Phased plan with acceptance criteria:

### Phase 1 — Contract Foundation

- publish DTO standard
- introduce SDK error mapping (RFC7807)
- implement canonical query keys

### Phase 2 — High-traffic Projections

- listing search, listing details, availability, quote
- add contract tests + payload budgets

### Phase 3 — Backoffice + AuthZ Surface

- approval queue projections
- config projections (price groups/seasons/LIA)
- add role matrix tests

### Phase 4 — Realtime + Perf Hardening

- websocket patching
- caching tuning
- production observability and correlation IDs

Include:

- contract tests (schema snapshots)
- integration tests per role (RBAC matrix)
- performance checks (payload limits, cache hit rate, TTFB/TTI targets)
- backward compatibility rules

---

# QUALITY GATES (MUST PASS)

- Zero per-app transformers (no app-specific mapping of API DTOs)
- SDK is the ONLY network integration surface in apps
- All endpoints comply with DTO standard + RFC7807
- RBAC decisions always provided by API (permissions/actions/policy reasons)
- Shared hooks enforce consistent caching/invalidation across apps
- Listing terminology correct everywhere (“listing” only)

---

# FINAL OUTPUT FORMAT

Return the solution as a structured architecture spec with:

- headings and bullet lists
- explicit DTO field lists
- endpoint catalog
- package structures
- example code blocks for TypeScript interfaces, SDK methods, hooks, and
  component consumption
- step-by-step implementation checklist

DO NOT:

- ask follow-up questions
- suggest per-app transformers
- use the word “facility”
