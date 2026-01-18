-- =====================================================================
-- DOMAIN EXTENSION: Messaging & Conversations
-- Supports citizen <-> organization/admin/case handler communication
-- =====================================================================

create table if not exists domain.enum_conversation_type (
  code text primary key check (code in ('SUPPORT','BOOKING','GENERAL'))
);

insert into domain.enum_conversation_type(code)
values ('SUPPORT'),('BOOKING'),('GENERAL')
on conflict do nothing;

create table if not exists domain.enum_message_visibility (
  code text primary key check (code in ('PUBLIC','INTERNAL'))
);

insert into domain.enum_message_visibility(code)
values ('PUBLIC'),('INTERNAL')
on conflict do nothing;

create table if not exists domain.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  type text not null references domain.enum_conversation_type(code),
  
  -- optional anchors
  booking_id uuid null references domain.bookings(id) on delete set null,
  rental_object_id uuid null references domain.rental_objects(id) on delete set null,
  
  subject text not null,
  status text not null check (status in ('OPEN','PENDING','RESOLVED','CLOSED')) default 'OPEN',
  
  created_by_user_id uuid null references platform.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists domain.conversation_participants (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  conversation_id uuid not null references domain.conversations(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  role_snapshot text null, -- e.g. USER/SAKSBEHANDLER/ADMIN (denormalized)
  last_read_at timestamptz null,
  primary key (tenant_id, conversation_id, user_id)
);

create table if not exists domain.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  conversation_id uuid not null references domain.conversations(id) on delete cascade,
  sender_user_id uuid null references platform.users(id) on delete set null,
  visibility text not null references domain.enum_message_visibility(code) default 'PUBLIC',
  body text not null,
  attachments jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conv_time
  on domain.messages(conversation_id, created_at);

comment on table domain.conversations is 'Threaded conversations between users, can be anchored to bookings/rental objects';
comment on table domain.messages is 'Individual messages within conversations, supports PUBLIC (visible to all) and INTERNAL (staff only) visibility';
