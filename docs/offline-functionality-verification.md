# Offline Functionality Verification Guide

## Overview

This document provides step-by-step instructions for manually verifying the offline functionality of the Minside (citizen portal) application.

**Test Date:** 2026-01-14
**Feature:** Mobile-First Responsive Enhancement - Offline Support
**Services:** minside
**Related Files:**
- `apps/minside/src/hooks/useOfflineBookings.ts` - Offline-first hook with IndexedDB caching
- `apps/minside/src/routes/bookings.tsx` - Bookings page with offline support
- `apps/minside/vite.config.ts` - Service worker configuration
- `apps/minside/public/manifest.json` - PWA manifest

---

## Prerequisites

1. **Development Server Running:**
   ```bash
   pnpm dev
   ```
   Minside should be running on `http://localhost:5174`

2. **Browser:** Chrome or Edge (for best DevTools support)

3. **User Account:** You need to be logged in to view bookings

---

## Test Procedure

### Test 1: Service Worker Registration

**Objective:** Verify service worker registers successfully

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to **Application** tab
3. Click on **Service Workers** in left sidebar
4. Navigate to `http://localhost:5174`
5. Wait 2-3 seconds for service worker to register

**Expected Result:**
- ✅ Service worker appears in the list
- ✅ Status shows "activated and is running"
- ✅ No errors in console

**Screenshot Location:** `docs/screenshots/offline-sw-registration.png`

---

### Test 2: IndexedDB Cache Population

**Objective:** Verify bookings data is cached in IndexedDB after loading

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to **Application** tab
3. Navigate to `http://localhost:5174/bookings`
4. Wait for bookings to load (loading spinner disappears)
5. In DevTools, expand **IndexedDB** in left sidebar
6. Expand **minside-offline** database
7. Click on **bookings** object store

**Expected Result:**
- ✅ IndexedDB database "minside-offline" exists
- ✅ Object store "bookings" contains cached entries
- ✅ Each entry has `cacheKey`, `data`, and `timestamp` fields
- ✅ `data` field contains bookings array

**Screenshot Location:** `docs/screenshots/offline-indexeddb-cache.png`

---

### Test 3: Offline Mode Activation

**Objective:** Verify offline indicator appears when network is disconnected

**Steps:**
1. Navigate to `http://localhost:5174/bookings` (while online)
2. Wait for bookings to load completely
3. Open Chrome DevTools (F12)
4. Go to **Network** tab
5. In throttling dropdown (usually shows "No throttling"), select **Offline**
6. Reload the page (Ctrl+R or Cmd+R)
7. Wait for page to load

