# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Architecture Quality Gates (2026-01-19 - Phase 0 Complete)**: Automated enforcement of DS-First / Thin Apps
  - `.github/workflows/architecture-quality.yml` - CI checks for architecture violations
  - Enhanced `.husky/pre-commit` - Pre-commit architecture checks
  - `scripts/quality/verify-sdk-coverage.js` - SDK coverage verification tool
  - `docs/QUALITY/REPO_MAP.md` - Complete repository inventory (7,093 lines audit docs)
  - `docs/QUALITY/MODULES_AND_DEPENDENCIES.md` - 72 modules, 11 layers, zero circular dependencies
  - `docs/QUALITY/CONTRACT_COVERAGE.md` - 92% alignment across all layers
  - `docs/QUALITY/GAP_MATRIX.md` - 81 gaps identified with remediation guidance
  - `docs/QUALITY/REMEDIATION_PLAN.md` - Phased 10-12 week action plan
  - `docs/QUALITY/TEST_GAPS.md` - 415+ test files analyzed
  - `docs/QUALITY/FINAL_REPORT.md` - Platform health score: 80/100
  - `docs/QUALITY/PHASE_0_SUMMARY.md` - CI/CD gates implementation summary
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

### Removed
- **RBAC Logic from Apps (2026-01-19 - Security Fix)**: Removed duplicate RBAC logic
  - Deleted `apps/backoffice/src/hooks/useRBAC.ts` (83 lines)
  - Deleted `apps/minside/src/hooks/useRBAC.ts` (81 lines)
  - Rationale: RBAC must be server-authoritative only (security requirement)
  - Apps now use `useCapabilities()` which calls server capabilities API

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
