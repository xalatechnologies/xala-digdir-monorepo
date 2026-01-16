-- =====================================================================
-- PLATFORM: Module Marketplace + Entitlements + Feature Flags + Runtime Config
-- =====================================================================

-- Note: platform.modules already exists in 0001_clean_schema.sql
-- This extends it with marketplace features

-- ---------------------------------------------------------------------
-- 1) FEATURE FLAGS (Tenant/Org/User scoped)
-- ---------------------------------------------------------------------

-- Note: platform.feature_flags already exists in 0001_clean_schema.sql
-- Extend with scope support

alter table platform.feature_flags
  add column if not exists scope_type text check (scope_type in ('TENANT','ORGANIZATION','USER')) default 'TENANT',
  add column if not exists organization_id uuid null references platform.organizations(id) on delete cascade,
  add column if not exists user_id uuid null references platform.users(id) on delete cascade;

alter table platform.feature_flags
  drop constraint if exists feature_flags_tenant_id_key_key;

alter table platform.feature_flags
  add constraint feature_flags_scope_check check (
    (scope_type = 'TENANT' and organization_id is null and user_id is null) or
    (scope_type = 'ORGANIZATION' and organization_id is not null and user_id is null) or
    (scope_type = 'USER' and user_id is not null)
  );

create unique index if not exists idx_feature_flags_tenant_key
  on platform.feature_flags(tenant_id, key)
  where scope_type = 'TENANT';

create unique index if not exists idx_feature_flags_org_key
  on platform.feature_flags(tenant_id, organization_id, key)
  where scope_type = 'ORGANIZATION';

create unique index if not exists idx_feature_flags_user_key
  on platform.feature_flags(tenant_id, user_id, key)
  where scope_type = 'USER';

-- ---------------------------------------------------------------------
-- 2) RUNTIME CONFIG (Tenant/Org settings, versioned)
-- ---------------------------------------------------------------------

create table if not exists platform.runtime_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid null references platform.organizations(id) on delete cascade,
  scope_type text not null check (scope_type in ('TENANT','ORGANIZATION')) default 'TENANT',
  key text not null,
  value jsonb not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (scope_type = 'TENANT' and organization_id is null) or
    (scope_type = 'ORGANIZATION' and organization_id is not null)
  )
);

create unique index if not exists idx_runtime_config_tenant_key_active
  on platform.runtime_config(tenant_id, key)
  where scope_type = 'TENANT' and is_active = true;

create unique index if not exists idx_runtime_config_org_key_active
  on platform.runtime_config(tenant_id, organization_id, key)
  where scope_type = 'ORGANIZATION' and is_active = true;

-- Config history (all versions)
create index if not exists idx_runtime_config_history
  on platform.runtime_config(tenant_id, key, version desc);

-- ---------------------------------------------------------------------
-- 3) MODULE MARKETPLACE EXTENSIONS
-- ---------------------------------------------------------------------

-- Module categories for marketplace organization
create table if not exists platform.module_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text null,
  sort_order int not null default 0
);

insert into platform.module_categories(code, name, description) values
('CORE', 'Core Features', 'Essential platform features'),
('BOOKING', 'Booking & Scheduling', 'Booking management and calendar features'),
('PAYMENTS', 'Payments & Billing', 'Payment processing and invoicing'),
('COMMUNICATION', 'Communication', 'Messaging, notifications, and support'),
('ANALYTICS', 'Analytics & Reporting', 'Data analysis and reporting tools'),
('INTEGRATIONS', 'Integrations', 'Third-party integrations'),
('COMPLIANCE', 'Compliance & Security', 'GDPR, audit, and security features'),
('CUSTOMIZATION', 'Customization', 'Branding, themes, and customization')
on conflict (code) do nothing;

-- Extend modules table with marketplace metadata
alter table platform.modules
  add column if not exists category_id uuid null references platform.module_categories(id) on delete set null,
  add column if not exists is_marketplace boolean not null default false,
  add column if not exists price_monthly_cents int null,
  add column if not exists trial_days int null,
  add column if not exists icon_key text null,
  add column if not exists documentation_url text null,
  add column if not exists changelog jsonb null;

-- Module dependencies (e.g., PAYMENTS requires CORE_BOOKING)
create table if not exists platform.module_dependencies (
  module_id uuid not null references platform.modules(id) on delete cascade,
  depends_on_module_id uuid not null references platform.modules(id) on delete cascade,
  is_required boolean not null default true,
  primary key (module_id, depends_on_module_id)
);

-- Module versions (for marketplace updates)
create table if not exists platform.module_versions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references platform.modules(id) on delete cascade,
  version text not null,
  release_notes text null,
  breaking_changes boolean not null default false,
  released_at timestamptz not null default now(),
  unique (module_id, version)
);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table platform.runtime_config is 'Versioned tenant/org configuration settings';
comment on table platform.module_categories is 'Categories for organizing modules in marketplace';
comment on table platform.module_dependencies is 'Module dependency graph for installation validation';
comment on table platform.module_versions is 'Module version history for marketplace updates';
comment on column platform.feature_flags.scope_type is 'Feature flag scope: TENANT, ORGANIZATION, or USER';
comment on column platform.runtime_config.version is 'Config version for rollback capability';
