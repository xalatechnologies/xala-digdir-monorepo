Below is a comprehensive, concept-level PRD for the Public Web Front-End of Digilist, written so it can be used both internally (engineering/design) and externally (tender / documentation).
It is UI-first, behavior-driven, contract-aware, and aligned with everything we have defined so far (rental object taxonomy, booking engine, recurring/season complexity, pricing groups, approvals, feature flags, design system rules).

⸻

📘 Product Requirements Document (PRD)

Digilist – Public Web Front-End (Innbygger / Public Booking)

Version: 1.0
Audience: Product, UX, Frontend, Backend, QA, Tender evaluators
Scope: Public-facing web application (search, discovery, booking, login handoff to MinSide)

⸻

1. Purpose & Goals

The Digilist public web front-end enables citizens, members, and organizations to:
	•	Discover bookable rental objects
	•	Understand availability, rules, and pricing
	•	Complete bookings (single, recurring, season, activities)
	•	Handle complex real-world constraints (conflicts, approvals, deposits)
	•	Seamlessly authenticate and continue flows via shared login

Key goals
	•	Clarity over complexity (no hidden logic)
	•	Consistent behavior across object types
	•	Predictable booking outcomes
	•	Zero business logic in UI (API-driven)
	•	Accessibility, performance, and trust

⸻

2. Core Concepts (Terminology)

Rental Object (Utleieobjekt)

Any bookable asset, grouped into three user-facing categories:
	1.	Lokaler og baner
(gyms, halls, meeting rooms, football fields, courts, arenas)
	2.	Arrangementer og tjenester
(activities, events, guided sessions, services)
	3.	Utstyr og kjøretøy
(equipment, vehicles, tools)

Each rental object defines:
	•	Booking policies
	•	Calendar behavior
	•	Pricing rules
	•	Approval & payment requirements
	•	Add-ons
	•	Privacy/visibility rules

⸻

3. Global Layout & Navigation

3.1 Top Navbar (Global)

Always visible

Left
	•	Logo (links to home)
	•	Primary navigation:
	•	Finn lokale
	•	Arrangementer
	•	Utstyr
	•	Kart (if enabled via feature flag)

Center
	•	🔍 Global Search Bar
	•	Unified search across:
	•	rental objects
	•	locations
	•	activities
	•	Typeahead with categories
	•	Keyboard accessible
	•	Results respect availability + feature flags

Right
	•	Login / Profile
	•	Language selector (nb / en)

⸻

3.2 Search Bar Behavior (Critical)

The search bar:
	•	Is context-agnostic
	•	Accepts free text
	•	Supports filters behind the scenes

Search results
	•	Grouped by category
	•	Show availability hint
	•	Clicking result navigates to details page

⸻

4. Authentication & User Menu

4.1 Logged-out State
	•	“Logg inn” button
	•	Booking allowed until checkout (auth-required step)

4.2 Logged-in State

Profile dropdown includes:
	•	Min Side (redirects to MinSide app)
	•	Mine bookinger
	•	Mine varsler
	•	Logg ut

Important
	•	Clicking Profile / Min Side always switches app context
	•	Public web never shows admin/member dashboards

⸻

5. Discovery Pages (List / Grid / Map)

5.1 View Types (User-switchable)
	•	List view (default)
	•	Grid / Card view
	•	Map view (feature-flagged)

User preference is persisted.

⸻

5.2 Filters (Left Sidebar / Drawer on mobile)

Filters are dynamic per category.

Common
	•	Category
	•	Location
	•	Date
	•	Availability
	•	Capacity
	•	Price range

Category-specific
	•	Lokaler og baner → surface type, indoor/outdoor
	•	Arrangementer → date/session type
	•	Utstyr → type, size, vehicle class

⸻

5.3 Result Cards

Each card shows:
	•	Image
	•	Name
	•	Category
	•	Short description
	•	Availability indicator
	•	Starting price / “Fra X kr”
	•	CTA: “Se detaljer”

⸻

6. Rental Object Details Page

6.1 Page Header
	•	Title
	•	Category badge
	•	Key facts (capacity, location)
	•	Primary CTA: “Book nå”

⸻

6.2 Tabs (Dynamic per object type)

Always present
	1.	Oversikt
	•	Description
	•	Images
	•	Key rules
	2.	Tilgjengelighet
	•	Calendar (read-only preview)
	•	Availability statuses
	3.	Regler & vilkår
	•	Usage rules
	•	Cancellation
	•	Approval/payment notes
	4.	Priser
	•	Price groups (private vs org)
	•	Surcharges
	•	Deposit info

