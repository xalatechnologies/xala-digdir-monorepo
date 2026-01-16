# Comprehensive Codebase Tree

## Overview

This document provides a complete tree structure of the Xala Diglist Platform codebase, showing all files and directories with their purposes and relationships.

## Complete Directory Tree

```
xala-digdir-monorepo/
├── .github/                           # GitHub configuration
│   └── workflows/                     # CI/CD workflows
│       ├── ci.yml                     # Continuous integration
│       ├── deploy.yml                 # Deployment pipeline
│       ├── security.yml               # Security scanning
│       └── docs.yml                   # Documentation deployment
│
├── .vscode/                           # VS Code configuration
│   ├── extensions.json                # Recommended extensions
│   ├── settings.json                  # Workspace settings
│   └── launch.json                    # Debug configurations
│
├── apps/                              # Frontend and backend applications
│   ├── api/                           # Backend API service
│   │   ├── src/
│   │   │   ├── main.ts                # Server entry point
│   │   │   ├── app.ts                 # Fastify app configuration
│   │   │   ├── modules/               # Domain modules
│   │   │   │   ├── auth/              # Authentication module
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── jwt.service.ts
│   │   │   │   │   └── idporten.strategy.ts
│   │   │   │   ├── users/             # User management
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.repository.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-user.dto.ts
│   │   │   │   │       ├── update-user.dto.ts
│   │   │   │   │       └── user.dto.ts
│   │   │   │   ├── organizations/     # Organization management
│   │   │   │   │   ├── organizations.controller.ts
│   │   │   │   │   ├── organizations.service.ts
│   │   │   │   │   └── organizations.repository.ts
│   │   │   │   ├── listings/          # Listing management
│   │   │   │   │   ├── listings.controller.ts
│   │   │   │   │   ├── listings.service.ts
│   │   │   │   │   ├── listings.repository.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-listing.dto.ts
│   │   │   │   │       ├── update-listing.dto.ts
│   │   │   │   │       └── listing.dto.ts
│   │   │   │   ├── bookings/          # Booking system
│   │   │   │   │   ├── bookings.controller.ts
│   │   │   │   │   ├── bookings.service.ts
│   │   │   │   │   ├── bookings.repository.ts
│   │   │   │   │   ├── conflict.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-booking.dto.ts
│   │   │   │   │       ├── update-booking.dto.ts
│   │   │   │   │       └── booking.dto.ts
│   │   │   │   ├── payments/          # Payment integration
│   │   │   │   │   ├── payments.controller.ts
│   │   │   │   │   ├── payments.service.ts
│   │   │   │   │   ├── vipps.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── notifications/     # Notification system
│   │   │   │   │   ├── notifications.controller.ts
│   │   │   │   │   ├── notifications.service.ts
│   │   │   │   │   ├── email.service.ts
│   │   │   │   │   └── sms.service.ts
│   │   │   │   └── audit/              # Audit logging
│   │   │   │       ├── audit.service.ts
│   │   │   │       └── audit.repository.ts
│   │   │   ├── common/                # Shared code
│   │   │   │   ├── decorators/        # Custom decorators
│   │   │   │   │   ├── auth.decorator.ts
│   │   │   │   │   ├── permissions.decorator.ts
│   │   │   │   │   └── audit.decorator.ts
│   │   │   │   ├── interceptors/      # Request/response interceptors
│   │   │   │   │   ├── audit.interceptor.ts
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   ├── pipes/             # Data transformation
│   │   │   │   │   ├── validation.pipe.ts
│   │   │   │   │   └── parse-uuid.pipe.ts
│   │   │   │   ├── guards/            # Route guards
│   │   │   │   │   ├── jwt.guard.ts
│   │   │   │   │   ├── permissions.guard.ts
│   │   │   │   └── organization.guard.ts
│   │   │   │   ├── exceptions/        # Custom exceptions
│   │   │   │   │   ├── unauthorized.exception.ts
│   │   │   │   │   ├── forbidden.exception.ts
│   │   │   │   │   └── not-found.exception.ts
│   │   │   │   └── utils/             # Utilities
│   │   │   │       ├── logger.ts
│   │   │   │       ├── crypto.ts
│   │   │   │       └── validation.ts
│   │   │   ├── config/                # Configuration
│   │   │   │   ├── database.ts        # Database configuration
│   │   │   │   ├── auth.ts            # Auth configuration
│   │   │   │   ├── swagger.ts         # API documentation
│   │   │   │   └── index.ts           # Config exports
│   │   │   ├── plugins/               # Fastify plugins
│   │   │   │   ├── swagger.ts         # OpenAPI plugin
│   │   │   │   ├── cors.ts            # CORS configuration
│   │   │   │   ├── rate-limit.ts      # Rate limiting
│   │   │   │   └── websocket.ts       # WebSocket support
│   │   │   └── routes/                # Route definitions
│   │   │       ├── index.ts           # Route aggregator
│   │   │       ├── auth.routes.ts     # Auth routes
│   │   │       ├── users.routes.ts    # User routes
│   │   │       ├── listings.routes.ts # Listing routes
│   │   │       └── bookings.routes.ts # Booking routes
│   │   ├── prisma/                    # Database schema and migrations
│   │   │   ├── schema.prisma          # Main schema file
│   │   │   ├── migrations/            # Database migrations
│   │   │   │   ├── 001_initial.sql
│   │   │   │   ├── 002_add_audit.sql
│   │   │   │   └── 003_add_payments.sql
│   │   │   └── seed/                  # Seed data
│   │   │       ├── users.seed.ts
│   │   │       ├── organizations.seed.ts
│   │   │       └── listings.seed.ts
│   │   ├── tests/                     # Test files
│   │   │   ├── unit/                  # Unit tests
│   │   │   │   ├── auth.service.spec.ts
│   │   │   │   ├── users.service.spec.ts
│   │   │   │   └── bookings.service.spec.ts
│   │   │   ├── integration/           # Integration tests
│   │   │   │   ├── auth.e2e.spec.ts
│   │   │   │   ├── listings.e2e.spec.ts
│   │   │   │   └── bookings.e2e.spec.ts
│   │   │   └── fixtures/              # Test data
│   │   │       ├── users.json
│   │   │       ├── organizations.json
│   │   │       └── listings.json
│   │   ├── package.json               # Dependencies
│   │   ├── tsconfig.json              # TypeScript config
│   │   ├── vite.config.ts             # Vite config
│   │   └── Dockerfile                 # Docker configuration
│   │
│   ├── web/                           # Public web application
│   │   ├── src/
│   │   │   ├── main.tsx               # App entry point
│   │   │   ├── app.tsx                # App root component
│   │   │   ├── routes/                # Route definitions
│   │   │   │   ├── __root.tsx         # Root layout
│   │   │   │   ├── index.tsx          # Home page
│   │   │   │   ├── listings/          # Listing routes
│   │   │   │   │   ├── index.tsx      # Listing list
│   │   │   │   │   └── $id.tsx        # Listing details
│   │   │   │   ├── booking/           # Booking routes
│   │   │   │   │   ├── index.tsx      # Booking form
│   │   │   │   │   └── confirmation.tsx
│   │   │   │   ├── auth/              # Authentication
│   │   │   │   │   ├── login.tsx      # Login page
│   │   │   │   │   └── callback.tsx   # OAuth callback
│   │   │   │   └── about.tsx          # About page
│   │   │   ├── components/            # Reusable components
│   │   │   │   ├── ui/                # UI components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   └── modal.tsx
│   │   │   │   ├── layout/            # Layout components
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── footer.tsx
│   │   │   │   │   └── navigation.tsx
│   │   │   │   └── features/          # Feature components
│   │   │   │       ├── listing-card.tsx
│   │   │   │       ├── booking-form.tsx
│   │   │   │       ├── search-bar.tsx
│   │   │   │       └── calendar.tsx
│   │   │   ├── hooks/                 # Custom hooks
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-listings.ts
│   │   │   │   ├── use-bookings.ts
│   │   │   │   └── use-notifications.ts
│   │   │   ├── services/              # API services
│   │   │   │   ├── api.ts             # API client
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── listings.service.ts
│   │   │   │   └── bookings.service.ts
│   │   │   ├── stores/                # State management
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── listings.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   ├── utils/                 # Utilities
│   │   │   │   ├── date.ts
│   │   │   │   ├── format.ts
│   │   │   │   └── validation.ts
│   │   │   └── styles/                # Global styles
│   │   │       ├── globals.css
│   │   │       └── components.css
│   │   ├── public/                    # Static assets
│   │   │   ├── favicon.ico
│   │   │   ├── manifest.json
│   │   │   └── icons/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── Dockerfile
│   │
│   ├── backoffice/                    # Admin interface
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── app.tsx
│   │   │   ├── routes/
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── index.tsx          # Dashboard
│   │   │   │   ├── listings/          # Listing management
│   │   │   │   │   ├── index.tsx      # Listing list
│   │   │   │   │   ├── $id.tsx        # Listing details/edit
│   │   │   │   │   ├── create.tsx     # Create listing
│   │   │   │   │   └── bulk.tsx       # Bulk operations
│   │   │   │   ├── bookings/          # Booking management
│   │   │   │   │   ├── index.tsx      # Booking list
│   │   │   │   │   ├── $id.tsx        # Booking details
│   │   │   │   │   ├── calendar.tsx   # Calendar view
│   │   │   │   │   └── conflicts.tsx  # Conflict resolution
│   │   │   │   ├── users/             # User management
│   │   │   │   │   ├── index.tsx      # User list
│   │   │   │   │   ├── $id.tsx        # User details
│   │   │   │   │   ├── roles.tsx      # Role management
│   │   │   │   │   └── permissions.tsx
│   │   │   │   ├── analytics/         # Analytics & reports
│   │   │   │   │   ├── index.tsx      # Overview dashboard
│   │   │   │   │   ├── listings.tsx   # Listing analytics
│   │   │   │   │   ├── bookings.tsx   # Booking analytics
│   │   │   │   │   └── reports.tsx    # Report generation
│   │   │   │   └── settings/          # Organization settings
│   │   │   │       ├── index.tsx      # General settings
│   │   │   │       ├── branding.tsx   # Brand customization
│   │   │   │       ├── integrations.tsx
│   │   │   │       └── audit.tsx      # Audit logs
│   │   │   ├── components/
│   │   │   │   ├── dashboard/         # Dashboard components
│   │   │   │   │   ├── stats-card.tsx
│   │   │   │   │   ├── recent-activity.tsx
│   │   │   │   │   └── charts.tsx
│   │   │   │   ├── tables/            # Table components
│   │   │   │   │   ├── data-table.tsx
│   │   │   │   │   ├── user-table.tsx
│   │   │   │   │   └── booking-table.tsx
│   │   │   │   └── forms/             # Form components
│   │   │   │       ├── listing-form.tsx
│   │   │   │       ├── user-form.tsx
│   │   │   │       └── settings-form.tsx
│   │   │   └── ...                    # Other standard directories
│   │   └── package.json
│   │
│   └── minside/                       # User dashboard
│       ├── src/
│       │   ├── main.tsx
│       │   ├── app.tsx
│       │   ├── routes/
│       │   │   ├── __root.tsx
│       │   │   ├── index.tsx          # Personal dashboard
│       │   │   ├── bookings/          # Booking management
│       │   │   │   ├── index.tsx      # Active bookings
│       │   │   │   ├── history.tsx    # Booking history
│       │   │   │   ├── $id.tsx        # Booking details
│       │   │   │   └── cancel.tsx     # Cancellation flow
│       │   │   ├── profile/           # Profile management
│       │   │   │   ├── index.tsx      # Profile overview
│       │   │   │   ├── personal.tsx   # Personal information
│       │   │   │   ├── security.tsx   # Security settings
│       │   │   │   └── preferences.tsx
│       │   │   ├── notifications/     # Notifications
│       │   │   │   ├── index.tsx      # Notification list
│       │   │   │   └── settings.tsx   # Notification settings
│       │   │   └── settings/          # Account settings
│       │   │       ├── index.tsx      # General settings
│       │   │       ├── privacy.tsx    # Privacy settings
│       │   │       ├── connected.tsx  # Connected services
│       │   │       └── help.tsx       # Help & support
│       │   ├── components/
│       │   │   ├── booking-card.tsx
│       │   │   ├── profile-form.tsx
│       │   │   ├── notification-item.tsx
│       │   │   └── mobile-navigation.tsx
│       │   └── ...                    # Other standard directories
│       └── package.json
│
├── packages/                          # Shared packages
│   ├── client-sdk/                    # API client SDK
│   │   ├── src/
│   │   │   ├── index.ts               # Main export
│   │   │   ├── api/                   # API client
│   │   │   │   ├── client.ts          # API client instance
│   │   │   │   ├── endpoints.ts       # API endpoints
│   │   │   │   └── types.ts           # API types
│   │   │   ├── hooks/                 # React hooks
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-listings.ts
│   │   │   │   ├── use-bookings.ts
│   │   │   │   ├── use-users.ts
│   │   │   │   └── use-organizations.ts
│   │   │   ├── services/              # Service functions
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── listings.service.ts
│   │   │   │   ├── bookings.service.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── types/                 # TypeScript types
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── listing.types.ts
│   │   │   │   ├── booking.types.ts
│   │   │   │   └── user.types.ts
│   │   │   ├── utils/                 # Utilities
│   │   │   │   ├── query-keys.ts      # React Query keys
│   │   │   │   ├── transformers.ts    # Data transformers (if needed)
│   │   │   │   └── validators.ts      # Validation functions
│   │   │   └── constants/             # Constants
│   │   │       ├── endpoints.ts
│   │   │       └── errors.ts
│   │   ├── tests/                     # Test files
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── ds/                            # Design system facade
│   │   ├── src/
│   │   │   ├── index.ts               # Main export
│   │   │   ├── components/            # Re-exported components
│   │   │   │   ├── index.ts
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── form.tsx
│   │   │   ├── theme/                 # Theme system
│   │   │   │   ├── provider.tsx       # Theme provider
│   │   │   │   ├── context.tsx        # Theme context
│   │   │   │   └── types.ts           # Theme types
│   │   │   ├── tokens/                # Design tokens
│   │   │   │   ├── colors.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   ├── typography.ts
│   │   │   │   └── shadows.ts
│   │   │   ├── styles/                # CSS utilities
│   │   │   │   ├── globals.css
│   │   │   │   └── utilities.css
│   │   │   └── utils/                 # Utilities
│   │   │       ├── cn.ts              # Classname utility
│   │   │       └── cva.ts            # Class variance authority
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── ds-themes/                     # Theme management
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── themes/                # Theme definitions
│   │   │   │   ├── digdir.ts          # Digdir theme
│   │   │   │   ├── light.ts           # Light theme
│   │   │   │   ├── dark.ts            # Dark theme
│   │   │   │   └── custom.ts          # Custom theme base
│   │   │   ├── types.ts               # Theme types
│   │   │   ├── provider.tsx           # Theme provider
│   │   │   ├── storage.ts             # Theme persistence
│   │   │   └── css.ts                 # CSS generation
│   │   ├── dist/                      # Generated CSS
│   │   │   ├── digdir.css
│   │   │   ├── light.css
│   │   │   └── dark.css
│   │   └── package.json
│   │
│   ├── ds-registry/                   # Component documentation
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/            # Component docs
│   │   │   │   ├── button.stories.tsx
│   │   │   │   ├── input.stories.tsx
│   │   │   │   └── card.stories.tsx
│   │   │   ├── pages/                 # Documentation pages
│   │   │   │   ├── introduction.mdx
│   │   │   │   ├── getting-started.mdx
│   │   │   │   └── design-tokens.mdx
│   │   │   └── theme.ts               # Storybook theme
│   │   ├── .storybook/                # Storybook config
│   │   │   ├── main.ts
│   │   │   ├── preview.ts
│   │   │   └── theme.ts
│   │   └── package.json
│   │
│   ├── eslint-config/                 # ESLint configuration
│   │   ├── src/
│   │   │   ├── index.js               # Base config
│   │   │   ├── react.js               # React config
│   │   │   ├── typescript.js          # TypeScript config
│   │   │   ├── accessibility.js       # A11y rules
│   │   │   └── rules/                 # Custom rules
│   │   │       ├── no-transformers.js
│   │   │       ├── no-direct-digdir-imports.js
│   │   │       └── no-hardcoded-styles.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── i18n/                          # Internationalization
│       ├── src/
│       │   ├── index.ts
│       │   ├── i18n.ts                # i18n configuration
│       │   ├── provider.tsx           # I18n provider
│       │   ├── hooks/                 # React hooks
│       │   │   ├── use-t.ts
│       │   │   ├── use-locale.ts
│       │   │   └── use-date-formatter.ts
│       │   ├── types.ts               # Type definitions
│       │   ├── utils/                 # Utilities
│       │   │   ├── formatters.ts
│       │   │   └── validators.ts
│       │   └── locales/               # Translation files
│       │       ├── nb.ts              # Norwegian Bokmål
│       │       │   ├── common.ts
│       │       │   ├── auth.ts
│       │       │   ├── listings.ts
│       │       │   ├── bookings.ts
│       │       │   └── errors.ts
│       │       └── en.ts              # English
│       │           ├── common.ts
│       │           ├── auth.ts
│       │           ├── listings.ts
│       │           ├── bookings.ts
│       │           └── errors.ts
│       ├── scripts/                   # Build scripts
│       │   ├── build.ts
│       │   └── validate.ts
│       ├── package.json
│       └── README.md
│
├── docs/                              # Documentation
│   ├── README.md                      # Main documentation hub
│   ├── 01-introduction.md             # Platform overview
│   ├── 02-quick-start.md              # Getting started
│   ├── 03-development-workflow.md     # Development practices
│   ├── MIGRATION_SUMMARY.md           # Migration summary
│   ├── RESTRUCTURING_SUMMARY.md       # Restructuring summary
│   ├── architecture/                  # Architecture documentation
│   │   ├── README.md
│   │   ├── 01-overview.md
│   │   ├── 02-monorepo.md
│   │   ├── 03-applications.md
│   │   ├── 04-design-system.md
│   │   └── 05-security.md
│   ├── packages/                      # Package documentation
│   │   ├── README.md
│   │   ├── 01-client-sdk.md
│   │   ├── 02-design-system.md
│   │   ├── 03-design-themes.md
│   │   ├── 04-design-registry.md
│   │   ├── 05-eslint-config.md
│   │   └── 06-i18n.md
│   ├── apps/                          # Application documentation
│   │   ├── README.md
│   │   ├── 01-web.md
│   │   ├── 02-backoffice.md
│   │   ├── 03-minside.md
│   │   └── 04-api.md
│   ├── guides/                        # Guides
│   │   ├── 01-contract-first.md
│   │   └── 02-testing.md
│   ├── reference/                     # Reference
│   │   └── 01-glossary.md
│   ├── product/                       # Product docs
│   │   ├── PRD.md                     # Product Requirements Doc
│   │   └── PRP.md                     # Product Requirements Process
│   ├── business/                      # Business docs
│   │   └── BDD.md                     # Business Design Doc
│   ├── technical/                     # Technical docs
│   │   ├── SRSD.md                    # System Requirements Spec
│   │   └── ERD.md                     # Entity Relationship Diagram
│   ├── compliance/                    # Compliance
│   │   └── SSA-L.md                   # SSA-L compliance matrix
│   ├── operations/                    # Operations
│   │   ├── roadmap/
│   │   ├── linear/
│   │   └── compliance/
│   └── schemas/                       # Schemas
│       └── roadmap.schema.json
│
├── scripts/                           # Utility scripts
│   ├── build.sh                       # Build script
│   ├── deploy.sh                      # Deployment script
│   ├── test.sh                        # Test script
│   ├── lint.sh                        # Lint script
│   ├── scan-i18n.js                   # i18n scanner
│   ├── generate-types.ts              # Type generation
│   └── db-migrate.ts                  # Database migration
│
├── tests/                             # Test configuration
│   ├── setup.ts                       # Global test setup
│   ├── mocks/                         # Mock data
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── data.ts
│   ├── helpers/                       # Test helpers
│   │   ├── test-client.ts
│   │   ├── render.tsx
│   │   └── db.ts
│   ├── e2e/                           # E2E tests
│   │   ├── auth.spec.ts
│   │   ├── listings.spec.ts
│   │   ├── bookings.spec.ts
│   │   └── admin.spec.ts
│   ├── integration/                   # Integration tests
│   │   ├── api/
│   │   └── database/
│   └── performance/                   # Performance tests
│       ├── load.spec.ts
│       └── stress.spec.ts
│
├── .gitignore                         # Git ignore file
├── .eslintrc.json                     # ESLint config
├── .prettierrc                        # Prettier config
├── .env.example                       # Environment variables example
├── docker-compose.yml                 # Docker compose for development
├── docker-compose.prod.yml            # Docker compose for production
├── package.json                       # Root package.json
├── pnpm-workspace.yaml                # pnpm workspace config
├── turbo.json                         # Turborepo config
├── tsconfig.json                      # Root TypeScript config
├── LICENSE                            # License file
└── README.md                          # Root README
```

