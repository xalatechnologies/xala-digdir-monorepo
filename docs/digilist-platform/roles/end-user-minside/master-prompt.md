MASTER PROMPT PACK — MINSIDE END USER / MEMBERSHIP ORG REPRESENTATIVE
Context: MinSide (user-facing portal)
Identity source: National identity + membership organizations loaded at sign-in
Critical distinction:
- This organization is a USER ORGANIZATION (membership org)
- It is NOT a backoffice organization
- User may act as:
  a) Private individual
  b) Representative of a membership organization

========================================================
0) ABSOLUTE RULES (LOCKED)
========================================================
- Page-based flows only. NO modal CRUD.
- Dialogs only for confirm/info (DS-only).
- NO raw HTML. DS components + tokens only.
- i18n keys only (nb/en).
- SSR + hydration safe.
- Feature flags + subscription + policy MUST gate:
  nav items, routes, actions, sections, AND API access.
- End user NEVER manages rental objects.
- End user NEVER sees backoffice organizations.
- Rental object terminology is read-only for end user.
- Switch between private ↔ organization context must be explicit and visible.

========================================================
1) ROLE DEFINITION — END USER / MEMBERSHIP ORG REP
========================================================
End User is a citizen or a representative of a membership organization.
They CONSUME availability and services defined by backoffice.

End User CAN:
- Browse rental objects
- Search and filter availability
- Create booking requests
- Act as private person OR on behalf of membership org
- View booking status (pending/approved/rejected)
- Pay invoices (if enabled)
- Communicate with admins/handlers (if enabled)
- Manage favorites (if enabled)
- Manage profile, consents, notifications
- Access help & support

End User CANNOT:
- Manage rental objects
- Change availability rules
- Approve bookings
- Access admin/backoffice data
- Configure pricing or policies

========================================================
2) CAPABILITY REGISTRY — END USER (MINSIDE)
========================================================
Core:
- minside.enabled
- rentalObjects.browse
- bookings.create
- bookings.read.own
- calendar.view.own
- profile.manage
- help.enabled

Organization context:
- userOrg.switch.enabled
- bookings.create.onBehalfOfOrg
- invoices.read.org

Optional features:
- favorites.enabled
- messaging.enabled
- messaging.reply.enabled
- payments.enabled
- invoices.enabled
- notifications.enabled
- activities.enabled (events, if applicable)
- help.ragAssistant.enabled (future)

UI surface gating:
- nav.book
- nav.myBookings
- nav.calendar
- nav.messages
- nav.favorites
- nav.payments
- nav.profile
- nav.help

========================================================
3) MINSIDE SIDEBAR — END USER (CANONICAL)
========================================================
Sidebar is contextual and adapts to active identity
(private vs org).

[Overview]
- Dashboard

[Booking]
- Find rental object
- New booking
- My bookings
- My calendar

[Communication] (feature-gated)
- Messages
- Notifications

[Economy] (feature-gated)
- Payments
- My invoices

[Personal]
- Favorites (feature-gated)
- Profile & consents
- Preferences

[Help]
- Help & Support

NO admin, NO organization management here.

========================================================
4) ROUTES + PAGE TREE (STRICT)
========================================================
/minside
  /dashboard

  /book
    /find                     (Search + filters)
    /rental-objects/:id       (Detail + availability)
    /new/:rentalObjectId      (Booking wizard)

  /bookings
    /                          (My bookings list)
    /:id                       (Detail view)

  /calendar
    /                          (My bookings calendar)

  /messages (feature-gated)
    /                          (Inbox)
    /:conversationId

  /payments (feature-gated)
    /                          (Overview)
    /invoices
    /invoices/:id

  /favorites (feature-gated)
    /                          (List)

  /profile
    /                          (Profile)
    /consents                  (GDPR)
    /preferences               (Notifications, language)

  /help
    /                          (Overview)
    /guides
    /faq
    /contact?                  (feature-gated)

========================================================
5) DASHBOARD — END USER (MINSIDE)
========================================================
Dashboard is PERSONAL + CONTEXTUAL.

Widgets:
1) Upcoming bookings
   - Query: GET /bookings?owner=self&limit=5
2) Pending approvals
   - Query: GET /bookings?status=pending&owner=self
3) Active identity
   - Private or Org badge + switch CTA
4) Notifications/messages preview (if enabled)
5) Quick actions:
   - New booking
   - Find rental object

NO editing beyond navigation.

========================================================
6) RENTAL OBJECT BROWSING
========================================================
List:
- Search: name, location, category
- Filters: date, time, capacity, amenities
Detail page:
- Read-only info
- Rules & conditions
- Availability calendar
- CTA: Book

NO admin data exposed.

========================================================
7) BOOKING FLOW (WIZARD-BASED)
========================================================
/book/new/:rentalObjectId

Steps:
1) Select date/time
2) Review rules
3) Select identity:
   - Private
   - Membership org (if available)
4) Additional info
5) Review & submit

Submission:
- Creates booking request
- Status = pending or approved (rule-based)

========================================================
8) MESSAGES — END USER
========================================================
If messaging enabled:
- Inbox
- Thread view
- Reply only (no broadcast)

Messages linked to booking context when applicable.

========================================================
9) PAYMENTS & INVOICES
========================================================
If payments enabled:
- Invoice list
- Invoice detail
- Payment status
- Redirect to provider (Vipps/Stripe)

NO pricing logic visible.

========================================================
10) PROFILE, GDPR & CONSENTS
========================================================
Pages:
- Profile (read/write)
- Consents (read/write)
- Data access request (read-only entry)
- Language & notification preferences

All GDPR actions logged.

========================================================
11) GLOBAL SEARCH (OPTIONAL)
========================================================
If enabled:
- Scope limited to:
  - rental objects
  - own bookings
Selecting result navigates to detail pages.

========================================================
12) SECURITY & DATA SCOPE
========================================================
- User can only access own bookings
- Org bookings only visible when acting as org
- Switching identity re-evaluates permissions + cache
- API enforces ownerId / orgId checks
- Unauthorized access → RFC7807 FORBIDDEN

========================================================
13) TESTING REQUIREMENTS
========================================================
API:
- cannot fetch others’ bookings
- org context enforced
- feature disabled → endpoint blocked

SDK:
- identity switch updates queries
- cache invalidation on switch
- typed errors

E2E (Playwright):
- private ↔ org switch works
- booking as org vs private
- feature flags hide nav/routes
- payments only visible when enabled

========================================================
14) AI DELIVERABLES EXPECTED
========================================================
- UI blueprint markdown:
  docs/ui-blueprint/minside-end-user/*.md
- Capability registry entries
- Route guards + examples
- Booking wizard DTOs
- Identity switch logic
- Playwright test specs

Start with audit:
- Confirm MinSide separation from Backoffice
- Validate no backoffice components leak
- Lock down identity context handling
- Enforce feature flags end-to-end
Implement incrementally.