# Web App (Public) Feature Coverage Analysis

**Analysis Date:** 2026-01-15
**Application:** `apps/web`
**Port:** 5173 (Vite)
**Target Audience:** Public Users, Authenticated Users, Organization Users

---

## Executive Summary

The `apps/web` application is the public-facing React + Vite application for the Digilist/Xala platform. It provides listing discovery, detailed views, booking flows, and user authentication. The app follows SDK-first principles and uses the @xala/ds design system facade.

### Key Findings

| Metric | Count/Status | Assessment |
|--------|--------------|------------|
| Routes | 4 | MINIMAL |
| Pages | 4 | PARTIAL |
| Features | 2 major | IN PROGRESS |
| SDK Integration | ✅ Full | COMPLIANT |
| Design System (@xala/ds) | ✅ Full | COMPLIANT |
| i18n Integration | ✅ Full | COMPLIANT |
| Realtime Support | ✅ Full | COMPLIANT |
| Authentication | ⚠️ Partial | NEEDS WORK |
| Public Role Coverage | ⚠️ Partial | NEEDS WORK |
| Authenticated User Coverage | ⚠️ Partial | NEEDS WORK |

---

## Route Inventory

### Current Routes

| Route | Page Component | Role Access | Status |
|-------|---------------|-------------|--------|
| `/` | `ListingsPage` | Public | ✅ DONE |
| `/listing/:id` | `ListingDetailPage` | Public | ✅ DONE |
| `/login` | `LoginPage` | Public | ✅ DONE |
| `/payment/callback` | `PaymentCallbackPage` | Authenticated | ✅ DONE |

### Missing Routes (Per Tender Requirements)

| Route | Purpose | Priority | Role |
|-------|---------|----------|------|
| `/search` | Advanced search page | SHOULD-HAVE | Public |
| `/categories` | Category browsing | SHOULD-HAVE | Public |
| `/my-bookings` | User booking history | MUST-HAVE | Authenticated |
| `/my-favorites` | Saved listings | SHOULD-HAVE | Authenticated |
| `/my-profile` | User profile management | MUST-HAVE | Authenticated |
| `/organizations` | Organization membership | SHOULD-HAVE | Organization User |
| `/register` | User registration | MUST-HAVE | Public |
| `/forgot-password` | Password recovery | MUST-HAVE | Public |
| `/oauth/callback` | OAuth callback handling | MUST-HAVE | Public |

---

## Page Analysis

### 1. ListingsPage (`/`)

**File:** `apps/web/src/pages/ListingsPage.tsx`
**Lines:** ~590

#### Features Implemented
- ✅ Listing grid view (responsive)
- ✅ Listing list view
- ✅ Listing map view (Mapbox integration)
- ✅ Listing table view
- ✅ Type filtering (SPACE, RESOURCE, SERVICE, VEHICLE, EVENT, OTHER)
- ✅ Area/City filtering (from API)
- ✅ Capacity filtering
- ✅ Amenities/Facilities filtering
- ✅ Client-side search with results dropdown
- ✅ Pagination (load more)
- ✅ Realtime updates via WebSocket
- ✅ Loading/Error/Empty states
- ✅ SDK-first data fetching (`usePublicListings`, `usePublicCities`)

#### SDK Hooks Used
```typescript
import {
  usePublicListings,
  usePublicCities,
  type ListingCardProjectionDTO,
  type PublicListingParams,
} from '@digilist/client-sdk';
```

#### Compliance Status
| Requirement | Status | Notes |
|-------------|--------|-------|
| SDK-Only Access | ✅ COMPLIANT | Uses `usePublicListings`, `usePublicCities` |
| No Transformers | ✅ COMPLIANT | Uses projection DTOs directly |
| Design Tokens | ✅ COMPLIANT | Uses CSS variables |
| @xala/ds Only | ✅ COMPLIANT | All imports from @xala/ds |
| Accessibility | ✅ PARTIAL | Has aria-labels, role attributes |
| i18n | ⚠️ PARTIAL | Some hardcoded Norwegian strings |

