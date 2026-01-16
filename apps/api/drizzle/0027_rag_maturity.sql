-- =====================================================================
-- 0027: RAG MATURITY
-- Knowledge base ingestion, permissions, analytics, entity linking
-- =====================================================================

-- Note: kb_sources, kb_chunks, kb_embeddings tables already exist from migration 0007
-- This extends RAG with ingestion jobs, permissions, and maturity features

-- Enum: Ingestion Status
create table if not exists domain.enum_ingestion_status (
  code text primary key check (code in ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED'))
);

insert into domain.enum_ingestion_status(code) values 
  ('PENDING'),('PROCESSING'),('COMPLETED'),('FAILED'),('CANCELLED')
on conflict do nothing;

-- =====================================================================
-- KB Ingestion Jobs (Automated Document Processing)
-- =====================================================================

create table if not exists domain.kb_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  
  -- Processing
  status text not null references domain.enum_ingestion_status(code) default 'PENDING',
  
  started_at timestamptz null,
  completed_at timestamptz null,
  duration_ms integer null,
  
  -- Results
  chunks_created integer default 0,
  chunks_updated integer default 0,
  chunks_deleted integer default 0,
  embeddings_generated integer default 0,
  
  -- Error details
  error text null,
  error_details jsonb default '{}'::jsonb,
  
  -- Retry
  attempt_number integer not null default 1,
  max_attempts integer not null default 3,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_kb_ingestion_jobs_tenant on domain.kb_ingestion_jobs(tenant_id, created_at desc);
create index if not exists idx_kb_ingestion_jobs_source on domain.kb_ingestion_jobs(source_id, created_at desc);
create index if not exists idx_kb_ingestion_jobs_status on domain.kb_ingestion_jobs(status, created_at);

comment on table domain.kb_ingestion_jobs is 'Background jobs for processing knowledge base documents';

-- =====================================================================
-- KB Permissions (Row-Level Access Control)
-- =====================================================================

create table if not exists domain.kb_permissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  
  -- Permission grant
  granted_to_type text not null check (granted_to_type in ('USER','ROLE','ORGANIZATION','PUBLIC')),
  granted_to_id uuid null, -- User or Org ID (null = PUBLIC)
  
  permission text not null check (permission in ('READ','WRITE','DELETE','MANAGE')),
  
  granted_by uuid not null references platform.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  
  expires_at timestamptz null
);

create index if not exists idx_kb_permissions_source on domain.kb_permissions(source_id);
create index if not exists idx_kb_permissions_granted_to on domain.kb_permissions(granted_to_type, granted_to_id);
create index if not exists idx_kb_permissions_expiry on domain.kb_permissions(expires_at) where expires_at is not null;

comment on table domain.kb_permissions is 'Granular access control for knowledge base sources';

-- =====================================================================
-- KB Linked Entities (Connect KB to Domain Entities)
-- =====================================================================

create table if not exists domain.kb_linked_entities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','BOOKING','CASE','HELP_ARTICLE')),
  entity_id uuid not null,
  
  -- Relevance
  relevance_score numeric(3,2) null, -- 0.00 to 1.00
  
  -- Linking
  linked_by uuid not null references platform.users(id) on delete restrict,
  linked_at timestamptz not null default now(),
  
  unique (source_id, entity_type, entity_id)
);

create index if not exists idx_kb_linked_entities_source on domain.kb_linked_entities(source_id);
create index if not exists idx_kb_linked_entities_entity on domain.kb_linked_entities(entity_type, entity_id);

comment on table domain.kb_linked_entities is 'Link knowledge base sources to domain entities (rentals, cases, etc.)';

-- =====================================================================
-- KB Query Analytics
-- =====================================================================

create table if not exists domain.kb_query_analytics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  user_id uuid null references platform.users(id) on delete set null,
  
  query_text text not null,
  query_vector real[] null, -- Embedding vector
  
  -- Results
  result_count integer not null,
  top_source_id uuid null references domain.kb_sources(id) on delete set null,
  top_score numeric(5,4) null,
  
  -- Feedback
  was_helpful boolean null,
  clicked_source_ids uuid[] default '{}',
  
  response_time_ms integer null,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_kb_query_analytics_tenant on domain.kb_query_analytics(tenant_id, created_at desc);
create index if not exists idx_kb_query_analytics_user on domain.kb_query_analytics(user_id);
create index if not exists idx_kb_query_analytics_text on domain.kb_query_analytics(query_text);

comment on table domain.kb_query_analytics is 'Query analytics for RAG performance optimization';

-- =====================================================================
-- KB Quality Metrics (Per Source)
-- =====================================================================

