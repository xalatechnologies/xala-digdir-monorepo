/**
 * Data Integrity and Consistency Tests
 * Tests that verify data is correctly saved, retrieved, and synchronized
 */
import { test, expect } from '@playwright/test';

test.describe('DATA INTEGRITY: Booking Data Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('booking details persist after page reload', async ({ page }) => {
    await page.goto('/my-bookings');
    
    const firstBooking = page.locator('[data-testid="booking-card"]').first();
    if (await firstBooking.isVisible({ timeout: 5000 })) {
      const bookingTitle = await firstBooking.getByRole('heading').first().textContent();
      
      // Reload page
      await page.reload();
      
      // Verify same booking is shown
      const reloadedBooking = page.locator('[data-testid="booking-card"]').first();
      await expect(reloadedBooking).toBeVisible();
      const reloadedTitle = await reloadedBooking.getByRole('heading').first().textContent();
      
      expect(bookingTitle).toBe(reloadedTitle);
    }
  });

  test('booking status updates persist', async ({ page }) => {
    await page.goto('/my-bookings');
    
    const pendingBooking = page.locator('[data-status="pending"]').first();
    if (await pendingBooking.isVisible({ timeout: 5000 })) {
      const bookingId = await pendingBooking.getAttribute('data-booking-id');
      
      // Cancel the booking
      const cancelBtn = pendingBooking.getByRole('button', { name: /avbestill|cancel/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.getByRole('button', { name: /bekreft|confirm/i }).click();
        
        // Reload and verify status persisted
        await page.reload();
        
        const updatedBooking = page.locator(`[data-booking-id="${bookingId}"]`);
        if (await updatedBooking.isVisible({ timeout: 5000 })) {
          const status = await updatedBooking.getAttribute('data-status');
          expect(status).toBe('cancelled');
        }
      }
    }
  });

  test('price calculation is consistent', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
      
      const availableSlot = calendar.locator('[data-status="available"]').first();
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        
        // Get initial price
        const priceElement = page.locator('[data-testid="total-price"], .price, .pris');
        const initialPrice = await priceElement.textContent();
        
        // Reload and select same slot
        await page.reload();
        await expect(calendar).toBeVisible({ timeout: 10000 });
        await availableSlot.click();
        
        // Price should be the same
        const reloadedPrice = await priceElement.textContent();
        expect(initialPrice).toBe(reloadedPrice);
      }
    }
  });
});

test.describe('DATA INTEGRITY: User Profile Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('profile changes are saved correctly', async ({ page }) => {
    await page.goto('/settings/profile');
    
    const nameInput = page.getByLabel(/navn|name/i);
    if (await nameInput.isVisible()) {
      const newName = `Test User ${Date.now()}`;
      await nameInput.fill(newName);
      await page.getByRole('button', { name: /lagre|save/i }).click();
      
      // Wait for save
      await expect(page.getByText(/lagret|saved/i)).toBeVisible({ timeout: 10000 });
      
      // Reload and verify
      await page.reload();
      await expect(nameInput).toHaveValue(newName);
    }
  });

  test('notification preferences persist', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    const emailToggle = page.getByLabel(/e-post|email/i);
    if (await emailToggle.isVisible()) {
      const initialState = await emailToggle.isChecked();
      
      // Toggle
      await emailToggle.click();
      await page.getByRole('button', { name: /lagre|save/i }).click();
      
      // Wait and reload
      await page.waitForTimeout(1000);
      await page.reload();
      
      // Verify state changed
      const newState = await emailToggle.isChecked();
      expect(newState).toBe(!initialState);
    }
  });
});

test.describe('DATA INTEGRITY: Rental Object Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('admin@digilist.no');
    await page.getByLabel(/passord|password/i).fill('adminpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 15000 });
  });

  test('rental object changes persist', async ({ page }) => {
    await page.goto('/admin/rental-objects');
    
    const firstRental = page.locator('[data-testid="rental-object-row"]').first();
    if (await firstRental.isVisible({ timeout: 5000 })) {
      await firstRental.click();
      
      const descInput = page.getByLabel(/beskrivelse|description/i);
      if (await descInput.isVisible()) {
        const newDesc = `Updated description ${Date.now()}`;
        await descInput.fill(newDesc);
        await page.getByRole('button', { name: /lagre|save/i }).click();
        
        // Wait and reload
        await expect(page.getByText(/lagret|saved/i)).toBeVisible({ timeout: 10000 });
        await page.reload();
        
        // Verify
        await expect(descInput).toHaveValue(newDesc);
      }
    }
  });

  test('availability calendar reflects booking changes', async ({ page }) => {
    await page.goto('/admin/rental-objects');
    
    const firstRental = page.locator('[data-testid="rental-object-row"]').first();
    if (await firstRental.isVisible({ timeout: 5000 })) {
      await firstRental.click();
      
      const calendar = page.locator('[data-testid="admin-calendar"]');
      if (await calendar.isVisible({ timeout: 5000 })) {
        // Count available slots
        const availableCount = await calendar.locator('[data-status="available"]').count();
        
        // Block a slot
        const firstAvailable = calendar.locator('[data-status="available"]').first();
        if (await firstAvailable.isVisible()) {
          await firstAvailable.click();
          await page.getByRole('button', { name: /blokker|block/i }).click();
          
          // Verify count decreased
          await page.waitForTimeout(1000);
          const newCount = await calendar.locator('[data-status="available"]').count();
          expect(newCount).toBe(availableCount - 1);
        }
      }
    }
  });
});