#### Gaps
- ❌ Missing URL-based filter state (bookmarkable filters)
- ❌ Missing sort functionality
- ❌ Missing price range filter
- ❌ Missing date/availability filter
- ❌ Hardcoded listing type labels (should use i18n)

---

### 2. ListingDetailPage (`/listing/:id`)

**File:** `apps/web/src/pages/ListingDetailPage.tsx`
**Lines:** ~469

#### Features Implemented
- ✅ Image slider with fullscreen support
- ✅ Breadcrumb navigation
- ✅ Tab-based content (Overview, Activity, Rules, FAQ)
- ✅ Sidebar widgets (Contact, Map, Opening Hours)
- ✅ Booking widget with calendar
- ✅ Reviews section (list + form)
- ✅ Favorite toggle (with auth check)
- ✅ Share functionality
- ✅ Audit logging (page views, favorites, shares)
- ✅ Realtime updates subscription
- ✅ Slug-based and UUID-based routing
- ✅ Loading/Error/Not Found states

#### SDK Hooks Used
```typescript
import {
  useListing,
  useListingBySlug,
  type Listing as ApiListing,
} from '@digilist/client-sdk';
```

#### Feature Architecture

```
features/listing-details/
├── adapters/
│   ├── auditProvider.ts      # Audit event logging
│   ├── favoritesProvider.ts  # Favorites state
│   ├── realtimeClient.ts     # WebSocket subscriptions
│   └── shareTracker.ts       # Share tracking
├── components/
│   ├── ListingDetailsLayout.tsx
│   ├── ListingHeader.tsx
│   ├── OverviewTab.tsx
│   ├── ActivityTab.tsx
│   ├── RulesTab.tsx
│   ├── FaqTab.tsx
│   ├── KeyFactsRow.tsx
│   ├── FavoriteButton.tsx
│   ├── ShareButton.tsx
│   ├── BookingDialog.tsx
│   ├── PaymentSection.tsx
│   └── Sidebar/
│       ├── ContactWidget.tsx
│       ├── MapWidget.tsx
│       ├── OpeningHoursWidget.tsx
│       └── BookingWidgetPlacement.tsx (1000+ lines)
├── presenters/
│   └── listingTypePresenter.ts
├── types.ts
└── index.ts
```

#### Compliance Status
| Requirement | Status | Notes |
|-------------|--------|-------|
| SDK-Only Access | ✅ COMPLIANT | Uses SDK hooks for data |
| Feature Architecture | ✅ COMPLIANT | Clean separation |
| Design Tokens | ✅ COMPLIANT | Uses CSS variables |
| Audit Logging | ✅ COMPLIANT | Logs views, favorites, shares |
| Accessibility | ⚠️ PARTIAL | Tab panels have ARIA |

#### Gaps
- ⚠️ Contains `transformApiToListing` function (violates Zero Transformers rule)
- ❌ Missing authentication state from SDK (uses local hook)
- ❌ Missing booking confirmation page/flow
- ❌ Missing similar listings section
- ❌ Missing availability calendar API integration

---

### 3. LoginPage (`/login`)

**File:** `apps/web/src/pages/login.tsx`
**Lines:** ~99

#### Features Implemented
- ✅ Vipps login option
- ✅ ID-porten (BankID) login option
- ✅ Microsoft (organization) login option
- ✅ Feature highlights panel
- ✅ Integration badges
- ✅ Redirect after login

#### SDK/DS Usage
```typescript
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  VippsIcon,
  // ...
} from '@xala/ds';
import { useAuth } from '../hooks/useAuth';
```

#### Compliance Status
| Requirement | Status | Notes |
|-------------|--------|-------|
| @xala/ds Only | ✅ COMPLIANT | Uses LoginLayout, LoginOption |
| OAuth Providers | ✅ COMPLIANT | Vipps, ID-porten, Microsoft |

#### Gaps
- ❌ Uses local `useAuth` hook instead of SDK auth service
- ❌ Missing registration link/flow
- ❌ Missing forgot password link
- ❌ Missing session validation on mount
- ❌ OAuth flow redirects to API (not proper SPA OAuth)

---

