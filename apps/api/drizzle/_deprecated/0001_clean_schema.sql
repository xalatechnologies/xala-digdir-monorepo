-- =====================================================================
-- DIGILIST / XALA — FULL "ONE CLEAN" POSTGRES SCHEMA (WITH ENUM TABLES)
-- Split: platform / domain / monitoring
-- Includes: SaaS multi-tenant, RBAC, i18n, themes, feature flags,
--          audit/outbox, subscriptions/entitlements, notifications,
--          rental_objects + categories + booking modes, approvals,
--          calendar blocks, recurring, pricing, payments, attachments,
--          integrations, webhooks, idempotency, GDPR retention hooks.
-- =====================================================================

create extension if not exists "pgcrypto";

create schema if not exists platform;
create schema if not exists domain;
create schema if not exists monitoring;

-- =====================================================================
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
-- 6) DOMAIN ENUM TABLES (Digilist-specific)
-- =====================================================================

create table if not exists domain.enum_rental_object_status (
  code text primary key check (code in ('DRAFT','PUBLISHED','ARCHIVED'))
);

create table if not exists domain.enum_booking_mode (
  code text primary key check (code in ('SINGLE_SLOT','IN_GAME','RECURRING','ALL_DAY'))
);

create table if not exists domain.enum_booking_status (
  code text primary key check (code in ('PENDING','APPROVED','REJECTED','CANCELLED','EXPIRED'))
);

create table if not exists domain.enum_approval_status (
  code text primary key check (code in ('NOT_REQUIRED','PENDING','APPROVED','REJECTED'))
);

create table if not exists domain.enum_time_block_type (
  code text primary key check (code in ('MAINTENANCE','BLACKOUT','ADMIN_HOLD','SYSTEM'))
);

create table if not exists domain.enum_time_block_status (
  code text primary key check (code in ('ACTIVE','CANCELLED'))
);

create table if not exists domain.enum_payment_provider (
  code text primary key check (code in ('VIPPS','STRIPE','INVOICE','NONE'))
);

create table if not exists domain.enum_payment_status (
  code text primary key check (code in ('INITIATED','AUTHORIZED','CAPTURED','FAILED','REFUNDED','CANCELLED'))
);

create table if not exists domain.enum_attachment_entity (
  code text primary key check (code in ('RENTAL_OBJECT','BOOKING','USER','ORGANIZATION','AUDIT_EVENT'))
);

create table if not exists domain.enum_attachment_visibility (
  code text primary key check (code in ('PRIVATE','TENANT','PUBLIC'))
);

create table if not exists domain.enum_metadata_value_type (
  code text primary key check (code in ('TEXT','NUMBER','BOOLEAN','DATE','JSON','ENUM'))
);

create table if not exists domain.enum_addon_pricing_model (
  code text primary key check (code in ('PER_BOOKING','PER_HOUR','PER_DAY','PER_UNIT'))
);

insert into domain.enum_rental_object_status(code) values ('DRAFT'),('PUBLISHED'),('ARCHIVED') on conflict do nothing;
insert into domain.enum_booking_mode(code) values ('SINGLE_SLOT'),('IN_GAME'),('RECURRING'),('ALL_DAY') on conflict do nothing;
insert into domain.enum_booking_status(code) values ('PENDING'),('APPROVED'),('REJECTED'),('CANCELLED'),('EXPIRED') on conflict do nothing;
insert into domain.enum_approval_status(code) values ('NOT_REQUIRED'),('PENDING'),('APPROVED'),('REJECTED') on conflict do nothing;
insert into domain.enum_time_block_type(code) values ('MAINTENANCE'),('BLACKOUT','ADMIN_HOLD','SYSTEM') on conflict do nothing;
insert into domain.enum_time_block_status(code) values ('ACTIVE'),('CANCELLED') on conflict do nothing;
insert into domain.enum_payment_provider(code) values ('VIPPS'),('STRIPE'),('INVOICE'),('NONE') on conflict do nothing;
insert into domain.enum_payment_status(code) values ('INITIATED'),('AUTHORIZED'),('CAPTURED'),('FAILED'),('REFUNDED'),('CANCELLED') on conflict do nothing;
insert into domain.enum_attachment_entity(code) values ('RENTAL_OBJECT'),('BOOKING'),('USER'),('ORGANIZATION'),('AUDIT_EVENT') on conflict do nothing;
insert into domain.enum_attachment_visibility(code) values ('PRIVATE'),('TENANT'),('PUBLIC') on conflict do nothing;
insert into domain.enum_metadata_value_type(code) values ('TEXT'),('NUMBER'),('BOOLEAN'),('DATE'),('JSON'),('ENUM') on conflict do nothing;
insert into domain.enum_addon_pricing_model(code) values ('PER_BOOKING'),('PER_HOUR'),('PER_DAY'),('PER_UNIT') on conflict do nothing;

