Below is a full, formal, detailed Master PRD for Digilist, written as a single source of truth and suitable for:
	•	Product governance
	•	Development (frontend, backend, SDK)
	•	AI agents
	•	Tenders / SSA-L attachments
	•	Onboarding new teams
	•	Long-term roadmap control

This PRD is explicit, non-ambiguous, and implementation-aware (not theoretical).

⸻

📘 Digilist – Master Product Requirements Document (PRD)

Product Name: Digilist
Product Type: Multi-tenant Municipal Booking SaaS
Status: Production Live (v1.x)
Owner: Xala Technologies
Primary Market: Norwegian municipalities and public organizations

⸻

1. Product Overview

Digilist is a digital platform that enables municipalities and organizations to publish, manage, allocate, and book public facilities and resources in a transparent, auditable, and compliant manner.

The platform replaces manual, email-based, or fragmented booking processes with a single, governed system that supports:
	•	Public self-service booking
	•	Case-handler approval workflows
	•	Administrative oversight
	•	Full auditability
	•	Real-time operational visibility

Digilist is built as a multi-tenant SaaS, where each tenant represents a municipality or organization, fully isolated from others.

⸻

2. Product Goals

2.1 Primary Goals
	1.	Enable citizens, organizations, and internal staff to book public resources digitally
	2.	Reduce manual workload for municipal case handlers
	3.	Ensure equal treatment through transparent rules and workflows
	4.	Provide full traceability of all decisions and actions
	5.	Meet Norwegian public-sector expectations for audit and compliance

2.2 Secondary Goals
	1.	Support long-term and seasonal leases
	2.	Integrate with external systems (access control, ERP, payments)
	3.	Provide embeddable booking widgets
	4.	Support real-time operational dashboards
	5.	Enable future extensibility without tenant-specific forks

⸻

3. Users & Roles

3.1 Role Definitions

Role	Description
Public	Unauthenticated visitor
User	Authenticated end-user (citizen, club, organization)
Saksbehandler	Municipal case handler
Admin	System administrator
TenantAdmin	Tenant (municipality) owner

Roles define capabilities, not UI layout.

⸻

4. Core User Stories (High-Level)

4.1 Public User Story

As a visitor, I want to browse available facilities and see availability so that I can decide whether to make a booking.

4.2 User Story

As an authenticated user, I want to request and manage bookings so that I can use municipal facilities in a predictable way.

4.3 Saksbehandler Story

As a case handler, I want to review, approve, or reject bookings so that resources are allocated fairly and according to rules.

4.4 Admin Story

As an administrator, I want to manage users, organizations, and system settings so the platform operates correctly.

4.5 TenantAdmin Story

As a tenant owner, I want to manage subscriptions and tenant configuration so my municipality’s setup is correct.

⸻

5. Functional Requirements (DETAILED)

FR-01: Listings Management

Description:
The system must allow facilities and resources to be defined as listings.

Requirements:
	•	Listings must include name, description, capacity, location, rules
	•	Listings must support publish/unpublish/archive
	•	Listings must be editable only by authorized roles
	•	Listings must be auditable

User Stories:
	•	As a saksbehandler, I want to manage listings so resources are accurate
	•	As a user, I want to view listings so I know what can be booked

⸻

FR-02: Availability & Allocations

Description:
The system must calculate availability based on rules, allocations, and existing bookings.

Requirements:
	•	Support time slots, buffers, opening hours
	•	Allow manual allocations (blocking)
	•	Prevent overlapping allocations
	•	Availability must be deterministic and reproducible

User Stories:
	•	As a user, I want to see available times before booking
	•	As a saksbehandler, I want to block times for maintenance

⸻

FR-03: Booking Lifecycle Management

Description:
The system must manage bookings as a lifecycle.

Booking States (example):
	•	Draft
	•	Requested
	•	Approved
	•	Rejected
	•	Cancelled
	•	Completed

Requirements:
	•	Bookings must reference listing, time, user, tenant
	•	State transitions must be validated
	•	All transitions must be audit logged
	•	Realtime events must be emitted

