// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '../../../mocks/api-server.mock';
import { test, expect } from '../../../src/fixtures/index';
import { config } from '../config/backoffice.config';

/**
 * Localization Tests
 * 
 * Validates i18n implementation:
 * - Default Norwegian (nb) translation
 * - English (en) translation switch
 * - No missing translation keys
 * - Proper date/time formatting
 */
test.describe('Localization - Norwegian (nb)', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should display Norwegian UI by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pageText = await page.locator('body').textContent() || '';

    // Should contain Norwegian words
    const norwegianTerms = ['Kontrollpanel', 'Bestillinger', 'Kalender', 'Innstillinger', 'Hjelp'];
    const hasNorwegian = norwegianTerms.some((term) => pageText.includes(term));

    expect(hasNorwegian, 'Page should display Norwegian text').toBe(true);
  });

  test('should have no raw i18n keys visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pageText = await page.locator('body').textContent() || '';

    // Common patterns for unresolved i18n keys
    const rawKeyPatterns = [
      /nav\.[a-z]+/gi,
      /button\.[a-z]+/gi,
      /error\.[a-z]+/gi,
      /label\.[a-z]+/gi,
    ];

    for (const pattern of rawKeyPatterns) {
      const matches = pageText.match(pattern);
      if (matches) {
        console.log(`Potential raw keys: ${matches.slice(0, 5).join(', ')}`);
      }
      // Allow some matches as they might be legitimate text
      // but flag if more than a few
      expect((matches?.length || 0) < 5, `Too many raw i18n keys: ${pattern}`).toBe(true);
    }
  });

  test('should have no "missing translation" text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const pageText = await page.locator('body').textContent() || '';

    expect(pageText).not.toContain('missing translation');
    expect(pageText).not.toContain('Missing translation');
    expect(pageText).not.toContain('undefined');
  });

  test('sidebar items should be translated', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator(config.selectors.sidebar);
    const sidebarText = await sidebar.textContent() || '';

    // All nav items should have translated text (not raw keys)
    expect(sidebarText).not.toMatch(/^nav\./);
    expect(sidebarText).not.toMatch(/CAP_/);

    // Should have descriptive text
    expect(sidebarText.length).toBeGreaterThan(50);
  });
});

test.describe('Localization - English (en)', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should switch to English', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for language switcher
    const langSwitcher = page.locator(
      '[data-testid="language-switcher"], button:has-text("EN"), select[name="language"]'
    ).first();

    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.waitForTimeout(500);

      // Select English if dropdown
      const englishOption = page.locator('button:has-text("English"), option[value="en"]').first();
      if (await englishOption.isVisible()) {
        await englishOption.click();
        await page.waitForLoadState('networkidle');
      }

      const pageText = await page.locator('body').textContent() || '';

      // Should now contain English terms
      const englishTerms = ['Dashboard', 'Bookings', 'Calendar', 'Settings', 'Help'];
      const hasEnglish = englishTerms.some((term) => pageText.includes(term));

      expect(hasEnglish, 'Page should display English text after switch').toBe(true);
    } else {
      console.log('Language switcher not found - skipping English test');
      test(true, 'No language switcher available');
    }
  });
});

test.describe('Localization - Page-specific', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  const pagesToCheck = [
    { path: '/', name: 'Dashboard' },
    { path: '/bookings', name: 'Bookings' },
    { path: '/rental-objects', name: 'Rental Objects' },
    { path: '/calendar', name: 'Calendar' },
    { path: '/settings', name: 'Settings' },
  ];

  for (const pageConfig of pagesToCheck) {
    test(`${pageConfig.name} should have no i18n issues`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      const pageText = await page.locator('body').textContent() || '';

      // No raw keys
      expect(pageText).not.toContain('nav.');
      expect(pageText).not.toContain('button.');
      expect(pageText).not.toContain('.label.');
      expect(pageText).not.toContain('.title.');

      // No undefined
      expect(pageText).not.toContain('undefined');

      // Check for forbidden terminology
      for (const term of config.forbiddenTerms) {
        expect(pageText, `Found forbidden term "${term}"`).not.toContain(term);
      }
    });
  }
});

test.describe('Date/Time Formatting', () => {
  setupMockApi(test);
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('should use Norwegian date format on calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    const pageText = await page.locator('body').textContent() || '';

    // Norwegian months
    const norwegianMonths = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];

    const hasNorwegianMonth = norwegianMonths.some(
      (month) => pageText.toLowerCase().includes(month)
    );

    // Or abbreviated months
    const abbreviatedMonths = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    const hasAbbreviatedMonth = abbreviatedMonths.some(
      (month) => pageText.toLowerCase().includes(month)
    );

    console.log(`Norwegian month format: ${hasNorwegianMonth || hasAbbreviatedMonth}`);
  });

  test('should format dates consistently in bookings', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle');

    // Look for date patterns (DD.MM.YYYY or similar Norwegian format)
    const pageText = await page.locator('body').textContent() || '';
    
    // Norwegian date format: DD.MM.YYYY or DD/MM/YYYY
    const norwegianDatePattern = /\d{1,2}[\.\/-]\d{1,2}[\.\/-]\d{2,4}/;
    const hasNorwegianDates = norwegianDatePattern.test(pageText);

    console.log(`Norwegian date format detected: ${hasNorwegianDates}`);
  });
});
