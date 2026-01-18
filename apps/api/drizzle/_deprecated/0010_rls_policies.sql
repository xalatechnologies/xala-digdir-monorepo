-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICY BLUEPRINT (PostgreSQL / Supabase-ready)
-- Goal:
--  - Multi-tenant isolation by tenant_id
--  - Role-aware access (USER / SAKSBEHANDLER / ADMIN / TENANT_ADMIN / SUPER_ADMIN)
--  - Works with either:
--      A) Supabase Auth (auth.uid())  OR
--      B) API sets request claims (recommended for your API-first stack)
--
-- IMPORTANT:
--  - RLS is only enforceable if DB sessions carry identity.
--  - For API-first (Fastify/Nest), set per-request claims:
--      set_config('request.jwt.claim.sub', <user_id>, true)
--      set_config('request.jwt.claim.tenant_id', <tenant_id>, true)
--      set_config('request.jwt.claim.role', <role_code>, true)
-- =====================================================================

create schema if not exists rls;

-- ---------------------------------------------------------------------
-- 1) Helper functions (tenant + user + role)
-- ---------------------------------------------------------------------

create or replace function rls.current_user_id()
returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function rls.current_tenant_id()
returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.tenant_id', true), '')::uuid
$$;

create or replace function rls.current_role()
returns text
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'PUBLIC')
$$;

create or replace function rls.is_super_admin()
returns boolean
language sql stable as $$
  select rls.current_role() = 'SUPER_ADMIN'
$$;

create or replace function rls.is_tenant_admin()
returns boolean
language sql stable as $$
  select rls.current_role() in ('TENANT_ADMIN','ADMIN','SUPER_ADMIN')
$$;

create or replace function rls.is_backoffice_role()
returns boolean
language sql stable as $$
  select rls.current_role() in ('SAKSBEHANDLER','ADMIN','TENANT_ADMIN','SUPER_ADMIN')
$$;

-- Optional: "belongs to org" helper if you enforce org-scoped rights
create or replace function rls.user_in_org(org_id uuid)
returns boolean
language sql stable as $$
  select exists (
    select 1
    from platform.user_org_memberships m
    where m.tenant_id = rls.current_tenant_id()
      and m.user_id = rls.current_user_id()
      and m.organization_id = org_id
      and m.membership_status = 'ACTIVE'
  )
$$;

-- ---------------------------------------------------------------------
-- 2) Enable RLS on key tables
-- ---------------------------------------------------------------------
alter table platform.tenants enable row level security;
alter table platform.organizations enable row level security;
alter table platform.users enable row level security;
alter table platform.user_org_memberships enable row level security;

alter table domain.rental_objects enable row level security;
alter table domain.rental_object_categories enable row level security;
alter table domain.rental_object_media enable row level security;
alter table domain.bookings enable row level security;
alter table domain.rental_object_time_blocks enable row level security;

alter table domain.conversations enable row level security;
alter table domain.conversation_participants enable row level security;
alter table domain.messages enable row level security;

alter table domain.favourites enable row level security;
alter table domain.inapp_notifications enable row level security;

alter table domain.rental_object_ratings enable row level security;
alter table domain.feedback_items enable row level security;

-- If you store kb/rag per tenant:
alter table domain.kb_sources enable row level security;
alter table domain.kb_chunks enable row level security;
alter table domain.kb_queries enable row level security;

-- ---------------------------------------------------------------------
-- 3) PLATFORM POLICIES (tenant isolation + admin-only)
-- ---------------------------------------------------------------------

-- Tenants: only SUPER_ADMIN can see all; tenant-scoped users see only their tenant
drop policy if exists p_tenants_select on platform.tenants;
create policy p_tenants_select on platform.tenants
for select
using (
  rls.is_super_admin()
  or id = rls.current_tenant_id()
);

-- Organizations: same tenant; write requires tenant admin
drop policy if exists p_orgs_select on platform.organizations;
create policy p_orgs_select on platform.organizations
for select
using (tenant_id = rls.current_tenant_id() or rls.is_super_admin());

drop policy if exists p_orgs_write on platform.organizations;
create policy p_orgs_write on platform.organizations
for all
using (rls.is_tenant_admin() and tenant_id = rls.current_tenant_id())
with check (rls.is_tenant_admin() and tenant_id = rls.current_tenant_id());

-- Users: user can read own profile; backoffice roles can read within tenant
drop policy if exists p_users_select on platform.users;
create policy p_users_select on platform.users
for select
using (
  rls.is_super_admin()
  or tenant_id = rls.current_tenant_id()
     and (
       id = rls.current_user_id()
       or rls.is_backoffice_role()
     )
);

