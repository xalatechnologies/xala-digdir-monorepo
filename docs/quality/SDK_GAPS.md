# SDK Gap Analysis

**Date:** 2026-01-19  
**Controllers:** 74  
**SDK Services:** 60  
**Gaps:** 34 controllers without matching SDK services

## Controllers Without SDK Services

| Controller | Priority | Notes |
|------------|----------|-------|
| addons | P1 | Booking add-ons |
| allocations | P2 | Resource allocation |
| availability | P1 | Core booking feature |
| backoffice | P2 | Admin-only |
| booking-contracts | P2 | Contract generation |
| bulk | P2 | Bulk operations |
| calendar-contracts | P2 | Calendar sync |
| capabilities | P2 | Feature capabilities |
| case-handler-scope | P3 | Admin scope |
| configuration | P2 | System config |
| conversations | P1 | Messaging |
| discount-codes | P2 | Promotions |
| entitlements | P2 | Access control |
| global-search | P1 | Search feature |
| health | P3 | Internal only |
| idporten-oidc | P3 | Auth callback |
| menu | P1 | Navigation |
| messages | P1 | Messaging |
| monitoring | P3 | Internal only |
| notification-preferences | P2 | User prefs |
| notifications | P1 | Core feature |
| org-context | P2 | Context switch |
| organizations | P1 | Core feature |
| policy | P2 | Policy engine |
| public | P1 | Public endpoints |
| push-notifications | P2 | Mobile push |
| reviews | P1 | User reviews |
| season-applications | P1 | Season bookings |
| seasons | P1 | Season management |
| share | P2 | Sharing feature |
| translations | P2 | i18n |
| vipps-webhook | P3 | Payment webhook |
| websocket | P3 | Internal |
| widgets | P2 | Dashboard widgets |

## P1 Gaps (Critical)
- availability, conversations, global-search, menu, messages, notifications, organizations, public, reviews, season-applications, seasons

## Action Items
1. Verify if these gaps are intentional (internal-only endpoints)
2. Create SDK services for P1 gaps
3. Update REPO_MAP.md with findings
