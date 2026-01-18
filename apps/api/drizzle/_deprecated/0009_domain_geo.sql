-- =====================================================================
-- DOMAIN EXTENSION: Geocoding & Geographic Areas
-- Supports address geocoding cache, municipal zones, distance filtering
-- =====================================================================

create table if not exists domain.geo_geocode_cache (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  query text not null, -- address or place query
  provider text not null, -- mapbox, google, etc.
  result jsonb not null,  -- lat/lng + features
  created_at timestamptz not null default now(),
  unique (tenant_id, provider, query)
);

create table if not exists domain.geo_areas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  polygon jsonb null, -- geojson polygon for municipal zones
  created_at timestamptz not null default now(),
  unique (tenant_id, code)
);

-- Link rental objects to geographic areas for fast filtering
create table if not exists domain.rental_object_geo_area (
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  area_id uuid not null references domain.geo_areas(id) on delete cascade,
  primary key (tenant_id, rental_object_id, area_id)
);

comment on table domain.geo_geocode_cache is 'Cached geocoding results to reduce API calls';
comment on table domain.geo_areas is 'Geographic areas/zones (e.g., municipal districts) with optional polygon boundaries';
comment on table domain.rental_object_geo_area is 'Links rental objects to geographic areas for fast filtering';
