1) Capability matrix (all roles × permissions)

Roles
	•	SAAS_ADMIN (Xala platform)
	•	KOMMUNE_ADMIN (Backoffice – municipal super admin)
	•	KOMMUNE_STAFF (Backoffice – municipal internal user; scoped)
	•	ORG_ADMIN (Backoffice – delegated org admin; scoped to org + assigned rental objects)
	•	ORG_MEMBER (Backoffice – delegated operational; scoped)
	•	END_USER_PRIVATE (MinSide – citizen)
	•	END_USER_ORG_REP (MinSide – acts on behalf of membership org)

Legend
	•	✅ full (within tenant/global)
	•	🟦 scoped (assigned rental_objects/org/own)
	•	🟨 optional (depends on feature flag + granted permission)
	•	❌ none

A) Governance & Access

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Tenants lifecycle (create/suspend)	✅	❌	❌	❌	❌	❌	❌
Plans & entitlements (global)	✅	❌	❌	❌	❌	❌	❌
Tenant feature flags (within plan)	✅ (global)	✅ (tenant)	❌	❌	❌	❌	❌
Backoffice orgs manage	❌	✅	🟨	🟦 (own org)	❌	❌	❌
Municipal users manage (tenant internal)	❌	✅	❌	❌	❌	❌	❌
RBAC: roles/permissions manage	✅ (templates)	✅ (tenant)	❌	❌	❌	❌	❌
Scope assignment (rental objects/categories)	❌	✅	❌	🟦 (org members only)	❌	❌	❌

B) Rental objects (Utleieobjekter)

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Create/edit/archive rental objects	❌	✅	🟦/🟨	🟦/🟨	🟨	❌	❌
Assign rental objects to backoffice orgs	❌	✅	🟨	❌	❌	❌	❌
Manage amenities/services/pricing bindings	❌	✅	🟦/🟨	🟦/🟨	🟨	❌	❌
View rental objects (admin scope)	❌	✅	🟦	🟦	🟦	✅ (public)	✅ (public)

C) Availability, calendar, blocks

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Calendar: admin views (timeline/day/week)	❌	✅	🟦	🟦	🟦	🟦 (own)	🟦 (own/org)
Create blocks / maintenance windows	❌	✅	🟦/🟨	🟦/🟨	🟨	❌	❌
Manage opening hours / blackout rules	❌	✅	🟦/🟨	🟦/🟨	🟨	❌	❌

D) Bookings (incl approvals)

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Create booking	❌	❌	❌	❌	❌	✅	✅ (on behalf of membership org)
View bookings	❌	✅	🟦	🟦	🟦	🟦 (own)	🟦 (own/org)
Approve/reject bookings	❌	✅	🟦/🟨	🟦/🟨	🟨	❌	❌
Modify/cancel booking (admin-side)	❌	✅	🟦/🟨	🟦/🟨	🟨	🟦 (own)	🟦 (own/org)
Recurring bookings	❌	🟨	🟨	🟨	🟨	🟨	🟨
Season rentals	❌	🟨	🟨	🟨	🟨	🟨	🟨

E) Pricing & economy

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Price groups & rules	❌	🟨	🟦/🟨	🟦/🟨	❌/🟨	❌	❌
Invoices/payments (tenant economy)	❌	🟨	🟦/🟨	🟦/🟨	🟨	🟨 (own)	🟨 (org)
Exports (economy/reporting)	✅ (platform)	🟨	🟦/🟨	🟨	🟨	❌	❌

F) Messaging, notifications, support

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Messaging inbox / conversations	🟨	🟨	🟦/🟨	🟦/🟨	🟦/🟨	🟨	🟨
Notification center	✅	✅	✅	✅	✅	✅	✅
Message templates	🟨	🟨	🟨	🟨	❌	❌	❌
Help & support center	✅	✅	✅	✅	✅	✅	✅

G) Compliance & monitoring

Capability	SAAS_ADMIN	KOMMUNE_ADMIN	KOMMUNE_STAFF	ORG_ADMIN	ORG_MEMBER	END_USER_PRIVATE	END_USER_ORG_REP
Audit log (tenant)	✅ (platform)	🟨	🟦/🟨	🟨	❌	❌	❌
Incident/system logs	✅	🟨	🟨	❌	❌	❌	❌
GDPR consents / DSAR	✅ (platform policy)	🟨	🟨	❌	❌	🟨 (self)	🟨 (org rep self)


⸻

2) Permission resolution algorithm (pseudo-code)

This is the server-side truth (API). UI uses the same logic only for hiding/showing, never for trust.

type Role =
  | "SAAS_ADMIN"
  | "KOMMUNE_ADMIN"
  | "KOMMUNE_STAFF"
  | "ORG_ADMIN"
  | "ORG_MEMBER"
  | "END_USER_PRIVATE"
  | "END_USER_ORG_REP";

