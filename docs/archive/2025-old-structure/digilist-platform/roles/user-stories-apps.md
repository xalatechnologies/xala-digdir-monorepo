Below is the same structure (Epics → User stories + Acceptance Criteria) for Backoffice and MinSide, split by role contexts and aligned with your org concept split:
	•	Backoffice organizations = tenant-controlled umbrella/partner orgs that manage assigned rental objects.
	•	MinSide organizations = membership orgs loaded at sign-in (Brønnøysund/registries), used only as booking context/discount context.

⸻

1) BACKOFFICE (Admin portal) — Epics, Stories, Acceptance Criteria

Roles in Backoffice (scope)
	•	Tenant Super Admin (Kommune-admin): full operational control inside tenant (not SaaS admin).
	•	Organization Admin (Backoffice org): manages their org’s assigned rental objects + users within org scope.
	•	Organization Member (Utleier/Økonomi/Operativ): limited tasks (bookings, calendar blocks, invoicing depending on permissions).

All access is controlled by RBAC + module feature flags.
No CRUD modals: add/edit pages are dedicated routes with breadcrumbs + headers.

⸻

EPIC BO-1 — Shell, Navigation, Global Search, Help

Goal: Consistent dashboard layout with reusable header/table patterns.

Stories + Acceptance Criteria

BO-1.1 Global header + sidebar
	•	AC:
	•	Sidebar items render based on (role permissions ∩ subscription feature flags).
	•	Header includes global search and notification bell if enabled.
	•	Breadcrumb + PageHeader present on every page.

BO-1.2 Global search
	•	AC:
	•	Search can return results for rental objects, bookings, users, orgs (as allowed).
	•	Results respect RLS scope (tenant/org boundaries).
	•	Keyboard navigation works; Enter opens details page.

BO-1.3 Help & Support
	•	AC:
	•	A “Hjelp” item exists in sidebar for all roles.
	•	Help pages include a right-side TOC like Tailwind docs.
	•	Help content is role-aware (only docs relevant to current role shown).

⸻

EPIC BO-2 — Authentication, Sessions, Role Switching (if applicable)

Goal: Stable auth with returnTo and session consistency.

Stories + Acceptance Criteria

BO-2.1 Protected routes
	•	AC:
	•	Visiting protected route while logged out redirects to login with returnTo.
	•	After login, user returns to the exact route.
	•	If session expires, user is redirected to login, and returnTo preserved.

BO-2.2 Access denied handling
	•	AC:
	•	If user authenticated but lacks permission, show AccessDenied screen (not login).
	•	AccessDenied includes explanation + link to help page.

⸻

EPIC BO-3 — Rental Objects (Utleieobjekter) Management

Goal: Full lifecycle CRUD and governance for assigned rental objects.

Stories + Acceptance Criteria

BO-3.1 List + filters
	•	AC:
	•	DataTable with filters: category, status, org, tags, availability mode.
	•	Bulk actions available only if permission rental_objects:bulk.
	•	Row actions: View, Edit, Clone, Archive (as permissions allow).

BO-3.2 Create/Edit pages
	•	AC:
	•	Dedicated route: /rental-objects/new, /rental-objects/:id/edit
	•	Sections/tabs for: metadata, booking policy, pricing groups, add-ons, rules, media, publishing.
	•	Save validates server-side; errors shown as RFC7807.

BO-3.3 Booking policy configuration
	•	AC:
	•	Admin can set booking modes: single/range/all-day/recurring/season/activity.
	•	Admin can set constraints: slot durations, min/max, min notice, max ahead.
	•	UI displays “effective policy summary” from API.

BO-3.4 Add-ons binding
	•	AC:
	•	Admin can attach add-ons to rental object (optional/required).
	•	Only attached add-ons appear in public checkout.

⸻

EPIC BO-4 — Calendar Operations (Blocks, Maintenance, Overrides)

Goal: Operational control over availability.

Stories + Acceptance Criteria

BO-4.1 Calendar view
	•	AC:
	•	Supports views: day/week/month/timeline (flag controlled).
	•	Shows statuses: busy, reserved, blocked, closed, surcharge.
	•	Clicking an entry opens details page (not modal editing).

BO-4.2 Create blocks / maintenance
	•	AC:
	•	Create block via dedicated page: /calendar/blocks/new
	•	Block types: maintenance, event priority, closed day override.
	•	Blocks immediately reflected in availability API.

⸻

EPIC BO-5 — Bookings Workflow (Approve/Reject/Payments/Deposits)

Goal: Handle booking lifecycle including approvals and payments.

Stories + Acceptance Criteria

BO-5.1 Booking lists
	•	AC:
	•	Tabs: Pending, Confirmed, Cancelled, All.
	•	Filters: rental object, org, date range, status, payment status.
	•	Bulk approve/reject is permission-gated.

BO-5.2 Approve/Reject
	•	AC:
	•	Approve/reject on a dedicated booking details route.
	•	Reject requires a reason (template-enabled if messaging flag).
	•	Audit event written for every status change.

BO-5.3 Deposit / payment status
	•	AC:
	•	Booking shows payNow/payLater, deposit amount, captured/refunded state.
	•	If deposit required before submission, booking cannot reach pending without it.

⸻

EPIC BO-6 — Pricing Groups & Rules

Goal: Manage price groups and object pricing logic.

Stories + Acceptance Criteria

BO-6.1 Pricing groups CRUD
	•	AC:
	•	Create/edit on pages with breadcrumbs.
	•	Group types include private user groups and org-based discounts.
	•	Price group changes versioned and audit logged.

