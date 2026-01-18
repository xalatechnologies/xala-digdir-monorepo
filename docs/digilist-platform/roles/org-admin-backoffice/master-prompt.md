MASTER PROMPT PACK — BACKOFFICE ORGANIZATION ADMIN (Delegated Rental-Object Management)
Project: Digilist / Xala (Municipal multi-tenant booking SaaS)
Context: Backoffice Organization Admin is NOT MinSide. This user logs into Backoffice with scoped access to assigned rental objects, assigned by Tenant Admin / Backoffice Organization governance.

========================================================
0) NON-NEGOTIABLE RULES (UI + ARCH)
========================================================
- NO modal/dialog for create/edit/config/clone. These MUST be separate pages with breadcrumbs + page header. Tabs/wizards allowed.
- Dialogs only for confirm/info, DS-only: DsConfirmDialog + DsAlertDialog.
- NO raw HTML in pages. Pages compose DS components only (token-only).
- i18n keys only. SSR/hydration safe. URL-driven page modes.
- All data access via Client SDK + DAL hooks. No ad-hoc fetch in apps.
- Feature flags are capability-driven and MUST gate:
  sidebar items + routes + tabs + actions + form sections + API endpoints.
- Enforce same gating in API (RFC7807 FEATURE_DISABLED) and UI.
- Terminology: rental_object (never listing/facility). Backoffice organizations ≠ MinSide organizations.

========================================================
1) ROLE DEFINITION — ORGANIZATION ADMIN (BACKOFFICE)
========================================================
Goal: Enable delegated staff to operate assigned rental objects and day-to-day bookings without tenant governance capabilities.

Organization Admin can (scope-limited):
- View and manage ONLY assigned rental objects (assignment scope)
- Manage availability (blocks/closed periods) for assigned objects
- Manage bookings for assigned objects (view, approve/reject if permitted, reschedule/cancel if permitted)
- Use messaging for booking-related communication (if enabled)
- View limited reports/exports for assigned scope (if enabled)
- Manage organization members for their backoffice organization (if enabled by tenant policy)

Organization Admin cannot:
- Create/modify tenant-wide configuration
- Access non-assigned rental objects
- Manage tenant users outside organization scope
- Change subscription/plan entitlements

========================================================
2) REQUIRED CAPABILITIES (FEATURE FLAGS) — ORG ADMIN
========================================================
Define capabilities (computed: entitlements ∩ tenant toggles ∩ RBAC) and enforce everywhere.

Core:
- backoffice.orgAdmin.enabled
- rentalObjects.read.assigned
- rentalObjects.update.assigned
- bookings.read.assigned
- bookings.approve.assigned
- blocks.manage.assigned
- calendar.view.assigned

Optional modules:
- messaging.enabled
- messageTemplates.enabled
- pricing.enabled
- economy.invoicing.view.assigned
- reports.enabled
- exports.enabled
- audit.view.scoped
- help.enabled

Granular UI surfaces:
- nav.rentalObjects
- nav.bookings
- nav.calendar
- nav.blocks
- nav.messages
- nav.reports
- nav.economy
- nav.help

Tabs within rental object:
- rentalObjects.tabs.overview
- rentalObjects.tabs.rules
- rentalObjects.tabs.availability
- rentalObjects.tabs.pricing
- rentalObjects.tabs.assignments (usually hidden for org admin)
- rentalObjects.tabs.audit (scoped)

Actions:
- rentalObjects.actions.edit
- rentalObjects.actions.archive
- bookings.actions.approve
- bookings.actions.reject
- bookings.actions.reschedule
- bookings.actions.cancel
- messaging.actions.reply
- reports.actions.export

========================================================
3) BACKOFFICE SIDEBAR — ORG ADMIN (CANONICAL)
========================================================
Sidebar must be generated from capabilities. If disabled, fully removed (nav+routes+API).

[Overview]
- Dashboard

[Operations]
- Bookings
  - Pending
  - All
- Calendar (assigned scope)
- Blocks / Closed Periods (assigned scope)

[Catalog]
- Rental Objects (assigned scope)

[Comms] (feature-gated)
- Messages

[Economy] (feature-gated)
- Invoices (assigned scope)

[Reports] (feature-gated)
- Reports / Exports (assigned scope)

[Help & Support]
- Help

========================================================
4) ROUTES + PAGE TREES (PAGE-BASED CRUD ONLY)
========================================================
/backoffice
  /dashboard

  /rental-objects
    /                          (List - assigned only)
    /:id                       (Detail - assigned only)
    /:id/edit                  (Edit - assigned only, if allowed)
    /:id/availability          (Dedicated config page, optional)
    /:id/pricing               (Dedicated config page, feature-gated)

  /bookings
    /pending                   (Approvals queue - assigned only)
    /all                       (All bookings - assigned only)
    /:id                       (Detail tabs - assigned only)

  /calendar
    /                          (Calendar view, assigned only)
    /timeline                  (Optional)

  /blocks
    /                          (List - assigned only)
    /new                       (Create - page)
    /:id                       (Detail)
    /:id/edit                  (Edit)

  /messages (feature-gated)
    /                          (Inbox)
    /:conversationId           (Conversation page)

  /economy (feature-gated)
    /invoices                  (List)
    /invoices/:id              (Detail)

  /reports (feature-gated)
    /                          (Overview)
    /exports                   (Export center)

  /help
    /                          (Overview)
    /guides
    /faq
    /contact?                  (feature-gated)

========================================================
5) DASHBOARD WIREFRAME (WIDGET → QUERY → DTO)
========================================================
Dashboard is READ-ONLY overview. No editing on dashboard.

