Below are ready-to-drop-in templates/skeletons for the 4 things you asked. I’m giving them as files + code so your agent can copy/paste into the repo and iterate.

⸻

1) schema-coverage.json template

Path: /docs/quality/schema-coverage.json

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "meta": {
    "project": "digilist",
    "version": "1.0",
    "generatedAt": "2026-01-18",
    "timezone": "Europe/Oslo",
    "rules": {
      "noColumnLeftBehind": true,
      "everyTableHas": ["insertValid", "rejectInvalid", "tenantIsolation"],
      "everyConstraintHas": ["positiveCase", "negativeCase"],
      "everyEnumHas": ["allValuesCovered"],
      "everyIndexHas": ["queryUsesIndexOrJustification"]
    }
  },
  "database": {
    "provider": "postgres",
    "schemaName": "public",
    "migrationsFromScratchTestId": "IT.DB.MIGRATIONS.FRESH"
  },
  "tables": [
    {
      "table": "listings",
      "primaryKey": ["id"],
      "tenantKey": "tenant_id",
      "columns": [
        { "name": "id", "type": "uuid", "nullable": false, "tests": ["IT.DB.LISTINGS.INSERT.VALID"] },
        { "name": "tenant_id", "type": "uuid", "nullable": false, "tests": ["IT.DB.TENANT.ISOLATION.LISTINGS"] },
        { "name": "status", "type": "ListingStatus", "nullable": false, "tests": ["UT.ENUM.LISTING_STATUS.ALL", "IT.DB.LISTINGS.STATUS.VALIDATION"] },
        { "name": "title", "type": "text", "nullable": false, "tests": ["IT.DB.LISTINGS.TITLE.REQUIRED"] },
        { "name": "timezone", "type": "text", "nullable": false, "tests": ["IT.DB.LISTINGS.TIMEZONE.DEFAULT"] }
      ],
      "constraints": [
        { "name": "pk_listings", "type": "PRIMARY_KEY", "tests": ["IT.DB.LISTINGS.PK.UNIQUE"] }
      ],
      "indexes": [
        {
          "name": "idx_listings_tenant_status",
          "columns": ["tenant_id", "status"],
          "tests": ["PT.DB.LISTINGS.QUERY.USES_INDEX_OR_JUSTIFY"]
        }
      ],
      "apis": [
        { "method": "GET", "path": "/listings", "tests": ["IT.API.LISTINGS.LIST.ALLOW", "IT.API.LISTINGS.LIST.DENY"] },
        { "method": "GET", "path": "/listings/{id}", "tests": ["IT.API.LISTINGS.GET.ALLOW", "IT.API.LISTINGS.GET.IDOR"] }
      ],
      "ui": [
        { "app": "web", "routeKey": "WEB_LISTING_DETAILS", "tests": ["E2E.WEB.LISTING_DETAILS.RENDER"] }
      ],
      "notes": "Listing is the canonical bookable resource term. Never use facility."
    }
  ],
  "enums": [
    {
      "name": "BookingMode",
      "values": ["SINGLE_SLOT", "IN_GAME", "RECURRING"],
      "tests": ["UT.ENUM.BOOKING_MODE.ALL", "CT.DTOS.BOOKING_MODE.SNAPSHOT"]
    }
  ],
  "exclusions": [
    {
      "id": "EXC.SAMPLE",
      "scope": "index",
      "name": "idx_legacy_unused",
      "reason": "Index removed in migration vX.Y; kept for historical reference only.",
      "approvedBy": "architect",
      "approvedAt": "2026-01-18"
    }
  ]
}

How to use
	•	Your agent should expand tables[] to include every table/column/constraint/index.
	•	Every item must map to at least one test ID from your test suites.

⸻

2) Playwright test skeletons per app (Web, MinSide, Backoffice, SaaS Admin)

2.1 Folder structure

