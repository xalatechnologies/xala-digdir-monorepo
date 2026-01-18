1) Requirements Matrix (Roles × Functionalities)

Roles (final set)
	•	SAAS-SUPER = SaaS Admin (platform operator across tenants)
	•	BO-TENANT-ADMIN = Kommune/Tenant Admin (operational admin inside one tenant)
	•	BO-ORG-ADMIN = Backoffice Organization Admin (partner/umbrella org admin inside tenant)
	•	BO-ORG-MEMBER = Backoffice Organization Member (utleier/økonomi/operativ; permission-based)
	•	MS-END-USER = Innbygger / End User (MinSide)
	•	MS-ORG-REP = Membership Org Representative (MinSide org context only)

Legend: ✅ full · 🟡 limited · 🔒 permission-gated · ⛔ none · ⚑ feature-flag · 💳 payments · 🧾 invoicing · 🧠 RAG

⸻

A) Platform / Tenant / Governance

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Manage tenants (create/suspend)	✅	⛔	⛔	⛔	⛔	⛔
Subscription/plan management	✅	🟡 (view/limits)	⛔	⛔	⛔	⛔
Feature flags registry + toggles	✅	🟡 (tenant-level if allowed)	⛔	⛔	⛔	⛔
Global monitoring/health across tenants	✅	⛔	⛔	⛔	⛔	⛔
Tenant configuration (local settings, holidays, policies)	⛔	✅	🟡	⛔	⛔	⛔
Audit log (tenant)	🟡 (platform audit)	✅	🟡 (org scope)	🟡 (own actions)	🟡 (own data)	🟡 (own data)
Incident log (tenant ops)	🟡	✅	🟡	⛔	⛔	⛔


⸻

B) Organizations (Backoffice orgs vs MinSide orgs)

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Backoffice organizations CRUD (umbrella/partner orgs)	⛔	✅	🟡 (own org)	⛔	⛔	⛔
Assign rental objects to backoffice organizations	⛔	✅	🟡 (request/limited)	⛔	⛔	⛔
Manage org members (backoffice org users)	⛔	✅	✅	🔒	⛔	⛔
Membership orgs (MinSide context from registries)	⛔	⛔	⛔	⛔	✅ (view/select)	✅ (view/select)
Act “on behalf of membership org” for pricing/booking context	⛔	⛔	⛔	⛔	🟡 (if allowed)	✅


⸻

C) Rental Objects (Utleieobjekter)

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
View all rental objects (tenant scope)	⛔	✅	🟡 (assigned only)	🟡 (assigned only)	✅ (published only)	✅ (published only)
Create rental object	⛔	✅	✅ (assigned scope)	🔒	⛔	⛔
Edit rental object metadata	⛔	✅	✅ (assigned scope)	🔒	⛔	⛔
Publish/archive/clone	⛔	✅	✅ (assigned scope)	🔒	⛔	⛔
Configure booking policy (modes, slots, rules)	⛔	✅	✅ (assigned scope)	🔒	⛔	⛔
Configure add-ons (additional services) ⚑	⛔	✅	✅ (assigned scope)	🔒	🟡 (select only)	🟡 (select only)
Configure amenities/metadata/SEO/geo	⛔	✅	✅ (assigned scope)	🔒	⛔	⛔


⸻

D) Discovery & Public Web (Filters/Cards/Details)

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Public browse/search/filter	⛔	🟡	🟡	🟡	✅	✅
Map view ⚑	⛔	🟡	🟡	🟡	⚑	⚑
Details tabs dynamic (pricing/addons/activities) ⚑	⛔	🟡	🟡	🟡	⚑	⚑
Favorites/likes ⚑	⛔	⛔	⛔	⛔	⚑	⚑
Ratings/reviews ⚑	⛔	🟡 (moderation)	🟡 (moderation if allowed)	⛔	⚑	⚑


⸻

E) Booking Engine (Single/All-day/Recurring/Season) + Conflicts

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Create booking (single/range/all-day)	⛔	🟡 (on behalf)	🟡 (on behalf)	🟡 (on behalf)	✅	✅
Recurring booking preview + conflicts ⚑	⛔	🟡	🟡	🟡	⚑	⚑
Season rental flows ⚑	⛔	🟡	🟡	🟡	⚑	⚑
Alternatives suggestions on conflict	⛔	✅	✅	🟡	✅	✅
Booking visibility / privacy controls	⛔	🔒 (policy config)	🔒	⛔	✅	✅


⸻

F) Approval, Payments, Deposits, Invoicing

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Approval workflows ⚑	⛔	✅	✅ (assigned scope)	🟡	⚑ (submit/track)	⚑ (submit/track)
Online payments (Vipps/Stripe) ⚑ 💳	🔒	✅	✅	🟡	⚑	⚑
Deposit / reservation fee ⚑ 💳	🔒	✅	✅	🟡	⚑	⚑
Invoices & reconciliation 🧾	🟡 (platform billing only)	✅	🟡 (org scope)	🟡 (if permitted)	🟡 (view/pay)	✅ (org invoices)