Widgets:
1) Work Queue: Pending bookings needing action
   - Query: GET /bookings?status=pending&scope=assigned&limit=10
   - DTO: BookingSummaryDTO[]
2) Assigned Rental Objects: status counts (published/draft/archived)
   - Query: GET /rental-objects/summary?scope=assigned
   - DTO: RentalObjectSummaryDTO
3) Today/This Week Calendar Preview
   - Query: GET /calendar/preview?range=week&scope=assigned
   - DTO: CalendarPreviewDTO
4) Operational Alerts (conflicts, maintenance, expiring blocks)
   - Query: GET /ops/alerts?scope=assigned
   - DTO: AlertDTO[]
5) Messages / Notifications (feature-gated)
   - Query: GET /notifications/unread-count
   - Realtime: WS events notification:new, message:new

========================================================
6) LIST PAGE TEMPLATE (REUSE DS COMPONENTS)
========================================================
For every list page (rental objects, bookings, blocks):
- DsPageShell
- DsPageHeader (titleKey + breadcrumbs + actions)
- DsToolbar (search + filters + bulk actions)
- DsDataTable (pagination, sorting, row actions)
Row actions:
- View → detail page
- Edit → edit page (if allowed)
- Archive/Delete → DsConfirmDialog only (if allowed)
NO inline edit. NO CRUD modals.

========================================================
7) RENTAL OBJECTS — ORG ADMIN (ASSIGNED SCOPE)
========================================================
List page:
- Search: by name, location, category
- Filters: status, type, category, availability window
- Bulk actions (optional): publish/unpublish if allowed, archive if allowed
Row actions:
- View
- Edit (if allowed)
- Availability (config page)
- Pricing (if enabled)
- Archive (confirm only)

Detail page tabs:
- Overview (read-only)
- Rules (read-only or editable based on capability)
- Availability (read-only snapshot, link to config page)
- Pricing (feature-gated)
- Audit (scoped, feature-gated)
Assignments tab should be hidden from org admin unless explicitly enabled.

Edit page:
- Tabbed form sections
- Save/Cancel top-right
- Validate via Zod schema, RFC7807 errors

========================================================
8) BOOKINGS — ORG ADMIN (ASSIGNED SCOPE)
========================================================
Pending list:
- Approve/reject (if allowed)
- Reject requires reason → if reason is complex, navigate to booking detail “Decision” tab (page section), not modal.
All bookings list:
- search + filters (date range, rental object, requester, status)
Booking detail tabs:
- Overview
- Timeline (optional)
- Decision (approve/reject/reschedule)
- Messages (if enabled)
- Audit (if enabled)

========================================================
9) BLOCKS / CLOSED PERIODS — ORG ADMIN
========================================================
Purpose: maintenance, closed periods, blackout times for assigned rental objects.
All create/edit flows are pages:
- /blocks/new
- /blocks/:id/edit
Fields:
- rentalObjectId (must be within assigned scope)
- time range
- reason
- visibility (public/internal)
- recurrence (optional)
Ensure calendar reflects blocks.

========================================================
10) MESSAGING (FEATURE-GATED)
========================================================
- If messaging.enabled:
  - Header bell/messages visible (capability-gated)
  - Sidebar Messages enabled
  - WS: message:new updates counts
- Conversations are page-based:
  - /messages → list
  - /messages/:id → thread
No composing in header dropdown. Dropdown may show read-only preview + “View all”.

========================================================
11) GLOBAL SEARCH (FEATURE-GATED)
========================================================
If header.globalSearch.enabled:
- Search indices allowed for org admin:
  - members (within org scope only)
  - rental objects (assigned only)
  - bookings (assigned only)
Selecting a result navigates to detail page. No edit from search UI.

========================================================
12) SECURITY & DATA SCOPE ENFORCEMENT
========================================================
Must enforce assigned scope in API + DB:
- Every query includes scope filter (assignment table join)
- RLS policies (or equivalent) ensure org admin cannot fetch outside scope
- API returns RFC7807 FORBIDDEN if not within scope
- UI must handle 403 as “Access denied” page.

========================================================
13) TESTING (MANDATORY)
========================================================
A) API tests
- org admin can fetch assigned rental objects
- org admin cannot fetch unassigned rental objects (403)
- approve/reject endpoints enforce permission + scope
- blocks enforce assigned rentalObjectId

B) Client SDK tests
- includes credentials, correct base URL
- returns RFC7807 typed errors
- capability gating helper returns correct visibility flags

C) Playwright E2E (org admin persona)
- login → sees limited sidebar
- rental objects list shows assigned only
- open rental object detail → tabs gated correctly
- edit navigates to separate page
- bookings pending → approve flow works
- blocks create/edit works on separate pages
- feature flag OFF hides nav+routes+tabs and blocks API calls

========================================================
14) DELIVERABLES REQUIRED FROM YOU (THE AI)
========================================================
1) Updated UI blueprint pages for Org Admin (docs/ui-blueprint/backoffice-org-admin/*.md)
2) Concrete route tree implementation plan
3) DS reusable component list + props needed for reuse
4) Capability registry additions for org admin surfaces
5) DTOs for dashboard widgets + list/detail pages (contract-first)
6) Test plan + initial Playwright specs

Start by auditing current repo:
- Identify existing backoffice role handling
- Find current rental objects and bookings pages
- Verify no modal-based CRUD exists; refactor to page-based if found
- Map current feature flags/capabilities and extend to new keys above
Then implement with minimal breaking changes.