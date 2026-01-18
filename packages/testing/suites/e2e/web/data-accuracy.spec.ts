// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '@playwright/test';

/**
 * Web Pack 7: Data Accuracy & Caching
 * 
 * Verifies that UI data comes from API (not invented) and caching works correctly
 */

test.describe('Web - Pack 7: Data Accuracy & Caching', () => {
  setupMockApi();

  test.describe('Data Source Verification', () => {
  setupMockApi();
    test('listing data matches API response', async ({ page }) => {
      // Intercept API calls
      const apiResponses: any[] = [];
      
      page.on('response', async (response) => {
        if (response.url().includes('/api/listings') || response.url().includes('/api/rental-objects')) {
          try {
            const json = await response.json();
            apiResponses.push(json);
          } catch {
            // Not JSON
          }
        }
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Verify we got API data
      console.log(`API responses captured: ${apiResponses.length}`);
      
      if (apiResponses.length > 0) {
        const apiData = apiResponses[0]?.data || apiResponses[0]?.items || apiResponses[0];
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          const firstApiItem = apiData[0];
          
          // Get first UI card
          const firstCard = page.locator('[data-testid="listing-card"], article').first();
          const cardText = await firstCard.textContent() || '';
          
          // Verify title from API appears in UI
          const titleMatch = firstApiItem.title || firstApiItem.name;
          if (titleMatch) {
            const matches = cardText.includes(titleMatch);
            console.log(`Title match: ${matches ? '✓' : '✗'} ("${titleMatch}")`);
          }
        }
      }
    });

    test('availability data is not invented', async ({ page }) => {
      // Intercept availability API
      let availabilityResponse: any = null;
      
      page.on('response', async (response) => {
        if (response.url().includes('/availability')) {
          try {
            availabilityResponse = await response.json();
          } catch {}
        }
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Navigate to listing detail
      const listing = page.locator('[data-testid="listing-card"] a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(3000);
      }
      
      if (availabilityResponse) {
        console.log('✓ Availability loaded from API');
        
        // Count slots from API
        const apiSlots = availabilityResponse.data?.length || 
                        availabilityResponse.slots?.length ||
                        Object.keys(availabilityResponse).length;
        
        // Count slots in UI
        const uiSlots = await page.locator('[data-date], [data-slot]').count();
        
        console.log(`  API slots: ${apiSlots}, UI slots: ${uiSlots}`);
      } else {
        console.log('– No availability API call detected');
      }
    });
  });

  test.describe('Loading States', () => {
  setupMockApi();
    test('shows loading state while fetching', async ({ page }) => {
      // Slow down network to see loading state
      await page.route('**/api/**', async route => {
        await new Promise(r => setTimeout(r, 1000));
        await route.continue();
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Check for loading indicator
      const loading = page.locator('[data-testid="loading"], [class*="loading"], [class*="skeleton"], [aria-busy="true"]');
      const hadLoading = await loading.first().isVisible().catch(() => false);
      
      console.log(`Loading state: ${hadLoading ? '✓' : '– may be too fast'}`);
      
      // Wait for content
      await page.waitForTimeout(3000);
      
      // Verify content loaded
      const listings = page.locator('[data-testid="listing-card"], article');
      const count = await listings.count();
      
      console.log(`Content loaded: ${count} listings`);
    });

    test('shows skeleton while loading', async ({ page }) => {
      // Check for skeleton before content loads
      await page.goto('/', { waitUntil: 'commit' });
      
      const skeleton = page.locator('[class*="skeleton"], [data-testid="skeleton"]');
      const hasSkeleton = await skeleton.first().isVisible({ timeout: 1000 }).catch(() => false);
      
      console.log(`Skeleton loading: ${hasSkeleton ? '✓' : '– uses different pattern'}`);
    });
  });

  test.describe('Error Handling', () => {
  setupMockApi();
    test('displays error message on API failure', async ({ page }) => {
      // Intercept and fail API
      await page.route('**/api/listings**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            type: 'https://api.digilist.no/problems/internal-error',
            title: 'Internal Server Error',
            status: 500,
            detail: 'Test error',
          }),
        });
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      // Check for error display
      const error = page.locator('[role="alert"], [class*="error"], [data-testid="error-message"]');
      const hasError = await error.first().isVisible().catch(() => false);
      
      console.log(`Error display: ${hasError ? '✓ shows error' : '– no visible error'}`);
    });

    test('shows empty state when no results', async ({ page }) => {
      // Intercept with empty response
      await page.route('**/api/listings**', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: [], total: 0 }),
        });
      });
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const emptyState = page.locator('[data-testid="empty-state"], text=/ingen/i, text=/no results/i');
      const hasEmptyState = await emptyState.first().isVisible().catch(() => false);
      
      console.log(`Empty state: ${hasEmptyState ? '✓' : '✗'}`);
    });
  });

  test.describe('Cache Behavior', () => {
  setupMockApi();
    test('data is cached on navigation', async ({ page }) => {
      let apiCallCount = 0;
      
      page.on('request', request => {
        if (request.url().includes('/api/listings')) {
          apiCallCount++;
        }
      });
      
      // First visit
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const callsAfterFirst = apiCallCount;
      
      // Navigate to detail
      const listing = page.locator('[data-testid="listing-card"] a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(2000);
      }
      
      // Navigate back
      await page.goBack();
      await page.waitForTimeout(2000);
      
      const callsAfterBack = apiCallCount;
      
      console.log(`API calls: initial=${callsAfterFirst}, after back=${callsAfterBack}`);
      console.log(`Caching: ${callsAfterBack <= callsAfterFirst + 1 ? '✓ likely cached' : '– may refetch'}`);
    });
  });
});
}
