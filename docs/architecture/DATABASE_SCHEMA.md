# Database Schema Architecture

**Last Updated:** 2026-01-16  
**Migration:** `0001_clean_schema.sql`

## Overview

The Digilist/Xala database follows a **clean, schema-separated architecture** with explicit enum tables following SOLID principles. All legacy "listing" terminology has been replaced with "rental_object".

## Schema Organization

### 1. **platform** - Multi-tenant SaaS Infrastructure
Core platform services that power the entire system:
- Tenants, Organizations, Users
- RBAC (Roles, Permissions, Scopes)
- Subscriptions, Plans, Modules, Entitlements
- Feature Flags, i18n, Themes
- Audit Events, Outbox Pattern, Notifications
- Webhooks, Secrets Management

### 2. **domain** - Digilist Business Logic
Domain-specific tables for rental/booking operations:
- Rental Objects (formerly "listings")
- Categories, Types, Metadata
- Bookings, Approvals, Recurring Series
- Time Blocks, Pricing, Payments
- Amenities, Add-ons, Policies
- Integrations, Attachments

### 3. **monitoring** - Observability
System health and debugging:
- Service Health Checks
- Structured Logs
- Auth Event Tracing

### 4. **compliance** - GDPR/NSM Safety Layer
Privacy and data protection compliance:
- Data Asset Inventory (PII tracking)
- Retention Policies & Automated Jobs
- Consent Management
- DSAR (Data Subject Access Requests)
- Access Logs (accountability)
- Anonymization Actions
- Processing Records (GDPR Art. 30)
- Security Incident Register (Breach tracking)

## Design Principles

### ✅ Enum Tables (Not Postgres ENUMs)
All enums are **tables with CHECK constraints** for:
- **Type safety** in application code
- **Referential integrity** via foreign keys
- **Easy evolution** (add values without ALTER TYPE)
- **SDK/API contract stability**

Example:
```sql
create table platform.enum_tenant_status (
  code text primary key check (code in ('ACTIVE','SUSPENDED','DELETED'))
);

-- Usage
create table platform.tenants (
  status text not null references platform.enum_tenant_status(code)
);
```

### ✅ Tenant Isolation
Every domain table includes:
```sql
tenant_id uuid not null references platform.tenants(id) on delete cascade
```

### ✅ Flexible Rules via JSONB
Instead of adding columns for every rule type:
```sql
create table domain.rental_objects (
  rules jsonb not null default '{}'::jsonb
);
```

Supports:
- Min/max duration
- Lead time requirements
- Age restrictions
- Pricing rules
- Blackout periods
- Custom validation logic

### ✅ Audit-First
All mutations tracked via:
```sql
create table platform.audit_events (
  tenant_id uuid not null,
  actor_user_id uuid null,
  actor_type text not null, -- USER, SYSTEM, SERVICE
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);
```

### ✅ Outbox Pattern
Reliable event publishing:
```sql
create table platform.outbox_events (
  idempotency_key text not null,
  status text not null, -- PENDING, SENT, FAILED
  payload jsonb not null,
  unique (tenant_id, idempotency_key)
);
```

## Key Tables

### Rental Objects (Core Domain)
```sql
domain.rental_objects
  - type_code → domain.rental_object_types
  - category_id → domain.rental_object_categories
  - booking_mode → domain.enum_booking_mode
  - rules (jsonb) - flexible policy storage
```

**Booking Modes:**
- `SINGLE_SLOT` - One-time bookings
- `IN_GAME` - Sports field time slots
- `RECURRING` - Repeating schedules
- `ALL_DAY` - Full-day rentals

### Bookings
```sql
domain.bookings
  - rental_object_id
  - booked_by_user_id
  - booked_for_org_id (optional)
  - status → domain.enum_booking_status
  - approval_status → domain.enum_approval_status
```

**Approval Workflow:**
1. Booking created → `status: PENDING`, `approval_status: PENDING`
2. Case handler reviews → `domain.booking_approvals` record
3. Decision applied → `approval_status: APPROVED/REJECTED`
4. Status updated → `status: APPROVED/REJECTED`

### Metadata System
Tenant-configurable fields for rental objects:

```sql
domain.metadata_definitions
  - code (stable key)
  - value_type (TEXT, NUMBER, BOOLEAN, DATE, JSON, ENUM)
  - is_filterable, is_required
  - validation rules

domain.rental_object_metadata
  - value_text, value_number, value_boolean, value_date, value_json
```

