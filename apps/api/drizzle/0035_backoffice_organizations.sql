-- Migration: Backoffice Organizations
-- Creates tables for municipal/partner organizations that manage rental objects
-- Reference: docs/roles/prd.md - Organization Model (Section 3.1)

-- ============================================================================
-- Backoffice Organizations (governing entities)
-- ============================================================================

create table if not exists domain.backoffice_organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references platform.tenants(id) on delete cascade,
  
  -- Organization details
  name text not null,
  type text not null check (type in ('MUNICIPAL_UNIT', 'PARTNER_ORG', 'UMBRELLA_ORG')),
  description text,
  
  -- Contact information
  email text,
  phone text,
  address text,
  
  -- Status
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references platform.users(id),
  updated_by uuid references platform.users(id),
  
  -- Constraints
  unique (tenant_id, name)
);

-- Indexes
create index idx_backoffice_orgs_tenant on domain.backoffice_organizations(tenant_id);
create index idx_backoffice_orgs_status on domain.backoffice_organizations(status);
create index idx_backoffice_orgs_type on domain.backoffice_organizations(type);

-- ============================================================================
-- Organization Members (users assigned to backoffice orgs)
-- ============================================================================

create table if not exists domain.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references domain.backoffice_organizations(id) on delete cascade,
  user_id uuid not null references platform.users(id) on delete cascade,
  
  -- Member role within organization
  role text not null check (role in ('ADMIN', 'MEMBER', 'VIEWER')),
  
  -- Specific capabilities within org
  capabilities text[] default array[]::text[],
  
  -- Status
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED')),
  
  -- Timestamps
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  invited_by uuid references platform.users(id),
  
  -- Constraints
  unique (organization_id, user_id)
);

-- Indexes
create index idx_org_members_org on domain.organization_members(organization_id);
create index idx_org_members_user on domain.organization_members(user_id);
create index idx_org_members_status on domain.organization_members(status);

-- ============================================================================
-- Rental Object Assignments (orgs → rental objects)
-- ============================================================================

create table if not exists domain.rental_object_assignments (
  id uuid primary key default gen_random_uuid(),
  rental_object_id uuid not null references domain.rental_objects(id) on delete cascade,
  organization_id uuid not null references domain.backoffice_organizations(id) on delete cascade,
  
  -- Assignment type
  assignment_type text not null default 'MANAGED' check (assignment_type in ('OWNED', 'MANAGED', 'DELEGATED')),
  
  -- Permissions granted to org for this rental object
  can_edit boolean not null default true,
  can_approve_bookings boolean not null default true,
  can_manage_availability boolean not null default true,
  can_manage_pricing boolean not null default false,
  
  -- Effective period (optional)
  effective_from timestamptz,
  effective_until timestamptz,
  
  -- Status
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'EXPIRED')),
  
  -- Timestamps
  assigned_at timestamptz not null default now(),
  assigned_by uuid references platform.users(id),
  
  -- Constraints
  unique (rental_object_id, organization_id)
);

-- Indexes
create index idx_rental_assignments_object on domain.rental_object_assignments(rental_object_id);
create index idx_rental_assignments_org on domain.rental_object_assignments(organization_id);
create index idx_rental_assignments_status on domain.rental_object_assignments(status);

-- ============================================================================
-- Functions
-- ============================================================================

-- Update updated_at timestamp
create or replace function domain.update_backoffice_org_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger backoffice_orgs_updated_at
  before update on domain.backoffice_organizations
  for each row
  execute function domain.update_backoffice_org_updated_at();

-- ============================================================================
-- Seed data (optional - for development)
-- ============================================================================

-- Example municipal unit
-- insert into domain.backoffice_organizations (tenant_id, name, type, description)
-- values (
--   (select id from platform.tenants limit 1),
--   'Kulturkontoret',
--   'MUNICIPAL_UNIT',
--   'Municipal cultural department managing cultural venues'
-- );

-- ============================================================================
-- Comments
-- ============================================================================

comment on table domain.backoffice_organizations is 'Organizations that govern and manage rental objects';
comment on table domain.organization_members is 'Users assigned to backoffice organizations';
comment on table domain.rental_object_assignments is 'Assignment of rental objects to organizations';

comment on column domain.backoffice_organizations.type is 'MUNICIPAL_UNIT = internal dept, PARTNER_ORG = external partner, UMBRELLA_ORG = parent organization';
comment on column domain.rental_object_assignments.assignment_type is 'OWNED = org owns object, MANAGED = org manages for tenant, DELEGATED = temporary delegation';
