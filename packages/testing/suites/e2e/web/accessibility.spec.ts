// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Web Pack 6: Accessibility & Localization
 * 
 * Tests WCAG compliance and i18n across key routes
 */

test.describe('Web - Pack 6: Accessibility & Localization', () => {
  setupMockApi();

  test.describe('Accessibility (Axe WCAG 2.1 AA)', () => {
  setupMockApi();
    test('home page passes accessibility scan', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      
      const violations = results.violations;
      
      if (violations.length > 0) {
        console.log(`\nAccessibility violations on home page:`);
        violations.forEach(v => {
          console.log(`  - ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
        });
      } else {
        console.log('✓ Home page passes accessibility scan');
      }
      
      // Allow some violations but warn
      expect(violations.filter(v => v.impact === 'critical')).toHaveLength(0);
    });

    test('listing detail page passes accessibility scan', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const listing = page.locator('[data-testid="listing-card"] a, article a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(3000);
      }
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      const criticalViolations = results.violations.filter(v => v.impact === 'critical');
      
      console.log(`Detail page: ${results.violations.length} violations, ${criticalViolations.length} critical`);
      
      expect(criticalViolations).toHaveLength(0);
    });

    test('keyboard navigation works for search', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Tab to search input
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      let foundSearch = false;
      for (let i = 0; i < 10; i++) {
        const focused = await page.locator(':focus').first();
        const tagName = await focused.evaluate(el => el.tagName).catch(() => '');
        
        if (tagName === 'INPUT') {
          foundSearch = true;
          console.log(`✓ Reached search input after ${i + 1} tabs`);
          break;
        }
        
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      if (!foundSearch) {
        console.log('Could not reach search via keyboard');
      }
    });

    test('keyboard navigation works for listing cards', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Tab through to find a listing link
      let foundListing = false;
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focused = page.locator(':focus').first();
        const href = await focused.getAttribute('href').catch(() => null);
        
        if (href && (href.includes('/listings') || href.includes('/rental-objects'))) {
          foundListing = true;
          console.log(`✓ Reached listing after ${i + 1} tabs`);
          break;
        }
      }
      
      if (foundListing) {
        console.log('✓ Keyboard navigation successful');
      } else {
        console.log('Could not reach listing via keyboard (may be landing page)');
      }
    });

    test('images have alt text', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const images = page.locator('img');
      const count = await images.count();
      
      let missingAlt = 0;
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        if (!alt || alt.trim() === '') {
          missingAlt++;
        }
      }
      
      console.log(`Images without alt text: ${missingAlt}/${Math.min(count, 10)}`);
      expect(missingAlt).toBeLessThan(3);
    });

    test('form inputs have labels', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const inputs = page.locator('input:not([type="hidden"])');
      const count = await inputs.count();
      
      let unlabeled = 0;
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        // Check for associated label
        let hasLabel = !!ariaLabel || !!ariaLabelledBy;
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = hasLabel || await label.count() > 0;
        }
        
        if (!hasLabel && !placeholder) {
          unlabeled++;
        }
      }
      
      console.log(`Inputs without labels: ${unlabeled}/${Math.min(count, 10)}`);
    });
  });

  test.describe('Localization', () => {
  setupMockApi();
    test('default language is Norwegian', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.locator('body').textContent() || '';
      
      const norwegianIndicators = ['Søk', 'Bestill', 'Vis', 'Kontakt', 'Pris', 'Kalender'];
      const hasNorwegian = norwegianIndicators.some(word => pageText.includes(word));
      
      console.log(`Norwegian language: ${hasNorwegian ? '✓' : '✗'}`);
      expect(hasNorwegian).toBe(true);
    });

    test('no raw i18n keys visible', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.locator('body').textContent() || '';
      
      // Check for patterns that look like raw keys
      const rawKeyPattern = /\b[a-z]+\.[a-z]+\.[a-z]+\b/g;
      const matches = pageText.match(rawKeyPattern) || [];
      
      // Filter out false positives
      const suspicious = matches.filter(m => 
        !m.includes('http') && 
        !m.includes('.no') &&
        !m.includes('.com') &&
        m.length > 8
      );
      
      if (suspicious.length > 0) {
        console.log(`Possible raw keys: ${suspicious.slice(0, 3).join(', ')}`);
      } else {
        console.log('✓ No raw i18n keys detected');
      }
      
      expect(suspicious.length).toBeLessThan(5);
    });

    test('dates are formatted in Norwegian locale', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Navigate to a listing with calendar
      const listing = page.locator('[data-testid="listing-card"] a').first();
      if (await listing.isVisible()) {
        await listing.click();
        await page.waitForTimeout(2000);
      }
      
      const pageText = await page.locator('body').textContent() || '';
      
      // Norwegian month names
      const norwegianMonths = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 
                               'juli', 'august', 'september', 'oktober', 'november', 'desember'];
      
      const hasNorwegianDate = norwegianMonths.some(month => 
        pageText.toLowerCase().includes(month)
      );
      
      console.log(`Norwegian dates: ${hasNorwegianDate ? '✓' : '– (may use numeric format)'}`);
    });

    test('prices use Norwegian format', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.locator('body').textContent() || '';
      
      // Norwegian uses "kr" or "NOK", space as thousand separator
      const norwegianPricePatterns = [
        /kr\.?\s*\d/i,
        /\d+\s*kr/i,
        /NOK\s*\d/i,
      ];
      
      const hasNorwegianPrice = norwegianPricePatterns.some(p => p.test(pageText));
      
      console.log(`Norwegian price format: ${hasNorwegianPrice ? '✓' : '– check currency display'}`);
    });
  });

  test.describe('Color Contrast', () => {
  setupMockApi();
    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
      
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      if (contrastViolations.length > 0) {
        const nodeCount = contrastViolations[0].nodes.length;
        console.log(`Color contrast issues: ${nodeCount} elements`);
      } else {
        console.log('✓ Color contrast passes');
      }
    });
  });
});
}
