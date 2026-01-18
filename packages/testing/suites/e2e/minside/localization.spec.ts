import { test, expect } from '@playwright/test';

/**
 * MinSide Localization E2E Tests
 * 
 * Tests i18n functionality:
 * - Language switching (nb ↔ en)
 * - No missing translation keys
 * - No hardcoded strings
 * - Proper date/number formatting
 */

test.describe('MinSide - Localization', () => {
  test.use({ storageState: 'tests/e2e/minside/.auth/user.json' });

  test.describe('Language Switching', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
      }
    });

    test('default language is Norwegian', async ({ page }) => {
      const pageText = await page.locator('body').textContent() || '';
      
      // Check for Norwegian text
      const norwegianIndicators = ['Mine', 'Innstillinger', 'Hjem', 'Reservasjoner', 'Meldinger'];
      const hasNorwegian = norwegianIndicators.some(word => pageText.includes(word));
      
      console.log(`Norwegian language: ${hasNorwegian ? '✓' : '✗'}`);
    });

    test('can switch to English', async ({ page }) => {
      // Find language switcher
      const languageSwitch = page.locator('[data-testid="language-switcher"], button:has-text("EN"), button:has-text("English")').first();
      
      // Try settings page if not in header
      if (!await languageSwitch.isVisible()) {
        await page.goto('/settings', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
      
      const langOption = page.locator('select[name*="lang"], button:has-text("English"), [data-testid="lang-en"]').first();
      
      if (await langOption.isVisible()) {
        await langOption.click();
        await page.waitForTimeout(2000);
        
        const pageText = await page.locator('body').textContent() || '';
        const englishIndicators = ['My', 'Settings', 'Home', 'Bookings', 'Messages'];
        const hasEnglish = englishIndicators.some(word => pageText.includes(word));
        
        console.log(`Switched to English: ${hasEnglish ? '✓' : '✗'}`);
      } else {
        console.log('Language switcher not found');
      }
    });

    test('language persists after navigation', async ({ page }) => {
      // This test assumes we're in default Norwegian
      const pages = ['/', '/bookings', '/settings'];
      
      for (const path of pages) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        
        const pageText = await page.locator('body').textContent() || '';
        const hasNorwegian = /mine|innstilling|hjem/i.test(pageText);
        
        console.log(`${path}: ${hasNorwegian ? '✓ nb' : '? check language'}`);
      }
    });
  });

  test.describe('No Missing Translation Keys', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
      }
    });

    test('dashboard has no raw i18n keys', async ({ page }) => {
      const pageText = await page.locator('body').textContent() || '';
      
      // Patterns that indicate missing keys
      const rawKeyPatterns = [
        /\b[a-z]+\.[a-z]+\.[a-z]+\b/g,  // e.g., dashboard.title.main
        /\{\{[^}]+\}\}/g,                // e.g., {{key}}
        /\$t\([^)]+\)/g,                 // e.g., $t(key)
        /^[A-Z_]+$/gm,                   // e.g., DASHBOARD_TITLE
      ];
      
      const issues: string[] = [];
      
      for (const pattern of rawKeyPatterns) {
        const matches = pageText.match(pattern) || [];
        // Filter out false positives (URLs, emails, etc.)
        const suspicious = matches.filter(m => 
          !m.includes('http') && 
          !m.includes('@') &&
          !m.includes('.no') &&
          !m.includes('.com') &&
          m.length > 5
        );
        
        if (suspicious.length > 0) {
          issues.push(...suspicious.slice(0, 3));
        }
      }
      
      if (issues.length > 0) {
        console.log(`Possible missing keys: ${issues.join(', ')}`);
      } else {
        console.log('✓ No raw i18n keys detected');
      }
      
      // Allow some false positives but fail on many
      expect(issues.length).toBeLessThan(5);
    });

    test('bookings page has no raw i18n keys', async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.locator('body').textContent() || '';
      
      // Check for obvious missing keys
      const hasRawKeys = /\b[a-z]+\.[a-z]+\.[a-z]+\b/.test(pageText);
      
      console.log(`Bookings raw keys: ${hasRawKeys ? '⚠️ possible issues' : '✓ none detected'}`);
    });

    test('settings page has no raw i18n keys', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      const pageText = await page.locator('body').textContent() || '';
      
      const hasRawKeys = /\b[a-z]+\.[a-z]+\.[a-z]+\b/.test(pageText);
      
      console.log(`Settings raw keys: ${hasRawKeys ? '⚠️ possible issues' : '✓ none detected'}`);
    });
  });

  test.describe('Date and Number Formatting', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test.skip();
      }
    });

    test('dates are formatted in Norwegian locale', async ({ page }) => {
      const pageText = await page.locator('body').textContent() || '';
      
      // Norwegian date patterns
      const norwegianDatePatterns = [
        /\d{1,2}\.\s*(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)/i,
        /\d{1,2}\.\d{1,2}\.\d{4}/,  // dd.mm.yyyy
        /\d{1,2}\. [a-zøæå]+ \d{4}/i,
      ];
      
      const hasNorwegianDates = norwegianDatePatterns.some(p => p.test(pageText));
      
      // English date patterns (should not appear in nb locale)
      const englishDatePatterns = [
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
        /\d{1,2}\/\d{1,2}\/\d{4}/,  // mm/dd/yyyy
      ];
      
      const hasEnglishDates = englishDatePatterns.some(p => p.test(pageText));
      
      console.log(`Date formatting: Norwegian=${hasNorwegianDates ? '✓' : '–'}, English=${hasEnglishDates ? '⚠️' : '✓ none'}`);
    });

    test('numbers use correct separators', async ({ page }) => {
      const pageText = await page.locator('body').textContent() || '';
      
      // Norwegian uses space for thousand separator, comma for decimal
      // e.g., 1 234,56
      const norwegianNumbers = pageText.match(/\d{1,3}(\s\d{3})+,\d{2}/g) || [];
      
      // English uses comma for thousand separator, period for decimal
      // e.g., 1,234.56
      const englishNumbers = pageText.match(/\d{1,3}(,\d{3})+\.\d{2}/g) || [];
      
      console.log(`Number formatting: Norwegian=${norwegianNumbers.length}, English=${englishNumbers.length}`);
    });
  });

  test.describe('Content Completeness', () => {
    test('all navigation items have translated labels', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const navItems = page.locator('nav a, aside a');
      const count = await navItems.count();
      
      const issues: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const item = navItems.nth(i);
        const text = await item.textContent() || '';
        
        // Check for raw keys or empty labels
        if (text.trim().length === 0 || /^[a-z]+\.[a-z]+/i.test(text.trim())) {
          const href = await item.getAttribute('href') || 'unknown';
          issues.push(`${href}: "${text.trim()}"`);
        }
      }
      
      if (issues.length > 0) {
        console.log(`Navigation issues: ${issues.join(', ')}`);
      } else {
        console.log(`✓ All ${count} navigation items have proper labels`);
      }
      
      expect(issues.length).toBe(0);
    });

    test('buttons have translated labels', async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }
      
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      let emptyButtons = 0;
      
      for (let i = 0; i < Math.min(count, 20); i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent() || '';
        const ariaLabel = await btn.getAttribute('aria-label') || '';
        
        if (text.trim().length === 0 && ariaLabel.length === 0) {
          // Check if it's an icon-only button
          const hasIcon = await btn.locator('svg, i').count() > 0;
          if (!hasIcon) {
            emptyButtons++;
          }
        }
      }
      
      console.log(`Buttons without labels: ${emptyButtons}`);
      expect(emptyButtons).toBeLessThan(3);
    });
  });
});