## Key File Purposes

### Configuration Files
- **package.json**: Dependencies and scripts for each package/app
- **pnpm-workspace.yaml**: Defines monorepo workspace structure
- **turbo.json**: Build system configuration and caching
- **tsconfig.json**: TypeScript compiler options
- **.eslintrc.json**: Code linting rules
- **docker-compose.yml**: Local development environment

### Core Application Files
- **apps/api/src/main.ts**: Backend server entry point
- **apps/web/src/main.tsx**: Frontend application entry point
- **apps/api/src/app.ts**: Fastify application setup
- **apps/web/src/app.tsx**: React application setup

### Database Files
- **apps/api/prisma/schema.prisma**: Database schema definition
- **apps/api/prisma/migrations/**: Database migration files
- **apps/api/prisma/seed/**: Database seed data

### Shared Package Files
- **packages/client-sdk/src/index.ts**: SDK main export
- **packages/ds/src/index.ts**: Design system main export
- **packages/i18n/src/index.ts**: i18n main export

### Documentation Files
- **docs/README.md**: Documentation navigation hub
- **docs/architecture/**: System architecture documentation
- **docs/packages/**: Package-specific documentation
- **docs/apps/**: Application-specific documentation

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Start specific app
pnpm --filter @digilist/web dev
```

### 2. Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @digilist/client-sdk build
```

### 3. Testing
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm test:coverage
```

### 4. Linting
```bash
# Lint all code
pnpm lint

# Lint specific package
pnpm --filter @digilist/web lint
```

## Code Organization Principles

### 1. Contract-First
- API contracts defined in `apps/api/src/modules/*/dto/`
- Frontend uses projection DTOs directly
- No transformation layers in frontend

### 2. Multi-Tenant
- All tables have `organization_id` for tenant isolation
- Row-level security enforced at database level
- Tenant context in all API requests

### 3. Design System Compliance
- All UI components from `@xala/ds`
- No direct `@digdir` imports
- Theme management through `@xala/ds-themes`

### 4. Type Safety
- TypeScript throughout the stack
- Shared types in `packages/client-sdk/src/types/`
- Generated types from Prisma schema

### 5. Audit Compliance
- All mutations logged in `audit_logs` table
- Audit triggers on all tables
- Complete context tracking

## Deployment Structure

### Development
- Local Docker Compose
- Hot reload enabled
- Debug configurations available

### Staging
- Kubernetes cluster
- Automated deployments
- Integration testing

### Production
- Multi-AZ deployment
- Blue-green deployments
- Automated rollbacks

## Security Considerations

### 1. Authentication
- ID-porten OAuth 2.0 integration
- JWT token management
- Session security

### 2. Authorization
- RBAC with role hierarchy
- Capability-based permissions
- Multi-tenant isolation

### 3. Data Protection
- Encryption at rest
- Encryption in transit
- GDPR compliance

### 4. Audit
- Comprehensive logging
- Immutable audit trail
- Compliance reporting

---

**Document Version**: 1.0.0  
**Last Updated**: January 15, 2026
