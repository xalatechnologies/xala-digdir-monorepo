-- =====================================================================
-- PLATFORM: i18n Governance (Translation Lifecycle + Audit)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TRANSLATION CHANGE REQUESTS (Draft/Approve/Publish workflow)
-- ---------------------------------------------------------------------

create table if not exists platform.i18n_change_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  i18n_key_id uuid not null references platform.i18n_keys(id) on delete cascade,
  locale text not null references platform.enum_locale(code),
  proposed_value text not null,
  current_value text null,
  status text not null check (status in ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED','PUBLISHED')) default 'DRAFT',
  requested_by_user_id uuid null references platform.users(id) on delete set null,
  reviewed_by_user_id uuid null references platform.users(id) on delete set null,
  review_notes text null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  published_at timestamptz null
);

create index if not exists idx_i18n_cr_status on platform.i18n_change_requests(status, created_at desc);

-- ---------------------------------------------------------------------
-- 2) i18n OVERRIDES (Tenant/Org specific overrides)
-- ---------------------------------------------------------------------

-- Note: platform.i18n_translations already supports tenant overrides
-- Add organization-level overrides

alter table platform.i18n_translations
  add column if not exists organization_id uuid null references platform.organizations(id) on delete cascade,
  add column if not exists scope_type text check (scope_type in ('GLOBAL','TENANT','ORGANIZATION')) default 'GLOBAL';

-- Update existing constraint
alter table platform.i18n_translations
  drop constraint if exists i18n_translations_tenant_id_i18n_key_id_locale_key;

create unique index if not exists idx_i18n_global
  on platform.i18n_translations(i18n_key_id, locale)
  where tenant_id is null and organization_id is null;

create unique index if not exists idx_i18n_tenant
  on platform.i18n_translations(tenant_id, i18n_key_id, locale)
  where organization_id is null and tenant_id is not null;

create unique index if not exists idx_i18n_org
  on platform.i18n_translations(tenant_id, organization_id, i18n_key_id, locale)
  where organization_id is not null;

-- ---------------------------------------------------------------------
-- 3) i18n AUDIT (Who changed what)
-- ---------------------------------------------------------------------

create table if not exists platform.i18n_audit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  i18n_key_id uuid not null references platform.i18n_keys(id) on delete cascade,
  locale text not null references platform.enum_locale(code),
  action text not null check (action in ('CREATED','UPDATED','DELETED','PUBLISHED')),
  old_value text null,
  new_value text null,
  changed_by_user_id uuid null references platform.users(id) on delete set null,
  change_request_id uuid null references platform.i18n_change_requests(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_i18n_audit_key_time
  on platform.i18n_audit(i18n_key_id, created_at desc);

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table platform.i18n_change_requests is 'Translation change workflow: draft → review → approve → publish';
comment on table platform.i18n_audit is 'Audit trail for all translation changes';
comment on column platform.i18n_translations.scope_type is 'Translation scope: GLOBAL, TENANT, or ORGANIZATION';
