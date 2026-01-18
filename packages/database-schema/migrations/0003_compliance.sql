-- =====================================================================
-- 0023: COMPLIANCE GOVERNANCE
-- GDPR, data classification, retention, DPIA
-- =====================================================================

-- Note: gdpr_requests table already exists from earlier migration
-- This extends compliance coverage

-- Enum: Data Classification Levels
create table if not exists compliance.enum_data_classification (
  code text primary key check (code in ('PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED'))
);

insert into compliance.enum_data_classification(code) values 
  ('PUBLIC'),('INTERNAL'),('CONFIDENTIAL'),('RESTRICTED')
on conflict do nothing;

-- Enum: Retention Period Units
create table if not exists compliance.enum_retention_unit (
  code text primary key check (code in ('DAYS','MONTHS','YEARS','INDEFINITE'))
);

insert into compliance.enum_retention_unit(code) values 
  ('DAYS'),('MONTHS'),('YEARS'),('INDEFINITE')
on conflict do nothing;

-- =====================================================================
-- Data Classification Catalog
-- =====================================================================

create table if not exists compliance.data_assets (
  id uuid primary key default gen_random_uuid(),
  
  asset_name text not null unique,
  description text null,
  
  schema_name text not null,
  table_name text not null,
  column_name text null, -- NULL = entire table
  
  classification text not null references compliance.enum_data_classification(code),
  
  contains_pii boolean not null default false,
  contains_special_category boolean not null default false, -- GDPR Article 9
  
  -- Retention
  retention_period integer not null,
  retention_unit text not null references compliance.enum_retention_unit(code),
  
  -- Documentation
  purpose text not null, -- Legal basis for processing
  notes text null,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_data_assets_classification on compliance.data_assets(classification);
create index if not exists idx_data_assets_table on compliance.data_assets(schema_name, table_name);

comment on table compliance.data_assets is 'Data asset inventory with classification and retention policies';
comment on column compliance.data_assets.contains_special_category is 'GDPR Article 9: health, biometric, genetic, etc.';

-- =====================================================================
-- Retention Policies (Per Tenant)
-- =====================================================================

create table if not exists compliance.retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  policy_name text not null,
  description text null,
  
  table_name text not null,
  
  retention_period integer not null,
  retention_unit text not null references compliance.enum_retention_unit(code),
  
  -- Deletion strategy
  soft_delete boolean not null default true, -- Set is_deleted=true vs hard delete
  archive_before_delete boolean not null default false,
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, table_name)
);

create index if not exists idx_retention_policies_tenant on compliance.retention_policies(tenant_id, is_active);

comment on table compliance.retention_policies is 'Tenant-specific data retention policies';

-- =====================================================================
-- Retention Enforcement Jobs
-- =====================================================================

create table if not exists compliance.retention_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  policy_id uuid not null references compliance.retention_policies(id) on delete restrict,
  
  run_at timestamptz not null,
  completed_at timestamptz null,
  
  records_scanned integer default 0,
  records_deleted integer default 0,
  records_archived integer default 0,
  records_failed integer default 0,
  
  status text not null check (status in ('PENDING','RUNNING','COMPLETED','FAILED')) default 'PENDING',
  error text null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_retention_jobs_tenant on compliance.retention_jobs(tenant_id, run_at desc);
create index if not exists idx_retention_jobs_status on compliance.retention_jobs(status, run_at);

comment on table compliance.retention_jobs is 'Automated retention enforcement job history';

-- =====================================================================
-- DPIA (Data Protection Impact Assessment) Records
-- =====================================================================

create table if not exists compliance.dpia_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  dpia_title text not null,
  description text not null,
  
  processing_activity text not null,
  data_categories text[] not null, -- e.g., ['PERSONAL','LOCATION','FINANCIAL']
  
  -- Risk assessment
  necessity_justification text not null,
  proportionality_assessment text not null,
  risks_identified text not null,
  mitigation_measures text not null,
  
  -- Approval
  status text not null check (status in ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED')) default 'DRAFT',
  approved_by uuid null references platform.users(id) on delete set null,
  approved_at timestamptz null,
  
  -- Review
  review_date timestamptz not null,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dpia_records_tenant on compliance.dpia_records(tenant_id, status);
create index if not exists idx_dpia_records_review on compliance.dpia_records(review_date) where status = 'APPROVED';

comment on table compliance.dpia_records is 'Data Protection Impact Assessment records (GDPR compliance)';

-- =====================================================================
-- Data Access Events (Compliance Audit)
-- =====================================================================

create table if not exists compliance.data_access_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  user_id uuid not null references platform.users(id) on delete restrict,
  
  table_name text not null,
  record_id uuid not null,
  
  access_type text not null check (access_type in ('READ','WRITE','DELETE','EXPORT')),
  
  -- Context
  purpose text null, -- Why was data accessed?
  ip_address inet not null,
  user_agent text null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_data_access_events_tenant on compliance.data_access_events(tenant_id, created_at desc);
create index if not exists idx_data_access_events_user on compliance.data_access_events(user_id, created_at desc);
create index if not exists idx_data_access_events_table on compliance.data_access_events(table_name, record_id);

comment on table compliance.data_access_events is 'Audit trail for accessing sensitive/PII data';

-- =====================================================================
-- Processing Records (GDPR Article 30)
-- =====================================================================

create table if not exists compliance.processing_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  processing_activity text not null,
  purpose text not null,
  legal_basis text not null, -- Consent, Contract, Legal Obligation, etc.
  
  data_categories text[] not null,
  data_subjects text[] not null, -- e.g., ['CUSTOMERS','EMPLOYEES','CONTRACTORS']
  recipients text[] default '{}', -- Who receives the data
  
  data_transfers_outside_eu boolean not null default false,
  transfer_safeguards text null,
  
  retention_period text not null,
  
  security_measures text not null,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_processing_records_tenant on compliance.processing_records(tenant_id);

comment on table compliance.processing_records is 'GDPR Article 30: Record of processing activities';

-- =====================================================================
-- Triggers: Auto-update updated_at
-- =====================================================================

create trigger data_assets_updated_at before update on compliance.data_assets
  for each row execute function domain.update_updated_at_column();

create trigger retention_policies_updated_at before update on compliance.retention_policies
  for each row execute function domain.update_updated_at_column();

create trigger dpia_records_updated_at before update on compliance.dpia_records
  for each row execute function domain.update_updated_at_column();

create trigger processing_records_updated_at before update on compliance.processing_records
  for each row execute function domain.update_updated_at_column();

-- =====================================================================
-- Seed Data Assets (Example)
-- =====================================================================

insert into compliance.data_assets (asset_name, schema_name, table_name, column_name, classification, contains_pii, purpose, retention_period, retention_unit)
values
  ('User Email Addresses', 'platform', 'users', 'email', 'CONFIDENTIAL', true, 'User authentication and communication', 7, 'YEARS'),
  ('User National IDs', 'platform', 'users', 'national_id', 'RESTRICTED', true, 'BankID verification', 7, 'YEARS'),
  ('Booking Records', 'domain', 'bookings', null, 'INTERNAL', false, 'Business operations', 5, 'YEARS'),
  ('Payment Transactions', 'domain', 'payment_transactions', null, 'CONFIDENTIAL', true, 'Financial compliance', 10, 'YEARS'),
  ('Audit Logs', 'platform', 'audit_events', null, 'INTERNAL', false, 'Security and compliance audit', 7, 'YEARS')
on conflict do nothing;

comment on schema compliance is 'Compliance, governance, and data protection tables';
