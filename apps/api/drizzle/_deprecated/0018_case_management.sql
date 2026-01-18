-- =====================================================================
-- 0018: CASE MANAGEMENT (SSA-L Workflow)
-- Booking approvals, complaints, appeals, SLA tracking
-- =====================================================================

-- Enum: Case Types
create table if not exists domain.enum_case_type (
  code text primary key check (code in ('BOOKING_APPROVAL','COMPLAINT','APPEAL','INQUIRY','OTHER'))
);

insert into domain.enum_case_type(code) values 
  ('BOOKING_APPROVAL'),('COMPLAINT'),('APPEAL'),('INQUIRY'),('OTHER')
on conflict do nothing;

-- Enum: Case Status
create table if not exists domain.enum_case_status (
  code text primary key check (code in ('OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED'))
);

insert into domain.enum_case_status(code) values 
  ('OPEN'),('IN_PROGRESS'),('RESOLVED'),('CLOSED'),('ESCALATED')
on conflict do nothing;

-- Enum: Case Priority
create table if not exists domain.enum_case_priority (
  code text primary key check (code in ('LOW','NORMAL','HIGH','URGENT'))
);

insert into domain.enum_case_priority(code) values 
  ('LOW'),('NORMAL'),('HIGH'),('URGENT')
on conflict do nothing;

-- =====================================================================
-- Cases Table
-- =====================================================================

create table if not exists domain.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  case_number text not null, -- AUTO-NNNN format
  case_type text not null references domain.enum_case_type(code),
  status text not null references domain.enum_case_status(code) default 'OPEN',
  priority text not null references domain.enum_case_priority(code) default 'NORMAL',
  
  -- Related entities
  booking_id uuid null references domain.bookings(id) on delete set null,
  rental_object_id uuid null references domain.rental_objects(id) on delete set null,
  reporter_user_id uuid not null references platform.users(id) on delete restrict,
  
  -- Case details
  title text not null,
  description text not null,
  
  -- Workflow
  assigned_to_user_id uuid null references platform.users(id) on delete set null,
  assigned_at timestamptz null,
  resolved_at timestamptz null,
  resolution_notes text null,
  
  -- SLA tracking
  due_at timestamptz null,
  first_response_at timestamptz null,
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, case_number)
);

create index if not exists idx_cases_tenant_status on domain.cases(tenant_id, status);
create index if not exists idx_cases_assigned_to on domain.cases(assigned_to_user_id);
create index if not exists idx_cases_booking on domain.cases(booking_id);
create index if not exists idx_cases_due_at on domain.cases(due_at) where status in ('OPEN', 'IN_PROGRESS');

comment on table domain.cases is 'Case management for approvals, complaints, and appeals';
comment on column domain.cases.case_number is 'Tenant-scoped auto-incrementing case number (e.g., AUTO-0001)';
comment on column domain.cases.due_at is 'SLA deadline for case resolution';
comment on column domain.cases.first_response_at is 'Timestamp of first staff response (SLA metric)';

-- =====================================================================
-- Case Events (Append-Only Timeline)
-- =====================================================================

create table if not exists domain.case_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  case_id uuid not null references domain.cases(id) on delete cascade,
  
  event_type text not null check (event_type in (
    'CREATED','ASSIGNED','STATUS_CHANGED','PRIORITY_CHANGED',
    'COMMENT_ADDED','ESCALATED','RESOLVED','REOPENED','CLOSED'
  )),
  
  actor_user_id uuid null references platform.users(id) on delete set null,
  
  details jsonb not null default '{}'::jsonb,
  comment text null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_case_events_case on domain.case_events(case_id, created_at desc);
create index if not exists idx_case_events_tenant on domain.case_events(tenant_id, created_at desc);

comment on table domain.case_events is 'Append-only audit trail for case activity';
comment on column domain.case_events.details is 'JSONB with event-specific data (old/new values, etc.)';

-- =====================================================================
-- Case Assignments
-- =====================================================================

create table if not exists domain.case_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  case_id uuid not null references domain.cases(id) on delete cascade,
  
  assigned_to_user_id uuid not null references platform.users(id) on delete cascade,
  assigned_by_user_id uuid not null references platform.users(id) on delete set null,
  
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz null,
  
  notes text null
);

create index if not exists idx_case_assignments_case on domain.case_assignments(case_id);
create index if not exists idx_case_assignments_user on domain.case_assignments(assigned_to_user_id);

comment on table domain.case_assignments is 'Assignment history for cases (supports reassignment)';

-- =====================================================================
-- SLA Targets (Per Case Type)
-- =====================================================================

create table if not exists domain.sla_targets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  case_type text not null references domain.enum_case_type(code),
  priority text not null references domain.enum_case_priority(code),
  
  -- SLA times (in minutes)
  first_response_minutes integer not null, -- Time to first staff response
  resolution_minutes integer not null,     -- Time to mark as resolved
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, case_type, priority)
);

create index if not exists idx_sla_targets_tenant on domain.sla_targets(tenant_id, is_active);

comment on table domain.sla_targets is 'SLA targets per case type and priority level';
comment on column domain.sla_targets.first_response_minutes is 'Max minutes until first staff response';
comment on column domain.sla_targets.resolution_minutes is 'Max minutes until case resolution';

-- =====================================================================
-- Decision Templates (Localized)
-- =====================================================================

create table if not exists domain.decision_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  code text not null,
  name text not null,
  case_type text not null references domain.enum_case_type(code),
  
  locale text not null references platform.enum_locale(code),
  
  -- Template content (supports variable substitution)
  subject text not null,
  body text not null,
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, code, locale)
);

create index if not exists idx_decision_templates_tenant_type on domain.decision_templates(tenant_id, case_type, is_active);

comment on table domain.decision_templates is 'Localized decision templates for case resolutions';
comment on column domain.decision_templates.body is 'Supports Handlebars syntax for variable substitution';

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

create or replace function domain.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger cases_updated_at before update on domain.cases
  for each row execute function domain.update_updated_at_column();

create trigger sla_targets_updated_at before update on domain.sla_targets
  for each row execute function domain.update_updated_at_column();

create trigger decision_templates_updated_at before update on domain.decision_templates
  for each row execute function domain.update_updated_at_column();

-- =====================================================================
-- Seed Default SLA Targets
-- =====================================================================

insert into domain.sla_targets (tenant_id, case_type, priority, first_response_minutes, resolution_minutes)
select 
  t.id as tenant_id,
  ct.code as case_type,
  cp.code as priority,
  case 
    when cp.code = 'URGENT' then 15
    when cp.code = 'HIGH'then 60
    when cp.code = 'NORMAL' then 240
    else 1440
  end as first_response_minutes,
  case 
    when cp.code = 'URGENT' then 120
    when cp.code = 'HIGH' then 480
    when cp.code = 'NORMAL' then 1440
    else 4320
  end as resolution_minutes
from platform.tenants t
cross join domain.enum_case_type ct
cross join domain.enum_case_priority cp
on conflict (tenant_id, case_type, priority) do nothing;

comment on schema domain is 'Domain-specific business logic tables';
