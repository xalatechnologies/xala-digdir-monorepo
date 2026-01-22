# App Audit: MinSide + Web

> **Phase 0 Deliverable** - End-to-End Quality Governor

---

## 1. MinSide (MinZida) App

### 1.1 Routes Inventory

| Route | Component | Context Required | Capability |
|-------|-----------|------------------|------------|
| `/login` | LoginPage | None | Public |
| `/` | DashboardPage | personal | CAP_DASHBOARD |
| `/bookings` | BookingsPage | personal | CAP_BOOKINGS |
| `/billing` | BillingPage | personal | CAP_BILLING |
| `/calendar` | CalendarPage | personal | CAP_CALENDAR |
| `/messages` | MessagesPage | personal | CAP_MESSAGES |
| `/favorites` | FavoritesPage | personal | CAP_FAVORITES |
| `/settings` | SettingsPage | any | CAP_SETTINGS |
| `/preferences` | UserPreferencesPage | any | CAP_PREFERENCES |
| `/notifications` | NotificationsPage | any | CAP_NOTIFICATIONS |
| `/privacy` | PrivacyPage | any | CAP_PRIVACY |
| `/help` | HelpPage | any | CAP_HELP |
| `/org` | OrganizationDashboardPage | organization | CAP_ORG_DASHBOARD |
| `/org/bookings` | OrganizationBookingsPage | organization | CAP_ORG_BOOKINGS |
| `/org/invoices` | OrganizationInvoicesPage | organization | CAP_ORG_INVOICES |
| `/org/members` | OrganizationMembersPage | organization | CAP_ORG_MEMBERS |
| `/org/season-rental` | SeasonRentalPage | organization | CAP_ORG_SEASON |
| `/org/settings` | OrganizationSettingsPage | organization | CAP_ORG_SETTINGS |
| `/org/activity` | OrganizationActivityPage | organization | CAP_ORG_ACTIVITY |

### 1.2 Context Switch Architecture

```
AccountContextProvider
├── DashboardContext = 'personal' | 'organization'
├── hasSelectedAccount: boolean
├── rememberChoice: boolean (persisted in localStorage)
└── AccountSelectionModal (shown on first visit if !rememberChoice)
```

**Storage:**
- `localStorage`: rememberChoice flag, selected context
- Session/Auth: Organization membership claims in JWT

### 1.3 Data Loading Patterns

```typescript
// Provider stack
ThemeProvider
└── I18nProvider
    └── DesignsystemetProvider
        └── BrowserRouter
            └── AuthProvider (appType: 'minside')
                └── AccountContextProvider
                    └── RealtimeProvider (WebSocket)
                        └── Routes
```

**Key hooks (from @digilist/client-sdk):**
- `useBookings()` - User's bookings
- `useBilling()` - Invoices/receipts
- `useMessages()` - Messaging inbox
- `useFavorites()` - Favorite listings
- `useNotifications()` - System notifications
- `useOrganization()` - Org context data
- `useOrganizationBookings()` - Org bookings

### 1.4 Key Features

| Feature | SDK Hook | API Endpoint |
|---------|----------|--------------|
| Dashboard stats | `useUserStats()` | GET /api/me/stats |
| Bookings list | `useBookings()` | GET /api/me/bookings |
| Booking cancel | `useCancelBooking()` | POST /api/bookings/:id/cancel |
| Messages | `useConversations()` | GET /api/me/conversations |
| Favorites | `useFavorites()` | GET /api/me/favorites |
| Org members | `useOrgMembers()` | GET /api/organizations/:id/members |
| Org bookings | `useOrgBookings()` | GET /api/organizations/:id/bookings |

---

## 2. Web App

### 2.1 Routes Inventory

| Route | Component | Auth Required | Capability |
|-------|-----------|---------------|------------|
| `/` | RentalObjectsPage | No | Public |
| `/listings` | RentalObjectsPage | No | Public |
| `/listings/:id` | RentalObjectDetailPage | No | Public |
| `/login` | LoginPage | No | Public |
| `/privacy-settings` | PrivacySettingsPage | No | Public |
| `/payment/callback` | PaymentCallbackPage | Yes | CAP_PAYMENT |
| `/calendar/:id` | ActivityCalendarPage | No/Yes | CAP_BOOKING |

### 2.2 Core Page Components

**RentalObjectsPage (Listing Search)**
```
├── Search input
├── Category filters
├── Availability date range
├── Price range filter
├── Sort options
├── Grid/List view toggle
├── Infinite scroll pagination
└── Listing cards with quick-book
```

**RentalObjectDetailPage (Listing Details)**
```
├── Image gallery/carousel
├── Title + capacity + category
├── Price display
├── Address + map
├── Description
├── Tabs:
│   ├── Overview
│   ├── Rules/Regler
│   ├── Availability/Calendar
│   ├── Pricing/Priser
│   ├── Contact/Kontakt
│   └── Documents/Vedlegg
└── Booking wizard (bottom panel)
```

