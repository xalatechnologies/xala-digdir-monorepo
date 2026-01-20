# Golden Booking Journey - Comprehensive Test Suite

**Version:** 2.0 - Comprehensive Coverage  
**Last Updated:** 2026-01-19

---

## Overview

This is a **comprehensive end-to-end test suite** that validates all booking modes, workflows, and system features across Web, MinSide, and Backoffice applications.

---

## Test Coverage Matrix

### Booking Modes

| Mode | Create | Approve | Reject | Cancel | Conflict | Payment | Audit |
|------|--------|---------|--------|--------|----------|---------|-------|
| SINGLE_SLOT | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RECURRING | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SEASON_RENTAL | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| RANGE | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ALL_DAY | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| IN_GAME | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| ACTIVITY_REGISTRATION | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### System Features

| Feature | Test Coverage |
|---------|---------------|
| **Status Management** | pending, pending_approval, approved, confirmed, rejected, cancelled, completed, expired |
| **Payment Status** | pending, paid, partially_paid, refunded, failed |
| **Filters** | Status, date range, rental object, organization, user |
| **Tables** | Sorting, pagination, search, bulk actions |
| **Calendar** | Availability display, busy slots, blackouts, conflicts |
| **Audit Log** | Create, approve, reject, cancel, payment, status changes |
| **Notifications** | Email, SMS, in-app, push |
| **Consent** | GDPR consent, terms acceptance, photo consent |
| **Conflicts** | Slot overlap detection, alternative suggestions, resolution |
| **Edge Cases** | Past dates, invalid slots, concurrent bookings, rate limiting |

---

## Test Suite Structure

```
packages/testing-e2e/suites/golden-journey/
├── auth.setup.ts                           # Authentication setup
├── golden-journey-full.spec.ts             # Core approve path (P0)
├── golden-journey-reject.spec.ts           # Core reject path (P1)
├── booking-modes/
│   ├── single-slot.spec.ts                 # SINGLE_SLOT mode tests
│   ├── recurring.spec.ts                   # RECURRING mode tests
│   ├── recurring-conflicts.spec.ts         # Recurring with conflicts
│   ├── season-rental.spec.ts               # SEASON_RENTAL mode tests
│   ├── range.spec.ts                       # RANGE mode tests
│   ├── all-day.spec.ts                     # ALL_DAY mode tests
│   ├── in-game.spec.ts                     # IN_GAME mode tests
│   └── activity-registration.spec.ts       # ACTIVITY_REGISTRATION tests
├── workflows/
│   ├── payment-flow.spec.ts                # Payment integration
│   ├── conflict-resolution.spec.ts         # Conflict detection & resolution
│   ├── consent-gdpr.spec.ts                # Consent workflows
│   ├── notifications.spec.ts               # Notification delivery
│   └── messaging-roundtrip.spec.ts         # Case handler ↔ Citizen messaging
├── ui-features/
│   ├── filters-and-search.spec.ts          # Status filters, search, date filters
│   ├── table-operations.spec.ts            # Sorting, pagination, bulk actions
│   ├── calendar-display.spec.ts            # Calendar busy slots, availability
│   ├── booking-counter.spec.ts             # MinSide booking counter
│   └── status-badges.spec.ts               # Status badge display
├── audit-and-compliance/
│   ├── audit-log.spec.ts                   # Audit trail verification
│   ├── rbac-enforcement.spec.ts            # Role-based access control
│   ├── tenant-isolation.spec.ts            # Multi-tenant isolation
│   └── gdpr-compliance.spec.ts             # GDPR data access & deletion
├── edge-cases/
│   ├── concurrent-bookings.spec.ts         # Race conditions
│   ├── past-dates.spec.ts                  # Invalid date handling
│   ├── expired-bookings.spec.ts            # Auto-expiration
│   ├── rate-limiting.spec.ts               # API rate limits
│   ├── network-failures.spec.ts            # Resilience testing
│   └── boundary-conditions.spec.ts         # Capacity limits, max duration
└── page-objects/
    ├── web.page.ts                         # Web app page objects
    ├── minside.page.ts                     # MinSide page objects
    └── backoffice.page.ts                  # Backoffice page objects
```

---

## Quick Start

### Run All Golden Journey Tests

```bash
cd packages/testing-e2e
pnpm test:golden-journey:all
```

### Run By Category

```bash
# Booking modes
pnpm test:golden-journey:booking-modes

# Workflows
pnpm test:golden-journey:workflows

# UI features
pnpm test:golden-journey:ui-features

# Audit & compliance
pnpm test:golden-journey:audit

# Edge cases
pnpm test:golden-journey:edge-cases
```

