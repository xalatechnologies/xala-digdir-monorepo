MASTER PROMPT — UI BLUEPRINT + WIREFRAMES + REUSABLE DS COMPONENTS
Project: Digilist / Xala (Municipal multi-tenant SaaS)

CRITICAL UX RULE (NON-NEGOTIABLE)
--------------------------------
❌ DO NOT use modals/dialogs for:
- Create
- Edit
- Update
- Clone
- Configure
- Complex detail views

✅ ONLY use dialogs for:
- Confirmation alerts (delete, archive, irreversible actions)
- Informational alerts (success, warning, error)
- These dialogs MUST come from the Design System (DS) only.

ALL create/edit/configure flows MUST be:
- Separate full pages
- With proper Page Header
- With Breadcrumbs
- With Tabs (if multiple sections)
- With Step-by-step Wizards (when appropriate)

No exceptions.

========================================================
OBJECTIVE
========================================================
Create ONE canonical UI blueprint that:
1) Defines consistent page-based CRUD patterns (Backoffice + MinSide)
2) Prevents modal-driven CRUD antipatterns
3) Forces reuse of Design System components and tokens only
4) Is SSR/hydration-safe and localization-first
5) Makes UI implementation predictable, fast, and enterprise-grade

========================================================
GLOBAL UI STRUCTURE (MANDATORY)
========================================================
Every non-trivial page MUST follow this structure:

1) <DsPageShell>
2) <DsPageHeader>
   - title (i18n key)
   - subtitle (optional, i18n key)
   - breadcrumbs (always present)
   - primary / secondary actions
3) <DsPageTabs> (ONLY if multiple logical sections)
4) Page content (tables, forms, summaries)
5) <DsConfirmDialog> ONLY for confirmations

NO inline editing.
NO modal forms.
NO floating edit panels.

========================================================
CANONICAL PAGE TYPES (LOCKED)
========================================================

TYPE A — Management List Page (Backoffice)
Used for:
- Rental Objects list
- Back-office Organizations list
- Members & Access list
- Bookings list
- Invoices list

Structure:
- PageHeader
- Toolbar (search, filters, bulk actions)
- DataTable
- Row actions:
  - View details → navigates to detail page
  - Edit → navigates to edit page
  - Clone → navigates to wizard page
  - Archive/Delete → confirmation dialog ONLY

Example routes:
- /backoffice/rental-objects
- /backoffice/rental-objects/:id
- /backoffice/rental-objects/:id/edit
- /backoffice/rental-objects/new

--------------------------------------------------------

TYPE B — Detail / Edit Page (Backoffice)
Used for:
- View rental object
- Edit rental object
- Configure pricing
- Configure availability rules
- Manage organization details

Structure:
- PageHeader (with breadcrumbs back to list)
- PageTabs:
  - Overview
  - Rules
  - Pricing
  - Availability
  - Audit (if enabled)
- Each tab is a full page section
- Save actions are page-level (top-right)

--------------------------------------------------------

TYPE C — Wizard Page (Create / Clone / Complex Config)
Used for:
- Create rental object
- Clone rental object
- Complex configuration flows

Structure:
- PageHeader
- <DsStepper>
- Steps:
  1) Basic info
  2) Rules
  3) Pricing
  4) Review & publish
- Explicit Back / Next navigation
- No hidden auto-save

--------------------------------------------------------

TYPE D — Dashboard Pages
Used for:
- Tenant Admin Dashboard
- MinSide Dashboard

Rules:
- Dashboards are READ-ONLY overview surfaces
- No editing from dashboards
- Actions always navigate to dedicated pages

========================================================
DIALOG / ALERT RULES (VERY STRICT)
========================================================
Allowed dialogs:
- <DsConfirmDialog> (delete, archive, irreversible actions)
- <DsAlertDialog> (info, warning, error)

Not allowed:
- Create dialogs
- Edit dialogs
- “Quick edit” dialogs
- Drawer-based CRUD

========================================================
DESIGN SYSTEM USAGE (MANDATORY)
========================================================
- NO raw HTML (<div>, <button>, <form>) in app pages
- Pages MUST be composed ONLY from:
  - DS layout components
  - DS form components
  - DS table components
- Styling ONLY via design tokens
- If a token is missing:
  - Extend via DS extension layer
  - Document it
  - Ensure Digdir + WCAG compliance

========================================================
REUSABLE DS COMPONENTS (PAGE-ORIENTED)
========================================================
Required DS components (page-first, not modal-first):

- DsPageShell
- DsPageHeader
- DsBreadcrumbs
- DsPageTabs
- DsToolbar
- DsSearchInput
- DsFilterBar
- DsDataTable
- DsRowActions (navigation-based)
- DsStepper
- DsFormSection
- DsConfirmDialog
- DsAlertDialog
- DsKpiGrid / DsKpiCard

Each component must:
- Accept i18n keys (never raw strings)
- Be SSR-safe
- Be feature-flag aware
- Be permission-aware

========================================================
SSR / HYDRATION RULES
========================================================
- No conditional rendering that differs server vs client
- No window/localStorage access during render
- Page routing must determine mode (view/edit/new)
- Dialog open state must always default closed on SSR

========================================================
LOCALIZATION RULES
========================================================
- All labels, titles, actions use i18n keys
- Breadcrumbs also localized
- No concatenated strings
- Dates, currency, numbers localized

========================================================
FEATURE FLAGS & PERMISSIONS
========================================================
- Feature flags control page availability AND navigation
- If feature disabled:
  - Sidebar item hidden
  - Routes disabled
  - API calls blocked
- Permissions control actions within pages

========================================================
OUTPUT REQUIRED
========================================================
1) Updated wireframes reflecting PAGE-BASED CRUD only
2) Explicit rejection of modal CRUD in docs
3) Example:
   - Rental Objects List Page
   - Rental Object Edit Page (tabs)
   - Rental Object Create Wizard
4) PR checklist enforcing:
   - No modal CRUD
   - Proper breadcrumbs
   - Page headers present
   - DS-only components