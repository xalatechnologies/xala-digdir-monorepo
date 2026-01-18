-- 1) PLATFORM ENUM TABLES (centralized, explicit, DB-enforced)
-- =====================================================================

create table if not exists platform.enum_tenant_status (
  code text primary key check (code in ('ACTIVE','SUSPENDED','DELETED'))
);

create table if not exists platform.enum_user_status (
  code text primary key check (code in ('ACTIVE','INVITED','SUSPENDED','DELETED'))
);

create table if not exists platform.enum_membership_status (
  code text primary key check (code in ('ACTIVE','INACTIVE'))
);

create table if not exists platform.enum_role_code (
  code text primary key check (code in ('PUBLIC','USER','SAKSBEHANDLER','ADMIN','TENANT_ADMIN','SUPER_ADMIN'))
);

create table if not exists platform.enum_scope_type (
  code text primary key check (code in ('TENANT','ORGANIZATION'))
);

create table if not exists platform.enum_locale (
  code text primary key check (code in ('nb','en','fr'))
);

create table if not exists platform.enum_plan_status (
  code text primary key check (code in ('DRAFT','ACTIVE','RETIRED'))
);

create table if not exists platform.enum_subscription_status (
  code text primary key check (code in ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED'))
);

create table if not exists platform.enum_entitlement_state (
  code text primary key check (code in ('ENABLED','DISABLED','LIMITED'))
);

create table if not exists platform.enum_audit_actor_type (
  code text primary key check (code in ('USER','SYSTEM','SERVICE'))
);

create table if not exists platform.enum_outbox_status (
  code text primary key check (code in ('PENDING','SENT','FAILED'))
);

create table if not exists platform.enum_notification_channel (
  code text primary key check (code in ('EMAIL','SMS','PUSH','IN_APP','WEBHOOK'))
);

create table if not exists platform.enum_notification_status (
  code text primary key check (code in ('QUEUED','SENT','FAILED','CANCELLED'))
);

create table if not exists platform.enum_integration_type (
  code text primary key check (code in ('ID_PORTEN','BANKID','FEIDE','MICROSOFT_SSO','VIPPS','STRIPE','RCO_LOCK','ACOS_WEBSak','VISMA_ERP','CUSTOM'))
);

create table if not exists platform.enum_secret_scope (
  code text primary key check (code in ('TENANT','ORGANIZATION','SYSTEM'))
);

-- Seed enum tables (idempotent)
insert into platform.enum_tenant_status(code) values ('ACTIVE'),('SUSPENDED'),('DELETED') on conflict do nothing;
insert into platform.enum_user_status(code) values ('ACTIVE'),('INVITED'),('SUSPENDED'),('DELETED') on conflict do nothing;
insert into platform.enum_membership_status(code) values ('ACTIVE'),('INACTIVE') on conflict do nothing;
insert into platform.enum_role_code(code) values ('PUBLIC'),('USER'),('SAKSBEHANDLER'),('ADMIN'),('TENANT_ADMIN'),('SUPER_ADMIN') on conflict do nothing;
insert into platform.enum_scope_type(code) values ('TENANT'),('ORGANIZATION') on conflict do nothing;
insert into platform.enum_locale(code) values ('nb'),('en'),('fr') on conflict do nothing;
insert into platform.enum_plan_status(code) values ('DRAFT'),('ACTIVE'),('RETIRED') on conflict do nothing;
insert into platform.enum_subscription_status(code) values ('TRIAL'),('ACTIVE'),('PAST_DUE'),('SUSPENDED'),('CANCELLED'),('EXPIRED') on conflict do nothing;
insert into platform.enum_entitlement_state(code) values ('ENABLED'),('DISABLED'),('LIMITED') on conflict do nothing;
insert into platform.enum_audit_actor_type(code) values ('USER'),('SYSTEM'),('SERVICE') on conflict do nothing;
insert into platform.enum_outbox_status(code) values ('PENDING'),('SENT'),('FAILED') on conflict do nothing;
insert into platform.enum_notification_channel(code) values ('EMAIL'),('SMS'),('PUSH'),('IN_APP'),('WEBHOOK') on conflict do nothing;
insert into platform.enum_notification_status(code) values ('QUEUED'),('SENT'),('FAILED'),('CANCELLED') on conflict do nothing;
insert into platform.enum_integration_type(code) values
('ID_PORTEN'),('BANKID'),('FEIDE'),('MICROSOFT_SSO'),('VIPPS'),('STRIPE'),
('RCO_LOCK'),('ACOS_WEBSak'),('VISMA_ERP'),('CUSTOM')
on conflict do nothing;
insert into platform.enum_secret_scope(code) values ('TENANT'),('ORGANIZATION'),('SYSTEM') on conflict do nothing;

-- =====================================================================
-- 2) PLATFORM CORE (tenants/orgs/users/rbac)
-- =====================================================================