/tests/e2e/
  /config/
    playwright.base.ts
    testIds.ts
    auth.fixtures.ts
    a11y.ts
    i18n.ts
    api.client.ts
  /web/
    listing-discovery.spec.ts
    listing-details-calendar.spec.ts
    booking-single-slot.spec.ts
    booking-in-game.spec.ts
    booking-recurring.spec.ts
    auth-return-to-flow.spec.ts
  /minside/
    dashboard-private.spec.ts
    context-switch-org.spec.ts
    managed-listings-custody.spec.ts
  /backoffice/
    admin-listing-lifecycle.spec.ts
    admin-custody-bulk-assign.spec.ts
    saksbehandler-approvals.spec.ts
    org-admin-subdelegation.spec.ts
    org-member-restrictions.spec.ts
  /saas-admin/
    tenants-plans-subscriptions.spec.ts
    entitlements-routes-nav.spec.ts
    license-keys.spec.ts
    integrations-health.spec.ts
    incidents-dashboard.spec.ts

2.2 playwright.base.ts

Path: /tests/e2e/config/playwright.base.ts

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000"
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } }
  ]
});

2.3 Fixtures (auth + role)

Path: /tests/e2e/config/auth.fixtures.ts

import { test as base, expect, Page } from "@playwright/test";

type Role = "ADMIN" | "SAKSBEHANDLER" | "ORG_ADMIN" | "ORG_MEMBER" | "USER" | "SAAS_ADMIN";

type Fixtures = {
  loginAs: (role: Role, opts?: { orgContext?: "BO" | "MS" }) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  loginAs: async ({ page }, use) => {
    await use(async (role, opts) => {
      // Strategy:
      // 1) Prefer real auth against staging test users (recommended).
      // 2) Optionally use a test-only auth shortcut in non-prod (NOT allowed in prod tests).
      const loginUrl = process.env.E2E_LOGIN_URL;
      if (!loginUrl) throw new Error("Missing E2E_LOGIN_URL");

      await page.goto(loginUrl);
      await page.getByTestId("role-select").selectOption(role);
      if (opts?.orgContext) {
        await page.getByTestId("org-context-select").selectOption(opts.orgContext);
      }
      await page.getByTestId("login-submit").click();
      await expect(page.getByTestId("app-shell")).toBeVisible();
    });
  }
});

export { expect } from "@playwright/test";

2.4 A11y helper (Axe)

Path: /tests/e2e/config/a11y.ts

import { Page } from "@playwright/test";
// If you already use @axe-core/playwright, keep it. Otherwise, add it.
import AxeBuilder from "@axe-core/playwright";

export async function expectNoA11yViolations(page: Page, opts?: { include?: string[] }) {
  const builder = new AxeBuilder({ page });
  if (opts?.include?.length) builder.include(opts.include);
  const results = await builder.analyze();
  if (results.violations.length) {
    const formatted = results.violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map(n => n.target)
    }));
    throw new Error(`A11y violations:\n${JSON.stringify(formatted, null, 2)}`);
  }
}

2.5 i18n helper (no hardcoded strings + key completeness hook)

Path: /tests/e2e/config/i18n.ts

import { Page, expect } from "@playwright/test";

export async function switchLanguage(page: Page, lang: "nb" | "en") {
  await page.getByTestId("lang-switch").click();
  await page.getByTestId(`lang-${lang}`).click();
  await expect(page.getByTestId("lang-current")).toHaveText(lang);
}

// Basic runtime check: no placeholder key like "i18n.some_key" leaked to UI.
export async function expectNoMissingI18nKeys(page: Page) {
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/\bi18n\.[a-z0-9_.-]+\b/i);
  expect(bodyText).not.toMatch(/\bmissing_translation\b/i);
}

2.6 Example spec (Web — listing details + calendar + a11y + i18n)

Path: /tests/e2e/web/listing-details-calendar.spec.ts

import { test, expect } from "../config/auth.fixtures";
import { expectNoA11yViolations } from "../config/a11y";
import { switchLanguage, expectNoMissingI18nKeys } from "../config/i18n";

