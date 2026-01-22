Yep — this is the real recurring/season engine: conflict-aware planning + guided alternatives.

Here’s the canonical behavior you can implement without UI guessing.

⸻

1) Recurring/Season booking must be Preview → Conflicts → Alternatives → Confirm

Core rule

A recurring/season request is never created directly. It must go through:
	1.	Preview (generate occurrences)
	2.	Detect conflicts (busy/reserved/blocked/closed/out-of-rules)
	3.	Suggest alternatives per conflict
	4.	User resolves conflicts (accept suggestions / skip / change pattern)
	5.	Confirm (create series + occurrences)

⸻

2) Conflict types (standardized)

For each occurrence, API returns conflictType:
	•	BUSY_CONFIRMED (already booked)
	•	RESERVED_HOLD (reserved)
	•	BLOCKED_ADMIN (maintenance / priority event)
	•	CLOSED_HOLIDAY (closed Sunday/holiday)
	•	OUTSIDE_RULES (min/max, min notice, max ahead)
	•	PRICE_SURCHARGE (not conflict; warning)

Each conflict includes:
	•	reasonText (localized key)
	•	source (booking / block / holiday rule)
	•	priority (for UI severity: warning vs hard stop)

⸻

3) Alternative suggestion policy (what “options” means)

Alternative strategy order (configurable)

When a conflict occurs for an occurrence (date, 14:00–16:00):

Strategy A — same day, different time
	•	try next valid slot windows on same day
	•	e.g. 18:00–20:00

Strategy B — nearest day(s), same time
	•	try ±1 week / ±1 day depending on recurrence type
	•	e.g. Saturday 14:00 or next Sunday 14:00

Strategy C — nearest day(s), different time
	•	fallback options combining both

Constraints to respect

Alternatives must satisfy:
	•	booking mode constraints (slot size, min/max duration)
	•	opening hours
	•	blackout/blocks
	•	approval requirement (same)
	•	pricing policy (return price preview per alternative)

⸻

4) The UI experience (instant “on the spot” feedback)

In the recurring builder, after user selects:
	•	weekday = Sunday
	•	time = 14:00
	•	period = 3 months

UI calls preview:
	•	Returns an occurrence table:
	•	✅ OK
	•	❌ Conflict (with reason)
	•	🟨 Warning (surcharge)

For conflicts, each row shows:
	•	“Not available at 14:00”
	•	Suggested alternatives (chips/buttons):
	•	“18:00–20:00”
	•	“19:00–21:00”
	•	“Mon 14:00–16:00”

User can choose per conflict:
	•	Accept suggested
	•	Choose another (opens alternative picker)
	•	Skip this date
	•	Change pattern (regenerate preview)

⸻

5) Minimal API contracts you need

A) Preview recurring/season

POST /api/bookings/recurring/preview

Input
	•	rentalObjectId
	•	pattern (weekly, BYDAY=SU, interval, start/end date)
	•	desiredTimeRange (14:00–16:00)
	•	context (private vs membershipOrgId)
	•	addOns selection (optional) OR “estimate only”
	•	alternativePolicy (limits: maxSuggestionsPerConflict, searchWindowDays)

Output
	•	occurrences[]:
	•	date, start, end
	•	status: OK | CONFLICT | WARNING
	•	conflictType?
	•	reasonCode?
	•	pricePreview?
	•	suggestions[] (0..N):
	•	start/end
	•	label (“18:00–20:00”)
	•	reason (“Available”)
	•	pricePreview
	•	deltaFromOriginal (minutes)

B) Resolve conflicts

Two approaches:

Option 1: client submits chosen resolution
POST /api/bookings/recurring/confirm
	•	occurrences with overrides:
	•	originalOccurrenceId → chosenAlternativeRange OR skip

Option 2: server stores draft
	•	preview returns draftId
	•	client posts draftId + chosen resolutions

Draft is cleaner for long flows.

⸻

6) Booking series creation rules

When confirming:
	•	Create Series parent
	•	Create Occurrences children
	•	Occurrence statuses:
	•	CONFIRMED / PENDING_APPROVAL
	•	if payment required: PAYMENT_PENDING until captured

If strict mode chosen:
	•	Any unresolved conflict blocks confirm.

If flexible mode chosen:
	•	Conflicting ones must be either:
	•	resolved to alternative
	•	explicitly skipped
	•	(never silently dropped)

⸻

7) “Short master prompt snippet” to implement this

Implement conflict-aware recurring/season booking with instant preview + alternatives.

Rules:
- Recurring/season bookings must use Preview → Conflicts → Alternatives → Confirm workflow.
- Preview endpoint generates occurrences for the pattern and returns status per occurrence:
  OK | CONFLICT | WARNING (surcharge).
- Conflict types: BUSY_CONFIRMED, RESERVED_HOLD, BLOCKED_ADMIN, CLOSED_HOLIDAY, OUTSIDE_RULES.
- For each CONFLICT occurrence, API returns suggested alternative date/time options:
  Strategy order: same-day different time → nearest-day same time → nearest-day different time.
  Suggestions must respect booking constraints (slot duration, min/max, opening hours, blocks, holidays).
  Suggestions include pricePreview and are limited by policy (maxSuggestionsPerConflict, searchWindow).
- UI shows an occurrence table and allows per-conflict resolution:
  accept suggestion | choose other | skip date | change recurrence pattern.
- Confirm endpoint requires explicit resolutions (no silent drops) and creates:
  series parent + child occurrences; statuses follow approval/payment/deposit policies.

Add Playwright tests:
- recurring weekly Sunday 14:00 for 3 months with one Sunday blocked;
- verify preview marks that date as conflict and provides alternatives;
- user selects alternative time; confirm creates series with one overridden occurrence.
