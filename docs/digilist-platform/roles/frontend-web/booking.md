Perfect — this adds the missing “real-world complexity layer”: recurring/season flows, privacy/consent on calendar visibility, identity-based pricing (private vs membership org), add-ons bound to the rental object, and approval/payment/deposit combinations.

Below is the complete booking-engine conception (public → checkout → auth → create booking) that fits your model.

⸻

1) Booking modes (now complete)

Every rental object exposes a BookingPolicy that allows one or more booking modes:

Booking modes
	1.	SINGLE_SLOT (fixed slot, e.g. 1h/2h)
	2.	RANGE (start/end, min/max duration)
	3.	ALL_DAY (daily booking, full day)
	4.	RECURRING
	•	Recurring daily/weekly pattern (e.g. every Tue 18–20 for 12 weeks)
	•	Must support partial conflicts (some occurrences fail)
	5.	SEASON_RENTAL (season allocation / long lease period)
	6.	ACTIVITY_REGISTRATION (sessions + capacity)

Category decides defaults, but booking policy is the truth.

⸻

2) Privacy/consent: “Calendar visibility” (critical)

Users must be able to control whether their booking label/details are visible to others.

Calendar visibility levels (per booking)
	•	PUBLIC_TITLE: show title (e.g. “Bursdag”)
	•	PRIVATE_TITLE: show “Opptatt” (hide title)
	•	ANONYMOUS: show only “Reservert” (no metadata)

Rule
	•	Visibility is selected during checkout.
	•	It must be enforced by API when serving public availability:
	•	Public calendar never returns PII.
	•	Even “PUBLIC_TITLE” is limited to safe text, and only when allowed.

Consent UI
	•	A checkbox/selector in checkout:
“Vis tittel i offentlig kalender?” → [Ja / Nei / Vis kun opptatt]

⸻

3) Booking flow (step-by-step, contract-first)

Step 0: Entry

User comes from:
	•	list page filters → details page
	•	direct share link
	•	deep link from MinSide

Step 1: Choose booking type (only if multiple enabled)
	•	“Enkeltbooking”
	•	“Gjentakende”
	•	“Hel dag”
	•	“Sesongleie”
	•	“Påmelding” (activities)

Step 2: Choose time(s)

Calendar type depends on booking mode:
	•	SINGLE_SLOT → slot grid
	•	RANGE → start/end with validation preview
	•	ALL_DAY → day grid
	•	RECURRING → recurrence builder + preview calendar
	•	SEASON → season selection (periods + rules)
	•	ACTIVITY → sessions list/calendar

Step 3: Identify who is booking (pricing context)

If user is logged in:
	•	Choose booking context:
	•	Privat
	•	På vegne av organisasjon (MinSide membership orgs)
	•	The chosen context affects:
	•	pricing group / discounts
	•	invoice recipient
	•	approval requirements (optional)

If user is NOT logged in:
	•	save flow context + returnTo
	•	redirect to shared login
	•	resume at same step

Step 4: Add booking details
	•	Purpose/title (optional)
	•	Notes to admin (optional)
	•	Privacy/visibility settings (mandatory selector)

Step 5: Add-ons (additional services)

The add-ons list is restricted to the rental object’s configured add-ons.
	•	per booking
	•	per hour/day
	•	per participant (activities)
	•	can be required or optional

Step 6: Price preview + confirmation

API returns a pricing breakdown:
	•	base price by price group
	•	discounts (org/user group)
	•	surcharges (holiday/peak)
	•	add-ons
	•	deposit/reservation fee (if any)
	•	total now vs total later (if approval)

Step 7: Payment / approval decision path

Behavior is determined by policy:

A) Instant pay + auto-confirm
	•	user pays full amount
	•	booking created as CONFIRMED

B) Requires approval (no upfront payment)
	•	booking created as PENDING_APPROVAL
	•	no payment collected now

C) Requires approval + deposit/reservation fee
	•	user must pay deposit/reservation fee first
	•	then booking is submitted as PENDING_APPROVAL
	•	if rejected:
	•	deposit refund policy applies (configurable)

D) No approval + deposit required
	•	deposit paid
	•	booking created as CONFIRMED
	•	remaining amount collected later (optional invoicing)

Step 8: Post-create
	•	success page with:
	•	booking reference
	•	status (confirmed/pending)
	•	receipts/invoice details
	•	notifications triggered (email/SMS/in-app)

