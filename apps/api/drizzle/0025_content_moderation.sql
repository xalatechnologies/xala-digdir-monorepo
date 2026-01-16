-- =====================================================================
-- 0025: CONTENT MODERATION
-- Moderation queue, user blocks, rate limiting, abuse prevention
-- =====================================================================

-- Enum: Moderation Status
create table if not exists domain.enum_moderation_status (
  code text primary key check (code in ('PENDING','APPROVED','REJECTED','FLAGGED','ESCALATED'))
);

insert into domain.enum_moderation_status(code) values 
  ('PENDING'),('APPROVED'),('REJECTED'),('FLAGGED'),('ESCALATED')
on conflict do nothing;

-- Enum: Report Reasons
create table if not exists domain.enum_report_reason (
  code text primary key check (code in (
    'SPAM','HARASSMENT','INAPPROPRIATE_CONTENT','FRAUD','COPYRIGHT',
    'PRIVACY_VIOLATION','HATE_SPEECH','VIOLENCE','OTHER'
  ))
);

insert into domain.enum_report_reason(code) values 
  ('SPAM'),('HARASSMENT'),('INAPPROPRIATE_CONTENT'),('FRAUD'),('COPYRIGHT'),
  ('PRIVACY_VIOLATION'),('HATE_SPEECH'),('VIOLENCE'),('OTHER')
on conflict do nothing;

-- =====================================================================
-- Moderation Flags (Content Reports)
-- =====================================================================

create table if not exists domain.moderation_flags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  -- Flagged entity
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','BOOKING','MESSAGE','RATING','COMMENT','USER_PROFILE')),
  entity_id uuid not null,
  
  -- Reporter
  reporter_user_id uuid null references platform.users(id) on delete set null,
  ip_address inet null,
  
  -- Report details
  reason text not null references domain.enum_report_reason(code),
  description text null,
  
  -- Moderation
  status text not null references domain.enum_moderation_status(code) default 'PENDING',
  reviewed_by uuid null references platform.users(id) on delete set null,
  reviewed_at timestamptz null,
  review_notes text null,
  
  -- Actions taken
  action_taken text null check (action_taken in ('NONE','WARNING','CONTENT_REMOVED','USER_SUSPENDED','USER_BANNED')),
  
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_flags_tenant on domain.moderation_flags(tenant_id, status, created_at desc);
create index if not exists idx_moderation_flags_entity on domain.moderation_flags(entity_type, entity_id);
create index if not exists idx_moderation_flags_pending on domain.moderation_flags(status, created_at) where status = 'PENDING';
create index if not exists idx_moderation_flags_reporter on domain.moderation_flags(reporter_user_id);

comment on table domain.moderation_flags is 'Content moderation queue with reporting and review workflow';

-- =====================================================================
-- User Blocks (User-to-User Blocking)
-- =====================================================================

create table if not exists domain.user_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  blocker_user_id uuid not null references platform.users(id) on delete cascade,
  blocked_user_id uuid not null references platform.users(id) on delete cascade,
  
  reason text null,
  
  created_at timestamptz not null default now(),
  
  unique (blocker_user_id, blocked_user_id),
  check (blocker_user_id != blocked_user_id)
);

create index if not exists idx_user_blocks_blocker on domain.user_blocks(blocker_user_id);
create index if not exists idx_user_blocks_blocked on domain.user_blocks(blocked_user_id);

comment on table domain.user_blocks is 'User-initiated blocking (prevents interactions)';

-- =====================================================================
-- Rate Limit Buckets (Token Bucket Algorithm)
-- =====================================================================

