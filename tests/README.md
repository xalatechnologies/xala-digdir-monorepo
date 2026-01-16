# Test Organization

This directory contains all tests for the Xala/Digilist Platform monorepo.

## Structure

```
tests/
├── unit/              # Vitest unit tests
│   ├── sdk/          # SDK service tests
│   ├── components/   # React component tests
│   ├── hooks/        # React hooks tests
│   └── utils/        # Utility function tests
├── e2e/              # Playwright E2E tests
│   ├── auth/        # Authentication flows
│   ├── booking/     # Booking journeys
│   ├── scenarios/   # Real-world scenarios
│   └── stories/     # User stories
├── integration/      # Integration tests
│   ├── api/         # API endpoint integration
│   └── services/    # Service-to-service integration
├── performance/      # Performance tests
│   ├── load/        # Load testing
│   ├── stress/      # Stress testing
│   └── benchmarks/  # Performance benchmarks
├── security/        # Security/penetration tests
│   ├── owasp/       # OWASP Top 10 coverage
│   ├── auth/        # Authentication security
│   └── data/        # Data security
├── fixtures/        # Test data & fixtures
│   ├── users/       # User test data
│   ├── listings/    # Listing test data
│   └── bookings/    # Booking test data
├── helpers/         # Shared test utilities
│   ├── matchers/    # Custom Jest/Vitest matchers
│   ├── setup/       # Test setup functions
│   └── mocks/       # Mock factories
├── reports/         # All test output (gitignored)
│   ├── unit/       # Vitest HTML reports
│   ├── e2e/        # Playwright HTML reports
│   ├── coverage/   # Coverage reports
│   ├── compliance/ # Design system scan reports
│   └── i18n/       # Localization scan reports
├── screenshots/     # E2E failure screenshots (gitignored)
└── artifacts/       # Other test artifacts (gitignored)
    ├── videos/      # E2E test videos
    ├── traces/      # Playwright traces
    └── logs/        # Test logs
```

## Guidelines

### ⚠️ CRITICAL RULES

1. **All tests MUST be organized under `tests/`**
   - Unit tests → `tests/unit/`
   - E2E tests → `tests/e2e/`
   - Integration tests → `tests/integration/`

2. **All test output MUST go in designated folders**
   - Reports → `tests/reports/`
   - Screenshots → `tests/screenshots/`
   - Artifacts → `tests/artifacts/`

3. **NEVER create test folders at root level**
   - ❌ `test-results/`, `playwright-report/`, `reports/`
   - ✅ `tests/reports/e2e/`, `tests/screenshots/`

### Unit Tests (Vitest)

**Location:** `tests/unit/` OR co-located with source code

**Co-located tests** (preferred for packages):
- `packages/client-sdk/src/**/*.test.ts`
- `packages/ds/src/**/*.test.tsx`

**Organized tests** (preferred for integration):
- `tests/unit/sdk/` - SDK integration tests
- `tests/unit/components/` - Component integration tests

**Commands:**
```bash
pnpm test              # Run all (watch mode)
pnpm test:run          # Run once
pnpm test:coverage     # With coverage → tests/reports/coverage/
pnpm test:ui           # With Vitest UI
```

### E2E Tests (Playwright)

**Location:** `tests/e2e/`

**Organization by feature:**
- `tests/e2e/auth/` - Login, logout, RBAC
- `tests/e2e/booking/` - Booking flows
- `tests/e2e/scenarios/` - Real-world user scenarios
- `tests/e2e/stories/` - User story acceptance tests

**Commands:**
```bash
pnpm test:e2e                    # Run all E2E tests
pnpm test:e2e tests/e2e/auth/    # Specific folder
pnpm test:e2e:auth               # Auth tests only
```

**Output:**
- Reports: `tests/reports/e2e/`
- Screenshots: `tests/screenshots/`
- Videos: `tests/artifacts/videos/`
- Traces: `tests/artifacts/traces/`

### Integration Tests

**Location:** `tests/integration/`

Tests that verify interaction between multiple components/services:
- `tests/integration/api/` - API endpoint integration
- `tests/integration/services/` - Service-to-service communication
- `tests/integration/auth/` - Authentication flow integration

### Performance Tests

**Location:** `tests/performance/`

- Load testing (high concurrent users)
- Stress testing (beyond capacity)
- Benchmark testing (baseline metrics)

### Security Tests

**Location:** `tests/security/`

- OWASP Top 10 coverage
- Penetration testing
- Vulnerability scanning
- Authentication/authorization security

### Test Helpers & Fixtures

**Helpers:** `tests/helpers/`
- Shared test utilities
- Custom matchers
- Mock factories
- Setup/teardown functions

**Fixtures:** `tests/fixtures/`
- Mock data for tests
- Seed data for integration tests
- Test configurations

## Running Tests

### Quick Reference

```bash
# Unit tests
pnpm test                    # Watch mode
pnpm test:run                # Run once
pnpm test:coverage           # With coverage

# E2E tests
pnpm test:e2e                # All E2E tests
pnpm test:e2e tests/e2e/auth # Specific folder

# SDK tests
pnpm test:sdk                # All SDK tests
pnpm test:sdk:authz          # Specific SDK test

# Contract tests
pnpm test:contracts          # API contract tests
pnpm test:rfc7807            # RFC 7807 compliance

# All tests
pnpm test:all                # Unit + E2E
```

### CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

Reports are published to:
- `tests/reports/unit/` - Vitest reports
- `tests/reports/e2e/` - Playwright reports
- `tests/reports/coverage/` - Coverage reports

## Legacy Folders (Deprecated)

The following folders are deprecated and will be removed:
- ❌ `test-results/` → Use `tests/reports/e2e/`
- ❌ `playwright-report/` → Use `tests/reports/e2e/`
- ❌ `playwright-report-*` → Use `tests/reports/e2e/`
- ❌ `reports/` → Use `tests/reports/`
- ❌ `screenshots/` → Use `tests/screenshots/`
- ❌ `e2e/` → Use `tests/e2e/`

## Contributing

When adding new tests:

1. **Choose the correct category**
   - Unit → `tests/unit/`
   - E2E → `tests/e2e/`
   - Integration → `tests/integration/`

2. **Follow naming conventions**
   - Unit tests: `*.test.ts` or `*.spec.ts`
   - E2E tests: `*.spec.ts`

3. **Use shared helpers**
   - Import from `tests/helpers/`
   - Reuse fixtures from `tests/fixtures/`

4. **Document complex tests**
   - Add comments explaining test intent
   - Link to related issues/stories

5. **Ensure CI passes**
   - Run locally before pushing
   - Check coverage reports
   - Review E2E screenshots on failure

## See Also

- [CLAUDE.md](../CLAUDE.md) - Complete development guidelines
- [AGENTS.md](../AGENTS.md) - Agent-specific commands
- [AI_RULES.md](../AI_RULES.md) - AI assistant rules
