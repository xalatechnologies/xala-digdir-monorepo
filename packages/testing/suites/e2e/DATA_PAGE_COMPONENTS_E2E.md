# Data Page Components E2E Tests

## Overview

Comprehensive end-to-end tests for reusable dashboard components across SaaS Admin and Tenant Admin applications.

## Test Files

### 1. `saas-admin-data-page-components.spec.ts`
Tests for SaaS Admin pages using the new components:
- **Status Tabs**: Filtering, counts, active state
- **Filter Chips**: Display, removal, reset
- **Empty States**: Different scenarios (no data, filtered, with actions)
- **Data Page Header**: Count badges, actions
- **Responsive Design**: Mobile, tablet, desktop
- **i18n Translations**: Norwegian and English

### 2. `tenant-admin-data-page-components.spec.ts`
Tests for Tenant Admin pages:
- **Empty States**: Users page, Feature Flags page
- **Data Page Header**: Count display
- **Responsive Design**: Mobile adaptation
- **i18n Translations**: Localized content

## Running Tests

### Run All E2E Tests
```bash
pnpm test:e2e
```

### Run SaaS Admin Component Tests
```bash
pnpm test:e2e tests/e2e/saas-admin-data-page-components.spec.ts
```

### Run Tenant Admin Component Tests
```bash
pnpm test:e2e tests/e2e/tenant-admin-data-page-components.spec.ts
```

### Run with UI Mode
```bash
pnpm test:e2e --ui
```

### Run Specific Test Suite
```bash
pnpm test:e2e --grep "Status Tabs"
```

## Test Coverage

### Status Tabs
- ✅ Display with counts
- ✅ Filter data on click
- ✅ Update counts dynamically
- ✅ Highlight active tab
- ✅ Responsive scrolling on mobile

### Filter Chips
- ✅ Display when filters active
- ✅ Remove individual filters
- ✅ Reset all filters
- ✅ Wrap on mobile

### Empty States
- ✅ No data scenario
- ✅ Filtered results scenario
- ✅ With create action
- ✅ With secondary action
- ✅ Responsive layout

### Data Page Header
- ✅ Display count badge
- ✅ Show actions
- ✅ Responsive behavior

### i18n
- ✅ Status labels translated
- ✅ Filter labels translated
- ✅ Empty state messages translated
- ✅ Button labels translated

## Test Data

Tests use mocked authentication and API responses:
- Mock users with appropriate roles
- Mock API responses for different scenarios
- Empty datasets for empty state testing
- Large datasets for performance testing

## Prerequisites

1. **Apps must be running**:
   - SaaS Admin: `http://localhost:5176`
   - Tenant Admin: `http://localhost:5177`

2. **Start dev servers**:
   ```bash
   pnpm dev
   ```

3. **Or use Playwright webServer** (automatic):
   - Playwright will start servers automatically
   - Configured in `playwright.config.ts`

## Debugging

### View Test Execution
```bash
pnpm test:e2e --headed
```

### Debug Mode
```bash
pnpm test:e2e --debug
```

### View Screenshots
Failed tests automatically capture screenshots:
- Location: `tests/screenshots/`
- Full page screenshots on failure

### View HTML Report
```bash
# After running tests
open tests/reports/e2e/index.html
```

## CI/CD Integration

Tests are configured to run in CI:
- Retry on failure (2 retries in CI)
- Parallel execution
- Trace collection on retry
- Screenshot on failure

## Performance Considerations

- Tests wait for `networkidle` state
- 500ms buffer for React hydration
- Mock API responses for faster execution
- No real API calls during tests

## Known Limitations

- Tests rely on mocked authentication
- API responses are mocked
- Some tests may need adjustment based on actual UI implementation
- Responsive tests use fixed viewport sizes