-- =====================================================================
-- 7) DOMAIN LOOKUPS (Types + Categories)
-- =====================================================================

create table if not exists domain.rental_object_types (
  code text primary key,
  name text not null,
  description text null
);

create table if not exists domain.rental_object_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  parent_id uuid null references domain.rental_object_categories(id) on delete set null,
  code text not null,
  name text not null,
  description text null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  unique (tenant_id, code)
);

create table if not exists domain.category_allowed_types (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  category_id uuid not null references domain.rental_object_categories(id) on delete cascade,
  type_code text not null references domain.rental_object_types(code),
  primary key (tenant_id, category_id, type_code)
);

-- =====================================================================
-- 8) DOMAIN CORE (Rental Objects, availability, bookings, approvals)
-- =====================================================================

create table if not exists domain.rental_objects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid null references platform.organizations(id) on delete set null,

  status text not null references domain.enum_rental_object_status(code) default 'DRAFT',
  type_code text not null references domain.rental_object_types(code),
  category_id uuid null references domain.rental_object_categories(id) on delete set null,

  title text not null,
  description text null,
  capacity int null,

  address text null,
  postal_code text null,
  city text null,
  latitude numeric(10,7) null,
  longitude numeric(10,7) null,

  booking_mode text not null references domain.enum_booking_mode(code) default 'SINGLE_SLOT',
  approval_required boolean not null default false,
  rules jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ro_tenant_status on domain.rental_objects(tenant_id, status);
create index if not exists idx_ro_type_cat on domain.rental_objects(type_code, category_id);

create table if not exists domain.rental_object_media (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  url text not null,
  alt text null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists domain.price_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  currency text not null default 'NOK',
  pricing_rules jsonb not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists domain.rental_object_price_plans (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  price_plan_id uuid not null references domain.price_plans(id) on delete cascade,
  primary key (tenant_id, rental_object_id, price_plan_id)
);

create table if not exists domain.rental_object_time_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,

  block_type text not null references domain.enum_time_block_type(code),
  status text not null references domain.enum_time_block_status(code) default 'ACTIVE',

  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text null,
  created_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now(),

  check (end_at > start_at)
);

create index if not exists idx_blocks_ro_time on domain.rental_object_time_blocks(rental_object_id, start_at, end_at);

create table if not exists domain.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete restrict,

  booked_by_user_id uuid not null references platform.users(id) on delete restrict,
  booked_for_org_id uuid null references platform.organizations(id) on delete set null,

  booking_mode text not null references domain.enum_booking_mode(code),
  status text not null references domain.enum_booking_status(code) default 'PENDING',
  approval_status text not null references domain.enum_approval_status(code) default 'NOT_REQUIRED',

  start_at timestamptz not null,
  end_at timestamptz not null,

  title text null,
  notes text null,

  price_cents int null,
  currency text not null default 'NOK',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_at > start_at)
);

create index if not exists idx_bookings_ro_time on domain.bookings(rental_object_id, start_at, end_at);
create index if not exists idx_bookings_tenant_status on domain.bookings(tenant_id, status);

create table if not exists domain.booking_approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  decided_by_user_id uuid not null references platform.users(id) on delete restrict,
  decision text not null check (decision in ('APPROVE','REJECT')),
  reason text null,
  decided_at timestamptz not null default now()
);

