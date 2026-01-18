-- =====================================================================
-- RLS (ROW-LEVEL SECURITY) HELPER FUNCTIONS
-- Session context management for PostgreSQL RLS policies
-- =====================================================================

-- =====================================================================
-- Session Context Functions
-- =====================================================================

-- Get current user ID from session
create or replace function current_user_id()
returns uuid as $$
begin
  return nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
exception
  when others then
    return null;
end;
$$ language plpgsql stable;

comment on function current_user_id is 'Get authenticated user ID from session context';

-- Get current tenant ID from session
create or replace function current_tenant_id()
returns uuid as $$
begin
  return nullif(current_setting('request.jwt.claim.tenant_id', true), '')::uuid;
exception
  when others then
    return null;
end;
$$ language plpgsql stable;

comment on function current_tenant_id is 'Get tenant ID from session context';

-- Get current user role from session
create or replace function current_user_role()
returns text as $$
begin
  return nullif(current_setting('request.jwt.claim.role', true), '');
exception
  when others then
    return null;
end;
$$ language plpgsql stable;

comment on function current_user_role is 'Get user role from session context';

-- Check if current user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return current_user_role() in ('SUPER_ADMIN', 'TENANT_ADMIN');
end;
$$ language plpgsql stable;

comment on function is_admin is 'Check if current user has admin role';

-- Check if service role (bypass RLS for background jobs)
create or replace function is_service_role()
returns boolean as $$
begin
  return current_setting('request.bypass_rls', true) = 'true';
exception
  when others then
    return false;
end;
$$ language plpgsql stable;

comment on function is_service_role is 'Check if request is from service role (migrations, jobs)';

-- =====================================================================
-- Ownership Check Functions
-- =====================================================================

-- Check if user owns resource
create or replace function user_owns_resource(resource_user_id uuid)
returns boolean as $$
begin
  return resource_user_id = current_user_id();
end;
$$ language plpgsql stable;

comment on function user_owns_resource is 'Check if current user owns the resource';

-- Check if user is member of organization
create or replace function user_in_organization(org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from platform.org_memberships
    where organization_id = org_id
      and user_id = current_user_id()
      and is_active = true
  );
end;
$$ language plpgsql stable;

comment on function user_in_organization is 'Check if current user is member of organization';

-- Check if user is participant in conversation
create or replace function user_in_conversation(conversation_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from domain.conversation_participants
    where conversation_id = conversation_id
      and user_id = current_user_id()
  );
end;
$$ language plpgsql stable;

comment on function user_in_conversation is 'Check if current user is participant in conversation';

-- =====================================================================
-- Permission Check Functions
-- =====================================================================

-- Check if user has permission
create or replace function user_has_permission(permission_code text)
returns boolean as $$
declare
  v_user_id uuid;
  v_tenant_id uuid;
begin
  v_user_id := current_user_id();
  v_tenant_id := current_tenant_id();
  
  if v_user_id is null then
    return false;
  end if;
  
  -- Check via role permissions
  return exists (
    select 1
    from platform.user_roles ur
    join platform.role_permissions rp on rp.role_id = ur.role_id
    join platform.permissions p on p.id = rp.permission_id
    where ur.user_id = v_user_id
      and ur.tenant_id = v_tenant_id
      and p.code = permission_code
      and ur.is_active = true
  );
end;
$$ language plpgsql stable;

comment on function user_has_permission is 'Check if user has specific permission via RBAC';

-- =====================================================================
-- Example RLS Policies
-- =====================================================================

-- Example: Tenant Isolation Policy
/*
alter table platform.users enable row level security;

create policy users_tenant_isolation on platform.users
  for all
  using (
    is_service_role() or 
    tenant_id = current_tenant_id()
  );
*/

-- Example: User Ownership Policy
/*
alter table domain.bookings enable row level security;

create policy bookings_read_own on domain.bookings
  for select
  using (
    is_service_role() or
    is_admin() or
    user_id = current_user_id()
  );
*/

-- Example: Organization Membership Policy
/*
alter table domain.org_bookings enable row level security;

create policy org_bookings_read on domain.org_bookings
  for select
  using (
    is_service_role() or
    is_admin() or
    user_in_organization(organization_id)
  );
*/

-- Example: Conversation Participant Policy
/*
alter table domain.messages enable row level security;

create policy messages_read on domain.messages
  for select
  using (
    is_service_role() or
    is_admin() or
    user_in_conversation(conversation_id)
  );
*/

-- =====================================================================
-- Session Context Setter (Call from API middleware)
-- =====================================================================

create or replace function set_session_context(
  p_user_id uuid,
  p_tenant_id uuid,
  p_role text
) returns void as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.tenant_id', p_tenant_id::text, true);
  perform set_config('request.jwt.claim.role', p_role, true);
end;
$$ language plpgsql;

comment on function set_session_context is 'Set session context from JWT claims (call from API middleware)';

-- Example usage in API middleware:
-- await db.execute(sql`SELECT set_session_context(${userId}, ${tenantId}, ${role})`);