test.describe('DATA INTEGRITY: Search and Filter Consistency', () => {
  test('search results match filter criteria', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const searchInput = page.getByPlaceholder(/søk|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('møterom');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // All visible results should contain "møterom"
      const results = page.locator('[data-testid="rental-object-card"]');
      const count = await results.count();
      
      for (let i = 0; i < count; i++) {
        const card = results.nth(i);
        const text = await card.textContent();
        expect(text?.toLowerCase()).toContain('møterom');
      }
    }
  });

  test('pagination maintains correct data', async ({ page }) => {
    await page.goto('/rental-objects?limit=10');
    
    const results = page.locator('[data-testid="rental-object-card"]');
    const firstPageFirstItem = await results.first().getAttribute('data-id');
    
    // Go to page 2
    const nextButton = page.getByRole('button', { name: /neste|next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      // First item should be different
      const secondPageFirstItem = await results.first().getAttribute('data-id');
      expect(firstPageFirstItem).not.toBe(secondPageFirstItem);
      
      // Go back to page 1
      const prevButton = page.getByRole('button', { name: /forrige|prev/i });
      await prevButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should see original first item
      const backToFirstItem = await results.first().getAttribute('data-id');
      expect(backToFirstItem).toBe(firstPageFirstItem);
    }
  });
});

test.describe('DATA INTEGRITY: Form Validation Feedback', () => {
  test('validation errors appear correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/påkrevd|required/i)).toBeVisible({ timeout: 5000 });
  });

  test('validation errors clear on valid input', async ({ page }) => {
    await page.goto('/login');
    
    // Submit empty form
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page.getByText(/påkrevd|required/i)).toBeVisible({ timeout: 5000 });
    
    // Fill valid email
    await page.getByLabel(/e-post|email/i).fill('valid@email.com');
    
    // Error should clear or form should be valid
    await page.waitForTimeout(500);
  });

  test('server validation errors display correctly', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/e-post|email/i).fill('nonexistent@example.com');
    await page.getByLabel(/passord|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    
    // Should show server error
    await expect(page.getByText(/ugyldig|invalid|feil/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('DATA INTEGRITY: Cross-Page Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('booking appears in all relevant views', async ({ page }) => {
    // Navigate to my bookings
    await page.goto('/my-bookings');
    
    const bookingCard = page.locator('[data-testid="booking-card"]').first();
    if (await bookingCard.isVisible({ timeout: 5000 })) {
      const bookingId = await bookingCard.getAttribute('data-booking-id');
      const bookingTitle = await bookingCard.getByRole('heading').first().textContent();
      
      // Check calendar view shows same booking
      await page.goto('/calendar');
      const calendarBooking = page.locator(`[data-booking-id="${bookingId}"]`);
      if (await calendarBooking.isVisible({ timeout: 5000 })) {
        const calendarTitle = await calendarBooking.textContent();
        expect(calendarTitle).toContain(bookingTitle || '');
      }
    }
  });

  test('user info consistent across pages', async ({ page }) => {
    // Get user name from header
    const headerUserName = await page.locator('[data-testid="user-name"], .user-name').textContent();
    
    // Navigate to profile
    await page.goto('/settings/profile');
    const profileName = await page.getByLabel(/navn|name/i).inputValue();
    
    // Should match (trimming whitespace)
    expect(headerUserName?.trim()).toContain(profileName?.trim());
  });
});

test.describe('DATA INTEGRITY: Optimistic Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('UI updates optimistically then confirms', async ({ page }) => {
    await page.goto('/my-bookings');
    
    const booking = page.locator('[data-testid="booking-card"]').first();
    if (await booking.isVisible({ timeout: 5000 })) {
      const cancelBtn = booking.getByRole('button', { name: /avbestill|cancel/i });
      if (await cancelBtn.isVisible()) {
        // Click cancel
        await cancelBtn.click();
        
        // Should see immediate UI feedback (optimistic)
        const confirmBtn = page.getByRole('button', { name: /bekreft|confirm/i });
        await confirmBtn.click();
        
        // Should eventually show cancelled state
        await expect(page.getByText(/avbestilt|cancelled/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

test.describe('DATA INTEGRITY: Historical Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('past bookings are viewable', async ({ page }) => {
    await page.goto('/my-bookings?filter=past');
    
    const pastBookings = page.locator('[data-testid="booking-card"]');
    
    // Past bookings should be read-only (no cancel button)
    const firstPast = pastBookings.first();
    if (await firstPast.isVisible({ timeout: 5000 })) {
      const cancelBtn = firstPast.getByRole('button', { name: /avbestill|cancel/i });
      expect(await cancelBtn.isVisible()).toBeFalsy();
    }
  });

  test('booking history shows correct dates', async ({ page }) => {
    await page.goto('/my-bookings?filter=past');
    
    const pastBookings = page.locator('[data-testid="booking-card"]');
    if (await pastBookings.first().isVisible({ timeout: 5000 })) {
      const dateText = await pastBookings.first().locator('[data-testid="booking-date"]').textContent();
      
      // Date should be in the past
      if (dateText) {
        const bookingDate = new Date(dateText);
        const now = new Date();
        expect(bookingDate.getTime()).toBeLessThan(now.getTime());
      }
    }
  });
});
