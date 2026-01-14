# Core Web Vitals Validation Report

## Subtask: subtask-6-3 - Validate Core Web Vitals on 3G

**Date:** 2026-01-14
**Feature:** Mobile-First Responsive Enhancement
**Service:** web (apps/web)
**Test Method:** Lighthouse in Chrome DevTools with Fast 3G throttling

---

## Overview

This document provides instructions for validating Core Web Vitals on 3G connections using Lighthouse. The target is to ensure that the Xala Booking web application meets Google's Core Web Vitals thresholds for a good user experience on mobile devices with slow network connections.

---

## Target Metrics (Good Thresholds)

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time until the largest content element is visible |
| **FID** (First Input Delay) | < 100ms | Time from first user interaction to browser response |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability - measures unexpected layout shifts |

---

## Testing Setup

### Prerequisites

1. **Chrome Browser** (latest version recommended)
2. **Web app running locally**:
   ```bash
   pnpm --filter @xala/web dev
   # Server starts on http://localhost:5173/
   ```

### Lighthouse Configuration

1. **Open Chrome DevTools**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)

2. **Navigate to Lighthouse tab**
   - Click on "Lighthouse" in the DevTools tabs
   - If not visible, click the `>>` overflow menu and select "Lighthouse"

3. **Configure Lighthouse Settings**
   - **Mode:** Navigation (default)
   - **Device:** Mobile
   - **Categories:** Performance (required), Accessibility (optional)
   - **Throttling:**
     - Click "⚙️ Settings" (gear icon)
     - Under "Throttling", select **"Simulated throttling"**
     - Ensure throttling is set to **"Fast 3G"**
     - CPU slowdown: **4x slowdown** (simulates slower mobile devices)

4. **Generate Report**
   - Click "Analyze page load"
   - Wait for the report to complete (typically 30-60 seconds)

---

## Pages to Test

Test the following pages on mobile viewports:

### 1. Homepage / Listings Page
**URL:** `http://localhost:5173/`

**What to Check:**
- Grid layout loads efficiently
- Images lazy load properly
- Service worker caches static assets
- Skeleton screens prevent layout shift

**Expected Performance:**
- LCP: Listing cards appear < 2.5s
- CLS: Grid layout stable during load
- FID: Interactive elements respond quickly

### 2. Listing Detail Page
**URL:** `http://localhost:5173/listing/1`

**What to Check:**
- Image slider loads efficiently (first image eager, rest lazy)
- Booking widget renders without blocking
- Mobile sticky CTA doesn't cause layout shift
- Form fields are interactive quickly

**Expected Performance:**
- LCP: Hero image loads < 2.5s
- CLS: Sticky booking button doesn't shift layout
- FID: Booking form interactions < 100ms

---

## Optimizations Already Implemented

This feature includes several performance optimizations:

### ✅ Code Splitting (subtask-5-3)
- Main bundle reduced from 331KB to 37KB (89% reduction)
- Route-based lazy loading with React.lazy()
- Vendor chunks separated (react, ds, sdk, mapbox)
- Gzipped main bundle: 11.59KB

### ✅ Lazy Loading (subtask-5-1, 5-2)
- Route components load on-demand
- Images use `loading="lazy"` and `decoding="async"`
- ImageSlider smart loading (first image eager, rest lazy)

### ✅ Service Worker (subtask-4-1, 4-2)
- Static asset caching (js, css, images, fonts)
- CacheFirst for fonts (1 year expiration)
- NetworkFirst for API calls (10s timeout, 1 hour cache)
- Runtime caching with Workbox

### ✅ Skeleton Screens (subtask-5-4)
- Prevents layout shift during initial load
- Mobile-responsive skeletons
- Smooth pulse animation
- Design token-based styling

### ✅ Mobile-First Design
- Touch-friendly buttons (44px+ WCAG AA)
- Responsive grids and layouts
- Bottom navigation for thumb-friendly access
- Optimized mobile forms with appropriate input types