User Stories:
	•	As a user, I want to request a booking
	•	As a saksbehandler, I want to approve or reject bookings

⸻

FR-04: Seasonal Leases

Description:
The system must support long-term or recurring contracts.

Requirements:
	•	Define start/end periods
	•	Lock availability automatically
	•	Override ad-hoc bookings
	•	Fully auditable

User Stories:
	•	As a municipality, I want to allocate halls to clubs for a season

⸻

FR-05: Organizations & Users

Description:
The system must manage users and organizations.

Requirements:
	•	Users belong to one or more organizations
	•	Users have roles and capabilities
	•	Admins manage users
	•	TenantAdmins manage tenant-scoped users

User Stories:
	•	As an admin, I want to manage users and roles

⸻

FR-06: Messaging & Conversations

Description:
The system must support communication related to bookings.

Requirements:
	•	Conversations linked to bookings
	•	Messages stored and auditable
	•	Notifications triggered on new messages

User Stories:
	•	As a user, I want to communicate with case handlers

⸻

FR-07: Audit Logging (CRITICAL)

Description:
Every meaningful action must be logged.

Requirements:
	•	Log who, what, when, tenant, and context
	•	Store audit events in database
	•	Broadcast audit events via WebSocket
	•	Audit logs must be immutable

User Stories:
	•	As an admin, I want full traceability
	•	As a municipality, I need legal documentation

⸻

FR-08: Real-Time Events

Description:
The system must emit real-time updates.

Requirements:
	•	WebSocket connections per tenant
	•	Events for booking changes, audits, notifications
	•	Client auto-reconnect support

User Stories:
	•	As a saksbehandler, I want live updates without refreshing

⸻

FR-09: Role-Based Access Control (RBAC)

Description:
Access must be strictly role- and capability-based.

Requirements:
	•	RBAC enforced server-side
	•	UI must reflect RBAC but never enforce it
	•	No hardcoded permissions in UI

User Stories:
	•	As a tenant, I need secure separation of duties

⸻

FR-10: Error Handling (RFC 7807)

Description:
All errors must follow a standard format.

Requirements:
	•	RFC 7807 Problem Details
	•	Consistent error types
	•	Field-level validation errors
	•	UI-friendly structure

⸻

FR-11: Integrations

Description:
The system must integrate with external services.

Supported:
	•	Access control (RCO)
	•	ERP (Visma)
	•	Payments (Vipps)
	•	Calendar sync

Requirements:
	•	Integration failures must be logged
	•	Configurable per tenant
	•	Secure credentials handling

⸻

FR-12: Widgets

Description:
The system must provide embeddable booking widgets.

Requirements:
	•	Public read-only + booking initiation
	•	Tenant-scoped
	•	Styleable via tokens
	•	No backend exposure

⸻

6. Non-Functional Requirements

NFR-01: Multi-Tenancy
	•	Strict tenant isolation
	•	No cross-tenant access

NFR-02: Compliance
	•	GDPR-aligned data handling
	•	Audit-ready architecture

NFR-03: Performance
	•	Fast availability checks
	•	Stable realtime connections

NFR-04: Maintainability
	•	SDK-first integration
	•	No duplicated business logic

⸻

7. Technical Constraints (MANDATORY)
	•	SDK-only frontend integration
	•	No direct API calls in UI
	•	No business logic in UI
	•	All mutations must be auditable
	•	Realtime events considered part of core UX

⸻

8. Success Metrics
	•	Reduction in manual booking handling
	•	Percentage of bookings completed digitally
	•	Zero unaudited mutations
	•	Stable tenant isolation
	•	High user satisfaction

⸻

9. Open Questions (INTENTIONALLY EMPTY)

This PRD reflects implemented reality.
Open questions are handled via roadmap, not assumptions.

⸻

✅ FINAL NOTE

This PRD is:
	•	✔ Detailed
	•	✔ Implementable
	•	✔ AI-safe
	•	✔ Tender-safe
	•	✔ Aligned with your existing system