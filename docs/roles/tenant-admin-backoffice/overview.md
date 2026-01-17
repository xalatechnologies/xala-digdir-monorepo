Perfect — this is the right reset point, and you’re asking exactly the right question.

Let’s lock the mental model first, then define Tenant Admin (SaaS Admin / Back-office Admin) cleanly, without leaking domain noise or overengineering.

I’ll do this in layers, from authority → menus → features → flags → UI behavior, so you always know where you are.

⸻

1️⃣ ROLE HIERARCHY — FINAL, CLEAN MODEL

We must separate platform power from domain power.

Level 0 — SaaS Platform (Global)

Not in scope now, but important for clarity

	•	Platform Super Admin (Xala internal)
	•	Manages tenants
	•	Manages plans
	•	Global feature catalog
	•	Billing engine
	•	System health
	•	Never touches bookings or rental objects

⬇️

Level 1 — TENANT ADMIN (🚨 FOCUS NOW)

This is the Back-office Admin you want to design first

Tenant Admin = Owner of ONE tenant
	•	Example: Skien Kommune
	•	This admin defines how Digilist behaves for that tenant

They do NOT:
	•	Manage other tenants
	•	Change SaaS core behavior
	•	Touch infrastructure

They DO:
	•	Configure tenant capabilities
	•	Manage organizations under tenant
	•	Govern rental objects
	•	Oversee bookings, economy, messaging
	•	Control feature availability via feature flags (within plan)

⬇️

Level 2 — DOMAIN ADMINS (Later)
	•	Organization Admin
	•	Organization Member
	•	Citizen (MinSide)

We explicitly ignore these for now.

⸻

2️⃣ WHAT IS A TENANT ADMIN — IN ONE SENTENCE

A Tenant Admin governs how the platform operates for their municipality / tenant, based on subscription + feature flags, without managing SaaS infrastructure.

This sentence is your compass.

⸻

3️⃣ TENANT ADMIN — RESPONSIBILITY BOUNDARIES

Tenant Admin OWNS
	•	Tenant configuration
	•	Organizations (clubs, schools, units)
	•	Rental object governance
	•	Booking policies
	•	Approval flows
	•	Economy configuration
	•	Messaging configuration
	•	Reporting & audit visibility

Tenant Admin DOES NOT OWN
	•	SaaS pricing plans
	•	Feature catalog definitions
	•	Platform-wide settings
	•	Branding engine (unless plan allows)
	•	Core auth providers (only enable/disable)

⸻

4️⃣ TENANT ADMIN — SIDEBAR STRUCTURE (BACK-OFFICE)

This is the authoritative sidebar.
Everything else derives from this.

BACKOFFICE (Tenant Admin)

Dashboard

Operations
- Bookings
- Calendar
- Rental Objects
- Blocks & Closed Periods

Organizations
- Organizations
- Members & Access

Communication
- Messages
- Message Templates

Economy
- Invoices
- Payments
- Pricing Rules

Insights
- Reports
- Statistics
- Export

Governance
- Audit Log
- System Log

Settings
- Tenant Settings
- Feature Management
- Integrations

⚠️ Important
This is the MAXIMUM menu.
Visibility is 100% controlled by:
	•	Subscription
	•	Feature flags
	•	Permissions

⸻

5️⃣ MENU → PAGE → FUNCTIONALITY (TENANT ADMIN)

Let’s go menu by menu and define exact intent, not fluff.

⸻

🧭 Dashboard (Tenant Admin)

Purpose:
👉 Decision surface, not analytics

Must answer:
	1.	What needs attention?
	2.	What is happening now?
	3.	What is risky or blocked?

Widgets (feature-aware)
	•	Pending approvals
	•	Today / next 7 days bookings
	•	Active blocks
	•	Unread messages (if messaging enabled)
	•	Overdue invoices (if economy enabled)

📌 No charts unless plan allows analytics.

⸻

📦 Operations

Bookings

Tenant-wide booking oversight:
	•	View all bookings
	•	Filter by organization, rental object, status
	•	Approve / reject (if approval flow enabled)
	•	Bulk actions (if plan allows)

Feature flags:
	•	BOOKING_APPROVALS
	•	BULK_ACTIONS
	•	RECURRING_BOOKINGS
	•	SEASON_BOOKINGS

⸻

Calendar

Unified operational calendar:
	•	All rental objects
	•	Blocks
	•	Conflicts
	•	Timeline view (if enabled)

