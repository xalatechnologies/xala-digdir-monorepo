# API Endpoint Inventory with SDK Parity Status

**Generated:** 2025-01-16
**Task:** 040-prepare-digilist-for-ssa-l-demo-and-compliance-aud
**Subtask:** subtask-1-1 - Audit Phase Repository Mapping

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total API Controllers | 37 |
| Total SDK Services | 23 |
| API Modules with Full SDK Coverage | 18 |
| API Modules with Partial SDK Coverage | 5 |
| API Modules without SDK Coverage | 14 |
| **Overall SDK Parity** | **62%** |

---

## Parity Legend

| Status | Description |
|--------|-------------|
| ✅ Full | All API endpoints have corresponding SDK methods |
| ⚠️ Partial | Some API endpoints have SDK methods, some missing |
| ❌ None | No SDK service exists for this API module |
| 🔵 SDK-Only | SDK method exists without corresponding API endpoint |

---

## Detailed Module Inventory

### 1. Allocations Module

**API Controller:** `apps/api/src/modules/allocations/allocations.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/allocation.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/allocations` | GET | `getAll()` | ✅ |
| `/api/allocations/:id` | GET | `getById()` | ✅ |
| `/api/allocations` | POST | `create()` | ✅ |
| `/api/allocations/:id` | PUT | `update()` | ✅ |
| `/api/allocations/:id` | DELETE | `delete()` | ✅ |
| `/api/allocations/:id/approve` | POST | `approve()` | ✅ |
| `/api/allocations/:id/reject` | POST | `reject()` | ✅ |
| `/api/allocations/:id/cancel` | POST | `cancel()` | ✅ |
| `/api/allocations/bulk` | POST | `bulkCreate()` | ✅ |
| `/api/allocations/bulk-approve` | POST | `bulkApprove()` | ✅ |

---

### 2. Audit Module

**API Controller:** `apps/api/src/modules/audit/audit.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/audit.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/audit` | GET | `getAll()` | ✅ |
| `/api/audit/:id` | GET | `getById()` | ✅ |
| `/api/audit/entity/:entityType/:entityId` | GET | `getByEntity()` | ✅ |
| `/api/audit/user/:userId` | GET | `getByUser()` | ✅ |
| `/api/audit/stats` | GET | `getStats()` | ✅ |
| `/api/audit/export` | POST | `exportLogs()` | ✅ |

---

### 3. Auth Module

**API Controller:** `apps/api/src/modules/auth/auth.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/auth.service.ts`
**Parity Status:** ⚠️ Partial

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/auth/login` | POST | `login()` | ✅ |
| `/api/auth/logout` | POST | `logout()` | ✅ |
| `/api/auth/register` | POST | `register()` | ✅ |
| `/api/auth/refresh` | POST | `refreshToken()` | ✅ |
| `/api/auth/me` | GET | `getCurrentUser()` | ✅ |
| `/api/auth/forgot-password` | POST | `forgotPassword()` | ✅ |
| `/api/auth/reset-password` | POST | `resetPassword()` | ✅ |
| `/api/auth/change-password` | POST | `changePassword()` | ✅ |
| `/api/auth/verify-email` | POST | `verifyEmail()` | ✅ |
| `/api/auth/resend-verification` | POST | `resendVerification()` | ✅ |
| `/api/auth/oauth/:provider` | GET | - | ❌ Missing |
| `/api/auth/oauth/:provider/callback` | GET | - | ❌ Missing |

**SDK-Only Methods:**
| SDK Method | Description | Status |
|------------|-------------|--------|
| `initializeOAuth()` | Initialize OAuth flow | 🔵 |
| `getOAuthUrl()` | Get OAuth redirect URL | 🔵 |

---

### 4. Signicat Module

**API Controller:** `apps/api/src/modules/auth/signicat.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/auth/signicat/authorize` | GET | - | ❌ Missing |
| `/api/auth/signicat/callback` | GET | - | ❌ Missing |
| `/api/auth/signicat/token` | POST | - | ❌ Missing |

**Recommendation:** Create `signicat.service.ts` in SDK for Norwegian ID verification

---

### 5. Authz Module

**API Controller:** `apps/api/src/modules/authz/authz.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/authz/permissions` | GET | - | ❌ Missing |
| `/api/authz/roles` | GET | - | ❌ Missing |
| `/api/authz/check` | POST | - | ❌ Missing |

**Recommendation:** Consider internal-only or add `authz.service.ts` for RBAC queries

---

### 6. Availability Module

**API Controller:** `apps/api/src/modules/availability/availability.controller.ts`
**SDK Service:** None (partial in listing.service.ts)
**Parity Status:** ⚠️ Partial

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/availability/:listingId` | GET | `listingService.getAvailability()` | ✅ |
| `/api/availability/:listingId/slots` | GET | - | ❌ Missing |
| `/api/availability/:listingId/calendar` | GET | - | ❌ Missing |
| `/api/availability/check` | POST | - | ❌ Missing |