create table if not exists domain.recurring_series (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete restrict,
  created_by_user_id uuid not null references platform.users(id) on delete restrict,

  rrule text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,

  status text not null check (status in ('ACTIVE','CANCELLED','COMPLETED')) default 'ACTIVE',
  created_at timestamptz not null default now()
);

create table if not exists domain.recurring_instances (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  series_id uuid not null references domain.recurring_series(id) on delete cascade,
  booking_id uuid null references domain.bookings(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  result text not null check (result in ('PENDING','CREATED','CONFLICT','SKIPPED','FAILED')) default 'PENDING',
  reason jsonb null,
  unique (tenant_id, series_id, start_at, end_at)
);

create table if not exists domain.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  provider text not null references domain.enum_payment_provider(code),
  provider_ref text null,
  status text not null references domain.enum_payment_status(code) default 'INITIATED',
  amount_cents int not null,
  currency text not null default 'NOK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists domain.attachments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  entity_type text not null references domain.enum_attachment_entity(code),
  entity_id uuid not null,
  visibility text not null references domain.enum_attachment_visibility(code) default 'TENANT',
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_provider text not null,
  storage_key text not null,
  checksum_sha256 text null,
  uploaded_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 9) DOMAIN METADATA + AMENITIES + ADDONS + PRICING GROUPS
-- =====================================================================

create table if not exists domain.metadata_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,

  code text not null,
  name text not null,
  description text null,
  value_type text not null references domain.enum_metadata_value_type(code),
  is_filterable boolean not null default true,
  is_required boolean not null default false,
  sort_order int not null default 0,

  unit text null,
  min_number numeric null,
  max_number numeric null,
  enum_values text[] null,
  ui_widget text null,
  created_at timestamptz not null default now(),

  unique (tenant_id, code)
);

create table if not exists domain.rental_object_metadata (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  definition_id uuid not null references domain.metadata_definitions(id) on delete cascade,

  value_text text null,
  value_number numeric null,
  value_boolean boolean null,
  value_date date null,
  value_json jsonb null,

  updated_at timestamptz not null default now(),
  unique (tenant_id, rental_object_id, definition_id)
);

create index if not exists idx_ro_meta_filter_text on domain.rental_object_metadata(tenant_id, definition_id, value_text);
create index if not exists idx_ro_meta_filter_num on domain.rental_object_metadata(tenant_id, definition_id, value_number);
create index if not exists idx_ro_meta_filter_bool on domain.rental_object_metadata(tenant_id, definition_id, value_boolean);

create table if not exists domain.amenity_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  sort_order int not null default 0,
  unique (tenant_id, code)
);

create table if not exists domain.amenities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  group_id uuid null references domain.amenity_groups(id) on delete set null,
  code text not null,
  name text not null,
  description text null,
  icon_key text null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  unique (tenant_id, code)
);

create table if not exists domain.rental_object_amenities (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  amenity_id uuid not null references domain.amenities(id) on delete cascade,
  primary key (tenant_id, rental_object_id, amenity_id)
);

create index if not exists idx_ro_amenities on domain.rental_object_amenities(rental_object_id);

create table if not exists domain.addons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text null,
  pricing_model text not null references domain.enum_addon_pricing_model(code),
  base_price_cents int not null default 0,
  currency text not null default 'NOK',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists domain.rental_object_addons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  addon_id uuid not null references domain.addons(id) on delete cascade,
  is_required boolean not null default false,
  max_units int null,
  sort_order int not null default 0,
  unique (tenant_id, rental_object_id, addon_id)
);

create table if not exists domain.booking_addons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  booking_id uuid not null references domain.bookings(id) on delete cascade,
  addon_id uuid not null references domain.addons(id) on delete restrict,
  units int not null default 1,
  price_cents int not null,
  currency text not null default 'NOK',
  unique (tenant_id, booking_id, addon_id)
);

create table if not exists domain.pricing_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  unique (tenant_id, code)
);

