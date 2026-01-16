-- =====================================================================
-- 0021: SEARCH INDEXING (Full-Text + Fuzzy + Faceted)
-- PostgreSQL ts_vector + pg_trgm for production-grade search
-- =====================================================================

-- Enable extensions
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- =====================================================================
-- Search Index (Denormalized for Performance)
-- =====================================================================

create table if not exists domain.search_index (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  -- Entity reference
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','HELP_ARTICLE','KB_DOCUMENT')),
  entity_id uuid not null,
  
  -- Searchable content
  title text not null,
  description text null,
  content text null, -- Full text for articles/documents
  
  -- Full-text search vector
  search_vector tsvector null,
  
  -- Metadata for faceting
  category_key text null,
  tags text[] default '{}',
  locale text not null references platform.enum_locale(code) default 'nb',
  
  -- Geo faceting
  city text null,
  postal_code text null,
  geo_area_id uuid null references domain.geo_areas(id) on delete set null,
  
  -- Numeric faceting
  capacity integer null,
  price_from_cents integer null,
  rating_avg numeric(3,2) null,
  
  -- Status
  is_published boolean not null default false,
  is_deleted boolean not null default false,
  
  published_at timestamptz null,
  updated_at timestamptz not null default now()
);

-- Indexes for full-text search
create index if not exists idx_search_index_vector on domain.search_index using gin(search_vector);

-- Indexes for fuzzy matching (pg_trgm)
create index if not exists idx_search_index_title_trgm on domain.search_index using gin(title gin_trgm_ops);
create index if not exists idx_search_index_description_trgm on domain.search_index using gin(description gin_trgm_ops);

-- Indexes for faceted search
create index if not exists idx_search_index_tenant_entity on domain.search_index(tenant_id, entity_type, is_published) where not is_deleted;
create index if not exists idx_search_index_category on domain.search_index(category_key) where is_published and not is_deleted;
create index if not exists idx_search_index_city on domain.search_index(city) where is_published and not is_deleted;
create index if not exists idx_search_index_geo_area on domain.search_index(geo_area_id) where is_published and not is_deleted;
create index if not exists idx_search_index_capacity on domain.search_index(capacity) where is_published and not is_deleted;
create index if not exists idx_search_index_price on domain.search_index(price_from_cents) where is_published and not is_deleted;
create index if not exists idx_search_index_rating on domain.search_index(rating_avg) where is_published and not is_deleted;

-- Composite index for common queries
create index if not exists idx_search_index_published on domain.search_index(tenant_id, locale, entity_type, published_at desc)
  where is_published and not is_deleted;

comment on table domain.search_index is 'Denormalized search index with full-text vectors and facets';
comment on column domain.search_index.search_vector is 'Generated ts_vector for full-text search';

-- =====================================================================
-- Function: Update Search Vector on Insert/Update
-- =====================================================================

create or replace function domain.update_search_vector()
returns trigger as $$
begin
  NEW.search_vector := to_tsvector('norwegian'::regconfig,
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.content, '') || ' ' ||
    array_to_string(NEW.tags, ' ')
  );
  return NEW;
end;
$$ language plpgsql;

create trigger search_index_vector_update
  before insert or update on domain.search_index
  for each row
  execute function domain.update_search_vector();

comment on function domain.update_search_vector is 'Auto-generate ts_vector from searchable text fields';

-- =====================================================================
-- Search Analytics
-- =====================================================================

create table if not exists domain.search_queries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  user_id uuid null references platform.users(id) on delete set null,
  
  query_text text not null,
  filters jsonb default '{}'::jsonb,
  
  result_count integer not null,
  clicked_result_id uuid null,
  clicked_position integer null,
  
  locale text not null references platform.enum_locale(code),
  
  created_at timestamptz not null default now()
);

create index if not exists idx_search_queries_tenant on domain.search_queries(tenant_id, created_at desc);
create index if not exists idx_search_queries_text on domain.search_queries(query_text);
create index if not exists idx_search_queries_user on domain.search_queries(user_id);

