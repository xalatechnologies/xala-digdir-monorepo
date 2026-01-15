# Complete Project Structure

This document provides comprehensive directory trees for all applications and packages in the monorepo.

---

## apps/web - Public-Facing Web Application

```
apps/web/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── root.css                    # Global styles
│   ├── vite-env.d.ts               # Vite type definitions
│   │
│   ├── components/                 # Shared UI components
│   │   └── (reusable components)
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── listing-details/        # Listing details feature
│   │   │   ├── adapters/          # External service adapters
│   │   │   │   ├── auditProvider.ts
│   │   │   │   ├── favoritesProvider.ts
│   │   │   │   ├── realtimeClient.ts
│   │   │   │   ├── shareTracker.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/         # Feature components
│   │   │   │   ├── ActivityTab.tsx
│   │   │   │   ├── OverviewTab.tsx
│   │   │   │   ├── PaymentSection.tsx
│   │   │   │   ├── RecurringPreviewTable.tsx
│   │   │   │   └── Sidebar/
│   │   │   │       ├── BookingWidgetPlacement.tsx
│   │   │   │       ├── ContactWidget.tsx
│   │   │   │       ├── MapWidget.tsx
│   │   │   │       ├── OpeningHoursWidget.tsx
│   │   │   │       ├── index.ts
│   │   │   │       └── components/
│   │   │   │           ├── BookingAvailabilityConflictDialog.tsx
│   │   │   │           ├── BookingCartSidebar.tsx
│   │   │   │           ├── BookingConfirmationStep.tsx
│   │   │   │           ├── BookingPricingStep.tsx
│   │   │   │           ├── BookingSelectedSlotsSidebar.tsx
│   │   │   │           └── BookingStepperHeader.tsx
│   │   │   ├── presenters/         # Presentation logic
│   │   │   │   └── listingTypePresenter.ts
│   │   │   └── types.ts            # Feature types
│   │   │
│   │   └── reviews/                # Reviews feature
│   │       └── components/         # Review components
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── lib/                        # Shared libraries/utilities
│   │
│   ├── pages/                      # Page components (routes)
│   │
│   ├── providers/                  # React context providers
│   │   ├── AccessibilityMonitoringProvider.tsx
│   │   ├── RealtimeProvider.tsx
│   │   └── index.ts
│   │
│   └── test-utils/                 # Testing utilities
│       ├── accessibility.ts
│       ├── setup.ts
│       └── index.ts
│
├── public/                         # Static assets
│   ├── themes/                     # Theme CSS files
│   │   ├── digilist.css
│   │   └── digilist-extensions.css
│   └── (images, fonts, etc.)
│
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this app)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## apps/backoffice - Admin Portal Application

```
apps/backoffice/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── root.css                    # Global styles
│   │
│   ├── components/                 # Shared UI components
│   │   ├── bookings/              # Booking-related components
│   │   ├── integrations/          # Integration UI components
│   │   ├── layout/                # Layout components
│   │   ├── organizations/         # Organization components
│   │   ├── seasons/               # Season management components
│   │   ├── shared/                # Shared reusable components
│   │   └── users/                 # User management components
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── calendar/              # Calendar feature
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   │
│   │   ├── listings/              # Listing management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   │
│   │   ├── rental-objects/        # Rental object wizard ⭐
│   │   │   ├── components/        # Wizard UI components
│   │   │   ├── hooks/             # Feature hooks
│   │   │   ├── types/             # TypeScript types
│   │   │   ├── utils/             # Helper utilities
│   │   │   ├── __tests__/         # Comprehensive test suite
│   │   │   │   ├── performance/   # Performance tests
│   │   │   │   ├── security/      # Security tests
│   │   │   │   └── scenarios/     # User scenario tests
│   │   │   └── README.md          # Feature documentation
│   │   │
│   │   └── reviews/               # Review management
│   │       └── components/
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── lib/                        # Shared libraries
│   │
│   ├── pages/                      # Page components
│   │
│   ├── providers/                  # React context providers
│   │   ├── AuthProvider.tsx
│   │   ├── RealtimeProvider.tsx
│   │   └── index.ts
│   │
│   └── routes/                     # Route-specific components
│       ├── gdpr/                  # GDPR management routes
│       ├── integrations/          # Integration routes
│       ├── organizations/         # Organization routes
│       ├── seasons/               # Season routes
│       ├── tenant/                # Tenant routes
│       └── users/                 # User management routes
│
├── public/                         # Static assets
│   └── themes/                     # Theme CSS files
│
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this app)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## apps/minside - User Portal Application

