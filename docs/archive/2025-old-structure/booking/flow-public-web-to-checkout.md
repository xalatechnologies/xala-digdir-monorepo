# Flow: Public Web to Checkout

**Date:** 2026-01-19  
**Status:** Implementation Reference  
**Version:** 1.0

---

## Overview

This document describes the **complete booking flow** from the public web application through to checkout, covering all user interactions, API calls, and state transitions.

---

## 1. User Journey Overview

```
┌──────────────────┐
│  Browse Listings │
│  (search/filter) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Rental Object    │
│ Detail Page      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select Booking   │
│ Mode             │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Calendar View    │
│ (availability)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Select Time Slot │
│ or Date Range    │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│  Login │ │ Already Auth │
│  Flow  │ │              │
└───┬────┘ └──────┬───────┘
    │             │
    └──────┬──────┘
           │
           ▼
┌──────────────────┐
│ Booking Dialog   │
│ (confirm/notes)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Payment/Confirm  │
│                  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Confirmation     │
│ (receipt)        │
└──────────────────┘
```

---

## 2. Phase 1: Browsing & Selection

### 2.1 Landing on Listings

**Route:** `/` or `/lokaler`

**Components:**
- `HomePage.tsx` or `RentalObjectsPage.tsx`
- `RentalObjectCard.tsx` (grid items)
- Filter sidebar

**API Calls:**
```typescript
GET /api/rental-objects
  ?category=LOKALER_OG_BANER
  &status=published
  &page=1
  &limit=20
```

### 2.2 Enter Detail Page

**Route:** `/lokaler/:slug` or `/rental-objects/:slug`

**Component:** `RentalObjectDetailPage.tsx`

**API Calls:**
```typescript
// Get full rental object details
GET /api/rental-objects/:id

// Get calendar configuration
GET /api/rental-objects/:id/calendar-config

// Get availability for current week
GET /api/availability/:id?from=2026-01-13&to=2026-01-19
```

---

## 3. Phase 2: Detail Page Layout

### 3.1 Component Tree

```
RentalObjectDetailPage
├── Breadcrumb
├── ImageSlider
├── RentalObjectDetailsLayout
│   ├── Header Block (name, category, location)
│   ├── Tab Navigation (Overview, Calendar, Rules, etc.)
│   ├── Tab Content
│   │   ├── OverviewTab
│   │   ├── CalendarTab
│   │   ├── RulesTab
│   │   ├── FAQTab
│   │   └── LocationTab
│   └── Sidebar
│       └── BookingWidgetPlacement ← MAIN BOOKING ENTRY
└── Related Listings
```

### 3.2 Sidebar Booking Widget

**Component:** `BookingWidgetPlacement.tsx`

**Size:** ~1975 lines (comprehensive)

**Features:**
- Booking mode selector
- Calendar integration
- Slot selection
- Recurring builder
- Account type selection
- Booking dialog
- Pricing display

---

## 4. Phase 3: Booking Mode Selection

### 4.1 Mode Selector

**Component:** `BookingModeSelector.tsx`

**Available Modes:**
```typescript
const availableModes = bookingConfig?.modes?.available || ['SINGLE_SLOT'];

// Example: ['SINGLE_SLOT', 'RECURRING', 'SEASON_RENTAL']
```

### 4.2 Mode Selection UI

```
┌─────────────────────────────────────┐
│ Velg bookingtype                    │
├─────────────────────────────────────┤
│ ◉ Enkeltbooking (Single slot)       │
│ ○ Ukentlig/månedlig (Recurring)     │
│ ○ Heldags booking (All day)         │
│ ○ Sesongbooking (Season rental)     │
└─────────────────────────────────────┘
```

### 4.3 Mode Change Handler

```typescript
const handleModeChange = (mode: BookingMode) => {
  setBookingMode(mode);
  setSelectedSlots(new Set());
  
  // SEASON_RENTAL redirects to MinSide
  if (mode === 'SEASON_RENTAL') {
    router.push(`/minside/season-applications?rentalObjectId=${rentalObjectId}`);
  }
};
```

