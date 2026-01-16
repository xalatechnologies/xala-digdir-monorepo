# DIGILIST / XALA — PLATFORM + DOMAIN SECURITY & ECONOMY SCHEMA

**Version:** 1.0.0  
**Last Updated:** 2026-01-16  
**Status:** Canonical Contract

This document defines the **security and economy architecture** for the Xala/Digilist platform. All implementations must conform to this contract.

---

## 1. Authentication (Who are you?)

### Identity Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| User | `platform.users` | Individual user accounts |
| Tenant | `platform.tenants` | Multi-tenant isolation boundary |
| Organization | `platform.organizations` | Sub-tenant grouping (communes, clubs) |
| Membership | `platform.user_org_memberships` | User-to-organization relationships |

### Authentication Providers

**Storage:**
- **Integrations:** `domain.integrations` (type: `ID_PORTEN`, `BANKID`, `FEIDE`, `MICROSOFT_SSO`)
- **Secrets:** `platform.secrets` (encrypted credentials)

**Notes:**
- Providers configured per tenant/organization
- OAuth callbacks handled at API layer
- Database stores only identities and linkage (no tokens)

### Session Model

**Transport:** HTTP-only cookies (preferred)

**Required JWT Claims:**
```json
{
  "sub": "user_id",
  "tenant_id": "uuid",
  "role": "ADMIN",
  "org_id": "uuid (optional)",
  "permissions": ["rental_objects:write", "bookings:approve"]
}
```

**Session Endpoint Contract:**
- Must be deterministic (no optional middleware dependencies)
- Must set `Cache-Control: no-store`
- Must return effective roles + permissions + tenant/org context

### Optional: Server-Side Session Tracking

**Table:** `platform.user_sessions` (if force-logout or refresh rotation needed)

```sql
create table platform.user_sessions (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  user_id uuid not null references platform.users(id),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz null,
  user_agent text null,
  ip inet null,
  refresh_family_id uuid null, -- refresh token rotation family
  metadata jsonb not null default '{}'::jsonb
);
```

---

## 2. Authorization (What can you do?)

### Authorization Model

**Primary:** RBAC (Role-Based Access Control)  
**Secondary:** ABAC (Attribute-Based Access Control)

**Enforcement Boundary:**
- **API:** Business rules, permission checks, status transitions
- **Database:** Tenant isolation, ownership constraints (via RLS)

### Core Tables

#### Permissions
**Table:** `platform.permissions`

```sql
create table platform.permissions (
  id uuid primary key,
  code text not null unique, -- e.g., "rental_objects:write"
  description text null
);
```

#### Roles
**Table:** `platform.roles`

```sql
create table platform.roles (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  code text not null, -- PUBLIC|USER|SAKSBEHANDLER|ADMIN|TENANT_ADMIN|SUPER_ADMIN
  name text not null,
  is_system boolean not null default true,
  unique (tenant_id, code)
);
```

#### Role Permissions
**Table:** `platform.role_permissions`

```sql
create table platform.role_permissions (
  tenant_id uuid not null,
  role_id uuid not null references platform.roles(id),
  permission_id uuid not null references platform.permissions(id),
  primary key (tenant_id, role_id, permission_id)
);
```

#### User Roles
**Table:** `platform.user_roles`

```sql
create table platform.user_roles (
  id uuid primary key,
  tenant_id uuid not null,
  user_id uuid not null references platform.users(id),
  role_id uuid not null references platform.roles(id),
  scope_type text not null, -- TENANT | ORGANIZATION
  organization_id uuid null references platform.organizations(id),
  check (
    (scope_type = 'TENANT' and organization_id is null) or
    (scope_type = 'ORGANIZATION' and organization_id is not null)
  )
);
```

### ABAC Policy Rules (Examples)

