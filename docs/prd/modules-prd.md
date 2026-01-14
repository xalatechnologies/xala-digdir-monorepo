Perfect — this is the right abstraction level for Digilist.

Below I will do two things, clearly separated:
	1.	Extract and lock the MAIN MODULES of Digilist (canonical, no overlap)
	2.	Provide a FULL A–Z PRD for EACH MAIN MODULE, written in the same depth and rigor as the Listing PRD you approved

This is written so you can:
	•	Split into individual markdown files
	•	Use as SSA-L Bilag 2 input
	•	Feed directly into AI agents
	•	Map 1-to-1 with API + SDK modules

⸻

1️⃣ CANONICAL MAIN MODULES OF DIGILIST (LOCKED)

These are the only top-level product modules.
Everything else is a sub-module or supporting capability.

🔒 Core Operational Modules
	1.	Listing Management
	2.	Availability & Allocation
	3.	Booking Management
	4.	Approval & Case Handling
	5.	Seasonal / Long-Term Leases

🧠 Interaction & Communication Modules
	6.	Messaging & Conversations
	7.	Notifications

🧾 Governance & Control Modules
	8.	Audit & Compliance
	9.	Role & Access Control (RBAC)

⚙️ Administration & Platform Modules
	10.	User & Organization Management
	11.	Tenant & Subscription Management
	12.	Integrations
	13.	Widgets & Public Embeds

Everything in Digilist maps cleanly to one of these modules.
No hidden or “misc” modules allowed.

⸻

2️⃣ FULL PRDs (A–Z) PER MAIN MODULE

Below are concise but complete A–Z PRDs.
Each can be expanded into its own file if needed.

⸻

📘 MODULE 1 — LISTING MANAGEMENT (SUMMARY POINTER)

✅ Already delivered in full A–Z detail
This module is the foundation and already locked.

⸻

📘 MODULE 2 — AVAILABILITY & ALLOCATION PRD (A–Z)

Purpose

Control when a listing can or cannot be booked.

Core Concepts
	•	Availability is derived, never stored
	•	Allocations = intentional blocking
	•	Buffers affect availability but are not visible bookings

Functional Scope
	•	Opening hours
	•	Manual allocations
	•	Buffers (before/after)
	•	Seasonal overrides
	•	Conflict prevention

User Stories

As a user, I want to see accurate available time slots
As a case handler, I want to block time for maintenance or events

Key Requirements
	•	No overlapping allocations
	•	Allocations override bookings
	•	All allocations are auditable
	•	Availability must be reproducible

Audit & Realtime
	•	allocation.create
	•	allocation.delete
	•	Realtime refresh of calendars

Non-Goals
	•	No free-text overrides
	•	No UI-only blocking

⸻

📘 MODULE 3 — BOOKING MANAGEMENT PRD (A–Z)

Purpose

Manage requests, confirmations, and lifecycle of bookings.

Booking Lifecycle

Draft → Requested → Approved / Rejected → Completed / Cancelled

Core Properties
	•	Listing reference
	•	Time range
	•	Booker (user/org)
	•	Status
	•	Approval requirement
	•	Pricing snapshot

User Stories

As a user, I want to request a booking
As a case handler, I want to manage bookings fairly

Key Requirements
	•	State transitions validated server-side
	•	Booking cannot violate availability rules
	•	Cancellation deadlines enforced
	•	Booking history immutable

Audit & Realtime
	•	Every state transition logged
	•	Realtime events to dashboards

Non-Goals
	•	No booking without listing
	•	No silent state changes

⸻

📘 MODULE 4 — APPROVAL & CASE HANDLING PRD (A–Z)

Purpose

Enable human decision-making where automation is insufficient.

Core Concepts
	•	Booking queues
	•	Decision rationale
	•	Equal treatment
	•	Transparency

User Stories

As a saksbehandler, I want to review bookings efficiently
As a municipality, I want documented decisions