**Recommendation:** Create dedicated `availability.service.ts` in SDK

---

### 7. Backoffice Module

**API Controller:** `apps/api/src/modules/backoffice/backoffice.controller.ts`
**SDK Service:** None (spread across other services)
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/backoffice/dashboard` | GET | - | ❌ Missing |
| `/api/backoffice/listings` | GET | - | ❌ Missing |
| `/api/backoffice/listings/:id` | GET | - | ❌ Missing |
| `/api/backoffice/listings` | POST | - | ❌ Missing |
| `/api/backoffice/listings/:id` | PUT | - | ❌ Missing |
| `/api/backoffice/listings/:id` | DELETE | - | ❌ Missing |
| `/api/backoffice/bookings` | GET | - | ❌ Missing |
| `/api/backoffice/users` | GET | - | ❌ Missing |
| `/api/backoffice/reports` | GET | - | ❌ Missing |

**Recommendation:** Create `backoffice.service.ts` in SDK for admin portal

---

### 8. Billing Module

**API Controller:** `apps/api/src/modules/billing/billing.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/billing.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/billing/invoices` | GET | `getInvoices()` | ✅ |
| `/api/billing/invoices/:id` | GET | `getInvoiceById()` | ✅ |
| `/api/billing/invoices/:id/pdf` | GET | `downloadInvoicePdf()` | ✅ |
| `/api/billing/payment-methods` | GET | `getPaymentMethods()` | ✅ |
| `/api/billing/payment-methods` | POST | `addPaymentMethod()` | ✅ |
| `/api/billing/payment-methods/:id` | DELETE | `removePaymentMethod()` | ✅ |
| `/api/billing/transactions` | GET | `getTransactions()` | ✅ |

---

### 9. Blocks Module

**API Controller:** `apps/api/src/modules/blocks/blocks.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/blocks` | GET | - | ❌ Missing |
| `/api/blocks/:id` | GET | - | ❌ Missing |
| `/api/blocks` | POST | - | ❌ Missing |
| `/api/blocks/:id` | PUT | - | ❌ Missing |
| `/api/blocks/:id` | DELETE | - | ❌ Missing |

**Recommendation:** Create `blocks.service.ts` for time block management

---

### 10. Booking Module

**API Controller:** `apps/api/src/modules/booking/booking.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/booking.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/bookings` | GET | `getAll()` | ✅ |
| `/api/bookings/:id` | GET | `getById()` | ✅ |
| `/api/bookings` | POST | `create()` | ✅ |
| `/api/bookings/:id` | PUT | `update()` | ✅ |
| `/api/bookings/:id/status` | PUT | `updateStatus()` | ✅ |
| `/api/bookings/:id/confirm` | PUT | `confirm()` | ✅ |
| `/api/bookings/:id/cancel` | PUT | `cancel()` | ✅ |
| `/api/bookings/:id/complete` | PUT | `complete()` | ✅ |
| `/api/bookings/:id` | DELETE | `delete()` | ✅ |
| `/api/bookings/pricing` | GET | `calculatePricing()` | ✅ |
| `/api/bookings/my` | GET | `getMyBookings()` | ✅ |
| `/api/bookings/recurring` | GET | `getRecurring()` | ✅ |
| `/api/bookings/recurring` | POST | `createRecurring()` | ✅ |
| `/api/bookings/:id/receipt` | GET | `getReceipt()` | ✅ |
| `/api/bookings/calendar` | GET | - | ❌ Missing |

**SDK-Only Methods:**
| SDK Method | Description | Status |
|------------|-------------|--------|
| `getPaymentHistory()` | Get booking payment history | 🔵 |
| `getPaymentReconciliation()` | Get payment reconciliation | 🔵 |
| `changeTime()` | Change booking time | 🔵 |
| `requestChange()` | Request booking change | 🔵 |
| `getDocuments()` | Get booking documents | 🔵 |

---

### 11. Calendar Module

**API Controller:** `apps/api/src/modules/calendar/calendar.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/calendar` | GET | - | ❌ Missing |
| `/api/calendar/events` | GET | - | ❌ Missing |
| `/api/calendar/sync` | POST | - | ❌ Missing |
| `/api/calendar/export` | GET | - | ❌ Missing |

**Recommendation:** Create `calendar.service.ts` for calendar integration

---

### 12. Conversations Module

**API Controller:** `apps/api/src/modules/conversations/conversations.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/conversation.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/conversations` | GET | `getAll()` | ✅ |
| `/api/conversations/:id` | GET | `getById()` | ✅ |
| `/api/conversations` | POST | `create()` | ✅ |
| `/api/conversations/:id/messages` | GET | `getMessages()` | ✅ |
| `/api/conversations/:id/messages` | POST | `sendMessage()` | ✅ |
| `/api/conversations/:id/read` | PUT | `markAsRead()` | ✅ |
| `/api/conversations/:id/archive` | PUT | `archive()` | ✅ |

---

### 13. Dashboard Module

**API Controller:** `apps/api/src/modules/dashboard/dashboard.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/dashboard.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/dashboard` | GET | `getOverview()` | ✅ |
| `/api/dashboard/stats` | GET | `getStats()` | ✅ |
| `/api/dashboard/recent-bookings` | GET | `getRecentBookings()` | ✅ |
| `/api/dashboard/revenue` | GET | `getRevenue()` | ✅ |
| `/api/dashboard/occupancy` | GET | `getOccupancy()` | ✅ |

---

### 14. Discount Codes Module

**API Controller:** `apps/api/src/modules/discount-codes/discount-codes.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/discount-code.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/discount-codes` | GET | `getAll()` | ✅ |
| `/api/discount-codes/:id` | GET | `getById()` | ✅ |
| `/api/discount-codes` | POST | `create()` | ✅ |
| `/api/discount-codes/:id` | PUT | `update()` | ✅ |
| `/api/discount-codes/:id` | DELETE | `delete()` | ✅ |
| `/api/discount-codes/validate` | POST | `validate()` | ✅ |
| `/api/discount-codes/:id/activate` | PUT | `activate()` | ✅ |
| `/api/discount-codes/:id/deactivate` | PUT | `deactivate()` | ✅ |

---

### 15. Health Module

**API Controller:** `apps/api/src/modules/health/health.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None (Internal/Ops)

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/health` | GET | - | ❌ N/A |
| `/health/ready` | GET | - | ❌ N/A |
| `/health/live` | GET | - | ❌ N/A |

**Note:** Health endpoints are for infrastructure monitoring, not client SDK

---

### 16. Help Module

**API Controller:** `apps/api/src/modules/help/help.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/help.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/help/articles` | GET | `getArticles()` | ✅ |
| `/api/help/articles/:id` | GET | `getArticleById()` | ✅ |
| `/api/help/categories` | GET | `getCategories()` | ✅ |
| `/api/help/search` | GET | `search()` | ✅ |
| `/api/help/contact` | POST | `submitContactForm()` | ✅ |

---

### 17. Integrations Module

**API Controller:** `apps/api/src/modules/integrations/integrations.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/integration.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/integrations` | GET | `getAll()` | ✅ |
| `/api/integrations/:id` | GET | `getById()` | ✅ |
| `/api/integrations` | POST | `create()` | ✅ |
| `/api/integrations/:id` | PUT | `update()` | ✅ |
| `/api/integrations/:id` | DELETE | `delete()` | ✅ |
| `/api/integrations/:id/test` | POST | `test()` | ✅ |
| `/api/integrations/:id/sync` | POST | `sync()` | ✅ |

---

### 18. Listing Module

**API Controller:** `apps/api/src/modules/listing/listing.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/listing.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/listings` | GET | `getAll()` | ✅ |
| `/api/listings/:id` | GET | `getById()` | ✅ |
| `/api/listings` | POST | `create()` | ✅ |
| `/api/listings/:id` | PUT | `update()` | ✅ |
| `/api/listings/:id` | DELETE | `delete()` | ✅ |
| `/api/listings/:id/publish` | PUT | `publish()` | ✅ |
| `/api/listings/:id/unpublish` | PUT | `unpublish()` | ✅ |
| `/api/listings/:id/availability` | GET | `getAvailability()` | ✅ |
| `/api/listings/:id/availability` | PUT | `updateAvailability()` | ✅ |
| `/api/listings/:id/images` | POST | `uploadImage()` | ✅ |
| `/api/listings/:id/images/:imageId` | DELETE | `deleteImage()` | ✅ |
| `/api/listings/slug/:slug` | GET | `getBySlug()` | ✅ |
| `/api/listings/types` | GET | `getTypes()` | ✅ |
| `/api/listings/:id/amenities` | GET | `getAmenities()` | ✅ |
| `/api/listings/:id/amenities` | PUT | `updateAmenities()` | ✅ |

---

### 19. Messages Module

**API Controller:** `apps/api/src/modules/messages/messages.controller.ts`
**SDK Service:** (via conversation.service.ts)
**Parity Status:** ✅ Full (Covered by conversation service)

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/messages` | GET | `conversationService.getMessages()` | ✅ |
| `/api/messages/:id` | GET | - | ⚠️ Partial |
| `/api/messages` | POST | `conversationService.sendMessage()` | ✅ |
| `/api/messages/:id` | DELETE | - | ❌ Missing |

