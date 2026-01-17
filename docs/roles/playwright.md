Below is a Playwright E2E test matrix mapped to the Epics for Web, Backoffice, MinSide, SaaS Admin and all role contexts, with feature-flag coverage, auth/returnTo, RBAC, recurring/season conflicts + alternatives, and no-CRUD-modals enforcement.

Conventions

	•	Apps
	•	WEB = Public web
	•	BO = Backoffice
	•	MS = MinSide
	•	SAAS = SaaS Admin
	•	Roles
	•	WEB visitor, WEB authenticated user
	•	BO Tenant Super Admin (kommune-admin)
	•	BO Org Admin (backoffice org)
	•	BO Org Member (utleier/økonomi/operativ)
	•	MS End User (innbygger)
	•	MS Membership Org Representative (MinSide context)
	•	SAAS Super Admin (platform ops)
	•	Feature flags referenced in tests:
	•	mapView, pricing, payments, deposits, approvals, addOns, activities, recurringBookings, seasonRentals, messaging, ratingsReviews

⸻

0) Global E2E Gates (must pass for all apps)

GATE-G1 — Auth session stability + returnTo
	•	Covers: auth consistency, router guards, refresh persistence
	•	Applies: WEB, BO, MS, SAAS
	•	Steps
	1.	Visit a protected route while logged out
	2.	Expect redirect to /login?returnTo=...
	3.	Perform login (demo/OAuth stub)
	4.	Expect redirect back to original route
	5.	Refresh page → still authenticated
	•	Assertions
	•	Session endpoint 200 after login
	•	No redirect loop
	•	URL restored exactly (path + query)

GATE-G2 — “No CRUD modals” enforcement
	•	Applies: BO, SAAS (and MS if any CRUD-like forms)
	•	Steps
	•	Click “Create” / “Edit” in major modules
	•	Assertions
	•	Navigation goes to a new route page
	•	Breadcrumbs visible
	•	No modal overlay used for create/edit (only confirmation dialogs allowed)

GATE-G3 — Feature flag OFF removes module everywhere
	•	Applies: WEB, BO, MS, SAAS
	•	Steps
	1.	In SAAS (or test bootstrap), disable module flag (e.g., ratingsReviews=false)
	2.	Reload WEB/BO/MS
	•	Assertions
	•	Sidebar/menu item hidden
	•	Route returns 404/AccessDenied (not partially visible)
	•	API endpoints return 404/403 as designed

⸻

1) WEB (Public) — Test Matrix by Epic

EPIC W-1 Shell/Nav/Search/Auth

Test ID	Role	Scenario	Steps	Assertions
WEB-W1-01	Visitor	Navbar renders + primary links	Open home	Links visible, accessible labels
WEB-W1-02	Visitor	Global search typeahead	Type “hall”	Suggestions grouped by category; keyboard nav works
WEB-W1-03	Auth User	Profile dropdown + MinSide redirect	Login → open dropdown → click “Min Side”	Navigates to MS with session preserved
WEB-W1-04	Visitor	returnTo from booking checkout	Start booking → requires auth → login	Returns to same booking step

EPIC W-2 Discovery List/Grid/Map + Filters

Test ID	Role	Scenario	Steps	Assertions
WEB-W2-01	Visitor	List view default	Open /search	List view active
WEB-W2-02	Visitor	Switch to grid	Toggle view	Grid cards render, same results count
WEB-W2-03	Visitor	Map view flag	Enable/disable mapView	Map tab exists only when enabled
WEB-W2-04	Visitor	Category dynamic filters	Select category “Utstyr”	Filters adapt (no capacity filter if not relevant)

EPIC W-3 Details tabs + availability preview

Test ID	Role	Scenario	Steps	Assertions
WEB-W3-01	Visitor	Tabs are API-driven	Open details	Tabs match tabs[] from DTO
WEB-W3-02	Visitor	Availability statuses visible	Open availability tab	Busy/blocked/closed shown with tooltip reason
WEB-W3-03	Visitor	Activities tab conditional	Open “Arrangement” object	Activities tab present only when enabled/content exists

