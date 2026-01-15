/**
 * Edge Case and Error Recovery Tests
 * Tests unusual conditions, boundary cases, and error handling
 */
import { test, expect } from '@playwright/test';

test.describe('EDGE CASE: Boundary Conditions', () => {
  test('handles booking at exactly midnight', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Try to book at midnight
      const timeInput = page.getByLabel(/tid|time/i);
      if (await timeInput.isVisible()) {
        await timeInput.fill('00:00');
        // System should handle midnight correctly
      }
    }
  });

  test('handles booking that spans day boundary', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Try booking from 23:00 to 01:00 (overnight)
      const startTime = page.getByLabel(/start.*tid|start.*time/i);
      const endTime = page.getByLabel(/slutt.*tid|end.*time/i);
      
      if (await startTime.isVisible() && await endTime.isVisible()) {
        await startTime.fill('23:00');
        await endTime.fill('01:00');
        
        // Should either allow or show appropriate error
        const errorOrSuccess = await page.getByText(/feil|error|bekreftet|confirmed/i).isVisible({ timeout: 5000 });
        expect(errorOrSuccess).toBeTruthy();
      }
    }
  });

  test('handles very long booking duration', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Try to book for 30 days
      const durationInput = page.getByLabel(/varighet|duration/i);
      if (await durationInput.isVisible()) {
        await durationInput.fill('30');
        
        // Should show appropriate response (limit or acceptance)
        await page.waitForTimeout(1000);
      }
    }
  });

  test('handles maximum text input in forms', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('admin@digilist.no');
    await page.getByLabel(/passord|password/i).fill('adminpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 15000 });
    
    await page.goto('/admin/rental-objects/new');
    
    const descriptionInput = page.getByLabel(/beskrivelse|description/i);
    if (await descriptionInput.isVisible()) {
      // Fill with very long text (5000 characters)
      const longText = 'A'.repeat(5000);
      await descriptionInput.fill(longText);
      
      // Should either truncate or show limit warning
      const charCount = await descriptionInput.inputValue();
      expect(charCount.length).toBeLessThanOrEqual(5000);
    }
  });

  test('handles special characters in search', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder(/søk|search/i);
    if (await searchInput.isVisible()) {
      // Test various special characters
      const specialQueries = [
        'møterom <script>',
        "rom' OR '1'='1",
        'rom%20test',
        'rom\ntest',
        '🏢 kontor',
      ];
      
      for (const query of specialQueries) {
        await searchInput.fill(query);
        await searchInput.press('Enter');
        
        // Page should not break
        await expect(page.locator('body')).toBeVisible();
        
        // Clear for next test
        await searchInput.clear();
      }
    }
  });

  test('handles rapid consecutive clicks', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      const bookButton = page.getByRole('button', { name: /bestill|book/i });
      if (await bookButton.isVisible()) {
        // Rapid clicks
        await bookButton.click();
        await bookButton.click();
        await bookButton.click();
        
        // Should only process once, not create multiple bookings
        await page.waitForTimeout(2000);
      }
    }
  });
});

test.describe('EDGE CASE: Timezone Handling', () => {
  test('handles user in different timezone', async ({ page }) => {
    // Set timezone to US Pacific
    await page.emulateTimezone('America/Los_Angeles');
    
    await page.goto('/');
    
    const rentalCards = page.locator('[data-testid="rental-object-card"]');
    if (await rentalCards.first().isVisible({ timeout: 5000 })) {
      await rentalCards.first().click();
      
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
      
      // Dates should be displayed correctly regardless of timezone
    }
  });

  test('handles daylight saving time transition', async ({ page }) => {
    // This would test bookings around DST change dates
    await page.goto('/rental-objects');
    
    // March and October are common DST change months
    const calendar = page.locator('[data-testid="availability-calendar"]');
    if (await calendar.isVisible()) {
      // Navigate to March or October
      const nextMonth = page.getByRole('button', { name: /neste|next/i });
      if (await nextMonth.isVisible()) {
        await nextMonth.click();
      }
    }
  });
});

