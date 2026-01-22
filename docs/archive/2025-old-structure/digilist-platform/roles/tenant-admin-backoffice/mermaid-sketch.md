Yep — below are Mermaid + ASCII sketches you can drop into docs/ui-blueprint/ (Mermaid renders nicely in GitHub/Notion). I’m also baking in the “feature flag must be granular down to nav item / tab / action” requirement with a clean capability model.

⸻

1) Mermaid: Backoffice Route Tree

flowchart TD
  A[/backoffice/] --> D[dashboard]

  A --> RO[rental-objects]
  RO --> RO_L[list]
  RO --> RO_N[new wizard]
  RO --> RO_ID[/:id detail]
  RO --> RO_E[/:id/edit]
  RO --> RO_C[/:id/clone wizard]
  RO_ID --> RO_TABS{tabs}
  RO_TABS --> RO_OV[overview]
  RO_TABS --> RO_RULES[rules]
  RO_TABS --> RO_AV[availability]
  RO_TABS --> RO_PR[pricing]
  RO_TABS --> RO_AS[assignments]
  RO_TABS --> RO_AUD[audit]

  A --> ORG[organizations]
  ORG --> ORG_L[list]
  ORG --> ORG_N[new]
  ORG --> ORG_ID[/:id detail]
  ORG --> ORG_E[/:id/edit]
  ORG_ID --> ORG_TABS{tabs}
  ORG_TABS --> ORG_OV[overview]
  ORG_TABS --> ORG_AS[assignments page]
  ORG_TABS --> ORG_MEM[members page]
  ORG_TABS --> ORG_AUD[audit]

  A --> BK[bookings]
  BK --> BK_P[pending]
  BK --> BK_A[approved]
  BK --> BK_R[rejected]
  BK --> BK_ALL[all]
  BK --> BK_ID[/:id detail]

  A --> CAL[calendar]
  CAL --> CAL_M[month/week/day]
  CAL --> CAL_T[timeline]

  A --> ACC[access]
  ACC --> U[users]
  U --> U_L[list]
  U --> U_ID[/:id]
  U --> U_E[/:id/edit]
  ACC --> INV[invite wizard]
  ACC --> ROLES[roles]
  ACC --> PERMS[permissions]

  A --> GOV[governance]
  GOV --> AUD[audit]
  GOV --> LOGS[system-log]
  GOV --> INC[incidents]

  A --> ECO[economy]
  ECO --> INVL[invoices]
  ECO --> PAY[payments]
  ECO --> PG[pricing-groups]

  A --> MSG[messages]
  MSG --> INB[inbox]
  MSG --> CONV[conversation/:id]

  A --> MT[message-templates]
  MT --> MT_L[list]
  MT --> MT_N[new]
  MT --> MT_E[/:id/edit]

  A --> SET[settings]
  SET --> TEN[tenant]
  SET --> FEAT[features]
  SET --> INT[integrations]


⸻

2) Mermaid: Canonical Page Skeleton (List + Detail + Edit + Wizard)

flowchart TB
  subgraph ListPage[Management List Page]
    L1[DsPageShell] --> L2[DsPageHeader\n(title + breadcrumbs + actions)]
    L2 --> L3[DsToolbar\n(search + filters + bulk actions)]
    L3 --> L4[DsDataTable\n(sort + pagination + row actions)]
    L4 --> L5[Confirm Dialogs ONLY\n(delete/archive)]
  end

  subgraph DetailPage[Detail Page]
    D1[DsPageShell] --> D2[DsPageHeader\n(breadcrumbs + actions)]
    D2 --> D3[DsPageTabs\n(overview/rules/pricing/...)]
    D3 --> D4[Read-only sections]
  end

  subgraph EditPage[Edit Page]
    E1[DsPageShell] --> E2[DsPageHeader\n(breadcrumbs + Save/Cancel)]
    E2 --> E3[DsPageTabs\n(form sections)]
    E3 --> E4[DsFormSection blocks]
  end

  subgraph WizardPage[Wizard Page]
    W1[DsPageShell] --> W2[DsPageHeader\n(breadcrumbs)]
    W2 --> W3[DsStepper\n(steps)]
    W3 --> W4[Step form]
    W4 --> W5[Review & Submit]
  end


