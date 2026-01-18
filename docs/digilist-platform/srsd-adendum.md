# SRSD ADDENDUM — Deep-Dive Flows, Policies, API Contracts & Sequences
**Version:** 1.0  
**Last updated:** 2026-01-18 (Europe/Oslo)  
**Status:** Canonical technical addendum to SRSD  
**Audience:** Architects, senior engineers, AI coding agents, auditors

> This addendum completes the SRSD by defining **end-to-end flows**, **policy evaluation order**, **API contract outlines**, and **sequence logic**.  
> Nothing here is optional. This is the final reference for correct implementation.

---

## A) SYSTEM-WIDE POLICY MODEL (AUTHORITATIVE)

### A.1 Unified Authorization Decision

All authorization decisions MUST pass through a single logical evaluation:

Decision can(
actor: {
tenantId,
userId,
roles[],
orgContext? (bo-org or ms-org),
},
action: ActionKey,
resource?: {
listingId?,
bookingId?,
orgId?,
},
appContext: {
appKey,
routeKey?,
featureKey?,
}
) -> {
effect: ALLOW | DENY | READONLY,
reasonKey?: i18nKey
}

### A.2 Evaluation Order (STRICT)

1. **Tenant isolation**
   - tenantId mismatch → DENY (security event)
2. **RBAC baseline**
   - role does not allow action → DENY
3. **Entitlements**
   - module disabled → DENY
   - feature disabled → DENY
   - route/nav disabled → DENY or READONLY
4. **Custody (resource-scoped ABAC)**
   - if resource-scoped action:
     - no valid custody grant → DENY
     - scope not included → DENY
     - time window invalid → DENY
5. **Context constraints**
   - org context required but missing → DENY
6. **Final decision**
   - return ALLOW / READONLY

> UI may pre-check using SDK helpers, but **API enforcement is mandatory**.

---

## B) CORE DOMAIN FLOWS (SEQUENCE-LEVEL)

### B.1 Public → Authenticated Booking Flow (Web)

**Scenario:** User books a listing that requires authentication.

User → Web UI
→ GET /listings (SDK)
→ GET /listings/{id} (SDK)
→ GET /listings/{id}/availability (SDK)

User selects slot
→ POST /bookings/preview
- policy check (PUBLIC)
- returns requiresAuth=true

Web redirects → Login
Auth → API → Web
Web resumes booking state (stored session)

Web → POST /bookings
	•	policy check (USER)
	•	entitlements check (BOOKING module)
	•	booking rules enforced
	•	booking created or REQUESTED

API → audit_events
API → notifications (async)

**Guarantees**
- Return-to-same-step after login
- No booking logic in UI
- Calendar accuracy preserved

---

### B.2 Approval-Based Booking Flow (Saksbehandler)

User → POST /bookings (status=REQUESTED)

Saksbehandler → Backoffice
→ GET /bookings?status=REQUESTED
→ POST /bookings/{id}/approve
- RBAC: SAKSBEHANDLER
- Entitlements: APPROVALS module
- Custody: RO_BOOKING_MANAGE OR system role
- state transition validated

API → booking status CONFIRMED
API → audit_events (before/after)
API → user notification

---

### B.3 Custody Delegation (Tenant Admin → Organization)

Tenant Admin → Backoffice
→ POST /listings/{id}/custody/grants
{
granteeType: ORG,
granteeId: bo_org_id,
scopes: [RO_VIEW, RO_MAINTENANCE, RO_DELEGATE],
canSubdelegate: true
}

API:
	•	RBAC: ADMIN/TENANT_ADMIN
	•	validate tenant + listing ownership
	•	persist custody grant
	•	emit audit event

**Result**
- Organization now has scoped control
- No user yet has access until org context is used

---

### B.4 Subdelegation (Org Admin → Org Member)

Org Admin (org context) → MinSide/Backoffice
→ POST /custody/grants/{parentGrantId}/subgrants
{
memberUserId,
scopes: [RO_MAINTENANCE]
}

API:
	•	RBAC: ORG_ADMIN
	•	validate parent grant allows subdelegation
	•	validate scope subset
	•	persist subgrant
	•	audit event

**Guarantees**
- Member cannot exceed parent scopes
- Revoking parent grant invalidates subgrants

---

### B.5 Mixed Custody Resolution (User + Org)

**Scenario:** Listing delegated to:
- User A (RO_BOOKING_MANAGE)
- Org X (RO_MAINTENANCE)

