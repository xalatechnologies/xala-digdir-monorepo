Yes — I dug into the Vipps MobilePay API docs, and you can absolutely use Vipps
MobilePay Login (OIDC/OAuth2) + payments (Checkout API or ePayment API) as your
unified auth + payment layer. ￼

Also: you wrote “WIPS” — I’m assuming you mean Vipps (Vipps MobilePay).

Below is a master prompt you can give to Cursor / Claude / Replit as a single
task. It’s written to fit your Digilist constraints (SDK-first, audit-first,
RFC7807, real-time).

⸻

Master Prompt: Integrate Vipps MobilePay Login + Payments (Digilist)

You are a senior full-stack engineer integrating Vipps MobilePay into Digilist
as the primary login and payment solution.

Context •	Backend: Unified REST API (Fastify/Nest-like structure), RFC7807
errors, audit logging to DB, WebSocket events. •	Client: @digilist/client-sdk
(TypeScript), used by multiple frontends. •	Roles: Public, User (Innbygger),
Saksbehandler, Admin, TenantAdmin. •	Compliance: GDPR + WCAG 2.1 AA
documentation, multi-tenant (tenantId is mandatory).

Goal

Implement: 1.	Vipps Login API (OIDC/OAuth2) for secure authentication. 2.	Vipps
Payments using Checkout API (preferred for full checkout) OR ePayment API
(payment requests) — choose best fit for municipal booking checkout (booking +
pay + receipt). Checkout supports “hosted” flows and “Checkout Direct” where
Vipps handles the session at checkout.vipps.no and redirects back. ￼ 3.	Webhooks
for real-time payment status updates + fallback polling where required. Vipps
explicitly recommends implementing both webhooks and polling for ePayment. ￼

⸻

A) Decide flow (and document it)

A1. Login flow (must)

Use Login API v2.0 with standard OAuth2/OIDC concepts: •	OIDC discovery
(well-known), JWKS, authorize, token, optional userinfo/scopes. ￼ •	Website
login flow is supported (user enters phone → confirms in app → redirect back). ￼

Deliver: •	docs/ard/ard-integrations.md section: “Vipps Login (OIDC)
Architecture” •	Threat model notes: token storage, CSRF, replay, redirect URI
rules.

A2. Payment flow (must)

Pick one primary option (justify choice in ARD):

Option 1: Checkout API (recommended for a booking checkout) •	Create checkout
session from backend •	Redirect user to Vipps hosted checkout •	Receive
callback + verify session via API •	Use webhooks for session/payment events
•	Store receipt/bilag details for bookkeeping needs

Docs emphasize using latest version and mention Checkout Direct (hosted flow)
and migration guide. ￼

Option 2: ePayment API (payment request style) •	Create payment → user gets push
in Vipps app •	Track status via webhooks + mandatory polling fallback. ￼

⸻

B) Implementation requirements

B1. Secrets & configuration

Create a VippsConfig per tenant (DB-backed settings): •	client_id,
client_secret, Ocp-Apim-Subscription-Key, merchantSerialNumber Vipps quick
starts list these as required keys for both Login and Checkout/ePayment. ￼

Add environment variables for platform defaults + per-tenant overrides.

B2. Backend endpoints

Add a dedicated integration controller namespace:

Auth •	POST /api/auth/vipps/start → returns authorization URL + state/nonce
•	GET /api/auth/vipps/callback → exchanges code for tokens, validates ID token,
creates/links Digilist user, sets session •	POST /api/auth/vipps/logout (if
applicable) + local session invalidation

Payments (choose Checkout or ePayment) •	POST /api/payments/vipps/session
(Checkout) OR POST /api/payments/vipps/create (ePayment) •	GET
/api/payments/vipps/:reference/status → server-verified status (polling
fallback) •	POST /api/webhooks/vipps → webhook receiver (signature/secret
validation, idempotency)

B3. Webhooks

Implement Webhooks API registration + event handling: •	Create webhook
registration job per tenant/environment •	Verify payload integrity, implement
idempotency (eventId) Docs provide webhook guide + event types listing. ￼

B4. Domain rules mapping •	Booking states: DRAFT → PENDING_PAYMENT → CONFIRMED →
CANCELLED/EXPIRED •	Payment states: map Vipps statuses to booking transitions
•	Cancellation rules: municipal cancellations must notify and audit.

B5. Audit + realtime

Every event must: •	Write to audit_logs •	Broadcast via WebSocket (/ws/audit and
tenant events) Examples of audited actions: payment initiated, authorized,
captured, refunded, cancelled, login success/failure.

B6. RFC7807 errors

All failures return Problem Details: •	invalid config (missing
merchantSerialNumber etc.) •	webhook validation failed •	payment session not
found •	status mismatch or already finalized

⸻

C) SDK work (@digilist/client-sdk)

Add services: •	vippsAuthService: •	startLogin(), handleCallback(), logout()
•	vippsPaymentService: •	createCheckoutSession(bookingId) or
createPayment(bookingId) •	getPaymentStatus(reference) •	Ensure SSR-safe exports
(no React Query duplication). Make react-query a peerDependency if hooks are
exported.

⸻

D) Testing (must be automated)

D1. Unit tests •	Token validation / id_token parsing •	webhook idempotency and
signature checks •	status mapping logic

D2. Integration tests •	Start login → callback exchange (mock Vipps endpoints)
•	Create payment/session → status polling → webhook updates •	Failure modes with
RFC7807 assertions

D3. E2E smoke (Playwright) •	User books a time slot → redirected to Vipps
checkout (mock) → returns → booking confirmed

⸻

E) Documentation deliverables (must)

Create/Update: •	docs/prd/prd-integrations.md (Vipps Login + Vipps Pay)
•	docs/prp/prp-integrations.md (delivery plan, milestones, QA checklist)
•	docs/ard/ard-integrations.md (sequence diagrams, security model, tenancy
config) •	docs/bdd/bdd-integrations.feature.md with scenarios: •	“Login with
Vipps success” •	“Login denied” •	“Payment completed updates booking” •	“Webhook
replay does not double-process” •	“Polling fallback reconciles payment status”
Also update: •	docs/traceability/traceability.json to link KRAV-GEN-04
(ID-porten equivalent—note: Vipps Login is not ID-porten) and KRAV-GEN-09 to
integrations module entries.

Important note: Digilist requires ID-porten for citizen authentication in many
procurements; Vipps Login is not the same product. Document this explicitly as
either: •	“Vipps Login for payments + optional login convenience” •	and keep
ID-porten as mandatory for municipal compliance (separate integration).

⸻

F) Acceptance checklist •	Runs in test env with Vipps keys •	Webhooks verified
and idempotent •	Booking transitions correct •	Audit logs and websocket events
emitted •	RFC7807 errors consistent •	Security reviewed (redirect URIs,
state/nonce, key handling) •	Docs + BDD completed

⸻

Notes from Vipps docs you must follow •	Login API is OAuth2/OIDC based, with a
checklist for OIDC endpoints and common pitfalls. ￼ •	Webhooks have their own
API guide + quick start. ￼ •	For ePayment, implement both webhooks and polling.
￼ •	Checkout API quick start lists required keys (client_id, client_secret,
subscription key, merchantSerialNumber). ￼

⸻

If you tell me which frontend you’ll use for checkout (hosted redirect vs
embedded vs payment request), I’ll tighten the prompt into a “single-flow only”
version with exact endpoint names, data models (Payment table + Booking join),
and BDD scenarios tailored to that path.
