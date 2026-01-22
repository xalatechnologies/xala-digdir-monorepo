# MinSide Coverage Matrix

> **Phase 1 Deliverable** - Requirement → Test Mapping

---

## AUTH Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Login (Demo) | POST /auth/demo-token | `authService.demoLogin()` | ✓ | ✓ | ✓ |
| Login (OAuth) | POST /auth/oauth/:provider | `authService.oauthLogin()` | ✓ | ✓ | ✓ |
| Logout | POST /auth/logout | `authService.logout()` | ✓ | ✓ | ✓ |
| Session refresh | POST /auth/refresh | `authService.refresh()` | ✓ | ✓ | ✓ |
| Return-to-previous | - | `useReturnUrl()` | ✓ | - | ✓ |

## PROFILE Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| View profile | GET /me | `useProfile()` | ✓ | ✓ | ✓ |
| Edit profile | PATCH /me | `useUpdateProfile()` | ✓ | ✓ | ✓ |
| Language pref | PATCH /me/preferences | `usePreferences()` | ✓ | ✓ | ✓ |
| Notification prefs | PATCH /me/notification-preferences | `useNotificationPrefs()` | ✓ | ✓ | ✓ |

## DASHBOARD (Personal) Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| View stats | GET /me/stats | `useUserStats()` | ✓ | ✓ | ✓ |
| Upcoming bookings | GET /me/bookings?status=upcoming | `useBookings()` | ✓ | ✓ | ✓ |
| Booking history | GET /me/bookings?status=completed | `useBookings()` | ✓ | ✓ | ✓ |

## ORG CONTEXT Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Switch context | - | `useAccountContext()` | ✓ | - | ✓ |
| Remember choice | - | localStorage | ✓ | - | ✓ |
| Org dashboard | GET /organizations/:id | `useOrganization()` | ✓ | ✓ | ✓ |
| Org bookings | GET /organizations/:id/bookings | `useOrgBookings()` | ✓ | ✓ | ✓ |
| Org members | GET /organizations/:id/members | `useOrgMembers()` | ✓ | ✓ | ⬜ |
| Org invoices | GET /organizations/:id/invoices | `useOrgInvoices()` | ✓ | ✓ | ⬜ |
| Season rental | GET /organizations/:id/seasons | `useOrgSeasons()` | ✓ | ✓ | ⬜ |

## BOOKINGS Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| View booking | GET /bookings/:id | `useBooking()` | ✓ | ✓ | ✓ |
| Cancel booking | POST /bookings/:id/cancel | `useCancelBooking()` | ✓ | ✓ | ✓ |
| Modify booking | POST /bookings/:id/modify | `useModifyBooking()` | ✓ | ✓ | ⬜ |

## MESSAGES Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| List conversations | GET /me/conversations | `useConversations()` | ✓ | ✓ | ⬜ |
| View messages | GET /conversations/:id/messages | `useMessages()` | ✓ | ✓ | ⬜ |
| Send message | POST /conversations/:id/messages | `useSendMessage()` | ✓ | ✓ | ⬜ |

## ACCESSIBILITY & I18N

| Requirement | Test Type | Coverage |
|-------------|-----------|----------|
| Axe scan - Dashboard | E2E | ✓ |
| Axe scan - Bookings | E2E | ✓ |
| Axe scan - Settings | E2E | ✓ |
| Axe scan - Org pages | E2E | ⬜ |
| nb/en key completeness | Script | ✓ |
| No hardcoded strings | Script | ✓ |
| Date/number formatting | Unit | ✓ |

---

## Test File Mapping

| Test Suite | File | Status |
|------------|------|--------|
| Auth unit | `__tests__/auth.unit.test.ts` | ⬜ TODO |
| Profile unit | `__tests__/profile.unit.test.ts` | ⬜ TODO |
| Auth integration | `tests/integration/auth.test.ts` | ⬜ TODO |
| User integration | `tests/integration/user.test.ts` | ⬜ TODO |
| E2E private flow | `tests/e2e/minside/private-flow.spec.ts` | ⬜ TODO |
| E2E org flow | `tests/e2e/minside/org-flow.spec.ts` | ⬜ TODO |
| E2E auth boundary | `tests/e2e/minside/auth-boundary.spec.ts` | ⬜ TODO |
| E2E a11y | `tests/e2e/minside/accessibility.spec.ts` | ⬜ TODO |
| E2E i18n | `tests/e2e/minside/localization.spec.ts` | ⬜ TODO |

---

*Legend: ✓ = Required | ⬜ = Not implemented*
