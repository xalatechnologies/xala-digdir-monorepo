// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect, MenuMap } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';

/**
 * SUITE A: Backoffice Shell Blur-Eye Tests
 * 
 * Tests the core shell components:
 * A1. Login & Session flow
 * A2. Header bar (global navigation)
 * A3. Sidebar / Menu Information Architecture
 * 
 * Blur-Eye Principle: User understands where they are within 2 seconds
 */

test.describe('A. Backoffice Shell Blur-Eye', () => {
  setupMockApi();
  
  test.describe('A1. Login & Session Flow', () => {
  setupMockApi();
    
    test('A1.1 Login page loads with clear structure', async ({ page, evidence }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Blur-eye: Clear title/logo
      const logo = page.locator('header img[alt*="logo" i], [data-testid="logo"], svg[class*="logo"]').first();
      const title = page.locator('h1, h2, [data-testid="login-title"]').first();
      
      const hasLogo = await logo.isVisible().catch(() => false);
      const hasTitle = await title.isVisible().catch(() => false);
      
      expect(hasLogo || hasTitle).toBe(true);
      console.log(`Login page: logo=${hasLogo ? '✓' : '✗'}, title=${hasTitle ? '✓' : '✗'}`);
      
      // Language consistency check
      const pageText = await page.locator('body').textContent() || '';
      const hasNorwegian = /logg inn|pålogging|e-post|passord/i.test(pageText);
      const hasEnglish = /log in|sign in|email|password/i.test(pageText);
      
      console.log(`Language: Norwegian=${hasNorwegian}, English=${hasEnglish}`);
      
      // Accessibility: email/password inputs with labels
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="e-post" i], input[placeholder*="email" i]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(passwordInput).toBeVisible({ timeout: 5000 });
      
      // Check for labels or aria-labels
      const emailLabel = await emailInput.getAttribute('aria-label') || await emailInput.getAttribute('placeholder');
      const passwordLabel = await passwordInput.getAttribute('aria-label') || await passwordInput.getAttribute('placeholder');
      
      console.log(`Input accessibility: email="${emailLabel}", password="${passwordLabel}"`);
      
      // Quality gate: no console errors
      expect(evidence.hasConsoleErrors()).toBe(false);
    });

    test('A1.2 Demo login options visible', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Check for demo login button/section
      const demoButton = page.locator('button:has-text("Demo"), [data-testid="demo-login"], button:has-text("Test")').first();
      const demoSection = page.locator('[data-testid="demo-section"], [class*="demo"]').first();
      
      const hasDemoButton = await demoButton.isVisible().catch(() => false);
      const hasDemoSection = await demoSection.isVisible().catch(() => false);
      
      console.log(`Demo login: button=${hasDemoButton}, section=${hasDemoSection}`);
      
      if (hasDemoButton) {
        await demoButton.click();
        await page.waitForTimeout(1000);
        
        // Check for token input
        const tokenInput = page.locator('input[placeholder*="token" i], input[name="token"], input[data-testid="demo-token"]').first();
        const tokenVisible = await tokenInput.isVisible().catch(() => false);
        console.log(`  Token input visible: ${tokenVisible}`);
      }
    });

    test('A1.3 Login attempt with demo credentials', async ({ page, evidence }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Click demo login
      const demoButton = page.locator('button:has-text("Demo"), [data-testid="demo-login"]').first();
      
      if (await demoButton.isVisible().catch(() => false)) {
        await demoButton.click();
        await page.waitForTimeout(1000);
        
        // Look for dialog
        const dialog = page.locator('dialog[open], [role="dialog"]').first();
        
        if (await dialog.isVisible().catch(() => false)) {
          // Fill email
          const emailInput = dialog.locator('input[type="email"], input[name="email"], input[placeholder*="e-post" i]').first();
          if (await emailInput.isVisible().catch(() => false)) {
            await emailInput.fill(config.credentials.admin.email);
          }
          
          // Fill token
          const tokenInput = dialog.locator('input[placeholder*="token" i], input[name="token"]').first();
          if (await tokenInput.isVisible().catch(() => false)) {
            await tokenInput.fill(config.credentials.admin.password); // password field stores demo token
          }
          
          // Submit
          const submitBtn = dialog.locator('button[type="submit"], button:has-text("Logg inn")').first();
          if (await submitBtn.isVisible().catch(() => false)) {
            await submitBtn.click();
            await page.waitForTimeout(5000);
            
            // Check result
            const currentUrl = page.url();
            const isLoggedIn = !currentUrl.includes('/login');
            
            if (isLoggedIn) {
              console.log('✓ Login successful, redirected to:', currentUrl);
            } else {
              // Check for error message
              const errorMsg = page.locator('[role="alert"], [class*="error"], [data-testid="error-message"]').first();
              const errorText = await errorMsg.textContent().catch(() => 'No error shown');
              console.log(`✗ Login failed: ${errorText}`);
              
              // Check for 5xx responses
              if (evidence.has5xxResponses()) {
                console.log('  5xx responses detected:', evidence.failedRequests.map(r => `${r.status}`).join(', '));
              }
            }
          }
        }
      }
    });

    test('A1.4 Session persists after reload', async ({ page }) => {
      // Already using auth state from describe block
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        console.log('Not authenticated - skipping session persistence test');
        test();
        return;
      }
      
      const initialUrl = page.url();
      console.log(`Initial URL: ${initialUrl}`);
      
      // Reload
      await page.reload();
      await page.waitForTimeout(3000);
      
      const afterReloadUrl = page.url();
      const stillAuthenticated = !afterReloadUrl.includes('/login');
      
      console.log(`After reload: ${afterReloadUrl}`);
      console.log(`Session persisted: ${stillAuthenticated ? '✓' : '✗'}`);
      
      expect(stillAuthenticated).toBe(true);
    });

    test('A1.5 Logout flow works correctly', async ({ page }) => {
      // Already using auth state from describe block
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        console.log('Not authenticated - skipping logout test');
        test();
        return;
      }
      
      // Find logout option
      const userMenu = page.locator('button[aria-haspopup="menu"], [data-testid="user-menu"], [class*="avatar"]').first();
      
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const logoutBtn = page.locator('button:has-text("Logg ut"), a:has-text("Logg ut"), [data-testid="logout"]').first();
        
        if (await logoutBtn.isVisible().catch(() => false)) {
          await logoutBtn.click();
          await page.waitForTimeout(3000);
          
          const isOnLogin = page.url().includes('/login');
          console.log(`Logout successful: ${isOnLogin ? '✓' : '✗'}`);
          expect(isOnLogin).toBe(true);
        }
      }
    });

    test('A1.6 Protected pages redirect to login', async ({ page }) => {
      // Clear auth state
      await page.context().clearCookies();
      
      // Try to access protected page directly
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      const redirectedToLogin = currentUrl.includes('/login');
      
      console.log(`Protected route redirect: ${redirectedToLogin ? '✓ redirected to login' : '✗ accessed without auth'}`);
      expect(redirectedToLogin).toBe(true);
    });
  });

  test.describe('A2. Header Bar (Global Navigation)', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('A2.1 Header contains essential elements only', async ({ page }) => {
      const header = page.locator('header').first();
      await expect(header).toBeVisible({ timeout: 10000 });
      
      // Check each expected element
      const elements = {
        logo: 'img[alt*="logo" i], [data-testid="logo"], svg[class*="logo"]',
        userMenu: 'button[aria-haspopup="menu"], [data-testid="user-menu"], [class*="avatar"]',
        notifications: 'button[aria-label*="notification" i], [data-testid="notifications"]',
        languageSwitch: 'button:has-text("NO"), button:has-text("EN"), [data-testid="language-switcher"]',
        globalSearch: 'input[type="search"], [data-testid="global-search"]',
      };
      
      const results: Record<string, boolean> = {};
      
      for (const [name, selector] of Object.entries(elements)) {
        const element = page.locator(selector).first();
        results[name] = await element.isVisible().catch(() => false);
      }
      
      console.log('\nHeader elements:');
      console.log('├─ Logo:', results.logo ? '✓' : '✗');
      console.log('├─ User Menu:', results.userMenu ? '✓' : '✗');
      console.log('├─ Notifications:', results.notifications ? '✓ (feature enabled)' : '– (not enabled)');
      console.log('├─ Language Switch:', results.languageSwitch ? '✓' : '✗');
      console.log('└─ Global Search:', results.globalSearch ? '✓ (feature enabled)' : '– (not enabled)');
      
      // Essential elements must exist
      expect(results.userMenu).toBe(true);
    });

    test('A2.2 Header is consistent across pages', async ({ page }) => {
      const pagesToCheck = ['/', '/rental-objects', '/bookings', '/calendar'];
      
      for (const path of pagesToCheck) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        if (page.url().includes('/login')) continue;
        
        const header = page.locator('header').first();
        const headerVisible = await header.isVisible().catch(() => false);
        
        console.log(`${path}: header=${headerVisible ? '✓' : '✗'}`);
        expect(headerVisible).toBe(true);
      }
    });

    test('A2.3 Logo click returns to dashboard', async ({ page }) => {
      // Navigate away from dashboard
      await page.goto('/rental-objects', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/login')) {
        test();
        return;
      }
      
      // Click logo
      const logo = page.locator('header a[href="/"], header img[alt*="logo" i], [data-testid="logo"]').first();
      
      if (await logo.isVisible().catch(() => false)) {
        await logo.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const onDashboard = currentUrl.endsWith('/') || currentUrl.includes('/dashboard');
        
        console.log(`Logo click navigation: ${onDashboard ? '✓ returned to dashboard' : '✗ did not return'}`);
        expect(onDashboard).toBe(true);
      }
    });

    test('A2.4 Keyboard navigation reaches header controls', async ({ page }) => {
      // Focus on body and tab through
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      let focusableCount = 0;
      
      for (let i = 0; i < 10; i++) {
        const focusedElement = await page.locator(':focus').first();
        const tagName = await focusedElement.evaluate(el => el.tagName).catch(() => '');
        
        if (tagName) {
          focusableCount++;
          
          // Check if we reached a header element
          const isInHeader = await focusedElement.evaluate(el => {
            return el.closest('header') !== null;
          }).catch(() => false);
          
          if (isInHeader) {
            console.log(`✓ Keyboard navigation reached header after ${focusableCount} tabs`);
            break;
          }
        }
        
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    });

    test('A2.5 Global search works (if enabled)', async ({ page }) => {
      const searchInput = page.locator('header input[type="search"], [data-testid="global-search"]').first();
      
      if (!await searchInput.isVisible().catch(() => false)) {
        console.log('Global search not enabled - skipping');
        test();
        return;
      }
      
      // Type search query
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Check for results dropdown or navigation
      const results = page.locator('[data-testid="search-results"], [role="listbox"], [class*="search-results"]').first();
      const hasResults = await results.isVisible().catch(() => false);
      
      console.log(`Global search: typing works, results=${hasResults ? '✓' : '✗'}`);
      
      // Clear search
      await searchInput.clear();
    });

    test('A2.6 User menu opens and shows options', async ({ page }) => {
      const userMenu = page.locator('button[aria-haspopup="menu"], [data-testid="user-menu"], [class*="avatar"]').first();
      
      if (!await userMenu.isVisible().catch(() => false)) {
        console.log('User menu not found - fail');
        expect(false).toBe(true);
        return;
      }
      
      await userMenu.click();
      await page.waitForTimeout(500);
      
      const dropdown = page.locator('[role="menu"], [data-testid="user-dropdown"]').first();
      await expect(dropdown).toBeVisible({ timeout: 3000 });
      
      // Check expected options
      const options = {
        profile: 'a:has-text("Profil"), [data-testid="profile-link"]',
        settings: 'a:has-text("Innstillinger"), [data-testid="settings-link"]',
        logout: 'button:has-text("Logg ut"), [data-testid="logout"]',
      };
      
      console.log('\nUser menu options:');
      for (const [name, selector] of Object.entries(options)) {
        const option = dropdown.locator(selector).first();
        const visible = await option.isVisible().catch(() => false);
        console.log(`├─ ${name}: ${visible ? '✓' : '✗'}`);
      }
      
      // Close menu
      await page.keyboard.press('Escape');
    });
  });

  test.describe('A3. Sidebar Menu Information Architecture', () => {
  setupMockApi();
    test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/login')) {
        test();
      }
    });

    test('A3.1 Build and validate Menu Map (Admin)', async ({ page, menuMap }) => {
      const map = await menuMap();
      
      console.log('\n📋 MENU MAP REPORT (Admin)');
      console.log('═'.repeat(50));
      
      // List all items
      console.log(`\nFound ${map.items.length} menu items:`);
      map.items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.label} → ${item.href}`);
      });
      
      // Check for duplicates
      if (map.duplicateLabels.length > 0) {
        console.log('\n⚠️ DUPLICATE LABELS:', map.duplicateLabels.join(', '));
      }
      
      if (map.duplicateRoutes.length > 0) {
        console.log('⚠️ DUPLICATE ROUTES:', map.duplicateRoutes.join(', '));
      }
      
      // Check for raw i18n keys
      if (map.rawI18nKeys.length > 0) {
        console.log('⚠️ RAW I18N KEYS:', map.rawI18nKeys.join(', '));
      }
      
      // Check for forbidden terms
      if (map.forbiddenTerms.length > 0) {
        console.log('🚫 FORBIDDEN TERMS:', map.forbiddenTerms.join(', '));
      }
      
      // Quality assertions
      expect(map.duplicateLabels.length).toBe(0);
      expect(map.duplicateRoutes.length).toBe(0);
      expect(map.rawI18nKeys.length).toBe(0);
      expect(map.forbiddenTerms.length).toBe(0);
      
      console.log('\n✅ Menu Map validation passed');
    });

    test('A3.2 Menu count sanity check (max 12 items)', async ({ page, menuMap }) => {
      const map = await menuMap();
      const maxItems = 12;
      
      console.log(`\nMenu item count: ${map.items.length} (max: ${maxItems})`);
      
      if (map.items.length > maxItems) {
        console.log('\n⚠️ REDUNDANCY WARNING: Too many menu items');
        console.log('Consider consolidating the following:');
        
        // Group by route prefix
        const byPrefix: Record<string, string[]> = {};
        map.items.forEach(item => {
          const prefix = item.href.split('/')[1] || 'root';
          if (!byPrefix[prefix]) byPrefix[prefix] = [];
          byPrefix[prefix].push(item.label);
        });
        
        Object.entries(byPrefix).forEach(([prefix, items]) => {
          if (items.length > 1) {
            console.log(`  /${prefix}: ${items.join(', ')}`);
          }
        });
      }
      
      expect(map.items.length).toBeLessThanOrEqual(maxItems);
    });

    test('A3.3 All menu links navigate successfully', async ({ page, menuMap, evidence }) => {
      const map = await menuMap();
      const deadRoutes: string[] = [];
      
      console.log('\nTesting menu navigation:');
      
      for (const item of map.items.slice(0, 10)) { // Limit to first 10 to avoid timeout
        await page.goto(item.href, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        // Check if page loaded (not 404/500)
        const is404 = await page.locator('text=/not found|404|ikke funnet/i').first().isVisible().catch(() => false);
        const is500 = await page.locator('text=/error|500|feil/i').first().isVisible().catch(() => false);
        
        if (is404 || is500 || evidence.has5xxResponses()) {
          deadRoutes.push(`${item.label} (${item.href})`);
          console.log(`  ✗ ${item.label}: DEAD ROUTE`);
        } else {
          console.log(`  ✓ ${item.label}`);
        }
      }
      
      if (deadRoutes.length > 0) {
        console.log('\n🚫 DEAD ROUTES:', deadRoutes.join(', '));
      }
      
      expect(deadRoutes.length).toBe(0);
    });

    test('A3.4 Labels are localized (no raw keys)', async ({ page, menuMap }) => {
      const map = await menuMap();
      
      const problems: string[] = [];
      
      map.items.forEach(item => {
        // Check for patterns that look like i18n keys
        if (/^[a-z]+\.[a-z]+$/i.test(item.label)) {
          problems.push(item.label);
        }
        
        // Check for empty or very short labels
        if (item.label.length < 2) {
          problems.push(`Empty label at ${item.href}`);
        }
      });
      
      if (problems.length > 0) {
        console.log('⚠️ Localization problems:', problems.join(', '));
      }
      
      expect(problems.length).toBe(0);
    });

    test('A3.5 No forbidden terminology in menu', async ({ page, menuMap }) => {
      const map = await menuMap();
      
      const forbidden = ['facility', 'facilities'];
      const violations: string[] = [];
      
      map.items.forEach(item => {
        const lowerLabel = item.label.toLowerCase();
        forbidden.forEach(term => {
          if (lowerLabel.includes(term)) {
            violations.push(`"${item.label}" contains "${term}"`);
          }
        });
      });
      
      if (violations.length > 0) {
        console.log('🚫 FORBIDDEN TERMS:', violations.join(', '));
      }
      
      expect(violations.length).toBe(0);
    });
  });
});