---

## 5. Phase 4: Calendar Interaction

### 5.1 Calendar Display

**Week View (TIME_SLOTS):**
```
         Man    Tir    Ons    Tor    Fre    Lør    Søn
         13     14     15     16     17     18     19
08:00   [  ]   [  ]   [  ]   [  ]   [  ]   [  ]   [  ]
09:00   [  ]   [██]   [  ]   [  ]   [  ]   [  ]   [  ]
10:00   [  ]   [██]   [  ]   [  ]   [✓✓]   [  ]   [  ]
11:00   [██]   [  ]   [  ]   [  ]   [  ]   [  ]   [  ]
...

[  ] = Available (green)
[██] = Booked (red)
[✓✓] = Selected (blue)
```

### 5.2 Slot Selection

**SINGLE_SLOT:**
```typescript
const handleSlotClick = (dayIndex: number, time: string) => {
  const slotKey = `${dayIndex}-${time}`;
  const newSelection = new Set([slotKey]); // Single select
  setSelectedSlots(newSelection);
  
  calculateTiming(dayIndex, time);
  setShowBookingDialog(true);
};
```

**RECURRING:**
```typescript
const handleSlotClick = (dayIndex: number, time: string) => {
  // Store base selection for pattern
  setBaseSelection({ dayIndex, time });
  setShowRecurringBuilder(true);
};
```

### 5.3 Navigation

```typescript
// Week navigation
const goToPreviousWeek = () => {
  const newDate = new Date(weekStart);
  newDate.setDate(newDate.getDate() - 7);
  setWeekStart(newDate);
  fetchAvailability(newDate);
};

const goToNextWeek = () => {
  const newDate = new Date(weekStart);
  newDate.setDate(newDate.getDate() + 7);
  setWeekStart(newDate);
  fetchAvailability(newDate);
};
```

---

## 6. Phase 5: Authentication Check

### 6.1 Login Flow

When user clicks "Book" on selected slot:

```typescript
const handleBookClick = async () => {
  if (!isAuthenticated) {
    // Save current state before redirect
    const flowContext: FlowContext = {
      selectedSlots: Array.from(selectedSlots),
      startTime,
      endTime,
      rentalObjectId,
      bookingMode,
    };
    
    localStorage.setItem('bookingFlowContext', JSON.stringify(flowContext));
    
    // Redirect to login
    router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
    return;
  }
  
  // Proceed with booking
  openBookingDialog();
};
```

### 6.2 Flow Context Restoration

On page load after login:

```typescript
useEffect(() => {
  const context = localStorage.getItem('bookingFlowContext');
  if (context && isAuthenticated) {
    const flowContext = JSON.parse(context);
    
    // Restore selection
    setSelectedSlots(new Set(flowContext.selectedSlots));
    setStartTime(flowContext.startTime);
    setEndTime(flowContext.endTime);
    setBookingMode(flowContext.bookingMode);
    
    // Open dialog automatically
    setShowBookingDialog(true);
    
    // Clear stored context
    localStorage.removeItem('bookingFlowContext');
  }
}, [isAuthenticated]);
```

---

## 7. Phase 6: Account Type Selection

### 7.1 Private vs Organization

If user has organization memberships:

```
┌─────────────────────────────────────┐
│ Book som                            │
├─────────────────────────────────────┤
│ ◉ Privat (your name)                │
│ ○ Organisasjon:                     │
│   └─ Drammen Idrettsforening        │
│   └─ Oslo Badmintonklubb            │
└─────────────────────────────────────┘
```

### 7.2 Organization Benefits

- Organization pricing (may be discounted)
- Organization invoicing
- Organization calendar visibility

---

## 8. Phase 7: Booking Dialog

### 8.1 Dialog Structure

**Component:** `BookingDialog.tsx`

```
┌─────────────────────────────────────┐
│ Bekreft booking                  ✕  │
├─────────────────────────────────────┤
│                                     │
│ Idrettshall A                       │
│ Onsdag 15. januar 2026              │
│ 10:00 - 11:00 (1 time)              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Pris: 500 NOK / time            │ │
│ │ Total: 500 NOK                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Merknader (valgfritt)               │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Avbryt]  [Bekreft booking]  │
└─────────────────────────────────────┘
```

