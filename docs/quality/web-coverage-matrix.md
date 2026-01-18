# Web Coverage Matrix

> **Phase 3 Deliverable** - Comprehensive Requirement → Test Mapping

---

## LISTING DISCOVERY Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Search listings | GET /listings | `useListings()` | ✓ | ✓ | ✓ |
| Category filter | GET /listings?category=X | `useListings()` | ✓ | ✓ | ✓ |
| Status filter | GET /listings?status=X | `useListings()` | ✓ | ✓ | ✓ |
| Date range | GET /listings?from=X&to=Y | `useListings()` | ✓ | ✓ | ✓ |
| Price range | GET /listings?minPrice=X&maxPrice=Y | `useListings()` | ✓ | ✓ | ⬜ |
| Sort | GET /listings?sort=name | `useListings()` | ✓ | ✓ | ✓ |
| Pagination | GET /listings?page=X&limit=Y | `useListings()` | ✓ | ✓ | ✓ |
| Favorites | POST /me/favorites/:id | `useFavorite()` | ✓ | ✓ | ⬜ |

## LISTING DETAILS Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Overview tab | GET /listings/:id | `useListing()` | ✓ | ✓ | ✓ |
| Rules tab | GET /listings/:id/rules | `useListing()` | ✓ | ✓ | ✓ |
| Capacity | GET /listings/:id | `useListing()` | ✓ | ✓ | ✓ |
| Address/Map | GET /listings/:id | `useListing()` | ✓ | ✓ | ✓ |
| Images | GET /listings/:id | `useListing()` | ✓ | ✓ | ✓ |
| Pricing tab | GET /listings/:id/pricing | `useListing()` | ✓ | ✓ | ✓ |
| Contact | GET /listings/:id | `useListing()` | ✓ | ✓ | ⬜ |
| Documents | GET /listings/:id/documents | `useListing()` | ✓ | ✓ | ⬜ |
| Accessibility info | GET /listings/:id | `useListing()` | ✓ | ✓ | ⬜ |

## CALENDAR & AVAILABILITY Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Get availability | GET /listings/:id/availability | `useAvailability()` | ✓ | ✓ | ✓ |
| Show occupied | - | Calendar UI | ✓ | - | ✓ |
| Show reserved | - | Calendar UI | ✓ | - | ✓ |
| Show blackouts | - | Calendar UI | ✓ | - | ✓ |
| Show disabled | - | Calendar UI | ✓ | - | ✓ |
| Europe/Oslo TZ | - | formatters | ✓ | - | ✓ |
| DST handling | - | formatters | ✓ | - | ⬜ |
| All-day slots | - | Calendar UI | ✓ | - | ⬜ |
| Multi-day events | - | Calendar UI | ✓ | - | ⬜ |
| Read-only mode | - | Calendar UI | ✓ | - | ✓ |
| Bookable mode | - | Calendar UI | ✓ | - | ✓ |

## BOOKING MODES Capabilities

| Mode | Flow | Unit Test | Integration Test | E2E Test |
|------|------|-----------|------------------|----------|
| SINGLE_SLOT | select → confirm → pay → receipt | ✓ | ✓ | ✓ |
| IN_GAME | reserve(TTL) → confirm → handle expiry | ✓ | ✓ | ⬜ |
| RECURRING | pattern → preview conflicts → confirm | ✓ | ✓ | ⬜ |

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Create booking | POST /bookings | `useCreateBooking()` | ✓ | ✓ | ✓ |
| Reserve slot | POST /bookings/reserve | `useReserveSlot()` | ✓ | ✓ | ⬜ |
| Price preview | POST /pricing/preview | `usePricePreview()` | ✓ | ✓ | ✓ |
| Recurring preview | POST /bookings/recurring-preview | `useRecurringPreview()` | ✓ | ✓ | ⬜ |
| Conflict display | - | UI | ✓ | - | ⬜ |

## AUTH BOUNDARIES Capabilities

| Capability | Test Type | Coverage |
|------------|-----------|----------|
| Anonymous browse | E2E | ✓ |
| Booking requires login | E2E | ✓ |
| Return-to-flow | E2E | ✓ |
| Deep link to step | E2E | ⬜ |

## PAYMENT Capabilities

| Capability | Endpoint | SDK Method | Unit Test | Integration Test | E2E Test |
|------------|----------|------------|-----------|------------------|----------|
| Payment init | POST /payments/init | `usePaymentInit()` | ✓ | ✓ | ⬜ |
| Payment success | GET /payments/:id/status | `usePaymentStatus()` | ✓ | ✓ | ⬜ |
| Payment failure | GET /payments/:id/status | `usePaymentStatus()` | ✓ | ✓ | ⬜ |
| Webhook replay | POST /webhooks/payment | API only | - | ✓ | - |

## ERROR STATES

| Error State | Unit Test | E2E Test |
|-------------|-----------|----------|
| Availability changed mid-flow | ✓ | ⬜ |
| Conflict at submit | ✓ | ⬜ |
| Validation errors | ✓ | ✓ |
| Approval required | ✓ | ⬜ |

## ACCESSIBILITY & I18N

| Requirement | Test Type | Coverage |
|-------------|-----------|----------|
| Axe scan - Search | E2E | ✓ |
| Axe scan - Details | E2E | ✓ |
| Axe scan - Calendar | E2E | ✓ |
| Axe scan - Booking wizard | E2E | ⬜ |
| Keyboard-only booking | E2E | ⬜ |
| nb/en key completeness | Script | ✓ |
| No hardcoded strings | Script | ✓ |
| Date/number/currency formatting | Unit | ✓ |

## DATA ACCURACY

| Requirement | Test Type | Coverage |
|-------------|-----------|----------|
| UI never invents availability | Integration | ✓ |
| Cache invalidation after booking | Integration | ✓ |
| Cache invalidation after cancel | Integration | ✓ |
| Skeleton/loading states | E2E | ⬜ |
| RFC7807 error display | E2E | ⬜ |

---

## Test File Mapping

| Test Suite | File | Status |
|------------|------|--------|
| Calendar unit | `__tests__/calendar.unit.test.ts` | ⬜ TODO |
| Booking unit | `__tests__/booking.unit.test.ts` | ⬜ TODO |
| Availability integration | `tests/integration/availability.test.ts` | ⬜ TODO |
| Booking integration | `tests/integration/booking.test.ts` | ⬜ TODO |
| E2E Pack 1: Discovery | `tests/e2e/web/discovery.spec.ts` | ⬜ TODO |
| E2E Pack 2: Single-slot | `tests/e2e/web/single-slot-booking.spec.ts` | ⬜ TODO |
| E2E Pack 3: In-game | `tests/e2e/web/in-game-booking.spec.ts` | ⬜ TODO |
| E2E Pack 4: Recurring | `tests/e2e/web/recurring-booking.spec.ts` | ⬜ TODO |
| E2E Pack 5: Blackout | `tests/e2e/web/blackout-display.spec.ts` | ⬜ TODO |
| E2E Pack 6: A11y | `tests/e2e/web/accessibility.spec.ts` | ⬜ TODO |
| E2E Pack 7: Data accuracy | `tests/e2e/web/data-accuracy.spec.ts` | ⬜ TODO |
| E2E Pack 8: Security | `tests/e2e/web/security.spec.ts` | ⬜ TODO |
| E2E Pack 9: Performance | `tests/e2e/web/performance.spec.ts` | ⬜ TODO |

---

*Legend: ✓ = Required | ⬜ = Not implemented*
