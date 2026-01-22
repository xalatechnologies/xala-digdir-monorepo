A) Frontend Epics + User Stories

EPIC 1 — Global Shell (Navbar, Search, Auth entry)

Goal: Consistent, accessible header + global search + login/profile behavior.

User Stories
	1.	As a visitor, I can use the navbar to navigate between “Finn lokale”, “Arrangementer”, “Utstyr”, and “Kart” (if enabled).
	2.	As a visitor, I can search using the global search bar with typeahead suggestions grouped by category.
	3.	As a user, I can log in and see a profile dropdown with “Min Side”, “Mine bookinger”, “Varsler”, and “Logg ut”.
	4.	As a user, when I click “Min Side”, I am redirected to MinSide (with SSO/session preserved).
	5.	As a user, if I’m mid-booking and must log in, I’m redirected back to the exact step after login.

⸻

EPIC 2 — Discovery (List/Grid/Map + Filters)

Goal: Category-aware discovery and availability-aware browsing.

User Stories
	1.	As a visitor, I can browse rental objects in list view (default) and switch to grid view.
	2.	As a visitor, I can view results on a map if geo is enabled.
	3.	As a visitor, I can filter by category, location, date, availability, and price (if enabled).
	4.	As a visitor, I see category-specific filters (capacity/amenities vs sessions vs pickup/quantity).
	5.	As a visitor, each card shows availability hints and “Fra pris” if pricing is enabled.

⸻

EPIC 3 — Rental Object Details (Tabs, Preview Availability)

Goal: A dynamic details page with tabs driven by content + feature flags.

User Stories
	1.	As a visitor, I can view a rental object’s overview, rules, pricing, and availability.
	2.	As a visitor, I can see the correct tab set based on object type (activities/pickup, etc.).
	3.	As a visitor, I can preview availability in the appropriate calendar type (slot/day/range/session).
	4.	As a visitor, I can see clear status meanings: available/busy/reserved/blocked/closed/surcharge.

⸻

EPIC 4 — Booking Engine (Single, Range, All-day)

Goal: Smooth checkout for common booking types with API-driven pricing & validation.

User Stories
	1.	As a user, I can choose booking mode if multiple are enabled for this rental object.
	2.	As a user, I can select a slot (1h/2h) and proceed to details and confirmation.
	3.	As a user, I can select a range (from–to) and see valid options enforced by policy.
	4.	As a user, I can select all-day bookings with min/max period rules enforced.
	5.	As a user, I can choose booking context: private or membership org (MinSide org context).
	6.	As a user, I can select add-ons that are attached to this rental object.
	7.	As a user, I can see a server-calculated price breakdown before confirming.

⸻

EPIC 5 — Recurring & Season Booking (Preview + Conflicts + Alternatives)

Goal: Recurrence builder with preview, per-occurrence conflict handling, and suggested alternatives.

User Stories
	1.	As a user, I can create a weekly recurrence (e.g. Sunday 14:00 for 3 months).
	2.	As a user, I see a preview list/calendar of all occurrences and their statuses.
	3.	As a user, if some occurrences conflict, I’m informed immediately and shown reasons.
	4.	As a user, I can resolve conflicts per occurrence (accept suggested times, choose another, skip).
	5.	As a user, I cannot confirm until conflicts are resolved (strict mode) or explicitly skipped (flex mode).
	6.	As a user, I can create a season rental if enabled and view the exact allocated period.

⸻

EPIC 6 — Approval, Deposit, Payment Variants

Goal: Support approval workflows and payment/deposit rules.

User Stories
	1.	As a user, if approval is required, I can submit and get “Pending approval” status.
	2.	As a user, if online payment is required, I can pay and get confirmed status.
	3.	As a user, if deposit/reservation fee is required, I must pay before submission.
	4.	As a user, I always understand what is paid now vs later and what happens on rejection/cancel.

⸻

EPIC 7 — Privacy & Consent (Calendar visibility)

Goal: User-controlled visibility for calendar labels + consent recording.

User Stories
	1.	As a user, I can choose whether my booking title is visible publicly or not.
	2.	As a user, I can choose “show busy only” or “anonymous”.
	3.	As a user, my choice affects what others see on public availability views.

⸻

EPIC 8 — Post-booking & Handoff to MinSide

Goal: Confirmation, reference, next steps, and redirect to MinSide.

User Stories
	1.	As a user, after booking I see a confirmation page with status and booking reference.
	2.	As a user, I can click “Se i MinSide” to view the booking details.
	3.	As a user, I receive notifications by email/SMS/in-app depending on settings and flags.

⸻

B) DTO Contracts the Web Frontend Relies On (Canonical)

Notes:
	•	All DTOs are contract-first; UI does not infer rules.
	•	Feature flags are included in a single bootstrap payload.