create table if not exists platform.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null references platform.enum_tenant_status(code),
  default_locale text not null references platform.enum_locale(code) default 'nb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platform.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  org_no text null,
  name text not null,
  status text not null references platform.enum_tenant_status(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists platform.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  email text not null,
  display_name text null,
  phone text null,
  status text not null references platform.enum_user_status(code),
  locale text not null references platform.enum_locale(code) default 'nb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists platform.user_org_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  membership_status text not null references platform.enum_membership_status(code),
  created_at timestamptz not null default now(),
  unique (tenant_id, organization_id, user_id)
);

create table if not exists platform.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null references platform.enum_role_code(code),
  name text not null,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists platform.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text null
);

create table if not exists platform.role_permissions (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  role_id uuid not null references platform.roles(id) on delete cascade,
  permission_id uuid not null references platform.permissions(id) on delete cascade,
  primary key (tenant_id, role_id, permission_id)
);

create table if not exists platform.user_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  role_id uuid not null references platform.roles(id) on delete cascade,
  scope_type text not null references platform.enum_scope_type(code) default 'TENANT',
  organization_id uuid null references platform.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (scope_type = 'TENANT' and organization_id is null) or
    (scope_type = 'ORGANIZATION' and organization_id is not null)
  ),
  unique (tenant_id, user_id, role_id, scope_type, organization_id)
);

-- =====================================================================
-- 3) PLATFORM SAAS BILLING / ENTITLEMENTS / MODULES
-- =====================================================================

create table if not exists platform.modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text null,
  created_at timestamptz not null default now()
);

create table if not exists platform.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status text not null references platform.enum_plan_status(code),
  billing_provider text null,
  price_monthly_cents int null,
  currency text not null default 'NOK',
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists platform.plan_modules (
  plan_id uuid not null references platform.plans(id) on delete cascade,
  module_id uuid not null references platform.modules(id) on delete cascade,
  entitlement_state text not null references platform.enum_entitlement_state(code) default 'ENABLED',
  limits jsonb null,
  primary key (plan_id, module_id)
);

create table if not exists platform.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  plan_id uuid not null references platform.plans(id),
  status text not null references platform.enum_subscription_status(code),
  started_at timestamptz not null default now(),
  trial_ends_at timestamptz null,
  current_period_ends_at timestamptz null,
  cancelled_at timestamptz null,
  provider_customer_id text null,
  provider_subscription_id text null,
  metadata jsonb null,
  unique (tenant_id)
);

create table if not exists platform.tenant_entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  module_id uuid not null references platform.modules(id) on delete cascade,
  state text not null references platform.enum_entitlement_state(code),
  limits jsonb null,
  updated_at timestamptz not null default now(),
  unique (tenant_id, module_id)
);

-- =====================================================================
-- 4) PLATFORM CONFIG / FEATURE FLAGS / THEMES / i18n / SECRETS
-- =====================================================================

create table if not exists platform.feature_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  key text not null,
  enabled boolean not null default false,
  rules jsonb null,
  updated_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table if not exists platform.i18n_keys (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  key text not null,
  description text null,
  unique (namespace, key)
);

create table if not exists platform.i18n_translations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  i18n_key_id uuid not null references platform.i18n_keys(id) on delete cascade,
  locale text not null references platform.enum_locale(code),
  value text not null,
  is_override boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tenant_id, i18n_key_id, locale)
);

create table if not exists platform.themes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists platform.theme_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  theme_id uuid not null references platform.themes(id) on delete cascade,
  version int not null,
  tokens jsonb not null,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (tenant_id, theme_id, version)
);

create table if not exists platform.secrets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  organization_id uuid null references platform.organizations(id) on delete cascade,
  scope text not null references platform.enum_secret_scope(code),
  name text not null,
  encrypted_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope = 'SYSTEM' and tenant_id is null and organization_id is null) or
    (scope = 'TENANT' and tenant_id is not null and organization_id is null) or
    (scope = 'ORGANIZATION' and tenant_id is not null and organization_id is not null)
  )
);

-- =====================================================================
-- 5) PLATFORM AUDIT + OUTBOX + NOTIFICATIONS + WEBHOOKS
-- =====================================================================

create table if not exists platform.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  actor_user_id uuid null references platform.users(id) on delete set null,
  actor_type text not null references platform.enum_audit_actor_type(code),
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists platform.outbox_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  idempotency_key text not null,
  status text not null references platform.enum_outbox_status(code),
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  unique (tenant_id, idempotency_key)
);

create table if not exists platform.notification_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  code text not null,
  channel text not null references platform.enum_notification_channel(code),
  subject text null,
  body text not null,
  locale text not null references platform.enum_locale(code),
  is_override boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tenant_id, code, channel, locale)
);

create table if not exists platform.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid null references platform.users(id) on delete set null,
  channel text not null references platform.enum_notification_channel(code),
  status text not null references platform.enum_notification_status(code),
  template_code text null,
  payload jsonb not null,
  provider_ref text null,
  error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create table if not exists platform.webhooks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  url text not null,
  secret text null,
  is_active boolean not null default true,
  events text[] not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- =====================================================================