Examples:
- `area_m2` (NUMBER) - Floor area
- `has_projector` (BOOLEAN) - Equipment
- `wheelchair_accessible` (BOOLEAN) - Accessibility
- `opening_hours` (JSON) - Complex schedules

### Pricing System
Multi-dimensional pricing:

```sql
domain.pricing_groups (CITIZEN, ORG, INTERNAL, YOUTH, SENIOR)
domain.rental_object_pricing
  - pricing_group_id
  - pricing (jsonb) - per-hour, per-day, peak/off-peak
  - deposit_cents, cancellation_fee_cents
  - effective_from, effective_to
```

### Amenities & Add-ons
**Amenities** (filterable features):
```sql
domain.amenities (WIFI, PROJECTOR, PARKING, WHEELCHAIR)
domain.rental_object_amenities (many-to-many)
```

**Add-ons** (purchasable extras):
```sql
domain.addons (CLEANING, CARETAKER, SECURITY)
domain.rental_object_addons (availability per object)
domain.booking_addons (selected per booking)
```

## Migration Strategy

### ✅ Completed
- ✅ Removed `apps/api/supabase/` (legacy Supabase migrations)
- ✅ Removed all old `apps/api/drizzle/*.sql` files
- ✅ Created single clean migration: `0001_clean_schema.sql`
- ✅ Updated `.gitignore` to prevent Supabase directory

### 🔄 Next Steps
1. **Update Drizzle Schema** (`src/database/schema/index.ts`)
   - Align TypeScript types with new SQL schema
   - Use schema-qualified names (`platform.tenants`, `domain.rental_objects`)

2. **Global Code Cleanup**
   - Replace remaining "listing" references with "rental_object"
   - Update SDK types and API contracts
   - Fix GraphQL schema

3. **Seed Data**
   - Create tenant seed
   - Create rental object types seed
   - Create demo users with proper roles

4. **Run Migration**
   ```bash
   pnpm --filter @digilist/api db:migrate
   ```

## Benefits

### 🎯 Single Source of Truth
One migration file = complete schema understanding

### 🔒 Type Safety
Enum tables enforce valid values at database level

### 📈 Scalability
- JSONB for flexible rules without schema churn
- Metadata system for tenant-specific fields
- Pricing groups for complex pricing logic

### 🔍 Observability
- Audit events for compliance
- Structured logs for debugging
- Auth event tracing for security

### 🚀 Multi-tenancy
- Complete tenant isolation
- Subscription-based feature gates
- Organization-scoped permissions

## Example Queries

### Find Available Rental Objects
```sql
SELECT ro.*
FROM domain.rental_objects ro
WHERE ro.tenant_id = $1
  AND ro.status = 'PUBLISHED'
  AND NOT EXISTS (
    SELECT 1 FROM domain.rental_object_time_blocks tb
    WHERE tb.rental_object_id = ro.id
      AND tb.status = 'ACTIVE'
      AND tb.start_at <= $3
      AND tb.end_at >= $2
  )
  AND NOT EXISTS (
    SELECT 1 FROM domain.bookings b
    WHERE b.rental_object_id = ro.id
      AND b.status IN ('PENDING', 'APPROVED')
      AND b.start_at < $3
      AND b.end_at > $2
  );
```

### Get User Permissions
```sql
SELECT DISTINCT p.code
FROM platform.user_roles ur
JOIN platform.role_permissions rp ON rp.role_id = ur.role_id
JOIN platform.permissions p ON p.id = rp.permission_id
WHERE ur.user_id = $1
  AND ur.tenant_id = $2
  AND (
    ur.scope_type = 'TENANT'
    OR (ur.scope_type = 'ORGANIZATION' AND ur.organization_id = $3)
  );
```

### Check Feature Entitlement
```sql
SELECT te.state
FROM platform.tenant_entitlements te
JOIN platform.modules m ON m.id = te.module_id
WHERE te.tenant_id = $1
  AND m.code = 'PAYMENTS'
  AND te.state = 'ENABLED';
```

## GDPR/NSM Compliance Layer

### Data Asset Inventory
Track what personal data exists and why:

```sql
compliance.data_assets
  - schema_name, table_name, column_name
  - contains_personal_data, contains_special_category
  - purpose (purpose limitation)
  - lawful_basis (CONSENT, CONTRACT, LEGAL_OBLIGATION, etc.)
  - retention_policy_id
```