1) App Bootstrap

export type WebBootstrapDTO = {
  locale: "nb" | "en";
  tenantId: string;
  featureFlags: FeatureFlagsDTO;
  user?: SessionUserDTO; // only if logged in
};

2) Feature Flags

export type FeatureFlagsDTO = {
  geo: boolean;
  pricing: boolean;
  payments: boolean;
  deposits: boolean;
  approvals: boolean;
  addOns: boolean;
  ratingsReviews: boolean;
  messaging: boolean;
  activities: boolean;
  recurringBookings: boolean;
  seasonRentals: boolean;
  mapView: boolean;
};

3) Search + Filters

export type RentalObjectCategory =
  | "LOKALER_OG_BANER"
  | "ARRANGEMENTER_OG_TJENESTER"
  | "UTSTYR_OG_KJORETOY";

export type RentalObjectSearchQueryDTO = {
  q?: string;
  category?: RentalObjectCategory;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  locationId?: string;
  capacityMin?: number;
  priceMin?: number;
  priceMax?: number;
  view?: "list" | "grid" | "map";
  geo?: { lat: number; lng: number; radiusKm: number };
  filters?: Record<string, string | number | boolean | string[]>;
};

export type RentalObjectCardDTO = {
  id: string;
  title: string;
  category: RentalObjectCategory;
  shortDescription?: string;
  imageUrl?: string;
  locationLabel?: string;
  capacity?: number;
  amenities?: string[];
  nextAvailabilityHint?: string; // human-friendly
  fromPrice?: MoneyDTO;          // if pricing enabled
  badges?: string[];             // approval required, etc.
};

4) Details + Tabs

export type RentalObjectDetailsDTO = {
  id: string;
  title: string;
  category: RentalObjectCategory;
  description?: string;
  images: string[];
  location?: GeoLocationDTO;
  capacity?: number;
  amenities?: AmenityDTO[];
  rules?: RulesDTO;
  faq?: FAQDTO[];
  pricing?: PricingInfoDTO; // if pricing flag
  addOns?: AddOnDTO[];      // if addOns flag
  bookingPolicy: BookingPolicyDTO;
  paymentPolicy: PaymentPolicyDTO;
  privacyPolicy: PrivacyPolicyDTO;
  tabs: DetailsTabDTO[]; // computed by backend (content + flags)
};

export type DetailsTabDTO = {
  key:
    | "overview"
    | "availability"
    | "program"
    | "rules"
    | "pricing"
    | "addons"
    | "amenities"
    | "location"
    | "pickup_return"
    | "reviews"
    | "faq";
  label: string;     // localized label key or resolved label
  enabled: boolean;
};

5) Booking Policy (drives calendars)

export type BookingMode =
  | "SINGLE_SLOT"
  | "RANGE"
  | "ALL_DAY"
  | "RECURRING"
  | "SEASON_RENTAL"
  | "ACTIVITY_REGISTRATION";

export type BookingPolicyDTO = {
  allowedModes: BookingMode[];
  slotDurationsMinutes?: number[]; // e.g. [60,120]
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  minDaysAhead?: number;
  maxDaysAhead?: number;
  minPeriodDays?: number; // for ALL_DAY / SEASON
  maxPeriodDays?: number;
  timezone: string; // Europe/Oslo
  holidayPolicy?: HolidayPolicyDTO;
};

6) Availability Grid (unified)

export type AvailabilityStatus =
  | "AVAILABLE"
  | "BUSY"
  | "RESERVED"
  | "BLOCKED"
  | "CLOSED"
  | "SURCHARGE"
  | "OUT_OF_RULES"
  | "CAPACITY_FULL";

export type AvailabilityUnitDTO = {
  start: string; // ISO
  end: string;   // ISO
  status: AvailabilityStatus;
  reasonCode?: string;     // for tooltips
  pricePreview?: MoneyDTO; // optional
  approvalRequired?: boolean;
  depositRequired?: boolean;
};

export type AvailabilityGridDTO = {
  mode: BookingMode;
  units: AvailabilityUnitDTO[];
};

7) Recurring Preview + Alternatives

export type RecurringPreviewRequestDTO = {
  rentalObjectId: string;
  pattern: {
    freq: "DAILY" | "WEEKLY";
    interval: number;
    byDay?: ("MO"|"TU"|"WE"|"TH"|"FR"|"SA"|"SU")[];
    startDate: string; // ISO date
    endDate: string;   // ISO date
    startTime: string; // "14:00"
    endTime: string;   // "16:00"
  };
  context: BookingContextDTO;
  policy: { maxSuggestionsPerConflict: number; searchWindowDays: number };
};

