Below is a rewritten, clean, tender-ready PRD that fully reflects everything we have aligned on:
	•	✅ Correct rental object taxonomy (Lokaler og baner etc.)
	•	✅ Clear separation of Back-office vs MinSide organizations
	•	✅ Correct role hierarchy
	•	✅ Feature-flag–driven platform (module-level, cross-app)
	•	✅ No modals for create/edit (pages + breadcrumbs only)
	•	✅ Design system, SSR, i18n, accessibility guardrails
	•	✅ Suitable for SSA-L tenders and municipal language

You can treat this as PRD v1.0 (authoritative).

⸻

📘 Product Requirements Document (PRD)

Digilist – Municipal Booking & Rental Platform

Version: 1.0
Status: Authoritative
Audience: Procurement evaluators, architects, developers
Compliance Context: SSA-L, GDPR, WCAG 2.1 AA, Digdir Designsystemet

⸻

1. Purpose & Scope

Digilist is a multi-tenant municipal platform for administration, booking, and governance of bookable rental objects.
The platform supports municipal staff, partner organizations, organization administrators, and end users (citizens / members) through clearly separated applications and role-based access.

The system is designed to:
	•	Support municipal governance and delegation
	•	Provide citizen-friendly booking experiences
	•	Enforce security, traceability, and compliance
	•	Allow modular activation via feature flags, without redeployments

⸻

2. Core Domain Definition

2.1 Rental Object (Utleieobjekt) – Canonical Definition

A Rental Object (Utleieobjekt) is any bookable asset administered by the municipality or its delegated organizations.

All rental objects belong to exactly one of the following categories:

2.1.1 Lokaler og baner

Physical spaces and sports facilities.

Examples:
	•	Idrettshaller, gymsaler, kultursaler
	•	Møterom, klasserom, aula
	•	Fotballbaner, tennisbaner, friidrettsanlegg

Characteristics:
	•	Calendar-based availability
	•	Capacity and accessibility rules
	•	Approval workflows may apply

⸻

2.1.2 Arrangementer og tjenester

Time-based or service-based offerings.

Examples:
	•	Kurs, workshops
	•	Kulturarrangementer
	•	Kommunale tjenester med påmelding

Characteristics:
	•	Fixed or semi-fixed schedules
	•	Participant limits
	•	Registration-oriented (not free-slot booking)

⸻

2.1.3 Utstyr og kjøretøy

Movable assets.

Examples:
	•	Lyd- og lysutstyr
	•	Sportsutstyr
	•	Tilhengere, minibusser

Characteristics:
	•	Quantity-based availability
	•	Maintenance windows
	•	Deposit or agreement requirements

⸻

3. Organization Model (Critical Distinction)

3.1 Back-office Organizations (Governing Organizations)

These organizations:
	•	Exist only in Back-office
	•	Are created and governed by municipal/tenant administrators
	•	Represent:
	•	Cultural departments
	•	Municipal units
	•	Partner or umbrella organizations (paraplyorganisasjoner)
	•	Own or are assigned rental objects
	•	Define rules, availability, pricing bindings, and governance

These organizations are not sign-in contexts for users.

⸻

3.2 MinSide Organizations (User-Affiliated Organizations)

These organizations:
	•	Are loaded at user sign-in
	•	Come from Norwegian registries (e.g. Brønnøysund)
	•	Represent clubs, associations, teams, NGOs
	•	Allow users to act on behalf of an organization
	•	Are used when:
	•	Booking
	•	Paying invoices
	•	Representing an organization vs private person

These organizations do not manage rental objects.

⸻

4. Applications & Roles

4.1 Applications

Application	Purpose
Back-office	Municipal and delegated administration
MinSide	End user & organization representative portal
SaaS Admin	Platform-level administration (out of scope here)


⸻

5. Roles & Responsibilities (Back-office Focus)

5.1 Tenant / Municipal Admin (Kommune-admin)

Primary authority for the tenant.

Responsibilities:
	•	Create and manage back-office organizations
	•	Assign rental objects to organizations
	•	Define pricing groups and rules
	•	Manage municipal users and roles
	•	Configure feature flags (per tenant)
	•	Access audit logs and system reports

