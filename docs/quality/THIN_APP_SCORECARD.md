# Thin App Compliance Scorecard

**Date:** 2026-01-20  
**Version:** 1.0

---

## Scoring Methodology

| Status | Criteria |
|:------:|:---------|
| ✅ PASS | Routes + wrappers only, SDK-only data access, DS-only UI |
| ⚠️ WARN | App-local components that should be DS blocks/components |
| ❌ FAIL | Direct API calls, custom CSS, or business logic in pages |

---

## App-by-App Scorecard

| App | CSS Violations | Component Dirs | HTML in Routes | fetch() Calls | Role Checks | Emojis | Status | Risk |
|:----|:--------------:|:--------------:|:--------------:|:-------------:|:-----------:|:------:|:------:|:----:|
| **backoffice** | 0 | 9 | 983+ | 3 files | 15+ | 8 | ❌ FAIL | HIGH |
| **docs-learning** | 1 | 7 | 7700+ | 0 | 0 | 15 | ❌ FAIL | MEDIUM |
| **minside** | 0 | 3 | 450+ | 0 | 1 | 8 | ❌ FAIL | MEDIUM |
| **monitoring** | 0 | 3 | 200+ | 0 | 2 | 6 | ❌ FAIL | LOW |
| **saas-admin** | 0 | 1 | 300+ | 7 files | 0 | 3 | ❌ FAIL | HIGH |
| **web** | 0 | 2 | 200+ | 2 files | 0 | 10 | ❌ FAIL | MEDIUM |

---

## Detailed Violation Counts

### Category A: Forbidden UI in Apps

| App | Component Dirs | Duplicate Components | Action Required |
|:----|:--------------:|:--------------------:|:----------------|
| backoffice | 9 | Header, Sidebar, Layout | Consolidate to DS shells |
| docs-learning | 7 | Layout, TOC, Navigation | Create DS docs blocks |
| minside | 3 | Layout, Notifications | Migrate to DS blocks |
| monitoring | 3 | Same as minside (duplicate) | DELETE duplicates |
| saas-admin | 1 | Layout | Migrate to DS shells |
| web | 2 | Sidebar components | Migrate to DS blocks |

### Category B: Styling Violations

| App | CSS Files | Inline Styles | className Usage |
|:----|:---------:|:-------------:|:---------------:|
| backoffice | 0 | 983+ | 0 |
| docs-learning | 1 | 7700+ | 2 |
| minside | 0 | 450+ | 6 |
| monitoring | 0 | 200+ | 9 |
| saas-admin | 0 | 300+ | 0 |
| web | 0 | 200+ | 37 |

### Category C: Business Logic Violations

| App | Role Checks | Permission Checks | UI Business Logic |
|:----|:-----------:|:-----------------:|:-----------------:|
| backoffice | 15+ | 0 | 5+ hooks |
| docs-learning | 0 | 0 | 0 |
| minside | 0 | 1 | 0 |
| monitoring | 2 | 1 | 0 |
| saas-admin | 0 | 0 | 3 services |
| web | 0 | 0 | 0 |

### Category D: Data Access Violations

| App | fetch() Calls | axios | graphql | SDK Coverage |
|:----|:-------------:|:-----:|:-------:|:------------:|
| backoffice | 3 files | 0 | 0 | 85% |
| docs-learning | 0 | 0 | 0 | N/A (static) |
| minside | 0 | 0 | 0 | 95% |
| monitoring | 0 | 0 | 0 | 90% |
| saas-admin | 7 files | 0 | 0 | 60% |
| web | 2 files | 0 | 0 | 90% |

---

## Required Actions by App

### backoffice (HIGH PRIORITY)
- [ ] Migrate 3 files with direct fetch to SDK hooks
- [ ] Consolidate 9 component directories to DS
- [ ] Remove role checks from UI (15+ instances)
- [ ] Replace emojis with DS icons (8 instances)

### saas-admin (HIGH PRIORITY)
- [ ] Migrate 7 files with direct fetch to SDK hooks
- [ ] Create SDK service layer for admin operations
- [ ] Remove inline styles (300+ instances)
- [ ] Replace emojis with DS icons (3 instances)

### docs-learning (MEDIUM PRIORITY)
- [ ] Remove extensions.css, merge to root.css
- [ ] Replace inline styles (7700+ instances) - consider DS blocks
- [ ] Migrate 7 component directories to DS
- [ ] Replace emojis with DS icons (15 instances)

### minside (MEDIUM PRIORITY)
- [ ] Migrate 3 component directories to DS
- [ ] Remove inline styles (450+ instances)
- [ ] Replace emojis with DS icons (8 instances)

### web (MEDIUM PRIORITY)
- [ ] Migrate 2 feature component directories to DS
- [ ] Create SDK hooks for ActivityCalendar, MapWidget
- [ ] Replace emojis with DS icons (10 instances)

### monitoring (LOW PRIORITY)
- [ ] DELETE duplicate components from minside
- [ ] Migrate layout components to DS shells
- [ ] Replace emojis with DS icons (6 instances)

---

## Trend Metrics

| Metric | Current | Target | Delta |
|:-------|:-------:|:------:|:-----:|
| Component directories in apps | 29 | 0 | -29 |
| CSS files in apps (beyond root.css) | 1 | 0 | -1 |
| Inline style usages | 9800+ | 0 | -9800+ |
| Direct fetch() calls | 12 files | 0 | -12 |
| Emoji usages | 50+ | 0 | -50+ |
| Role checks in UI | 20+ | 0 | -20+ |

---

*Updated: 2026-01-20*
