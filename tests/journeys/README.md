# Authentication & RBAC E2E Tests

Comprehensive end-to-end tests for authentication, session management, and role-based access control (RBAC) across all Xala Digilist applications.

## Test Suites

### 1. **auth-rbac.spec.ts** - Core Authentication Tests (30+ tests)
Basic authentication, RBAC, and session management tests.

### 2. **auth-rbac-comprehensive.spec.ts** - Comprehensive Security Tests (100+ tests)
Exhaustive test coverage including edge cases, security vulnerabilities, stress testing, and race conditions.

## Test Coverage

### 🔐 Backoffice RBAC Enforcement

Tests that verify the critical security requirement: **only admin, saksbehandler (case handler), and super_admin roles can access backoffice**.

- **RBAC-01**: Admin can access backoffice dashboard
- **RBAC-02**: Case handler can access backoffice dashboard
- **RBAC-03**: Regular user is blocked from backoffice with friendly error message
- **RBAC-04**: Unauthorized user's session is cleared after access denial

### 🚦 Role-Based Dashboard Routing

Tests that verify users are routed to appropriate dashboards based on their roles.

- **ROUTE-01**: Admin redirects to admin dashboard
- **ROUTE-02**: Case handler can access work queue (`/work-queue`)
- **ROUTE-03**: Regular user cannot access any backoffice route (comprehensive check)

### 💾 Session Persistence

Tests that verify sessions persist correctly across page refreshes and navigation.

- **SESSION-01**: Admin session persists across page refresh (backoffice)
- **SESSION-02**: Case handler session persists across navigation (backoffice)

### 🚪 Logout Functionality

Tests that verify logout clears sessions completely and prevents unauthorized access.

- **LOGOUT-01**: Logout clears session completely (cookie + localStorage)
- **LOGOUT-02**: Refresh after logout stays on login page (no auto-login)
- **LOGOUT-03**: Cannot access protected routes after logout

### 👤 Minside Session Management

Tests for user dashboard (minside) authentication and session handling.

- **MINSIDE-01**: User can login and access dashboard
- **MINSIDE-02**: Session persists across page refresh
- **MINSIDE-03**: Logout clears session

### 🌐 Web App Session Management

Tests for public web app authentication.

- **WEB-01**: User can access web app
- **WEB-02**: Session persists across navigation
- **WEB-03**: Logout clears session

### 🔒 Security & Error Handling

Tests for security headers, cookie attributes, and user-friendly error messages.

- **SECURITY-01**: Session cookie has correct security attributes (HttpOnly, Secure, SameSite)
- **SECURITY-02**: No sensitive data in localStorage (no passwords or tokens)
- **ERROR-01**: Friendly error for unauthorized access (Norwegian language)
- **ERROR-02**: Error message includes guidance (explains who can access)

### ⚡ Performance & UX

Tests that verify authentication flows complete within acceptable timeframes.

- **PERF-01**: RBAC check completes within 3 seconds
- **PERF-02**: Login redirect completes within 2 seconds

## Running the Tests

### Prerequisites

All applications must be running:

```bash
# Start all apps in parallel (web, backoffice, minside, api)
pnpm dev
```

This starts:
- **API**: http://localhost:4000
- **Web**: http://localhost:5173
- **Minside**: http://localhost:5174
- **Backoffice**: http://localhost:5175

### Run Auth E2E Tests

```bash
# Run all auth tests with automatic app startup
pnpm test:e2e:auth

# Run specific test suite
pnpm test:e2e:auth --grep "RBAC"

# Run single test
pnpm test:e2e:auth --grep "RBAC-01"

# Run with UI mode
pnpm test:e2e:auth --ui

# Run in debug mode
pnpm test:e2e:auth --debug
```

### Manual Testing (Apps Already Running)

If you already have apps running via `pnpm dev`:

```bash
# Run tests without starting servers
pnpm test:e2e tests/journeys/auth-rbac.spec.ts --project=chromium
```

## Test Architecture

### Mock Authentication

