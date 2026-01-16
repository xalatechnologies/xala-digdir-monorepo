# Performance Guide

> Last Updated: January 16, 2026

This guide provides comprehensive strategies for optimizing performance across the Xala/Digilist Platform, ensuring fast, responsive user experiences on all devices and network conditions.

## Table of Contents

1. [Overview](#overview)
2. [Performance Targets](#performance-targets)
3. [Core Web Vitals](#core-web-vitals)
4. [Performance Budgets](#performance-budgets)
5. [Optimization Strategies](#optimization-strategies)
6. [Monitoring and Measurement](#monitoring-and-measurement)
7. [Testing Procedures](#testing-procedures)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Best Practices](#best-practices)
10. [Performance Checklist](#performance-checklist)

---

## Overview

### Why Performance Matters

Performance directly impacts:
- **User Experience**: Fast apps feel more responsive and professional
- **Conversion Rates**: 1-second delay can reduce conversions by 7%
- **SEO Rankings**: Google considers Core Web Vitals in search rankings
- **Accessibility**: Slow apps disproportionately affect users on low-end devices
- **Municipal Compliance**: Norwegian public services must meet accessibility standards

### Performance Philosophy

The Xala platform follows these principles:

1. **Mobile-First**: Optimize for 3G connections and mid-range devices
2. **Progressive Enhancement**: Core functionality works on all devices
3. **Audit-First**: Performance monitoring is built-in, not bolted-on
4. **SDK-First**: Client SDK handles optimization transparently
5. **Design Token-First**: CSS optimization through token system

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│  FRONTEND PERFORMANCE                       │
│  - Code splitting (route-based)             │
│  - Lazy loading (images, components)        │
│  - Service Worker (caching)                 │
│  - Skeleton screens (perceived perf)        │
├─────────────────────────────────────────────┤
│  SDK PERFORMANCE                            │
│  - React Query caching                      │
│  - Request deduplication                    │
│  - Optimistic updates                       │
│  - WebSocket for realtime (vs polling)      │
├─────────────────────────────────────────────┤
│  BACKEND PERFORMANCE                        │
│  - Database query optimization              │
│  - Projection DTOs (no overfetching)        │
│  - Multi-tenant query isolation             │
│  - Audit log batching                       │
└─────────────────────────────────────────────┘
```

---

## Performance Targets

### Load Time Targets

| Metric | Target | Acceptable | Poor | Network |
|--------|--------|------------|------|---------|
| **Time to Interactive (TTI)** | < 3.0s | 3.0s - 5.0s | > 5.0s | Fast 3G |
| **First Contentful Paint (FCP)** | < 1.0s | 1.0s - 2.0s | > 2.0s | Fast 3G |
| **Largest Contentful Paint (LCP)** | < 2.5s | 2.5s - 4.0s | > 4.0s | Fast 3G |
| **Total Blocking Time (TBT)** | < 200ms | 200ms - 600ms | > 600ms | - |
| **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1 - 0.25 | > 0.25 | - |

### Bundle Size Targets

| Application | Main Bundle | Vendor Bundle | Total Initial | Gzipped |
|-------------|-------------|---------------|---------------|---------|
| **Web** | < 50KB | < 150KB | < 200KB | < 60KB |
| **Backoffice** | < 60KB | < 180KB | < 240KB | < 75KB |
| **Minside** | < 40KB | < 140KB | < 180KB | < 55KB |

### API Response Time Targets

| Endpoint Type | Target | Acceptable | Poor |
|---------------|--------|------------|------|
| **Health Check** | < 50ms | 50ms - 100ms | > 100ms |
| **List View (paginated)** | < 200ms | 200ms - 500ms | > 500ms |
| **Detail View** | < 150ms | 150ms - 300ms | > 300ms |
| **Create/Update** | < 300ms | 300ms - 800ms | > 800ms |
| **Search** | < 250ms | 250ms - 600ms | > 600ms |

---

## Core Web Vitals

### Understanding Core Web Vitals

Google's Core Web Vitals measure user-centric performance:

#### 1. Largest Contentful Paint (LCP)

**What it measures**: Loading performance - time until largest content element is visible.

**Target**: < 2.5 seconds

**Common causes of poor LCP**:
- Large images without optimization
- Blocking JavaScript/CSS in critical path
- Slow server response times
- Client-side rendering delays

**How to optimize**:
```typescript
// ✅ Eager load hero images
<img
  src="/hero.jpg"
  loading="eager"
  fetchpriority="high"
  width={800}
  height={600}
/>

// ✅ Lazy load below-fold images
<img
  src="/thumbnail.jpg"
  loading="lazy"
  decoding="async"
  width={300}
  height={200}
/>

// ✅ Use React.lazy for route splitting
const RentalObjectDetails = React.lazy(() => import('./features/rental-object-details'));
```

#### 2. First Input Delay (FID) / Total Blocking Time (TBT)

**What it measures**: Interactivity - time from user interaction to browser response.

**Target**: FID < 100ms, TBT < 200ms

**Common causes of poor FID**:
- Large JavaScript bundles blocking main thread
- Heavy computations during initial load
- Unoptimized third-party scripts

**How to optimize**:
```typescript
// ✅ Code split large libraries
manualChunks: (id) => {
  if (id.includes('mapbox-gl')) return 'vendor-mapbox';
  if (id.includes('@tanstack/react-query')) return 'vendor-query';
  if (id.includes('node_modules')) return 'vendor';
}

// ✅ Defer non-critical work
useEffect(() => {
  // Use setTimeout to defer non-critical tasks
  setTimeout(() => {
    initializeAnalytics();
  }, 0);
}, []);

// ✅ Use Web Workers for heavy computations
const worker = new Worker('/workers/data-processor.js');
```

#### 3. Cumulative Layout Shift (CLS)

**What it measures**: Visual stability - unexpected layout shifts during page load.

**Target**: < 0.1

**Common causes of poor CLS**:
- Images without dimensions
- Fonts causing text reflow
- Ads/embeds without reserved space
- Dynamic content injection

**How to optimize**:
```typescript
// ✅ Always specify image dimensions
<img
  src="/image.jpg"
  width={800}
  height={600}
  alt="Description"
/>

// ✅ Use skeleton screens for loading states
{isLoading ? (
  <RentalObjectCardSkeleton />
) : (
  <RentalObjectCard data={rentalObject} />
)}

// ✅ Reserve space for dynamic content
<div style={{ minHeight: '400px' }}>
  {content}
</div>

// ✅ Use font-display for web fonts
@font-face {
  font-family: 'Custom';
  src: url('/fonts/custom.woff2');
  font-display: swap; /* Prevents invisible text */
}
```

---

## Performance Budgets

### Bundle Size Budget

Track bundle sizes in every build:

```bash
# Check bundle sizes after build
pnpm build
ls -lh apps/web/dist/assets/*.js

# Fail CI if bundle exceeds limit
if [ $(stat -f%z apps/web/dist/assets/index-*.js) -gt 51200 ]; then
  echo "ERROR: Main bundle exceeds 50KB limit"
  exit 1
fi
```

### Lighthouse Score Budget

Target Lighthouse scores:

| Category | Target | Minimum Acceptable |
|----------|--------|--------------------|
| **Performance** | 90+ | 80+ |
| **Accessibility** | 100 | 95+ |
| **Best Practices** | 95+ | 90+ |
| **SEO** | 100 | 95+ |

### Third-Party Script Budget

Limit third-party scripts to reduce blocking time:

| Script Type | Max Scripts | Max Total Size |
|-------------|-------------|----------------|
| **Analytics** | 1 | 15KB |
| **Maps** | 1 (Mapbox) | 50KB (lazy loaded) |
| **Payment** | 1 (Vipps) | 30KB (on-demand) |
| **Monitoring** | 1 | 10KB |

---

## Optimization Strategies

### 1. Code Splitting

Split code by routes to reduce initial bundle size:

```typescript
// apps/web/src/App.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@xala/ds';

// ✅ Lazy load route components
const Home = lazy(() => import('./routes/Home'));
const RentalObjectDetails = lazy(() => import('./routes/RentalObjectDetails'));
const Booking = lazy(() => import('./routes/Booking'));
const Profile = lazy(() => import('./routes/Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rental-object/:id" element={<RentalObjectDetails />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Image Optimization

Optimize images for fast loading:

```typescript
// ✅ Use responsive images
<picture>
  <source
    srcSet="/images/hero-mobile.webp"
    media="(max-width: 640px)"
    type="image/webp"
  />
  <source
    srcSet="/images/hero-desktop.webp"
    media="(min-width: 641px)"
    type="image/webp"
  />
  <img
    src="/images/hero-desktop.jpg"
    alt="Hero image"
    loading="eager"
    width={1200}
    height={600}
  />
</picture>

// ✅ Lazy load images below the fold
<img
  src="/thumbnail.jpg"
  loading="lazy"
  decoding="async"
  width={300}
  height={200}
/>
```

### 3. Service Worker Caching

Leverage service worker for offline support and fast repeat visits:

```typescript
// apps/web/src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Cache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache API calls
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);
```

### 4. React Query Caching

Use SDK's React Query hooks for efficient data caching:

```typescript
// ✅ Use SDK hooks with built-in caching
import { useRentalObjects, useRentalObjectDetails } from '@digilist/client-sdk/hooks';

function RentalObjectsPage() {
  const { data, isLoading } = useRentalObjects({
    // Cached for 5 minutes, refetch on window focus
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      {isLoading ? <RentalObjectsSkeleton /> : <RentalObjectsGrid data={data} />}
    </>
  );
}

// ✅ Prefetch detail pages on hover
function RentalObjectCard({ rentalObject }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['rentalObject', rentalObject.id],
      queryFn: () => rentalObjectService.getById(rentalObject.id),
    });
  };

  return (
    <Card onMouseEnter={handleMouseEnter}>
      {/* Card content */}
    </Card>
  );
}
```

### 5. Database Query Optimization

Optimize backend queries for fast responses:

```typescript
// ✅ Use projection DTOs to limit data transfer
interface RentalObjectCardProjectionDTO {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  // ONLY fields needed for card display
}

// ✅ Use database indexes
CREATE INDEX idx_rental_objects_kommune_id ON rental_objects(kommune_id);
CREATE INDEX idx_bookings_rental_object_id ON bookings(rental_object_id);
CREATE INDEX idx_bookings_user_id_status ON bookings(user_id, status);

// ✅ Paginate large result sets
async function getRentalObjects(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return await db.query(
    `SELECT * FROM rental_objects
     WHERE kommune_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [kommuneId, limit, offset]
  );
}
```

### 6. CSS Optimization

Minimize CSS bundle size with design tokens:

```typescript
// ✅ Import design system styles ONCE in main.tsx
import '@xala/ds/styles';

// ✅ Use design tokens (tree-shakeable)
import { tokens } from '@xala/ds';

const styles = {
  container: {
    padding: tokens.spacing['4'],
    backgroundColor: tokens.colors.background.default,
  }
};

// ❌ AVOID inline styles (not optimizable)
<div style={{ padding: '16px', backgroundColor: '#f0f0f0' }} />
```

### 7. Skeleton Screens

Improve perceived performance with skeleton screens:

```typescript
// ✅ Show skeleton during loading
import { Skeleton } from '@xala/ds';

function RentalObjectCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </Card>
  );
}

function RentalObjectsGrid() {
  const { data, isLoading } = useRentalObjects();

  if (isLoading) {
    return (
      <Grid columns="repeat(auto-fill, minmax(300px, 1fr))">
        {Array.from({ length: 6 }).map((_, i) => (
          <RentalObjectCardSkeleton key={i} />
        ))}
      </Grid>
    );
  }

  return (
    <Grid columns="repeat(auto-fill, minmax(300px, 1fr))">
      {data.map((rentalObject) => (
        <RentalObjectCard key={rentalObject.id} rentalObject={rentalObject} />
      ))}
    </Grid>
  );
}
```

---

## Monitoring and Measurement

### Browser DevTools

Use Chrome DevTools for performance profiling:

```bash
# 1. Open DevTools (F12)
# 2. Navigate to "Performance" tab
# 3. Click "Record" and reload page
# 4. Analyze:
#    - Main thread activity
#    - Network waterfall
#    - JavaScript execution time
#    - Layout/paint operations
```

### Lighthouse CI

Automate performance testing in CI/CD:

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun --collect.url=http://localhost:5173

# Configure in lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

### Real User Monitoring (RUM)

Monitor real user performance in production:

```typescript
// apps/web/src/monitoring/performance.ts
import { realtimeClient } from '@digilist/client-sdk';

// Track Core Web Vitals
export function initializePerformanceMonitoring() {
  // LCP
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.startTime);
      realtimeClient.sendMetric({
        metric: 'lcp',
        value: entry.startTime,
        url: window.location.pathname,
      });
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // FID
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
      realtimeClient.sendMetric({
        metric: 'fid',
        value: entry.processingStart - entry.startTime,
        url: window.location.pathname,
      });
    }
  }).observe({ entryTypes: ['first-input'] });

  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });
}
```

### Bundle Size Monitoring

Track bundle sizes in CI:

```bash
# Add to package.json
"scripts": {
  "analyze": "vite-bundle-visualizer",
  "size": "bundlesize"
}

# Configure bundlesize in package.json
"bundlesize": [
  {
    "path": "apps/web/dist/assets/index-*.js",
    "maxSize": "50 KB"
  },
  {
    "path": "apps/web/dist/assets/vendor-*.js",
    "maxSize": "150 KB"
  }
]
```

---

## Testing Procedures

### Manual Lighthouse Testing

Test Core Web Vitals on 3G:

1. **Open Chrome DevTools** (F12)
2. **Navigate to Lighthouse tab**
3. **Configure settings**:
   - Mode: Navigation
   - Device: Mobile
   - Throttling: Fast 3G
   - CPU slowdown: 4x
4. **Run test** on each page:
   - Homepage: `http://localhost:5173/`
   - Rental object details: `http://localhost:5173/rental-object/1`
   - Booking flow: `http://localhost:5173/booking/1`
5. **Verify scores** meet targets (Performance 80+)

### Automated Performance Testing

Add performance tests to CI pipeline:

```bash
# Run Lighthouse in CI
pnpm test:lighthouse

# Check bundle sizes
pnpm size

# Run performance tests
pnpm test:performance
```

### Network Throttling Testing

Test on different network conditions:

```bash
# Chrome DevTools Network tab
# Throttling presets:
# - Fast 3G (1.6 Mbps, 150ms latency)
# - Slow 3G (400 Kbps, 400ms latency)
# - Offline
```

---

## Common Issues and Solutions

### Issue: Large Bundle Size

**Symptom**: Main bundle > 50KB or vendor bundle > 150KB.

**Solutions**:

```bash
# 1. Analyze bundle composition
pnpm analyze

# 2. Check for duplicate dependencies
pnpm dedupe

# 3. Verify code splitting is working
ls -lh apps/web/dist/assets/*.js

# 4. Remove unused dependencies
pnpm remove <unused-package>
```

### Issue: Slow Initial Load

**Symptom**: FCP > 2s or LCP > 3s.

**Solutions**:

1. **Reduce bundle size** (see above)
2. **Optimize images**:
   ```bash
   # Use WebP format
   cwebp input.jpg -o output.webp -q 80
   ```
3. **Preload critical assets**:
   ```html
   <link rel="preload" href="/fonts/font.woff2" as="font" crossorigin>
   ```
4. **Enable service worker caching**

### Issue: Layout Shift (High CLS)

**Symptom**: CLS > 0.1, content jumps during load.

**Solutions**:

```typescript
// 1. Add image dimensions
<img src="/image.jpg" width={800} height={600} alt="" />

// 2. Use skeleton screens
{isLoading ? <Skeleton /> : <Content />}

// 3. Reserve space for dynamic content
<div style={{ minHeight: '400px' }}>{dynamicContent}</div>

// 4. Use font-display: swap
@font-face {
  font-family: 'Custom';
  src: url('/font.woff2');
  font-display: swap;
}
```

### Issue: Slow API Responses

**Symptom**: API calls > 500ms.

**Solutions**:

1. **Add database indexes**
2. **Use projection DTOs** (limit data transfer)
3. **Enable query caching** in React Query
4. **Implement pagination** for large datasets
5. **Optimize database queries** (check `EXPLAIN` output)

---

## Best Practices

### 1. Mobile-First Performance

Always test on mobile devices and 3G networks:

```bash
# Use Chrome DevTools device emulation
# Test on real devices when possible
```

### 2. Measure Before Optimizing

Don't guess, measure:

```bash
# Profile before optimization
pnpm analyze

# Profile after optimization
pnpm analyze

# Compare bundle sizes
ls -lh apps/web/dist/assets/*.js
```

### 3. Optimize Critical Path

Focus on above-the-fold content:

```typescript
// ✅ Eager load hero image
<img src="/hero.jpg" loading="eager" fetchpriority="high" />

// ✅ Lazy load below-fold images
<img src="/thumbnail.jpg" loading="lazy" />
```

### 4. Use Service Worker

Enable offline support and fast repeat visits:

```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 5. Monitor in Production

Track real user metrics:

```typescript
// Send Core Web Vitals to monitoring
realtimeClient.sendMetric({ metric: 'lcp', value: lcpValue });
```

### 6. Set Performance Budgets

Define and enforce limits:

```json
{
  "budgets": [
    { "path": "apps/web/dist/assets/index-*.js", "maxSize": "50 KB" },
    { "path": "apps/web/dist/assets/vendor-*.js", "maxSize": "150 KB" }
  ]
}
```

### 7. Progressive Enhancement

Ensure core functionality works on all devices:

```typescript
// ✅ Provide fallbacks
if ('IntersectionObserver' in window) {
  // Use lazy loading
} else {
  // Load all images
}
```

---

## Performance Checklist

Use this checklist for every performance optimization:

### Build Time
- [ ] Bundle sizes under budget (main < 50KB, vendor < 150KB)
- [ ] Code splitting enabled for routes
- [ ] Tree shaking working (no unused exports)
- [ ] Source maps generated for debugging
- [ ] Minification enabled

### Load Time
- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts use font-display: swap
- [ ] Critical CSS inlined
- [ ] Service worker registered
- [ ] Lighthouse score 80+

### Runtime
- [ ] React Query caching enabled
- [ ] Skeleton screens for loading states
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images have dimensions
- [ ] Heavy tasks deferred or in Web Workers

### API
- [ ] Database queries indexed
- [ ] Projection DTOs used
- [ ] Response times < 500ms
- [ ] Pagination implemented
- [ ] Audit logging batched

### Monitoring
- [ ] Core Web Vitals tracked
- [ ] Bundle sizes monitored in CI
- [ ] Error tracking enabled
- [ ] Performance budgets enforced
- [ ] Real user metrics collected

---

## Related Documentation

- [Deployment Guide](./03-deployment.md) - Deployment procedures
- [Accessibility Guide](./05-accessibility.md) - WCAG compliance
- [Core Web Vitals Validation](../core-web-vitals-validation.md) - Detailed validation procedures
- [Design Tokens Guide](../DESIGN_TOKENS_GUIDE.md) - CSS optimization

---

## Support

For performance issues:

1. Check [Common Issues and Solutions](#common-issues-and-solutions) above
2. Run Lighthouse audit for detailed diagnostics
3. Profile with Chrome DevTools Performance tab
4. Review bundle composition with `pnpm analyze`
5. Contact performance team for optimization advice

**Performance Regression**: If performance degrades in production, follow rollback procedures in [Deployment Guide](./03-deployment.md).