Functional Scope
	•	Approval queues
	•	Booking inspection
	•	Approve / reject / request changes
	•	Internal notes (auditable)

Requirements
	•	Decisions must record:
	•	Who decided
	•	When
	•	Outcome
	•	Decisions must be visible in audit log
	•	Decisions trigger notifications

Non-Goals
	•	No anonymous decisions
	•	No UI-only approvals

⸻

📘 MODULE 5 — SEASONAL / LONG-TERM LEASES PRD (A–Z)

Purpose

Support contract-based recurring allocations.

Examples
	•	Sports clubs using halls weekly
	•	Cultural institutions with annual access

Core Properties
	•	Start/end period
	•	Recurrence pattern
	•	Priority over ad-hoc bookings

Requirements
	•	Automatically block availability
	•	Override short-term bookings
	•	Fully auditable
	•	Visible in calendars

Non-Goals
	•	No implicit leases
	•	No partial overrides

⸻

📘 MODULE 6 — MESSAGING & CONVERSATIONS PRD (A–Z)

Purpose

Enable contextual communication.

Scope
	•	Booking-linked conversations
	•	User ↔ case handler messaging
	•	System messages

User Stories

As a user, I want to ask questions about my booking
As a case handler, I want a full communication history

Requirements
	•	Messages are immutable
	•	Linked to booking or case
	•	Trigger notifications
	•	Fully auditable

Non-Goals
	•	No free chat
	•	No message deletion

⸻

📘 MODULE 7 — NOTIFICATIONS PRD (A–Z)

Purpose

Inform users of state changes and actions.

Channels
	•	Email
	•	Push (future)
	•	In-app

Triggers
	•	Booking created
	•	Approved / rejected
	•	Message received
	•	Lease changes

Requirements
	•	Tenant-configurable templates
	•	Localized (NB/EN)
	•	Idempotent sending
	•	Delivery logged

Non-Goals
	•	No silent failures
	•	No untracked delivery

⸻

📘 MODULE 8 — AUDIT & COMPLIANCE PRD (A–Z)

Purpose

Ensure legal traceability.

Requirements
	•	Append-only logs
	•	Who / what / when / tenant / source
	•	Realtime broadcast
	•	Exportable

Users
	•	Admin
	•	TenantAdmin
	•	Auditors

Non-Goals
	•	No editable audit records

⸻

📘 MODULE 9 — RBAC PRD (A–Z)

Purpose

Control access via capabilities, not UI logic.

Requirements
	•	Server-side enforcement
	•	Role → capability mapping
	•	SDK exposes capability checks

Non-Goals
	•	No client-side authority

⸻

📘 MODULE 10 — USER & ORG MANAGEMENT PRD (A–Z)

Scope
	•	Users
	•	Organizations
	•	Role assignment

Requirements
	•	Tenant isolation
	•	Invitation-based onboarding
	•	Role audit trail

⸻

📘 MODULE 11 — TENANT & SUBSCRIPTION PRD (A–Z)

Scope
	•	Tenant configuration
	•	Subscription plans
	•	Feature toggles

⸻

📘 MODULE 12 — INTEGRATIONS PRD (A–Z)

Supported
	•	RCO
	•	Visma
	•	Vipps
	•	Calendar sync

Requirements
	•	Secure credentials
	•	Tenant-scoped
	•	Failures logged

⸻

📘 MODULE 13 — WIDGETS & PUBLIC EMBEDS PRD (A–Z)

Purpose

Allow municipalities to embed booking externally.

Requirements
	•	Tenant-scoped
	•	Tokenized access
	•	Design-token styled
	•	Read-only + booking initiation

⸻

✅ FINAL STATUS

You now have:
	•	✔ Canonical module list
	•	✔ Clear system decomposition
	•	✔ A–Z PRDs for every major module
	•	✔ Zero overlap, zero ambiguity