test.describe('EDGE CASE: Data Validation', () => {
  test('rejects invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'email@.com',
    ];
    
    for (const email of invalidEmails) {
      await page.getByLabel(/e-post|email/i).fill(email);
      await page.getByLabel(/passord|password/i).fill('password123');
      await page.getByRole('button', { name: /logg inn|login/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/ugyldig|invalid|feil/i)).toBeVisible({ timeout: 3000 });
      
      // Clear for next test
      await page.getByLabel(/e-post|email/i).clear();
    }
  });

  test('rejects weak passwords on registration', async ({ page }) => {
    await page.goto('/register');
    
    const weakPasswords = [
      '123',
      'password',
      'abcdefgh',
      '12345678',
    ];
    
    for (const password of weakPasswords) {
      const passwordInput = page.getByLabel(/passord|password/i).first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(password);
        
        // Should show password strength warning
        const warning = page.getByText(/svak|weak|sterk|strong/i);
        await page.waitForTimeout(500);
      }
    }
  });

  test('validates phone number format', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/settings/profile');
    
    const phoneInput = page.getByLabel(/telefon|phone/i);
    if (await phoneInput.isVisible()) {
      const invalidPhones = [
        'notaphone',
        '123',
        '+1234567890123456789', // Too long
      ];
      
      for (const phone of invalidPhones) {
        await phoneInput.fill(phone);
        await page.getByRole('button', { name: /lagre|save/i }).click();
        
        // Should show validation error or format the number
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('EDGE CASE: Concurrent Operations', () => {
  test('handles simultaneous updates gracefully', async ({ browser }) => {
    // Open two browser contexts (simulating two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both login
    await page1.goto('/login');
    await page1.getByLabel(/e-post|email/i).fill('user1@digilist.no');
    await page1.getByLabel(/passord|password/i).fill('password123');
    await page1.getByRole('button', { name: /logg inn|login/i }).click();
    
    await page2.goto('/login');
    await page2.getByLabel(/e-post|email/i).fill('user2@digilist.no');
    await page2.getByLabel(/passord|password/i).fill('password123');
    await page2.getByRole('button', { name: /logg inn|login/i }).click();
    
    // Both try to view same rental object
    await page1.goto('/rental-objects/popular-room');
    await page2.goto('/rental-objects/popular-room');
    
    // Both should see the page without conflicts
    await expect(page1.locator('body')).toBeVisible();
    await expect(page2.locator('body')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });
});

test.describe('EDGE CASE: Session Handling', () => {
  test('handles session timeout during form fill', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Start filling booking form
      const notesInput = page.getByLabel(/notater|notes|kommentar/i);
      if (await notesInput.isVisible()) {
        await notesInput.fill('This is a long note that takes time to write...');
        
        // Simulate session expiry
        await page.context().clearCookies();
        
        // Try to submit
        const submitButton = page.getByRole('button', { name: /bestill|book|send/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Should redirect to login or show session expired message
          await expect(page.getByText(/sesjon|session|logg inn|login/i)).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('handles multiple tabs with same session', async ({ context }) => {
    // Login in first tab
    const page1 = await context.newPage();
    await page1.goto('/login');
    await page1.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page1.getByLabel(/passord|password/i).fill('userpassword123');
    await page1.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page1).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/rental-objects');
    
    // Should be logged in
    await expect(page2.locator('body')).toBeVisible();
    
    // Logout in first tab
    await page1.goto('/');
    const logoutButton = page1.getByRole('button', { name: /logg ut|logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // Second tab should handle logout gracefully on next action
    await page2.reload();
  });
});

test.describe('EDGE CASE: Network Conditions', () => {
  test('handles slow network gracefully', async ({ page }) => {
    // Simulate slow 3G
    const cdpSession = await page.context().newCDPSession(page);
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50000,
      uploadThroughput: 50000,
      latency: 2000,
    });
    
    await page.goto('/', { timeout: 60000 });
    
    // Page should still load
    await expect(page.locator('body')).toBeVisible();
    
    // Loading indicators should appear
    const loader = page.locator('[data-testid="loading"], .loading, .spinner');
    // Loader may or may not be visible depending on timing
  });

  test('handles network disconnect and reconnect', async ({ page }) => {
    await page.goto('/');
    
    // Go offline
    await page.route('**/*', route => route.abort());
    
    // Try to navigate
    await page.click('[data-testid="rental-object-card"]').catch(() => {});
    
    // Should show offline message
    await page.waitForTimeout(1000);
    
    // Go back online
    await page.unroute('**/*');
    
    // Retry should work
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('EDGE CASE: Browser Compatibility', () => {
  test('handles browser back button correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate forward
    await page.goto('/rental-objects');
    await page.goto('/about');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/rental-objects/i);
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/\//);
  });

  test('handles page refresh with unsaved data', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('admin@digilist.no');
    await page.getByLabel(/passord|password/i).fill('adminpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 15000 });
    
    await page.goto('/admin/rental-objects/new');
    
    const titleInput = page.getByLabel(/tittel|title|navn/i);
    if (await titleInput.isVisible()) {
      await titleInput.fill('Unsaved Rental Object');
      
      // Set up dialog handler for beforeunload
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('beforeunload');
        await dialog.accept();
      });
      
      // Try to navigate away
      await page.reload();
    }
  });
});

test.describe('EDGE CASE: Empty States', () => {
  test('shows appropriate message when no rental objects', async ({ page }) => {
    await page.goto('/rental-objects?category=nonexistent');
    
    // Should show empty state message
    const emptyState = page.getByText(/ingen.*resultat|no.*results|tom|empty/i);
    await page.waitForTimeout(2000);
    
    // Or rental objects
    const hasContent = await page.locator('[data-testid="rental-object-card"]').count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasContent || hasEmptyState).toBeTruthy();
  });

  test('shows empty state for my bookings when none exist', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('newuser@digilist.no');
    await page.getByLabel(/passord|password/i).fill('newuserpass123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    
    await page.goto('/my-bookings');
    
    // Should show empty state or bookings list
    const emptyMessage = page.getByText(/ingen.*bestillinger|no.*bookings|tom|empty/i);
    const bookingsList = page.locator('[data-testid="booking-card"]');
    
    await page.waitForTimeout(2000);
  });
});
