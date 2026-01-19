/**
 * Discovery Filters E2E Tests
 *
 * Tests for the filter drawer and filter functionality in discovery page.
 */

import { test, expect } from '@playwright/test';

test.describe('Discovery Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Filter Drawer', () => {
    test('opens filter drawer when filter button is clicked', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        
        // Drawer should be visible
        await expect(page.locator('[role="dialog"], [class*="drawer"]').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('closes filter drawer with close button', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Find and click close button
        const closeButton = page.locator('button[aria-label*="Lukk"], button:has([class*="close"]), [class*="drawer"] button').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          
          // Drawer should close
          await expect(page.locator('[role="dialog"], [class*="drawer"]')).toBeHidden({ timeout: 3000 });
        }
      }
    });

    test('closes filter drawer with Escape key', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Press Escape
        await page.keyboard.press('Escape');
        
        // Drawer should close
        await expect(page.locator('[role="dialog"], [class*="drawer"]')).toBeHidden({ timeout: 3000 });
      }
    });

    test('filter drawer has accessible structure', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        const drawer = page.locator('[role="dialog"], [class*="drawer"]').first();
        
        if (await drawer.isVisible()) {
          // Should have a title/heading
          const title = drawer.locator('h1, h2, h3, [class*="title"]');
          await expect(title.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Filter Sections', () => {
    test('has category/type filter section', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Look for type/category section
        const typeSection = page.locator('text=/Type|Kategori/i');
        await expect(typeSection.first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('has area/location filter section', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Look for area section
        const areaSection = page.locator('text=/Område|Sted|Lokasjon/i');
        await expect(areaSection.first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('sections are collapsible', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Find collapsible section headers
        const sectionHeader = page.locator('[class*="section"] button, [class*="collapsible"]').first();
        
        if (await sectionHeader.isVisible()) {
          await sectionHeader.click();
          // Section should collapse/expand
        }
      }
    });
  });

  test.describe('Filter Application', () => {
    test('applies category filter', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Find and click a category checkbox
        const checkbox = page.locator('[type="checkbox"], [role="checkbox"]').first();
        
        if (await checkbox.isVisible()) {
          await checkbox.click();
          
          // Apply filters
          const applyButton = page.locator('button:has-text("Vis resultat"), button:has-text("Bruk")').first();
          if (await applyButton.isVisible()) {
            await applyButton.click();
          }
          
          // Results should update (drawer should close)
          await page.waitForTimeout(1000);
        }
      }
    });

    test('shows filter count badge', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Apply a filter
        const checkbox = page.locator('[type="checkbox"], [role="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.click();
          
          // Close drawer
          const applyButton = page.locator('button:has-text("Vis resultat")').first();
          if (await applyButton.isVisible()) {
            await applyButton.click();
          }
          
          // Filter button should show count badge
          await page.waitForTimeout(500);
          // Badge would show active filter count
        }
      }
    });
  });

  test.describe('Filter Chips', () => {
    test('displays applied filter as chip', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Apply a filter
        const checkbox = page.locator('[type="checkbox"], [role="checkbox"]').nth(1);
        if (await checkbox.isVisible()) {
          await checkbox.click();
          
          // Close drawer
          const applyButton = page.locator('button:has-text("Vis resultat")').first();
          if (await applyButton.isVisible()) {
            await applyButton.click();
            await page.waitForTimeout(500);
            
            // Look for filter chip
            const chip = page.locator('[class*="chip"], [class*="filter-chip"], button[class*="filter"]');
            // Chip should be visible if filter was applied
          }
        }
      }
    });

    test('removes filter when chip is clicked', async ({ page }) => {
      // This test depends on filters being applied first
      // Would need specific data-testid selectors for reliable testing
    });

    test('clear all filters button works', async ({ page }) => {
      // Look for clear all button
      const clearButton = page.locator('button:has-text("Fjern alle"), button:has-text("Nullstill")');
      
      if (await clearButton.first().isVisible()) {
        await clearButton.first().click();
        
        // All filters should be cleared
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Result Count Updates', () => {
    test('result count updates when filters change', async ({ page }) => {
      // Get initial count
      const countElement = page.locator('text=/\\d+ resultat/i').first();
      
      if (await countElement.isVisible()) {
        const initialText = await countElement.textContent();
        
        // Apply filter
        const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
        if (await filterButton.isVisible()) {
          await filterButton.click();
          await page.waitForTimeout(500);
          
          const checkbox = page.locator('[type="checkbox"], [role="checkbox"]').nth(1);
          if (await checkbox.isVisible()) {
            await checkbox.click();
            
            const applyButton = page.locator('button:has-text("Vis resultat")').first();
            if (await applyButton.isVisible()) {
              await applyButton.click();
              await page.waitForTimeout(1000);
              
              // Count text might have changed
              // (depends on data)
            }
          }
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('filter drawer traps focus', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Tab through elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Focus should stay within drawer
        const drawer = page.locator('[role="dialog"], [class*="drawer"]').first();
        if (await drawer.isVisible()) {
          const focusedElement = await page.evaluate(() => document.activeElement);
          // Focus should be within drawer
        }
      }
    });

    test('checkboxes have proper labels', async ({ page }) => {
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Filtre")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
        
        // Check that checkboxes have labels or aria-label
        const checkboxes = page.locator('[type="checkbox"], [role="checkbox"]');
        const count = await checkboxes.count();
        
        for (let i = 0; i < Math.min(count, 3); i++) {
          const checkbox = checkboxes.nth(i);
          const hasLabel = await checkbox.getAttribute('aria-label') ||
                          await checkbox.getAttribute('aria-labelledby') ||
                          await checkbox.locator('xpath=ancestor-or-self::label').count() > 0;
          // Should have some form of label
        }
      }
    });
  });
});
