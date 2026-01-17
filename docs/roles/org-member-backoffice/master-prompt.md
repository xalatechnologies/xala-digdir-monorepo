MASTER PROMPT PACK — BACKOFFICE ORGANIZATION MEMBER
Role examples: Utleier, Økonomiansvarlig, Operativ saksbehandler
Context: This user logs into BACKOFFICE (NOT MinSide).
Scope: Strictly limited to assigned rental objects and explicitly granted duties.
They DO NOT govern organizations, users, or tenant configuration.

========================================================
0) ABSOLUTE RULES (REPEAT & ENFORCE)
========================================================
- Page-based CRUD only. NO modal/dialog for create/edit/update.
- Dialogs allowed ONLY for confirm/info (DS-only).
- NO raw HTML in pages. DS components + tokens only.
- i18n keys only. SSR/hydration safe.
- Feature flags + permissions MUST gate:
  sidebar items, routes, tabs, buttons, fields, AND API access.
- Organization Member can NEVER escalate scope themselves.
- Terminology is locked: rental_object, backoffice organization.
- Assigned scope is enforced in DB + API + SDK + UI.

========================================================
1) ROLE DEFINITION — ORGANIZATION MEMBER (BACKOFFICE)
========================================================
Organization Member is an operational role.
They perform day-to-day tasks on assigned rental objects ONLY.

Typical personas:
- Utleier (operational rental handler)
- Økonomiansvarlig (finance & invoicing, scoped)
- Saksbehandler (case handling, approvals, communication)

Organization Member CAN:
- View assigned rental objects (read-only by default)
- View and process bookings for assigned objects (if permitted)
- Approve/reject bookings (if permitted)
- Communicate with end users about bookings (if enabled)
- View invoices and payment status (if finance-enabled)
- Export limited reports (if enabled)

Organization Member CANNOT:
- Create or edit rental objects
- Assign rental objects
- Manage blocks/availability unless explicitly allowed
- Manage users or roles
- Change pricing rules unless explicitly allowed
- Access tenant-wide or organization-wide configuration
- Access audit/system logs unless explicitly allowed

========================================================
2) CAPABILITY REGISTRY — ORGANIZATION MEMBER
========================================================
Capabilities are the ONLY source of truth.

Base:
- backoffice.orgMember.enabled
- rentalObjects.read.assigned
- bookings.read.assigned
- calendar.view.assigned
- help.enabled

Operational (toggle per member):
- bookings.approve.assigned
- bookings.reject.assigned
- bookings.reschedule.assigned
- bookings.cancel.assigned

Communication:
- messaging.enabled
- messaging.reply.enabled

Finance (økonomi):
- economy.invoices.read.assigned
- economy.invoices.export.assigned

Reporting:
- reports.read.assigned
- exports.enabled

Availability (rare, explicit):
- blocks.read.assigned
- blocks.manage.assigned

UI surfaces:
- nav.dashboard
- nav.bookings
- nav.calendar
- nav.messages
- nav.economy
- nav.reports
- nav.help

========================================================
3) SIDEBAR — ORGANIZATION MEMBER (MINIMAL)
========================================================
Sidebar MUST be minimal to avoid cognitive overload.

[Overview]
- Dashboard

[Work]
- Bookings
- Calendar

[Communication] (feature-gated)
- Messages

[Economy] (feature-gated)
- Invoices

[Reports] (feature-gated)
- Reports / Exports

[Help]
- Help & Support

Anything else is hidden.

========================================================
4) ROUTES + PAGE TREE (STRICT)
========================================================
/backoffice
  /dashboard

  /bookings
    /                          (Assigned bookings list)
    /pending                   (If approvals enabled)
    /:id                       (Detail view, tabbed)

  /calendar
    /                          (Assigned rental objects only)

  /messages (feature-gated)
    /                          (Inbox)
    /:conversationId           (Thread)

  /economy (feature-gated)
    /invoices
    /invoices/:id              (Read-only)

  /reports (feature-gated)
    /                          (Read-only)
    /exports                   (If allowed)

  /help
    /                          (Overview)
    /guides
    /faq

NO:
- rental object edit pages
- organization pages
- user management pages
- system pages

========================================================
5) DASHBOARD — ORG MEMBER (READ-ONLY)
========================================================
Dashboard is task-oriented, not administrative.

Widgets:
1) My Pending Tasks
   - Pending approvals (if enabled)
   - Query: GET /bookings?status=pending&scope=assigned
2) Today / This Week
   - Calendar preview
   - Query: GET /calendar/preview?scope=assigned
3) Messages
   - Unread count (if enabled)
4) Finance alerts
   - Unpaid invoices / upcoming due (if finance-enabled)

NO editing actions on dashboard.

========================================================
6) BOOKINGS — ORG MEMBER
========================================================
List page:
- Search: rental object, requester, date
- Filters: status, date range
Row actions:
- View (always)
- Approve / Reject (only if capability enabled)

Booking detail (tabs):
- Overview (always)
- Timeline (read-only)
- Decision (only if approve/reject enabled)
- Messages (if enabled)

Decision rules:
- Reject requires reason
- Reason entry is part of Decision tab (page), NOT modal

========================================================
7) CALENDAR — ORG MEMBER
========================================================
Calendar is READ-ONLY unless explicitly granted.

Shows:
- Assigned rental objects
- Booked slots
- Blocks (read-only)
- Status colors

NO:
- drag/drop editing
- block creation
- pricing overlays

========================================================
8) MESSAGING — ORG MEMBER (OPTIONAL)
========================================================
If messaging.enabled:
- Header bell visible
- Sidebar Messages visible
- Inbox list page
- Thread page with reply box (if reply enabled)

No template management.
No broadcast messages.
No system messages.

========================================================
9) ECONOMY — ORG MEMBER (ØKONOMIANSVARLIG)
========================================================
If economy enabled:
- Invoices list (assigned scope)
- Invoice detail (read-only)
- Export CSV/PDF (if allowed)

NO:
- invoice creation
- payment configuration
- pricing changes

========================================================
10) GLOBAL SEARCH (OPTIONAL, LIMITED)
========================================================
If enabled:
- Search scope:
  - bookings (assigned only)
  - rental objects (assigned only, read-only)
Selecting result navigates to detail page.

========================================================
11) SECURITY & SCOPE ENFORCEMENT
========================================================
- Every API query enforces assignment scope
- RLS / WHERE clauses MUST block cross-scope access
- Unauthorized access → RFC7807 FORBIDDEN
- UI shows AccessDenied page, not empty states

========================================================
12) TESTING REQUIREMENTS
========================================================
API:
- org member cannot fetch unassigned data
- approve endpoint blocked without permission
- economy endpoints blocked without capability

SDK:
- hooks return typed RFC7807 errors
- capability helpers hide UI consistently

E2E (Playwright):
- sidebar minimal
- no rental object edit pages accessible
- booking approve only when enabled
- calendar read-only
- feature flag OFF removes nav + routes

========================================================
13) AI DELIVERABLES EXPECTED
========================================================
- UI blueprint markdown:
  docs/ui-blueprint/backoffice-org-member/*.md
- Capability registry entries
- Route guards & examples
- DTOs for dashboard widgets + booking views
- Playwright test specs
- Verification that no modal CRUD exists

Start with repo audit:
- Verify current org member handling
- Identify overexposed routes
- Lock down menus + API
- Refactor any modal CRUD to pages
Implement with minimal breaking changes.