```
apps/minside/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component
│   ├── root.css                    # Global styles
│   │
│   ├── components/                 # Shared UI components
│   │   ├── layout/                # Layout components
│   │   │   ├── Sidebar.tsx        # Main navigation sidebar
│   │   │   ├── Header.tsx         # App header
│   │   │   └── Footer.tsx
│   │   │
│   │   └── notifications/         # Notification components
│   │       ├── NotificationBadge.tsx
│   │       ├── NotificationCenter.tsx
│   │       └── NotificationItem.tsx
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── listings/              # Listing features
│   │   │   ├── components/        # Listing components
│   │   │   └── hooks/             # Listing hooks
│   │   │
│   │   └── seasons/               # Season features
│   │       └── components/        # Season components
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── lib/                        # Shared libraries
│   │
│   ├── providers/                  # React context providers
│   │   ├── AuthProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   │
│   ├── routes/                     # Route-specific components
│   │   └── org/                   # Organization routes
│   │
│   └── utils/                      # Helper utilities
│
├── public/                         # Static assets
│   └── themes/                     # Theme CSS files
│
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this app)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## apps/api - Fastify API Server

```
apps/api/
├── src/
│   ├── main.ts                     # Server entry point
│   ├── app.ts                      # Fastify app setup
│   │
│   ├── __tests__/                  # API tests
│   │   ├── auth/                  # Auth tests
│   │   ├── controllers/           # Controller tests
│   │   └── integration/           # Integration tests
│   │
│   ├── adapters/                   # External service adapters
│   │
│   ├── config/                     # Configuration
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── cors.ts
│   │   └── env.ts
│   │
│   ├── core/                       # Core utilities
│   │   ├── audit/                 # Audit logging
│   │   ├── encryption/            # Encryption utilities
│   │   ├── errors/                # Error handling
│   │   ├── policy/                # RBAC policies
│   │   ├── secrets/               # Secret management
│   │   └── validation/            # Input validation
│   │
│   ├── database/                   # Database layer
│   │   ├── schema/                # Drizzle ORM schemas
│   │   │   ├── users.ts
│   │   │   ├── listings.ts
│   │   │   ├── bookings.ts
│   │   │   ├── tenants.ts
│   │   │   └── index.ts
│   │   ├── migrations/            # Database migrations
│   │   └── seeds/                 # Seed data
│   │
│   ├── graphql/                    # GraphQL (if used)
│   │
│   ├── integrations/               # Third-party integrations
│   │   └── vipps/                 # Vipps payment integration
│   │       ├── auth.ts
│   │       ├── payment.ts
│   │       └── types.ts
│   │
│   └── modules/                    # Feature modules (30+)
│       ├── allocations/           # Resource allocation
│       ├── audit/                 # Audit log API
│       ├── auth/                  # Authentication
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.schema.ts
│       │   ├── auth.types.ts
│       │   └── __tests__/
│       ├── authz/                 # Authorization (RBAC)
│       ├── availability/          # Availability management
│       ├── backoffice/            # Backoffice-specific APIs
│       ├── billing/               # Billing and invoices
│       ├── blocks/                # Blocking/availability blocks
│       ├── booking/               # Booking CRUD
│       │   ├── booking.controller.ts
│       │   ├── booking.service.ts
│       │   └── __tests__/
│       ├── calendar/              # Calendar operations
│       ├── configuration/         # System configuration
│       ├── conversations/         # Messaging
│       ├── dashboard/             # Dashboard data
│       ├── discount-codes/        # Discount codes
│       ├── gdpr/                  # GDPR operations
│       ├── health/                # Health check endpoint
│       ├── help/                  # Help/support
│       ├── integrations/          # Integration management
│       ├── listing/               # Listing CRUD
│       ├── messages/              # Direct messaging
│       ├── monitoring/            # System monitoring
│       ├── notification-system/   # Multi-channel notifications
│       │   └── channels/          # Email, SMS, Push channels
│       ├── notifications/         # In-app notifications
│       ├── organizations/         # Kommune/tenant management
│       ├── pricing/               # Pricing rules
│       ├── profile/               # User profiles
│       ├── public/                # Public APIs (no auth)
│       ├── push-notifications/    # Push notification service
│       ├── rental-objects/        # Rental object management
│       ├── reports/               # Analytics and reports
│       ├── reviews/               # Review system
│       ├── search/                # Search functionality
│       ├── season-applications/   # Season application system
│       ├── seasonal-lease/        # Seasonal lease management
│       └── seasons/               # Season management
│
├── drizzle.config.ts               # Drizzle ORM configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this app)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## packages/client-sdk - Enterprise SDK

