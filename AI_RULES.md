# AI Rules for Xala Digdir Monorepo

## Core Architecture Rules

1. **Apps must not import @digdir/* packages directly** - Use the @xala/ds facade package only
2. **Designsystemet CSS must be imported only once** - Import @xala/ds/styles exactly once in the app's main.tsx
3. **No custom UI components in apps** - Use only DS components exported from @xala/ds
4. **Theme switching via provider only** - Use DesignsystemetProvider or data attributes, never direct CSS imports
5. **Use data attributes for styling modes**:
   - data-color-scheme="auto|light|dark"
   - data-size="sm|md|lg"
   - data-typography="primary|secondary"

## Package Dependencies

- @xala/ds: The ONLY UI facade package
- @xala/ds-registry: Documentation and examples
- @xala/ds-themes: Theme URLs for runtime switching
- @xala/eslint-config: Shared ESLint configuration

## ESLint Guardrails

The repository enforces:
- Blocked @digdir/* imports in apps
- Blocked direct CSS imports except in packages/ds/src/styles.ts
- Only @xala/ds and @xala/ds-registry allowed in apps

## Component Usage Rules

### asChild Pattern
- Use asChild for semantic overrides (Button as Link)
- Only ONE child allowed under asChild
- Radix Slot merges props to child element
- Child inherits all component behaviors

### Theme Switching
- Use DesignsystemetProvider for runtime theme switching
- Themes: digdir, altinn, uutilsynet, portal
- Provider manages single <link> element for theme CSS
- Never import theme CSS directly

## File Structure Rules

### Application Structure
- apps/web: Vite React app
- apps/api: Fastify API server
- apps/backoffice: Admin portal
- apps/minside: User dashboard

### Package Structure
- packages/ds: UI facade with single CSS import point
- packages/ds-registry: Examples and documentation
- packages/eslint-config: Shared lint rules
- packages/client-sdk: Enterprise SDK
- packages/i18n: Internationalization

### Test Structure (REQUIRED)
All tests MUST be organized under `tests/`:
```
tests/
├── unit/           # Vitest unit tests
├── e2e/            # Playwright E2E tests
├── integration/    # Integration tests
├── performance/    # Performance tests
├── security/       # Security tests
├── fixtures/       # Test data
├── helpers/        # Test utilities
├── reports/        # Test output (gitignored)
├── screenshots/    # E2E screenshots (gitignored)
└── artifacts/      # Test artifacts (gitignored)
```

**NEVER create test folders at root level** (e.g., `test-results/`, `playwright-report/`, `reports/`)

## Development Commands

- pnpm dev: Run all apps in parallel
- pnpm build: Build all packages
- pnpm lint: Check ESLint rules
- pnpm format: Format with Prettier

## Critical Reminders

1. ALWAYS import @xala/ds/styles exactly once
2. NEVER import @digdir/* in apps
3. USE DesignsystemetProvider for theming
4. FOLLOW asChild single-child rule
5. CHECK ESLint passes before commits

---

## 🔒 HARD LINES - PRODUCTION CRITICAL (2026-01-17)

> **⚠️ THESE RULES ARE NON-NEGOTIABLE**
> Learned from 4-hour production debugging session. Violations cause outages.

### 1. Database Schema Structure (CRITICAL - ROOT CAUSE OF OUTAGE)

**HARD REQUIREMENT:** Application code expects tables in **named schemas**, NOT `public` schema.

```sql
-- REQUIRED: These 5 schemas MUST exist
CREATE SCHEMA IF NOT EXISTS platform;   -- users, sessions, tenants, organizations
CREATE SCHEMA IF NOT EXISTS domain;     -- bookings, rental_objects, alerts
CREATE SCHEMA IF NOT EXISTS compliance; -- audit_logs, gdpr_requests
CREATE SCHEMA IF NOT EXISTS monitoring; -- health checks, metrics (future)
CREATE SCHEMA IF NOT EXISTS saas;       -- billing, subscriptions (future)
```

**Why This Matters:**
- ❌ Tables in `public` schema → "relation 'platform.users' does not exist"
- ❌ Complete authentication failure
- ❌ All database operations fail

**Pre-Deployment Validation:**
```bash
psql -d digilist_prod -c "SELECT schemaname, COUNT(*) FROM pg_tables WHERE schemaname IN ('platform', 'domain', 'compliance') GROUP BY schemaname;"
# If any schema missing or zero tables → STOP DEPLOYMENT
```

### 2. Authentication System = LOCKED

**🔒 NO CHANGES WITHOUT EXPLICIT APPROVAL**

Authentication is **STABLE AND WORKING**. Do not modify.

**Working Configuration:**
- REST API: `/api/auth/idporten` (NOT `/api/auth/idporten-oidc`)
- Three HTTP-only cookies: `dl_at` (15min), `dl_rt` (7days), `dl_csrf` (7days)
- Cookie domain: `.digilist.no` (for cross-subdomain SSO)
- Session stored in `platform.sessions` table
- Redirect to absolute frontend URL: `${returnToOrigin}/`

**Locked Files (DO NOT MODIFY):**
- `apps/api/src/modules/auth/idporten.controller.ts`
- `apps/api/src/modules/auth/session.service.ts`
- `apps/api/src/config/cookies.ts`
- `packages/client-sdk/src/services/idporten.service.ts`

**Documentation:** See `docs/architecture/AUTHENTICATION_SYSTEM.md`

### 3. Deployment Checklist (MANDATORY)

**Before EVERY deployment:**
- [ ] Verify database schemas exist: `psql -c "\dn"`
- [ ] Verify tables in correct schemas (not `public`)
- [ ] If SDK changed: Rebuild ALL dependent apps
- [ ] Environment variables verified
- [ ] Run tests: `pnpm test && pnpm test:e2e`

**After EVERY deployment:**
- [ ] Test BankID login → Dashboard (not login page)
- [ ] Test demo login → Dashboard (not 500 error)
- [ ] Check cookies in browser dev tools (domain: `.digilist.no`)
- [ ] Check API logs: `pm2 logs xala-api --lines 50`
- [ ] Monitor for 10 minutes

### 4. Debugging Order (LEARN FROM MISTAKES)

**When debugging authentication/session issues:**

1. ✅ **Check Infrastructure FIRST**
   - Database schemas exist? (`psql -c "\dn"`)
   - Cookies domain correct? (Browser dev tools)
   - Environment variables set? (`pm2 env xala-api`)
   - CORS whitelist includes domain?

2. ✅ **Check Logs (Both Sides)**
   - Backend: `pm2 logs xala-api --err`
   - Frontend: Browser console

3. ✅ **Check Network**
   - Network tab → Request headers
   - Cookies being sent?
   - Correct API endpoint called?

4. ✅ **Check Code (Last Resort)**
   - Only after verifying infrastructure

**Why:** Infrastructure failures look like application bugs.

### 5. SDK Changes = Rebuild Everything

**After ANY change to `@digilist/client-sdk`:**

```bash
# 1. Build SDK
pnpm -F @digilist/client-sdk build

# 2. Rebuild ALL apps that depend on it
pnpm -F @xala/minside build
pnpm -F @xala/backoffice build
pnpm -F @xala/web build
pnpm -F @xala/tenant-admin build
pnpm -F @xala/saas-admin build

# 3. Deploy
rsync -avz --delete apps/*/dist/ root@server:/var/www/digilist/
```

**Why:** Monorepo dependencies are transitive. Frontends cache old SDK code.

### 6. Trace Full Request Path

**When debugging API integration issues:**

1. Check SDK code for actual endpoint
2. Verify in browser network tab
3. Confirm in API logs
4. Test with curl

**Example:**
```bash
# Find endpoint in SDK
grep -r "basePath" packages/client-sdk/src/services/