---

## How to Interpret Lighthouse Results

### Core Web Vitals Section

Look for the "Metrics" section in the Lighthouse report:

1. **LCP (Largest Contentful Paint)**
   - 🟢 Green (< 2.5s): Good
   - 🟡 Orange (2.5s - 4s): Needs Improvement
   - 🔴 Red (> 4s): Poor

2. **TBT (Total Blocking Time)** - *Proxy for FID in lab tests*
   - 🟢 Green (< 200ms): Good
   - 🟡 Orange (200ms - 600ms): Needs Improvement
   - 🔴 Red (> 600ms): Poor
   - **Note:** Lighthouse uses TBT as a proxy for FID since FID requires real user interaction

3. **CLS (Cumulative Layout Shift)**
   - 🟢 Green (< 0.1): Good
   - 🟡 Orange (0.1 - 0.25): Needs Improvement
   - 🔴 Red (> 0.25): Poor

### Performance Score

Lighthouse provides an overall performance score (0-100):
- **90-100:** Green - Excellent performance
- **50-89:** Orange - Moderate performance
- **0-49:** Red - Poor performance

**Target:** Achieve a performance score of **80+** on Fast 3G for mobile.

---

## Common Issues and Solutions

### If LCP > 2.5s:

**Potential Causes:**
- Large images not optimized
- Blocking JavaScript in critical path
- Slow server response time
- Font loading delays

**Solutions:**
1. Ensure images use `loading="lazy"` and proper dimensions
2. Verify code splitting is working (check Network tab for multiple small bundles)
3. Check service worker is caching assets (Application > Service Workers tab)
4. Consider preloading critical assets in index.html

### If TBT/FID > 100ms:

**Potential Causes:**
- Heavy JavaScript execution on main thread
- Large bundle sizes blocking interaction
- Synchronous API calls during mount

**Solutions:**
1. Verify lazy loading is working for route components
2. Check bundle sizes in dist/assets/ (should be < 200KB per chunk)
3. Use React.Suspense for async components
4. Minimize work in useEffect during initial render

### If CLS > 0.1:

**Potential Causes:**
- Images without width/height attributes
- Fonts causing text shift
- Ads or embeds without reserved space
- Sticky elements appearing after load

**Solutions:**
1. Ensure skeleton screens match final layout dimensions
2. Use `font-display: swap` or preload fonts
3. Reserve space for mobile sticky CTA (we use bottom padding)
4. Verify no unexpected DOM insertions after initial render

---

## Verification Steps

### Step 1: Run Lighthouse on Listings Page

```bash
# Ensure web app is running
pnpm --filter @xala/web dev
```

1. Navigate to `http://localhost:5173/`
2. Open Chrome DevTools (F12)
3. Go to Lighthouse tab
4. Configure: Mobile, Performance, Fast 3G throttling
5. Click "Analyze page load"
6. Wait for report

**Record Results:**
- LCP: ______ ms (Target: < 2500ms) ✅/❌
- TBT: ______ ms (Target: < 200ms) ✅/❌
- CLS: ______ (Target: < 0.1) ✅/❌
- Performance Score: ______ (Target: 80+) ✅/❌

### Step 2: Run Lighthouse on Detail Page

1. Navigate to `http://localhost:5173/listing/1`
2. Open Chrome DevTools (F12)
3. Go to Lighthouse tab
4. Configure: Mobile, Performance, Fast 3G throttling
5. Click "Analyze page load"
6. Wait for report

**Record Results:**
- LCP: ______ ms (Target: < 2500ms) ✅/❌
- TBT: ______ ms (Target: < 200ms) ✅/❌
- CLS: ______ (Target: < 0.1) ✅/❌
- Performance Score: ______ (Target: 80+) ✅/❌

### Step 3: Verify Service Worker Caching