⸻

G) Messaging, Notifications, Help, Support, RAG

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
Notification center (websocket) ⚑	🟡	⚑	⚑	⚑	⚑	⚑
Messaging/conversations ⚑	🔒	✅	✅	🟡	⚑	⚑
Template management (confirm/remind/reject/change) ⚑	⛔	✅	🟡 (if allowed)	⛔	⛔	⛔
Help pages + right-side TOC	🟡	✅	✅	✅	✅	✅
Support tickets / contact ⚑	🟡	✅	✅	✅	✅	✅
RAG assistant/search 🧠 ⚑	🔒	⚑	⚑	⚑	⚑	⚑


⸻

H) Security, Compliance, RLS, Auditability

Functionality	SAAS-SUPER	BO-TENANT-ADMIN	BO-ORG-ADMIN	BO-ORG-MEMBER	MS-END-USER	MS-ORG-REP
RBAC policy management	🔒	✅	🟡 (org scope)	⛔	⛔	⛔
Permission overrides by scope	🔒	✅	🟡	⛔	⛔	⛔
RLS enforced everywhere	✅	✅	✅	✅	✅	✅
GDPR consents & DSAR	🔒	✅ (tenant governance)	🟡	⛔	✅ (self)	✅ (self)
Export user data / delete requests	🔒	✅	🟡	⛔	✅ (self)	✅ (self)


⸻

2) Master Prompt — “10× Development Technique” (Copy/Paste)

You are a Senior Principal Architect + Product Engineer specializing in enterprise multi-tenant SaaS (RBAC, RLS, feature flags, contract-first APIs, Playwright E2E). 
Goal: deliver 10× velocity WITHOUT regressions using an “Audit → Analyze → Implement → Verify → Document” loop.

PROJECT CONTEXT (non-negotiable):
- Apps: web (public), backoffice, minside, saas-admin, api, client-sdk, ds (design system).
- Terminology: use “rental_object” (utleieobjekt). Categories: “Lokaler og baner”, “Arrangementer og tjenester”, “Utstyr og kjøretøy”.
- Org concept split:
  1) Backoffice organizations = tenant-controlled umbrella/partner orgs managing assigned rental objects.
  2) MinSide organizations = membership orgs loaded at sign-in (registry), used only as booking context and pricing.
- Contract-first: UI has zero business logic. Backend returns BookingPolicy, PaymentPolicy, Tabs, Availability statuses, Price preview, etc.
- Feature flags are module-based and must disable/enable END-TO-END across ALL apps (sidebar, routes, API, SDK, hooks, DTOs, tests).
- No CRUD modals: create/edit are dedicated pages with breadcrumbs + PageHeader. Only confirmation/info dialogs allowed (DS dialog).
- Design system rules: no raw HTML; only DS components and tokens; add tokens via extension if needed; i18n nb/en; SSR-safe.

TASK:
1) AUDIT:
   - Inventory existing routes, menus, modules, DTOs, API endpoints, and feature flags across all apps.
   - Identify mismatches vs the Requirements Matrix (roles × capabilities).
2) ANALYZE:
   - Produce a gap list (missing/broken/inconsistent). Prioritize by user-visible impact and risk.
   - For each gap, specify: impacted apps, required DTO/endpoint changes, required SDK/hook changes, required UI components, required RLS/RBAC checks, and feature-flag gates.
3) IMPLEMENT PLAN:
   - Provide an implementation plan in phases (Phase 0: safety fixes; Phase 1: core flows; Phase 2: advanced flows; Phase 3: polish).
   - For each phase, provide concrete tasks with acceptance criteria and test IDs.
4) VERIFY:
   - Map tasks to Playwright E2E tests per app and per role.
   - Include tests for: returnTo auth flow, feature flag toggling end-to-end, recurring conflict suggestions, approval/payment/deposit variants, no-CRUD-modals, and help pages with right-side TOC.
5) DELIVERABLES (must output):
   - Updated canonical DTO contracts list (only those needed by frontend).
   - A canonical Feature Flag Registry (name, scope, dependencies, default, owners).
   - A route tree per app (web/backoffice/minside/saas-admin) showing guarded routes and flags.
   - A final “Done Definition” checklist (functional, security, accessibility, performance, i18n, docs).

OUTPUT FORMAT:
- Start with a concise executive summary.
- Then provide: Gap List → Phased Plan → DTO changes → Feature Flag Registry → Route Trees → Playwright Matrix mapping → Definition of Done.
- Be explicit and deterministic. No vague advice. Provide exact artifact names and where they should live in the repo.

CONSTRAINT:
- Minimize breaking changes; prefer additive + deprecation.
- Keep UI consistent with reusable DS page patterns (PageHeader, Breadcrumbs, FilterBar, DataTable, Wizard pages).