```
packages/client-sdk/
├── src/
│   ├── index.ts                    # Main entry point (exports all)
│   │
│   ├── __tests__/                  # Comprehensive test suite
│   │   ├── auth/                  # Auth service tests
│   │   ├── contracts/             # Contract parity tests
│   │   ├── core/                  # Core functionality tests
│   │   ├── e2e/                   # End-to-end tests
│   │   ├── integration/           # Integration tests
│   │   ├── security/              # Security tests
│   │   ├── services/              # Service tests
│   │   └── utils/                 # Utility tests
│   │
│   ├── core/                       # Core SDK functionality
│   │   ├── client.ts              # HTTP client
│   │   ├── config.ts              # SDK configuration
│   │   ├── errors.ts              # Error handling
│   │   └── types.ts               # Core types
│   │
│   ├── dal/                        # Data Access Layer (deprecated)
│   │
│   ├── hooks/                      # React Query hooks ⭐
│   │   ├── __tests__/             # Hook tests
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   ├── useListings.ts
│   │   ├── useUsers.ts
│   │   ├── useOrganizations.ts
│   │   ├── useReports.ts
│   │   ├── useIntegrations.ts
│   │   ├── useNotifications.ts
│   │   ├── useGDPR.ts
│   │   └── index.ts               # Export all hooks
│   │
│   ├── localization/               # i18n utilities
│   │
│   ├── realtime/                   # WebSocket client ⭐
│   │   ├── index.ts               # Realtime client singleton
│   │   ├── client.ts              # WebSocket implementation
│   │   ├── events.ts              # Event types
│   │   └── handlers.ts            # Event handlers
│   │
│   ├── services/                   # Service layer (30+ services) ⭐
│   │   ├── allocationService.ts
│   │   ├── auditService.ts
│   │   ├── authService.ts
│   │   ├── authzService.ts
│   │   ├── availabilityService.ts
│   │   ├── backofficeService.ts
│   │   ├── billingService.ts
│   │   ├── blockService.ts
│   │   ├── bookingService.ts
│   │   ├── calendarService.ts
│   │   ├── configurationService.ts
│   │   ├── conversationService.ts
│   │   ├── dashboardService.ts
│   │   ├── discountCodeService.ts
│   │   ├── gdprService.ts
│   │   ├── helpService.ts
│   │   ├── integrationService.ts
│   │   ├── listingService.ts
│   │   ├── messageService.ts
│   │   ├── monitoringService.ts
│   │   ├── notificationService.ts
│   │   ├── notificationSystemService.ts
│   │   ├── organizationService.ts
│   │   ├── pricingService.ts
│   │   ├── profileService.ts
│   │   ├── publicService.ts
│   │   ├── pushNotificationService.ts
│   │   ├── rentalObjectService.ts
│   │   ├── reportService.ts
│   │   ├── reviewService.ts
│   │   ├── searchService.ts
│   │   ├── seasonApplicationService.ts
│   │   ├── seasonalLeaseService.ts
│   │   ├── seasonService.ts
│   │   └── index.ts               # Export all services
│   │
│   ├── types/                      # TypeScript types
│   │   ├── api.ts                 # API response types
│   │   ├── dto.ts                 # Data Transfer Objects
│   │   ├── entities.ts            # Domain entities
│   │   └── index.ts
│   │
│   └── utils/                      # Utility functions
│       ├── date.ts
│       ├── format.ts
│       ├── validation.ts
│       └── index.ts
│
├── tsup.config.ts                  # Build configuration
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this package)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## packages/ds - Design System Facade

```
packages/ds/
├── src/
│   ├── index.ts                    # Main exports (re-exports DS components)
│   ├── styles.ts                   # Single CSS import point ⚠️
│   │
│   ├── primitives/                 # Basic components (re-exported)
│   │   └── (Button, Input, Card, etc.)
│   │
│   ├── composed/                   # Mid-level composed components
│   │   ├── ContentLayout.tsx
│   │   ├── ContentSection.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Navigation.tsx
│   │   └── FilterBar.tsx
│   │
│   ├── blocks/                     # Business-specific components
│   │   ├── StatsGrid.tsx
│   │   ├── KPICard.tsx
│   │   ├── ListingCard.tsx
│   │   └── BookingCard.tsx
│   │
│   ├── shells/                     # Application-level layouts
│   │   ├── AppShell.tsx
│   │   └── DashboardShell.tsx
│   │
│   ├── providers/                  # Context providers
│   │   ├── DesignsystemetProvider.tsx
│   │   └── ThemeProvider.tsx
│   │
│   └── utils/                      # Design system utilities
│       ├── tokens.ts              # Design token access
│       └── classNames.ts          # Class name utilities
│
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this package)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## packages/i18n - Internationalization