EPIC W-4 Booking Engine (Single/Range/All-day)

Test ID	Role	Scenario	Steps	Assertions
WEB-W4-01	Auth User	Single slot booking	Choose 1h slot → checkout	Price preview from server shown
WEB-W4-02	Auth User	Range booking w rules	Pick invalid range	UI blocks using API OUT_OF_RULES
WEB-W4-03	Auth User	All-day booking	Choose day(s)	Calendar uses day grid; min/max enforced

EPIC W-5 Recurring/Season conflicts + alternatives

Test ID	Role	Scenario	Steps	Assertions
WEB-W5-01	Auth User	Recurring weekly with conflict	Build recurrence (Sun 14:00, 3 months)	Preview returns conflicts; conflict rows visible
WEB-W5-02	Auth User	Accept suggestion per conflict	Click suggested alt (18:00)	Occurrence updated; strict would pass
WEB-W5-03	Auth User	Skip conflicting day	Mark skip	Confirm requires explicit skip (no silent drop)
WEB-W5-04	Auth User	Season booking preview	Select season period	Conflicts flagged; alternatives shown if supported

EPIC W-6 Approval/Deposit/Payment variants

Test ID	Role	Scenario	Steps	Assertions
WEB-W6-01	Auth User	Approval required	Submit booking	Status = PENDING_APPROVAL
WEB-W6-02	Auth User	Deposit required	Attempt submit without paying	Blocked; payment required first
WEB-W6-03	Auth User	Pay online immediate confirm	Pay flow stub	Status CONFIRMED; receipt link shown

EPIC W-7 Privacy/Consent

Test ID	Role	Scenario	Steps	Assertions
WEB-W7-01	Auth User	Visibility selection affects public calendar	Book with ANONYMOUS	Public availability shows “Reservert/Opptatt” only


⸻

2) BACKOFFICE — Test Matrix by Epic + Role

EPIC BO-1 Shell/Search/Help

Test ID	Role	Scenario	Steps	Assertions
BO-BO1-01	Tenant Admin	Sidebar items from flags+RBAC	Login	Only allowed items visible
BO-BO1-02	Org Admin	Global search respects scope	Search “Rental X”	Only org-assigned objects appear
BO-BO1-03	Org Member	Help TOC right sidebar	Open /help	TOC visible, highlights section

EPIC BO-3 Rental object management

Test ID	Role	Scenario	Steps	Assertions
BO-BO3-01	Tenant Admin	Create rental object page	Click “New”	Navigates to /rental-objects/new (not modal)
BO-BO3-02	Org Admin	Edit assigned rental object	Open object → edit	Allowed; breadcrumbs present
BO-BO3-03	Org Member	Forbidden edit	Attempt edit	AccessDenied (not login redirect)

EPIC BO-4 Calendar blocks/maintenance

Test ID	Role	Scenario	Steps	Assertions
BO-BO4-01	Org Admin	Create maintenance block	/calendar → new block	Block appears in calendar and affects availability
BO-BO4-02	Tenant Admin	Priority event block	Create priority block	Conflicts show in WEB recurring preview

EPIC BO-5 Booking approvals

Test ID	Role	Scenario	Steps	Assertions
BO-BO5-01	Org Member	View bookings list only	Open bookings	Sees list but no approve actions
BO-BO5-02	Org Admin	Approve booking	Open pending booking → approve	Status updated; audit event exists
BO-BO5-03	Tenant Admin	Bulk approve	Select multiple → approve	Works only with permission

EPIC BO-7 Messaging/templates

Test ID	Role	Scenario	Steps	Assertions
BO-BO7-01	Tenant Admin	Create template	/templates/new	Page route; preview/test-send works
BO-BO7-02	Org Admin	Template visibility by flag	Disable messaging	Templates menu hidden, route denied

EPIC BO-8 Users/RBAC scope

Test ID	Role	Scenario	Steps	Assertions
BO-BO8-01	Tenant Admin	Create tenant user & assign responsibilities	Create user → assign 10 rental objects	User sees only those objects
BO-BO8-02	Org Admin	Manage org members	Invite member	Member scoped to org only
BO-BO8-03	Org Member	No access to RBAC admin	Open /users	AccessDenied


