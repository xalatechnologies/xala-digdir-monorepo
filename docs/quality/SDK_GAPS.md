# SDK Gap Analysis

**Date:** 2026-01-19  
**Controllers:** 74  
**SDK Services:** 62  
**True Gaps:** ~12 (after name matching)

## Cross-Reference Analysis

Many "gaps" are false positives due to naming differences:

| Controller | SDK Service | Match |
|------------|-------------|-------|
| conversations | conversation | ✅ |
| notifications | notification | ✅ |
| organizations | organization | ✅ |
| reviews | review | ✅ |
| seasons | season | ✅ |
| season-applications | season-application | ✅ |
| discount-codes | discount-code | ✅ |
| push-notifications | push-notification | ✅ |

## True SDK Gaps (Need Services)

| Controller | Priority | Notes |
|------------|----------|-------|
| availability | P1 | Core booking - may use calendar.service |
| global-search | P1 | Uses search.service? |
| menu | P1 | Navigation API |
| public | P2 | Public endpoints |
| addons | P2 | Booking add-ons |
| allocations | P2 | Resource allocation |
| bulk | P3 | Bulk operations |
| health | P3 | Internal only |
| idporten-oidc | P3 | Auth callback |
| monitoring | P3 | Internal only |
| vipps-webhook | P3 | Payment webhook |
| websocket | P3 | Internal |

## Verified Coverage ✅
- conversation.service ✅
- notification.service ✅  
- organization.service ✅
- review.service ✅
- season.service ✅
- season-application.service ✅
- search.service ✅ (for global-search?)
- calendar.service ✅ (for availability?)

## Recommendations
1. Verify if `search.service` covers global-search controller
2. Verify if `calendar.service` covers availability controller
3. Create `menu.service` for navigation API (P1)
4. Other gaps are internal-only (P3)
