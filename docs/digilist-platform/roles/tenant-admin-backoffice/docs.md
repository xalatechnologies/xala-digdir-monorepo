Got it — we’ll treat this as three distinct dashboard “help packages”, each with its own app context, duties, and allowed surfaces:
	1.	Tenant Admin (Backoffice) — municipality/tenant governance
	2.	Organization Admin + Organization Member (Backoffice) — NOT MinSide; delegated management of assigned rental objects
	3.	End User (MinSide) — citizen + membership org representation (MinSide orgs)

Below is a complete Help & Support package blueprint for all three, designed to be feature-flag + RBAC aware, page-based, DS-only, i18n-first.

⸻

1) Canonical Terminology (locked)
	•	Backoffice Organization (Governing org): tenant-controlled umbrella/partner org entity in Backoffice
	•	Delegated Organization Admin/Member (Backoffice users): users who log into Backoffice with scoped access to assigned rental objects (delegated by tenant/org admin)
	•	MinSide User Organization (Membership org): user-affiliated org loaded at sign-in; exists only in MinSide context

✅ This means:
	•	Org Admin/Org Member dashboards are Backoffice dashboards with limited menus + scoped data.
	•	End User dashboard is MinSide.

⸻

2) Help & Support: Universal module (exists everywhere)

Routes (per app)

Backoffice
	•	/backoffice/help
	•	/backoffice/help/guides
	•	/backoffice/help/faq
	•	/backoffice/help/contact (feature-gated)
	•	/backoffice/help/status (feature-gated)

MinSide
	•	/minside/help
	•	/minside/help/guides
	•	/minside/help/faq
	•	/minside/help/contact (feature-gated)

Capability keys
	•	help.enabled (default true)
	•	help.guides.enabled
	•	help.faq.enabled
	•	help.tips.enabled
	•	help.contact.enabled
	•	help.systemStatus.enabled
	•	help.ragAssistant.enabled (optional)

DS components (shared)
	•	DsHelpShell (nav + content)
	•	DsHelpIndex (search + category cards)
	•	DsHelpArticle (markdown renderer w/ DS typography tokens)
	•	DsHelpCallout (tips/warnings/info)
	•	DsHelpFeedback (“was this helpful?”, optional)

Rule: Help is read-only in tenant apps. Managing help content belongs only in SaaS Admin (optional later).

⸻

3) Role-specific Help Packages (the “entire package”)

Each package contains:
	•	Quick Start
	•	Common tasks
	•	Role boundaries (“what you can/can’t do”)
	•	Troubleshooting
	•	Tips & shortcuts
	•	Glossary (rental object, backoffice org, MinSide org)
	•	Links to exact pages (page-based, no modals)

A) Tenant Admin (Backoffice) — Help package

Purpose

Guide tenant admins to operate the platform: organizations, rental objects, access, approvals, governance, feature toggles, integrations.

“What you can do”
	•	Manage backoffice organizations and assignment of rental objects
	•	Manage tenant users, roles, access scope
	•	Govern booking rules/approval flows
	•	Configure tenant-level settings within entitlements
	•	View system logs/audit (if enabled)

Core guides (minimum set)
	1.	Dashboard overview
	•	KPIs, work queue, shortcuts
	2.	Rental objects lifecycle
	•	Create → configure rules → availability → pricing → publish → archive
	3.	Assign rental objects to backoffice organizations
	4.	Manage users and access scope
	•	invite, role, org scope, disable
	5.	Handle booking approvals
	•	pending queue, detail decisions, audit trail
	6.	Blocks and closed periods
	7.	Feature flags and what they affect
	•	nav + routes + tabs + actions
	8.	Integrations
	•	ID-porten/Signicat, payment, notifications (feature-gated)
	9.	Governance
	•	audit log, system log, incident log (feature-gated)

Troubleshooting topics
	•	“I can’t see a menu item” → feature flags or role scope
	•	“I can’t see a rental object” → tenant scope / assignment / status
	•	“Approvals not showing” → filter + permissions
	•	“Login loop” → session/cookies, returnTo, environment mismatch

⸻

B) Organization Admin + Organization Member (Backoffice) — Help package

This is NOT MinSide.
This user logs into Backoffice and only sees the delegated scope.

Purpose

Help delegated org staff manage their assigned rental objects and day-to-day operational booking tasks, without tenant governance access.

Key boundaries (“what you can’t do”)
	•	Cannot create tenant organizations
	•	Cannot manage tenant-wide users
	•	Cannot change tenant feature configuration
	•	Cannot access platform governance settings unless granted