### Run Specific Test

```bash
# Recurring booking with conflicts
pnpm playwright test suites/golden-journey/booking-modes/recurring-conflicts.spec.ts

# Payment flow
pnpm playwright test suites/golden-journey/workflows/payment-flow.spec.ts
```

---

## Test Scenarios Breakdown

### 1. Booking Modes

#### SINGLE_SLOT
- Create single time slot booking
- Verify conflict detection
- Approve/reject workflow
- Payment processing
- Calendar busy slot display

#### RECURRING
- Create recurring pattern (daily, weekly, custom)
- Preview with conflict detection
- Approve all occurrences
- Cancel single occurrence
- Cancel entire series
- Partial payment support

#### SEASON_RENTAL
- Create long-term rental
- Monthly payment plan
- Contract generation
- Mid-season cancellation
- Renewal workflow

#### RANGE
- Multi-day booking
- Check-in/check-out times
- Partial day pricing
- Early checkout

#### ALL_DAY
- Full day booking
- Multiple day selection
- Holiday pricing
- Blackout dates

#### IN_GAME
- Sports match booking
- Team registration
- Referee assignment
- Score tracking integration

#### ACTIVITY_REGISTRATION
- Event registration
- Participant limits
- Waitlist management
- Attendance tracking

---

### 2. Workflow Tests

#### Payment Flow
- Calculate pricing
- Apply discounts
- Process payment
- Handle payment failures
- Issue refunds
- Payment status updates

#### Conflict Resolution
- Detect slot overlaps
- Show alternative suggestions
- Auto-suggest next available
- Manual resolution
- Conflict notifications

#### Consent & GDPR
- Terms acceptance required
- Photo consent
- Data processing consent
- Consent withdrawal
- Data export request
- Right to be forgotten

#### Notifications
- Email notifications
- SMS alerts
- In-app notifications
- Push notifications
- Notification preferences
- Unsubscribe handling

---

### 3. UI Feature Tests

#### Filters & Search
- Status filter (all, pending, approved, etc.)
- Date range filter
- Rental object filter
- Organization filter
- User filter
- Multi-filter combinations
- Search by booking reference
- Search by user name

#### Table Operations
- Sort by column (date, status, user)
- Pagination (page size, navigation)
- Bulk select
- Bulk approve
- Bulk reject
- Bulk export
- Column visibility toggle

#### Calendar Display
- Show busy slots
- Show blocked slots
- Show my bookings
- Show organization bookings
- Legend display
- Timezone handling
- Week/month view toggle

#### Booking Counter
- Total bookings count
- Status breakdown
- Upcoming bookings
- Past bookings
- Real-time updates

#### Status Badges
- Color coding
- Icon display
- Tooltip information
- Status transitions

---

### 4. Audit & Compliance Tests

#### Audit Log
- Log booking creation
- Log approval decision
- Log rejection with reason
- Log cancellation
- Log payment events
- Log status changes
- Log data access
- Log data export

#### RBAC Enforcement
- Citizen cannot approve
- Case handler can approve
- Admin can override
- Organization context switching
- Permission inheritance

#### Tenant Isolation
- User sees only tenant data
- API enforces tenant context
- Cross-tenant booking blocked
- RLS policies verified

#### GDPR Compliance
- Data access request
- Data export (JSON, CSV)
- Data deletion
- Consent audit trail
- Cookie consent

---

### 5. Edge Case Tests

#### Concurrent Bookings
- Two users book same slot
- Optimistic locking
- Retry mechanism
- Clear error messages

#### Past Dates
- Cannot book past dates
- Grace period for edits
- Historical data view

#### Expired Bookings
- Auto-expiration cron
- Expired status badge
- Re-booking flow

#### Rate Limiting
- API throttling
- User feedback
- Retry-After header

#### Network Failures
- Offline detection
- Retry mechanism
- Queue pending actions
- Sync when online

#### Boundary Conditions
- Max capacity reached
- Max duration exceeded
- Min duration not met
- Booking too far in future

---

## Test Data Requirements

### E2E Fixtures