### 4. PaymentCallbackPage (`/payment/callback`)

**File:** `apps/web/src/pages/PaymentCallbackPage.tsx`
**Lines:** ~299

#### Features Implemented
- ✅ Vipps payment status checking
- ✅ Success state display
- ✅ Pending state display
- ✅ Error/Failed state display
- ✅ Order ID display
- ✅ Session storage for payment success

#### SDK Hooks Used
```typescript
import { useVippsPayment } from '@digilist/client-sdk';
```

#### Compliance Status
| Requirement | Status | Notes |
|-------------|--------|-------|
| SDK-Only Access | ✅ COMPLIANT | Uses `useVippsPayment` |
| @xala/ds Only | ✅ COMPLIANT | Uses Card, Button, etc. |

#### Gaps
- ❌ Missing redirect to booking confirmation
- ❌ Missing retry payment option
- ❌ Missing booking details display

---

## Booking Widget Analysis

**File:** `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`
**Lines:** ~1028 (largest component)

### Features Implemented
- ✅ Multi-step booking flow (4 steps)
- ✅ Interactive calendar grid (weekly view)
- ✅ Time slot selection with 30-min increments
- ✅ Busy slot visualization
- ✅ Multiple slot selection
- ✅ Slot duration adjustment
- ✅ Price group selection
- ✅ Additional services selection
- ✅ Terms acceptance
- ✅ Private vs Organization booking
- ✅ Organization selection (from SDK)
- ✅ Authentication state check
- ✅ Vipps/ID-porten login integration
- ✅ Booking submission via SDK
- ✅ Conflict detection dialog
- ✅ Success confirmation

### SDK Integration
```typescript
import {
  bookingService,
  auditService,
  type CreateBookingDTO,
  useOrganizations
} from '@digilist/client-sdk';
```

### Booking Steps
1. **Calendar Selection** - Choose time slots
2. **Details & Terms** - Price group, services, T&C
3. **Confirm** - Login + account type + submit
4. **Done** - Success confirmation

### Compliance Status
| Requirement | Status | Notes |
|-------------|--------|-------|
| SDK-Only Access | ✅ COMPLIANT | Uses bookingService.create |
| Multi-slot Support | ✅ COMPLIANT | Supports multiple bookings |
| Organization Booking | ✅ COMPLIANT | Uses useOrganizations |
| Audit Logging | ✅ COMPLIANT | Logs via auditService |

### Gaps
- ❌ Missing availability API integration (uses mock busy slots)
- ❌ Missing real-time availability updates
- ❌ Missing recurring booking support
- ❌ Missing discount code application
- ❌ Missing payment integration (only booking request)
- ❌ Large component needs refactoring

---

## Reviews Feature Analysis

**Location:** `apps/web/src/features/reviews/`

### Components
| Component | File | Lines | Status |
|-----------|------|-------|--------|
| ReviewList | `components/ReviewList.tsx` | ~192 | ✅ DONE |
| ReviewCard | `components/ReviewCard.tsx` | ~150 | ✅ DONE |
| ReviewForm | `components/ReviewForm.tsx` | ~200 | ✅ DONE |

### SDK Integration
```typescript
import { useListingReviews } from '@digilist/client-sdk';
import type { ReviewQueryParams } from '@digilist/client-sdk/types';
```

### Features
- ✅ Paginated review list
- ✅ Status filtering (approved)
- ✅ Helpful count display
- ✅ Empty/Loading/Error states
- ✅ Review form (hidden behind auth + booking check)

### Gaps
- ❌ Missing review submission mutation
- ❌ Missing "mark helpful" functionality
- ❌ Missing reply functionality
- ❌ Missing sorting options

---

## Providers & Hooks Analysis

### RealtimeProvider

**File:** `apps/web/src/providers/RealtimeProvider.tsx`
**Lines:** ~280

#### Features
- ✅ WebSocket connection management
- ✅ Auto-reconnect with backoff
- ✅ Event type subscriptions
- ✅ Connection status tracking
- ✅ Error handling

