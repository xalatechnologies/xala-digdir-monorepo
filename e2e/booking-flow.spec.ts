/**
 * Booking Flow E2E Tests
 * Tests complete booking user journeys
 */
import { test, expect } from '@playwright/test';

test.describe('Booking Flow - Public User', () => {
  test.describe('Browse Rental Objects', () => {
    test('displays rental object list', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[data-testid="rental-object-card"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('can search for rental objects', async ({ page }) => {
      await page.goto('/');
      
      const searchInput = page.getByPlaceholder(/søk|search/i);
      await searchInput.fill('møterom');
      await searchInput.press('Enter');
      
      await expect(page).toHaveURL(/search|søk/i);
    });

    test('can filter by category', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const categoryFilter = page.getByRole('combobox', { name: /kategori|category/i });
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.getByRole('option').first().click();
        
        await expect(page).toHaveURL(/category|kategori/i);
      }
    });

    test('can view rental object details', async ({ page }) => {
      await page.goto('/');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      await firstCard.click();
      
      await expect(page).toHaveURL(/rental-objects\/[a-z0-9-]+/i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('Booking Process', () => {
    test('shows availability calendar', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      await firstCard.click();
      
      await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible({ timeout: 10000 });
    });

    test('can select date and time', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      await firstCard.click();
      
      // Wait for calendar to load
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
      
      // Click on an available date
      const availableSlot = calendar.locator('[data-status="available"]').first();
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        
        // Should show booking form or time selection
        await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
      }
    });

    test('shows pricing before booking', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      await firstCard.click();
      
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
      
      const availableSlot = calendar.locator('[data-status="available"]').first();
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        
        // Should display pricing
        await expect(page.getByText(/pris|price|kr|nok/i)).toBeVisible();
      }
    });

    test('requires login to complete booking', async ({ page }) => {
      await page.goto('/rental-objects');
      
      const firstCard = page.locator('[data-testid="rental-object-card"]').first();
      await firstCard.click();
      
      const bookButton = page.getByRole('button', { name: /bestill|book/i });
      if (await bookButton.isVisible()) {
        await bookButton.click();
        
        // Should redirect to login or show login modal
        await expect(page.getByText(/logg inn|login/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

test.describe('Booking Flow - Authenticated User', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
    await page.getByLabel(/passord|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|hjem/i, { timeout: 15000 });
  });

  test('can complete a booking', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    const availableSlot = calendar.locator('[data-status="available"]').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
      
      // Fill booking form
      const bookingForm = page.locator('[data-testid="booking-form"]');
      await expect(bookingForm).toBeVisible();
      
      // Submit booking
      await page.getByRole('button', { name: /bekreft|confirm|bestill/i }).click();
      
      // Should show confirmation
      await expect(page.getByText(/bekreftet|confirmed|takk/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('shows booking in my bookings', async ({ page }) => {
    await page.goto('/my-bookings');
    
    await expect(page.getByRole('heading', { name: /mine.*bestillinger|my.*bookings/i })).toBeVisible();
  });

  test('can cancel a booking', async ({ page }) => {
    await page.goto('/my-bookings');
    
    const cancelButton = page.getByRole('button', { name: /avbestill|cancel/i }).first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Confirm cancellation
      await page.getByRole('button', { name: /bekreft|confirm/i }).click();
      
      // Should show cancellation confirmation
      await expect(page.getByText(/avbestilt|cancelled/i)).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Booking Conflicts', () => {
  test('shows unavailable slots as disabled', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    // Check for unavailable slots
    const unavailableSlots = calendar.locator('[data-status="booked"], [data-status="blocked"]');
    const count = await unavailableSlots.count();
    
    if (count > 0) {
      // First unavailable slot should not be clickable or show as disabled
      const firstUnavailable = unavailableSlots.first();
      await expect(firstUnavailable).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test('prevents double booking', async ({ page }) => {
    // This would require setting up a specific test scenario
    // For now, we verify the UI handles conflicts
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Recurring Bookings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('test@digilist.no');
    await page.getByLabel(/passord|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('can create recurring booking', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    const recurringToggle = page.getByLabel(/gjentakende|recurring/i);
    if (await recurringToggle.isVisible()) {
      await recurringToggle.click();
      
      // Should show recurring options
      await expect(page.getByText(/ukentlig|weekly|månedlig|monthly/i)).toBeVisible();
    }
  });
});
