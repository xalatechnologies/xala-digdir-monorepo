# E2E Selector Checklist

**Last Updated:** 2026-01-19  
**Purpose:** Comprehensive list of required data-testid attributes for Golden Booking Journey E2E tests

---

## Selector Contract Status

### WEB (Public Portal)

#### Listing Discovery
- [ ] `listing-search-input` - Search input field
- [ ] `listing-filter-panel` - Filter panel container
- [ ] `listing-filter-category` - Category filter dropdown
- [ ] `listing-filter-type` - Type filter dropdown
- [ ] `listing-filter-capacity` - Capacity filter input
- [ ] `listing-filter-apply` - Apply filters button
- [ ] `listing-filter-clear` - Clear filters button

#### Listing Cards
- [ ] `listing-card` - Individual listing card (repeatable)
- [ ] `listing-card-title` - Listing title within card
- [ ] `listing-card-image` - Listing image
- [ ] `listing-card-price` - Price display
- [ ] `listing-card-view-details` - View details button

#### Listing Details Page
- [ ] `listing-details-page` - Details page container
- [ ] `listing-title` - Main listing title
- [ ] `listing-description` - Description section
- [ ] `listing-capacity` - Capacity information
- [ ] `listing-address` - Address display

#### Calendar & Booking
- [ ] `listing-calendar` - Calendar component container
- [ ] `calendar-slot-available-[ISO_START]` - Available slot (dynamic with ISO timestamp)
- [ ] `calendar-slot-booked-[ISO_START]` - Booked slot
- [ ] `calendar-slot-blocked-[ISO_START]` - Blocked slot
- [ ] `calendar-prev-week` - Previous week navigation
- [ ] `calendar-next-week` - Next week navigation
- [ ] `booking-mode-selector` - Mode selector dropdown
- [ ] `booking-summary` - Booking summary panel
- [ ] `booking-selected-slot-time` - Selected slot time display
- [ ] `booking-total-price` - Total price display
- [ ] `booking-submit` - Submit booking button
- [ ] `booking-success` - Success message container
- [ ] `booking-reference` - Booking reference number display

---

### MINSIDE (Citizen Portal)

#### Dashboard
- [ ] `minside-dashboard` - Dashboard container
- [ ] `dashboard-welcome-message` - Welcome message
- [ ] `dashboard-stats` - Stats/metrics section

#### Navigation
- [ ] `my-bookings-nav` - My Bookings navigation link
- [ ] `my-organizations-nav` - My Organizations navigation link
- [ ] `my-profile-nav` - Profile navigation link
- [ ] `messages-inbox-nav` - Messages inbox link

#### Bookings List
- [ ] `my-bookings-table` - Bookings table container
- [ ] `bookings-filter-status` - Status filter dropdown
- [ ] `bookings-search` - Search input
- [ ] `booking-row-[BOOKING_ID]` - Individual booking row (dynamic)
- [ ] `booking-row-title` - Booking title in row
- [ ] `booking-status` - Status badge
- [ ] `booking-start-time` - Start time display
- [ ] `booking-view-details` - View details button

#### Booking Details
- [ ] `booking-details-page` - Details page container
- [ ] `booking-details-title` - Booking title
- [ ] `booking-details-status` - Status badge
- [ ] `booking-details-time` - Time range display
- [ ] `booking-details-price` - Price display
- [ ] `booking-cancel-button` - Cancel booking button
- [ ] `booking-cancel-confirm` - Confirm cancellation button

#### Messages
- [ ] `messages-inbox` - Messages inbox container
- [ ] `message-thread-[BOOKING_ID]` - Message thread (dynamic)
- [ ] `message-item` - Individual message
- [ ] `message-sender` - Sender name
- [ ] `message-timestamp` - Message timestamp
- [ ] `message-content` - Message content
- [ ] `message-reply-input` - Reply input field
- [ ] `message-send-button` - Send message button

---

### BACKOFFICE (Case Handler Portal)

#### Dashboard
- [ ] `backoffice-dashboard` - Dashboard container
- [ ] `dashboard-pending-count` - Pending bookings count
- [ ] `dashboard-quick-actions` - Quick actions section

#### Navigation
- [ ] `bookings-nav` - Bookings navigation link
- [ ] `calendar-nav` - Calendar navigation link
- [ ] `rental-objects-nav` - Rental objects link
- [ ] `reports-nav` - Reports link

#### Bookings List
- [ ] `bookings-table` - Bookings table container
- [ ] `bookings-status-tabs` - Status tabs navigation
- [ ] `bookings-tab-all` - All bookings tab
- [ ] `bookings-tab-pending` - Pending approval tab
- [ ] `bookings-tab-approved` - Approved tab
- [ ] `bookings-tab-rejected` - Rejected tab
- [ ] `bookings-search` - Search input
- [ ] `bookings-filter-date` - Date range filter
- [ ] `booking-case-row-[BOOKING_ID]` - Booking case row (dynamic)