| Resource | Action | Policy |
|----------|--------|--------|
| Booking | Read | `booking.booked_by_user_id == current_user_id` |
| Booking | Read | `booking.booked_for_org_id in user_org_memberships` |
| Rental Object | Write | `role in (ADMIN, TENANT_ADMIN) AND tenant_match` |
| Approval | Decision | `role in (SAKSBEHANDLER, ADMIN) AND tenant_match` |

### Enterprise Additions (Recommended)

#### Permission Sets
**Table:** `platform.permission_sets`

Bundle permissions for easier admin UI and versioning.

```sql
create table platform.permission_sets (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  code text not null,
  name text not null,
  permissions_json jsonb not null, -- ["rental_objects:write", "bookings:approve"]
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);
```

#### Role Versions
**Table:** `platform.role_versions`

Immutable snapshots for audit and rollback.

```sql
create table platform.role_versions (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  role_id uuid not null references platform.roles(id),
  version int not null,
  permissions_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, role_id, version)
);
```

#### Effective Permissions Cache
**Table:** `platform.user_effective_permissions_cache`

Pre-computed permissions for performance.

```sql
create table platform.user_effective_permissions_cache (
  tenant_id uuid not null references platform.tenants(id),
  user_id uuid not null references platform.users(id),
  permissions_json jsonb not null,
  computed_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
```

---

## 3. Audit Log (Append-Only, Tamper-Evident)

### Required Table
**Table:** `platform.audit_events`

**Properties:**
- Append-only (no updates/deletes)
- Tamper-evident (optional hash chaining)

**Minimum Fields:**
```sql
create table platform.audit_events (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  actor_type text not null, -- USER | SYSTEM | SERVICE
  actor_user_id uuid null references platform.users(id),
  action text not null, -- "auth.login" | "booking.approve" | "rental_object.update"
  entity_type text not null, -- booking | rental_object | user | org | payment
  entity_id uuid null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);
```

### Hardening: Hash Chaining

Prevents silent tampering; verify chain in monitoring job.

```sql
alter table platform.audit_events
  add column prev_hash text null,
  add column row_hash text not null;

-- Hash function
create or replace function platform.compute_audit_hash(
  p_id uuid,
  p_tenant_id uuid,
  p_action text,
  p_entity_id uuid,
  p_prev_hash text
) returns text as $$
  select encode(
    digest(
      p_id::text || p_tenant_id::text || p_action || 
      coalesce(p_entity_id::text, '') || coalesce(p_prev_hash, ''),
      'sha256'
    ),
    'hex'
  )
$$ language sql immutable;
```

### Policy Snapshot on Sensitive Actions

For approval decisions, store effective permissions in metadata:

```json
{
  "effective_permissions": ["bookings:approve", "bookings:reject"],
  "decision_reason": "Booking conflicts with maintenance window",
  "policy_version": "v2.1"
}
```

---

## 4. Incident Log / Security Events

### Operations Incidents
**Table:** `monitoring.incidents`

```sql
create table monitoring.incidents (
  id uuid primary key,
  tenant_id uuid null references platform.tenants(id),
  severity text not null, -- LOW | MEDIUM | HIGH | CRITICAL
  status text not null, -- OPEN | INVESTIGATING | RESOLVED | CLOSED
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  links jsonb null -- runbooks, tickets
);
```

### Auth Security Events
**Table:** `monitoring.auth_events`

**Examples:**
- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `SESSION_401`
- `REFRESH_SUCCESS`
- `REFRESH_FAILED`
- `LOGOUT`

### GDPR Breach Register
**Table:** `compliance.security_incidents`

**Notes:**
- Keep separate from ops incidents
- Includes `reported_to_authority_at` (72-hour deadline)
- Includes `notified_subjects_at` (if high risk)

---

## 5. Economy (Billing, Plans, Subscriptions, Payments)

### SaaS Core

