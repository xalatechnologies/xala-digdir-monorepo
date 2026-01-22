Phase 1: Immediate Testing (Current Navigation Check)
Verify all 56 navigation routes work without errors
Check console for JavaScript errors
Validate RBAC enforcement on routes

Phase 2: Comprehensive Testing (As per Test Master Spec)
The Test Master Spec defines 13 major testing categories:

Unit Tests - Policy engine, RBAC, entitlements, custody
Integration Tests - API + DB, multi-tenant isolation, AuthZ
Contract Tests - SDK-API drift prevention
E2E Tests - Playwright journeys across all apps
Accessibility - WCAG 2.1 AA compliance
Localization - Norwegian/English completeness
Security - IDOR, privilege escalation, injection
Performance - Load testing, availability queries
Runtime Assurance - Monitoring, error tracking
Schema Coverage - 100% of DB schema tested
Roles & Context Matrix - All role/context combinations
Entitlements Matrix - Plan/override/kill-switch testing
Custody & Delegation - 10 required scenarios

test edge cases:
- invalid inputs
- missing permissions
- concurrent operations
- error scenarios
- boundary conditions
- stress testing
- chaos testing
- security testing
- performance testing
- accessibility testing
- localization testing
- contract testing
- e2e testing
- unit testing
- integration testing
- runtime assurance testing
- schema coverage testing
- roles & context matrix testing
- entitlements matrix testing
- custody & delegation testing