# Golden Booking Journey E2E Test Execution Guide

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Running Tests Locally](#running-tests-locally)
5. [CI/CD Integration](#cicd-integration)
6. [Debugging Failures](#debugging-failures)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Golden Booking Journey is an end-to-end test suite that validates the complete booking approval workflow across three applications:

- **Web** (public portal): Citizen discovers and books
- **MinSide** (citizen portal): Citizen monitors booking status
- **Backoffice** (case handler portal): Case handler approves/rejects

### Test Coverage

| Test | Path | Priority | Duration |
|------|------|----------|----------|
| `golden-journey-full.spec.ts` | Approve path + messaging | P0 | ~5 min |
| `golden-journey-reject.spec.ts` | Reject path | P1 | ~3 min |

---

## Prerequisites

### Software Requirements

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Playwright (auto-installed)

### Environment Setup

```bash
# Required environment variables
export DATABASE_URL="postgresql://digilist_test:digilist_test@localhost:5432/digilist_test"
export API_BASE_URL="http://localhost:4000"
export WEB_BASE_URL="http://localhost:5173"
export MINSIDE_BASE_URL="http://localhost:5174"
export BACKOFFICE_BASE_URL="http://localhost:5175"
```

---

## Setup

### Step 1: Install Dependencies

```bash
# From monorepo root
pnpm install
```

### Step 2: Build Required Packages

```bash
# Build core packages
pnpm --filter @digilist/database-schema build
pnpm --filter @digilist/client-sdk build
pnpm --filter @xala/ds build
pnpm --filter @xala/i18n build
```

### Step 3: Setup Test Database

```bash
# Create test database
createdb digilist_test

# Run migrations
cd apps/api
pnpm db:migrate

# Seed E2E test data
pnpm tsx ../../packages/testing-e2e/seeds/e2e-golden-journey.seed.ts
```

**Expected output:**

```
🌱 Starting E2E Golden Journey seed...
📦 Database: postgresql://digilist_test:****@localhost:5432/digilist_test

1️⃣ Creating E2E tenant...
   ✅ Tenant: [UUID]

2️⃣ Creating test users...
   ✅ Citizen: [UUID] (e2e.citizen@example.com)
   ✅ Case Handler: [UUID] (e2e.casehandler@example.com)
   ✅ Admin: [UUID] (e2e.admin@example.com)

3️⃣ Creating test rental object...
   ✅ Rental Object: [UUID]
   ✅ Title: E2E Test Hall
   ✅ Status: PUBLISHED

4️⃣ Creating test time slots...
   ✅ Free Slot: 2026-01-20T18:00:00.000Z - 2026-01-20T20:00:00.000Z
   ✅ Booked Slot: 2026-01-20T14:00:00.000Z - 2026-01-20T16:00:00.000Z
   ✅ Blocked Slot: 2026-01-20T10:00:00.000Z - 2026-01-20T12:00:00.000Z

✅ E2E Golden Journey seed complete!
```

### Step 4: Install Playwright Browsers

```bash
cd packages/testing-e2e
pnpm playwright install chromium
```

---

## Running Tests Locally

### Step 1: Start All Services

Open 4 terminal tabs:

**Terminal 1: API**
```bash
cd apps/api
pnpm dev
# Wait for: Server listening on http://localhost:4000
```

**Terminal 2: Web**
```bash
cd apps/web
pnpm dev
# Wait for: Local: http://localhost:5173/
```

**Terminal 3: MinSide**
```bash
cd apps/minside
pnpm dev
# Wait for: Local: http://localhost:5174/
```

**Terminal 4: Backoffice**
```bash
cd apps/backoffice
pnpm dev
# Wait for: Local: http://localhost:5175/
```

### Step 2: Run Authentication Setup

```bash
cd packages/testing-e2e
pnpm playwright test --config=playwright-golden-journey.config.ts --project=setup
```

**Expected output:**

```
🔐 Authenticating citizen user...
   ✅ Citizen authenticated successfully
   ✅ Storage state saved to test-results/auth/citizen.json

🔐 Authenticating case handler user...
   ✅ Case handler authenticated successfully
   ✅ Storage state saved to test-results/auth/casehandler.json

🔐 Authenticating admin user...
   ✅ Admin authenticated successfully
   ✅ Storage state saved to test-results/auth/admin.json
```

### Step 3: Run Golden Journey Tests

**Option A: Run approve path only**
```bash
pnpm playwright test --config=playwright-golden-journey.config.ts golden-journey-full.spec.ts
```

**Option B: Run reject path only**
```bash
pnpm playwright test --config=playwright-golden-journey.config.ts golden-journey-reject.spec.ts
```

**Option C: Run all tests**
```bash
pnpm playwright test --config=playwright-golden-journey.config.ts
```

**Option D: Run with UI mode (recommended for development)**
```bash
pnpm playwright test --config=playwright-golden-journey.config.ts --ui
```

### Step 4: View Test Report

```bash
pnpm playwright show-report test-results/html
```

---

## CI/CD Integration

### GitHub Actions

The Golden Journey tests run automatically on:

- **Pull Requests** (affecting booking code)
- **Push to main/develop**
- **Nightly at 2 AM UTC**
- **Manual trigger** (workflow_dispatch)

### Trigger Manual Run

```bash
# Via GitHub UI
Actions → E2E Golden Booking Journey → Run workflow

# Via gh CLI
gh workflow run e2e-golden-journey.yml -f test_suite=approve
```

### View CI Results

```bash
# List recent runs
gh run list --workflow=e2e-golden-journey.yml

# View specific run
gh run view [RUN_ID]

# Download artifacts
gh run download [RUN_ID]
```

---

## Debugging Failures

### Step 1: Check Test Output

```bash
# View test results
cat packages/testing-e2e/test-results/results.json | jq .
```

### Step 2: View Trace

```bash
# Open Playwright trace viewer
pnpm playwright show-trace packages/testing-e2e/test-results/artifacts/[test-name]/trace.zip
```

### Step 3: View Screenshots

```bash
# Screenshots are in test-results/artifacts/
ls -la packages/testing-e2e/test-results/artifacts/
```

### Step 4: Check Booking Reference

All tests attach the booking reference as an annotation. Look for:

```
annotations: [
  {
    type: 'booking_reference',
    description: 'BOOK-12345' // or UUID
  }
]
```

Use this to query the database:

```sql
SELECT * FROM domain.bookings WHERE id = 'BOOK-12345';
```

### Common Failure Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| `Element not found: [data-testid="..."]` | Missing data-testid attribute | Add selector to component |
| `Timeout waiting for status update` | Status didn't propagate | Check WebSocket connection or polling logic |
| `Booking not found in list` | RLS or tenant isolation issue | Verify tenant context in API |
| `Authentication failed` | Auth storage state expired | Re-run setup project |

---

## Maintenance

### Updating Test Data

If you need to change test fixtures:

1. Edit `packages/testing-e2e/seeds/e2e-golden-journey.seed.ts`
2. Re-run seed script
3. Update tests if necessary

### Adding New Selectors

When adding `data-testid` attributes:

1. Update `docs/quality/e2e-selectors-checklist.md`
2. Add selector to appropriate Page Object
3. Update tests to use new selector
4. Run tests locally to verify

### Resetting Test Environment

```bash
# Drop and recreate test database
dropdb digilist_test
createdb digilist_test

# Re-run migrations and seed
cd apps/api
pnpm db:migrate
pnpm tsx ../../packages/testing-e2e/seeds/e2e-golden-journey.seed.ts

# Delete auth storage states
rm -rf packages/testing-e2e/test-results/auth/*.json

# Re-authenticate
cd packages/testing-e2e
pnpm playwright test --config=playwright-golden-journey.config.ts --project=setup
```

---

## Troubleshooting

### Issue: Tests fail with "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"
```

### Issue: Tests fail with "Port 5173 already in use"

**Solution:**
```bash
# Kill existing dev servers
pkill -f "vite.*5173"
pkill -f "vite.*5174"
pkill -f "vite.*5175"

# Or use different ports
export WEB_BASE_URL="http://localhost:5183"
export MINSIDE_BASE_URL="http://localhost:5184"
export BACKOFFICE_BASE_URL="http://localhost:5185"
```

### Issue: Authentication setup fails

**Solution:**
```bash
# Check if demo login is enabled
grep -r "DEMO_MODE_ENABLED" apps/*/src

# Verify demo login component exists
ls -la packages/ds/src/blocks/LoginComponents.tsx
ls -la packages/ds/src/composed/DemoLoginDialog.tsx

# If demo login not available, use standard auth
# Update auth.setup.ts to use real login flow
```

### Issue: Slot not available

**Solution:**
```bash
# Check seed data
psql $DATABASE_URL -c "SELECT * FROM domain.bookings WHERE rental_object_id = (SELECT id FROM domain.rental_objects WHERE metadata->>'testKey' = 'E2E_LISTING_1');"

# Delete conflicting bookings
psql $DATABASE_URL -c "DELETE FROM domain.bookings WHERE rental_object_id = (SELECT id FROM domain.rental_objects WHERE metadata->>'testKey' = 'E2E_LISTING_1');"

# Re-run seed
pnpm tsx packages/testing-e2e/seeds/e2e-golden-journey.seed.ts
```

---

## Best Practices

### DO ✅

- Run tests on a dedicated test database
- Use deterministic test data (E2E fixtures)
- Capture traces and screenshots on failure
- Attach booking reference to test info
- Use data-testid selectors exclusively
- Run auth setup before tests
- Clean up test data after runs (optional)

### DON'T ❌

- Run tests against production
- Use hardcoded dates/times
- Rely on CSS classes or text content
- Skip authentication setup
- Run multiple tests in parallel (flaky)
- Use non-deterministic slot selection
- Ignore test failures

---

## Quick Reference

### Common Commands

```bash
# Run full suite
pnpm playwright test --config=playwright-golden-journey.config.ts

# Run approve path only
pnpm playwright test --config=playwright-golden-journey.config.ts golden-journey-full.spec.ts

# Run reject path only
pnpm playwright test --config=playwright-golden-journey.config.ts golden-journey-reject.spec.ts

# Run with UI
pnpm playwright test --config=playwright-golden-journey.config.ts --ui

# Debug mode
pnpm playwright test --config=playwright-golden-journey.config.ts --debug

# View report
pnpm playwright show-report test-results/html

# View trace
pnpm playwright show-trace test-results/artifacts/[test]/trace.zip

# Re-seed data
pnpm tsx packages/testing-e2e/seeds/e2e-golden-journey.seed.ts

# Re-authenticate
pnpm playwright test --config=playwright-golden-journey.config.ts --project=setup
```

### File Locations

| File | Purpose |
|------|---------|
| `packages/testing-e2e/playwright-golden-journey.config.ts` | Playwright config |
| `packages/testing-e2e/suites/golden-journey/*.spec.ts` | Test specs |
| `packages/testing-e2e/suites/golden-journey/page-objects/*.ts` | Page Object Models |
| `packages/testing-e2e/suites/golden-journey/auth.setup.ts` | Auth setup |
| `packages/testing-e2e/seeds/e2e-golden-journey.seed.ts` | Seed script |
| `docs/quality/e2e-selectors-checklist.md` | Selector inventory |
| `.github/workflows/e2e-golden-journey.yml` | CI workflow |

---

## Support

For questions or issues:

1. Check this guide first
2. Check `docs/quality/e2e-selectors-checklist.md`
3. View test traces with `pnpm playwright show-trace`
4. Open an issue with:
   - Test output
   - Booking reference
   - Screenshots/traces
   - Environment details

---

**Last Updated:** 2026-01-19  
**Version:** 1.0
