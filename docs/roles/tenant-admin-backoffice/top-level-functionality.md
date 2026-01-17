Got it — you’re describing Header-level “command center” UX: Global Search + Real-time Inbox/Notifications that are module-gated, role-aware, and tenant-configurable, and powered by WebSockets + a Search/RAG index.

Below is a drop-in blueprint + mermaid sketches + implementation rules (still aligned with: page-based CRUD, DS-only, i18n, SSR-safe).

⸻

1) Header “Command Center” – What it includes

Header slots (Backoffice)
	•	Global Search (command palette style, but NOT a CRUD surface)
	•	Bell icon (notifications: approvals, system events, messages)
	•	Messages icon (optional, or merged into bell)
	•	User menu (profile + sign out)
	•	Tenant context badge (tenant name + environment)

Rule: Header features are controlled by capabilities (computed from entitlements ∩ toggles ∩ RBAC).
If disabled, the UI hides it AND the API blocks it.

⸻

2) Capability keys (granular, header-level)

These are examples; lock the naming convention and keep it consistent:
	•	header.globalSearch.enabled
	•	header.notifications.enabled
	•	header.messages.enabled
	•	header.globalSearch.index.members
	•	header.globalSearch.index.rentalObjects
	•	header.globalSearch.index.bookings
	•	header.globalSearch.index.organizations
	•	header.globalSearch.index.invoices (if economy enabled)

Also:
	•	messaging.enabled (full module)
	•	notifications.enabled
	•	realtime.enabled (websocket)

⸻

3) Mermaid: Header capability gating + realtime flow

sequenceDiagram
  autonumber
  participant UI as Backoffice UI
  participant API as API
  participant WS as WebSocket
  participant DB as DB/Search Index

  UI->>API: GET /auth/session
  API-->>UI: session { user, permissions, capabilities }

  UI->>UI: Render header based on capabilities
  alt header.globalSearch.enabled
    UI->>API: GET /search/meta (what indices allowed)
    API-->>UI: allowedIndices (members, rentalObjects, bookings, ...)
  end

  alt header.notifications.enabled AND realtime.enabled
    UI->>WS: connect + auth
    WS-->>UI: events (notification:new, message:new, booking:changed)
    UI->>UI: Update badge counts + toast
  else realtime.disabled
    UI->>API: Poll /notifications/unread-count
  end


⸻

4) Global Search – UX contract (important)

Purpose

One input to quickly find:
	•	Members (users)
	•	Rental objects
	•	Bookings
	•	Backoffice organizations
	•	(Optional) invoices, messages, audit events

What it MUST NOT do
	•	It must not edit/create anything.
	•	Selecting an item navigates to:
	•	Detail page (/:id)
	•	Or list page with filters pre-applied

Result format (consistent)

Every result item must include:
	•	icon + entity type label (i18n)
	•	primary text (name/title)
	•	secondary text (email/org/status)
	•	“open” action (navigates)

Result grouping

Grouped sections:
	•	Members
	•	Rental objects
	•	Bookings
	•	Organizations
	•	…only show groups that are enabled by capability

⸻

5) Global Search – data design (RAG/search)

You called it “RAG” — you can support both:
	•	Structured search (fast; for entities)
	•	RAG answer mode (optional; for policy/docs)

Minimum viable (structured)

Implement /search that queries:
	•	users
	•	rental_objects
	•	bookings
	•	backoffice_organizations

Optional RAG mode (later)
	•	“Ask” tab in search that answers questions from:
	•	rules/policies
	•	tender requirements
	•	internal docs
	•	KB content

Feature gate:
	•	search.rag.enabled

⸻

6) SSR-safe header behavior (no hydration bugs)

Rules:
	•	Header renders a skeleton state until session capabilities are loaded
	•	Global Search input is controlled; no reading localStorage on render
	•	Use URL query params for search page fallback:
	•	/backoffice/search?q=...&type=rental_objects

⸻

7) Notifications + Messages (real-time)

Clarify the model

You likely need three streams:
	1.	System Notifications (bell)

	•	booking approval requested
	•	booking changed
	•	payment status changed
	•	policy changes
	•	incidents

	2.	Messages (inbox)

	•	user ↔ admin
	•	org member ↔ admin
	•	admin ↔ org admin

	3.	Operational Alerts (optional)

	•	conflicts detected
	•	outage warnings
	•	suspicious activity

UI behavior
	•	Bell shows unread count
	•	Clicking bell goes to /backoffice/notifications (page)
	•	Clicking message icon goes to /backoffice/messages (page)
	•	In header you can show a small preview dropdown ONLY if you want, but:
	•	It must be read-only preview
	•	“View all” navigates to the page
	•	No message composing in dropdown

Feature gating examples
	•	Disable messaging entirely → hide icon + routes + API blocked
	•	Enable notifications but disable realtime → polling fallback

⸻

8) Mermaid: Messaging participants (admin/org/member/user)

flowchart LR
  U[End User] <--> C1[Conversation] <--> A[Admin]
  OM[Org Member] <--> C2[Conversation] <--> OA[Org Admin]
  OA <--> C3[Conversation] <--> A

  subgraph Controls
    FF[Feature Flags] -->|messaging.enabled| C1
    FF -->|messaging.enabled| C2
    FF -->|messaging.enabled| C3
    RBAC[RBAC] --> C1
    RBAC --> C2
    RBAC --> C3
  end


⸻

9) Concrete “Header spec” for DS components

Add to DS inventory:

DsGlobalSearch

Props:
	•	enabled: boolean
	•	allowedIndices: SearchIndexKey[]
	•	onSelect(result): navigate()
	•	placeholderKey
	•	recentItems (optional)
	•	kbdShortcut (optional)

DsNotificationBell

Props:
	•	enabled
	•	unreadCount
	•	onOpen(): navigate('/notifications')
	•	realtimeConnected: boolean

DsMessagesIcon

Props:
	•	enabled
	•	unreadCount
	•	onOpen(): navigate('/messages')

All are DS-only, token-only, i18n-only.

⸻

10) Route additions for Backoffice (consistent with page-based rule)

/backoffice/search                (full page search results + filters)
/backoffice/notifications          (list)
/backoffice/notifications/:id      (detail)
/backoffice/messages               (inbox list)
/backoffice/messages/:id           (conversation page)
/backoffice/messages/:id/new       (NOT allowed - composing happens on conversation page)


⸻

11) The key control requirement you stated (locked)

“Admin can turn off a header feature, and it disappears everywhere.”

So enforce these policies:
	•	SaaS Admin can set tenant entitlements: header.globalSearch.enabled = false
	•	Tenant cannot override above entitlements
	•	Session returns capabilities, UI builds header off that
	•	API endpoints return RFC7807 FEATURE_DISABLED if called anyway