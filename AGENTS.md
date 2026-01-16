# AGENTS.md

Guidance for agentic coding assistants working in this repository.

## Repository Overview

- **Monorepo** (Turborepo + pnpm workspaces)
- **Apps:** `apps/web`, `apps/backoffice`, `apps/minside`, `apps/api`
- **Packages:** `packages/client-sdk`, `packages/ds`, `packages/i18n`, etc.
- **Platform:** Xala / Digilist (multi-tenant, audit-first, RBAC, production-live)

### Quick Structure

```
xala-digdir-monorepo/
├── apps/
│   ├── web/          → Public website (5173)       [CLAUDE.md | AGENTS.md]
│   ├── backoffice/   → Admin portal (5175)         [CLAUDE.md | AGENTS.md]
│   ├── minside/      → User portal (5174)          [CLAUDE.md | AGENTS.md]
│   └── api/          → API server (4000)           [CLAUDE.md | AGENTS.md]
│
├── packages/
│   ├── sdk-core/     → Generic SDK primitives ⭐   [CLAUDE.md | AGENTS.md]
│   ├── contracts/    → API contracts (Zod) ⭐      [CLAUDE.md | AGENTS.md]
│   ├── client-sdk/   → Domain SDK ⭐               [CLAUDE.md | AGENTS.md]
│   ├── ds/           → Design System facade ⭐     [CLAUDE.md | AGENTS.md]
│   ├── i18n/         → Internationalization ⭐     [CLAUDE.md | AGENTS.md]
│   └── eslint-config/→ Shared ESLint rules ⭐      [CLAUDE.md | AGENTS.md]
│
├── tests/            → Consolidated test structure ⭐
├── scripts/          → Build & deployment scripts
└── docs/             → Documentation
    └── PROJECT_STRUCTURE.md → Complete directory trees
```