⸻

3) ASCII: Sidebar + Capability-Gated Nav Items

BACKOFFICE SIDEBAR (Tenant Admin)

[Overview]
  - Dashboard

[Operations]
  - Bookings
    - Pending
    - Approved
    - Rejected
    - All
  - Calendar
  - Blocks (maintenance/closed)

[Catalog]
  - Rental Objects
  - Organizations (Backoffice orgs)
  - Pricing Groups        (if PRICING enabled)

[Access]
  - Users
  - Roles                (if RBAC_ADVANCED enabled)
  - Permissions           (if RBAC_ADVANCED enabled)

[Comms]
  - Messages             (if MESSAGING enabled)
  - Message Templates    (if MESSAGE_TEMPLATES enabled)

[Economy]
  - Invoices             (if INVOICING enabled)
  - Payments             (if PAYMENTS enabled)

[Governance]
  - Audit Log            (if AUDIT enabled)
  - System Log           (if SYSTEM_LOGS enabled)
  - Incidents            (if INCIDENTS enabled)

[Settings]
  - Tenant Settings
  - Features             (if FEATURE_TOGGLES allowed for tenant)
  - Integrations         (if INTEGRATIONS enabled)


⸻

4) Feature Flag Flexibility: “Module → Surface → Capability” model

You’re asking for more than a simple module ON/OFF. You need:
	•	SaaS Admin can remove a whole module for a tenant (subscription/entitlement)
	•	Tenant Admin can toggle sub-features within allowed entitlements
	•	UI can hide:
	•	Sidebar item
	•	Route
	•	Tab within detail page
	•	Button/action in table row actions
	•	Form section within an edit page
	•	API must enforce the same, so it’s not “security by UI”.

✅ Use a 3-layer flag system (authoritative, stable)

Layer 1 — Entitlements (Plan/Subscription)
	•	Set by SaaS Admin
	•	Hard constraint: tenant cannot exceed it

Layer 2 — Tenant Feature Toggles (within entitlements)
	•	Controlled by Tenant Admin (if permitted)
	•	Enables/disables modules and subfeatures

Layer 3 — Capabilities (computed runtime)
	•	Derived from (Entitlements ∩ Toggles ∩ RBAC)
	•	Returned in /session as capabilities

⸻

5) Mermaid: Capability Resolution Flow

sequenceDiagram
  autonumber
  participant SA as SaaS Admin
  participant DB as Platform DB
  participant API as API
  participant UI as App UI

  SA->>DB: Set tenant plan entitlements (modules/subfeatures)
  SA->>DB: Force-disable any capability (kill-switch)

  UI->>API: GET /auth/session
  API->>DB: Load user + roles + tenant + entitlements + toggles
  API->>API: Compute capabilities = entitlements ∩ toggles ∩ RBAC
  API-->>UI: session { user, permissions, capabilities }

  UI->>UI: Build sidebar from capabilities
  UI->>UI: Guard routes/tabs/actions by capabilities
  UI->>API: Call protected endpoint
  API->>API: Enforce capability on server (deny if disabled)


⸻

6) What “granular” means in practice (example)

Example: RATINGS module
	•	module:RATINGS (global enable)
	•	sub-capabilities:
	•	ratings.web.view
	•	ratings.web.create
	•	ratings.backoffice.moderate
	•	ratings.backoffice.export
	•	turning off module:RATINGS disables all
	•	turning off only ratings.web.create leaves read-only ratings visible

Example: Rental Object Pricing tab
	•	rentalObjects.tabs.pricing
	•	If disabled:
	•	Pricing tab hidden
	•	Pricing endpoints blocked (or read-only)
	•	SDK hook throws FEATURE_DISABLED problem detail

⸻

7) Minimal schema you need to support this (conceptually)

(You didn’t ask for SQL here, just the model)
	•	platform_feature_registry (what exists in the product)
	•	plan_entitlements (what a plan allows)
	•	tenant_entitlements (plan applied to tenant + overrides by SaaS Admin)
	•	tenant_feature_toggles (tenant-controlled toggles within entitlements)
	•	capabilities are computed, not stored (or optionally cached)