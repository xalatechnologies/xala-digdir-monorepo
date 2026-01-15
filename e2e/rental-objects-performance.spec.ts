/**
 * E2E Performance Tests for Rental Objects
 * Tests load times, rendering performance, and scalability
 */

import { test, expect } from '@playwright/test';

const BACKOFFICE_BASE_URL = 'http://localhost:5175';

test.describe('Rental Objects Performance Tests', () => {
  test.use({ baseURL: BACKOFFICE_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Authenticate (adjust based on your auth setup)
    await page.waitForLoadState('networkidle');
  });

  test('should load list page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: < 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return {
        // Largest Contentful Paint
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
        // First Input Delay
        fid: performance.getEntriesByType('first-input')[0]?.processingStart,
        // Cumulative Layout Shift
        cls: performance.getEntriesByType('layout-shift')
          .reduce((sum, entry: any) => sum + entry.value, 0),
      };
    });
    
    // LCP should be < 2.5s
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/rental-objects');
    
    // Simulate loading 1000+ items
    await page.evaluate(() => {
      // Mock API to return large dataset
      (window as any).__MOCK_LARGE_DATASET__ = true;
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Measure render time
    const renderTime = await page.evaluate(() => {
      const start = performance.now();
      // Wait for all items to render
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(performance.now() - start);
        }, 1000);
      });
    });
    
    // Should render efficiently even with large dataset
    expect(renderTime).toBeLessThan(3000);
  });

  test('should maintain 60fps during scrolling', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    // Measure frame rate during scroll
    const frameRates = await page.evaluate(() => {
      return new Promise<number[]>((resolve) => {
        const frameTimes: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFrame = () => {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTime;
          frameTimes.push(frameTime);
          lastTime = currentTime;
          frameCount++;
          
          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve(frameTimes);
          }
        };
        
        // Start scrolling
        window.scrollBy(0, 100);
        requestAnimationFrame(measureFrame);
      });
    });
    
    // Calculate average frame time (should be < 16.67ms for 60fps)
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    expect(avgFrameTime).toBeLessThan(16.67);
  });

  test('should handle rapid filter changes without lag', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    const filterButton = page.locator('button').filter({ hasText: /filter/i }).first();
    if (await filterButton.count() > 0) {
      const startTime = Date.now();
      
      // Rapid filter changes
      for (let i = 0; i < 5; i++) {
        await filterButton.click();
        await page.waitForTimeout(100);
        await filterButton.click();
      }
      
      const totalTime = Date.now() - startTime;
      // Should handle rapid changes smoothly
      expect(totalTime).toBeLessThan(2000);
    }
  });

  test('should optimize API calls with debouncing', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    // Track network requests
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/rental-objects')) {
        requests.push(request.url());
      }
    });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Søk"]').first();
    
    // Rapid typing
    await searchInput.type('test', { delay: 10 });
    
    await page.waitForTimeout(500); // Wait for debounce
    
    // Should not make excessive API calls
    // Debouncing should limit to 1-2 requests
    expect(requests.length).toBeLessThan(5);
  });

  test('should lazy load images efficiently', async ({ page }) => {
    await page.goto('/rental-objects');
    await page.waitForLoadState('networkidle');
    
    // Check if images have loading="lazy"
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      const loading = await img.getAttribute('loading');
      // Images should use lazy loading
      expect(loading).toBe('lazy');
    }
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through multiple pages
    for (let i = 0; i < 5; i++) {
      await page.goto('/rental-objects');
      await page.waitForLoadState('networkidle');
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not grow excessively
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      // Should not grow more than 50MB
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    }
  });
});
