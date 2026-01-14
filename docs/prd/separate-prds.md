Absolutely. Here are the three deliverables you asked for, in a form you can paste directly into your repo docs.

⸻

1) Auto-link PRD → PRP → ARD per module

Create one index file that becomes the “router” for all module documentation:

📄 docs/modules/INDEX.md

# Digilist Modules – Documentation Index

Each module has three documents:
- **PRD**: Product Requirements (WHAT & WHY)
- **PRP**: Product Requirement Plan (HOW & WHEN)
- **ARD**: Architecture Requirements (TECH LAW)

> Rule: Any implementation PR must reference the relevant module PRD section + include trace links to PRP and ARD.

---

## Core Operational Modules

| Module | PRD | PRP | ARD |
|---|---|---|---|
| Listing Management | ../prd/prd-listing-management.md | ../prp/prp-listing-management.md | ../ard/ard-listing-management.md |
| Availability & Allocation | ../prd/prd-availability-allocation.md | ../prp/prp-availability-allocation.md | ../ard/ard-availability-allocation.md |
| Booking Management | ../prd/prd-booking-management.md | ../prp/prp-booking-management.md | ../ard/ard-booking-management.md |
| Approval & Case Handling | ../prd/prd-approval-case-handling.md | ../prp/prp-approval-case-handling.md | ../ard/ard-approval-case-handling.md |
| Seasonal Leases | ../prd/prd-seasonal-leases.md | ../prp/prp-seasonal-leases.md | ../ard/ard-seasonal-leases.md |

---

## Interaction & Communication

| Module | PRD | PRP | ARD |
|---|---|---|---|
| Messaging & Conversations | ../prd/prd-messaging-conversations.md | ../prp/prp-messaging-conversations.md | ../ard/ard-messaging-conversations.md |
| Notifications | ../prd/prd-notifications.md | ../prp/prp-notifications.md | ../ard/ard-notifications.md |

---

## Governance & Control

| Module | PRD | PRP | ARD |
|---|---|---|---|
| Audit & Compliance | ../prd/prd-audit-compliance.md | ../prp/prp-audit-compliance.md | ../ard/ard-audit-compliance.md |
| RBAC & Authorization | ../prd/prd-rbac.md | ../prp/prp-rbac.md | ../ard/ard-rbac.md |

---

## Administration & Platform

| Module | PRD | PRP | ARD |
|---|---|---|---|
| Users & Organizations | ../prd/prd-user-organization.md | ../prp/prp-user-organization.md | ../ard/ard-user-organization.md |
| Tenant & Subscription | ../prd/prd-tenant-subscription.md | ../prp/prp-tenant-subscription.md | ../ard/ard-tenant-subscription.md |
| Integrations | ../prd/prd-integrations.md | ../prp/prp-integrations.md | ../ard/ard-integrations.md |
| Widgets & Public Embed | ../prd/prd-widgets-public-embed.md | ../prp/prp-widgets-public-embed.md | ../ard/ard-widgets-public-embed.md |

Optional (but recommended): Add cross-links inside each module doc

Add this block at the top of every PRD/PRP/ARD:

**Trace Links**
- PRD: ../prd/<this>.md
- PRP: ../prp/<this>.md
- ARD: ../ard/<this>.md
- BDD: ../bdd/<this>.feature.md


⸻

2) Generate BDD / acceptance tests from PRDs

Below is a module-based BDD pack (Gherkin-style) that you can store under:

docs/bdd/

I’m writing these as acceptance tests that map to your architecture rules (SDK-first, RFC7807, audit-first, RBAC, realtime).

📄 docs/bdd/bdd-listing-management.feature.md

# BDD – Listing Management

Feature: Listing management lifecycle and visibility

Background:
  Given I am operating within a tenant context
  And RBAC is enforced server-side
  And all mutations are audit logged
  And API errors follow RFC7807

Scenario: Create a new listing as Saksbehandler
  Given I am authenticated as "Saksbehandler"
  When I create a listing with required fields
  Then the listing is created in status "DRAFT"
  And an audit event "listing.create" is stored
  And a realtime event "listing.created" is broadcast

Scenario: Publish a listing
  Given a listing exists in status "DRAFT"
  And I am authenticated as "Saksbehandler"
  When I publish the listing
  Then the listing status becomes "PUBLISHED"
  And an audit event "listing.publish" is stored
  And the listing is visible in public listing search

Scenario: Prevent public viewing of draft listing
  Given a listing exists in status "DRAFT"
  When a "Public" visitor requests the listing
  Then the response is an RFC7807 error with status 404 or 403

Scenario: Archive a listing (Admin only)
  Given a listing exists in status "PUBLISHED"
  And I am authenticated as "Admin"
  When I archive the listing
  Then the listing status becomes "ARCHIVED"
  And the listing is not bookable
  And an audit event "listing.archive" is stored

Scenario: Unauthorized listing update is rejected
  Given I am authenticated as "User"
  When I update a listing
  Then the response is an RFC7807 error with status 403
  And no audit event is recorded for mutation

📄 docs/bdd/bdd-availability-allocation.feature.md

# BDD – Availability & Allocation

Feature: Deterministic availability derived from rules

Scenario: Availability excludes existing booking
  Given a published listing exists
  And a booking exists for time range T
  When I request availability for time range T
  Then the slot for T is not available

Scenario: Allocation blocks time range
  Given I am authenticated as "Saksbehandler"
  And a published listing exists
  When I create an allocation for time range A
  Then availability for A becomes unavailable
  And an audit event "allocation.create" is stored
  And a realtime event "allocation.created" is broadcast

Scenario: Prevent overlapping allocations
  Given an allocation exists for time range A
  When I create another allocation overlapping A
  Then the response is RFC7807 error status 409 (CONFLICT)