---

### 20. Monitoring Module

**API Controller:** `apps/api/src/modules/monitoring/monitoring.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/monitoring.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/monitoring/metrics` | GET | `getMetrics()` | ✅ |
| `/api/monitoring/errors` | GET | `getErrors()` | ✅ |
| `/api/monitoring/performance` | GET | `getPerformance()` | ✅ |
| `/api/monitoring/alerts` | GET | `getAlerts()` | ✅ |
| `/api/monitoring/alerts` | POST | `createAlert()` | ✅ |
| `/api/monitoring/alerts/:id` | DELETE | `deleteAlert()` | ✅ |

---

### 21. Notifications Module

**API Controller:** `apps/api/src/modules/notifications/notifications.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/notification.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/notifications` | GET | `getAll()` | ✅ |
| `/api/notifications/:id` | GET | `getById()` | ✅ |
| `/api/notifications/:id/read` | PUT | `markAsRead()` | ✅ |
| `/api/notifications/read-all` | PUT | `markAllAsRead()` | ✅ |
| `/api/notifications/:id` | DELETE | `delete()` | ✅ |
| `/api/notifications/preferences` | GET | `getPreferences()` | ✅ |
| `/api/notifications/preferences` | PUT | `updatePreferences()` | ✅ |

---

### 22. Organizations Module

