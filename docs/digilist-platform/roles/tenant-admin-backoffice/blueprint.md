Below is a rewritten UI Blueprint (as a set of canonical “files” you can copy into docs/ui-blueprint/) that enforces your rule:

✅ NO modals for create/edit/config
✅ All CRUD is page-based with breadcrumbs + page header + tabs/wizards
✅ Dialogs only for confirm/info and must come from DS

After that you’ll get Backoffice route + page tree examples (Tenant Admin first).

⸻

UI Blueprint (Rewritten)

docs/ui-blueprint/00-principles.md

Non-negotiable rules
	•	Create/Edit/Clone/Configure = separate page
	•	Must have: DsPageShell → DsPageHeader → DsBreadcrumbs
	•	Complex entities must use DsPageTabs and/or DsStepper
	•	Dialogs are not UI surfaces
	•	Allowed: DsConfirmDialog, DsAlertDialog only
	•	Not allowed: create/edit dialogs, drawers, quick-edit modals, inline editing
	•	Apps are thin
	•	App pages = composition only (DS components + hooks + DTOs)
	•	No raw HTML in pages (<div>, <button>, <form> etc.)
	•	Token-only design
	•	Only Digdir/Designsystemet tokens + extension token layer
	•	i18n first
	•	All text is i18n keys (including breadcrumbs, column headers, empty states)
	•	SSR/hydration safe
	•	Page state is URL-driven (mode/view/edit/new), not UI-driven

Canonical entity terminology
	•	rental_object = the bookable unit (never listing/facility)
	•	Backoffice organizations (tenant-controlled umbrella/partner orgs) ≠ MinSide organizations (user membership orgs loaded at sign-in)

⸻

docs/ui-blueprint/01-layouts.md

Layout shells
	•	DsAppShellBackoffice
	•	Top bar: tenant context + user menu + notifications badge (feature-gated)
	•	Left sidebar: module-gated nav
	•	Main: DsPageShell content region
	•	DsAppShellMinSide
	•	Top bar: identity context switch (private vs user-org if applicable)
	•	Simplified nav

Page skeleton (mandatory)

Every page must follow:
	1.	DsPageShell
	2.	DsPageHeader
	•	titleKey, subtitleKey?, breadcrumbs[], actions[]
	3.	Optional DsPageTabs (detail/edit pages)
	4.	Page content (tables/forms/cards)
	5.	Dialogs only for confirm/info (DS only)

⸻

docs/ui-blueprint/02-backoffice-dashboard.md

Page purpose

Tenant Admin overview of work that needs attention, with navigation to dedicated pages.

Must be read-only
	•	No create/edit inside dashboard
	•	Every action navigates to a page

Sections
	•	KPI row (click navigates to filtered list pages)
	•	Work queue (pending approvals)
	•	Calendar preview (navigates to calendar page)
	•	Risk/data quality cards (navigates to relevant pages)
	•	Organizations attention summary (navigates to orgs / assignments pages)
	•	Economy/messages/system blocks are feature-gated and navigate to full pages

Components
	•	DsKpiGrid, DsKpiCard
	•	DsDataTable (work queue)
	•	DsSectionCard blocks
	•	No forms, no modals

Feature gating
	•	messaging/economy/audit/system log appear only if enabled by plan + feature flags + permissions

⸻

docs/ui-blueprint/03-backoffice-rental-objects.md

Routes
	•	List: /backoffice/rental-objects
	•	Detail: /backoffice/rental-objects/:id
	•	Edit: /backoffice/rental-objects/:id/edit
	•	Create wizard: /backoffice/rental-objects/new
	•	Clone wizard: /backoffice/rental-objects/:id/clone

List page (Management List Page)

Structure:
	•	DsPageHeader actions:
	•	Primary: “New rental object” → /new
	•	Secondary: Export (feature-gated)
	•	DsToolbar:
	•	Search
	•	Filter bar (chips + advanced filters page section or drawer for filters only, not CRUD)
	•	Bulk actions (publish/archive/assign/export) feature-gated
	•	DsDataTable
	•	Row actions are navigation: View/Edit/Clone/Archive/Delete
	•	Archive/Delete require DsConfirmDialog only

Detail page

Tabs (example):
	•	Overview
	•	Rules
	•	Availability
	•	Pricing (feature-gated)
	•	Assignments (org assignment)
	•	Audit (feature-gated)

Actions:
	•	Edit → navigates to /edit
	•	Publish/archive are allowed as page actions (confirm dialog for destructive)

Edit page
	•	Same tabs as detail but with form sections
	•	Save/Cancel as page-level actions
	•	No inline editing inside tables unless it navigates to sub-edit pages

Wizard page (create/clone)
	•	DsStepper steps:
	1.	Basic info
	2.	Rules
	3.	Availability
	4.	Pricing (optional)
	5.	Review & Publish (optional)
	•	Each step is its own URL sub-route if desired:
	•	/new?step=rules or /new/rules

⸻

docs/ui-blueprint/04-backoffice-organizations.md

These are Backoffice Organizations (tenant-controlled umbrella orgs)

Routes
	•	List: /backoffice/organizations
	•	Detail: /backoffice/organizations/:id
	•	Edit: /backoffice/organizations/:id/edit
	•	Create: /backoffice/organizations/new

List page
	•	Bulk operations: activate/deactivate, export
	•	Row actions: view/edit/manage assignments/manage members

Detail page tabs
	•	Overview
	•	Assigned rental objects
	•	Members & access (feature-gated)
	•	Audit (feature-gated)

Assignments page (explicit)