test.describe("E2E.WEB.LISTING_DETAILS.CALENDAR", () => {
  test("renders listing details, calendar states, a11y + i18n", async ({ page }) => {
    await page.goto("/"); // Web root

    // Discovery -> open listing
    await page.getByTestId("search-input").fill("kultur");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("listing-card")).toHaveCountGreaterThan(0);

    await page.getByTestId("listing-card").first().click();
    await expect(page.getByTestId("listing-title")).toBeVisible();
    await expect(page.getByTestId("listing-calendar")).toBeVisible();

    // Calendar states must exist (available/booked/blackout markers).
    await expect(page.getByTestId("calendar-legend-available")).toBeVisible();
    await expect(page.getByTestId("calendar-legend-booked")).toBeVisible();
    await expect(page.getByTestId("calendar-legend-blackout")).toBeVisible();

    // i18n checks
    await switchLanguage(page, "nb");
    await expectNoMissingI18nKeys(page);
    await switchLanguage(page, "en");
    await expectNoMissingI18nKeys(page);

    // WCAG baseline (critical region)
    await expectNoA11yViolations(page, { include: ["main"] });
  });
});


⸻

3) Policy-engine unit test pack (RBAC + Entitlements + Custody)

3.1 File layout

/packages/policy/
  src/
    types.ts
    can.ts
    entitlements.ts
    custody.ts
  test/
    can.rbac.test.ts
    can.entitlements.test.ts
    can.custody.test.ts
    can.order.test.ts
    fixtures.ts

3.2 types.ts

Path: /packages/policy/src/types.ts

export type AppKey = "api" | "web" | "minside" | "backoffice" | "saas-admin";
export type RoleKey =
  | "PUBLIC" | "USER" | "ORG_MEMBER" | "ORG_ADMIN"
  | "SAKSBEHANDLER" | "ADMIN" | "TENANT_ADMIN"
  | "SAAS_ADMIN" | "BILLING_ADMIN" | "SUPPORT_ADMIN" | "AUDITOR";

export type CustodyScopeKey =
  | "RO_VIEW" | "RO_EDIT" | "RO_MEDIA" | "RO_MAINTENANCE"
  | "RO_BOOKING_MANAGE" | "RO_PRICING" | "RO_REPORTING" | "RO_DELEGATE";

export type ModuleKey = "BOOKING" | "APPROVALS" | "AUDIT" | "CUSTODY" | "BILLING" | "INTEGRATIONS";
export type FeatureKey = "BOOKING_RECURRING" | "BOOKING_IN_GAME" | "CALENDAR_BLACKOUTS" | "ORG_DASHBOARD";

export type ActionKey =
  | "LISTING_VIEW_PUBLIC"
  | "LISTING_EDIT"
  | "LISTING_MEDIA_WRITE"
  | "LISTING_BLACKOUT_WRITE"
  | "BOOKING_CREATE"
  | "BOOKING_APPROVE"
  | "CUSTODY_GRANT_CREATE"
  | "CUSTODY_SUBGRANT_CREATE"
  | "SAAS_ENTITLEMENTS_EDIT"
  | "SAAS_LICENSE_ROTATE";

export type Decision = { effect: "ALLOW" | "DENY" | "READONLY"; reasonKey?: string };

export type Actor = {
  tenantId: string;
  userId?: string;
  roles: RoleKey[];
  boOrgIds?: string[]; // memberships in backoffice org model
  msOrgIds?: string[]; // memberships in MinSide org model
};

export type Resource = {
  listingId?: string;
  bookingId?: string;
  orgId?: string;
};

export type AppContext = {
  app: AppKey;
  routeKey?: string;
  featureKey?: FeatureKey;
};

export type EffectiveEntitlements = {
  modules: Set<ModuleKey>;
  features: Set<FeatureKey>;
  // routes/nav omitted here but can be added
};

export type CustodyContext = {
  // unioned scopes the actor effectively has for this listing (after time window + revocation)
  effectiveListingScopes: Map<string /*listingId*/, Set<CustodyScopeKey>>;
  // subdelegation is modeled inside effectiveListingScopes after subset checks
};

3.3 can.ts (policy order enforced)

Path: /packages/policy/src/can.ts

import { ActionKey, Actor, Resource, AppContext, Decision, EffectiveEntitlements, CustodyContext } from "./types";