type Capability = string; // e.g. "rental_objects.write", "bookings.approve", "nav.reports"
type FeatureFlag = string; // e.g. "feature.messaging", "feature.ratings"

type Context = {
  authenticated: boolean;
  tenantId: string;
  userId: string;

  roles: Role[];

  // union of all RBAC capabilities granted to this user (tenant-local)
  capabilities: Set<Capability>;

  // entitlements from subscription (plan)
  entitlements: Record<string, boolean>;

  // tenant feature flags (config)
  flags: Record<string, boolean>;

  // scopes
  scope: {
    rentalObjectIds?: Set<string>;
    backofficeOrgIds?: Set<string>;
    // minside membership orgs (only relevant in MinSide app context)
    membershipOrgIds?: Set<string>;
  };
};

type Target = {
  capability: Capability;      // the operation being requested
  feature?: FeatureFlag;       // optional module flag associated with operation
  resource?: {
    type: "RENTAL_OBJECT" | "BOOKING" | "ORG" | "INVOICE" | "MESSAGE" | "USER";
    id?: string;               // optional for list endpoints
    tenantId?: string;
  };
};

type Decision =
  | { allow: true; filter?: Record<string, unknown> } // filter for list endpoints
  | { allow: false; status: 401|403|404; code: "UNAUTHORIZED"|"FORBIDDEN"|"FEATURE_DISABLED"|"NOT_FOUND"; message: string };

function authorize(ctx: Context, t: Target): Decision {
  // 1) Auth required for protected endpoints
  if (!ctx.authenticated) {
    return deny(401, "UNAUTHORIZED", "Login required");
  }

  // 2) Tenant boundary (hide existence)
  if (!ctx.roles.includes("SAAS_ADMIN")) {
    if (t.resource?.tenantId && t.resource.tenantId !== ctx.tenantId) {
      return deny(404, "NOT_FOUND", "Not found");
    }
  }

  // 3) Feature gating: entitlement × tenant flag
  if (t.feature) {
    const entitled = ctx.entitlements[t.feature] ?? true;
    const enabled  = ctx.flags[t.feature] ?? true;
    if (!entitled || !enabled) {
      return deny(403, "FEATURE_DISABLED", `Feature disabled: ${t.feature}`);
    }
  }

  // 4) Capability gating (RBAC)
  // SAAS_ADMIN & KOMMUNE_ADMIN may be treated as implied all within their boundary
  if (ctx.roles.includes("SAAS_ADMIN")) return allowAll();
  if (ctx.roles.includes("KOMMUNE_ADMIN")) return allowAllTenant();

  if (!ctx.capabilities.has(t.capability)) {
    return deny(403, "FORBIDDEN", `Missing capability: ${t.capability}`);
  }

  // 5) Scope gating (ABAC-like)
  const r = t.resource;
  if (!r?.type) return { allow: true };

  // List endpoints: return server-side filter to enforce scope.
  if (!r.id) {
    return { allow: true, filter: scopeFilter(ctx, r.type) };
  }

  // Detail endpoints: must validate resource belongs to scope.
  const ok = resourceInScope(ctx, r.type, r.id);
  if (!ok) {
    // hide sensitive resources
    const hide = ["USER","ORG","INVOICE"].includes(r.type);
    return hide
      ? deny(404, "NOT_FOUND", "Not found")
      : deny(403, "FORBIDDEN", "Out of scope");
  }

  return { allow: true };
}

// Build filters for list endpoints
function scopeFilter(ctx: Context, type: Target["resource"]["type"]) {
  // For scoped roles, apply filters automatically.
  if (ctx.roles.includes("KOMMUNE_STAFF") || ctx.roles.includes("ORG_ADMIN") || ctx.roles.includes("ORG_MEMBER")) {
    if (type === "RENTAL_OBJECT") return { rentalObjectId: { in: [...(ctx.scope.rentalObjectIds ?? [])] } };
    if (type === "BOOKING")      return { rentalObjectId: { in: [...(ctx.scope.rentalObjectIds ?? [])] } };
    if (type === "ORG")          return { orgId: { in: [...(ctx.scope.backofficeOrgIds ?? [])] } };
  }

  if (ctx.roles.includes("END_USER_PRIVATE")) {
    if (type === "BOOKING") return { userId: ctx.userId };
  }

  if (ctx.roles.includes("END_USER_ORG_REP")) {
    if (type === "BOOKING") return { membershipOrgId: { in: [...(ctx.scope.membershipOrgIds ?? [])] } };
  }

  return {}; // no additional filter
}