| Table | Purpose |
|-------|---------|
| `platform.modules` | Feature modules (CORE_BOOKING, PAYMENTS, REPORTS) |
| `platform.plans` | Subscription plans (STARTER, PRO, ENTERPRISE) |
| `platform.plan_modules` | Module availability per plan |
| `platform.subscriptions` | Active tenant subscriptions |
| `platform.tenant_entitlements` | Tenant-specific module access |

**Enforcement:**
- API checks entitlement before enabling module endpoints
- UI hides unavailable modules based on session payload

### Payments

**Provider Integrations:**
- `domain.integrations` (type: `VIPPS`, `STRIPE`)
- `platform.secrets` for API keys

**Transactions:**
- `domain.payments` (status: `INITIATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `CANCELLED`)

### Enterprise Financial Tables (Recommended)

#### Invoices
**Table:** `platform.invoices`

```sql
create table platform.invoices (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  invoice_no text not null unique,
  period_start date not null,
  period_end date not null,
  amount_cents int not null,
  currency text not null default 'NOK',
  status text not null, -- DRAFT | ISSUED | PAID | VOID | OVERDUE
  pdf_attachment_id uuid null references domain.attachments(id),
  created_at timestamptz not null default now(),
  due_at timestamptz null,
  paid_at timestamptz null
);
```

#### Invoice Lines
**Table:** `platform.invoice_lines`

```sql
create table platform.invoice_lines (
  id uuid primary key,
  invoice_id uuid not null references platform.invoices(id),
  description text not null,
  quantity numeric not null,
  unit_price_cents int not null,
  amount_cents int not null,
  metadata jsonb not null default '{}'::jsonb
);
```

#### Ledger Entries
**Table:** `platform.ledger_entries`

Accounting audit trail.

```sql
create table platform.ledger_entries (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  entry_type text not null, -- CHARGE | PAYMENT | REFUND | ADJUSTMENT
  reference_type text not null, -- SUBSCRIPTION | BOOKING | INVOICE
  reference_id uuid not null,
  amount_cents int not null, -- signed (negative for credits)
  currency text not null default 'NOK',
  created_at timestamptz not null default now()
);
```

#### Usage Metering
**Table:** `platform.usage_events`

For limits and pay-as-you-go billing.

```sql
create table platform.usage_events (
  id uuid primary key,
  tenant_id uuid not null references platform.tenants(id),
  module_id uuid null references platform.modules(id),
  metric text not null, -- api_calls | bookings | storage_bytes | messages
  value numeric not null,
  occurred_at timestamptz not null default now()
);
```

---

## 6. RLS + AuthZ Boundary

### What Database Guarantees (via RLS)

✅ **Tenant Isolation**
- `tenant_id = rls.current_tenant_id()`

✅ **Ownership Constraints**
- User-scoped rows (favourites, notifications)
- `user_id = rls.current_user_id()`

✅ **Participant-Only Access**
- Conversations/messages (via `conversation_participants`)

### What API Guarantees

✅ **Business Rules**
- Booking overlap detection
- Approval workflow enforcement
- Pricing calculation

✅ **Permission Checks**
- Role/permission gates
- `hasPermission('rental_objects:write')`

✅ **Status Transitions**
- `PENDING` → `APPROVED` (only via approval endpoint)
- `DRAFT` → `PUBLISHED` (only with `rental_objects:publish`)

✅ **Rate Limiting & Abuse Controls**
- Per-tenant API quotas
- Brute-force protection

### Required Claim Injection

**API must set DB session claims per request:**

```typescript
await db.execute(sql`
  select set_config('request.jwt.claim.sub', ${userId}, true),
         set_config('request.jwt.claim.tenant_id', ${tenantId}, true),
         set_config('request.jwt.claim.role', ${role}, true)
`);
```

---

## 7. Starter Permission Set

### Rental Objects
- `rental_objects:read`
- `rental_objects:write`
- `rental_objects:publish`
- `rental_objects:archive`

### Categories
- `categories:read`
- `categories:write`

### Bookings
- `bookings:read`
- `bookings:create`
- `bookings:cancel`
- `bookings:approve`
- `bookings:reject`
- `bookings:block_time`

### Payments
- `payments:read`
- `payments:refund`

### Users & Organizations
- `users:read`
- `users:manage`
- `orgs:read`
- `orgs:manage`

### Compliance
- `audit:read`
- `dsar:manage`
- `incidents:manage`

### Platform
- `billing:manage`
- `entitlements:manage`
- `integrations:manage`
- `themes:manage`
- `translations:manage`

---

## 8. Role-to-Permission Matrix

| Role | Permissions |
|------|-------------|
| **PUBLIC** | None (unauthenticated) |
| **USER** | `rental_objects:read`, `bookings:read`, `bookings:create`, `bookings:cancel` (own) |
| **SAKSBEHANDLER** | USER + `bookings:approve`, `bookings:reject`, `bookings:block_time`, `users:read`, `orgs:read` |
| **ADMIN** | SAKSBEHANDLER + `rental_objects:write`, `rental_objects:publish`, `categories:write`, `users:manage`, `orgs:manage` |
| **TENANT_ADMIN** | ADMIN + `billing:manage`, `entitlements:manage`, `integrations:manage`, `themes:manage` |
| **SUPER_ADMIN** | ALL (cross-tenant access) |

---

## 9. Implementation Checklist

### Database
- ✅ Core schema (platform/domain/monitoring/compliance)
- ✅ RLS policies enabled
- ✅ Audit events append-only
- ⏳ Optional: Hash chaining for audit events
- ⏳ Optional: Enterprise financial tables

### API
- ⏳ Set DB session claims per request
- ⏳ Permission middleware (`@RequirePermission('bookings:approve')`)
- ⏳ Role-based guards (`@RequireRole('ADMIN')`)
- ⏳ Tenant isolation in all queries
- ⏳ Audit logging on all mutations

### Frontend
- ⏳ Session endpoint returns effective permissions
- ⏳ UI hides unavailable features based on permissions
- ⏳ Entitlement checks for module access

### Testing
- ⏳ RLS policy tests (attempt cross-tenant access)
- ⏳ Permission enforcement tests
- ⏳ Audit log verification
- ⏳ GDPR compliance tests (DSAR, retention)

---

## 10. Security Hardening

### Production Checklist

✅ **Database**
- Enable RLS on all tenant-scoped tables
- Revoke default public access
- Use connection pooling with per-request claims
- Enable audit logging for DDL changes

✅ **API**
- HTTP-only cookies for session tokens
- CSRF protection (SameSite=Lax + token validation)
- Rate limiting (per-tenant, per-endpoint)
- Input validation (Zod schemas)

✅ **Monitoring**
- Alert on failed login attempts (>5 in 5 min)
- Alert on cross-tenant access attempts
- Alert on permission escalation attempts
- Daily audit log integrity check (hash chain)

✅ **Compliance**
- GDPR retention policies active
- DSAR workflow tested
- Breach notification procedure documented
- Data processing records maintained

---

## Appendix: Migration Files

| File | Purpose |
|------|---------|
| `0001_clean_schema.sql` | Core platform/domain/monitoring/compliance |
| `0002_domain_notifications.sql` | In-app notifications |
| `0003_domain_messaging.sql` | Conversations & messages |
| `0004_domain_feedback.sql` | Ratings, feedback, favourites |
| `0005_domain_profiles.sql` | User profiles & settings |
| `0006_domain_support.sql` | Help & support system |
| `0007_domain_rag.sql` | Knowledge base & RAG |
| `0008_domain_seo.sql` | SEO metadata |
| `0009_domain_geo.sql` | Geocoding & areas |
| `0010_rls_policies.sql` | Row Level Security |
| `0011_enterprise_economy.sql` | Optional financial tables |

---

**This document is the canonical contract. All code must conform to this architecture.**