User A is also a member of Org X.

**Effective scopes = UNION**

RO_BOOKING_MANAGE + RO_MAINTENANCE

**Constraint**
- Union only applies within same tenant
- Time windows and revocations apply independently

---

## C) ENTITLEMENTS FLOW (CONTROL PLANE → RUNTIME)

### C.1 Effective Entitlements Resolution

SaaS Admin config
→ plans
→ tenant overrides
→ route/nav policies

Runtime:
→ GET /me/entitlements
- merge plan defaults
- apply tenant overrides
- apply kill switches
- apply role restrictions

**Returned DTO**

{
modules: ModuleKey[],
features: FeatureKey[],
integrations: {
key,
enabled,
configStatus
}[],
routes: RouteKey[],
navItems: {
key,
visibility,
disabledReasonKey?
}[]
}

**Usage**
- API middleware
- Client SDK hooks
- UI route guards & navigation

---

## D) API CONTRACT OUTLINES (KEY ENDPOINTS)

### D.1 Listings

- `GET /listings`
- `GET /listings/{id}`
- `POST /listings`
- `PATCH /listings/{id}`
- `POST /listings/{id}/publish`

**Rules**
- creation/edit requires ADMIN or custody RO_EDIT
- publish requires ADMIN

---

### D.2 Availability & Calendar

- `GET /listings/{id}/availability`
- `POST /listings/{id}/blackouts`
- `DELETE /blackouts/{id}`

**Rules**
- maintenance requires RO_MAINTENANCE or ADMIN
- availability always reflects:
  - bookings
  - reservations
  - blackouts

---

### D.3 Booking

- `POST /bookings/preview`
- `POST /bookings`
- `POST /bookings/{id}/approve`
- `POST /bookings/{id}/decline`
- `POST /bookings/{id}/cancel`

**Rules**
- preview never mutates state
- state transitions validated server-side
- overlapping bookings prevented

---

### D.4 Custody

- `GET /listings/{id}/custody`
- `POST /listings/{id}/custody/grants`
- `DELETE /custody/grants/{id}`
- `POST /custody/grants/{id}/subgrants`
- `DELETE /custody/subgrants/{id}`

---

### D.5 Entitlements

- `GET /me/entitlements`
- `POST /plans`
- `POST /tenant-overrides`
- `POST /route-policies`
- `POST /nav-policies`

---

### D.6 SaaS Admin / Governance

- `POST /tenants`
- `POST /subscriptions`
- `POST /license-keys`
- `POST /billing/webhooks`
- `POST /integrations/{key}/validate`

---

## E) ERROR HANDLING (RFC7807 EXTENSIONS)

All errors MUST include:

{
type,
title,
status,
detail,
instance,
correlationId,
errorCode,
errors?: [{ field, message }]
}

**Special Cases**
- AuthZ denial:
  - status: 403
  - errorCode: AUTHZ_DENIED
- Entitlement denial:
  - errorCode: FEATURE_DISABLED
- Custody denial:
  - errorCode: CUSTODY_SCOPE_MISSING

---

## F) OBSERVABILITY SEQUENCES

### F.1 Runtime Error → Incident Dashboard

Error occurs
→ Sentry captures (with release + tags)
→ Sentry webhook → API /incidents/ingest
→ incidents table updated
→ SaaS Admin UI updates

**Tags required**
- app
- environment
- release
- correlationId
- tenantId (safe)
- routeKey

---

## G) EDGE CASES (MANDATORY TO HANDLE)

1. DST change during recurring booking
2. Revoking custody while user is mid-operation
3. Feature flag disabled while UI open
4. Billing webhook arrives out-of-order
5. Org member removed while holding subgrant
6. Tenant suspended mid-session
7. Listing archived with future bookings

Each edge case MUST have:
- integration test
- documented behavior
- audit evidence

---

## H) NON-FUNCTIONAL GUARANTEES (ENFORCED)

- No-console in production code
- Env validation at boot
- All secrets redacted
- Structured logs everywhere
- Synthetic monitors per app
- CI fails on missing tests or missing evidence

---

## I) TRACEABILITY

This addendum maps to:
- PRD sections 6–10
- SRSD sections 3–8
- PRP phases 2–7
- Test Master Spec sections 1–12

> **Any implementation or test that contradicts this addendum is incorrect.**

---

## J) FINAL RULE

> **Behavior is defined by policy, not by UI.**  
> **Authority lives in the API, not in the client.**  
> **If it is not observable, it is not complete.**