create table if not exists platform.rate_limit_buckets (
  id uuid primary key default gen_random_uuid(),
  
  bucket_key text not null unique, -- e.g., 'user:123:api', 'ip:192.168.1.1:login'
  
  tokens_remaining integer not null,
  tokens_max integer not null,
  refill_rate_per_second numeric(10,4) not null,
  
  last_refill_at timestamptz not null default now(),
  
  updated_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_buckets_key on platform.rate_limit_buckets(bucket_key);

comment on table platform.rate_limit_buckets is 'Token bucket rate limiting state';

-- =====================================================================
-- Function: Check Rate Limit
-- =====================================================================

create or replace function platform.check_rate_limit(
  p_bucket_key text,
  p_tokens_max integer,
  p_refill_rate_per_second numeric,
  p_tokens_requested integer default 1
) returns boolean as $$
declare
  v_bucket record;
  v_elapsed_seconds numeric;
  v_new_tokens numeric;
begin
  -- Get or create bucket
  select * into v_bucket
  from platform.rate_limit_buckets
  where bucket_key = p_bucket_key
  for update;
  
  if not found then
    insert into platform.rate_limit_buckets (bucket_key, tokens_remaining, tokens_max, refill_rate_per_second)
    values (p_bucket_key, p_tokens_max, p_tokens_max, p_refill_rate_per_second)
    returning * into v_bucket;
  end if;
  
  -- Refill tokens based on elapsed time
  v_elapsed_seconds := extract(epoch from (now() - v_bucket.last_refill_at));
  v_new_tokens := least(
    v_bucket.tokens_max,
    v_bucket.tokens_remaining + (v_elapsed_seconds * p_refill_rate_per_second)
  );
  
  -- Check if request allowed
  if v_new_tokens >= p_tokens_requested then
    update platform.rate_limit_buckets
    set tokens_remaining = v_new_tokens - p_tokens_requested,
        last_refill_at = now(),
        updated_at = now()
    where bucket_key = p_bucket_key;
    
    return true;
  else
    -- Update bucket state but deny request
    update platform.rate_limit_buckets
    set tokens_remaining = v_new_tokens,
        last_refill_at = now(),
        updated_at = now()
    where bucket_key = p_bucket_key;
    
    return false;
  end if;
end;
$$ language plpgsql;

comment on function platform.check_rate_limit is 'Token bucket rate limiting with automatic refill';

-- =====================================================================
-- Banned Users (Platform-Level Bans)
-- =====================================================================

create table if not exists platform.banned_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade,
  
  user_id uuid not null references platform.users(id) on delete cascade,
  
  reason text not null,
  ban_type text not null check (ban_type in ('TEMPORARY','PERMANENT')) default 'TEMPORARY',
  
  banned_by uuid not null references platform.users(id) on delete restrict,
  banned_at timestamptz not null default now(),
  
  expires_at timestamptz null,
  
  is_active boolean not null default true,
  
  notes text null
);

create index if not exists idx_banned_users_user on platform.banned_users(user_id, is_active);
create index if not exists idx_banned_users_tenant on platform.banned_users(tenant_id, is_active) where tenant_id is not null;
create index if not exists idx_banned_users_expiry on platform.banned_users(expires_at) where is_active and expires_at is not null;

comment on table platform.banned_users is 'Platform-level user bans (temporary or permanent)';

-- =====================================================================
-- Moderation Queue Stats (Real-time Metrics)
-- =====================================================================

create materialized view if not exists domain.moderation_queue_stats as
select
  tenant_id,
  count(*) filter (where status = 'PENDING') as pending_count,
  count(*) filter (where status = 'FLAGGED') as flagged_count,
  count(*) filter (where status = 'ESCALATED') as escalated_count,
  count(*) filter (where reviewed_at > now() - interval '24 hours') as reviewed_last_24h,
  avg(extract(epoch from (reviewed_at - created_at))) filter (where reviewed_at is not null) as avg_review_time_seconds
from domain.moderation_flags
group by tenant_id;

create unique index if not exists idx_moderation_queue_stats_tenant on domain.moderation_queue_stats(tenant_id);

comment on materialized view domain.moderation_queue_stats is 'Pre-calculated moderation queue metrics';

-- =====================================================================
-- Refresh Moderation Stats (Call Periodically)
-- =====================================================================

create or replace function domain.refresh_moderation_stats()
returns void as $$
begin
  refresh materialized view concurrently domain.moderation_queue_stats;
end;
$$ language plpgsql;

comment on function domain.refresh_moderation_stats is 'Refresh moderation queue statistics (call from scheduler)';

comment on schema domain is 'Domain-specific business logic tables';
comment on schema platform is 'Platform-wide infrastructure tables';
