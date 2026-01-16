-- =====================================================================
-- 0022: SECURITY HARDENING
-- API keys, service accounts, IP allowlists, MFA enrollment
-- =====================================================================

-- Enum: API Key Scopes
create table if not exists platform.enum_api_key_scope (
  code text primary key check (code in ('READ','WRITE','ADMIN','WEBHOOK','INTEGRATION'))
);

insert into platform.enum_api_key_scope(code) values 
  ('READ'),('WRITE'),('ADMIN'),('WEBHOOK'),('INTEGRATION')
on conflict do nothing;

-- =====================================================================
-- API Keys (Service-to-Service Authentication)
-- =====================================================================

create table if not exists platform.api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  key_name text not null,
  description text null,
  
  -- Hashed key (never store plaintext)
  key_hash text not null unique,
  key_prefix text not null, -- First 8 chars for identification (sk_live_12345678...)
  
  scopes text[] not null default '{}', -- Array of enum_api_key_scope codes
  
  -- Ownership
  created_by uuid not null references platform.users(id) on delete restrict,
  service_account_id uuid null, -- Link to service account if applicable
  
  -- Security
  allowed_ips text[] default '{}', -- CIDR blocks
  rate_limit_per_minute integer default 60,
  
  -- Rotation
  expires_at timestamptz null,
  last_used_at timestamptz null,
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
 revoked_at timestamptz null,
  revoked_by uuid null references platform.users(id) on delete set null,
  revocation_reason text null
);

create index if not exists idx_api_keys_tenant on platform.api_keys(tenant_id, is_active);
create index if not exists idx_api_keys_hash on platform.api_keys(key_hash) where is_active;
create index if not exists idx_api_keys_prefix on platform.api_keys(key_prefix);
create index if not exists idx_api_keys_expiry on platform.api_keys(expires_at) where is_active and expires_at is not null;

comment on table platform.api_keys is 'Service-to-service API authentication keys';
comment on column platform.api_keys.key_hash is 'bcrypt/argon2 hash of the secret key';
comment on column platform.api_keys.key_prefix is 'Visible prefix for key identification (e.g., sk_live_abcd1234)';
comment on column platform.api_keys.allowed_ips is 'Whitelist of IP addresses/CIDR blocks';

-- =====================================================================
-- Service Accounts (Machine Users)
-- =====================================================================

create table if not exists platform.service_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  account_name text not null,
  description text null,
  
  -- RBAC
  role_id uuid not null references platform.roles(id) on delete restrict,
  
  -- Security
  allowed_ips text[] default '{}',
  
  is_active boolean not null default true,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, account_name)
);

create index if not exists idx_service_accounts_tenant on platform.service_accounts(tenant_id, is_active);

comment on table platform.service_accounts is 'Machine/service accounts with RBAC permissions';

-- Link API keys to service accounts
alter table platform.api_keys
  add constraint api_keys_service_account_fk
  foreign key (service_account_id) references platform.service_accounts(id) on delete cascade;

-- =====================================================================
-- IP Allowlists (Global + Tenant)
-- =====================================================================

create table if not exists platform.ip_allowlists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  ip_address inet not null, -- Supports CIDR notation
  description text null,
  
  -- Scope
  applies_to text not null check (applies_to in ('API','BACKOFFICE','ADMIN','ALL')) default 'BACKOFFICE',
  
  is_active boolean not null default true,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  
  constraint ip_allowlist_unique unique (tenant_id, ip_address, applies_to)
);

create index if not exists idx_ip_allowlists_tenant on platform.ip_allowlists(tenant_id, is_active);
create index if not exists idx_ip_allowlists_global on platform.ip_allowlists(is_active) where tenant_id is null;

comment on table platform.ip_allowlists is 'IP whitelist for restricted admin/backoffice access';
comment on column platform.ip_allowlists.tenant_id is 'NULL = global allowlist (applies to all tenants)';

-- =====================================================================
-- MFA Enrollment (TOTP + Backup Codes)
-- =====================================================================

create table if not exists platform.mfa_enrollment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references platform.users(id) on delete cascade,
  
  method text not null check (method in ('TOTP','SMS','EMAIL')) default 'TOTP',
  
  -- TOTP secret (encrypted)
  totp_secret text null,
  totp_backup_codes text[] default '{}', -- Hashed backup codes
  
  -- SMS/Email
  phone_number text null,
  email text null,
  
  is_verified boolean not null default false,
  verified_at timestamptz null,
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id, method)
);