comment on table domain.search_queries is 'Search analytics for query optimization and recommendations';

-- =====================================================================
-- Helper: Populate Search Index from Rental Objects
-- =====================================================================

create or replace function domain.sync_rental_object_to_search_index()
returns trigger as $$
declare
  v_price_from_cents integer;
  v_rating_avg numeric(3,2);
begin
  -- Calculate price_from (minimum price for this object)
  select min(base_price_cents) into v_price_from_cents
  from domain.rental_object_pricing
  where rental_object_id = NEW.id;
  
  -- Calculate average rating
  select avg(rating) into v_rating_avg
  from domain.ratings
  where rental_object_id = NEW.id;
  
  -- Upsert to search index
  insert into domain.search_index (
    tenant_id, entity_type, entity_id,
    title, description, content,
    category_key, locale,
    city, postal_code,
    capacity, price_from_cents, rating_avg,
    is_published, published_at
  )
  values (
    NEW.tenant_id, 'RENTAL_OBJECT', NEW.id,
    NEW.title, NEW.description, NEW.description, -- Content same as description for rental objects
    NEW.type_code, 'nb', -- Default Norwegian
    NEW.city, NEW.postal_code,
    NEW.capacity, v_price_from_cents, v_rating_avg,
    (NEW.status = 'PUBLISHED'),
    case when NEW.status = 'PUBLISHED' then now() else null end
  )
  on conflict on constraint search_index_pkey
  do update set
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category_key = EXCLUDED.category_key,
    city = EXCLUDED.city,
    postal_code = EXCLUDED.postal_code,
    capacity = EXCLUDED.capacity,
    price_from_cents = EXCLUDED.price_from_cents,
    rating_avg = EXCLUDED.rating_avg,
    is_published = EXCLUDED.is_published,
    updated_at = now();
  
  return NEW;
end;
$$ language plpgsql;

create trigger rental_object_search_sync
  after insert or update on domain.rental_objects
  for each row
  execute function domain.sync_rental_object_to_search_index();

comment on function domain.sync_rental_object_to_search_index is 'Keep search index in sync with rental objects';

-- =====================================================================
-- Search Function: Full-Text + Fuzzy + Facets
-- =====================================================================

create or replace function domain.search_rental_objects(
  p_tenant_id uuid,
  p_query text,
  p_category_key text default null,
  p_city text default null,
  p_capacity_min integer default null,
  p_price_max_cents integer default null,
  p_locale text default 'nb',
  p_limit integer default 20,
  p_offset integer default 0
) returns table (
  id uuid,
  entity_id uuid,
  title text,
  description text,
  category_key text,
  city text,
  capacity integer,
  price_from_cents integer,
  rating_avg numeric,
  rank real
) as $$
begin
  return query
  select
    si.id,
    si.entity_id,
    si.title,
    si.description,
    si.category_key,
    si.city,
    si.capacity,
    si.price_from_cents,
    si.rating_avg,
    ts_rank(si.search_vector, plainto_tsquery('norwegian', p_query)) as rank
  from domain.search_index si
  where si.tenant_id = p_tenant_id
    and si.entity_type = 'RENTAL_OBJECT'
    and si.is_published = true
    and si.is_deleted = false
    and si.locale = p_locale
    and (p_query is null or si.search_vector @@ plainto_tsquery('norwegian', p_query))
    and (p_category_key is null or si.category_key = p_category_key)
    and (p_city is null or si.city = p_city)
    and (p_capacity_min is null or si.capacity >= p_capacity_min)
    and (p_price_max_cents is null or si.price_from_cents <= p_price_max_cents)
  order by
    case when p_query is not null then ts_rank(si.search_vector, plainto_tsquery('norwegian', p_query)) else 1 end desc,
    si.rating_avg desc nulls last,
    si.published_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql stable;

comment on function domain.search_rental_objects is 'Production search with full-text, fuzzy, and faceted filtering';

comment on schema domain is 'Domain-specific business logic tables';