The tests use mock authentication via localStorage to simulate logged-in states without requiring actual BankID/ID-porten OAuth flows:

```typescript
// Simulate admin login
await loginAs(page, 'admin');

// Simulate regular user login
await loginAs(page, 'user');
```

This approach:
- ✅ Fast test execution (no real OAuth flow)
- ✅ Deterministic (no external dependencies)
- ✅ Works offline
- ✅ Tests RBAC logic without auth provider dependencies

### Test Users

Pre-configured test users (defined in `helpers.ts`):

| Role | Email | Purpose |
|------|-------|---------|
| `admin` | admin@test.kommune.no | Full backoffice access |
| `saksbehandler` | saksbehandler@test.kommune.no | Case handler access |
| `user` | user@test.kommune.no | Regular user (blocked from backoffice) |

### App URLs

| App | Port | URL |
|-----|------|-----|
| Web | 5173 | http://localhost:5173 |
| Minside | 5174 | http://localhost:5174 |
| Backoffice | 5175 | http://localhost:5175 |
| API | 4000 | http://localhost:4000 |

## Configuration

### Playwright Config

**playwright.auth.config.ts** - Specialized config for auth tests:
- Starts all 4 apps (web, backoffice, minside, api)
- Single worker (prevents session conflicts)
- Serial execution (avoids race conditions)
- Extended timeouts for auth flows

### Test Helpers

**helpers.ts** - Shared utilities:
- `loginAs(page, role)` - Authenticate as specific role
- `logout(page)` - Clear authentication state
- `clearSession(page)` - Clear cookies and storage
- `hasSessionCookie(page)` - Check if session cookie exists

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:e2e:auth

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report-auth/
```

## Debugging Failed Tests

### View Test Report

```bash
# Open HTML report
npx playwright show-report playwright-report-auth
```

### View Screenshots

Screenshots are saved on test failure:
```
test-results/
└── tests-journeys-auth-rbac-*-chromium/
    └── test-failed-1.png
