-- =====================================================================
-- ENTERPRISE ECONOMY EXTENSIONS (Optional)
-- Invoicing, Ledger, Usage Metering, Permission Sets, Role Versions
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) INVOICING SYSTEM
-- ---------------------------------------------------------------------

create table if not exists platform.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  invoice_no text not null unique,
  period_start date not null,
  period_end date not null,
  amount_cents int not null,
  currency text not null default 'NOK',
  status text not null check (status in ('DRAFT','ISSUED','PAID','VOID','OVERDUE')) default 'DRAFT',
  pdf_attachment_id uuid null references domain.attachments(id) on delete set null,
  created_at timestamptz not null default now(),
  due_at timestamptz null,
  paid_at timestamptz null
);

create index if not exists idx_invoices_tenant_status
  on platform.invoices(tenant_id, status);

create table if not exists platform.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references platform.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null,
  unit_price_cents int not null,
  amount_cents int not null,
  metadata jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------
-- 2) LEDGER (Accounting Audit Trail)
-- ---------------------------------------------------------------------

create table if not exists platform.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  entry_type text not null check (entry_type in ('CHARGE','PAYMENT','REFUND','ADJUSTMENT')),
  reference_type text not null check (reference_type in ('SUBSCRIPTION','BOOKING','INVOICE','MANUAL')),
  reference_id uuid not null,
  amount_cents int not null, -- signed (negative for credits)
  currency text not null default 'NOK',
  description text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_tenant_time
  on platform.ledger_entries(tenant_id, created_at desc);

-- ---------------------------------------------------------------------
-- 3) USAGE METERING (Pay-as-you-go + Limits)
-- ---------------------------------------------------------------------

create table if not exists platform.usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  module_id uuid null references platform.modules(id) on delete set null,
  metric text not null, -- api_calls | bookings | storage_bytes | messages | users
  value numeric not null,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_usage_tenant_metric_time
  on platform.usage_events(tenant_id, metric, occurred_at desc);

-- Aggregated usage summary (materialized view or table)
create table if not exists platform.usage_summary (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  module_id uuid null references platform.modules(id) on delete set null,
  metric text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  total_value numeric not null,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, metric, period_start)
);

-- ---------------------------------------------------------------------
-- 4) PERMISSION SETS (Bundle permissions for easier management)
-- ---------------------------------------------------------------------

create table if not exists platform.permission_sets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text null,
  permissions_json jsonb not null, -- ["rental_objects:write", "bookings:approve"]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- ---------------------------------------------------------------------
-- 5) ROLE VERSIONS (Immutable snapshots for audit + rollback)
-- ---------------------------------------------------------------------

create table if not exists platform.role_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  role_id uuid not null references platform.roles(id) on delete cascade,
  version int not null,
  permissions_snapshot jsonb not null,
  created_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, role_id, version)
);

-- ---------------------------------------------------------------------
-- 6) EFFECTIVE PERMISSIONS CACHE (Pre-computed for performance)
-- ---------------------------------------------------------------------

create table if not exists platform.user_effective_permissions_cache (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  permissions_json jsonb not null,
  computed_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- ---------------------------------------------------------------------
-- 7) USER SESSIONS (Server-side session tracking for force logout)
-- ---------------------------------------------------------------------

create table if not exists platform.user_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz null,
  user_agent text null,
  ip inet null,
  refresh_family_id uuid null, -- refresh token rotation family
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_sessions_user_active
  on platform.user_sessions(user_id, revoked_at)
  where revoked_at is null;

-- ---------------------------------------------------------------------
-- 8) AUDIT EVENT HASH CHAINING (Tamper-evident)
-- ---------------------------------------------------------------------

alter table platform.audit_events
  add column if not exists prev_hash text null,
  add column if not exists row_hash text null;

-- Hash computation function
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

comment on function platform.compute_audit_hash is 'Compute SHA-256 hash for audit event chaining';

-- Trigger to auto-compute hash on insert
create or replace function platform.audit_hash_trigger()
returns trigger as $$
declare
  v_prev_hash text;
begin
  -- Get previous hash for this tenant
  select row_hash into v_prev_hash
  from platform.audit_events
  where tenant_id = NEW.tenant_id
  order by created_at desc
  limit 1;

  -- Compute new hash
  NEW.prev_hash := v_prev_hash;
  NEW.row_hash := platform.compute_audit_hash(
    NEW.id,
    NEW.tenant_id,
    NEW.action,
    NEW.entity_id,
    v_prev_hash
  );

  return NEW;
end;
$$ language plpgsql;

create trigger audit_hash_trigger
  before insert on platform.audit_events
  for each row
  execute function platform.audit_hash_trigger();

-- ---------------------------------------------------------------------
-- 9) OPERATIONS INCIDENTS (Separate from GDPR breach register)
-- ---------------------------------------------------------------------

create table if not exists monitoring.incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  severity text not null check (severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text not null check (status in ('OPEN','INVESTIGATING','RESOLVED','CLOSED')) default 'OPEN',
  title text not null,
  description text null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  links jsonb null -- runbooks, tickets, related incidents
);

create index if not exists idx_incidents_status_severity
  on monitoring.incidents(status, severity);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table platform.invoices is 'Tenant invoices for subscription billing';
comment on table platform.invoice_lines is 'Line items for invoices';
comment on table platform.ledger_entries is 'Accounting audit trail for all financial transactions';
comment on table platform.usage_events is 'Usage metering events for pay-as-you-go billing and limits';
comment on table platform.usage_summary is 'Aggregated usage metrics per tenant/module/period';
comment on table platform.permission_sets is 'Bundled permissions for easier role management';
comment on table platform.role_versions is 'Immutable snapshots of role permissions for audit and rollback';
comment on table platform.user_effective_permissions_cache is 'Pre-computed effective permissions for performance';
comment on table platform.user_sessions is 'Server-side session tracking for force logout and refresh rotation';
comment on table monitoring.incidents is 'Operations incidents separate from GDPR breach register';