create table if not exists domain.user_pricing_groups (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  pricing_group_id uuid not null references domain.pricing_groups(id) on delete cascade,
  primary key (tenant_id, user_id, pricing_group_id)
);

create table if not exists domain.organization_pricing_groups (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid not null references platform.organizations(id) on delete cascade,
  pricing_group_id uuid not null references domain.pricing_groups(id) on delete cascade,
  primary key (tenant_id, organization_id, pricing_group_id)
);

create table if not exists domain.rental_object_pricing (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  pricing_group_id uuid not null references domain.pricing_groups(id) on delete cascade,

  currency text not null default 'NOK',
  pricing jsonb not null,
  deposit_cents int null,
  cancellation_fee_cents int null,

  effective_from date null,
  effective_to date null,
  is_active boolean not null default true,

  unique (tenant_id, rental_object_id, pricing_group_id, effective_from)
);

create index if not exists idx_ro_pricing_lookup on domain.rental_object_pricing(rental_object_id, pricing_group_id);

create table if not exists domain.rental_object_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,

  min_duration_minutes int null,
  max_duration_minutes int null,
  min_lead_time_minutes int null,
  max_advance_booking_days int null,

  cancellation_deadline_minutes int null,
  cancellation_policy_text text null,

  approval_required boolean not null default false,
  approval_notes text null,

  allow_overlapping_requests boolean not null default false,
  require_terms_acceptance boolean not null default true,

  updated_at timestamptz not null default now(),
  unique (tenant_id, rental_object_id)
);

create table if not exists domain.rental_object_search_facets (
  rental_object_id uuid primary key references domain.rental_objects(id) on delete cascade,
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  category_id uuid null references domain.rental_object_categories(id) on delete set null,
  type_code text not null references domain.rental_object_types(code),
  city text null,
  capacity int null,
  amenity_codes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 10) INTEGRATIONS (per-tenant connectors + webhook deliveries)
-- =====================================================================

create table if not exists domain.integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  organization_id uuid null references platform.organizations(id) on delete cascade,
  type text not null references platform.enum_integration_type(code),
  name text not null,
  is_enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  secret_id uuid null references platform.secrets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists domain.integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  integration_id uuid not null references domain.integrations(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status text not null check (status in ('PENDING','SENT','FAILED')) default 'PENDING',
  attempts int not null default 0,
  last_error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

-- =====================================================================
-- 11) MONITORING (service health, logs, metrics, auth tracing)
-- =====================================================================

create table if not exists monitoring.service_health (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  service_name text not null,
  environment text not null,
  status text not null check (status in ('HEALTHY','DEGRADED','DOWN')),
  message text null,
  checked_at timestamptz not null default now()
);

create table if not exists monitoring.structured_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  service_name text not null,
  level text not null check (level in ('DEBUG','INFO','WARN','ERROR')),
  message text not null,
  context jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists monitoring.auth_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  user_id uuid null references platform.users(id) on delete set null,
  session_id uuid null,
  event_type text not null check (event_type in ('LOGIN_SUCCESS','LOGIN_FAILED','SESSION_401','REFRESH_SUCCESS','REFRESH_FAILED','LOGOUT')),
  details jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_logs_service_time on monitoring.structured_logs(service_name, created_at);

-- =====================================================================
-- 12) SEED RENTAL OBJECT TYPES
-- =====================================================================

insert into domain.rental_object_types(code, name) values
('SPACE','Lokale / Bane'),
('EQUIPMENT','Utstyr / Inventar'),
('VEHICLE','Kjøretøy / Transport'),
('EXPERIENCE','Opplevelse'),
('EVENT','Arrangement'),
('SERVICE','Tjeneste'),
('OTHER','Annet')
on conflict (code) do nothing;

-- ============================================================
-- GDPR / NSM-leaning SAFETY LAYER (PostgreSQL)
-- Covers: retention policies, DSAR, consent, lawful basis, PII inventory,
-- purpose limitation, access logs, deletion/anonymization workflow,
-- data residency marker, DPIA hooks, breach register, processing records.
-- ============================================================

create schema if not exists compliance;