Core guides (minimum set)
	1.	Your limited Backoffice dashboard
	•	what the sidebar contains for you
	2.	Your assigned rental objects
	•	list, search, status, what “assigned” means
	3.	Availability and blocks
	•	add block periods, maintenance windows (page-based)
	4.	Bookings
	•	view, approve/reject if delegated, communicate with requester
	5.	Pricing
	•	edit pricing only if feature + permission enabled
	6.	Messages
	•	reply to users/org requesters, templates if enabled
	7.	Reports
	•	exports for assigned scope only (if enabled)
	8.	Escalation workflow
	•	when to forward issues to tenant admin

Troubleshooting topics
	•	“Why can’t I see other rental objects?” → scope is assignment-based
	•	“Why can’t I approve?” → permission missing or approval flow requires tenant admin
	•	“Why is pricing tab missing?” → feature disabled or role lacks capability

⸻

C) End User (MinSide) — Help package

Purpose

Help citizens and membership-org representatives to find rental objects, book, pay, manage bookings, and communicate.

Context
	•	They may act as private person or as MinSide User Organization (membership org loaded at sign-in)
	•	They do not manage rental objects; they request bookings

Core guides (minimum set)
	1.	Dashboard overview
	•	upcoming bookings, notifications, quick actions
	2.	Find rental objects
	•	search, filters, categories, map (if enabled)
	3.	Booking flow
	•	select time, rules, submit request, confirmation
	4.	Approvals
	•	what “pending approval” means
	5.	Payments & invoices
	•	view invoices, pay (if enabled)
	6.	Messages
	•	communicate with admins/org handlers (if enabled)
	7.	Favorites
	•	save rental objects (if enabled)
	8.	Profile & consents
	•	GDPR consents, data access, deletion request entry points (if enabled)
	9.	Switch between private and org
	•	if membership org context is available

Troubleshooting topics
	•	“Authentication required” → login + returnTo preserved
	•	“No available times” → blocks, rules, fully booked
	•	“My org isn’t listed” → registry sync / user not recognized as member

⸻

4) Content file structure (one place, three packages)

Use one repository structure, per app and role:

docs/help/
  backoffice/
    tenant-admin/
      overview.md
      dashboard.md
      rental-objects.md
      assignments.md
      bookings-approvals.md
      access.md
      feature-flags.md
      troubleshooting.md
      glossary.md
    org-admin/
      overview.md
      dashboard.md
      assigned-rental-objects.md
      bookings.md
      availability-blocks.md
      messaging.md
      troubleshooting.md
      glossary.md
    org-member/
      overview.md
      day-to-day.md
      bookings.md
      availability-blocks.md
      troubleshooting.md
      glossary.md

  minside/
    end-user/
      overview.md
      find-and-book.md
      approvals.md
      payments.md
      messaging.md
      profile-consents.md
      troubleshooting.md
      glossary.md

Rendering rule: DsHelpArticle renders markdown with DS typography tokens only.

⸻

5) Sidebar integration rule (role-aware)

Backoffice sidebar always includes:
	•	Help & Support

But content is resolved by role:
	•	Tenant Admin → docs/help/backoffice/tenant-admin/*
	•	Org Admin → docs/help/backoffice/org-admin/*
	•	Org Member → docs/help/backoffice/org-member/*

MinSide:
	•	End User → docs/help/minside/end-user/*

⸻

6) Master prompt to implement all of this (copy/paste)

Implement Help & Support as a universal module across Backoffice and MinSide, with role-specific help packages:
Roles:
- Backoffice Tenant Admin
- Backoffice Organization Admin (delegated management of assigned rental objects)
- Backoffice Organization Member (delegated scoped operator)
- MinSide End User (citizen + membership org representation)

Rules:
- Page-based only (no modal CRUD)
- DS-only components + tokens, no raw HTML in pages
- i18n keys only for UI labels
- SSR/hydration safe (capabilities loaded before nav)
- Feature flags must hide sidebar items, routes, tabs, actions AND block API access

Deliverables:
1) Routes:
  Backoffice: /backoffice/help, /guides, /faq, /contact?, /status?
  MinSide: /minside/help, /guides, /faq, /contact?
2) DS components:
  DsHelpShell, DsHelpIndex, DsHelpArticle, DsHelpCallout (token-only)
3) Content structure:
  docs/help/backoffice/{tenant-admin|org-admin|org-member}/*.md
  docs/help/minside/end-user/*.md
4) Role-aware content resolver:
  When Backoffice user logs in, choose help package based on role and scope.
5) Add “feature flag awareness”:
  help.* capabilities gate sections, links, and pages.
6) Add Playwright tests:
  - Help visible in sidebar in all apps
  - Correct package is loaded for each role
  - Links navigate to correct pages