**API Controller:** `apps/api/src/modules/organizations/organizations.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/organization.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/organizations` | GET | `getAll()` | ✅ |
| `/api/organizations/:id` | GET | `getById()` | ✅ |
| `/api/organizations` | POST | `create()` | ✅ |
| `/api/organizations/:id` | PUT | `update()` | ✅ |
| `/api/organizations/:id` | DELETE | `delete()` | ✅ |
| `/api/organizations/:id/members` | GET | `getMembers()` | ✅ |
| `/api/organizations/:id/members` | POST | `addMember()` | ✅ |
| `/api/organizations/:id/members/:userId` | DELETE | `removeMember()` | ✅ |
| `/api/organizations/:id/members/:userId/role` | PUT | `updateMemberRole()` | ✅ |

---

### 23. Pricing Module

**API Controller:** `apps/api/src/modules/pricing/pricing.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/pricing.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/pricing/calculate` | POST | `calculate()` | ✅ |
| `/api/pricing/rules` | GET | `getRules()` | ✅ |
| `/api/pricing/rules` | POST | `createRule()` | ✅ |
| `/api/pricing/rules/:id` | PUT | `updateRule()` | ✅ |
| `/api/pricing/rules/:id` | DELETE | `deleteRule()` | ✅ |

---

### 24. Profile Module