Typical users:
	•	Municipal case handlers
	•	Economy staff
	•	Cultural administration

⸻

5.2 Organization Admin (Back-office)

Delegated authority for a governing organization.

Responsibilities:
	•	Manage assigned rental objects
	•	Assign internal users (organization members)
	•	Approve or reject bookings
	•	View reports related to their scope
	•	Manage availability, season rentals, blocks

⸻

5.3 Organization Member (Back-office)

Examples:
	•	Utleier
	•	Økonomiansvarlig
	•	Saksbehandler (internal role, not system-wide)

Responsibilities (permission-based):
	•	Handle bookings
	•	Manage calendars
	•	Perform financial follow-up
	•	Communicate with users

⸻

5.4 End User / Organization Representative (MinSide)

Citizens or members acting privately or on behalf of an organization.

Responsibilities:
	•	Browse rental objects
	•	Create and manage bookings
	•	View invoices
	•	Receive notifications
	•	Manage profile and consents

⸻

6. Feature Flags (Foundational Requirement)

6.1 Feature Flag Principles
	•	Feature flags are module-based, not UI-only
	•	A feature flag controls:
	•	API availability
	•	Client SDK exposure
	•	UI routes and sidebar items
	•	Permissions
	•	If a feature is off → it is off everywhere

Examples:
	•	feature.ratings
	•	feature.messaging
	•	feature.payments
	•	feature.season_rentals

⸻

6.2 Subscription → Feature Flag Mapping

Tenant subscription plans determine:
	•	Which feature flags are enabled
	•	Maximum limits (objects, users, orgs)
	•	Integration availability (SMS, payments, etc.)

⸻

7. UI & UX Principles (Mandatory)

7.1 Page Structure (All Dashboards)

Every page must follow this structure:

PageHeader
 ├─ Title
 ├─ Breadcrumbs
 ├─ Primary actions
 └─ Context actions

Content
 ├─ Filters / Search
 ├─ Table or structured content
 └─ Pagination / bulk actions

7.2 No Modals for CRUD

❌ Not allowed:
	•	Create/Edit forms in modals
	•	Complex flows in dialogs

✅ Allowed:
	•	Dedicated pages
	•	Tabs
	•	Step-by-step wizards
	•	Confirmation dialogs (design system only)

⸻

7.3 Reusable Components (Design System)

All dashboards must use:
	•	Shared PageHeader
	•	Shared DataTable
	•	Shared FilterBar
	•	Shared BulkActions
	•	Shared EmptyState
	•	Shared ConfirmationDialog

❌ No raw HTML
❌ No custom styling outside tokens

All styling must use:
	•	Digdir Designsystemet tokens
	•	Approved extension tokens only

⸻

8. Global UI Capabilities

8.1 Global Search (Back-office)
	•	Indexed search across:
	•	Rental objects
	•	Organizations
	•	Users
	•	Bookings
	•	Role-aware results
	•	Feature-flag aware

⸻

8.2 Notifications & Messaging
	•	Real-time via WebSockets
	•	Configurable per tenant
	•	Supports:
	•	System notifications
	•	Booking messages
	•	Admin communications

⸻

8.3 Help & Support (Mandatory)

Every dashboard must include:
	•	Help & Support section
	•	Contextual guidance
	•	Tips & walkthroughs
	•	User manuals per role

⸻

9. Security & Compliance

9.1 Security
	•	RBAC + permission matrix
	•	Row Level Security (RLS)
	•	Audit logging
	•	Session management

9.2 GDPR
	•	Consent tracking
	•	Data access requests
	•	Right to deletion
	•	Retention policies
	•	Full auditability

⸻

10. Success Criteria
	•	Clear separation of responsibilities
	•	Consistent UX across all roles
	•	Feature-flag driven modularity
	•	Tender-safe terminology
	•	No over-engineering
	•	High usability for municipal staff

⸻

✅ Final Statement (Tender-safe)

Digilist er en modulbasert, rolle- og rettighetsstyrt plattform for kommunal administrasjon av utleieobjekter. Løsningen støtter tydelig separasjon mellom forvaltning, organisasjoner og innbyggere, og gir fleksibel funksjonalitet styrt av abonnement og feature-flagg.