#### Booking Case Details
- [ ] `booking-case-details` - Case details container
- [ ] `booking-case-title` - Case title
- [ ] `booking-case-status` - Status badge
- [ ] `booking-case-requester` - Requester information
- [ ] `booking-case-time` - Time range display
- [ ] `booking-case-notes` - Booking notes
- [ ] `approve-booking` - Approve button
- [ ] `reject-booking` - Reject button
- [ ] `approval-reason-input` - Approval reason textarea
- [ ] `rejection-reason-input` - Rejection reason textarea
- [ ] `confirm-approve` - Confirm approval button
- [ ] `confirm-reject` - Confirm rejection button

#### Messaging
- [ ] `casehandler-message-input` - Message input field
- [ ] `casehandler-message-attachments` - Attachments section
- [ ] `send-message` - Send message button
- [ ] `message-thread` - Message thread container

#### Audit Log
- [ ] `audit-log-entry-[BOOKING_ID]` - Audit log entry (dynamic)
- [ ] `audit-log-timestamp` - Entry timestamp
- [ ] `audit-log-action` - Action description
- [ ] `audit-log-user` - User who performed action

---

## Implementation Priority

### P0 - Critical (Golden Journey Core Path)
1. **Web:** listing-card, listing-details-page, calendar-slot-available, booking-submit, booking-reference
2. **MinSide:** my-bookings-nav, my-bookings-table, booking-row-[ID], booking-status, messages-inbox
3. **Backoffice:** bookings-nav, bookings-table, booking-case-row-[ID], approve-booking, send-message

### P1 - High (Negative Paths & Verification)
1. **Web:** calendar-slot-booked, calendar-slot-blocked, booking-summary
2. **MinSide:** booking-details-page, booking-cancel-button, message-reply-input
3. **Backoffice:** reject-booking, rejection-reason-input, audit-log-entry-[ID]

### P2 - Medium (Enhanced UX)
1. **Web:** listing-filter-panel, booking-mode-selector
2. **MinSide:** bookings-filter-status, bookings-search
3. **Backoffice:** bookings-status-tabs, bookings-search

---

## Implementation Guidelines

### Dynamic Selectors Pattern

For dynamic IDs (booking ID, timestamp), use template format:

```tsx
// Example: Booking row with dynamic ID
<tr data-testid={`booking-row-${booking.id}`}>
  <td data-testid="booking-row-title">{booking.title}</td>
  <td data-testid="booking-status">
    <StatusBadge status={booking.status} />
  </td>
</tr>

// Example: Calendar slot with ISO timestamp
<button
  data-testid={`calendar-slot-available-${slot.startTime}`}
  onClick={() => onSlotClick(slot)}
>
  {formatTime(slot.startTime)}
</button>
```

### Container vs. Element Selectors

- **Container:** Use for page-level or section-level locators (e.g., `listing-details-page`)
- **Element:** Use for interactive elements (buttons, inputs, links)
- **Repeatable:** Use dynamic suffixes for items in lists (e.g., `booking-row-[ID]`)

### Accessibility Considerations

All elements with `data-testid` should ALSO have proper ARIA attributes:

```tsx
<button
  data-testid="approve-booking"
  aria-label="Approve booking"
  type="button"
>
  Approve
</button>
```

---

## Testing Strategy

### Test Isolation
- Each test should seed deterministic data with known IDs
- Use `E2E_LISTING_1`, `E2E_USER_CITIZEN`, etc. as fixture keys
- Never rely on production data

### Selector Stability
- Prefer `data-testid` over CSS classes (classes may change with design updates)
- Prefer `data-testid` over text content (text may be localized)
- Avoid xpath or complex CSS selectors

### Polling Assertions
- Use Playwright's auto-waiting for most assertions
- Only add explicit waits for known async boundaries (e.g., WebSocket updates)
- Use `page.waitForSelector('[data-testid="booking-status"]')` instead of timeouts

---

## CI/CD Integration

### Pre-commit Check
```bash
# Verify all P0 selectors exist before allowing commit
npm run e2e:check-selectors
```

### PR Gate
```bash
# Run golden journey tests on PR
npm run e2e:golden-journey
```

### Nightly Tests
```bash
# Run full suite including approve + reject paths
npm run e2e:full
```

---

## Audit Trail

| Date | Updated By | Change |
|------|------------|--------|
| 2026-01-19 | AI Agent | Initial checklist created from master prompt |

---

**Next Steps:**
1. Implement P0 selectors in DS blocks and app pages
2. Create Page Object Models using these selectors
3. Write Golden Journey tests
4. Add CI workflow
