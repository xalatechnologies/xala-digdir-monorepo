Below is a single, implementation-ready blueprint for Public Web rental object discovery + detail + booking engine, where behavior changes by rental object category, and the calendar/engine reacts to rules (all-day, slot sizes, min/max, blocks, reserved, holidays, extra price).

⸻

1) Rental object categories and what changes in the public UI

Categories (locked)
	1.	LOKALER_OG_BANER
	2.	ARRANGEMENTER_OG_TJENESTER
	3.	UTSTYR_OG_KJORETOY

Booking mode (drives calendar type)

Every rental object must declare a booking profile:
	•	ALL_DAY (date blocks)
	•	TIME_SLOTS (fixed slot duration: 1h / 2h / N minutes)
	•	RANGE (start/end times; duration constrained by min/max)
	•	ACTIVITY_REGISTRATION (event sessions + capacity + registration)
	•	SEASON_RENTAL (period allocations; usually not public self-serve unless enabled)

Category decides default mode(s), but booking profile is the truth.

⸻

2) Public search & filters (category-aware)

Global filters (always available)
	•	Search (text)
	•	Category (3 main)
	•	Location (municipality/area + distance if geo enabled)
	•	Date picker (for availability search)
	•	Price (range if pricing enabled)
	•	Accessibility (wheelchair, hearing loop etc. if enabled)
	•	Capacity (if applicable)

Category-specific filters

LOKALER_OG_BANER
	•	Capacity (min)
	•	Indoor/outdoor
	•	Sport type / surface (optional)
	•	Amenities (showers, kitchen, projector)

ARRANGEMENTER_OG_TJENESTER
	•	Date range
	•	Session type (workshop, event, service)
	•	Available spots (min)
	•	Organizer (optional)

UTSTYR_OG_KJORETOY
	•	Quantity
	•	Pickup location
	•	License requirement / age requirement
	•	Deposit required (boolean)

Filter UX rules
	•	Filter changes update results via query params (shareable URLs)
	•	Feature flags hide filters globally:
	•	feature.pricing hides price filters
	•	feature.geo hides distance/map
	•	feature.ratings_reviews hides rating filters

⸻

3) Cards on the public list page (dynamic by category)

Card layout (base)
	•	Image
	•	Title
	•	Category badge
	•	Location badge (if geo)
	•	“From price” (if pricing)
	•	Availability hint (next available slot/date)
	•	CTA: “Se detaljer” + quick “Book” (if booking enabled)

Card “attribute row” by category

LOKALER_OG_BANER
	•	Capacity
	•	Key amenities icons (3 max)
	•	Approval required badge (if rules require)

ARRANGEMENTER_OG_TJENESTER
	•	Next session date/time
	•	Spots left
	•	“Påmelding” badge

UTSTYR_OG_KJORETOY
	•	Quantity available
	•	Pickup location
	•	Min rental duration badge

⸻

4) Details page structure + tab matrix

Always-present top section
	•	Hero (title, images)
	•	Quick facts panel (dynamic fields)
	•	Primary CTA: “Velg tidspunkt / Påmelding”
	•	Secondary: Favorites (if enabled), Share link

Tabs (canonical)

Tabs are driven by data + flags, not hardcoded.

Always (if content exists)
	•	Oversikt
	•	Tilgjengelighet (calendar / sessions)
	•	Regler & vilkår (rules + FAQ)
	•	Priser (if pricing enabled)
	•	Tjenester & tillegg (if additional services enabled)
	•	Fasiliteter (amenities; shown as “Fasiliteter” in UI, but model is amenities)
	•	Beliggenhet (map if geo enabled)
	•	Anmeldelser (if ratings enabled)

Category special
	•	ARRANGEMENTER_OG_TJENESTER:
	•	replace “Tilgjengelighet” with “Program / Økter”
	•	show “Påmelding” flow + capacity
	•	UTSTYR_OG_KJORETOY:
	•	include “Henting & retur” tab (pickup/return rules)
	•	LOKALER_OG_BANER:
	•	include “Bruksregler” tab if facility rules exist

Tab visibility rule

A tab exists only if:
	•	feature flag enabled AND
	•	the rental object has content for it AND
	•	user is allowed to view it (some docs could be public/private later)

⸻

5) Booking engine: single contract-first model

Booking policy object (returned by API)

For details page, API must return a BookingPolicy (no UI logic):

Key fields
	•	bookingMode: ALL_DAY | TIME_SLOTS | RANGE | ACTIVITY_REGISTRATION | SEASON_RENTAL
	•	slotDurationMinutes (for TIME_SLOTS)
	•	minDurationMinutes / maxDurationMinutes
	•	minDaysAhead / maxDaysAhead
	•	maxPeriodDays (maximum period of rent)
	•	minPeriodMinutes (minimum period)
	•	requiresApproval (true/false)
	•	pricingStrategy (price group binding)
	•	availabilitySource (calendar rules + blocks)
	•	holidaysPolicy (closed/extra price)
	•	statusRules mapping (see below)

⸻

6) Calendar types + status handling (your scenarios)