#### Event Hooks Provided
```typescript
export function useRealtimeBooking(handler);
export function useRealtimeListing(handler);
export function useRealtimeAudit(handler);
export function useRealtimeNotification(handler);
export function useRealtimeMessage(handler);
export function useRealtimeAll(handler);
export function useRealtimeStatus();
```

#### Compliance Status
- ✅ Uses SDK realtime client
- ✅ Proper cleanup on unmount
- ✅ Tenant-aware connection

---

### useAuth Hook

**File:** `apps/web/src/hooks/useAuth.ts`
**Lines:** ~66

#### Features
- ✅ OAuth login initiation
- ✅ Logout with API redirect
- ✅ Session persistence (localStorage)
- ✅ Callback handling

#### Issues
- ❌ Uses localStorage instead of SDK auth service
- ❌ No token refresh logic
- ❌ No session validation
- ❌ Not integrated with SDK authService

---

## Component Library Usage

### @xala/ds Components Used

| Category | Components |
|----------|------------|
| **Layout** | `AppHeader`, `ContentLayout`, `Stack` |
| **Navigation** | `HeaderLogo`, `HeaderSearch`, `HeaderActions`, `HeaderThemeToggle`, `Breadcrumb` |
| **Display** | `ListingCard`, `ListingListItem`, `ListingGrid`, `ListingMap`, `ListingTableView`, `ListingToolbar`, `Card`, `ImageSlider` |
| **Forms** | `Button`, `Checkbox`, `Input`, `Select` |
| **Feedback** | `Spinner`, `Paragraph`, `Heading`, `Text`, `Badge` |
| **Overlays** | `Drawer`, `DrawerSection`, `DrawerItem`, `DialogProvider`, `RequireAuthModal`, `ShareSheet` |
| **Auth** | `LoginLayout`, `LoginOption`, `HeaderLoginButton`, `NotificationBell` |
| **Icons** | `FilterIcon`, `CalendarIcon`, `UserIcon`, `SettingsIcon`, `MapPinIcon`, `IdPortenIcon`, `VippsIcon`, `MicrosoftIcon` |