create table if not exists domain.kb_quality_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  
  -- Usage
  query_count integer not null default 0,
  click_count integer not null default 0,
  helpful_count integer not null default 0,
  unhelpful_count integer not null default 0,
  
  -- Quality scores
  click_through_rate numeric(5,4) null,
  helpfulness_rate numeric(5,4) null,
  avg_relevance_score numeric(3,2) null,
  
  -- Freshness
  last_updated_at timestamptz null,
  days_since_update integer null,
  
  period_start timestamptz not null,
  period_end timestamptz not null,
  
  created_at timestamptz not null default now(),
  
  unique (source_id, period_start)
);

create index if not exists idx_kb_quality_metrics_source on domain.kb_quality_metrics(source_id, period_start desc);
create index if not exists idx_kb_quality_metrics_ctr on domain.kb_quality_metrics(click_through_rate desc nulls last);
create index if not exists idx_kb_quality_metrics_helpfulness on domain.kb_quality_metrics(helpfulness_rate desc nulls last);

comment on table domain.kb_quality_metrics is 'Quality metrics for evaluating RAG source performance';

-- =====================================================================
-- KB Source Tags (Categorization)
-- =====================================================================

create table if not exists domain.kb_source_tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_id uuid not null references domain.kb_sources(id) on delete cascade,
  tag text not null,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  
  unique (source_id, tag)
);

create index if not exists idx_kb_source_tags_source on domain.kb_source_tags(source_id);
create index if not exists idx_kb_source_tags_tag on domain.kb_source_tags(tag);

comment on table domain.kb_source_tags is 'Tagging system for knowledge base organization';

-- =====================================================================
-- Function: Calculate Quality Metrics
-- =====================================================================

create or replace function domain.calculate_kb_quality_metrics(
  p_tenant_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
) returns void as $$
declare
  v_source record;
begin
  for v_source in 
    select id from domain.kb_sources where tenant_id = p_tenant_id
  loop
    insert into domain.kb_quality_metrics (
      tenant_id, source_id,
      query_count, click_count, helpful_count, unhelpful_count,
      click_through_rate, helpfulness_rate,
      period_start, period_end
    )
    select
      p_tenant_id,
      v_source.id,
      count(*) as query_count,
      count(*) filter (where v_source.id = any(clicked_source_ids)) as click_count,
      count(*) filter (where was_helpful = true) as helpful_count,
      count(*) filter (where was_helpful = false) as unhelpful_count,
      case 
        when count(*) > 0 then
          count(*) filter (where v_source.id = any(clicked_source_ids))::numeric / count(*)
        else null
      end as click_through_rate,
      case 
        when count(*) filter (where was_helpful is not null) > 0 then
          count(*) filter (where was_helpful = true)::numeric / 
          count(*) filter (where was_helpful is not null)
        else null
      end as helpfulness_rate,
      p_period_start,
      p_period_end
    from domain.kb_query_analytics
    where tenant_id = p_tenant_id
      and top_source_id = v_source.id
      and created_at between p_period_start and p_period_end
    on conflict (source_id, period_start) do update
    set query_count = excluded.query_count,
        click_count = excluded.click_count,
        helpful_count = excluded.helpful_count,
        unhelpful_count = excluded.unhelpful_count,
        click_through_rate = excluded.click_through_rate,
        helpfulness_rate = excluded.helpfulness_rate;
  end loop;
end;
$$ language plpgsql;

comment on function domain.calculate_kb_quality_metrics is 'Calculate quality metrics for KB sources in a time period';

-- =====================================================================
-- Function: Find Similar Sources (Vector Search)
-- =====================================================================

create or replace function domain.find_similar_kb_sources(
  p_query_vector real[],
  p_tenant_id uuid,
  p_limit integer default 5
) returns table (
  source_id uuid,
  chunk_id uuid,
  content text,
  similarity numeric
) as $$
begin
  -- Note: Requires pgvector extension for cosine similarity
  return query
  select
    kbc.source_id,
    kbc.id as chunk_id,
    kbc.content,
    (1 - (kbc.embedding <=> p_query_vector::vector)) as similarity
  from domain.kb_chunks kbc
  join domain.kb_sources kbs on kbs.id = kbc.source_id
  where kbs.tenant_id = p_tenant_id
    and kbs.is_active = true
  order by kbc.embedding <=> p_query_vector::vector
  limit p_limit;
end;
$$ language plpgsql stable;

comment on function domain.find_similar_kb_sources is 'Vector similarity search for RAG retrieval';

comment on schema domain is 'Domain-specific business logic tables';