### 2.3 Calendar & Booking Components

**Calendar Modes:**
1. **Read-only** - View availability (logged out)
2. **Bookable** - Select slots (logged in)
3. **In-game** - TTL reservation mode

**Slot States:**
| State | Color | User Action |
|-------|-------|-------------|
| Available | Green | Can book |
| Reserved | Yellow | Cannot book |
| Occupied | Red | Cannot book |
| Blackout | Gray | Cannot book |
| Disabled | Striped | Cannot book |
| Selected | Blue | In cart |

**Booking Wizard Steps:**
1. Select slot(s)
2. Review + add-ons
3. User info (if not logged in → auth boundary)
4. Payment (if required)
5. Confirmation

### 2.4 Data Loading Patterns

```typescript
// Provider stack
BrowserRouter
└── I18nProvider
    └── DesignsystemetProvider
        └── ThemeProvider
            └── AuthProvider (appType: 'web')
                └── RealtimeProvider
                    └── Routes
```

**Key hooks:**
- `useListings()` - Search/filter listings
- `useListing(id)` - Single listing details
- `useAvailability(id, dateRange)` - Calendar slots
- `useCreateBooking()` - Booking mutation
- `usePricePreview()` - Price calculation

### 2.5 Key Features

| Feature | SDK Hook | API Endpoint |
|---------|----------|--------------|
| Listing search | `useListings()` | GET /api/listings |
| Listing detail | `useListing()` | GET /api/listings/:id |
| Availability | `useAvailability()` | GET /api/listings/:id/availability |
| Price preview | `usePricePreview()` | POST /api/pricing/preview |
| Create booking | `useCreateBooking()` | POST /api/bookings |
| Payment init | `usePaymentInit()` | POST /api/payments/init |

---

## 3. API Endpoints Used

### 3.1 Auth Endpoints (Both Apps)
- `POST /api/auth/demo-token` - Demo login
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/oauth/:provider` - OAuth/BankID
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Session status
- `POST /api/auth/refresh` - Token refresh

### 3.2 User Endpoints (MinSide)
- `GET /api/me` - Current user profile
- `PATCH /api/me` - Update profile
- `GET /api/me/stats` - Dashboard stats
- `GET /api/me/bookings` - My bookings
- `GET /api/me/favorites` - My favorites
- `GET /api/me/notifications` - Notifications
- `PATCH /api/me/preferences` - Preferences

### 3.3 Listing Endpoints (Web)
- `GET /api/listings` - Search listings
- `GET /api/listings/:id` - Listing details
- `GET /api/listings/:id/availability` - Availability
- `GET /api/listings/:id/rules` - Booking rules
- `GET /api/listings/:id/pricing` - Pricing tiers

### 3.4 Booking Endpoints (Both)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Booking details
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/modify` - Modify booking
- `POST /api/pricing/preview` - Preview price

### 3.5 Organization Endpoints (MinSide)
- `GET /api/organizations/:id` - Org details
- `GET /api/organizations/:id/members` - Members
- `GET /api/organizations/:id/bookings` - Org bookings
- `GET /api/organizations/:id/invoices` - Invoices

---

## 4. Database Tables

### 4.1 Core Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, email, role, tenant_id, org_id |
| `rental_objects` | Listings | id, title, status, tenant_id |
| `bookings` | Reservations | id, user_id, rental_object_id, status |
| `availability` | Calendar slots | id, rental_object_id, start, end, state |
| `organizations` | Organizations | id, name, type, tenant_id |
| `org_memberships` | Member links | user_id, org_id, role |

### 4.2 Supporting Tables
| Table | Purpose |
|-------|---------|
| `pricing_rules` | Dynamic pricing |
| `blackouts` | Maintenance periods |
| `booking_rules` | Booking constraints |
| `payments` | Payment records |
| `invoices` | Billing records |
| `notifications` | System notifications |
| `favorites` | User favorites |
| `messages` / `conversations` | Messaging |
| `audit_log` | Activity history |

---

## 5. Test Coverage Gaps Identified

### MinSide
- [ ] Context switch (personal ↔ org) not tested
- [ ] OAuth callback flow not tested
- [ ] Notification center not tested
- [ ] Season rental workflow not tested
- [ ] Billing/invoice download not tested

### Web
- [ ] Calendar slot states not visually verified
- [ ] Booking wizard full flow not tested
- [ ] Payment callback handling not tested
- [ ] In-game booking TTL not tested
- [ ] Recurring booking preview not tested
- [ ] Blackout display not tested

---

*Generated: 2026-01-18 | Phase 0 Complete*
