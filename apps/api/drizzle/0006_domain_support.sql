-- =====================================================================
-- DOMAIN EXTENSION: Help & Support System
-- =====================================================================

create table if not exists domain.help_articles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references platform.tenants(id) on delete cascade, -- null = global
  slug text not null,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  locale text not null references platform.enum_locale(code),
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug, locale)
);

create table if not exists domain.support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid null references platform.users(id) on delete set null,
  conversation_id uuid null references domain.conversations(id) on delete set null,
  subject text not null,
  status text not null check (status in ('OPEN','PENDING','RESOLVED','CLOSED')) default 'OPEN',
  priority text not null check (priority in ('LOW','MEDIUM','HIGH','URGENT')) default 'MEDIUM',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table domain.help_articles is 'Knowledge base articles, can be global or tenant-specific';
comment on table domain.support_tickets is 'Support ticket system, can be linked to conversations';