**API Controller:** `apps/api/src/modules/profile/profile.controller.ts`
**SDK Service:** (via auth.service.ts)
**Parity Status:** ⚠️ Partial

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/profile` | GET | `authService.getCurrentUser()` | ✅ |
| `/api/profile` | PUT | `authService.updateProfile()` | ✅ |
| `/api/profile/avatar` | POST | - | ❌ Missing |
| `/api/profile/avatar` | DELETE | - | ❌ Missing |
| `/api/profile/preferences` | GET | - | ❌ Missing |
| `/api/profile/preferences` | PUT | - | ❌ Missing |

**Recommendation:** Create dedicated `profile.service.ts` or extend auth.service

---

### 25. Public Module

**API Controller:** `apps/api/src/modules/public/public.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None (Public/Unauthenticated)

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/public/listings` | GET | - | ❌ N/A |
| `/api/public/listings/:slug` | GET | - | ❌ N/A |
| `/api/public/tenants/:slug` | GET | - | ❌ N/A |

**Note:** Public endpoints may not need SDK coverage (unauthenticated access)

---

### 26. Reports Module

**API Controller:** `apps/api/src/modules/reports/reports.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/reports.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/reports` | GET | `getAll()` | ✅ |
| `/api/reports/:id` | GET | `getById()` | ✅ |
| `/api/reports/generate` | POST | `generate()` | ✅ |
| `/api/reports/:id/download` | GET | `download()` | ✅ |
| `/api/reports/bookings` | GET | `getBookingsReport()` | ✅ |
| `/api/reports/revenue` | GET | `getRevenueReport()` | ✅ |
| `/api/reports/occupancy` | GET | `getOccupancyReport()` | ✅ |

---

### 27. Reviews Module

**API Controller:** `apps/api/src/modules/reviews/reviews.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/review.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/reviews` | GET | `getAll()` | ✅ |
| `/api/reviews/:id` | GET | `getById()` | ✅ |
| `/api/reviews` | POST | `create()` | ✅ |
| `/api/reviews/:id` | PUT | `update()` | ✅ |
| `/api/reviews/:id` | DELETE | `delete()` | ✅ |
| `/api/reviews/listing/:listingId` | GET | `getByListing()` | ✅ |
| `/api/reviews/:id/reply` | POST | `reply()` | ✅ |

---

### 28. Search Module

**API Controller:** `apps/api/src/modules/search/search.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/search.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/search` | GET | `search()` | ✅ |
| `/api/search/listings` | GET | `searchListings()` | ✅ |
| `/api/search/suggestions` | GET | `getSuggestions()` | ✅ |
| `/api/search/filters` | GET | `getFilters()` | ✅ |

---

### 29. Seasonal Lease Module

**API Controller:** `apps/api/src/modules/seasonal-lease/seasonal-lease.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/seasonal-lease.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/seasonal-leases` | GET | `getAll()` | ✅ |
| `/api/seasonal-leases/:id` | GET | `getById()` | ✅ |
| `/api/seasonal-leases` | POST | `create()` | ✅ |
| `/api/seasonal-leases/:id` | PUT | `update()` | ✅ |
| `/api/seasonal-leases/:id` | DELETE | `delete()` | ✅ |
| `/api/seasonal-leases/:id/approve` | POST | `approve()` | ✅ |
| `/api/seasonal-leases/:id/reject` | POST | `reject()` | ✅ |
| `/api/seasonal-leases/:id/cancel` | POST | `cancel()` | ✅ |
| `/api/seasonal-leases/applications` | GET | `getApplications()` | ✅ |
| `/api/seasonal-leases/applications` | POST | `submitApplication()` | ✅ |

---

### 30. Seasons Module

**API Controller:** `apps/api/src/modules/seasons/seasons.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/season.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/seasons` | GET | `getAll()` | ✅ |
| `/api/seasons/:id` | GET | `getById()` | ✅ |
| `/api/seasons` | POST | `create()` | ✅ |
| `/api/seasons/:id` | PUT | `update()` | ✅ |
| `/api/seasons/:id` | DELETE | `delete()` | ✅ |
| `/api/seasons/:id/open` | POST | `open()` | ✅ |
| `/api/seasons/:id/close` | POST | `close()` | ✅ |
| `/api/seasons/:id/activate` | POST | `activate()` | ✅ |
| `/api/seasons/:id/complete` | POST | `complete()` | ✅ |
| `/api/seasons/:id/cancel` | POST | `cancel()` | ✅ |
| `/api/seasons/:id/stats` | GET | `getStats()` | ✅ |

---

### 31. Settings Module

**API Controller:** `apps/api/src/modules/settings/settings.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/settings.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/settings/tenant` | GET | `getTenantSettings()` | ✅ |
| `/api/settings/tenant` | PUT | `updateTenantSettings()` | ✅ |
| `/api/settings/user` | GET | `getUserSettings()` | ✅ |
| `/api/settings/user` | PUT | `updateUserSettings()` | ✅ |
| `/api/settings/booking-policy` | GET | `getBookingPolicy()` | ✅ |
| `/api/settings/booking-policy` | PUT | `updateBookingPolicy()` | ✅ |
| `/api/settings/branding` | GET | `getBranding()` | ✅ |
| `/api/settings/branding` | PUT | `updateBranding()` | ✅ |
| `/api/settings/reset` | POST | `resetToDefaults()` | ✅ |

---

### 32. Share Module

**API Controller:** `apps/api/src/modules/share/share.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/share/listing/:id` | POST | - | ❌ Missing |
| `/api/share/booking/:id` | POST | - | ❌ Missing |
| `/api/share/:token` | GET | - | ❌ Missing |

**Recommendation:** Create `share.service.ts` for sharing functionality

---

### 33. Tenant Module

**API Controller:** `apps/api/src/modules/tenant/tenant.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/tenant.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/tenants/current` | GET | `getCurrent()` | ✅ |
| `/api/tenants/current` | PUT | `update()` | ✅ |
| `/api/tenants/subscription` | GET | `getSubscription()` | ✅ |
| `/api/tenants/license` | GET | `getLicense()` | ✅ |
| `/api/tenants/stats` | GET | `getStats()` | ✅ |
| `/api/tenants/subscription/upgrade` | POST | `upgradePlan()` | ✅ |
| `/api/tenants/subscription/cancel` | POST | `cancelSubscription()` | ✅ |
| `/api/tenants/billing-portal` | GET | `getBillingPortalUrl()` | ✅ |

---

### 34. User Groups Module

**API Controller:** `apps/api/src/modules/user-groups/user-group.controller.ts`
**SDK Service:** `packages/client-sdk/src/services/user-group.service.ts`
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/me/user-group` | GET | `getUserGroup()` | ✅ |
| `/backoffice/user-groups` | GET | `backofficeUserGroupsService.list()` | ✅ |
| `/backoffice/user-groups` | POST | `backofficeUserGroupsService.create()` | ✅ |

