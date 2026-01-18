Alright — here are both deliverables, kept high-signal and implementation-ready without overengineering.

⸻

1) Tenant Admin Dashboard Wireframe (Widget → Query → DTO)

Dashboard goals for Tenant Admin
	•	Zero clutter, maximum “what should I do now?”
	•	Fast overview + actionable queue
	•	Everything is tenant-scoped, filtered by permissions, and module-gated

Layout

Desktop (12-col):
	•	Row 1: KPI cards (5)
	•	Row 2: Work Queue (8) + Calendar Preview (4)
	•	Row 3: Ops Risks (6) + Organizations (6)
	•	Row 4: Economy + Communications + System (module-gated)

Mobile: one column, KPIs first, then queue, then calendar.

⸻

Widgets (canonical list)

A) KPI Row (always visible, some cards gated)
	1.	Pending approvals
	2.	Bookings today
	3.	Active blocks
	4.	Unread messages (MESSAGING)
	5.	Overdue invoices (INVOICING)

Query (single aggregated query)
	•	counts grouped by status/time window

⸻

B) Work Queue (primary)

“Pending approvals” table (BOOKING_APPROVALS)
	•	Columns: bookingRef, rentalObject, requester, start/end, conflictBadge, createdAt
	•	Actions: approve, reject, view
	•	Bulk actions: approve/reject (BULK_ACTIONS)

Query
	•	select pending bookings with joins to rental_object + requester projection
	•	limit 20 + cursor pagination

⸻

C) Calendar Preview (CALENDAR)

Today + next 7 days mini timeline view
	•	show booked + blocked
	•	click → opens calendar route pre-filtered

Query
	•	fetch time segments for window:
	•	bookings (approved + pending maybe)
	•	blocks
	•	returned already merged or separate arrays (prefer separate for flexibility)

⸻

D) Ops / Risks (CONFLICT_ENGINE optional)
	1.	Conflicts requiring review (CONFLICT_ENGINE)
	2.	Data quality (missing pricing/rules/images) (RENTAL_OBJECTS + PRICING)

Query
	•	conflicts: open conflicts count + top 5
	•	data quality: counts (missing_pricing, missing_images, missing_rules)

⸻

E) Organizations Overview (ORG_MGMT)
	•	total orgs
	•	orgs with 0 rental_objects
	•	unassigned rental_objects
	•	quick action: create org, assign objects

Query
	•	org counts + unassigned objects count
	•	top 10 “needs attention”

⸻

F) Economy Snapshot (INVOICING/PAYMENTS)
	•	invoices this month
	•	overdue count
	•	last 10 payment events

Query
	•	invoice aggregates for month
	•	last N events

⸻

G) Communication Snapshot (MESSAGING)
	•	unread conversations
	•	last 10 messages summary

Query
	•	unread count + last N previews

⸻

H) System / Governance (AUDIT/SYSTEM_LOGS/MONITORING)
	•	audit events last 10 (AUDIT_LOG)
	•	errors/warnings last 10 (SYSTEM_LOGS)

Query
	•	last events filtered by severity and scope

⸻

DTO Design (single response, module sections)

Endpoint

GET /api/backoffice/tenant-dashboard

DTO pattern: “section wrapper”

So UI can render easily without conditionals everywhere.

type Section<T> =
  | { enabled: true; data: T }
  | { enabled: false; reason: "FEATURE_DISABLED" | "NOT_IN_PLAN" | "NO_PERMISSION" };

type TenantAdminDashboardDTO = {
  generatedAt: string;
  tenant: { id: string; name: string };

  kpis: {
    pendingApprovals: number;
    bookingsToday: number;
    activeBlocks: number;
    unreadMessages: Section<{ count: number }>;
    overdueInvoices: Section<{ count: number; amountNok?: number }>;
  };

  pendingApprovals: Section<{
    rows: Array<{
      id: string;
      ref: string;
      rentalObject: { id: string; title: string };
      requester: { type: "USER" | "ORG"; id: string; name: string };
      start: string;
      end: string;
      hasConflict: boolean;
      createdAt: string;
    }>;
    nextCursor?: string;
    bulkEnabled: boolean;
  }>;

  calendarPreview: Section<{
    window: { from: string; to: string };
    bookings: Array<{ id: string; rentalObjectId: string; start: string; end: string; status: string }>;
    blocks: Array<{ id: string; rentalObjectId: string; start: string; end: string; reason: string }>;
  }>;

  opsRisks: {
    conflicts: Section<{ count: number; top: Array<{ id: string; bookingId: string; severity: string }> }>;
    dataQuality: Section<{ missingPricing: number; missingImages: number; missingRules: number }>;
  };

  organizations: Section<{
    total: number;
    withNoObjects: number;
    unassignedObjects: number;
    topNeedingAttention: Array<{ orgId: string; name: string; missingAssignments: boolean }>;
  }>;

  economy: Section<{
    month: { invoicesCount: number; totalNok: number; overdueCount: number };
    recentPayments: Array<{ id: string; provider: string; status: string; amountNok: number; at: string }>;
  }>;

  communications: Section<{
    unreadConversations: number;
    latest: Array<{ conversationId: string; from: string; snippet: string; at: string }>;
  }>;

  governance: {
    audit: Section<{ latest: Array<{ id: string; actor: string; action: string; at: string }> }>;
    systemLogs: Section<{ latest: Array<{ id: string; level: string; message: string; at: string }> }>;
  };
};