-- Users: only tenant admins can modify other users; user can update some own fields via a separate table
drop policy if exists p_users_update on platform.users;
create policy p_users_update on platform.users
for update
using (
  tenant_id = rls.current_tenant_id()
  and (
    rls.is_tenant_admin()
    or id = rls.current_user_id()
  )
)
with check (tenant_id = rls.current_tenant_id());

-- ---------------------------------------------------------------------
-- 4) DOMAIN POLICIES — Rental Objects
-- ---------------------------------------------------------------------

-- Rental objects: anyone can read PUBLISHED within tenant (or public web if you have a public tenant view)
-- Backoffice roles can read all statuses within tenant
drop policy if exists p_ro_select on domain.rental_objects;
create policy p_ro_select on domain.rental_objects
for select
using (
  rls.is_super_admin()
  or tenant_id = rls.current_tenant_id()
     and (
       status = 'PUBLISHED'
       or rls.is_backoffice_role()
     )
);

-- Rental objects: only backoffice roles can insert/update/delete within tenant
drop policy if exists p_ro_write on domain.rental_objects;
create policy p_ro_write on domain.rental_objects
for all
using (
  (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id())
  or rls.is_super_admin()
)
with check (
  (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id())
  or rls.is_super_admin()
);

-- Rental object media: readable if parent is readable; writable if backoffice
drop policy if exists p_ro_media_select on domain.rental_object_media;
create policy p_ro_media_select on domain.rental_object_media
for select
using (
  tenant_id = rls.current_tenant_id()
  and exists (
    select 1 from domain.rental_objects ro
    where ro.id = rental_object_id
      and (
        ro.status = 'PUBLISHED' or rls.is_backoffice_role()
      )
      and ro.tenant_id = rls.current_tenant_id()
  )
);

drop policy if exists p_ro_media_write on domain.rental_object_media;
create policy p_ro_media_write on domain.rental_object_media
for all
using (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id())
with check (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id());

-- Categories: public read; backoffice write
drop policy if exists p_cat_select on domain.rental_object_categories;
create policy p_cat_select on domain.rental_object_categories
for select
using (tenant_id = rls.current_tenant_id() or rls.is_super_admin());

drop policy if exists p_cat_write on domain.rental_object_categories;
create policy p_cat_write on domain.rental_object_categories
for all
using (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id())
with check (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id());

-- ---------------------------------------------------------------------
-- 5) DOMAIN POLICIES — Bookings (USER sees own; ORG sees org bookings; backoffice sees all)
-- ---------------------------------------------------------------------

drop policy if exists p_bookings_select on domain.bookings;
create policy p_bookings_select on domain.bookings
for select
using (
  rls.is_super_admin()
  or tenant_id = rls.current_tenant_id()
     and (
       -- user owns booking
       booked_by_user_id = rls.current_user_id()
       -- org booking: user in org can see it (if booked_for_org_id set)
       or (booked_for_org_id is not null and rls.user_in_org(booked_for_org_id))
       -- backoffice can see all in tenant
       or rls.is_backoffice_role()
     )
);

-- Create booking: authenticated user within tenant; must match current user; backoffice can create too
drop policy if exists p_bookings_insert on domain.bookings;
create policy p_bookings_insert on domain.bookings
for insert
with check (
  tenant_id = rls.current_tenant_id()
  and (
    booked_by_user_id = rls.current_user_id()
    or rls.is_backoffice_role()
  )
);

-- Update booking: user can cancel own pending/approved (enforced in API), backoffice can update
drop policy if exists p_bookings_update on domain.bookings;
create policy p_bookings_update on domain.bookings
for update
using (
  tenant_id = rls.current_tenant_id()
  and (
    booked_by_user_id = rls.current_user_id()
    or rls.is_backoffice_role()
  )
)
with check (tenant_id = rls.current_tenant_id());

-- Time blocks: backoffice only
drop policy if exists p_blocks_all on domain.rental_object_time_blocks;
create policy p_blocks_all on domain.rental_object_time_blocks
for all
using (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id())
with check (rls.is_backoffice_role() and tenant_id = rls.current_tenant_id());

-- ---------------------------------------------------------------------
-- 6) MESSAGING RLS — participants only; internal messages visible to backoffice
-- ---------------------------------------------------------------------

drop policy if exists p_conv_select on domain.conversations;
create policy p_conv_select on domain.conversations
for select
using (
  tenant_id = rls.current_tenant_id()
  and (
    rls.is_backoffice_role()
    or exists (
      select 1 from domain.conversation_participants p
      where p.conversation_id = id
        and p.user_id = rls.current_user_id()
        and p.tenant_id = rls.current_tenant_id()
    )
  )
);