If assignments are complex, make it a dedicated page:
	•	/backoffice/organizations/:id/assignments
	•	Avoid editing assignments inline inside list table.

⸻

docs/ui-blueprint/05-backoffice-members-access.md

Routes
	•	List: /backoffice/access/users
	•	Detail: /backoffice/access/users/:id
	•	Edit: /backoffice/access/users/:id/edit
	•	Invite wizard: /backoffice/access/invite

Page intent

Tenant Admin manages tenant-scoped access, not user identity org memberships (MinSide orgs are separate context).

Patterns
	•	Bulk actions are allowed
	•	Role/permission editing is page-based with tabs:
	•	Identity
	•	Roles
	•	Access scope (org assignment)
	•	Sessions
	•	Audit

⸻

docs/ui-blueprint/06-backoffice-bookings.md

Routes
	•	List: /backoffice/bookings
	•	Detail: /backoffice/bookings/:id
	•	Approvals queue: /backoffice/bookings/pending
	•	Calendar view: /backoffice/calendar

List page tabs (as routes, not internal state)
	•	/bookings/pending
	•	/bookings/approved
	•	/bookings/rejected
	•	/bookings/all

Actions
	•	Approve/reject allowed from list (confirm reject reason via page action or small DS prompt; if reason requires form, go to detail page)
	•	Modify/reschedule/cancel should be on detail pages (tabs/wizard if needed)

⸻

docs/ui-blueprint/10-component-inventory.md

Required reusable DS components (page-first)
	•	DsAppShellBackoffice, DsAppShellMinSide
	•	DsPageShell, DsPageHeader, DsBreadcrumbs
	•	DsPageTabs (tabs on detail/edit)
	•	DsStepper (wizards)
	•	DsToolbar, DsSearchInput, DsFilterBar, DsBulkActions
	•	DsDataTable, DsRowActions (navigation-based)
	•	DsSectionCard, DsKpiGrid, DsKpiCard
	•	DsConfirmDialog, DsAlertDialog (only dialogs allowed)

Explicitly forbidden patterns
	•	modal/drawer CRUD
	•	inline edit grids
	•	“quick edit” overlays

⸻

docs/ui-blueprint/11-i18n-keys.md

Rules
	•	Breadcrumb labels are keys
	•	Column headers are keys
	•	Empty states are keys
	•	No concatenation

Provide page key namespaces:
	•	backoffice.dashboard.*
	•	backoffice.rentalObjects.*
	•	backoffice.organizations.*
	•	backoffice.access.*
	•	backoffice.bookings.*

⸻

docs/ui-blueprint/12-ssr-hydration-guidelines.md

SSR-safe constraints
	•	Page mode derived from route:
	•	/new, /:id, /:id/edit etc.
	•	Search/filter state stored in URL query params
	•	No window reads during render
	•	Feature flags must be resolved before sidebar render:
	•	Render skeleton nav until capabilities loaded

⸻

Backoffice Routes + Page Trees

Below is a route tree you can implement in React Router (or Next routing) with consistent navigation.

Tenant Admin (Backoffice) route tree

/backoffice
  /dashboard

  /rental-objects
    /                   (List)
    /new                (Wizard)
    /:id                (Detail tabs)
    /:id/edit           (Edit tabs)
    /:id/clone          (Wizard)
    /:id/availability   (Optional dedicated config page)
    /:id/pricing        (Optional dedicated config page)
    /:id/assignments    (Optional dedicated config page)

  /organizations                 (Backoffice organizations)
    /                            (List)
    /new                         (Create page)
    /:id                         (Detail tabs)
    /:id/edit                    (Edit tabs)
    /:id/assignments             (Dedicated page)
    /:id/members                 (Dedicated page)

  /bookings
    /pending                      (List - approvals queue)
    /approved                     (List)
    /rejected                     (List)
    /all                          (List)
    /:id                          (Detail tabs)

  /calendar
    /                             (Calendar page)
    /timeline                      (Optional, feature-gated)

  /blocks
    /                             (List)
    /new                          (Create page)
    /:id                          (Detail)
    /:id/edit                     (Edit)

  /access
    /users                        (List)
    /users/:id                    (Detail)
    /users/:id/edit               (Edit)
    /invite                       (Wizard)
    /roles                        (Role catalog - feature-gated)
    /permissions                  (Permission catalog - feature-gated)

  /messages                        (Feature-gated)
    /                             (Inbox)
    /:conversationId              (Conversation)
  /message-templates               (Feature-gated)
    /                             (List)
    /new                          (Create page)
    /:id                          (Detail)
    /:id/edit                     (Edit)

  /economy                         (Feature-gated by plan)
    /invoices                      (List)
    /invoices/:id                  (Detail)
    /payments                      (List)
    /pricing-groups                (List)
    /pricing-groups/new            (Create)
    /pricing-groups/:id/edit       (Edit)

  /reports                         (Feature-gated)
    /                             (Overview)
    /exports                       (Export center)

  /governance
    /audit                         (Feature-gated)
    /system-log                    (Feature-gated)
    /incidents                     (Feature-gated)

  /settings
    /tenant                        (Always)
    /features                      (Tenant toggles within plan)
    /integrations                  (Feature-gated)

Page tree pattern examples

Rental Objects
	•	List → Detail → Edit
	•	List → New wizard
	•	Detail → Pricing (page) → Save → back to detail tab

Organizations
	•	List → Detail → Members (page)
	•	List → Detail → Assignments (page)

Bookings
	•	Pending approvals list → Booking detail page for complex actions
	•	Bulk approve allowed on list (confirm dialog only)