**Example Registration:**
```sql
INSERT INTO compliance.data_assets (
  tenant_id, schema_name, table_name, column_name,
  contains_personal_data, purpose, lawful_basis
) VALUES (
  $1, 'platform', 'users', 'email',
  true, 'User authentication and communication', 'CONTRACT'
);
```

### Retention Policies & Automated Jobs
Define and execute data retention rules:

```sql
compliance.retention_policies
  - code (e.g., BOOKING_10Y, AUDIT_5Y, SESSION_30D)
  - action (DELETE, ANONYMIZE, ARCHIVE)
  - retain_days (how long to keep)
  - anchor (created_at, completed_at, cancelled_at)

compliance.retention_jobs
  - target_schema, target_table, target_pk
  - scheduled_for (when to execute)
  - status (PENDING, RUNNING, DONE, FAILED)
```

**Worker Flow:**
1. Scan tables with retention policies
2. Find records past retention period
3. Create `retention_jobs` entries
4. Worker executes DELETE/ANONYMIZE
5. Log to `audit_events` + `anonymization_actions`

### Consent Management
Track user consent for optional processing:

```sql
compliance.consent_purposes
  - code (MARKETING_EMAILS, ANALYTICS, NOTIFICATIONS_OPTIONAL)
  - is_required (false for optional)

compliance.user_consents
  - user_id, purpose_id
  - granted (true/false)
  - source (ui, api, import, admin)
  - version (consent text version)
  - ip, user_agent (proof of consent)
```

**Consent Withdrawal:**
```sql
INSERT INTO compliance.user_consents (
  tenant_id, user_id, purpose_id, granted, source
) VALUES ($1, $2, $3, false, 'ui');
```

### DSAR (Data Subject Access Requests)
Handle GDPR rights requests:

```sql
compliance.dsar_requests
  - type (ACCESS, RECTIFICATION, ERASURE, RESTRICTION, PORTABILITY, OBJECTION)
  - status (RECEIVED, IN_PROGRESS, NEED_INFO, COMPLETED, REJECTED)
  - due_at (30 days from request)
  - export_attachment_id (link to generated export bundle)

compliance.dsar_items
  - entity_type, entity_id
  - action (EXPORT, RECTIFY, DELETE, ANONYMIZE, RESTRICT)
  - status (PENDING, DONE, FAILED, SKIPPED)
```

**DSAR Workflow:**
1. User submits request → `dsar_requests` created
2. System generates items → `dsar_items` for each affected entity
3. For ACCESS: Generate export bundle → store in `domain.attachments`
4. For ERASURE: Create `retention_jobs` with immediate schedule
5. Mark request COMPLETED

### Access Logs (Accountability)
Track who accessed whose personal data:

```sql
compliance.data_access_events
  - actor_user_id (who)
  - subject_user_id (whose data)
  - action (READ, EXPORT, UPDATE, DELETE, APPROVE, REJECT)
  - entity_type, entity_id (what)
  - purpose (why - must match documented purpose)
  - ip, user_agent (when/where)
```

**When to Log:**
- Admin/Saksbehandler views user profile → READ
- Case handler exports booking report → EXPORT
- Admin updates user email → UPDATE
- DSAR export generated → EXPORT
- Booking approved/rejected → APPROVE/REJECT

### Anonymization Actions
Track irreversible data transformations:

```sql
compliance.anonymization_actions
  - entity_type, entity_id
  - method (NULLIFY_EMAIL, HASH_NAME, REMOVE_ATTACHMENTS)
  - performed_by_user_id
  - performed_at
```

**Methods:**
- `NULLIFY_EMAIL`: Set email to `deleted-{uuid}@anonymized.local`
- `HASH_NAME`: Replace name with `User-{hash}`
- `REMOVE_ATTACHMENTS`: Delete linked files
- `PSEUDONYMIZE_IP`: Replace IP with subnet only

### Processing Records (GDPR Art. 30)
Maintain register of processing activities:

```sql
compliance.processing_records
  - record_type (DATA_CONTROLLER, DATA_PROCESSOR)
  - activity_name (e.g., "Booking Management", "Payment Processing")
  - categories_of_data (names, emails, booking history, payment data)
  - categories_of_subjects (citizens, organizations, employees)
  - recipients (internal staff, payment processors, email providers)
  - transfers_outside_eea (true/false)
  - transfer_safeguards (Standard Contractual Clauses, Adequacy Decision)
  - retention_summary (10 years for bookings, 5 years for audits)
  - security_measures (encryption, access controls, audit logs)
```