// DB-backed check for detail endpoints
function resourceInScope(ctx: Context, type: string, id: string): boolean {
  // Implementation uses DB joins:
  // booking -> rentalObjectId -> assignment -> scope
  // message -> participants -> scope
  // etc.
  // Here we keep it conceptual.
  if (type === "RENTAL_OBJECT") return ctx.scope.rentalObjectIds?.has(id) ?? false;
  // bookings/invoices/messages require DB join to confirm underlying rentalObjectId/ownerId/orgId
  return dbJoinCheck(type, id, ctx);
}

function allowAll(): Decision { return { allow: true }; }
function allowAllTenant(): Decision { return { allow: true }; }

function deny(status: any, code: any, message: string): Decision {
  return { allow: false, status, code, message };
}

Key rule:
Server returns filters for list endpoints and uses DB joins for detail endpoints. UI never bypasses.

⸻

3) Feature flag registry (canonical)

Naming conventions
	•	Prefix with feature. for user-visible modules
	•	Prefix with integrations. for external connectors
	•	Prefix with ops. for operational sub-features
	•	Prefix with ui. for shell behavior (rare; still enforced server-side when relevant)

A) Core modules (Backoffice + MinSide + Web)
	•	feature.rental_objects
	•	feature.bookings
	•	feature.calendar
	•	feature.blocks_maintenance
	•	feature.recurring_bookings
	•	feature.season_rentals
	•	feature.pricing
	•	feature.economy_invoicing
	•	feature.reports_exports
	•	feature.messaging
	•	feature.notifications
	•	feature.ratings_reviews
	•	feature.favorites
	•	feature.help_support
	•	feature.global_search
	•	feature.audit_log
	•	feature.gdpr_tools (consents/DSAR/retention)

B) Integrations
	•	integrations.idporten
	•	integrations.bankid_signicat
	•	integrations.vipps
	•	integrations.email_provider
	•	integrations.sms_provider
	•	integrations.webhooks
	•	integrations.calendar_ics
	•	integrations.rco_access (if applicable)

C) Admin shell toggles (coupled to modules)
	•	ui.header_global_search (depends on feature.global_search)
	•	ui.header_notifications_bell (depends on feature.notifications)
	•	ui.sidebar_economy (depends on feature.economy_invoicing)
	•	ui.sidebar_reports (depends on feature.reports_exports)
	•	ui.sidebar_messaging (depends on feature.messaging)

Dependency rules (examples)
	•	feature.bookings requires feature.calendar
	•	feature.economy_invoicing requires feature.bookings
	•	feature.recurring_bookings requires feature.bookings
	•	feature.ratings_reviews requires feature.rental_objects
	•	feature.messaging requires feature.notifications (for delivery receipts / alerts)

⸻

4) Wireframes (ASCII / Mermaid) per dashboard

4.1 Backoffice shell (all Backoffice roles)

┌────────────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Global Search*]                [Bell*] [User Menu] │
│        *feature-flagged (search/bell)                               │
├───────────────┬────────────────────────────────────────────────────┤
│ Sidebar       │ PageHeader                                          │
│ - Dashboard   │  Title + Breadcrumbs            [Primary Action]    │
│ - Utleieobj.  │----------------------------------------------------│
│ - Bookinger   │ FilterBar: [Search][Status][Category][Date] [...]  │
│ - Kalender    │----------------------------------------------------│
│ - Org (BO)    │ DataTable (bulk select + actions toolbar)          │
│ - Brukere     │  Columns ... | Row actions: View/Edit/Archive ...  │
│ - Økonomi*    │----------------------------------------------------│
│ - Rapporter*  │ Pagination + Summary                               │
│ - System      │                                                    │
│ - Hjelp       │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
Rules: create/edit are separate pages (no modals). Dialog only confirm/info.

4.2 Kommune Admin dashboard (Mermaid)

flowchart TB
  A[Dashboard] --> B[Pending approvals]
  A --> C[Today: bookings + conflicts]
  A --> D[Operational alerts]
  A --> E[Quick links]
  E --> E1[Create rental object]
  E --> E2[View bookings]
  E --> E3[Organizations]
  E --> E4[Users & Access]
  A --> F[Widgets controlled by flags]
  F --> F1[Economy widget*]
  F --> F2[Messaging inbox*]
  F --> F3[Reports widget*]

4.3 MinSide shell (end-user)

┌───────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Search]                     [Bell] [Profile]  │
├───────────────────────────────────────────────────────────────┤
│ Tabs: [Privat] [Organisasjon] (membership org context switch) │
├───────────────────────────────────────────────────────────────┤
│ Dashboard: My bookings | Upcoming | Actions                    │
│ - New booking                                                   │
│ - My invoices*                                                  │
│ - Messages*                                                     │
│ - Consents / Privacy                                            │
│ - Help                                                         │
└───────────────────────────────────────────────────────────────┘

