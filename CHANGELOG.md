# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **DS-First + Thin Apps Baseline (2026-01-19)**: Architecture enforcement foundation
  - `docs/ARCH/ds-single-source-of-truth.md` - DS as single source for UI patterns
  - `docs/ARCH/thin-app-policy.md` - Apps contain only routes/wrappers
  - `docs/ARCH/block-contract-standards.md` - Block props interface standards
  - `docs/ARCH/ds-adoption-report.md` - Violations audit and migration plan
- **MinSide Pattern Consolidation (2026-01-19)**: Baseline for consistent citizen dashboard
  - New `ListToolbar` component in `@xala/ds` for search/filter/sort toolbars
  - `docs/DESIGN/minside-ui-patterns.md` - Canonical UI patterns for MinSide
  - Migrated `bookings.tsx` to use DS components (`PageHeader`, `StatCard`, `EmptyState`)
- **Quality Audit (2026-01-19)**: Comprehensive gap analysis and test strategy
  - `docs/QUALITY/GAP_MATRIX.md` - Requirements mapped to implementation status
  - `docs/QUALITY/TEST_STRATEGY.md` - Unit/Integration/E2E test plan
  - New DS components: `FilterChip`, `ResultsSkeleton`, `ResultsEmptyState`, `UserMenu`
- POST endpoints for booking state transitions: `/confirm`, `/cancel`, `/complete` (canonical replacements for PUT)
- PUT `/reject` endpoint with deprecation headers (successor to `/deny`)
- Comprehensive booking status unit tests (`booking-status.test.ts`)
- Booking API contract tests (`booking-api-contracts.test.ts`)
- Integration tests for full approval workflow (`booking-approval-flow.test.ts`)

### Changed
- **BREAKING**: All booking endpoints now return `{ data: T }` format instead of `{ booking: T }`
  - Affected: `GET /api/bookings/:id`, `POST /api/bookings`, `POST /api/bookings/:id/confirm`, etc.
  - Migration: Update client code to access `response.data` instead of `response.booking`
- Booking status enum now uses 8 canonical values: `pending`, `pending_approval`, `approved`, `confirmed`, `rejected`, `cancelled`, `completed`, `expired`
- Canonical rejection endpoint is now `/reject` (not `/deny`)

### Deprecated
- PUT endpoints for booking state transitions now return RFC 8594 deprecation headers:
  - `PUT /api/bookings/:id/confirm` - Use `POST /api/bookings/:id/confirm`
  - `PUT /api/bookings/:id/cancel` - Use `POST /api/bookings/:id/cancel`
  - `PUT /api/bookings/:id/complete` - Use `POST /api/bookings/:id/complete`
  - `PUT /api/bookings/:id/approve` - Use `POST /api/bookings/:id/approve`
  - `PUT /api/bookings/:id/reject` - Use `POST /api/bookings/:id/reject`
- Sunset date: April 19, 2026
- `POST /api/bookings/:id/deny` - Use `/reject` instead

### Fixed
- Response format inconsistency across booking endpoints (GAP-010)
- Status enum mismatch between API, SDK, and database layers (GAP-001)

### Documentation
- Created `docs/booking/` directory with comprehensive booking system documentation
- Added 8 booking-specific rules (B1-B8) to `AGENTS.md`
- Gap analysis and fix plan: `docs/booking/gaps-and-fix-plan.md`

---

## [1.0.0] - 2026-01-15

### Added
- Initial release of Digilist platform
- Multi-tenant booking management system
- Web, Backoffice, and MinSide applications
- Client SDK with React Query hooks
- Norwegian Designsystemet integration

[Unreleased]: https://github.com/xalatechnologies/xala-digdir-monorepo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/xalatechnologies/xala-digdir-monorepo/releases/tag/v1.0.0