Feature flags:
	•	CALENDAR_TIMELINE
	•	CONFLICT_ENGINE

⸻

Rental Objects

Governance layer — not content editing

Tenant Admin can:
	•	Create rental objects
	•	Assign to organizations
	•	Define availability rules
	•	Define pricing bindings
	•	Publish / archive

Cannot:
	•	Customize per org branding

Feature flags:
	•	RENTAL_OBJECTS
	•	MULTI_ORG_ASSIGNMENT
	•	ADVANCED_RULES

⸻

Blocks & Closed Periods

System-level availability control:
	•	Maintenance
	•	Holidays
	•	Emergency closures

Feature flags:
	•	BLOCK_MANAGEMENT

⸻

🏢 Organizations

Organizations

Tenant-level structure:
	•	Create org
	•	Activate/deactivate
	•	Assign rental objects

Feature flags:
	•	ORGANIZATION_MANAGEMENT

⸻

Members & Access

Governance only:
	•	Assign roles
	•	Invite users
	•	View permissions

No RBAC editing unless plan allows.

Feature flags:
	•	USER_MANAGEMENT
	•	ADVANCED_RBAC

⸻

💬 Communication

Messages

Tenant-wide inbox:
	•	Conversations
	•	System messages
	•	Booking-related messages

Feature flags:
	•	MESSAGING
	•	INTERNAL_CHAT
	•	EMAIL_NOTIFICATIONS
	•	SMS_NOTIFICATIONS

⸻

Message Templates

Governance of messaging content:
	•	Booking confirmation
	•	Reminder
	•	Rejection
	•	Change notification

Feature flags:
	•	MESSAGE_TEMPLATES

⸻

💰 Economy

Invoices
	•	View invoices
	•	Status tracking
	•	Export

Feature flags:
	•	INVOICING

⸻

Payments
	•	Payment providers
	•	Status
	•	Reconciliation

Feature flags:
	•	PAYMENTS
	•	VIPPS
	•	STRIPE

⸻

Pricing Rules

Only if explicitly enabled:
	•	Price groups
	•	Time-based pricing
	•	Discounts

Feature flags:
	•	PRICING_RULES
	•	DYNAMIC_PRICING

⸻

📊 Insights

Reports
	•	Predefined reports
	•	Download/export

Feature flags:
	•	REPORTING

⸻

Statistics
	•	KPIs
	•	Trends

Feature flags:
	•	ANALYTICS

⸻

🛡 Governance

Audit Log
	•	Read-only
	•	Filtered by scope

Feature flags:
	•	AUDIT_LOG

⸻

System Log
	•	Errors
	•	Warnings
	•	Integrations

Feature flags:
	•	SYSTEM_LOGS

⸻

⚙️ Settings

Tenant Settings
	•	General info
	•	Contact info
	•	Defaults

Always enabled.

⸻

Feature Management

🔥 CRITICAL PAGE

Tenant Admin can:
	•	Enable/disable features within subscription
	•	See locked features (upgrade hint)

Feature flags:
	•	FEATURE_FLAG_UI

⸻

Integrations
	•	Enable payment providers
	•	Enable auth providers
	•	Enable webhooks

Feature flags:
	•	INTEGRATIONS
	•	WEBHOOKS

⸻

6️⃣ FEATURE FLAGS — NON-NEGOTIABLE RULE

A feature flag disables the entire vertical slice

If MESSAGING = false:
	•	No sidebar item
	•	No API routes
	•	No SDK methods
	•	No UI components
	•	No background jobs
	•	No notifications

Same flag name across:
	•	DB (feature_flags)
	•	API guards
	•	SDK capabilities
	•	UI visibility

⸻

7️⃣ SUBSCRIPTION → FEATURE FLAGS

Subscription does NOT implement logic.

Subscription:
	•	Defines which feature flags are allowed
	•	Feature flags define runtime behavior

Example:

PLAN: "MUNICIPAL_STANDARD"
allows: [
  RENTAL_OBJECTS,
  BOOKINGS,
  CALENDAR,
  MESSAGING,
  INVOICING
]

Tenant Admin can toggle only allowed flags.

⸻

8️⃣ WHY THIS WORKS (AND YOU WERE FEELING LOST)

You were lost because:
	•	Roles were mixing platform + domain
	•	Features weren’t vertically coupled
	•	Dashboards tried to do everything

Now:
	•	One role = one responsibility plane
	•	One feature flag = one full module
	•	One dashboard = one decision surface

⸻