BO-6.2 Pricing preview
	•	AC:
	•	Admin can run a price preview for a rental object (select context + slot).
	•	Preview shows breakdown: base, discounts, surcharges, add-ons, deposit.

⸻

EPIC BO-7 — Messaging, Notifications, Templates

Goal: Communication across bookings and operational alerts.

Stories + Acceptance Criteria

BO-7.1 Templates
	•	AC:
	•	Create/edit/preview/test-send templates by type:
confirmation, reminder, rejection, change.
	•	Template naming conventions supported.
	•	Flag-controlled visibility.

BO-7.2 Notification center
	•	AC:
	•	Bell icon shows unread count via websocket.
	•	User can view notification list and mark read.

⸻

EPIC BO-8 — Users, Roles, Permissions (Tenant + Org scope)

Goal: Assign roles and responsibilities inside tenant and org.

Stories + Acceptance Criteria

BO-8.1 Tenant users
	•	AC:
	•	Tenant admin can create/manage tenant users (invite, disable).
	•	Assign RBAC permissions (role + overrides).
	•	Assign responsibility scopes (e.g., responsible for specific rental objects).

BO-8.2 Org users
	•	AC:
	•	Org admin can manage org members (within org scope).
	•	Permissions limited by tenant policies.

⸻

EPIC BO-9 — Reporting & Audit/Logs

Goal: Tender-friendly traceability and monitoring.

Stories + Acceptance Criteria

BO-9.1 Audit log
	•	AC:
	•	Every critical action writes an audit event.
	•	Audit UI searchable/filterable.
	•	Export available if enabled.

BO-9.2 Reports
	•	AC:
	•	Core reports available: usage, revenue, occupancy, approvals.
	•	Exports: CSV (Excel optional).
	•	Scheduled reports via feature flag.

⸻

2) MINSIDE (User portal) — Epics, Stories, Acceptance Criteria

Roles in MinSide (scope)
	•	End User (Innbygger)
	•	Membership Org Representative (MinSide org context only, for booking context + discounts)

MinSide does not manage backoffice organizations.
It surfaces membership orgs and allows users to act “on behalf of” them during booking.

⸻

EPIC MS-1 — Shell, Navigation, Help (TOC)

Goal: Simple dashboard with role-aware content.

Stories + Acceptance Criteria

MS-1.1 Sidebar
	•	AC:
	•	Items: Dashboard, Mine bookinger, Kalender, Meldinger, Varsler, Profil, Preferanser, Hjelp.
	•	Items appear based on feature flags and user capabilities.

MS-1.2 Help pages with right TOC
	•	AC:
	•	Help section exists for all users.
	•	Help pages have right-side TOC and highlight current heading.

⸻

EPIC MS-2 — Authentication + App Switching

Goal: Seamless handoff from Web and back.

Stories + Acceptance Criteria

MS-2.1 Return-to flow
	•	AC:
	•	If user starts booking in Web and logs in, they resume Web flow.
	•	If user clicks “MinSide” from Web, session continues without re-login.

⸻

EPIC MS-3 — My Bookings & Status Tracking

Goal: User can view, modify, cancel, and track approvals.

Stories + Acceptance Criteria

MS-3.1 Booking list
	•	AC:
	•	Filters by status: pending approval, confirmed, cancelled.
	•	Shows payment status and deposit status if applicable.

MS-3.2 Booking details
	•	AC:
	•	Shows booking context (private vs membership org).
	•	Shows visibility setting (public title vs private).
	•	Shows audit-ish timeline of changes relevant to user.

⸻

EPIC MS-4 — Membership Org Context (Brreg-loaded)

Goal: Let user act as organization representative in booking context.

Stories + Acceptance Criteria

MS-4.1 Switch booking context
	•	AC:
	•	User can select “Privat” or choose one membership org.
	•	Selected context affects price previews and invoices.

MS-4.2 Org visibility
	•	AC:
	•	Only membership orgs returned from registry are shown.
	•	Role in org (leader/member) displayed (if provided).

⸻

EPIC MS-5 — Notifications & Messaging

Goal: User communication for approvals, reminders, updates.

Stories + Acceptance Criteria

MS-5.1 Notifications
	•	AC:
	•	Real-time via websocket when enabled.
	•	Can mark read.
	•	Deep links go to booking details.

MS-5.2 Messaging
	•	AC:
	•	Conversations tied to booking (optional).
	•	Templates used by admin trigger messages visible here.

⸻

EPIC MS-6 — Profile, Consent, Privacy Controls

Goal: Manage GDPR consent, calendar visibility defaults, and account data.

Stories + Acceptance Criteria

MS-6.1 Consents
	•	AC:
	•	User can view/update consents.
	•	DSAR entry points exist (download/delete requests) if enabled.

MS-6.2 Calendar visibility defaults
	•	AC:
	•	User can set default visibility preference for bookings.
	•	Booking checkout can override per booking.

⸻

EPIC MS-7 — Payments & Invoices

Goal: Allow user to see invoices and payment links.

Stories + Acceptance Criteria

MS-7.1 Invoices list
	•	AC:
	•	Shows open/paid/refunded.
	•	Payment link shown if pay-online enabled.

⸻

3) Cross-App Acceptance Rules (Global)
	1.	Feature flags are module-based and global
	•	Turning off “ratings” disables it in Web + Backoffice + MinSide (routes, menus, UI, API access).
	2.	No CRUD modals
	•	Create/edit actions are always dedicated routes with PageHeader + breadcrumbs.
	3.	Design system only
	•	All pages use DS components/tokens, i18n, SSR-safe patterns.
	4.	Contract-first
	•	UI renders tabs/fields/flows based on DTOs (BookingPolicy, PaymentPolicy, Tabs).