```typescript
const E2E_FIXTURES = {
  tenants: {
    E2E_TENANT: { slug: 'e2e-tenant', name: 'E2E Test Tenant' }
  },
  users: {
    E2E_CITIZEN: { email: 'e2e.citizen@example.com', role: 'CITIZEN' },
    E2E_CASEHANDLER: { email: 'e2e.casehandler@example.com', role: 'CASE_HANDLER' },
    E2E_ADMIN: { email: 'e2e.admin@example.com', role: 'TENANT_ADMIN' }
  },
  rentalObjects: {
    E2E_SPORTS_HALL: { 
      categoryKey: 'SPORTS_HALL', 
      modes: ['SINGLE_SLOT', 'RECURRING', 'IN_GAME'] 
    },
    E2E_CABIN: { 
      categoryKey: 'CABIN', 
      modes: ['RANGE', 'SEASON_RENTAL'] 
    },
    E2E_ACTIVITY_CENTER: { 
      categoryKey: 'ACTIVITY_CENTER', 
      modes: ['ACTIVITY_REGISTRATION', 'ALL_DAY'] 
    }
  },
  timeSlots: {
    FREE_SLOT: { start: 'next weekday 18:00', end: '20:00' },
    BOOKED_SLOT: { start: 'next weekday 14:00', end: '16:00' },
    BLOCKED_SLOT: { start: 'next weekday 10:00', end: '12:00' }
  }
};
```

---

## Selector Contract (data-testid)

All selectors are documented in `docs/quality/e2e-selectors-checklist.md`.

### Critical Selectors

```typescript
// Booking modes
'booking-mode-selector'
'booking-mode-single-slot'
'booking-mode-recurring'
'booking-mode-season'

// Recurring builder
'recurring-pattern-selector'
'recurring-frequency-input'
'recurring-preview-button'
'recurring-conflict-list'
'recurring-conflict-resolve'

// Payment
'payment-amount-display'
'payment-method-selector'
'payment-submit-button'
'payment-status-badge'

// Filters
'filter-status-dropdown'
'filter-date-from'
'filter-date-to'
'filter-apply-button'

// Table
'table-sort-column-[name]'
'table-pagination-next'
'table-pagination-prev'
'table-bulk-select-all'

// Audit log
'audit-log-entry-[id]'
'audit-log-action'
'audit-log-timestamp'
'audit-log-user'

// Consent
'consent-gdpr-checkbox'
'consent-terms-checkbox'
'consent-photo-checkbox'
```

---

## CI/CD Configuration

### GitHub Actions Jobs

```yaml
jobs:
  golden-journey-p0:
    name: P0 - Core Paths
    runs-on: ubuntu-latest
    steps:
      - name: Run core tests
        run: pnpm test:golden-journey:core
  
  golden-journey-booking-modes:
    name: P1 - Booking Modes
    runs-on: ubuntu-latest
    steps:
      - name: Run booking mode tests
        run: pnpm test:golden-journey:booking-modes
  
  golden-journey-workflows:
    name: P1 - Workflows
    runs-on: ubuntu-latest
    steps:
      - name: Run workflow tests
        run: pnpm test:golden-journey:workflows
  
  golden-journey-ui:
    name: P2 - UI Features
    runs-on: ubuntu-latest
    steps:
      - name: Run UI tests
        run: pnpm test:golden-journey:ui-features
  
  golden-journey-edge-cases:
    name: P2 - Edge Cases
    runs-on: ubuntu-latest
    needs: [golden-journey-p0]
    steps:
      - name: Run edge case tests
        run: pnpm test:golden-journey:edge-cases
```

---

## Test Execution Strategy

### On PR (Fast Feedback)
- Run P0 tests only (~5 min)
- Block merge on failure

### On Merge to Main
- Run P0 + P1 tests (~15 min)
- Create issue on failure

### Nightly (Comprehensive)
- Run all tests (~45 min)
- Email report
- Create issue on failure

### Manual Trigger
- Select test suite
- Select environment
- Run on-demand

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test coverage | >90% | TBD |
| Test reliability | >95% pass rate | TBD |
| Test duration (P0) | <10 min | TBD |
| Test duration (Full) | <60 min | TBD |
| Mean time to debug | <30 min | TBD |

---

## Next Steps

1. **Implement remaining test specs** (booking modes, workflows, edge cases)
2. **Add missing data-testid selectors** to DS blocks and app pages
3. **Create seed scripts** for each booking mode
4. **Configure CI matrix** for parallel execution
5. **Set up test monitoring** and alerting
6. **Create debugging playbook** for common failures

---

**See Also:**
- `docs/quality/GOLDEN_JOURNEY_GUIDE.md` - Execution guide
- `docs/quality/e2e-selectors-checklist.md` - Selector inventory
- `docs/booking/audit-summary.md` - Booking system architecture

---

**Version:** 2.0  
**Last Updated:** 2026-01-19
