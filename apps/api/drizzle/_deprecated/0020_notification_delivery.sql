-- =====================================================================
-- 0020: NOTIFICATION DELIVERY SYSTEM
-- Queue-based notification delivery with provider integrations
-- =====================================================================

-- Enum: Notification Providers
create table if not exists platform.enum_notification_provider (
  code text primary key check (code in ('VIPPS','SENDGRID','TWILIO','PUSH_NATIVE','WEBHOOK','INTERNAL'))
);

insert into platform.enum_notification_provider(code) values 
  ('VIPPS'),('SENDGRID'),('TWILIO'),('PUSH_NATIVE'),('WEBHOOK'),('INTERNAL')
on conflict do nothing;

-- Enum: Delivery Status
create table if not exists platform.enum_delivery_status (
  code text primary key check (code in ('QUEUED','SENDING','SENT','DELIVERED','FAILED','BOUNCED','COMPLAINED'))
);

insert into platform.enum_delivery_status(code) values 
  ('QUEUED'),('SENDING'),('SENT'),('DELIVERED'),('FAILED'),('BOUNCED'),('COMPLAINED')
on conflict do nothing;

-- =====================================================================
-- Notification Providers (Per Tenant Configuration)
-- =====================================================================

create table if not exists platform.notification_providers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  provider text not null references platform.enum_notification_provider(code),
  channel text not null references platform.enum_notification_channel(code),
  
  is_active boolean not null default true,
  is_default boolean not null default false,
  
  -- Provider credentials (encrypted)
  config jsonb not null default '{}'::jsonb,
  
  -- Rate limiting
  rate_limit_per_minute integer null,
  rate_limit_per_hour integer null,
  rate_limit_per_day integer null,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, provider, channel)
);

create index if not exists idx_notification_providers_tenant on platform.notification_providers(tenant_id, is_active);

comment on table platform.notification_providers is 'Tenant-specific notification provider configurations';
comment on column platform.notification_providers.config is 'Encrypted provider credentials (API keys, secrets)';
comment on column platform.notification_providers.is_default is 'Default provider for this channel';

-- =====================================================================
-- Notification Jobs (Outbox Pattern)
-- =====================================================================

create table if not exists platform.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  notification_id uuid not null references platform.notifications(id) on delete cascade,
  provider_id uuid not null references platform.notification_providers(id) on delete restrict,
  
  channel text not null references platform.enum_notification_channel(code),
  
  -- Recipient
  recipient_user_id uuid null references platform.users(id) on delete set null,
  recipient_address text not null, -- Email, phone, device token, webhook URL
  
  -- Content
  subject text null,
  body text not null,
  metadata jsonb default '{}'::jsonb,
  
  -- Delivery
  status text not null references platform.enum_delivery_status(code) default 'QUEUED',
  priority integer not null default 5, -- 1 (highest) to 10 (lowest)
  
  scheduled_for timestamptz null, -- Scheduled delivery time
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  delivered_at timestamptz null,
  failed_at timestamptz null,
  
  -- Provider response
  provider_message_id text null,
  provider_error text null,
  
  -- Idempotency
  idempotency_key text not null unique
);

create index if not exists idx_notification_jobs_tenant on platform.notification_jobs(tenant_id, status);
create index if not exists idx_notification_jobs_notification on platform.notification_jobs(notification_id);
create index if not exists idx_notification_jobs_queue on platform.notification_jobs(status, priority, scheduled_for)
  where status = 'QUEUED';
create index if not exists idx_notification_jobs_recipient on platform.notification_jobs(recipient_user_id);

comment on table platform.notification_jobs is 'Outbox queue for notification delivery';
comment on column platform.notification_jobs.priority is '1 (highest/urgent) to 10 (lowest/bulk)';
comment on column platform.notification_jobs.idempotency_key is 'Prevents duplicate sends';

-- =====================================================================
-- Notification Events (Delivery Tracking)
-- =====================================================================

create table if not exists domain.notification_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  notification_job_id uuid not null references platform.notification_jobs(id) on delete cascade,
  
  event_type text not null check (event_type in (
    'QUEUED','SENT','DELIVERED','OPENED','CLICKED','BOUNCED','COMPLAINED','FAILED'
  )),
  
  event_data jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_events_job on domain.notification_events(notification_job_id, created_at desc);
create index if not exists idx_notification_events_tenant on domain.notification_events(tenant_id, created_at desc);

comment on table domain.notification_events is 'Append-only delivery event tracking (opens, clicks, bounces)';

-- =====================================================================
-- Notification Retry Queue
-- =====================================================================

create table if not exists platform.notification_retry_queue (
  id uuid primary key default gen_random_uuid(),
  
  notification_job_id uuid not null references platform.notification_jobs(id) on delete cascade,
  
  retry_attempt integer not null,
  retry_after timestamptz not null,
  
  last_error text not null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_retry_queue_schedule on platform.notification_retry_queue(retry_after);
create index if not exists idx_notification_retry_queue_job on platform.notification_retry_queue(notification_job_id);

comment on table platform.notification_retry_queue is 'Exponential backoff retry queue for failed deliveries';

-- =====================================================================
-- Webhook Delivery Logs (For debugging)
-- =====================================================================

create table if not exists platform.webhook_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  notification_job_id uuid not null references platform.notification_jobs(id) on delete cascade,
  
  request_url text not null,
  request_method text not null default 'POST',
  request_headers jsonb not null,
  request_body jsonb not null,
  
  response_status integer null,
  response_body text null,
  response_time_ms integer null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_webhook_logs_tenant on platform.webhook_delivery_logs(tenant_id, created_at desc);
create index if not exists idx_webhook_logs_job on platform.webhook_delivery_logs(notification_job_id);

comment on table platform.webhook_delivery_logs is 'HTTP webhook delivery logs for debugging';

-- =====================================================================
-- Trigger: Auto-update updated_at
-- =====================================================================

create trigger notification_providers_updated_at before update on platform.notification_providers
  for each row execute function domain.update_updated_at_column();

-- =====================================================================
-- Function: Queue Notification for Delivery
-- =====================================================================

create or replace function platform.queue_notification(
  p_notification_id uuid,
  p_channel text,
  p_recipient_address text,
  p_subject text,
  p_body text,
  p_priority integer default 5,
  p_scheduled_for timestamptz default now()
) returns uuid as $$
declare
  v_tenant_id uuid;
  v_provider_id uuid;
  v_job_id uuid;
  v_idempotency_key text;
begin
  -- Get tenant from notification
  select tenant_id into v_tenant_id
  from platform.notifications
  where id = p_notification_id;
  
  -- Get default provider for channel
  select id into v_provider_id
  from platform.notification_providers
  where tenant_id = v_tenant_id
    and channel = p_channel
    and is_active = true
    and is_default = true
  limit 1;
  
  if v_provider_id is null then
    raise exception 'No active provider for channel: %', p_channel;
  end if;
  
  -- Generate idempotency key
  v_idempotency_key := encode(digest(p_notification_id::text || p_channel || p_recipient_address, 'sha256'), 'hex');
  
  -- Insert job
  insert into platform.notification_jobs (
    tenant_id, notification_id, provider_id, channel,
    recipient_address, subject, body, priority, scheduled_for, idempotency_key
  )
  values (
    v_tenant_id, p_notification_id, v_provider_id, p_channel,
    p_recipient_address, p_subject, p_body, p_priority, p_scheduled_for, v_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning id into v_job_id;
  
  return v_job_id;
end;
$$ language plpgsql;

comment on function platform.queue_notification is 'Queue a notification for delivery with idempotency';

comment on schema platform is 'Platform-wide infrastructure tables';