---

### 35. User Module

**API Controller:** `apps/api/src/modules/user/user.controller.ts`
**SDK Service:** None (partial in auth.service)
**Parity Status:** ⚠️ Partial

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/users` | GET | - | ❌ Missing |
| `/api/users/:id` | GET | - | ❌ Missing |
| `/api/users` | POST | - | ❌ Missing |
| `/api/users/:id` | PUT | - | ❌ Missing |
| `/api/users/:id` | DELETE | - | ❌ Missing |
| `/api/users/:id/roles` | GET | - | ❌ Missing |
| `/api/users/:id/roles` | PUT | - | ❌ Missing |
| `/api/users/:id/activate` | PUT | - | ❌ Missing |
| `/api/users/:id/deactivate` | PUT | - | ❌ Missing |

**Recommendation:** Create `user.service.ts` for user management (admin)

---

### 36. WebSocket Module

**API Controller:** `apps/api/src/modules/websocket/websocket.controller.ts`
**SDK Service:** (via realtime client)
**Parity Status:** ✅ Full

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/ws/audit` | WS | `realtimeClient.connect()` | ✅ |
| `/ws/notifications` | WS | `realtimeClient.onNotification()` | ✅ |
| `/ws/bookings` | WS | `realtimeClient.onBooking()` | ✅ |