**Expected Result:**
- ✅ Page loads successfully (doesn't show network error)
- ✅ Yellow/orange offline indicator banner appears at top of page
- ✅ Banner shows "📡 Frakoblet modus" (Norwegian) or "Offline Mode" (English)
- ✅ Banner message explains viewing cached bookings
- ✅ Bookings data is visible (from cache)

**Screenshot Location:** `docs/screenshots/offline-indicator.png`

---

### Test 4: Cached Data Display

**Objective:** Verify cached bookings data is visible when offline

**Steps:**
1. While still offline (from Test 3)
2. Observe the bookings list/cards
3. Check stats cards at top of page
4. Try using filter buttons (All, Pending, Confirmed, Cancelled)

**Expected Result:**
- ✅ Bookings are visible (same data as when online)
- ✅ Stats cards show correct counts
- ✅ Filter buttons work with cached data
- ✅ No loading spinner (data loads instantly from cache)
- ✅ Booking cards show:
  - Resource name
  - Date and time
  - Status badge
  - Price
  - Action buttons

**Screenshot Location:** `docs/screenshots/offline-cached-bookings.png`

---

### Test 5: Navigation While Offline

**Objective:** Verify app navigation works when offline

**Steps:**
1. While still offline
2. Click on **Dashboard** in bottom navigation (or sidebar on desktop)
3. Navigate back to **Bookings**
4. Try clicking on other navigation items

**Expected Result:**
- ✅ Navigation works (URL changes)
- ✅ Pages load from service worker cache
- ✅ No network errors in console
- ✅ Bottom navigation remains functional
- ✅ App feels responsive

---

### Test 6: Offline-to-Online Transition

**Objective:** Verify offline indicator disappears when connection is restored

**Steps:**
1. While on bookings page in offline mode
2. In Chrome DevTools Network tab, change throttling from **Offline** to **No throttling**
3. Wait 2-3 seconds for online event to fire
4. Reload the page (Ctrl+R or Cmd+R)
5. Wait for fresh data to load

**Expected Result:**
- ✅ Offline indicator banner disappears
- ✅ Fresh data loads from API
- ✅ Loading spinner appears briefly
- ✅ Stats cards update with latest counts
- ✅ No errors in console

**Screenshot Location:** `docs/screenshots/back-online.png`

---

### Test 7: Service Worker Caching Strategy

**Objective:** Verify service worker caches API responses

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to **Application** tab
3. Click on **Cache Storage** in left sidebar
4. Navigate to `http://localhost:5174/bookings` while online
5. Wait for bookings to load
6. Refresh the cache storage view
7. Look for caches with names like "bookings-cache" or "api-cache"

**Expected Result:**
- ✅ Cache storage shows cached entries
- ✅ Bookings API responses are cached
- ✅ Cache includes `/api/bookings/my` endpoint
- ✅ Cache headers show proper expiration (24 hours)

**Screenshot Location:** `docs/screenshots/offline-cache-storage.png`

---

### Test 8: Mobile Viewport Offline Experience

**Objective:** Verify offline functionality works on mobile viewport

**Steps:**
1. Open Chrome DevTools (F12)
2. Click **Toggle device toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. Select **iPhone SE** or **iPhone 12 Pro** from device dropdown
4. Navigate to `http://localhost:5174/bookings`
5. Wait for bookings to load
6. Go to **Network** tab and select **Offline**
7. Reload the page

**Expected Result:**
- ✅ Mobile layout renders correctly
- ✅ Offline indicator appears at top
- ✅ Booking cards stack vertically (not table on mobile)
- ✅ Bottom navigation remains visible and functional
- ✅ Touch targets are 44px+ (check with DevTools ruler)
- ✅ No horizontal scroll
- ✅ All content is readable

**Screenshot Location:** `docs/screenshots/offline-mobile-viewport.png`

---

### Test 9: Desktop Viewport Offline Experience

**Objective:** Verify offline functionality works on desktop viewport

**Steps:**
1. Disable device toolbar (if enabled)
2. Resize browser to desktop size (1280x720 or larger)
3. Navigate to `http://localhost:5174/bookings`
4. Wait for bookings to load
5. Go offline in DevTools Network tab
6. Reload the page

**Expected Result:**
- ✅ Desktop layout renders correctly
- ✅ Offline indicator appears at top
- ✅ Bookings table (not cards) displays on desktop
- ✅ Sidebar visible (not hidden)
- ✅ Bottom navigation hidden (only on mobile)
- ✅ All columns visible in table

**Screenshot Location:** `docs/screenshots/offline-desktop-viewport.png`

---

### Test 10: Filter State Preservation

**Objective:** Verify filter state works with cached data

**Steps:**
1. Navigate to `http://localhost:5174/bookings` while online
2. Wait for bookings to load
3. Click on **Confirmed** filter button
4. Wait for filtered results to load
5. Go offline in DevTools Network tab
6. Reload the page
7. Observe which bookings are displayed

**Expected Result:**
- ✅ Page loads successfully
- ✅ Filter buttons are visible
- ✅ Can click on different filters
- ✅ Cached data filters correctly by status
- ✅ Filter counts match cached data

---

## Automated Test Execution

To run automated E2E tests for offline functionality:

```bash
# Run all offline tests
pnpm test:e2e e2e/minside-offline.spec.ts --project=chromium

# Run specific test
pnpm test:e2e e2e/minside-offline.spec.ts --project=chromium --grep "shows offline indicator"

# Run with UI mode for debugging
pnpm test:e2e e2e/minside-offline.spec.ts --project=chromium --ui
```

**Expected Result:**
- ✅ All tests pass (11/11 or better)
- ✅ No console errors
- ✅ Tests complete in < 60 seconds

---

## Known Limitations

1. **IndexedDB in Incognito Mode:**
   - IndexedDB may be disabled in incognito/private browsing mode
   - Use normal browser window for testing

2. **Service Worker in Development:**
   - Service worker updates on every reload in dev mode
   - In production, service worker uses `autoUpdate` strategy

3. **Cache Expiration:**
   - Bookings cache expires after 24 hours
   - Older cached data is automatically purged

4. **Authentication:**
   - Must be logged in to view bookings
   - Offline mode doesn't bypass authentication

---

## Troubleshooting

### Issue: Service Worker Not Registering

**Solution:**
1. Check browser console for errors
2. Ensure you're not in incognito mode
3. Clear browser cache and reload
4. Verify `apps/minside/vite.config.ts` has VitePWA plugin configured

### Issue: IndexedDB Cache Empty

**Solution:**
1. Ensure you loaded bookings at least once while online
2. Check Network tab to confirm API call succeeded
3. Verify `useOfflineBookings` hook is used in bookings.tsx
4. Check browser console for IndexedDB errors

### Issue: Offline Indicator Not Showing

**Solution:**
1. Verify you're actually offline (check Network tab status)
2. Ensure cached data exists (check IndexedDB)
3. Reload page to trigger offline detection
4. Check `isOffline && isCached` condition in bookings.tsx

### Issue: No Bookings Displayed When Offline

**Solution:**
1. Load bookings while online first (to populate cache)
2. Check IndexedDB for cached data
3. Verify service worker is active
4. Check console for errors

---

## Success Criteria

All tests must pass with the following criteria:

- ✅ Service worker registers and activates successfully
- ✅ IndexedDB caches bookings data after online load
- ✅ Offline indicator appears when network is disconnected
- ✅ Cached bookings are visible when offline
- ✅ Navigation works while offline
- ✅ Offline indicator disappears when back online
- ✅ Service worker caches API responses
- ✅ Mobile viewport offline experience is functional
- ✅ Desktop viewport offline experience is functional
- ✅ Filter state works with cached data
- ✅ No console errors during offline/online transitions
- ✅ Touch targets meet 44px minimum (WCAG AA)
- ✅ No horizontal scroll on mobile

---

## Test Report Template

```markdown
## Offline Functionality Test Report

**Date:** YYYY-MM-DD
**Tester:** [Your Name]
**Browser:** Chrome [Version]
**Environment:** Development

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| Service Worker Registration | ✅ PASS / ❌ FAIL | |
| IndexedDB Cache Population | ✅ PASS / ❌ FAIL | |
| Offline Mode Activation | ✅ PASS / ❌ FAIL | |
| Cached Data Display | ✅ PASS / ❌ FAIL | |
| Navigation While Offline | ✅ PASS / ❌ FAIL | |
| Offline-to-Online Transition | ✅ PASS / ❌ FAIL | |
| Service Worker Caching | ✅ PASS / ❌ FAIL | |
| Mobile Viewport | ✅ PASS / ❌ FAIL | |
| Desktop Viewport | ✅ PASS / ❌ FAIL | |
| Filter State Preservation | ✅ PASS / ❌ FAIL | |

### Issues Found
- None / [List any issues]

### Screenshots
- Attached in `docs/screenshots/`

### Recommendations
- [Any recommendations for improvement]

### Sign-off
- ✅ All tests passed
- ✅ Ready for production deployment
```

---

## Related Documentation

- [Core Web Vitals Validation](./core-web-vitals-validation.md)
- [Mobile Navigation Testing](../e2e/minside-mobile.spec.ts)
- [Implementation Plan](../.auto-claude/specs/007-mobile-first-responsive-enhancement/implementation_plan.json)

---

**Last Updated:** 2026-01-14
**Maintained By:** Auto-Claude
**Status:** ✅ Ready for QA