Conditional
	•	Aktiviteter (for events/services)
	•	Tilleggstjenester
	•	FAQ
	•	Kart

Tabs are controlled by:
	•	rental object configuration
	•	feature flags

⸻

7. Booking Engine (Core of the Product)

7.1 Entry Point

User clicks “Book nå”

⸻

8. Booking Modes (Driven by BookingPolicy)

A rental object can expose one or more modes:
	1.	Enkelt booking (slot)
	2.	Tidsperiode (fra–til)
	3.	Hel dag
	4.	Gjentakende (ukentlig/daglig)
	5.	Sesongleie
	6.	Aktivitet / påmelding

User selects mode if multiple are enabled.

⸻

9. Calendar Types (UI must adapt)

Mode	Calendar Type
Slot	Time grid
Range	Range picker
All-day	Day grid
Recurring	Recurrence builder + preview
Season	Period selector
Activity	Session list/calendar


⸻

10. Availability & Status Handling

Each slot/day/session returns a status:
	•	AVAILABLE
	•	BUSY
	•	RESERVED
	•	BLOCKED
	•	CLOSED (holiday/off day)
	•	SURCHARGE
	•	OUT_OF_RULES

UI behavior:
	•	Unavailable slots disabled
	•	Conflicts visually marked
	•	Tooltips explain reasons

⸻

11. Recurring & Season Booking (Advanced)

11.1 Preview-First Rule

Recurring/season bookings must always show a preview before confirmation.

Preview includes:
	•	List of occurrences
	•	Status per occurrence
	•	Conflicts clearly marked

⸻

11.2 Conflict Handling

If conflicts exist:
	•	User is notified immediately
	•	Each conflicting date shows:
	•	reason
	•	alternative suggestions

Alternatives may include
	•	Same day, different time
	•	Different day, same time
	•	Closest valid option

User actions:
	•	Accept alternative
	•	Skip date
	•	Change pattern
	•	Abort booking

No silent drops.

⸻

12. Booking Context & Pricing

12.1 Who is booking?

User selects:
	•	Privat
	•	På vegne av organisasjon (membership org from MinSide)

Pricing updates accordingly.

⸻

13. Add-ons (Tilleggstjenester)
	•	Only add-ons attached to the rental object are selectable
	•	May be:
	•	optional
	•	required
	•	Prices update dynamically via API

⸻

14. Privacy & Consent

During booking:
	•	User chooses calendar visibility:
	•	Show title
	•	Show “Reservert”
	•	Anonymous

This affects public calendar rendering only.

⸻

15. Approval, Deposit & Payment Logic

Each rental object defines:
	•	Requires approval? (yes/no)
	•	Online payment allowed?
	•	Deposit required?

Possible flows
	1.	Pay → Confirm
	2.	Submit → Await approval
	3.	Pay deposit → Submit → Await approval

UI reflects the outcome clearly.

⸻

16. Authentication Gate

If user is not logged in:
	•	Flow state is preserved
	•	Redirect to shared login
	•	Return to same booking step

⸻

17. Confirmation & After-Booking

Success page includes:
	•	Reference number
	•	Status (confirmed / pending)
	•	Next steps
	•	Links to MinSide

Notifications triggered:
	•	Email
	•	SMS (if enabled)
	•	In-app (MinSide)

⸻

18. Feature Flags (Front-End Impact)

Feature flags control:
	•	Tabs
	•	Booking modes
	•	Map view
	•	Activities
	•	Messaging
	•	Ratings
	•	Payments

Flags are module-level and global, affecting:
	•	Public web
	•	Backoffice
	•	MinSide consistently

⸻

19. Design System & UX Rules (Non-Negotiable)
	•	Use Digdir Designsystemet + DS components
	•	No raw HTML
	•	No custom modals for CRUD
	•	Separate pages for steps
	•	Breadcrumbs everywhere
	•	Full localization support
	•	SSR-safe patterns only

⸻

20. Non-Goals (Explicit)
	•	No admin functionality on public web
	•	No manual pricing logic in UI
	•	No silent conflict resolution
	•	No user data leakage in calendars

⸻

21. Success Criteria
	•	Users understand availability before booking
	•	Conflicts are predictable and explainable
	•	Recurring bookings feel safe and transparent
	•	Same rules apply everywhere (web, backoffice, MinSide)
	•	Platform is demo-safe and production-ready