-- ----------------------------
-- 1) ENUMS
-- ----------------------------
create table if not exists compliance.enum_lawful_basis (
  code text primary key check (code in ('CONSENT','CONTRACT','LEGAL_OBLIGATION','VITAL_INTERESTS','PUBLIC_TASK','LEGITIMATE_INTERESTS'))
);
insert into compliance.enum_lawful_basis(code)
values ('CONSENT'),('CONTRACT'),('LEGAL_OBLIGATION'),('VITAL_INTERESTS'),('PUBLIC_TASK'),('LEGITIMATE_INTERESTS')
on conflict do nothing;

create table if not exists compliance.enum_dsar_type (
  code text primary key check (code in ('ACCESS','RECTIFICATION','ERASURE','RESTRICTION','PORTABILITY','OBJECTION','COMPLAINT'))
);
insert into compliance.enum_dsar_type(code)
values ('ACCESS'),('RECTIFICATION','ERASURE'),('RESTRICTION'),('PORTABILITY'),('OBJECTION'),('COMPLAINT')
on conflict do nothing;

create table if not exists compliance.enum_dsar_status (
  code text primary key check (code in ('RECEIVED','IN_PROGRESS','NEED_INFO','COMPLETED','REJECTED'))
);
insert into compliance.enum_dsar_status(code)
values ('RECEIVED'),('IN_PROGRESS'),('NEED_INFO'),('COMPLETED'),('REJECTED')
on conflict do nothing;

create table if not exists compliance.enum_retention_action (
  code text primary key check (code in ('DELETE','ANONYMIZE','ARCHIVE'))
);
insert into compliance.enum_retention_action(code)
values ('DELETE'),('ANONYMIZE'),('ARCHIVE')
on conflict do nothing;

create table if not exists compliance.enum_processing_record_type (
  code text primary key check (code in ('DATA_CONTROLLER','DATA_PROCESSOR'))
);
insert into compliance.enum_processing_record_type(code)
values ('DATA_CONTROLLER'),('DATA_PROCESSOR')
on conflict do nothing;

create table if not exists compliance.enum_breach_severity (
  code text primary key check (code in ('LOW','MEDIUM','HIGH','CRITICAL'))
);
insert into compliance.enum_breach_severity(code)
values ('LOW'),('MEDIUM'),('HIGH'),('CRITICAL')
on conflict do nothing;

-- ----------------------------
-- 2) DATA INVENTORY (what is PII, where it lives, why it exists)
-- ----------------------------
create table if not exists compliance.data_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  schema_name text not null,
  table_name text not null,
  column_name text null,
  contains_personal_data boolean not null default false,
  contains_special_category boolean not null default false,
  purpose text not null,
  lawful_basis text not null references compliance.enum_lawful_basis(code),
  retention_policy_id uuid null,
  notes text null,
  unique (tenant_id, schema_name, table_name, column_name)
);

-- ----------------------------
-- 3) RETENTION POLICIES + JOBS (deletion/anonymization schedules)
-- ----------------------------
create table if not exists compliance.retention_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text null,
  action text not null references compliance.enum_retention_action(code),
  retain_days int not null,
  anchor text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

alter table compliance.data_assets
  add constraint fk_data_assets_retention_policy
  foreign key (retention_policy_id) references compliance.retention_policies(id) on delete set null;

create table if not exists compliance.retention_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  policy_id uuid not null references compliance.retention_policies(id) on delete restrict,
  target_schema text not null,
  target_table text not null,
  target_pk uuid not null,
  action text not null references compliance.enum_retention_action(code),
  scheduled_for timestamptz not null,
  status text not null check (status in ('PENDING','RUNNING','DONE','FAILED','SKIPPED')) default 'PENDING',
  attempts int not null default 0,
  last_error text null,
  created_at timestamptz not null default now()
);

-- ----------------------------
-- 4) CONSENT MANAGEMENT (when lawful basis = CONSENT)
-- ----------------------------
create table if not exists compliance.consent_purposes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text null,
  is_required boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table if not exists compliance.user_consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  purpose_id uuid not null references compliance.consent_purposes(id) on delete cascade,
  granted boolean not null,
  source text not null,
  version text null,
  ip inet null,
  user_agent text null,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, purpose_id, created_at)
);

