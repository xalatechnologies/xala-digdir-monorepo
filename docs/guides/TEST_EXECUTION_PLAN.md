# 🧪 Digilist Platform - Test Execution Plan

**Based on:** Test Master Spec v1.0  
**Environment:** Test (https://api.digilist.no)  
**Date:** 2026-01-18  
**Status:** Ready for Execution

---

## 📊 Testing Phases Overview

### **Phase 1: Foundation Validation** (CURRENT)
**Duration:** 1-2 days  
**Goal:** Verify basic platform functionality and navigation

- [ ] Navigation testing (56 routes across 3 frontends)
- [ ] Authentication flows (Demo token + BankID)
- [ ] Basic CRUD operations
- [ ] Console error audit
- [ ] Asset loading verification

### **Phase 2: Core Functionality**
**Duration:** 3-5 days  
**Goal:** Validate business logic and user journeys

- [ ] Booking flows (single, in-game, recurring)
- [ ] Calendar availability
- [ ] Search and filtering
- [ ] Role-based access control
- [ ] Multi-tenant isolation

### **Phase 3: Advanced Features**
**Duration:** 3-5 days  
**Goal:** Test custody, delegation, and entitlements

- [ ] Custody assignment and delegation
- [ ] Entitlements matrix (10 scenarios)
- [ ] Feature flags and overrides
- [ ] Organization context switching
- [ ] Subdelegation flows

### **Phase 4: Quality Assurance**
**Duration:** 2-3 days  
**Goal:** Non-functional requirements

- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Localization (nb/en completeness)
- [ ] Performance benchmarks
- [ ] Security testing (IDOR, privilege escalation)
- [ ] Mobile responsiveness

### **Phase 5: Integration & E2E**
**Duration:** 3-4 days  
**Goal:** End-to-end user journeys

- [ ] Playwright test suite execution
- [ ] Cross-app workflows
- [ ] Webhook testing
- [ ] Audit trail verification
- [ ] Error handling scenarios

### **Phase 6: Production Readiness**
**Duration:** 2-3 days  
**Goal:** Final validation and documentation

- [ ] Load testing
- [ ] Monitoring setup verification
- [ ] Documentation completeness
- [ ] Deployment checklist
- [ ] Rollback procedures

---

## 🎯 Phase 1: Foundation Validation (DETAILED)

### 1.1 Navigation Testing

**Backoffice** (35 routes)
```
Overview:
✓ / - Dashboard

Work:
✓ /bookings - Bookings list
✓ /calendar - Calendar view

Communication:
✓ /messages - Messages

Economy:
✓ /economy/invoices - Invoices

Reports:
✓ /reports - Reports

Help:
✓ /help - Help center

Organization:
✓ /blocks - Blocks management

Administration:
✓ /rental-objects - Rental objects
✓ /seasons - Seasons

Users & Organizations:
✓ /organizations - Organizations
✓ /users - Users

Case Handler:
✓ /work-queue - Work queue
✓ /season-applications - Season applications
✓ /allocation-planner - Allocation planner
✓ /decision-forms - Decision forms
✓ /audit-timeline - Audit timeline

Admin:
✓ /pricing-rules - Pricing rules

Tenant:
✓ /tenant/features - Features
✓ /tenant/settings - Platform settings
✓ /tenant/branding - Branding
✓ /tenant/audit-log - System log

System:
✓ /gdpr-requests - GDPR requests
✓ /reviews/moderation - Reviews moderation
✓ /settings - Settings
```

**MinSide** (16 routes)
```
Personal Context:
✓ / - Dashboard
✓ /bookings - My bookings
✓ /calendar - My calendar
✓ /seasons - Seasons
✓ /messages - Messages
✓ /billing - Billing
✓ /notifications - Notifications
✓ /settings - Settings
✓ /preferences - Preferences
✓ /help - Help

Organization Context:
✓ /org - Org dashboard
✓ /org/bookings - Org bookings
✓ /org/invoices - Org invoices
✓ /org/members - Org members
✓ /org/season-rental - Season rental
✓ /org/notifications - Org notifications
✓ /org/settings - Org settings
✓ /org/activity - Org activity
```

**Web** (5 routes)
```
✓ / - Home
✓ /listings - Browse listings
✓ /listing/[id] - Listing details
✓ /about - About
✓ /contact - Contact
```

### 1.2 Authentication Testing

**Demo Token Login**
- [ ] Backoffice: Login with `demo-admin-token`
- [ ] MinSide: Login with `demo-user-token`
- [ ] Web: Login with `demo-user-token`
- [ ] Verify session persistence
- [ ] Verify logout functionality

**BankID Login** (NEW)
- [ ] Backoffice: BankID option visible
- [ ] MinSide: BankID option visible
- [ ] Web: BankID option visible
- [ ] Test with BankID credentials:
  - Admin: 30916326773 / otp / qwer1234
  - User: 15860771346 / otp / qwer1234
  - Saksbehandler: 06881271913 / otp / qwer1234

**Role Verification**
- [ ] Admin sees admin-only routes
- [ ] Saksbehandler sees case handler routes
- [ ] Regular user sees limited routes
- [ ] Org admin sees org management routes

### 1.3 Console Error Audit

**Critical Checks**
- [ ] No JavaScript errors on page load
- [ ] No 404 errors for assets
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] No network failures