# Verify endpoint exists in API
grep -r "idporten" apps/api/src/modules/auth/

# Test endpoint
curl -I https://api.digilist.no/api/auth/idporten/authorize
```

**Why:** Don't assume - verify which code is actually executing.

### 7. Fix One Thing at a Time

**DON'T:** Change cookies + redirect + audit logging + endpoint simultaneously

**DO:** Fix one → Deploy → Test → Verify → Fix next

**Why:** Can't isolate failures when multiple changes deployed together.

### 8. Common Symptoms vs Root Causes

| Symptom | Likely Root Cause | Check This |
|---------|-------------------|------------|
| "Redirects to login after auth" | Database schema mismatch | `psql -c "\dn"` |
| "relation does not exist" | Tables in wrong schema | Schema verification |
| "Authentication succeeds but 401" | Cookies on wrong domain | Browser dev tools |
| "500 on all endpoints" | Database connection | `pm2 logs api` |
| "CORS errors" | Origin whitelist | `CORS_ORIGIN` env var |

### 9. Documentation is Mandatory

**After fixing critical systems:**

1. Write architecture documentation
2. Write lessons learned
3. Update CLAUDE.md and AGENTS.md and AI_RULES.md
4. Mark as "HARD LINE - NO CHANGES"
5. Create troubleshooting guide

**Why:** Prevents future incidents. 1 hour of docs saves infinite future hours.

---

## Required Reading for Production Work

**Before working on authentication or deployment:**

1. ✅ `docs/architecture/AUTHENTICATION_SYSTEM.md` (comprehensive guide)
2. ✅ `docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md` (detailed lessons)
3. ✅ `CLAUDE.md` → Critical Lessons Learned section
4. ✅ `AGENTS.md` → Lessons Learned section
5. ✅ This file → Hard Lines section

**Estimated Time:** 30 minutes
**Value:** Prevents hours of debugging
**Requirement:** MANDATORY

---

## Success Metrics

**Before Fix (2026-01-17):**
- ❌ Authentication: 0% success rate
- ❌ Production: CRITICAL OUTAGE
- ❌ Documentation: Incomplete

**After Fix:**
- ✅ Authentication: 100% success rate
- ✅ Production: STABLE
- ✅ Documentation: COMPREHENSIVE
- ✅ Future Protection: MAXIMUM

**User Quote:** "both worked !!!" 🎉

---

**Last Updated:** 2026-01-17
**Status:** PRODUCTION STABLE
**Next Review:** After 30 days of stable operation