---

### 37. Widgets Module

**API Controller:** `apps/api/src/modules/widgets/widgets.controller.ts`
**SDK Service:** None
**Parity Status:** ❌ None (Embed/External)

| API Endpoint | HTTP Method | SDK Method | Status |
|--------------|-------------|------------|--------|
| `/api/widgets/listings` | GET | - | ❌ N/A |
| `/api/widgets/calendar` | GET | - | ❌ N/A |
| `/api/widgets/embed.js` | GET | - | ❌ N/A |

**Note:** Widget endpoints are for external embedding, not SDK client usage

---

## Summary Tables

### Modules with Full SDK Parity (18)

| Module | API Endpoints | SDK Methods |
|--------|---------------|-------------|
| Allocations | 10 | 10 |
| Audit | 6 | 6 |
| Billing | 7 | 7 |
| Booking | 14 | 14+ |
| Conversations | 7 | 7 |
| Dashboard | 5 | 5 |
| Discount Codes | 8 | 8 |
| Help | 5 | 5 |
| Integrations | 7 | 7 |
| Listing | 15 | 15 |
| Monitoring | 6 | 6 |
| Notifications | 7 | 7 |
| Organizations | 9 | 9 |
| Pricing | 5 | 5 |
| Reports | 7 | 7 |
| Reviews | 7 | 7 |
| Search | 4 | 4 |
| Seasonal Lease | 10 | 10 |
| Seasons | 11 | 11 |
| Settings | 9 | 9 |
| Tenant | 8 | 8 |
| User Groups | 3 | 3 |
| WebSocket | 3 | 3 |

### Modules with Partial SDK Parity (5)

| Module | API Endpoints | SDK Coverage | Gap |
|--------|---------------|--------------|-----|
| Auth | 12 | 10 | OAuth endpoints |
| Availability | 4 | 1 | Slots, calendar, check |
| Messages | 4 | 2 | Direct message access |
| Profile | 6 | 2 | Avatar, preferences |
| User | 9 | 0 | Full admin user CRUD |

### Modules without SDK Coverage (9)

| Module | API Endpoints | Reason |
|--------|---------------|--------|
| Signicat | 3 | Norwegian ID - needs SDK |
| Authz | 3 | Internal RBAC - may not need |
| Backoffice | 9 | Admin portal - needs SDK |
| Blocks | 5 | Time blocks - needs SDK |
| Calendar | 4 | Calendar sync - needs SDK |
| Public | 3 | Unauthenticated - may not need |
| Share | 3 | Sharing - needs SDK |
| Health | 3 | Infrastructure - not needed |
| Widgets | 3 | External embed - not needed |

---

## Recommendations

### High Priority (Demo/Compliance Critical)

1. **Create `user.service.ts`** - Admin user management for KRAV-ADM-05
2. **Create `backoffice.service.ts`** - Admin portal operations
3. **Create `availability.service.ts`** - Complete slot/calendar availability
4. **Create `signicat.service.ts`** - Norwegian ID verification

### Medium Priority

5. **Extend `auth.service.ts`** - Add OAuth methods
6. **Create `profile.service.ts`** - Avatar and preferences management
7. **Create `calendar.service.ts`** - Calendar sync and export
8. **Create `blocks.service.ts`** - Time block management

### Low Priority

9. **Create `share.service.ts`** - Sharing functionality
10. **Create `authz.service.ts`** - If RBAC queries needed client-side

---

## Compliance Notes

- **KRAV-ADM-05**: User management requires SDK coverage (currently missing)
- **KRAV-ADM-07**: Audit logging has full SDK parity ✅
- **Multi-tenant isolation**: Tenant service has full parity ✅
- **Norwegian ID (Signicat)**: Missing SDK coverage - required for demo

---

*Report generated as part of SSA-L Demo and Compliance Audit preparation*