1. Open DevTools > Application tab
2. Navigate to "Service Workers" section
3. Verify service worker is registered and activated
4. Navigate to "Cache Storage" section
5. Verify caches exist:
   - `workbox-precache-v2-...` (static assets)
   - `google-fonts-cache` (fonts)
   - `api-cache` (API responses)

### Step 4: Verify Network Performance

1. Open DevTools > Network tab
2. Enable "Fast 3G" throttling
3. Disable cache (checkbox at top)
4. Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+F5)
5. Verify:
   - ✅ Main bundle loads quickly (< 200KB)
   - ✅ Images lazy load as you scroll
   - ✅ Route chunks load on-demand
   - ✅ Service worker intercepts requests

---

## Success Criteria

This subtask is considered **PASSED** when:

- ✅ LCP < 2.5s on both tested pages
- ✅ TBT < 200ms (proxy for FID < 100ms)
- ✅ CLS < 0.1 on both tested pages
- ✅ Performance score ≥ 80 on Fast 3G mobile
- ✅ Service worker registered and caching assets
- ✅ No console errors during page load
- ✅ All images lazy load properly
- ✅ Code splitting visible in Network tab

---

## Documentation and Reporting

### Screenshot Checklist

Capture screenshots of:
1. Lighthouse report showing Core Web Vitals metrics
2. Performance score summary
3. Network waterfall showing lazy loading
4. Service worker status in Application tab

### Report Template

```markdown
## Core Web Vitals Test Results - [Date]

### Environment
- Browser: Chrome [version]
- Device: Mobile (simulated)
- Network: Fast 3G (4x CPU slowdown)
- App Version: [git commit hash]

### Listings Page (/)
- LCP: XXX ms ✅/❌
- TBT: XXX ms ✅/❌
- CLS: X.XX ✅/❌
- Performance Score: XX/100 ✅/❌

### Detail Page (/listing/1)
- LCP: XXX ms ✅/❌
- TBT: XXX ms ✅/❌
- CLS: X.XX ✅/❌
- Performance Score: XX/100 ✅/❌

### Overall Result: PASS/FAIL

### Issues Identified:
[List any issues or areas for improvement]

### Recommendations:
[List any optimization opportunities]
```

---

## Additional Testing (Optional)

### Real Device Testing

For production validation, test on real devices:

1. **Low-end Android device** (e.g., Samsung Galaxy A series)
   - Chrome mobile browser
   - Real 3G connection or throttled WiFi

2. **iPhone SE or older iPhone**
   - Safari mobile browser
   - Real 3G connection or throttled WiFi

### Field Data Collection

For production deployment:

1. **Google Search Console**
   - Monitor "Core Web Vitals" report
   - Review field data from real users

2. **Web Vitals Library**
   - Consider adding `web-vitals` npm package
   - Send metrics to analytics platform

```javascript
import {getCLS, getFID, getLCP} from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // Send to analytics endpoint
  navigator.sendBeacon('/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

---

## References

- [Web Vitals](https://web.dev/vitals/) - Google's guide to Core Web Vitals
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing tool
- [Fast 3G Throttling](https://developer.chrome.com/docs/devtools/network/#throttle) - Network throttling guide
- [Optimizing LCP](https://web.dev/optimize-lcp/) - Tips for improving Largest Contentful Paint
- [Optimizing FID](https://web.dev/optimize-fid/) - Tips for improving First Input Delay
- [Optimizing CLS](https://web.dev/optimize-cls/) - Tips for improving Cumulative Layout Shift

---

## Conclusion

The mobile-first responsive enhancement feature includes comprehensive performance optimizations targeting Core Web Vitals. By following this validation guide, you can verify that the application meets Google's recommended thresholds for a good user experience on mobile devices with slow network connections.

**Expected Outcome:** All Core Web Vitals metrics should pass the "Good" thresholds on Fast 3G mobile simulation, demonstrating that the application is optimized for real-world mobile usage patterns.
