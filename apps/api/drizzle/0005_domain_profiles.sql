-- =====================================================================
-- DOMAIN EXTENSION: User Profiles & App Settings
-- =====================================================================

create table if not exists domain.user_profiles (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  avatar_url text null,
  bio text null,
  preferences jsonb not null default '{}'::jsonb, -- UI prefs, accessibility prefs, etc.
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists domain.user_app_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  app_code text not null, -- WEB, MINSIDE, BACKOFFICE, SAAS_ADMIN
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id, app_code)
);

comment on table domain.user_profiles is 'User profile information: avatar, bio, preferences';
comment on table domain.user_app_settings is 'Per-app user settings (WEB, MINSIDE, BACKOFFICE, SAAS_ADMIN)';