export function can(
  actor: Actor,
  action: ActionKey,
  resource: Resource | undefined,
  ctx: AppContext,
  ent: EffectiveEntitlements,
  custody: CustodyContext
): Decision {
  // 1) Tenant isolation is enforced outside (API layer must validate resource ownership).
  // Here we still enforce "must have tenantId".
  if (!actor.tenantId) return { effect: "DENY", reasonKey: "policy.tenant.missing" };

  // 2) RBAC baseline
  const rbac = canByRole(actor, action, ctx);
  if (rbac.effect !== "ALLOW") return rbac;

  // 3) Entitlements
  const entDecision = canByEntitlements(action, ent);
  if (entDecision.effect !== "ALLOW") return entDecision;

  // 4) Custody (resource-scoped actions)
  const custodyDecision = canByCustody(actor, action, resource, custody);
  if (custodyDecision.effect !== "ALLOW") return custodyDecision;

  return { effect: "ALLOW" };
}

function canByRole(actor: Actor, action: ActionKey, ctx: AppContext): Decision {
  const roles = new Set(actor.roles);

  // SaaS Admin only actions
  if (action === "SAAS_ENTITLEMENTS_EDIT" || action === "SAAS_LICENSE_ROTATE") {
    return roles.has("SAAS_ADMIN") ? { effect: "ALLOW" } : { effect: "DENY", reasonKey: "authz.role.denied" };
  }

  // Public action
  if (action === "LISTING_VIEW_PUBLIC") return { effect: "ALLOW" };

  // Default: requires authentication
  if (!actor.userId) return { effect: "DENY", reasonKey: "authz.auth.required" };

  // Admin power
  if (roles.has("ADMIN") || roles.has("TENANT_ADMIN")) return { effect: "ALLOW" };

  // Saksbehandler
  if (action === "BOOKING_APPROVE") {
    return roles.has("SAKSBEHANDLER") ? { effect: "ALLOW" } : { effect: "DENY", reasonKey: "authz.role.denied" };
  }

  // Org roles and user
  if (roles.has("ORG_ADMIN") || roles.has("ORG_MEMBER") || roles.has("USER")) {
    return { effect: "ALLOW" }; // further restricted by entitlements + custody
  }

  return { effect: "DENY", reasonKey: "authz.role.denied" };
}

function canByEntitlements(action: ActionKey, ent: EffectiveEntitlements): Decision {
  // Booking requires BOOKING module
  if (action === "BOOKING_CREATE" || action === "BOOKING_APPROVE") {
    return ent.modules.has("BOOKING") ? { effect: "ALLOW" } : { effect: "DENY", reasonKey: "ent.module.disabled" };
  }
  // Custody requires CUSTODY module
  if (action.startsWith("CUSTODY_")) {
    return ent.modules.has("CUSTODY") ? { effect: "ALLOW" } : { effect: "DENY", reasonKey: "ent.module.disabled" };
  }
  // SaaS admin operations require BILLING/INTEGRATIONS etc (optional)
  return { effect: "ALLOW" };
}

function canByCustody(actor: Actor, action: ActionKey, resource: Resource | undefined, custody: CustodyContext): Decision {
  // Non-resource-scoped actions do not require custody
  if (action === "LISTING_VIEW_PUBLIC" || action === "SAAS_ENTITLEMENTS_EDIT" || action === "SAAS_LICENSE_ROTATE") {
    return { effect: "ALLOW" };
  }

  const listingId = resource?.listingId;
  if (!listingId) {
    // if action requires listing, deny with explicit reason
    if (action.startsWith("LISTING_") || action.startsWith("BOOKING_") || action.startsWith("CUSTODY_")) {
      return { effect: "DENY", reasonKey: "policy.resource.missing" };
    }
    return { effect: "ALLOW" };
  }

  // ADMIN/TENANT_ADMIN already allowed earlier; custody mostly applies to non-admin roles
  const scopes = custody.effectiveListingScopes.get(listingId) ?? new Set();

  const required = requiredScope(action);
  if (!required) return { effect: "ALLOW" };

  return scopes.has(required) ? { effect: "ALLOW" } : { effect: "DENY", reasonKey: "custody.scope.missing" };
}

