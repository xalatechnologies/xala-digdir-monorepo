-- =====================================================================
-- DOMAIN EXTENSION: In-App Notifications & User Preferences
-- =====================================================================

create table if not exists domain.enum_inapp_notification_type (
  code text primary key check (code in (
    'SYSTEM','BOOKING','APPROVAL','PAYMENT','MESSAGE','REMINDER','SECURITY'
  ))
);

insert into domain.enum_inapp_notification_type(code)
values ('SYSTEM'),('BOOKING'),('APPROVAL'),('PAYMENT'),('MESSAGE'),('REMINDER'),('SECURITY')
on conflict do nothing;

create table if not exists domain.user_notification_settings (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  
  -- channel preferences
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  inapp_enabled boolean not null default true,
  
  -- quiet hours (local time)
  quiet_hours jsonb null, -- {"enabled":true,"from":"22:00","to":"07:00","timezone":"Europe/Oslo"}
  
  -- per-type overrides
  overrides jsonb not null default '{}'::jsonb,
  
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists domain.inapp_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  type text not null references domain.enum_inapp_notification_type(code),
  title text not null,
  body text null,
  link_url text null,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

create index if not exists idx_inapp_user_unread
  on domain.inapp_notifications(user_id, is_read, created_at desc);

comment on table domain.user_notification_settings is 'User preferences for notification channels and quiet hours';
comment on table domain.inapp_notifications is 'In-app notifications for MinSide/Backoffice/Web UX';
