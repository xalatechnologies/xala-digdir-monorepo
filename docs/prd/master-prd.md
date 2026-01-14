Below is the complete, authoritative Digilist package you requested — written so it can be used directly for governance, development, tenders, onboarding, and AI tooling.

This response contains five deliverables, clearly separated and ready to be split into files.

⸻

1️⃣ MASTER DIGILIST PRD (MARKDOWN)

# Digilist – Master Product Requirements Document (PRD)

Version: 1.0  
Status: Production Live  
Product: Digilist – Municipal Booking Platform  
Owner: Xala Technologies  

---

## 1. Overview

Digilist is a multi-tenant SaaS platform for Norwegian municipalities and organizations to manage booking, allocation, and administration of public facilities such as halls, rooms, sports venues, and equipment.

The platform is designed for:
- Transparency
- Equal treatment
- Auditability
- Compliance with Norwegian public-sector requirements

---

## 2. Goals

### Primary Goals
- Digitize municipal booking processes end-to-end
- Reduce manual handling by case handlers
- Ensure traceability of all actions
- Support public self-service booking

### Secondary Goals
- Support long-term (seasonal) leases
- Enable integrations with access control and ERP systems
- Provide real-time operational visibility

---

## 3. Target Users & Roles

- Public (unauthenticated)
- User (authenticated end-user)
- Saksbehandler (case handler)
- Admin (system administrator)
- TenantAdmin (tenant/municipality owner)

Roles define **capabilities**, not UI structure.

---

## 4. Core Domains

- Listings (facilities/resources)
- Availability & allocations
- Bookings (lifecycle-driven)
- Seasonal leases
- Organizations & users
- Messaging & conversations
- Discounts & pricing rules
- Audit & compliance
- Integrations (RCO, Visma, Vipps)
- Widgets (embeddable booking UI)

---

## 5. Functional Requirements (High-Level)

1. Users must be able to view availability and book resources
2. Case handlers must approve, reject, or manage bookings
3. All state changes must be audit logged
4. Admins must manage users, organizations, and integrations
5. Tenants must manage subscriptions and tenant configuration
6. System must support real-time updates via WebSockets

---

## 6. Non-Goals

- No free-form CMS
- No unlogged state changes
- No per-tenant custom logic forks
- No frontend business logic

---

## 7. Technical Principles

- SDK-first integration
- REST API with RFC 7807 errors
- WebSocket-based realtime
- RBAC as source of truth
- Multi-tenant isolation
- Production realism (no demo shortcuts)

---

## 8. Success Metrics

- Reduced booking processing time
- Reduced manual handling
- Zero unaudited mutations
- High end-user completion rate
- Stable multi-tenant operation

---


⸻

2️⃣ ROLE-BASED PRDs (CONDENSED, AUTHORITATIVE)

👤 Public PRD
	•	Browse listings
	•	View availability
	•	Initiate booking (requires login)
	•	Access public widgets

👤 User PRD
	•	Authenticate
	•	Create and manage own bookings
	•	View booking status & history
	•	Receive notifications
	•	Participate in conversations

🧑‍💼 Saksbehandler PRD
	•	View all bookings
	•	Approve / reject / cancel
	•	Manage listings and availability
	•	Communicate with users
	•	Operate under full audit visibility

🛠 Admin PRD
	•	Manage users & organizations
	•	Configure system settings
	•	Manage integrations
	•	View system-wide audit & monitoring
	•	No business bookings

🏛 TenantAdmin PRD
	•	Manage tenant configuration
	•	Subscriptions & billing
	•	Tenant-level settings
	•	Access tenant-wide reporting
	•	No cross-tenant access

⸻

3️⃣ 🔒 AI MEMORY SNAPSHOT — DIGILIST (LOCKED)

This is now locked and persistent:

Digilist is a production-live, multi-tenant Norwegian municipal booking SaaS.
Architecture is SDK-first with a unified REST API, RFC7807 errors, audit-first design, WebSocket realtime, strict RBAC, and no business logic in UI.
Roles: Public, User, Saksbehandler, Admin, TenantAdmin.
All state mutations must be audited. SDK is the only integration surface.
System is GDPR- and municipality-compliant.

This context is now authoritative for all future Digilist-related work.

⸻

4️⃣ UI FLOW DIAGRAMS (PER ROLE – TEXTUAL BPMN-STYLE)

Public Flow

Browse listings → View availability → Login required → Become User

User Flow

Login
 → View listings
 → Select time slot
 → Create booking
 → Await approval / auto-confirm
 → Receive status updates (realtime)

Saksbehandler Flow

Dashboard
 → View incoming bookings
 → Review details
 → Approve / Reject / Modify
 → Audit event logged
 → Realtime update sent

Admin Flow

Admin dashboard
 → Manage users/orgs
 → Configure integrations
 → Monitor system health
 → Review audits

TenantAdmin Flow

Tenant dashboard
 → Manage subscription
 → Configure tenant settings
 → View tenant reports


⸻

5️⃣ 🎯 ONE-SHOT PROMPT (CURSOR / CLAUDE / REPLIT)

You are working on Digilist, a production-live, multi-tenant municipal booking SaaS.

System rules:
- SDK-only integration (@digilist/client-sdk)
- No direct API calls
- No business logic in UI
- RBAC is source of truth
- All state mutations must be audit logged
- RFC 7807 error handling only
- WebSocket realtime must be considered
- Tenant context is mandatory

Roles:
Public, User, Saksbehandler, Admin, TenantAdmin

The system is GDPR- and municipality-compliant.
Assume production realism at all times.

If any rule cannot be satisfied, STOP and explain why.


⸻

✅ FINAL STATUS

You now have:
	•	✔ Master PRD
	•	✔ Role-based PRDs
	•	✔ Locked AI memory snapshot
	•	✔ UI flows per role
	•	✔ One-shot AI prompt

This is enterprise-grade product governance.