drop policy if exists p_msg_select on domain.messages;
create policy p_msg_select on domain.messages
for select
using (
  tenant_id = rls.current_tenant_id()
  and exists (
    select 1 from domain.conversation_participants p
    where p.conversation_id = messages.conversation_id
      and p.user_id = rls.current_user_id()
      and p.tenant_id = rls.current_tenant_id()
  )
  and (
    visibility = 'PUBLIC' or rls.is_backoffice_role()
  )
);

drop policy if exists p_msg_insert on domain.messages;
create policy p_msg_insert on domain.messages
for insert
with check (
  tenant_id = rls.current_tenant_id()
  and exists (
    select 1 from domain.conversation_participants p
    where p.conversation_id = conversation_id
      and p.user_id = rls.current_user_id()
      and p.tenant_id = rls.current_tenant_id()
  )
);

-- ---------------------------------------------------------------------
-- 7) USER-SCOPED TABLES (favourites, in-app notifications, ratings)
-- ---------------------------------------------------------------------

drop policy if exists p_fav_all on domain.favourites;
create policy p_fav_all on domain.favourites
for all
using (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id())
with check (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id());

drop policy if exists p_inapp_select on domain.inapp_notifications;
create policy p_inapp_select on domain.inapp_notifications
for select
using (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id());

drop policy if exists p_inapp_update on domain.inapp_notifications;
create policy p_inapp_update on domain.inapp_notifications
for update
using (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id())
with check (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id());

drop policy if exists p_ratings_select on domain.rental_object_ratings;
create policy p_ratings_select on domain.rental_object_ratings
for select
using (
  tenant_id = rls.current_tenant_id()
  and (
    is_public = true
    or user_id = rls.current_user_id()
    or rls.is_backoffice_role()
  )
);

drop policy if exists p_ratings_insert on domain.rental_object_ratings;
create policy p_ratings_insert on domain.rental_object_ratings
for insert
with check (tenant_id = rls.current_tenant_id() and user_id = rls.current_user_id());

-- ---------------------------------------------------------------------
-- 8) RAG / KB (tenant-only; optionally restrict to backoffice)
-- ---------------------------------------------------------------------

drop policy if exists p_kb_sources_select on domain.kb_sources;
create policy p_kb_sources_select on domain.kb_sources
for select
using (tenant_id = rls.current_tenant_id() and rls.is_backoffice_role());

drop policy if exists p_kb_chunks_select on domain.kb_chunks;
create policy p_kb_chunks_select on domain.kb_chunks
for select
using (tenant_id = rls.current_tenant_id() and rls.is_backoffice_role());

-- ---------------------------------------------------------------------
-- 9) Hardening: revoke default access + grant via roles
-- ---------------------------------------------------------------------
-- NOTE: Adjust to your role names (authenticated/anon/service_role).
-- In Supabase, you typically:
--   revoke all on schema/table from anon, authenticated;
--   grant select/insert/update as needed.
--
-- Example (optional):
-- revoke all on all tables in schema domain from public;
-- revoke all on all tables in schema platform from public;
-- revoke all on all tables in schema compliance from public;

-- =====================================================================
-- REQUIRED APP SIDE (for API-first):
-- 1) On each DB connection/request, set claims:
--    select set_config('request.jwt.claim.sub', :userId, true);
--    select set_config('request.jwt.claim.tenant_id', :tenantId, true);
--    select set_config('request.jwt.claim.role', :role, true);
--
-- 2) Always include tenant_id in writes.
-- 3) Enforce business rules (approval, status transitions, overlaps) in API;
--    RLS ensures isolation + basic access boundaries.
-- =====================================================================

comment on schema rls is 'Row Level Security helper functions for multi-tenant isolation and role-based access';
comment on function rls.current_user_id() is 'Returns current user ID from request.jwt.claim.sub';
comment on function rls.current_tenant_id() is 'Returns current tenant ID from request.jwt.claim.tenant_id';
comment on function rls.current_role() is 'Returns current role from request.jwt.claim.role';
comment on function rls.is_super_admin() is 'Check if current user is SUPER_ADMIN';
comment on function rls.is_tenant_admin() is 'Check if current user is TENANT_ADMIN, ADMIN, or SUPER_ADMIN';
comment on function rls.is_backoffice_role() is 'Check if current user is SAKSBEHANDLER, ADMIN, TENANT_ADMIN, or SUPER_ADMIN';
comment on function rls.user_in_org(uuid) is 'Check if current user is an active member of specified organization';
