📘 PRD – Clarified Organization Model (Tender-Critical)

1. Organization Model – Explicit Domain Separation

Digilist operates with two distinct and intentionally separated organization concepts, each serving a different purpose in the platform architecture. These organization types are not interchangeable and are governed, managed, and used differently.

This separation is a deliberate architectural decision to ensure:
	•	Correct governance
	•	Legal and organizational clarity
	•	GDPR compliance
	•	Clear responsibility boundaries between municipality and end users

⸻

2. Back-office Organizations (Tenant-Controlled / Governing Organizations)

2.1 Definition

Back-office Organizations are tenant-controlled governing entities managed exclusively by the Tenant Admin (kommune / paraplyorganisasjon) within the Back-office application.

These organizations represent the municipal or inter-municipal operational structure responsible for owning, governing, and administering rental objects.

2.2 Characteristics

Back-office Organizations:
	•	Are created and managed by the Tenant Admin
	•	Exist only in Back-office
	•	Represent:
	•	Municipal departments (e.g. culture, sports, facilities)
	•	Partner organizations
	•	Paraplyorganisasjoner that may cover multiple communes
	•	Own or are assigned rental objects (utleieobjekter)
	•	Define and control:
	•	Availability rules
	•	Pricing bindings
	•	Approval requirements
	•	Blocking and closed periods
	•	Are part of the municipality’s governance model, not user identity

2.3 Scope and Authority

Back-office Organizations may:
	•	Govern rental objects
	•	Control booking policies
	•	Delegate operational responsibility internally
	•	Be used for reporting, audit, and compliance

Back-office Organizations are not:
	•	User sign-in contexts
	•	Membership-based entities
	•	Visible as selectable “organizations” for end users

Important:
End users do not “log in as” a Back-office Organization.

⸻

3. User Organizations (MinSide / Membership Organizations)

3.1 Definition

User Organizations are membership-based organizations that a user is affiliated with and may represent when interacting with Digilist.

These organizations are loaded dynamically at sign-in and are used exclusively in MinSide and user-facing flows.

3.2 Characteristics

User Organizations:
	•	Are associated with a user’s identity
	•	Are loaded at sign-in from Norwegian registries (e.g. Brønnøysundregistrene)
	•	Represent:
	•	Sports clubs
	•	Associations
	•	NGOs
	•	Other membership-based entities
	•	A user may:
	•	Be a leader
	•	Hold a role
	•	Act on behalf of the organization
	•	Are used when:
	•	Creating bookings
	•	Paying invoices
	•	Acting as an organization rather than a private individual

3.3 Scope and Authority

User Organizations may:
	•	Submit booking requests
	•	View bookings made on their behalf
	•	Receive notifications and invoices

User Organizations do not:
	•	Own or govern rental objects
	•	Define availability or pricing
	•	Manage platform configuration
	•	Access Back-office governance features

Important:
User Organizations consume availability defined by Back-office Organizations but never control it.

⸻

4. Explicit Non-Overlap Guarantee

To avoid ambiguity and ensure correct governance:
	•	Back-office Organizations and User Organizations:
	•	Have separate data models
	•	Have separate permission systems
	•	Have separate lifecycles
	•	Exist in different application contexts
	•	There is no implicit inheritance or overlap between the two

Any interaction between them (e.g. bookings) is:
	•	Explicit
	•	Logged
	•	Auditable
	•	Policy-controlled

⸻

5. Role Responsibilities in Relation to Organizations

Tenant Admin
	•	Manages Back-office Organizations
	•	Assigns rental objects to Back-office Organizations
	•	Governs rules, pricing, approvals, and policies
	•	Never manages User Organizations

Organization Admin (User-side)
	•	Acts within a User Organization
	•	Represents the organization in bookings
	•	Cannot govern rental objects or platform configuration

⸻

6. Tender-Relevant Benefits of This Model

This explicit separation ensures:
	•	✅ Clear municipal governance
	•	✅ Legal clarity between provider and consumer roles
	•	✅ GDPR-compliant data separation
	•	✅ Scalable support for inter-municipal cooperation
	•	✅ Reduced risk of role confusion
	•	✅ Audit-friendly traceability
	•	✅ Alignment with SSA-L principles

⸻

7. Terminology Lock (Used Consistently in Documentation)

From this point forward, Digilist documentation uses:
	•	Back-office Organization
(tenant-controlled, governing, rental-object owning)
	•	User Organization (MinSide Organization)
(membership-based, identity-level, booking party)

This terminology is used consistently across:
	•	PRD
	•	Bilag 1 / 2
	•	API documentation
	•	User documentation
	•	Tender responses