**Performance Checks**
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Images load progressively
- [ ] No memory leaks (check DevTools)

### 1.4 Data Verification

**Seed Data**
- [ ] 70 rental objects visible
- [ ] 130+ images loading correctly
- [ ] 9 demo users accessible
- [ ] Organizations seeded
- [ ] Bookings calendar has data

**Storage**
- [ ] Images serve from `/storage/seed-images/`
- [ ] Image URLs resolve correctly
- [ ] No broken image placeholders
- [ ] Thumbnails generate properly

---

## 🔧 Test Infrastructure Setup

### Required Tools
```bash
# Install testing dependencies
pnpm install

# Playwright
pnpm --filter @digilist/testing-e2e install

# Vitest
pnpm --filter @digilist/testing install
```

### Environment Configuration
```bash
# Test environment
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
DATABASE_URL=postgresql://digilist_test:***@localhost:5432/digilist_test
```

### Test Execution Commands
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Accessibility tests
pnpm test:a11y

# All tests
pnpm test:all
```

---

## 📝 Test Result Template

```markdown
## Test Session Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Phase:** [1-6]
**Duration:** [Hours]

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Blocked: X
- Skipped: X

### Critical Issues
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual
   - Screenshots/Logs

### Observations
- [Notable findings]

### Recommendations
- [Next steps]
```

---

## 🚦 Success Criteria

### Phase 1 Complete When:
- [ ] All 56 navigation routes load without errors
- [ ] All authentication methods work
- [ ] Console is clean (no errors)
- [ ] All seed data is visible
- [ ] Images load correctly
- [ ] Basic CRUD operations verified

### Overall Success Criteria (All Phases):
- [ ] 100% schema coverage
- [ ] All critical user journeys pass
- [ ] WCAG 2.1 AA compliance
- [ ] Zero security vulnerabilities
- [ ] Performance benchmarks met
- [ ] All evidence artifacts generated

---

## 📊 Progress Tracking

**Phase 1:** ☐ 0% Complete  
**Phase 2:** ☐ 0% Complete  
**Phase 3:** ☐ 0% Complete  
**Phase 4:** ☐ 0% Complete  
**Phase 5:** ☐ 0% Complete  
**Phase 6:** ☐ 0% Complete  

**Overall:** ☐ 0% Complete

---

## 🎯 Next Actions

1. **Start Phase 1 Testing**
   - Open `NAVIGATION_TEST_CHECKLIST.md`
   - Begin systematic navigation testing
   - Document all findings

2. **Set Up Test Infrastructure**
   - Verify Playwright installation
   - Configure test environment
   - Prepare test data

3. **Begin Documentation**
   - Create test session logs
   - Track issues in GitHub
   - Update progress regularly

---

**Let's begin! 🚀**