### 8.2 Form Data

```typescript
interface BookingFormData {
  startTime: string;      // ISO datetime
  endTime: string;        // ISO datetime
  notes?: string;
  organizationId?: string;
  attendees?: number;
  purpose?: string;
  additionalServices?: string[];
}
```

---

## 9. Phase 8: Booking Creation

### 9.1 API Call

```typescript
const handleConfirmBooking = async (formData: BookingFormData) => {
  const bookingData: CreateBookingDTO = {
    rentalObjectId,
    startTime: formData.startTime,
    endTime: formData.endTime,
    notes: formData.notes,
    organizationId: formData.organizationId,
  };
  
  const response = await bookingService.create(bookingData);
  
  if (response.success) {
    setBookingResult(response.data);
    setStep('confirmation');
  }
};
```

### 9.2 Booking Response

```typescript
interface BookingResponse {
  data: {
    id: string;
    status: 'pending' | 'confirmed';
    startTime: string;
    endTime: string;
    totalPrice: string;
    currency: string;
    rentalObjectId: string;
    listingName: string;
    // ...
  };
}
```

### 9.3 Status Scenarios

| Scenario | Initial Status | Next Step |
|----------|----------------|-----------|
| No approval needed, free | `confirmed` | Show confirmation |
| No approval needed, paid | `pending` | Payment flow |
| Approval required | `pending` | Show "awaiting approval" |

---

## 10. Phase 9: Payment Flow

### 10.1 Payment Required

If `totalPrice > 0` and immediate payment configured:

```
┌─────────────────────────────────────┐
│ Betaling                            │
├─────────────────────────────────────┤
│                                     │
│ Total: 500 NOK                      │
│                                     │
│ Velg betalingsmetode:               │
│                                     │
│ [📱 Vipps]  [💳 Kort]  [📄 Faktura] │
│                                     │
└─────────────────────────────────────┘
```

### 10.2 Vipps Flow

```typescript
const handleVippsPayment = async (bookingId: string) => {
  // Create payment session
  const session = await vippsService.createSession({
    bookingId,
    amount: totalPrice,
    currency: 'NOK',
    returnUrl: `${window.location.origin}/bookings/${bookingId}/confirmation`,
  });
  
  // Redirect to Vipps
  window.location.href = session.redirectUrl;
};
```

### 10.3 Payment Callback

On return from payment provider:

```
/bookings/:id/confirmation?payment_status=completed
```

---

## 11. Phase 10: Confirmation

### 11.1 Success Screen

```
┌─────────────────────────────────────┐
│            ✓ Bekreftet!             │
├─────────────────────────────────────┤
│                                     │
│ Booking #ABC123 er registrert       │
│                                     │
│ Idrettshall A                       │
│ Onsdag 15. januar 2026              │
│ 10:00 - 11:00                       │
│                                     │
│ En bekreftelse er sendt til         │
│ din e-postadresse.                  │
│                                     │
│ [Se mine bookinger]  [Ny booking]   │
│                                     │
└─────────────────────────────────────┘
```

### 11.2 Pending Approval Screen

If `requiresApproval = true`:

```
┌─────────────────────────────────────┐
│            ⏳ Sendt inn!            │
├─────────────────────────────────────┤
│                                     │
│ Din forespørsel er mottatt          │
│                                     │
│ Idrettshall A                       │
│ Onsdag 15. januar 2026              │
│ 10:00 - 11:00                       │
│                                     │
│ En saksbehandler vil behandle       │
│ din forespørsel snart.              │
│ Du vil motta en e-post når den      │
│ er godkjent eller avslått.          │
│                                     │
│ [Se mine bookinger]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Recurring Flow

### 12.1 Pattern Builder

After selecting base slot:

```
┌─────────────────────────────────────┐
│ Gjentakende booking                 │
├─────────────────────────────────────┤
│                                     │
│ Basistid: Onsdag 10:00 - 11:00      │
│                                     │
│ Gjenta:                             │
│ ◉ Ukentlig                          │
│ ○ Månedlig                          │
│                                     │
│ Hvilke dager?                       │
│ □ Man  □ Tir  ☑ Ons  □ Tor  □ Fre   │
│                                     │
│ Slutt:                              │
│ ◉ Etter [12] ganger                 │
│ ○ På dato: [__________]             │
│                                     │
│            [Forhåndsvis]            │
└─────────────────────────────────────┘
```

### 12.2 Preview with Conflicts

```
┌─────────────────────────────────────┐
│ Forhåndsvisning                     │
├─────────────────────────────────────┤
│                                     │
│ 12 forekomster generert:            │
│ ✓ 10 ledige                         │
│ ✗ 2 konflikter                      │
│                                     │
│ #  Dato              Status         │
│ 1  15. jan 10:00     ✓ Ledig        │
│ 2  22. jan 10:00     ✓ Ledig        │
│ 3  29. jan 10:00     ✗ Opptatt      │
│ 4  5. feb 10:00      ✓ Ledig        │
│ ...                                 │
│                                     │
│ [Opprett alle]  [Opprett ledige]    │
│                                     │
└─────────────────────────────────────┘
```

### 12.3 API Flow

```typescript
// 1. Generate preview
POST /api/bookings/recurring/preview
{
  rentalObjectId: "...",
  startTime: "2026-01-15T10:00:00",
  endTime: "2026-01-15T11:00:00",
  frequency: "WEEKLY",
  weekdays: [3],
  endCondition: { type: "AFTER_OCCURRENCES", occurrences: 12 }
}

// Response
{
  occurrences: [...],
  summary: {
    totalOccurrences: 12,
    availableCount: 10,
    conflictCount: 2,
    totalPrice: 5000,
    currency: "NOK"
  }
}

// 2. Create (only available)
POST /api/bookings/recurring
{
  ...selection,
  policy: { stopOnConflict: false, allowPartial: true }
}
```

---

## 13. Error Handling

### 13.1 Conflict Error

```json
{
  "type": "https://api.digilist.no/errors/conflict",
  "title": "Booking Conflict",
  "status": 409,
  "detail": "The selected time slot is no longer available",
  "conflictingBookingId": "abc123"
}
```

**User Message:**
```
Den valgte tiden er ikke lenger tilgjengelig.
Noen har booket det mens du valgte.
Velg en annen tid.
```

### 13.2 Validation Error

```json
{
  "type": "https://api.digilist.no/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Start time must be at least 2 hours in the future",
  "errors": {
    "startTime": "Minimum 2 timers varsel kreves"
  }
}
```

### 13.3 Authorization Error

```json
{
  "type": "https://api.digilist.no/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication required"
}
```

**Action:** Redirect to login with returnTo

---

## 14. Mobile Flow Adaptations

### 14.1 Responsive Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

### 14.2 Mobile Adjustments

| Element | Desktop | Mobile |
|---------|---------|--------|
| Calendar | 7-day grid | Scrollable or 3-day |
| Booking widget | Right sidebar | Bottom sheet |
| Dialog | Modal | Full screen |
| Slots | Click | Tap (44px targets) |

---

## 15. Implementation Checklist

### Complete ✅
- [x] Detail page with tabs
- [x] Booking mode selector
- [x] TIME_SLOTS calendar (custom grid)
- [x] Single slot selection
- [x] Recurring pattern builder
- [x] Recurring preview with conflicts
- [x] Booking dialog
- [x] Flow context preservation through login
- [x] Account type selection
- [x] Confirmation screen

### Partial ⚠️
- [ ] ALL_DAY calendar integration in widget
- [ ] MULTI_DAY range selection in widget
- [ ] IN_GAME quick booking UI
- [ ] Conflict detection in single-slot drawer

### Missing ❌
- [ ] Full payment flow integration (Vipps/Stripe)
- [ ] Add-on services selection
- [ ] Real-time availability updates (WebSocket)