function requiredScope(action: ActionKey) {
  switch (action) {
    case "LISTING_EDIT": return "RO_EDIT";
    case "LISTING_MEDIA_WRITE": return "RO_MEDIA";
    case "LISTING_BLACKOUT_WRITE": return "RO_MAINTENANCE";
    case "BOOKING_APPROVE": return "RO_BOOKING_MANAGE";
    case "CUSTODY_GRANT_CREATE": return "RO_DELEGATE";
    case "CUSTODY_SUBGRANT_CREATE": return "RO_DELEGATE";
    default: return undefined;
  }
}

3.4 Unit tests (Vitest skeleton)

Path: /packages/policy/test/fixtures.ts

import { Actor, EffectiveEntitlements, CustodyContext } from "../src/types";

export function entAll(): EffectiveEntitlements {
  return { modules: new Set(["BOOKING", "APPROVALS", "AUDIT", "CUSTODY", "BILLING", "INTEGRATIONS"]), features: new Set() };
}

export function entNoBooking(): EffectiveEntitlements {
  return { modules: new Set(["AUDIT", "CUSTODY"]), features: new Set() };
}

export function custodyFor(listingId: string, scopes: string[]): CustodyContext {
  return { effectiveListingScopes: new Map([[listingId, new Set(scopes as any)]]) };
}

export function actor(role: Actor["roles"][number], overrides?: Partial<Actor>): Actor {
  return {
    tenantId: "t-1",
    userId: role === "PUBLIC" ? undefined : "u-1",
    roles: [role],
    boOrgIds: [],
    msOrgIds: [],
    ...overrides
  };
}

Path: /packages/policy/test/can.order.test.ts

import { describe, it, expect } from "vitest";
import { can } from "../src/can";
import { actor, entAll, entNoBooking, custodyFor } from "./fixtures";

describe("UT.POLICY.ORDER", () => {
  it("denies when entitlements disable booking even if role allows", () => {
    const d = can(
      actor("USER"),
      "BOOKING_CREATE",
      { listingId: "l-1" },
      { app: "web" },
      entNoBooking(),
      custodyFor("l-1", ["RO_VIEW", "RO_BOOKING_MANAGE"])
    );
    expect(d.effect).toBe("DENY");
    expect(d.reasonKey).toBe("ent.module.disabled");
  });

  it("denies when custody scope missing even if role+entitlements allow", () => {
    const d = can(
      actor("ORG_MEMBER"),
      "LISTING_BLACKOUT_WRITE",
      { listingId: "l-1" },
      { app: "minside" },
      entAll(),
      custodyFor("l-1", ["RO_VIEW"]) // missing RO_MAINTENANCE
    );
    expect(d.effect).toBe("DENY");
    expect(d.reasonKey).toBe("custody.scope.missing");
  });
});


⸻

4) Synthetic monitors + incident ingest endpoint

4.1 Synthetic monitors (Playwright cron)

Goal: Catch broken deploys fast (web/minside/backoffice/saas-admin).

GitHub Action (cron): .github/workflows/synthetic-monitors.yml

name: Synthetic Monitors

on:
  schedule:
    - cron: "*/15 * * * *" # every 15 minutes
  workflow_dispatch: {}

jobs:
  monitors:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      E2E_BASE_URL: ${{ secrets.MONITOR_BASE_URL }}
      E2E_LOGIN_URL: ${{ secrets.MONITOR_LOGIN_URL }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm playwright install --with-deps
      - run: pnpm test:e2e:monitors

Add a Playwright project tag for monitors (example command):
	•	pnpm test:e2e:monitors should run only monitor specs.

Create monitor specs:

Path: /tests/e2e/monitors/web.smoke.monitor.spec.ts

import { test, expect } from "../config/auth.fixtures";

test.describe("MONITOR.WEB.SMOKE", () => {
  test("search → listing → calendar renders", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("search-input").fill("kultur");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("listing-card").first()).toBeVisible();
    await page.getByTestId("listing-card").first().click();
    await expect(page.getByTestId("listing-calendar")).toBeVisible();
  });
});

Same style for MinSide/Backoffice/SaaS Admin smoke monitors.

⸻