```

### View Traces

Enable trace recording:
```bash
pnpm test:e2e:auth --trace on
```

Then view traces:
```bash
npx playwright show-trace test-results/trace.zip
```

### Common Issues

**Issue**: `localStorage access denied`
- **Cause**: Trying to access localStorage before page navigation
- **Fix**: Navigate to `about:blank` before clearing storage (already implemented)

**Issue**: `ERR_CONNECTION_REFUSED` on port 5175
- **Cause**: Backoffice app not running
- **Fix**: Run `pnpm dev` or start backoffice manually: `pnpm --filter @xala/backoffice dev`

**Issue**: Tests timeout waiting for elements
- **Cause**: App not loaded or RBAC redirect happening
- **Fix**: Check app logs, verify authentication flow

## Production Verification

### Manual Testing Checklist

After deploying auth changes to production, verify:

- [ ] Admin can login to https://backoffice.digilist.no
- [ ] Case handler can login to https://backoffice.digilist.no
- [ ] Regular user is blocked with error message: "Du har ikke tilgang til administrasjonspanelet"
- [ ] Logout clears session (refresh shows login page)
- [ ] Session persists after page refresh when logged in
- [ ] No session cookie after logout (check DevTools > Application > Cookies)

### Production Test Script

```bash
# Test with real BankID authentication
# 1. Navigate to https://backoffice.digilist.no
# 2. Click "Logg inn med BankID"
# 3. Complete BankID flow with test user (role: user)
# 4. Verify: "Ingen tilgang" error displayed
# 5. Verify: Session cookie cleared (DevTools)
# 6. Repeat with admin user - verify access granted
```

## Roadmap Alignment

These tests verify implementation of critical security requirements:

- **P0-02**: RBAC as source of truth
- **P1-01**: Session continuity during login
- **KRAV-ADM-05**: Audit logging (implicit - logout triggers audit)
- **KRAV-SEC-01**: Role-based access control enforcement

## Maintenance

### Adding New Tests

1. Add test case to `auth-rbac.spec.ts`
2. Use existing helpers (`loginAs`, `clearSession`)
3. Follow naming convention: `TEST-ID | Description`
4. Document in this README

### Updating Test Users

Edit `helpers.ts`:
```typescript
export const TEST_USERS = {
  admin: { ... },
  saksbehandler: { ... },
  user: { ... },
  // Add new roles here
};
```

## Comprehensive Test Coverage (100+ Additional Tests)

### 🔒 **RBAC Role Verification (RBAC-101 to RBAC-110)**
- Admin full access verification
- Case handler restricted access
- Regular user comprehensive blocking (all routes)
- Norwegian error messages
- Immediate session clearing for unauthorized users

### 💾 **Session Lifecycle Management (SESSION-101 to SESSION-110)**
- Fresh session creation
- Persistence across page loads (100+ refreshes tested)
- Browser navigation (back/forward buttons)
- Session expiration handling
- Invalid/tampered session detection
- Rapid refresh handling (10+ sequential refreshes)

### 🚪 **Logout Functionality (LOGOUT-101 to LOGOUT-108)**
- Cookie clearing verification
- localStorage and sessionStorage clearing
- Protected route access prevention after logout
- Multiple logout handling (no errors)
- Cross-app isolation
- Back button behavior after logout

### 🔐 **Security Headers and Cookies (SECURITY-101 to SECURITY-107)**
- HttpOnly flag verification
- SameSite attribute verification
- No passwords in localStorage
- No JWT tokens in localStorage
- No NIN (national ID) in localStorage
- JavaScript cookie access prevention (HttpOnly enforcement)
- XSS session stealing prevention

### ❌ **Error Handling and UX (ERROR-101 to ERROR-106)**
- User-friendly error messages (Norwegian)
- No technical error exposure
- Clear guidance on access requirements
- Invalid session handling
- Network error graceful degradation

### ⚡ **Performance and Responsiveness (PERF-101 to PERF-105)**
- Login redirect < 2 seconds
- RBAC check < 3 seconds
- Session validation < 500ms
- Logout completion < 1 second
- Concurrent request handling

### 🌐 **Cross-App Session Management (CROSS-101 to CROSS-103)**
- Minside independent session verification
- Web app independent session verification
- Isolated logout documentation

### 🔍 **Edge Cases and Boundary Conditions (EDGE-101 to EDGE-110)**
- Rapid login/logout cycles (5+ cycles)
- Empty localStorage handling
- Corrupted localStorage handling
- Long session duration handling (5+ seconds)
- URL manipulation prevention (../, ./, query params, hash fragments)
- Empty/null/undefined role rejection

### 🏁 **Concurrent and Race Conditions (RACE-101 to RACE-104)**
- Multiple tab session sharing
- Cross-tab logout synchronization
- Rapid navigation session integrity (20+ rapid navigations)
- Simultaneous login handling

### 🌍 **Browser Compatibility (COMPAT-101 to COMPAT-103)**
- localStorage availability
- sessionStorage availability
- Cookie support verification

### 💪 **Stress Testing (STRESS-101 to STRESS-103)**
- 100 rapid page refreshes
- Large localStorage (100 keys, 1000 chars each)
- 50 rapid RBAC check attempts

### 📊 **Data Integrity (DATA-101 to DATA-103)**
- No passwords in page source
- No session tokens in page source
- No sensitive data in network responses

## Total Test Count

- **Core Tests (auth-rbac.spec.ts)**: 30+ tests
- **Comprehensive Tests (auth-rbac-comprehensive.spec.ts)**: 100+ tests
- **Total Coverage**: 130+ test scenarios

## Run Comprehensive Tests

```bash
# Run all comprehensive security tests
npx playwright test tests/journeys/auth-rbac-comprehensive.spec.ts --project=chromium

# Run specific category
npx playwright test tests/journeys/auth-rbac-comprehensive.spec.ts --grep "STRESS"

# Run both core and comprehensive tests
npx playwright test tests/journeys/auth-rbac*.spec.ts --project=chromium
```

## Contact

For questions or issues with E2E tests, contact the platform team or create an issue in the repository.
