-- =====================================================================
-- DOMAIN EXTENSION: SEO & Meta Tags
-- Tenant-specific pages, slugs, meta descriptions, Open Graph
-- =====================================================================

create table if not exists domain.seo_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','CATEGORY','STATIC_PAGE')),
  entity_id uuid null,
  slug text not null,
  title text not null,
  meta_description text null,
  canonical_url text null,
  og jsonb null, -- open graph / twitter cards
  is_indexable boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (tenant_id, entity_type, slug)
);

comment on table domain.seo_pages is 'SEO metadata for tenant pages: rental objects, categories, static pages';
comment on column domain.seo_pages.og is 'Open Graph and Twitter Card metadata (JSON)';
