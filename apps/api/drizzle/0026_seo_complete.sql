-- =====================================================================
-- 0026: SEO COMPLETE
-- CMS-lite (static pages), redirects, sitemaps
-- =====================================================================

-- Note: seo_metadata and open_graph_tags tables already exist from migration 0008
-- This extends SEO with CMS and redirect management

-- =====================================================================
-- Static Pages (Tenant CMS-Lite)
-- =====================================================================

create table if not exists domain.static_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  slug text not null,
  title text not null,
  content text not null, -- HTML or Markdown
  
  locale text not null references platform.enum_locale(code) default 'nb',
  
  -- SEO
  meta_title text null,
  meta_description text null,
  meta_keywords text[] default '{}',
  
  -- Status
  status text not null check (status in ('DRAFT','PUBLISHED','ARCHIVED')) default 'DRAFT',
  published_at timestamptz null,
  
  -- Authoring
  created_by uuid not null references platform.users(id) on delete restrict,
  updated_by uuid null references platform.users(id) on delete set null,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, slug, locale)
);

create index if not exists idx_static_pages_tenant on domain.static_pages(tenant_id, status);
create index if not exists idx_static_pages_slug on domain.static_pages(slug, locale) where status = 'PUBLISHED';

comment on table domain.static_pages is 'Tenant CMS for static content pages (About, Contact, Terms, etc.)';

-- =====================================================================
-- URL Redirects (301/302)
-- =====================================================================

create table if not exists domain.url_redirects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  source_path text not null,
  target_url text not null,
  
  redirect_type integer not null check (redirect_type in (301, 302)) default 301,
  
  is_regex boolean not null default false,
  
  is_active boolean not null default true,
  
  hit_count integer not null default 0, -- Analytics
  last_hit_at timestamptz null,
  
  notes text null,
  
  created_by uuid not null references platform.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (tenant_id, source_path)
);

create index if not exists idx_url_redirects_tenant on domain.url_redirects(tenant_id, is_active);
create index if not exists idx_url_redirects_source on domain.url_redirects(source_path) where is_active;

comment on table domain.url_redirects is 'URL redirect management (301/302 with regex support)';

-- =====================================================================
-- Sitemaps (Generated Snapshots)
-- =====================================================================

create table if not exists domain.sitemaps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  sitemap_type text not null check (sitemap_type in ('MAIN','RENTAL_OBJECTS','STATIC_PAGES','NEWS')),
  
  locale text not null references platform.enum_locale(code) default 'nb',
  
  -- Content
  url_count integer not null,
  xml_content text not null,
  
  -- Storage
  file_url text null, -- S3/CDN URL
  file_size_bytes integer null,
  
  -- Generation
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null, -- Regenerate after this
  
  unique (tenant_id, sitemap_type, locale)
);

create index if not exists idx_sitemaps_tenant on domain.sitemaps(tenant_id, sitemap_type);
create index if not exists idx_sitemaps_expiry on domain.sitemaps(expires_at);

comment on table domain.sitemaps is 'Generated sitemap.xml snapshots for SEO';

-- =====================================================================
-- Robots.txt Rules
-- =====================================================================

create table if not exists domain.robots_txt_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  user_agent text not null default '*',
  
  directive text not null check (directive in ('Allow','Disallow')),
  path_pattern text not null,
  
  priority integer not null default 100, -- Ordering
  
  is_active boolean not null default true,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_robots_txt_tenant on domain.robots_txt_rules(tenant_id, priority);

comment on table domain.robots_txt_rules is 'Dynamic robots.txt generation rules';

-- =====================================================================
-- Function: Generate Sitemap XML
-- =====================================================================

create or replace function domain.generate_sitemap_xml(
  p_tenant_id uuid,
  p_sitemap_type text,
  p_locale text default 'nb'
) returns text as $$
declare
  v_xml text;
  v_base_url text;
begin
  -- Get tenant base URL
  select concat('https://', subdomain, '.digilist.no') into v_base_url
  from platform.tenants
  where id = p_tenant_id;
  
  -- Generate XML based on type
  if p_sitemap_type = 'RENTAL_OBJECTS' then
    select string_agg(
      format(
        E'  <url>\n    <loc>%s/rental-objects/%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>',
        v_base_url,
        slug,
        to_char(updated_at, 'YYYY-MM-DD')
      ),
      E'\n'
    ) into v_xml
    from domain.rental_objects
    where tenant_id = p_tenant_id
      and status = 'PUBLISHED';
      
  elsif p_sitemap_type = 'STATIC_PAGES' then
    select string_agg(
      format(
        E'  <url>\n    <loc>%s/%s</loc>\n    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>',
        v_base_url,
        slug,
        to_char(updated_at, 'YYYY-MM-DD')
      ),
      E'\n'
    ) into v_xml
    from domain.static_pages
    where tenant_id = p_tenant_id
      and locale = p_locale
      and status = 'PUBLISHED';
  end if;
  
  -- Wrap in sitemap XML structure
  return format(
    E'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>',
    coalesce(v_xml, '')
  );
end;
$$ language plpgsql;

comment on function domain.generate_sitemap_xml is 'Generate sitemap.xml content for a specific type';

-- =====================================================================
-- Function: Track Redirect Hit
-- =====================================================================

create or replace function domain.track_redirect_hit(p_source_path text, p_tenant_id uuid)
returns void as $$
begin
  update domain.url_redirects
  set hit_count = hit_count + 1,
      last_hit_at = now()
  where tenant_id = p_tenant_id
    and source_path = p_source_path
    and is_active = true;
end;
$$ language plpgsql;

comment on function domain.track_redirect_hit is 'Track redirect usage for analytics';

-- =====================================================================
-- Canonical URLs (De-duplication)
-- =====================================================================

create table if not exists domain.canonical_urls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  entity_type text not null check (entity_type in ('RENTAL_OBJECT','STATIC_PAGE')),
  entity_id uuid not null,
  
  canonical_url text not null,
  
  created_at timestamptz not null default now(),
  
  unique (tenant_id, entity_type, entity_id)
);

create index if not exists idx_canonical_urls_tenant on domain.canonical_urls(tenant_id);

comment on table domain.canonical_urls is 'Canonical URL mapping for duplicate content prevention';

-- =====================================================================
-- Triggers: Auto-update updated_at
-- =====================================================================

create trigger static_pages_updated_at before update on domain.static_pages
  for each row execute function domain.update_updated_at_column();

create trigger url_redirects_updated_at before update on domain.url_redirects
  for each row execute function domain.update_updated_at_column();

comment on schema domain is 'Domain-specific business logic tables';