export type OccurrenceDTO = {
  occurrenceId: string;
  start: string;
  end: string;
  status: "OK" | "CONFLICT" | "WARNING";
  conflictType?: string;
  reasonCode?: string;
  pricePreview?: MoneyDTO;
  suggestions?: AlternativeSuggestionDTO[];
};

export type AlternativeSuggestionDTO = {
  start: string;
  end: string;
  label: string; // "18:00–20:00"
  pricePreview?: MoneyDTO;
  deltaMinutesFromOriginal?: number;
};

export type RecurringPreviewDTO = {
  occurrences: OccurrenceDTO[];
  strictWouldFail: boolean;
};

8) Checkout Context + Consent + Add-ons

export type BookingContextDTO =
  | { type: "PRIVATE" }
  | { type: "MEMBERSHIP_ORG"; orgId: string };

export type BookingVisibility = "PUBLIC_TITLE" | "PRIVATE_TITLE" | "ANONYMOUS";

export type CheckoutDraftDTO = {
  rentalObjectId: string;
  mode: BookingMode;
  selected: { start: string; end: string }[]; // multiple for recurring
  context: BookingContextDTO;
  title?: string;
  noteToAdmin?: string;
  visibility: BookingVisibility;
  addOns: { addOnId: string; quantity: number }[];
};

9) Price Preview + Create Booking

export type PricePreviewDTO = {
  subtotal: MoneyDTO;
  discounts: { label: string; amount: MoneyDTO }[];
  surcharges: { label: string; amount: MoneyDTO }[];
  addOnsTotal: MoneyDTO;
  depositNow?: MoneyDTO;      // if deposit required
  payNow?: MoneyDTO;          // full or deposit
  payLater?: MoneyDTO;        // if approval/invoice
  total: MoneyDTO;
};

export type CreateBookingResultDTO = {
  bookingId: string;
  status: "CONFIRMED" | "PENDING_APPROVAL" | "PAYMENT_PENDING";
  referenceCode: string;
  redirectToPaymentUrl?: string;
};


⸻

C) Wireframes (ASCII + Mermaid) — Page by Page

1) Home / Search Landing

┌───────────────────────────────────────────────────────────┐
│ Logo | Finn lokale | Arrangementer | Utstyr | Kart | [🔍] │
│                                            [Logg inn]     │
├───────────────────────────────────────────────────────────┤
│ Hero: “Finn og book kommunale utleieobjekter”              │
│ [ Search input________________ ] [Dato] [Sted] [Søk]       │
│ Quick categories: [Lokaler] [Arrangementer] [Utstyr]       │
└───────────────────────────────────────────────────────────┘

2) Search Results (List/Grid/Map)

┌─────────────Filters────────────┬──────────Results──────────┐
│ Category                        │ View: [List][Grid][Map]  │
│ Date                             │ Sort: Relevans ▼         │
│ Location                         │ ┌──────────────────────┐ │
│ Capacity                         │ │ Card/List row         │ │
│ Price (if enabled)               │ │ Title, badges, price  │ │
│ Amenities (if applicable)        │ │ Availability hint     │ │
│ ...                              │ └──────────────────────┘ │
└──────────────────────────────────┴─────────────────────────┘

3) Rental Object Details (Tabs)

┌───────────────────────────────────────────────────────────┐
│ Breadcrumbs: Hjem > Lokaler og baner > “Skolehallen”       │
│ Title + badges     [♥] [Del]  [Book nå]                    │
├───────────────────────────────────────────────────────────┤
│ Tabs: Oversikt | Tilgjengelighet | Regler | Priser | ...   │
├───────────────────────────────────────────────────────────┤
│ Tab content (dynamic)                                     │
└───────────────────────────────────────────────────────────┘

4) Booking Flow (Wizard pages)

Step 1: Velg bookingtype
[Enkelt] [Gjentakende] [Hel dag] [Sesong] [Aktivitet]

Step 2: Velg tid (calendar)
Step 3: Hvem booker?  (Privat / Organisasjon)
Step 4: Detaljer + Synlighet
Step 5: Tilleggstjenester
Step 6: Prisoppsummering
Step 7: Betaling / Send til godkjenning

Mermaid: Recurring Preview + Alternatives

sequenceDiagram
  participant U as User (Web)
  participant W as Web UI
  participant API as API

  U->>W: Define recurrence (Sun 14:00, 3 months)
  W->>API: POST /recurring/preview (pattern + context)
  API-->>W: occurrences[] + conflicts + suggestions[]
  W-->>U: Show preview table with conflict rows

  U->>W: Accept suggestion for conflict #3
  W->>API: POST /recurring/confirm (overrides/skips)
  API-->>W: series + bookings created (pending/confirmed)
  W-->>U: Confirmation + reference + next steps