### Security Incident Register (GDPR Art. 33/34)
Track and report data breaches:

```sql
compliance.security_incidents
  - title, description
  - severity (LOW, MEDIUM, HIGH, CRITICAL)
  - detected_at, contained_at
  - reported_to_authority_at (within 72 hours if required)
  - notified_subjects_at (if high risk to rights/freedoms)
  - impact_summary, remediation
  - status (OPEN, INVESTIGATING, RESOLVED, CLOSED)
```

**Breach Response Flow:**
1. Incident detected → Create record with severity
2. Assess impact → Update impact_summary
3. If HIGH/CRITICAL + personal data → Report to DPA within 72h
4. If high risk to individuals → Notify affected users
5. Document remediation → Close incident

## Integration Guidelines

### 1. Register All PII Tables
```sql
-- Example: Register users table
INSERT INTO compliance.data_assets (
  schema_name, table_name, column_name,
  contains_personal_data, purpose, lawful_basis
) VALUES
  ('platform', 'users', 'email', true, 'Authentication', 'CONTRACT'),
  ('platform', 'users', 'display_name', true, 'User identification', 'CONTRACT'),
  ('platform', 'users', 'phone', true, 'Contact and notifications', 'CONTRACT');
```

### 2. Log Access to Personal Data
```typescript
// In admin/saksbehandler controllers
await db.insert(compliance.dataAccessEvents).values({
  tenantId: request.tenantId,
  actorUserId: request.userId,
  actorRole: request.userRole,
  action: 'READ',
  subjectUserId: viewedUserId,
  entityType: 'user',
  entityId: viewedUserId,
  purpose: 'Case handling',
  ip: request.ip,
  userAgent: request.headers['user-agent']
});
```

### 3. Implement Retention Workers
```typescript
// Cron job: Daily retention check
async function processRetentionPolicies() {
  const policies = await db.select()
    .from(compliance.retentionPolicies)
    .where(eq(compliance.retentionPolicies.isActive, true));

  for (const policy of policies) {
    // Find records past retention period
    const expiredRecords = await findExpiredRecords(policy);
    
    // Create retention jobs
    for (const record of expiredRecords) {
      await db.insert(compliance.retentionJobs).values({
        tenantId: record.tenantId,
        policyId: policy.id,
        targetSchema: policy.targetSchema,
        targetTable: policy.targetTable,
        targetPk: record.id,
        action: policy.action,
        scheduledFor: new Date()
      });
    }
  }
}
```

### 4. Handle DSAR Requests
```typescript
// DSAR export endpoint
async function handleDsarExport(dsarId: string) {
  const dsar = await db.select()
    .from(compliance.dsarRequests)
    .where(eq(compliance.dsarRequests.id, dsarId))
    .limit(1);

  // Collect all user data
  const userData = await collectUserData(dsar.requesterUserId);
  
  // Generate export bundle (JSON/PDF)
  const exportFile = await generateExportBundle(userData);
  
  // Store as attachment
  const attachment = await db.insert(domain.attachments).values({
    tenantId: dsar.tenantId,
    entityType: 'AUDIT_EVENT',
    entityId: dsarId,
    visibility: 'PRIVATE',
    fileName: `dsar-export-${dsarId}.zip`,
    mimeType: 'application/zip',
    sizeBytes: exportFile.size,
    storageProvider: 'AZURE_BLOB',
    storageKey: exportFile.key,
    uploadedByUserId: null // System-generated
  });
  
  // Link to DSAR request
  await db.update(compliance.dsarRequests)
    .set({ 
      exportAttachmentId: attachment.id,
      status: 'COMPLETED',
      completedAt: new Date()
    })
    .where(eq(compliance.dsarRequests.id, dsarId));
}
```

## Notes

- All timestamps use `timestamptz` (timezone-aware)
- All IDs use `uuid` with `gen_random_uuid()`
- All foreign keys have explicit `on delete` behavior
- All unique constraints are explicit
- All indexes are documented with purpose
- **GDPR compliance is built-in, not bolted-on**
- **Retention policies are automated via workers**
- **Access logs provide full accountability trail**
