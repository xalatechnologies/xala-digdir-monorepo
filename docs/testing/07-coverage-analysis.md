# Test Coverage Analysis

## Summary

| Metric | Count |
|--------|-------|
| **Source Files** | 1,134 |
| **Test Files** | 443 |
| **File Coverage** | ~39% |

## By Layer

| Layer | Source Files | Test Files | Coverage |
|-------|-------------|------------|----------|
| **API** | 308 | 85+ (unit, integration, contracts) | ~28% |
| **SDK** | 200 | 15+ (exports, hooks) | ~8% |
| **DS** | 222 | 50+ (Storybook + unit) | ~23% |
| **Web** | 68 | 9 (E2E) | ~13% |
| **MinSide** | 61 | 5 (E2E) | ~8% |
| **Backoffice** | 196 | 47 (E2E) | ~24% |
| **SaaS Admin** | 36 | 4 (E2E) | ~11% |
| **i18n** | 13 | 10+ | ~77% |
| **DB Schema** | 22 | 5+ | ~23% |

## Test Types

| Type | Files | Tests |
|------|-------|-------|
| Unit (Vitest) | 335 | 161+ |
| E2E (Playwright) | 108 | ~500+ |
| **Total** | **443** | **~661+** |

## Playwright E2E Breakdown

| Suite | Spec Files |
|-------|-----------|
| backoffice | 47 |
| web | 9 |
| auth | 6 |
| api | 6 |
| minside | 5 |
| saas-admin | 4 |
| golden-journey | 4 |
| docs | 3 |
| booking | 2 |
| accessibility | 1 |
| domain | 1 |
| rental-objects | 1 |

## Recommendations

| Priority | Area | Gap |
|----------|------|-----|
| P0 | SDK hooks | Need 50+ more tests |
| P0 | DS components | Need Storybook interaction tests |
| P1 | Web app | Need more E2E flows |
| P1 | MinSide | Need more E2E coverage |
| P2 | API services | Need per-service unit tests |