Calendar types (UI)
	1.	All-day calendar (date grid)
	•	used for ALL_DAY + season-like daily blocking
	2.	Slot calendar (time grid)
	•	used for TIME_SLOTS (1h, 2h, etc.)
	3.	Range picker calendar
	•	select start/end times (RANGE)
	4.	Session list/calendar
	•	used for ACTIVITY_REGISTRATION (sessions + capacity)

Status definitions (must be unified across all calendars)

Each time unit (day/slot/range) must have status:
	•	AVAILABLE (bookable)
	•	BUSY (already confirmed booking) → not selectable
	•	RESERVED (soft hold) → not selectable unless owned by same user/session
	•	BLOCKED (maintenance/admin block) → not selectable
	•	CLOSED (off day / Sunday / holiday closed) → not selectable
	•	SURCHARGE (extra price) → selectable with price highlight
	•	REQUIRES_APPROVAL (selectable but booking becomes “pending”)
	•	OUT_OF_RULES (fails min/max, min notice, max ahead) → not selectable

UI must not infer these. API returns status + reason + pricing.

What the API returns for the calendar

For a given rental object and date range, return AvailabilityGrid:
	•	For ALL_DAY: days[]
	•	For TIME_SLOTS: slots[] (start/end + status)
	•	For RANGE: segments[] or constraints + occupied ranges
	•	For ACTIVITIES: sessions[] (capacity, spotsLeft, status)

Each entry includes:
	•	status
	•	reasonCode (for tooltip)
	•	pricePreview (optional)
	•	minDurationOk / maxDurationOk (optional for range UX)
	•	flags (holiday, surcharge, approval)

⸻

7) How booking reacts per mode (business behavior)

ALL_DAY
	•	User selects date(s)
	•	Min/max period enforced (days)
	•	Blocks/closed days not selectable
	•	Booking becomes:
	•	CONFIRMED or PENDING_APPROVAL depending on policy

TIME_SLOTS (1h, 2h, etc.)
	•	UI shows slots at exact intervals
	•	Slot duration is fixed
	•	Min/max duration becomes number of slots
	•	Reserved/busy/blocked/closed remove selection
	•	Surcharge slots show price label

RANGE (min/max duration)
	•	User picks start time → UI shows valid end times
	•	API provides constraints and disallowed ranges
	•	UI never calculates: it queries:
	•	/availability/preview?start=... to validate end time options

ACTIVITY_REGISTRATION
	•	User selects session
	•	Capacity is enforced
	•	Booking becomes a registration with status:
	•	CONFIRMED (if auto)
	•	WAITLIST (optional flag)
	•	PENDING_APPROVAL (if required)

⸻

8) Pricing groups + additional services + rules/FAQ integration

Pricing (if enabled)
	•	Detail page “Priser” tab:
	•	Show base rates (by user group if applicable)
	•	Show surcharges (holiday, peak hours)
	•	Show cancellation fees
	•	Calendar shows price per slot/day if configured

Additional services (if enabled)
	•	Add-ons selection step in checkout
	•	Add-ons can be:
	•	per booking
	•	per hour/day
	•	per participant (activities)

Rules & FAQ
	•	Rules engine returns:
	•	age limits
	•	deposit requirements
	•	approval requirements
	•	required attachments (optional)
	•	FAQ is displayed but also used as validation messages mapping.

⸻

9) “Master prompt” to implement this end-to-end (short, snippet)

Implement category-aware Public Web UX + booking engine for rental_objects.

Rental object categories (enum): LOKALER_OG_BANER, ARRANGEMENTER_OG_TJENESTER, UTSTYR_OG_KJORETOY.
Each rental_object must expose BookingPolicy (contract-first) with bookingMode: ALL_DAY | TIME_SLOTS | RANGE | ACTIVITY_REGISTRATION | SEASON_RENTAL and constraints (slotDuration, min/max duration, min/max ahead, approval, pricing strategy, holiday policy).

Public List Page:
- Global filters: q, category, date, location/geo (if feature.geo), price (if feature.pricing), accessibility, capacity.
- Category-specific filters as defined above.
- Cards: dynamic attribute row per category + next availability hint + from-price (flagged).

Details Page:
- Tabs are data + feature-flag driven:
  Overview, Availability/Program, Rules&FAQ, Prices (flagged), Add-ons (flagged), Amenities, Location (flagged), Reviews (flagged), Pickup/Return (equipment only).
- No UI computed eligibility; always ask API.

Calendar engine:
- Provide 4 calendar types: All-day grid, Slot grid, Range picker, Session list.
- AvailabilityGrid API returns status per unit with reason + pricePreview.
Status enum: AVAILABLE, BUSY, RESERVED, BLOCKED, CLOSED, SURCHARGE, REQUIRES_APPROVAL, OUT_OF_RULES.
Implement consistent styling + tooltips and disable selection based on status.

Booking flow:
- Selection -> price preview -> add-ons (flagged) -> confirmation -> create booking/registration.
- If requiresApproval -> create as PENDING_APPROVAL else CONFIRMED.
- All apps must enforce module flags consistently (API blocks routes/endpoints; SDK hides methods; UI hides menus/routes).

Add Playwright journeys per bookingMode and per category, covering:
- blocked/closed days, reserved slots, busy slots, surcharge slots, min/max period, approval required.