Implementation rules
	•	Do not do N+1. One query per widget section max (or combined aggregates).
	•	Section gating logic is computed by:
	•	subscription entitlements (plan)
	•	feature flags (enabled/disabled)
	•	RBAC permissions

⸻

2) Feature Flag Registry (canonical list + ownership + dependencies)

This is the “control plane” definition.
One flag = one end-to-end module.

Canonical model

A) Module registry entry

type ModuleKey =
  | "CORE_AUTH"
  | "TENANT_ADMIN"
  | "ORG_MGMT"
  | "RENTAL_OBJECTS"
  | "BOOKINGS"
  | "BOOKING_APPROVALS"
  | "CALENDAR"
  | "BLOCKS"
  | "SEASON_RENTAL"
  | "PRICING"
  | "INVOICING"
  | "PAYMENTS"
  | "REPORTING"
  | "ANALYTICS"
  | "MESSAGING"
  | "MESSAGE_TEMPLATES"
  | "NOTIFICATIONS"
  | "FAVORITES"
  | "RATINGS"
  | "ACTIVITIES"
  | "AUDIT_LOG"
  | "SYSTEM_LOGS"
  | "MONITORING"
  | "GDPR"
  | "RAG"
  | "SEO"
  | "GEO"
  | "INTEGRATION_IDPORTEN"
  | "INTEGRATION_SIGNICAT"
  | "INTEGRATION_VIPPS"
  | "INTEGRATION_STRIPE"
  | "INTEGRATION_POSTMARK"
  | "INTEGRATION_TWILIO"
  | "WEBHOOKS";

B) Ownership categories
	•	PLATFORM: Xala SaaS admin (global)
	•	TENANT: Tenant admin can toggle (within subscription)
	•	ORG: org admin can configure (only if tenant allows)

Each module has:
	•	owner: "PLATFORM" | "TENANT" | "ORG"
	•	dependencies: ModuleKey[]
	•	surfaces: { api: string[], sdk: string[], ui: { app: string; routes: string[] }[] }
	•	defaultState: "ON" | "OFF"
	•	modes: ["OFF","ON"] or ["OFF","READONLY","ON"]

⸻

Dependency map (high-value)

Core
	•	TENANT_ADMIN depends on CORE_AUTH
	•	ORG_MGMT depends on TENANT_ADMIN
	•	RENTAL_OBJECTS depends on TENANT_ADMIN
	•	BOOKINGS depends on RENTAL_OBJECTS + CORE_AUTH
	•	CALENDAR depends on BOOKINGS
	•	BLOCKS depends on CALENDAR
	•	BOOKING_APPROVALS depends on BOOKINGS
	•	SEASON_RENTAL depends on BOOKINGS + CALENDAR

Economy
	•	PRICING depends on RENTAL_OBJECTS
	•	INVOICING depends on PRICING + BOOKINGS
	•	PAYMENTS depends on INVOICING
	•	INTEGRATION_VIPPS depends on PAYMENTS
	•	INTEGRATION_STRIPE depends on PAYMENTS (and STRIPE billing for SaaS if needed)

Communication
	•	NOTIFICATIONS depends on CORE_AUTH
	•	MESSAGING depends on CORE_AUTH
	•	MESSAGE_TEMPLATES depends on MESSAGING
	•	INTEGRATION_POSTMARK depends on NOTIFICATIONS
	•	INTEGRATION_TWILIO depends on NOTIFICATIONS
	•	WEBHOOKS depends on TENANT_ADMIN

Governance/Compliance
	•	AUDIT_LOG depends on TENANT_ADMIN
	•	SYSTEM_LOGS depends on TENANT_ADMIN
	•	MONITORING depends on SYSTEM_LOGS
	•	GDPR depends on CORE_AUTH

UX modules
	•	FAVORITES depends on CORE_AUTH + RENTAL_OBJECTS
	•	RATINGS depends on CORE_AUTH + RENTAL_OBJECTS
	•	ACTIVITIES depends on CORE_AUTH + RENTAL_OBJECTS
	•	SEO depends on RENTAL_OBJECTS
	•	GEO depends on RENTAL_OBJECTS
	•	RAG depends on CORE_AUTH + RENTAL_OBJECTS (optional)

⸻

Registry output file (shared)

Create:
	•	packages/shared/src/modules/registry.ts
	•	packages/shared/src/modules/dependencies.ts
	•	docs/modules/registry.md

Registry includes “capabilities” map:
	•	e.g. capabilities.ratings = moduleEnabled("RATINGS")

⸻

How these two deliverables connect
	•	Dashboard endpoint uses gating:
	•	if MESSAGING off ⇒ communications section returns enabled:false
	•	Sidebar uses same capabilities map
	•	SDK disables hooks/mutations based on modules
	•	Subscription plan defines allowed modules (entitlements)
	•	Tenant admin toggles only allowed modules
