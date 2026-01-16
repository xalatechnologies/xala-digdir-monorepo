-- =====================================================================
-- DOMAIN EXTENSION: RAG / Knowledge Base System
-- Supports document chunking, embeddings (pgvector optional), and queries
-- =====================================================================

create table if not exists domain.enum_kb_source_type (
  code text primary key check (code in (
    'HELP_ARTICLE','DOCUMENT','WEBPAGE','TENDER','POLICY',
    'LISTING_DATA','BOOKING_DATA','INTEGRATION_LOG'
  ))
);

insert into domain.enum_kb_source_type(code)
values ('HELP_ARTICLE'),('DOCUMENT'),('WEBPAGE'),('TENDER'),('POLICY'),
       ('LISTING_DATA'),('BOOKING_DATA'),('INTEGRATION_LOG')
on conflict do nothing;

create table if not exists domain.kb_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  source_type text not null references domain.enum_kb_source_type(code),
  source_ref text not null,      -- external id/url/path
  title text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, source_type, source_ref)
);

create table if not exists domain.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, source_id, chunk_index)
);

-- Note: If using pgvector, add embedding column:
-- alter table domain.kb_chunks add column embedding vector(1536);
-- create index on domain.kb_chunks using ivfflat (embedding vector_cosine_ops);

create table if not exists domain.kb_queries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  user_id uuid null references platform.users(id) on delete set null,
  query text not null,
  response text null,
  citations jsonb null,
  created_at timestamptz not null default now()
);

comment on table domain.kb_sources is 'Knowledge base source documents/pages';
comment on table domain.kb_chunks is 'Chunked content for RAG retrieval, supports optional pgvector embeddings';
comment on table domain.kb_queries is 'RAG query log with responses and citations';