📄 docs/bdd/bdd-booking-management.feature.md

# BDD – Booking Management

Feature: Booking lifecycle and constraints

Scenario: User creates booking request for available slot
  Given I am authenticated as "User"
  And a listing is published
  And the slot S is available
  When I request a booking for slot S
  Then a booking is created in status "REQUESTED" (or "CONFIRMED" if auto-approve)
  And an audit event "booking.create" is stored
  And a realtime event "booking.created" is broadcast

Scenario: Prevent booking on unavailable slot
  Given the slot S is unavailable
  When I request a booking for slot S
  Then the response is RFC7807 error status 409
  And no booking is created

Scenario: User cancels before deadline
  Given I am authenticated as "User"
  And I own a booking in status "REQUESTED" or "APPROVED"
  And cancellation deadline has not passed
  When I cancel the booking
  Then booking status becomes "CANCELLED"
  And audit event "booking.cancel" is stored

📄 docs/bdd/bdd-approval-case-handling.feature.md

# BDD – Approval & Case Handling

Feature: Case handler approves or rejects bookings

Scenario: Saksbehandler approves a booking
  Given I am authenticated as "Saksbehandler"
  And a booking exists in status "REQUESTED"
  When I approve the booking
  Then booking status becomes "APPROVED"
  And audit event "booking.approve" is stored
  And notification is sent to the booker
  And realtime event "booking.updated" is broadcast

Scenario: Saksbehandler rejects a booking with reason
  Given a booking exists in status "REQUESTED"
  When I reject the booking with reason R
  Then booking status becomes "REJECTED"
  And decision reason R is stored
  And audit event "booking.reject" is stored

📄 docs/bdd/bdd-messaging-conversations.feature.md

# BDD – Messaging & Conversations

Feature: Booking-linked conversations and messages

Scenario: User starts a conversation on a booking
  Given I am authenticated as "User"
  And I own booking B
  When I create a conversation for booking B
  Then the conversation is created
  And audit event "conversation.create" is stored

Scenario: Message triggers notification
  Given a conversation exists
  When a message is sent
  Then the message is stored immutably
  And audit event "message.send" is stored
  And a notification is queued/sent to the recipient

📄 docs/bdd/bdd-notifications.feature.md

# BDD – Notifications

Feature: Notifications are reliable, localized, and logged

Scenario: Booking approval sends notification
  Given a booking transitions to "APPROVED"
  When the system processes notification triggers
  Then an email notification is sent (or queued)
  And delivery status is recorded
  And notification is tenant-scoped and localized

Scenario: Notification failure is auditable
  Given notification sending fails
  Then an audit/ops log entry is stored with failure details

📄 docs/bdd/bdd-audit-compliance.feature.md

# BDD – Audit & Compliance

Feature: Audit is append-only and queryable

Scenario: All mutations create audit records
  Given a mutation occurs in any module
  Then an audit record is stored with:
    | userId | tenantId | action | timestamp | source |
  And audit records are immutable

Scenario: Audit stream broadcasts realtime events
  When an audit record is created
  Then it is broadcast on ws/audit

📄 docs/bdd/bdd-rbac.feature.md

# BDD – RBAC & Authorization

Feature: Server-side enforcement of role/capability access

Scenario: Forbidden action returns RFC7807
  Given I am authenticated as "User"
  When I attempt an admin-only action
  Then the response is RFC7807 with status 403
  And no mutation occurs

(You can mirror this same pattern for Users/Org, Tenant/Subscription, Integrations, Widgets.)

⸻

3) Map API controllers & SDK services per module

This is the canonical mapping using your production list.

Core Operational Modules

Listing Management
	•	API controllers: Listings, Public (read-only listings), Share (if sharing listing), Widgets (embed listing view)
	•	SDK services: listingService, publicListingService, widgetService, (optional) shareService

Availability & Allocation
	•	API controllers: Availability, Allocations, Calendar
	•	SDK services: availabilityService, allocationService, calendarService

Booking Management
	•	API controllers: Booking, Calendar (views), Reports (booking exports)
	•	SDK services: bookingService, calendarService, reportsService

Approval & Case Handling
	•	API controllers: Booking (status transitions), Dashboard (queues + KPIs), Audit (traceability)
	•	SDK services: bookingService, dashboardService, auditService

Seasonal Leases
	•	API controllers: Seasonal Lease, Calendar
	•	SDK services: seasonalLeaseService, calendarService

Interaction & Communication

Messaging & Conversations
	•	API controllers: Conversations, Messages
	•	SDK services: conversationService, (if separated) messageService or message methods inside conversation service

Notifications
	•	API controllers: (often internal) Messages, Booking, Notification (if exposed), Settings (templates)
	•	SDK services: notificationService, settingsService

Governance & Control

Audit & Compliance
	•	API controllers: Audit, WebSocket (/ws/audit)
	•	SDK services: auditService, realtimeClient (audit stream)

RBAC & Authorization
	•	API controllers: Authz, Auth
	•	SDK services: authService, (optional) authzService or authz methods via auth service

Administration & Platform

Users & Organizations
	•	API controllers: User, Organizations
	•	SDK services: userService, organizationService

Tenant & Subscription
	•	API controllers: Tenant, Settings
	•	SDK services: tenantService, settingsService

Integrations
	•	API controllers: Integrations
	•	SDK services: rcoService, vismaService, vippsService, calendarSyncService

Widgets & Public Embed
	•	API controllers: Widgets, Public, Share
	•	SDK services: widgetService, publicListingService, (optional) share methods

Monitoring & Health (Cross-cutting Ops Module)
	•	API controllers: Monitoring, Health
	•	SDK services: monitoringService