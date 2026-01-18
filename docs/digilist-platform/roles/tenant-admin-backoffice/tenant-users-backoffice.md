MASTER PROMPT — TENANT ADMIN + TENANT INTERNAL USERS (BACKOFFICE)
Platform: Digilist / Xala (Municipal multi-tenant booking SaaS)
Purpose: Define, enforce, and implement the Tenant Admin domain including
tenant-internal users, roles, scopes, permissions, feature flags, UI patterns,
API enforcement, and data model — in a way that matches real municipal operations
and is tender-safe.

=====================================================================
0) FOUNDATIONAL CONCEPTS (LOCKED TERMINOLOGY)
=====================================================================
- SaaS Admin: Manages the SaaS platform (plans, global feature flags, tenants).
- Tenant: A customer (kommune / municipality).
- Backoffice: Operational admin interface for tenant users and delegated org users.
- MinSide: End-user portal (citizens + membership org representatives).

CRITICAL DISTINCTIONS:
- Tenant Internal Users ≠ Backoffice Organization Users ≠ MinSide Users
- Backoffice Organizations are governance/umbrella entities owned by the tenant.
- MinSide Organizations are membership identities loaded at sign-in and are NEVER
  used for governance or rental-object management.

Terminology:
- rental_object (never facility or listing)
- tenant_internal_user
- backoffice_organization_user
- membership_organization_user (MinSide only)

=====================================================================
1) ROLE DEFINITION — TENANT ADMIN (BACKOFFICE)
=====================================================================
Tenant Admin is the highest authority inside a tenant.

Tenant Admin responsibilities include THREE control planes:

1) Tenant Governance
   - Manage backoffice organizations
   - Assign rental objects to organizations
   - Define booking rules, approval flows, pricing policies
   - Control tenant-level feature flags (within subscription)

2) Tenant Internal Users & Roles (CRITICAL)
   - Create and manage tenant-internal users (commune staff)
   - Define tenant-specific roles (e.g. Saksbehandler, Økonomi, Drift)
   - Assign roles to users
   - Assign responsibility scopes:
       - rental objects (specific IDs)
       - categories
       - functional scopes (approvals, economy, reporting)
   - Combine role + scope to define effective permissions

3) Delegation Boundary
   - Decide what is handled internally by tenant users
   - Decide what is delegated to backoffice organizations

Tenant Admin can do EVERYTHING tenant-side.
Tenant Admin never manages SaaS-level configuration.

=====================================================================
2) TENANT INTERNAL USERS (COMMUNE STAFF)
=====================================================================
Tenant Internal Users:
- Log into Backoffice
- Are NOT members of backoffice organizations
- Are governed directly by the tenant
- Operate under role + scope + feature-flag enforcement

Examples:
- Saksbehandler
- Økonomiansvarlig
- Kulturansvarlig
- Drift / Vedlikehold
- Tenant Superuser

Tenant Internal Users CAN:
- Perform operational tasks based on assigned permissions
Tenant Internal Users CANNOT:
- Escalate scope or permissions themselves
- Access outside assigned scope
- Bypass feature flags

=====================================================================
3) PERMISSION MODEL (ENFORCE EVERYWHERE)
=====================================================================
Effective Permission = Feature Flag × Role Capability × Scope

A user may act on a target ONLY IF:
- feature_flag.enabled == true
- role_capability.allowed == true
- scope.includes(target)

Example:
User:
- Role: Saksbehandler
- Capabilities: bookings.approve, blocks.manage
- Scope: rentalObjectIds = [A..J]

Result:
- Can approve bookings ONLY for those 10 rental objects
- UI, API, SDK, and DB MUST enforce this

NO CLIENT-SIDE TRUST. SERVER IS SOURCE OF TRUTH.

=====================================================================
4) FEATURE FLAGS (MODULE-BASED, GLOBAL)
=====================================================================
Feature flags are module-based and MUST affect:
- Sidebar items
- Routes
- Tabs
- Buttons
- Form sections
- API endpoints
- WebSocket events

If a feature is OFF, it is OFF EVERYWHERE.

Examples:
- messaging.enabled
- pricing.enabled
- reports.enabled
- economy.enabled
- audit.enabled
- favorites.enabled

Feature flags come from:
- SaaS subscription
- Tenant configuration

=====================================================================
5) UI RULES (NON-NEGOTIABLE)
=====================================================================
- PAGE-BASED CRUD ONLY.
  NO modal/dialog for create/edit/update/clone/archive.
- Dialogs ONLY for confirm/info, DS-only components.
- Use Digdir / Designsystemet components ONLY.
- No raw HTML in pages.
- Use design tokens only; extend tokens via extension package if needed.
- Proper PageHeader, Breadcrumbs, Tabs, Wizards.
- SSR + hydration safe.
- i18n keys only (nb/en).

=====================================================================
6) TENANT ADMIN UI — REQUIRED SECTIONS
=====================================================================
Backoffice → Tenant Admin must include:

- Dashboard (overview only)
- Rental Objects (full lifecycle)
- Backoffice Organizations
- Tenant Internal Users & Access
  - Users list
  - Roles
  - Role capabilities
  - Scope assignment (rental objects, categories)
  - Effective permissions (read-only summary)
- Bookings & Approvals
- Calendar & Blocks
- Economy (if enabled)
- Reports (if enabled)
- System Log / Audit (if enabled)
- Feature Toggles (tenant-level, within plan)
- Help & Support

Each section:
- Uses standard list → detail → edit pages
- Bulk operations via list toolbar (DS components)

=====================================================================
7) DATA MODEL (INTENT, NOT IMPLEMENTATION)
=====================================================================
Required concepts:

users
tenant_roles
tenant_role_capabilities
user_tenant_roles
user_scopes (rental_object, category, function)
backoffice_organizations
organization_assignments (rental_object ↔ org)
feature_flags (resolved per tenant)

Tenant internal users and backoffice organization users MUST be separate models.

=====================================================================
8) API & SDK ENFORCEMENT
=====================================================================
- All endpoints enforce:
  - tenant isolation
  - role capability
  - scope
  - feature flag
- Violations return RFC7807 errors:
  - FORBIDDEN
  - FEATURE_DISABLED
- Client SDK exposes:
  - capability helpers
  - feature flag helpers
  - typed errors

=====================================================================
9) TESTING REQUIREMENTS
=====================================================================
API:
- Cannot access outside scope
- Feature OFF blocks endpoint
- Role without capability returns FORBIDDEN

UI (Playwright):
- Sidebar adapts to flags + permissions
- Routes blocked when disabled
- No modal CRUD exists
- Assignment scope strictly enforced

=====================================================================
10) DELIVERABLES EXPECTED FROM AI
=====================================================================
- Updated PRD language (tender-safe)
- Capability registry
- UI blueprints (Tenant Admin)
- Route trees
- Permission resolution algorithm
- Test plans
- Audit of existing repo for violations

Start by auditing the current codebase.
Implement incrementally with minimal breaking changes.