⸻

3) MINSIDE — Test Matrix by Epic + Role

EPIC MS-1 Shell/Help

Test ID	Role	Scenario	Steps	Assertions
MS-MS1-01	End User	Sidebar baseline	Login	Bookings, messages, profile visible as flags allow
MS-MS1-02	End User	Help TOC	/help	Right TOC visible

EPIC MS-3 My bookings

Test ID	Role	Scenario	Steps	Assertions
MS-MS3-01	End User	Booking list statuses	Open “Mine bookinger”	Pending/confirmed/cancelled filters work
MS-MS3-02	End User	Booking details show context	Open booking	Shows PRIVATE vs MEMBERSHIP_ORG

EPIC MS-4 Membership org context

Test ID	Role	Scenario	Steps	Assertions
MS-MS4-01	Org Rep	Org list loaded from registry	Open org switch	Lists membership orgs only
MS-MS4-02	Org Rep	Book as org (discount)	Start booking via WEB → choose org	Price preview differs vs private

EPIC MS-5 Notifications/messaging

Test ID	Role	Scenario	Steps	Assertions
MS-MS5-01	End User	Real-time bell updates	Trigger admin message	Unread count updates via websocket

EPIC MS-6 Consent/privacy defaults

Test ID	Role	Scenario	Steps	Assertions
MS-MS6-01	End User	Set default visibility	Set PRIVATE default	Next booking defaults to PRIVATE


⸻

4) SAAS ADMIN — Test Matrix by Epic + Role

EPIC SA-1 Tenants + Subscriptions + Feature Flags

Test ID	Role	Scenario	Steps	Assertions
SA-SA1-01	SAAS Admin	Toggle module flag affects all apps	Disable ratings	WEB/BO/MS hide ratings
SA-SA1-02	SAAS Admin	Subscription plan sets feature bundle	Change plan	Feature set updates; apps rehydrate
SA-SA1-03	SAAS Admin	Tenant isolation	Switch tenant	Flags and data isolated

EPIC SA-2 Monitoring/health

Test ID	Role	Scenario	Steps	Assertions
SA-SA2-01	SAAS Admin	View health dashboard	Open monitoring	Shows API/DB status panels
SA-SA2-02	SAAS Admin	Incident log	Create incident	Visible; audit created


⸻

5) Role Coverage Summary (What each role must pass)

WEB Visitor
	•	W1-01, W1-02, W2-01..W2-04, W3-01..W3-03

WEB Auth User
	•	All WEB tests including W4..W7 + Auth Gate G1

BO Tenant Admin
	•	BO-BO1-01..03, BO-BO3-01, BO-BO4-02, BO-BO5-03, BO-BO7-01, BO-BO8-01, BO-BO9 (audit/reports if enabled), G2, G3

BO Org Admin
	•	BO-BO1-02..03, BO-BO3-02, BO-BO4-01, BO-BO5-02, BO-BO7-02, BO-BO8-02, G2, G3

BO Org Member
	•	BO-BO1-03, BO-BO3-03, BO-BO5-01, BO-BO8-03, G2, G3

MS End User
	•	MS-MS1-01..02, MS-MS3-01..02, MS-MS5-01, MS-MS6-01, G1, G3

MS Membership Org Rep
	•	MS-MS4-01..02 + MS baselines

SAAS Admin
	•	SA-SA1-01..03, SA-SA2-01..02, G3

⸻

6) Minimal Playwright Structure (recommended)
	•	tests/e2e/web/*.spec.ts
	•	tests/e2e/backoffice/*.spec.ts
	•	tests/e2e/minside/*.spec.ts
	•	tests/e2e/saas-admin/*.spec.ts
	•	tests/e2e/_shared/auth.ts (login helpers + returnTo)
	•	tests/e2e/_shared/flags.ts (toggle flags via SAAS or test bootstrap)
	•	tests/e2e/_shared/assertions.ts (no crud modals, breadcrumb check, DS smoke checks)