-- ----------------------------
-- 5) DSAR (Data Subject Requests)
-- ----------------------------
create table if not exists compliance.dsar_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,

  requester_user_id uuid null references platform.users(id) on delete set null,
  requester_email text null,
  type text not null references compliance.enum_dsar_type(code),
  status text not null references compliance.enum_dsar_status(code) default 'RECEIVED',

  requested_at timestamptz not null default now(),
  due_at timestamptz null,
  completed_at timestamptz null,

  summary text null,
  decision_reason text null,
  assigned_to_user_id uuid null references platform.users(id) on delete set null,

  export_attachment_id uuid null references domain.attachments(id) on delete set null
);

create table if not exists compliance.dsar_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  dsar_id uuid not null references compliance.dsar_requests(id) on delete cascade,
  entity_type text not null,
  entity_id uuid null,
  action text not null check (action in ('EXPORT','RECTIFY','DELETE','ANONYMIZE','RESTRICT')),
  status text not null check (status in ('PENDING','DONE','FAILED','SKIPPED')) default 'PENDING',
  details jsonb null,
  created_at timestamptz not null default now()
);

-- ----------------------------
-- 6) ACCESS LOGS (accountability: who looked at whose data)
-- ----------------------------
create table if not exists compliance.data_access_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,

  actor_user_id uuid null references platform.users(id) on delete set null,
  actor_role text null,
  action text not null check (action in ('READ','EXPORT','UPDATE','DELETE','APPROVE','REJECT')),

  subject_user_id uuid null references platform.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid null,

  purpose text not null,
  ip inet null,
  user_agent text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_events_subject_time
  on compliance.data_access_events(subject_user_id, created_at);

-- ----------------------------
-- 7) PSEUDONYMIZATION / ANONYMIZATION MAP (if needed)
-- ----------------------------
create table if not exists compliance.anonymization_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  method text not null,
  details jsonb null,
  performed_by_user_id uuid null references platform.users(id) on delete set null,
  performed_at timestamptz not null default now()
);

-- ----------------------------
-- 8) PROCESSING RECORDS (GDPR Art. 30 register skeleton)
-- ----------------------------
create table if not exists compliance.processing_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  record_type text not null references compliance.enum_processing_record_type(code),
  activity_name text not null,
  controller_name text null,
  processor_name text null,
  categories_of_data text[] not null default '{}',
  categories_of_subjects text[] not null default '{}',
  recipients text[] not null default '{}',
  transfers_outside_eea boolean not null default false,
  transfer_safeguards text null,
  retention_summary text null,
  security_measures text null,
  updated_at timestamptz not null default now()
);

-- ----------------------------
-- 9) BREACH REGISTER (GDPR 33/34)
-- ----------------------------
create table if not exists compliance.security_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  title text not null,
  description text null,
  severity text not null references compliance.enum_breach_severity(code),
  detected_at timestamptz not null default now(),
  contained_at timestamptz null,
  reported_to_authority_at timestamptz null,
  notified_subjects_at timestamptz null,
  impact_summary text null,
  remediation text null,
  status text not null check (status in ('OPEN','INVESTIGATING','RESOLVED','CLOSED')) default 'OPEN'
);

-- ============================================================
-- PRACTICAL INTEGRATION NOTES (DB-LEVEL EXPECTATIONS)
-- ============================================================
-- 1) Every table that contains personal data should be registered in compliance.data_assets
-- 2) Workers:
--    - Build retention_jobs from retention_policies + anchor dates
--    - Execute DELETE/ANONYMIZE + write audit_events + anonymization_actions
-- 3) DSAR:
--    - Generate export bundle -> store in domain.attachments -> link to dsar_requests.export_attachment_id
-- 4) Access logging:
--    - For admin/saksbehandler views, write compliance.data_access_events for READ/EXPORT actions
-- 5) Keep auth/audit endpoints "no-store" at HTTP layer (not DB), but DB supports accountability.