⸻

4) Recurring bookings: preview + partial conflicts

Recurring is never “blind create”.

Required recurring flow
	1.	User builds recurrence:
	•	frequency: daily/weekly
	•	interval: every 1/2 weeks
	•	days of week
	•	time window (slot or range)
	•	end rule: end date or number of occurrences
	2.	API returns preview:
	•	list of occurrences
	•	per occurrence availability status
	•	per occurrence price
	•	conflicts grouped and explained
	3.	User chooses handling strategy:
	•	Strict: fail if any conflict
	•	Flexible: create only valid occurrences
	•	Replace (admin-only usually): propose override (if allowed)

Output
	•	booking series object (parent)
	•	child bookings per occurrence
	•	each child has its own status and price

⸻

5) Availability statuses (expanded)

For any calendar (slot/day/range/session), API returns:
	•	AVAILABLE
	•	BUSY (confirmed)
	•	RESERVED (temporary hold)
	•	BLOCKED (maintenance/admin)
	•	CLOSED (holiday/off day)
	•	SURCHARGE (available but extra price)
	•	REQUIRES_APPROVAL (selectable but will be pending)
	•	OUT_OF_RULES (min/max period, min notice, max ahead)
	•	CAPACITY_FULL (activities)

Each entry includes:
	•	reasonCode
	•	pricePreview
	•	approvalRequired boolean
	•	depositRequired boolean + amount (if selection triggers it)

⸻

6) Identity-based pricing groups (private vs org)

Pricing resolution order (simplified)
	1.	Determine booking context:
	•	private user group OR membership org group
	2.	Apply rental object price group rules:
	•	base rate
	•	discounts
	•	surcharges
	3.	Apply add-ons
	4.	Apply deposit/reservation fee logic

Important
	•	UI does not compute pricing.
	•	UI only displays price previews returned from API.

⸻

7) Admin controls that drive the whole behavior (must exist)

Per rental object, admin config must include:

Booking policy
	•	allowed booking modes (single/range/all-day/recurring/season/activity)
	•	slot duration options (1h, 2h)
	•	min/max duration
	•	min/max period
	•	min notice
	•	max ahead

Approval + payment policy
	•	requires approval (boolean)
	•	online payment allowed (boolean)
	•	deposit required (boolean)
	•	deposit amount and rules (refund/cancel)
	•	invoicing mode (optional)

Add-ons binding
	•	allowed add-ons list
	•	required add-ons (optional)
	•	pricing units for add-ons

Privacy policy
	•	allow public title display (boolean)
	•	default visibility (private by default)

⸻

8) One short “master prompt snippet” (for implementation + tests)

Implement full Booking Engine behavior for rental_objects with modes: SINGLE_SLOT, RANGE, ALL_DAY, RECURRING, SEASON_RENTAL, ACTIVITY_REGISTRATION.

Contract-first: rental_object details must return BookingPolicy + PaymentPolicy + PrivacyPolicy + PricingPolicy + AllowedAddOns.
UI must never compute eligibility/prices; always call API for:
- availability grid (status per slot/day/session with reason + pricePreview + approval/deposit hints)
- recurring preview (occurrences list + conflict handling)
- price preview (context: private vs membership-org)
- create booking (single/recurring/season)

Checkout flow (step-by-step pages, no CRUD modals):
1) Select booking type (if multiple enabled)
2) Select time(s): slot/range/all-day/recurring builder/season/activity sessions
3) Select booking context: private or membership org (affects price groups/discounts)
4) Enter purpose/title + notes + privacy visibility (PUBLIC_TITLE / PRIVATE_TITLE / ANONYMOUS)
5) Select add-ons (only those bound to rental_object)
6) Confirm with server price breakdown (base + discounts + surcharges + add-ons + deposit)
7) Enforce PaymentPolicy:
   - auto-confirm with payment
   - pending approval without payment
   - pending approval with deposit/reservation fee required before submission
8) If not authenticated: redirect to shared login with returnTo + flow state, then resume.

Add Playwright journeys:
- each mode (single/range/all-day/recurring/season/activity)
- statuses: busy/reserved/blocked/closed/holiday surcharge/out_of_rules
- privacy visibility affects what public calendar exposes (never PII)
- approval + payment + deposit combinations.
