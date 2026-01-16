-- =====================================================================
-- PLATFORM: Branding + Theming + Design Tokens
-- =====================================================================

-- Note: platform.themes and platform.theme_versions already exist in 0001_clean_schema.sql
-- This extends with brand assets and design token management

-- ---------------------------------------------------------------------
-- 1) BRAND ASSETS (Logo, Favicon, etc.)
-- ---------------------------------------------------------------------

create table if not exists platform.brand_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  asset_type text not null check (asset_type in ('LOGO','LOGO_DARK','FAVICON','OG_IMAGE','EMAIL_HEADER','WATERMARK')),
  attachment_id uuid not null references domain.attachments(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, asset_type, is_active) where is_active = true
);

-- ---------------------------------------------------------------------
-- 2) THEME EXTENSIONS (Active theme tracking)
-- ---------------------------------------------------------------------

alter table platform.themes
  add column if not exists active_version_id uuid null references platform.theme_versions(id) on delete set null,
  add column if not exists is_default boolean not null default false;

-- Only one default theme per tenant
create unique index if not exists idx_themes_tenant_default
  on platform.themes(tenant_id)
  where is_default = true;

-- ---------------------------------------------------------------------
-- 3) DESIGN TOKEN PRESETS (Common token sets)
-- ---------------------------------------------------------------------

create table if not exists platform.design_token_presets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text null,
  tokens jsonb not null,
  category text not null check (category in ('COLORS','TYPOGRAPHY','SPACING','SHADOWS','BORDERS','ANIMATIONS')),
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed common presets
insert into platform.design_token_presets(code, name, category, tokens) values
('COLORS_BLUE', 'Blue Palette', 'COLORS', '{"primary":"#0066CC","secondary":"#004C99"}'),
('COLORS_GREEN', 'Green Palette', 'COLORS', '{"primary":"#00AA44","secondary":"#008833"}'),
('TYPOGRAPHY_MODERN', 'Modern Typography', 'TYPOGRAPHY', '{"fontFamily":"Inter, sans-serif","fontSize":"16px"}'),
('SPACING_COMPACT', 'Compact Spacing', 'SPACING', '{"base":"4px","scale":1.5}')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------

comment on table platform.brand_assets is 'Tenant brand assets (logos, favicons, etc.) linked to attachments';
comment on table platform.design_token_presets is 'Reusable design token presets for theming';
comment on column platform.themes.active_version_id is 'Currently active theme version for this theme';
