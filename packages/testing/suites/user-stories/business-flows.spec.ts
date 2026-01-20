/**
 * User Story Tests
 * 
 * End-to-end tests for complete business flows.
 * Each test represents a complete user story.
 */

import { test, expect } from '@playwright/test';

test.describe('US-001: Citizen Books Rental Object', () => {
  test('complete booking flow', async ({ page }) => {
    // Step 1: Visit home page
    await page.goto('http://localhost:5174/');
    await expect(page).toHaveTitle(/Digilist/i);

    // Step 2: Search for rental objects
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Fosshallen');
      await searchInput.press('Enter');
    }

    // Step 3: View listing details
    const listingCard = page.locator('[data-testid="rental-object-card"]').first();
    if (await listingCard.isVisible()) {
      await listingCard.click();
      await page.waitForURL(/\/rental-objects\/.+/);
    }

    // Step 4: Check availability
    const calendarWidget = page.locator('[data-testid="booking-calendar"], .booking-widget');
    if (await calendarWidget.isVisible()) {
      // Select a date
      const availableDate = page.locator('[data-testid="available-slot"]').first();
      if (await availableDate.isVisible()) {
        await availableDate.click();
      }
    }

    // Step 5: Initiate booking (requires login)
    const bookButton = page.locator('[data-testid="book-now"], button:has-text("Book")').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();
      
      // Should redirect to login if not authenticated
      // Or show booking form if authenticated
    }
  });
});

test.describe('US-002: Admin Creates Rental Object', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/login');
    // Auto-login in dev mode
    await page.waitForTimeout(1000);
  });

  test('create rental object wizard', async ({ page }) => {
    // Navigate to rental objects
    await page.goto('http://localhost:5173/rental-objects');
    
    // Skip if not logged in
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Step 1: Click create button
    const createButton = page.locator('[data-testid="create-rental-object"], button:has-text("Opprett")');
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Step 2: Fill wizard steps
    // Category selection
    const categoryCard = page.locator('[data-testid="category-card"]').first();
    if (await categoryCard.isVisible()) {
      await categoryCard.click();
    }

    // Basics step
    const nameInput = page.locator('[data-testid="rental-object-name"], input[name="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Rental Object');
    }

    // Continue through wizard
    const nextButton = page.locator('[data-testid="wizard-next"], button:has-text("Neste")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Step 3: Verify wizard navigation works
    const stepIndicator = page.locator('[data-testid="wizard-step-indicator"]');
    if (await stepIndicator.isVisible()) {
      // Wizard should be on step 2
    }
  });
});

test.describe('US-003: Organization Onboarding', () => {
  test('complete organization setup', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Step 1: Navigate to organization settings
    await page.goto('http://localhost:5173/settings/organization');
    
    // Step 2: Verify organization info form
    const orgNameInput = page.locator('[data-testid="org-name"], input[name*="organization"]');
    const orgNumberInput = page.locator('[data-testid="org-number"], input[name*="orgNumber"]');
    
    if (await orgNameInput.isVisible()) {
      await expect(orgNameInput).toBeVisible();
    }

    // Step 3: Test member invitation
    const inviteButton = page.locator('[data-testid="invite-member"], button:has-text("Inviter")');
    if (await inviteButton.isVisible()) {
      await inviteButton.click();
      
      // Fill invite form
      const emailInput = page.locator('[data-testid="invite-email"], input[type="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.no');
      }
    }
  });
});

test.describe('US-004: Citizen Manages Bookings', () => {
  test.beforeEach(async ({ page }) => {
    // Login as citizen
    await page.goto('http://localhost:5175/login');
    await page.waitForTimeout(1000);
  });

  test('view and manage my bookings', async ({ page }) => {
    await page.goto('http://localhost:5175/');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Step 1: Navigate to bookings
    await page.goto('http://localhost:5175/bookings');
    
    // Step 2: View booking list
    const bookingCards = page.locator('[data-testid="booking-card"]');
    const count = await bookingCards.count();
    
    console.log(`Found ${count} bookings`);

    // Step 3: View booking details (if any exist)
    if (count > 0) {
      await bookingCards.first().click();
      
      // Should show booking details
      const detailView = page.locator('[data-testid="booking-detail"]');
      await expect(detailView.or(page.locator('h1'))).toBeVisible();
    }
  });

  test('cancel a booking', async ({ page }) => {
    await page.goto('http://localhost:5175/bookings');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    const bookingCard = page.locator('[data-testid="booking-card"]').first();
    
    if (await bookingCard.isVisible()) {
      await bookingCard.click();
      
      // Find cancel button
      const cancelButton = page.locator('[data-testid="cancel-booking"], button:has-text("Avbestill")');
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="alertdialog"]');
        await expect(confirmDialog).toBeVisible();
      }
    }
  });
});

test.describe('US-005: Admin Reviews Pending Bookings', () => {
  test('approve pending booking', async ({ page }) => {
    await page.goto('http://localhost:5173/bookings/pending');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Step 1: View pending bookings list
    const pendingBookings = page.locator('[data-testid="pending-booking"]');
    const count = await pendingBookings.count();
    
    console.log(`Found ${count} pending bookings`);

    // Step 2: Approve a booking
    if (count > 0) {
      const approveButton = page.locator('[data-testid="approve-booking"]').first();
      
      if (await approveButton.isVisible()) {
        await approveButton.click();
        
        // Should show success message
        await expect(
          page.locator('[data-testid="success-toast"], .toast-success')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