### Compliance
- ✅ All UI components from @xala/ds
- ✅ No direct @digdir/* imports in app code
- ✅ Design tokens used throughout

---

## SDK Hook Coverage

### Hooks Used in Web App

| Hook | Source | Usage |
|------|--------|-------|
| `usePublicListings` | @digilist/client-sdk | ListingsPage |
| `usePublicCities` | @digilist/client-sdk | ListingsPage |
| `useListing` | @digilist/client-sdk | ListingDetailPage |
| `useListingBySlug` | @digilist/client-sdk | ListingDetailPage |
| `useListingReviews` | @digilist/client-sdk | ReviewList |
| `useVippsPayment` | @digilist/client-sdk | PaymentCallbackPage |
| `useOrganizations` | @digilist/client-sdk | BookingWidgetPlacement |
| `useNotificationUnreadCount` | @digilist/client-sdk | App header |

### Missing SDK Hook Usage

| Hook | Should Be Used For |
|------|-------------------|
| `useAuth` (SDK) | Replace local useAuth |
| `useUser` | User profile data |
| `useMyBookings` | User booking history |
| `useCreateBooking` | Booking mutations |
| `useFavorites` | Favorites management |
| `useSearch` | Advanced search |

---

## Role Coverage Analysis

### Public Role

| Capability | Status | Implementation |
|------------|--------|----------------|
| Browse listings | ✅ DONE | ListingsPage |
| View listing details | ✅ DONE | ListingDetailPage |
| View availability | ⚠️ PARTIAL | Calendar shows mock data |
| Search listings | ✅ DONE | HeaderSearch, ListingsPage |
| Filter listings | ✅ DONE | Filter drawer |
| View reviews | ✅ DONE | ReviewList |
| View map | ✅ DONE | ListingMap |
| Contact owner | ✅ DONE | ContactWidget |

### Authenticated User Role

| Capability | Status | Implementation |
|------------|--------|----------------|
| Login/Logout | ✅ DONE | LoginPage, useAuth |
| View profile | ❌ MISSING | No profile page |
| Edit profile | ❌ MISSING | No profile edit |
| Book listings | ⚠️ PARTIAL | BookingWidget (no confirmation) |
| View my bookings | ❌ MISSING | No my-bookings page |
| Cancel booking | ❌ MISSING | No UI |
| Modify booking | ❌ MISSING | No UI |
| Save favorites | ⚠️ PARTIAL | Toggle exists, no list page |
| Write reviews | ⚠️ PARTIAL | Form exists, no submission |
| Receive notifications | ✅ DONE | NotificationBell, RealtimeToast |

### Organization User Role

| Capability | Status | Implementation |
|------------|--------|----------------|
| Book as organization | ✅ DONE | BookingWidget org selection |
| View organization bookings | ❌ MISSING | No org dashboard |
| Manage organization | ❌ MISSING | Redirect to backoffice |

---

## Accessibility (WCAG 2.1 AA) Analysis

### Implemented
- ✅ Skip links component (`SkipLinks.tsx`)
- ✅ Semantic HTML (main, nav, section)
- ✅ ARIA labels on interactive elements
- ✅ Role attributes on dynamic regions
- ✅ aria-live for status updates
- ✅ Keyboard navigable tabs
- ✅ Focus management in dialogs

### Missing
- ❌ Color contrast verification
- ❌ Screen reader testing
- ❌ Focus trap in modals
- ❌ Alternative text for all images
- ❌ Error identification with suggestions

### Accessibility Test Utils
- Located: `apps/web/src/test-utils/accessibility.ts`
- Purpose: Testing accessibility compliance

---

## i18n Analysis

### Implementation
- ✅ I18nProvider wraps entire app
- ✅ useT hook used in MainLayout
- ✅ Translation keys in header search

### Gaps
- ❌ Many hardcoded Norwegian strings in ListingsPage
- ❌ ListingDetailPage lacks i18n
- ❌ BookingWidget has hardcoded strings
- ❌ Error messages not translated
- ❌ Missing English translations

### Hardcoded Strings Found
```typescript
// ListingsPage.tsx
const LISTING_TYPE_OPTIONS = [
  { id: 'ALL', label: 'Alle typer' },  // ❌ Hardcoded
  { id: 'SPACE', label: 'Lokale' },     // ❌ Hardcoded
  // ...
];

// BookingWidgetPlacement.tsx
'Velg tidspunkter'  // ❌ Hardcoded
'Din bookingforespørsel er sendt'  // ❌ Hardcoded
```

---

## Error Handling Analysis

### Implemented
- ✅ ErrorBoundary component
- ✅ Loading states with Spinner
- ✅ Error states with retry buttons
- ✅ Empty states with helpful messages
- ✅ Network error display

### Gaps
- ❌ No RFC 7807 error parsing
- ❌ No global error notification
- ❌ No offline detection/handling
- ❌ No error logging to audit service

---

## Environment Configuration

### Required Environment Variables
```bash
VITE_API_URL          # API base URL (default: https://api.digilist.no)
VITE_TENANT_ID        # Current tenant ID
VITE_LICENSE_KEY      # SDK license key
VITE_MAPBOX_TOKEN     # Mapbox API token for maps
```

### SDK Initialization
```typescript
// main.tsx
initializeClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  tenantId: import.meta.env.VITE_TENANT_ID || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  licenseKey: import.meta.env.VITE_LICENSE_KEY || '',
});
```

---

## Testing Status

### Test Files Found
| File | Purpose |
|------|---------|
| `components/RealtimeToast.test.tsx` | Toast notification tests |
| `components/SkipLinks.test.tsx` | Skip links tests |
| `test-utils/accessibility.ts` | Accessibility testing utilities |
| `test-utils/index.ts` | Test utilities export |

### Test Coverage
- ⚠️ Limited component tests
- ❌ No page-level tests
- ❌ No E2E tests in app directory
- ❌ No integration tests

---

## Critical Gaps Summary

### MUST-HAVE (Blocking Tender Compliance)

| Gap | Impact | Effort |
|-----|--------|--------|
| Missing `/my-bookings` page | User cannot view booking history | Medium |
| Missing `/my-profile` page | User cannot manage account | Medium |
| Missing `/register` page | No user registration | Medium |
| Replace local useAuth with SDK | Auth state inconsistency | Low |
| Availability API integration | Booking shows mock data | High |
| Booking confirmation flow | No completion feedback | Medium |

### SHOULD-HAVE

| Gap | Impact | Effort |
|-----|--------|--------|
| i18n for all strings | No English support | Medium |
| Advanced search page | Limited discovery | Medium |
| URL-based filter state | Non-bookmarkable filters | Low |
| Review submission | Cannot write reviews | Low |
| Favorites list page | Cannot view saved | Low |

### NICE-TO-HAVE

| Gap | Impact | Effort |
|-----|--------|--------|
| Similar listings | Lower engagement | Medium |
| Sort functionality | UX limitation | Low |
| Recurring bookings UI | Feature incomplete | High |
| Discount code UI | Feature incomplete | Medium |

---

## Recommendations

### Immediate Actions (30 Days)

1. **Replace local useAuth hook with SDK authService**
   - File: `apps/web/src/hooks/useAuth.ts`
   - Action: Refactor to use `@digilist/client-sdk` auth hooks

2. **Add missing user pages**
   - Create: `/my-bookings`, `/my-profile`, `/register`
   - Use SDK hooks: `useMyBookings`, `useUser`

3. **Fix Zero Transformers violation**
   - File: `apps/web/src/pages/ListingDetailPage.tsx`
   - Action: Request API to return compatible projection DTO

4. **Integrate real availability API**
   - File: `BookingWidgetPlacement.tsx`
   - Use: `useListingAvailability` hook

### Medium-Term (60 Days)

5. **Complete i18n coverage**
   - Extract all hardcoded strings to translation files
   - Add English translations

6. **Add review submission**
   - Use: `useCreateReview` mutation hook

7. **Add booking confirmation page**
   - Route: `/booking/:id/confirm`
   - Show booking details after submission

### Long-Term (90 Days)

8. **Refactor BookingWidgetPlacement**
   - Split 1000+ line component into smaller modules
   - Extract sub-components

9. **Add E2E tests**
   - Cover critical user flows
   - Booking flow, login flow

10. **Add offline support**
    - Service worker for core pages
    - Graceful degradation

---

## Verification Commands

```bash
# Check route count
grep -r "Route path=" apps/web/src/App.tsx | wc -l

# Check SDK imports
grep -r "@digilist/client-sdk" apps/web/src/ | wc -l

# Check @xala/ds usage
grep -r "from '@xala/ds'" apps/web/src/ | wc -l

# Check hardcoded strings
grep -rn "label: '" apps/web/src/pages/ | head -20

# Check for direct @digdir imports (should be 0)
grep -r "@digdir/designsystemet" apps/web/src/ | wc -l
```

---

## Appendix: File Tree

```
apps/web/src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point, SDK init
├── root.css               # Global styles
├── vite-env.d.ts          # Vite types
├── components/
│   ├── ErrorBoundary.tsx
│   ├── PaymentStatusBadge.tsx
│   ├── RealtimeToast.tsx
│   ├── RealtimeToast.test.tsx
│   ├── SentryTestComponent.tsx
│   ├── SkipLinks.tsx
│   ├── SkipLinks.test.tsx
│   └── index.ts
├── features/
│   ├── listing-details/
│   │   ├── adapters/
│   │   ├── components/
│   │   ├── presenters/
│   │   ├── types.ts
│   │   └── index.ts
│   └── reviews/
│       └── components/
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── sentry.ts
├── pages/
│   ├── ListingsPage.tsx
│   ├── ListingDetailPage.tsx
│   ├── PaymentCallbackPage.tsx
│   └── login.tsx
├── providers/
│   ├── AccessibilityMonitoringProvider.tsx
│   ├── RealtimeProvider.tsx
│   └── index.ts
└── test-utils/
    ├── accessibility.ts
    └── index.ts
```

---

*Document generated as part of Enterprise Platform Roadmap analysis (Task 041)*