**See [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for complete directory trees of all apps and packages.**

## Essential Commands

Run from repo root unless noted.

### Install & Dev

- Install deps: `pnpm install`
- Dev all apps: `pnpm dev`
- Build all: `pnpm build`

### Lint / Format / Compliance

- Lint: `pnpm lint`
- Format (Prettier): `pnpm format`
- Design system scans: `pnpm scan`
- Strict scan: `pnpm scan:strict`
- Compliance scan: `pnpm scan:compliance`
- All scans: `pnpm scan:all`

### Test Organization (REQUIRED)

All tests MUST be organized under the `tests/` directory:

```
tests/
├── unit/           # Vitest unit tests
├── e2e/            # Playwright E2E tests
├── integration/    # Integration tests
├── performance/    # Performance tests
├── security/       # Security tests
├── fixtures/       # Test data
├── helpers/        # Test utilities
├── reports/        # All output (gitignored)
├── screenshots/    # E2E screenshots (gitignored)
└── artifacts/      # Test artifacts (gitignored)
```

**CRITICAL:** Never create test folders at root level (e.g., `test-results/`, `playwright-report/`, `reports/`)

### Documentation Organization (REQUIRED)

All documentation MUST be organized under the `docs/` directory:

```
docs/
├── architecture/   # Architecture docs and proposals
├── guides/         # Development guides
├── operations/     # Operational docs
│   ├── deployments/    # Deployment reports
│   ├── migrations/     # Migration reports
│   └── archive/        # Historical artifacts
├── apps/           # App-specific docs
├── packages/       # Package-specific docs
└── reference/      # Reference materials
```

**CRITICAL RULES:**
- **NEVER create documentation files in the repository root**
- **NEVER create documentation in `reports/` folder** (reserved for technical reports)
- All new documentation MUST go in appropriate `docs/` subdirectories
- Deployment reports → `docs/operations/deployments/`
- Migration reports → `docs/operations/migrations/`
- Architecture proposals → `docs/architecture/`
- Development guides → `docs/guides/`
- Historical/archived docs → `docs/operations/archive/`

**Exceptions (ONLY these files allowed in root):**
- `README.md` - Main repository README
- `AGENTS.md` - AI agent guidance
- `CLAUDE.md` - Claude-specific guidance  
- `AI_RULES.md` - AI coding rules

### Script Organization (REQUIRED)

All scripts MUST be organized under the `scripts/` directory:

**CRITICAL RULES:**
- **NEVER create script files (.sh, .js, .mjs, .ts) in the repository root**
- All utility scripts → `scripts/`
- All deployment scripts → `scripts/`
- All test scripts → `scripts/`
- All build scripts → `scripts/`

**Current scripts directory contains:**
- Deployment scripts (deploy.sh, setup-ssl.sh, etc.)
- i18n scripts (scan-i18n.js, check-i18n-keys.js, etc.)
- Testing scripts (test-rate-limit.sh, test-auth-endpoints.sh, etc.)
- Compliance scripts (scan-compliance.mjs, etc.)

### Unit Tests (Vitest)

- All tests (watch): `pnpm test`
- All tests (run once): `pnpm test:run`
- With UI: `pnpm test:ui`
- Coverage: `pnpm test:coverage`
  - Output: `tests/reports/coverage/`

#### Single Test (Vitest)

- Run by path: `pnpm test:run -- --run path/to/file.test.ts`
- Run by pattern: `pnpm test:run -- --run tests/unit/**/*.test.ts`
- SDK tests: `pnpm test:sdk`
- SDK single test: `pnpm test:sdk:authz`

### E2E Tests (Playwright)

- E2E all: `pnpm test:e2e`
  - Reports: `tests/reports/e2e/`
  - Screenshots: `tests/screenshots/`
- E2E specific folder: `pnpm test:e2e tests/e2e/auth/`
- E2E single file: `pnpm test:e2e tests/e2e/auth/login.spec.ts`
- Auth tests: `pnpm test:e2e:auth:config`

### SDK / Contract Tests

- SDK all: `pnpm test:sdk:all`
- RFC7807 contract: `pnpm test:rfc7807`
- Contract parity: `pnpm test:contracts`
- Lint contracts: `pnpm lint:contracts`

### i18n Scanner (Required)

- Scan app: `node scripts/scan-i18n.js apps/minside/src`
- Scan dir: `node scripts/scan-i18n.js apps/minside/src/routes`
- Scan file: `node scripts/scan-i18n.js apps/minside/src/routes/settings.tsx`

## Code Style Guidelines

### TypeScript

- Use TypeScript everywhere; avoid `any`.
- Prefer explicit types for public APIs and exported members.
- Use SDK DTOs directly; do not reshape or transform.

### Imports

- UI components: ONLY from `@xala/ds`.
- SDK access: ONLY from `@digilist/client-sdk` or `@digilist/client-sdk/hooks`.
- Types/Schemas: Import from `@xala/contracts` for shared types.
- Core utilities: Import from `@xala/sdk-core` for HTTP client, errors, retry.
- Do NOT import from `@digdir/*` inside apps.
- Do NOT use `fetch`, `axios`, or custom API wrappers.

### React Components (Apps)

- Keep components presentational (orchestration + rendering only).
- No business logic in UI; logic lives in SDK/services.
- No raw HTML elements; use Designsystemet components.
- No inline styles; use design tokens and DS props.

### Naming & Terminology

- Use “listing” (never “facility”).
- Use feature-based folders under `apps/*/src/features`.
- Avoid ViewModel/UiModel/Adapter naming in apps.

### i18n Localization (Critical)

- NEVER use hardcoded strings in UI components.
- ALWAYS use `t()` / `useT()` from `@xala/i18n`.
- Add keys to BOTH:
  - `packages/i18n/src/locales/nb.ts`
  - `packages/i18n/src/locales/en.ts`
- Rebuild i18n: `pnpm -F @xala/i18n build`.
- Run the scanner before committing.

### Error Handling (RFC 7807)

- Errors must conform to Problem Details:
  - `type`, `title`, `status`, optional `detail`.
- Do not invent ad-hoc error shapes.

### Audit & RBAC

- All mutations must be auditable (`who`, `what`, `when`, `tenantId`, `ip/ua`).
- Do not hardcode role checks; use capability-based guards.

### Design System Guardrails

- Only import `@xala/ds/styles` ONCE in `main.tsx`.
- Use `DesignsystemetProvider` for theme control.
- No hardcoded colors/spacing/typography; use tokens.

### No Transformers (Contract-First)

- Forbidden in `apps/`:
  - `toXxx`, `fromXxx`, `mapXxx`, `adaptXxx`
  - `*VM`, `*ViewModel`, `*UiModel`
  - `select:` in React Query that reshapes data
- Use SDK Projection DTOs directly in components.

### Formatting & Linting

- Prettier is the formatter; avoid manual formatting overrides.
- Follow ESLint guardrails (design tokens, component patterns).
- Keep diffs focused; do not change unrelated code.

## Cursor Rules (from `.cursorrules`)

- i18n-first: no hardcoded strings in UI.
- Use `@xala/i18n` and add keys to `nb.ts` + `en.ts`.
- SDK-first: ONLY use `@digilist/client-sdk`.
- Design system: ONLY import from `@xala/ds`.
- No transformers; use Projection DTOs.
- No hardcoded values; use design tokens.

## When in Doubt

1. Check for SDK method and use it.
2. Check for `@xala/ds` component before custom UI.
3. Confirm i18n keys exist before adding text.
4. Ensure audit + RBAC requirements are met.
5. Stop and ask if any rule conflicts.