create index if not exists idx_mfa_enrollment_user on platform.mfa_enrollment(user_id, is_active);

comment on table platform.mfa_enrollment is 'Multi-factor authentication enrollment for users';
comment on column platform.mfa_enrollment.totp_secret is 'Encrypted TOTP shared secret';
comment on column platform.mfa_enrollment.totp_backup_codes is 'Hashed one-time backup codes';

-- =====================================================================
-- Security Events (Authentication Audit Trail)
-- =====================================================================

create table if not exists monitoring.security_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  event_type text not null check (event_type in (
    'LOGIN_SUCCESS','LOGIN_FAILED','MFA_CHALLENGE','MFA_SUCCESS','MFA_FAILED',
    'API_KEY_CREATED','API_KEY_REVOKED','API_KEY_USED',
    'PASSWORD_CHANGED','PASSWORD_RESET_REQUESTED','PASSWORD_RESET_COMPLETED',
    'SESSION_CREATED','SESSION_REFRESHED','SESSION_REVOKED',
    'IP_BLOCKED','SUSPICIOUS_ACTIVITY','ACCOUNT_LOCKED'
  )),
  
  user_id uuid null references platform.users(id) on delete set null,
  api_key_id uuid null references platform.api_keys(id) on delete set null,
  
  -- Request context
  ip_address inet not null,
  user_agent text null,
  request_id text null,
  
  -- Details
  details jsonb default '{}'::jsonb,
  
  -- Risk scoring
  risk_score integer null check (risk_score between 0 and 100),
  is_flagged boolean not null default false,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_security_events_tenant on monitoring.security_events(tenant_id, created_at desc);
create index if not exists idx_security_events_user on monitoring.security_events(user_id, created_at desc);
create index if not exists idx_security_events_type on monitoring.security_events(event_type, created_at desc);
create index if not exists idx_security_events_flagged on monitoring.security_events(is_flagged, created_at desc) where is_flagged;
create index if not exists idx_security_events_ip on monitoring.security_events(ip_address);

comment on table monitoring.security_events is 'Security audit trail for authentication and authorization events';

-- =====================================================================
-- Failed Login Tracking (Rate Limiting)
-- =====================================================================

create table if not exists platform.failed_login_attempts (
  id uuid primary key default gen_random_uuid(),
  
  identifier text not null, -- Email or username
  ip_address inet not null,
  
  attempt_count integer not null default 1,
  
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  locked_until timestamptz null,
  
  unique (identifier, ip_address)
);

create index if not exists idx_failed_logins_identifier on platform.failed_login_attempts(identifier);
create index if not exists idx_failed_logins_ip on platform.failed_login_attempts(ip_address);
create index if not exists idx_failed_logins_locked on platform.failed_login_attempts(locked_until) where locked_until is not null;

comment on table platform.failed_login_attempts is 'Track failed login attempts for rate limiting and account lockout';

-- =====================================================================
-- Function: Record Security Event
-- =====================================================================

create or replace function platform.record_security_event(
  p_event_type text,
  p_tenant_id uuid default null,
  p_user_id uuid default null,
  p_api_key_id uuid default null,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_details jsonb default '{}'::jsonb
) returns uuid as $$
declare
  v_event_id uuid;
  v_risk_score integer := 0;
begin
  -- Calculate basic risk score
  if p_event_type in ('LOGIN_FAILED','MFA_FAILED','IP_BLOCKED') then
    v_risk_score := 50;
  elsif p_event_type in ('SUSPICIOUS_ACTIVITY','ACCOUNT_LOCKED') then
    v_risk_score := 80;
  end if;
  
  insert into monitoring.security_events (
    tenant_id, event_type, user_id, api_key_id,
    ip_address, user_agent, details, risk_score,
    is_flagged
  )
  values (
    p_tenant_id, p_event_type, p_user_id, p_api_key_id,
    p_ip_address, p_user_agent, p_details, v_risk_score,
    (v_risk_score >= 50)
  )
  returning id into v_event_id;
  
  return v_event_id;
end;
$$ language plpgsql;

comment on function platform.record_security_event is 'Record a security audit event with automatic risk scoring';

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

create trigger service_accounts_updated_at before update on platform.service_accounts
  for each row execute function domain.update_updated_at_column();

create trigger mfa_enrollment_updated_at before update on platform.mfa_enrollment
  for each row execute function domain.update_updated_at_column();

comment on schema platform is 'Platform-wide infrastructure tables';
comment on schema monitoring is 'Monitoring and observability tables';
