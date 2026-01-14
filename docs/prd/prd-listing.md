Below is a deep, end-to-end PRD for Listing Management in Digilist, written as a standalone, authoritative specification.

This is A–Z: concepts, data model, list types, properties, workflows, rules, RBAC, audit, realtime, UI expectations, and non-goals.
You can safely use this for implementation, tenders, AI agents, and onboarding.

⸻

📘 Digilist – Listing Management PRD (A–Z)

Module: Listing Management
Product: Digilist
Status: Core / Critical
Audience: Backend, SDK, Frontend, AI agents, Product, QA
Compliance Level: Municipal / GDPR / Audit-first

⸻

1. Purpose & Scope

Listing Management is the foundation of Digilist.
A listing represents any bookable municipal resource that can be published, allocated, and booked.

This PRD defines everything related to listings, including:
	•	Listing types
	•	Properties & metadata
	•	Visibility & publication
	•	Availability rules
	•	Relationships to bookings
	•	Role-based permissions
	•	Audit & realtime behavior
	•	UI & SDK expectations

⸻

2. Core Concept: What Is a Listing?

A Listing is a bookable entity that represents a real-world resource.

Examples:
	•	Sports hall
	•	Meeting room
	•	Classroom
	•	Auditorium
	•	Outdoor field
	•	Equipment set
	•	Cultural venue

A listing:
	•	Belongs to exactly one tenant
	•	Can be published or unpublished
	•	Can be booked directly or via approval
	•	Has availability rules
	•	Is fully auditable

⸻

3. Listing Types (Canonical)

Digilist must support typed listings to handle different booking behaviors.

3.1 Listing Type Enumeration

Type	Description	Examples
ROOM	Enclosed indoor space	Meeting room, classroom
HALL	Large indoor space	Sports hall, gym
VENUE	Event-focused location	Auditorium, culture house
OUTDOOR	Outdoor area	Football field
EQUIPMENT	Movable resources	Projectors, chairs
COMPOSITE	Grouped resources	Hall + equipment

Rules:
	•	Listing type affects default availability rules
	•	Listing type affects UI representation
	•	Listing type is immutable after publish (unless admin override)

⸻

4. Listing Properties (Full Data Model)

4.1 Core Identity

Property	Type	Required	Description
id	UUID	Yes	System identifier
tenantId	UUID	Yes	Tenant ownership
type	enum	Yes	Listing type
name	string	Yes	Display name
description	text	No	Public description


⸻

4.2 Physical & Capacity

Property	Type	Required	Description
capacity	number	Optional	Max people
areaSize	number	Optional	m²
location	object	Optional	Address / geo
floor	string	Optional	Floor/level
accessibility	object	Optional	Wheelchair etc.


⸻

4.3 Visibility & Publication

Property	Type	Description
status	enum	DRAFT, PUBLISHED, ARCHIVED
publicVisible	boolean	Visible to Public
requiresLogin	boolean	Login required to book
requiresApproval	boolean	Manual approval required


⸻

4.4 Booking Rules

Property	Type	Description
minDuration	minutes	Minimum booking length
maxDuration	minutes	Maximum booking length
bufferBefore	minutes	Prep buffer
bufferAfter	minutes	Cleanup buffer
advanceBookingDays	number	How far ahead booking allowed
cancellationDeadline	hours	Cancellation cutoff


⸻

4.5 Pricing & Rules (Optional)

Property	Type	Description
pricingModel	enum	Free / Fixed / Per-hour
priceRules	array	Rules per user/org
discountEligible	boolean	Promo support


⸻

4.6 Metadata & Classification

Property	Type	Description
tags	string[]	Search/filter
categories	string[]	UI grouping
customFields	JSON	Tenant-defined


⸻

4.7 System Fields (Hidden)

Property	Type
createdAt	timestamp
updatedAt	timestamp
createdBy	userId
updatedBy	userId


⸻

5. Listing Lifecycle

5.1 States

DRAFT → PUBLISHED → ARCHIVED

5.2 State Rules
	•	DRAFT
	•	Editable
	•	Not bookable
	•	Not visible publicly
	•	PUBLISHED
	•	Bookable (subject to rules)
	•	Visible to allowed roles
	•	Type is locked
	•	ARCHIVED
	•	Not bookable
	•	Read-only
	•	Historical bookings preserved

All transitions:
	•	Require authorization
	•	Must be audit logged
	•	Emit realtime events

⸻

6. Availability Model (Listing-Centric)

Listings do not store availability directly.
Availability is derived from:
	1.	Opening hours
	2.	Allocations (blocks)
	3.	Existing bookings
	4.	Seasonal leases
	5.	Buffers & rules

Requirement:
Availability must be:
	•	Deterministic
	•	Reproducible
	•	Stateless (derived)

⸻

7. User Stories (Listing-Focused)

US-01 (Saksbehandler)

As a case handler, I want to create and manage listings so that resources can be booked digitally.

US-02 (Public)

As a visitor, I want to browse published listings so I can find suitable facilities.

US-03 (User)

As a user, I want to see clear rules and availability for a listing before booking.

US-04 (Admin)

As an admin, I want full control and audit visibility over listings.

⸻

8. Role-Based Access (Listing Management)

Action	Public	User	Saksbehandler	Admin	TenantAdmin
View published listings	✅	✅	✅	✅	✅
Create listing	❌	❌	✅	✅	✅
Edit listing	❌	❌	✅	✅	✅
Publish/unpublish	❌	❌	✅	✅	✅
Archive	❌	❌	❌	✅	✅
Manage rules	❌	❌	✅	✅	✅

RBAC is enforced server-side only.

⸻

9. Audit Requirements (MANDATORY)

Every listing action must log:
	•	Action type (listing.create, listing.update, etc.)
	•	Listing ID
	•	Tenant ID
	•	User ID
	•	Timestamp
	•	Changed fields (diff)
	•	Source (UI / API)

Audit events must:
	•	Be immutable
	•	Be stored in DB
	•	Be broadcast via WebSocket

⸻

10. Realtime Requirements

Listing events that trigger realtime updates:
	•	Created
	•	Updated
	•	Published
	•	Archived

Consumers:
	•	Admin dashboards
	•	Saksbehandler views
	•	Search index refresh

⸻

11. SDK Requirements

The Client SDK must provide:
	•	listingService.create()
	•	listingService.update()
	•	listingService.publish()
	•	listingService.archive()
	•	listingService.list()
	•	listingService.getById()

SDK must:
	•	Be fully typed
	•	Reflect backend validation rules
	•	Never expose internal fields

⸻

12. UI Requirements (Design-System Driven)

Listing Forms Must:
	•	Use Digdir components
	•	Use design tokens only
	•	Show rule explanations inline
	•	Validate before submit
	•	Display RFC 7807 errors clearly

Listing Views Must:
	•	Show status clearly
	•	Show rules & constraints
	•	Indicate approval requirements
	•	Be responsive & accessible

⸻

13. Non-Goals (Explicit)
	•	❌ No free-text availability overrides
	•	❌ No per-listing custom code
	•	❌ No UI-side permission logic
	•	❌ No silent rule violations

⸻

14. Success Criteria
	•	Listings can be created without developer assistance
	•	Users understand booking rules before booking
	•	Zero unaudited listing changes
	•	Consistent behavior across tenants

⸻

✅ Final Statement

This PRD defines Listing Management completely.
Anything not described here is out of scope by design.
