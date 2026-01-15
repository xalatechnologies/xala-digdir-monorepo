/**
 * Performance E2E Tests
 * Tests page load times, Core Web Vitals, and response times
 */
import { test, expect } from '@playwright/test';

test.describe('Performance - Page Load Times', () => {
  test('home page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('rental objects list loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/rental-objects');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('login page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Performance - Core Web Vitals', () => {
  test('LCP (Largest Contentful Paint) under 2.5s', async ({ page }) => {
    await page.goto('/');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });

  test('FID (First Input Delay) simulation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    const searchInput = page.getByPlaceholder(/søk|search/i);
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.click();
    } else {
      const firstButton = page.getByRole('button').first();
      if (await firstButton.isVisible()) {
        await firstButton.click();
      }
    }
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(100);
  });

  test('CLS (Cumulative Layout Shift) under 0.1', async ({ page }) => {
    await page.goto('/');
    
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });
    
    expect(cls).toBeLessThan(0.1);
  });
});

test.describe('Performance - API Response Times', () => {
  test('API calls complete within 1 second', async ({ page }) => {
    const apiCalls: { url: string; duration: number }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        const timing = response.request().timing();
        apiCalls.push({
          url,
          duration: timing.responseEnd - timing.requestStart,
        });
      }
    });
    
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    for (const call of apiCalls) {
      expect(call.duration).toBeLessThan(1000);
    }
  });

  test('search API responds within 500ms', async ({ page }) => {
    await page.goto('/');
    
    let searchDuration = 0;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/search')) {
        const timing = response.request().timing();
        searchDuration = timing.responseEnd - timing.requestStart;
      }
    });
    
    const searchInput = page.getByPlaceholder(/søk|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('møterom');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      
      if (searchDuration > 0) {
        expect(searchDuration).toBeLessThan(500);
      }
    }
  });
});

test.describe('Performance - Resource Loading', () => {
  test('total page weight under 2MB', async ({ page }) => {
    let totalBytes = 0;
    
    page.on('response', async (response) => {
      const headers = response.headers();
      const contentLength = parseInt(headers['content-length'] || '0');
      totalBytes += contentLength;
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const twoMB = 2 * 1024 * 1024;
    expect(totalBytes).toBeLessThan(twoMB);
  });

  test('images are optimized (no images over 500KB)', async ({ page }) => {
    const largeImages: string[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('image')) {
        const contentLength = parseInt(response.headers()['content-length'] || '0');
        if (contentLength > 500 * 1024) {
          largeImages.push(url);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(largeImages).toHaveLength(0);
  });

  test('JavaScript bundles are reasonably sized', async ({ page }) => {
    const largeBundles: { url: string; size: number }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('javascript') || url.endsWith('.js')) {
        const contentLength = parseInt(response.headers()['content-length'] || '0');
        if (contentLength > 300 * 1024) {
          largeBundles.push({ url, size: contentLength });
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Log large bundles for review
    if (largeBundles.length > 0) {
      console.log('Large JS bundles:', largeBundles);
    }
    
    // Allow up to 2 large bundles (main and vendor)
    expect(largeBundles.length).toBeLessThanOrEqual(2);
  });
});

test.describe('Performance - Caching', () => {
  test('static assets have cache headers', async ({ page }) => {
    const cachedAssets: string[] = [];
    const uncachedAssets: string[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      const cacheControl = response.headers()['cache-control'];
      
      if (url.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
        if (cacheControl && (cacheControl.includes('max-age') || cacheControl.includes('immutable'))) {
          cachedAssets.push(url);
        } else {
          uncachedAssets.push(url);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Most static assets should be cached
    const cacheRatio = cachedAssets.length / (cachedAssets.length + uncachedAssets.length);
    expect(cacheRatio).toBeGreaterThan(0.5);
  });

  test('API responses have appropriate cache headers', async ({ page }) => {
    const apiResponses: { url: string; cacheControl: string | null }[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/')) {
        apiResponses.push({
          url,
          cacheControl: response.headers()['cache-control'],
        });
      }
    });
    
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    // Check that API responses have cache control
    for (const response of apiResponses) {
      expect(response.cacheControl).not.toBeNull();
    }
  });
});

test.describe('Performance - Rendering', () => {
  test('no excessive re-renders on load', async ({ page }) => {
    await page.goto('/');
    
    const renderCount = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;
        const observer = new MutationObserver(() => {
          count++;
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 2000);
      });
    });
    
    // After initial load, there shouldn't be excessive DOM changes
    expect(renderCount).toBeLessThan(100);
  });

  test('scroll performance is smooth', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    const scrollPerformance = await page.evaluate(() => {
      return new Promise<{ frameDrops: number }>((resolve) => {
        let lastTime = performance.now();
        let frameDrops = 0;
        
        const checkFrame = () => {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          
          if (delta > 32) {
            frameDrops++;
          }
          
          lastTime = currentTime;
        };
        
        const scrollHandler = () => {
          requestAnimationFrame(checkFrame);
        };
        
        window.addEventListener('scroll', scrollHandler);
        
        // Scroll the page
        let scrollY = 0;
        const scrollInterval = setInterval(() => {
          scrollY += 100;
          window.scrollTo(0, scrollY);
          
          if (scrollY > 1000) {
            clearInterval(scrollInterval);
            window.removeEventListener('scroll', scrollHandler);
            resolve({ frameDrops });
          }
        }, 50);
      });
    });
    
    // Should have minimal frame drops
    expect(scrollPerformance.frameDrops).toBeLessThan(10);
  });
});

test.describe('Performance - Memory', () => {
  test('no memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as typeof performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }
    
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as typeof performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
      expect(memoryGrowth).toBeLessThan(0.5);
    }
  });
});
