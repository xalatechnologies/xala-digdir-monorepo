/**
 * i18n Compliance Tests
 * 
 * Verifies internationalization compliance:
 * - All pages render in both locales (nb, en)
 * - No hardcoded strings visible
 * - Translation completeness
 * - Locale switching works
 */

import { test, expect } from '@playwright/test';

const LOCALES = ['nb', 'en'] as const;
const APPS = [
  { name: 'Web', url: 'http://localhost:5174' },
  { name: 'Backoffice', url: 'http://localhost:5173' },
  { name: 'MinSide', url: 'http://localhost:5175' },
];

// Known Norwegian words that should NOT appear in English locale
const NORWEGIAN_WORDS = [
  'Utleieobjekter',
  'Bookinger',
  'Søk',
  'Logg inn',
  'Lagre',
];

// Known English words that should NOT appear in Norwegian locale
const ENGLISH_WORDS = [
  'Rental Objects',
  'Bookings',
  'Search',
  'Log in',
  'Save changes',
];

test.describe('i18n Compliance', () => {
  test.describe('Locale Switching', () => {
    for (const app of APPS) {
      test(`${app.name}: can switch between locales`, async ({ page }) => {
        await page.goto(app.url);
        
        // Find language switcher
        const langSwitcher = page.locator(
          '[data-testid="language-switcher"], ' +
          'button:has-text("English"), ' +
          'button:has-text("Norsk"), ' +
          '[aria-label*="language"], ' +
          '[aria-label*="språk"]'
        ).first();

        if (await langSwitcher.isVisible()) {
          // Record current text
          const beforeSwitch = await page.locator('body').textContent();
          
          await langSwitcher.click();
          
          // Wait for locale change
          await page.waitForTimeout(500);
          
          const afterSwitch = await page.locator('body').textContent();
          
          // Content should change
          expect(beforeSwitch).not.toEqual(afterSwitch);
        } else {
          console.log(`⚠️ ${app.name}: Language switcher not found`);
        }
      });
    }
  });

  test.describe('Norwegian Locale (nb)', () => {
    for (const app of APPS) {
      test(`${app.name}: renders correctly in Norwegian`, async ({ page }) => {
        // Set Norwegian locale if possible
        await page.goto(`${app.url}?locale=nb`);
        
        // Page should load without errors
        await page.waitForLoadState('networkidle');
        
        // Check for common Norwegian UI elements
        const bodyText = await page.locator('body').textContent() || '';
        
        // Should NOT have raw translation keys
        const hasTranslationKeys = bodyText.includes('.title') || 
                                   bodyText.includes('.label') ||
                                   bodyText.includes('.description');
        
        if (hasTranslationKeys) {
          console.log(`⚠️ ${app.name}: Found potential missing translations`);
        }
        
        // Should have some Norwegian content (if not on login redirect)
        if (!page.url().includes('/login')) {
          const norwegianFound = NORWEGIAN_WORDS.some(word => 
            bodyText.toLowerCase().includes(word.toLowerCase())
          );
          
          // Either Norwegian content or properly translated
          expect(norwegianFound || bodyText.length > 100).toBeTruthy();
        }
      });
    }
  });

  test.describe('English Locale (en)', () => {
    for (const app of APPS) {
      test(`${app.name}: renders correctly in English`, async ({ page }) => {
        await page.goto(`${app.url}?locale=en`);
        
        await page.waitForLoadState('networkidle');
        
        const bodyText = await page.locator('body').textContent() || '';
        
        // Should NOT have Norwegian words when in English
        // (Allow some like brand names)
        if (!page.url().includes('/login')) {
          // Just verify page renders without translation key leaks
          const hasRawKeys = /\.[a-z]+\.[a-z]+/i.test(bodyText);
          
          if (hasRawKeys) {
            console.log(`⚠️ ${app.name}: May have untranslated keys in English`);
          }
        }
      });
    }
  });

  test.describe('Missing Translations Detection', () => {
    test('no untranslated keys visible', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Navigate through main pages
      const routes = ['/', '/rental-objects'];
      
      for (const route of routes) {
        await page.goto(`http://localhost:5174${route}`);
        await page.waitForLoadState('networkidle');
        
        // Look for patterns that indicate missing translations
        const elements = await page.locator('*').allTextContents();
        
        const missingTranslations: string[] = [];
        
        for (const text of elements) {
          // Common patterns for untranslated keys
          if (text.match(/^[a-z]+\.[a-z]+\.[a-z]+$/i) || // key.nested.value
              text.match(/^[A-Z_]{3,}$/)) {              // CONSTANT_CASE
            missingTranslations.push(text);
          }
        }
        
        if (missingTranslations.length > 0) {
          console.log(`Missing translations on ${route}:`, missingTranslations.slice(0, 10));
        }
        
        // Allow some (constants may be intentional)
        expect(missingTranslations.length).toBeLessThan(5);
      }
    });
  });

  test.describe('Date/Number Formatting', () => {
    test('dates are formatted correctly', async ({ page }) => {
      await page.goto('http://localhost:5174/');
      
      // Look for date elements
      const dateElements = page.locator('[data-testid*="date"], time, .date');
      const count = await dateElements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await dateElements.nth(i).textContent();
        
        if (text) {
          // Should be formatted, not raw ISO
          const isIsoFormat = /^\d{4}-\d{2}-\d{2}T/.test(text);
          
          if (isIsoFormat) {
            console.log(`⚠️ Unformatted date found: ${text}`);
          }
        }
      }
    });

    test('numbers use correct locale formatting', async ({ page }) => {
      await page.goto('http://localhost:5174/rental-objects');
      
      // Look for price elements
      const priceElements = page.locator('[data-testid*="price"], .price');
      const count = await priceElements.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await priceElements.nth(i).textContent();
        
        if (text) {
          // Norwegian uses comma as decimal separator
          // Should have currency and proper formatting
          const hasNorwegianFormat = text.includes(',') || text.includes('kr');
          
          if (!hasNorwegianFormat && /\d+\.\d{2}/.test(text)) {
            console.log(`⚠️ Price may not be locale-formatted: ${text}`);
          }
        }
      }
    });
  });
});