4.2 Incident ingest endpoint (Sentry webhook → incidents table → SaaS Admin)

This is a minimal contract + handler. Implement in your API framework (Fastify/NestJS) but keep behavior identical.

Endpoint contract
	•	POST /incidents/ingest/sentry
	•	Auth: shared secret header x-incident-secret
	•	Body: Sentry webhook payload (store minimal fields; never store PII)

Minimal handler (Fastify-style)
Path: /apps/api/src/routes/incidents.ingest.ts

import type { FastifyInstance } from "fastify";

type SentryWebhook = {
  // Keep it minimal and tolerant; Sentry can vary by config.
  event_id?: string;
  project?: string;
  level?: string;
  message?: string;
  culprit?: string;
  platform?: string;
  release?: string;
  environment?: string;
  tags?: Array<[string, string]>;
  timestamp?: number;
  fingerprint?: string[] | string;
  url?: string;
};

function getTag(tags: Array<[string, string]> | undefined, key: string) {
  return tags?.find(([k]) => k === key)?.[1];
}

export async function registerIncidentIngestRoutes(app: FastifyInstance) {
  app.post<{ Body: SentryWebhook }>("/incidents/ingest/sentry", async (req, reply) => {
    const secret = req.headers["x-incident-secret"];
    if (!secret || secret !== process.env.INCIDENT_INGEST_SECRET) {
      return reply.code(401).send({ ok: false });
    }

    const body = req.body ?? {};
    const tags = body.tags ?? [];

    // SAFE IDs only — never email/name/nationalId.
    const tenantId = getTag(tags, "tenantId");
    const orgId = getTag(tags, "orgId");
    const appKey = (getTag(tags, "app") ?? "api") as any;

    const fingerprint =
      Array.isArray(body.fingerprint) ? body.fingerprint.join("|") :
      typeof body.fingerprint === "string" ? body.fingerprint :
      body.event_id ?? "unknown";

    const title = body.message ?? body.culprit ?? "Sentry event";
    const severity = (body.level ?? "error").toUpperCase();

    // TODO: insert/upsert into incidents table:
    // - group by fingerprint + app + tenantId (nullable)
    // - increment count, update last_seen_at, set first_seen_at if new
    // - store release/environment, link url if present
    await req.server.db.incidents.upsertFromSentry({
      source: "SENTRY",
      severity,
      app: appKey,
      tenantId: tenantId ?? null,
      orgId: orgId ?? null,
      release: body.release ?? null,
      fingerprint,
      title,
      link: body.url ?? null,
      occurredAt: body.timestamp ? new Date(body.timestamp * 1000) : new Date()
    });

    return reply.code(200).send({ ok: true });
  });
}

Required DB behavior (upsert grouping)
	•	Group key: (source='SENTRY', app, tenantId?, fingerprint)
	•	If exists: increment count, update last_seen_at
	•	Else: create with first_seen_at = last_seen_at = now, status=OPEN

Minimal integration test skeleton
Path: /apps/api/test/integration/incidents.ingest.sentry.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildTestApi } from "../support/buildTestApi"; // your helper

describe("IT.API.INCIDENTS.INGEST.SENTRY", () => {
  it("rejects without secret", async () => {
    const api = await buildTestApi();
    const res = await request(api.server)
      .post("/incidents/ingest/sentry")
      .send({ message: "boom" });
    expect(res.status).toBe(401);
  });

  it("ingests and upserts incident", async () => {
    const api = await buildTestApi();
    const res = await request(api.server)
      .post("/incidents/ingest/sentry")
      .set("x-incident-secret", process.env.INCIDENT_INGEST_SECRET!)
      .send({
        event_id: "e-1",
        level: "error",
        message: "TypeError: x is undefined",
        release: "web@1.2.3",
        tags: [["app", "web"], ["tenantId", "t-1"], ["routeKey", "WEB_LISTING_DETAILS"]]
      });
    expect(res.status).toBe(200);

    const row = await api.db.incidents.findByFingerprint("e-1");
    expect(row).toBeTruthy();
    expect(row.app).toBe("web");
    expect(row.tenant_id).toBe("t-1");
  });
});