```
packages/i18n/
├── src/
│   ├── index.ts                    # Main entry point
│   │
│   ├── locales/                    # Translation files
│   │   ├── nb.ts                  # Norwegian (Bokmål)
│   │   ├── en.ts                  # English
│   │   └── index.ts
│   │
│   ├── hooks/                      # React hooks
│   │   ├── useT.ts                # Translation hook
│   │   ├── useLanguage.ts         # Language switcher
│   │   └── index.ts
│   │
│   ├── utils/                      # Utilities
│   │   ├── formatDate.ts
│   │   ├── formatNumber.ts
│   │   └── interpolate.ts
│   │
│   └── types/                      # TypeScript types
│       └── translations.ts
│
├── scripts/                        # Build scripts
│   └── build-types.ts             # Generate translation types
│
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this package)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## packages/eslint-config - Shared ESLint Configuration

```
packages/eslint-config/
├── index.js                        # Main ESLint config
│
├── rules/                          # Custom ESLint rules
│   ├── digdir-as-child-single-child.js
│   ├── digdir-no-hardcoded-colors.js
│   ├── digdir-no-hardcoded-spacing.js
│   ├── digdir-no-hardcoded-typography.js
│   ├── digdir-prefer-ds-components.js
│   ├── digdir-require-button-type.js
│   ├── digdir-require-interactive-labels.js
│   └── digdir-require-provider.js
│
├── scanner.js                      # Design system compliance scanner
│
├── package.json                    # Dependencies
├── CLAUDE.md                       # AI context (this package)
├── AGENTS.md                       # Commands reference
└── .cursorrules                    # AI rules
```

---

## Key Patterns Explained

### Feature-Based Organization (Apps)
```
features/
└── feature-name/
    ├── components/        # UI components
    ├── hooks/             # Custom hooks
    ├── utils/             # Helper functions
    ├── types.ts           # TypeScript types
    ├── adapters/          # External service adapters (optional)
    ├── presenters/        # Presentation logic (optional)
    └── __tests__/         # Feature tests
```

### Module Structure (API)
```
modules/
└── module-name/
    ├── module-name.controller.ts  # Route handlers
    ├── module-name.service.ts     # Business logic
    ├── module-name.schema.ts      # Zod validation schemas
    ├── module-name.types.ts       # TypeScript types
    └── __tests__/                 # Module tests
```

### Service Pattern (SDK)
```
services/
└── serviceNameService.ts          # Service implementation
    - Exports typed functions
    - Uses HTTP client
    - Handles errors (RFC 7807)
    - Returns typed responses
```

### Design System Hierarchy
```
DS Facade (@xala/ds)
├── Primitives      # Re-exported from @digdir/designsystemet-react
├── Composed        # Custom mid-level components
├── Blocks          # Business-specific components
└── Shells          # Application-level layouts
```

---

## Important Notes

### ⚠️ Critical Files
- `apps/*/src/main.tsx` - App entry points
- `packages/ds/src/styles.ts` - ONLY file that imports DS CSS
- `packages/client-sdk/src/index.ts` - SDK main export
- `apps/api/src/database/schema/` - Database schema definitions

### 🔒 Protected Directories
- `*/node_modules/` - Auto-generated, never commit
- `*/dist/` - Build output, never commit
- `*/.turbo/` - Turborepo cache, never commit
- `tests/reports/` - Test output, gitignored
- `tests/screenshots/` - Test screenshots, gitignored
- `tests/artifacts/` - Test artifacts, gitignored

### 📦 Package Dependencies
- Apps depend on: `@digilist/client-sdk`, `@xala/ds`, `@xala/i18n`
- SDK depends on: `@tanstack/react-query`, `axios`
- DS depends on: `@digdir/designsystemet-react`, `@digdir/designsystemet-css`
- All packages use: TypeScript, Vite/tsup for building

---

## See Also

- [Root CLAUDE.md](../CLAUDE.md) - Architecture and rules
- [Root AGENTS.md](../AGENTS.md) - Commands reference
- [tests/README.md](../tests/README.md) - Test organization
- Individual app/package CLAUDE.md files for detailed context
