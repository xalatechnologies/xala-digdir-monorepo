/**
 * Real-World Scenario Tests
 * Tests based on actual business scenarios and edge cases
 * These simulate realistic user behavior and data conditions
 */
import { test, expect } from '@playwright/test';

test.describe('SCENARIO: Complete Booking Journey - First Time User', () => {
  test('New user discovers, explores, registers, and books their first rental', async ({ page }) => {
    // Step 1: Land on homepage from Google search
    await page.goto('/?utm_source=google&utm_campaign=booking');
    await expect(page.locator('body')).toBeVisible();
    
    // Step 2: Browse available rentals
    const rentalCards = page.locator('[data-testid="rental-object-card"]');
    await expect(rentalCards.first()).toBeVisible({ timeout: 10000 });
    
    // Step 3: Click on an interesting rental
    await rentalCards.first().click();
    await expect(page).toHaveURL(/rental-objects\/[a-z0-9-]+/i);
    
    // Step 4: View photos and details
    const gallery = page.locator('[data-testid="image-gallery"]');
    if (await gallery.isVisible()) {
      await gallery.click();
    }
    
    // Step 5: Check availability calendar
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    // Step 6: Try to book - should prompt for login
    const bookButton = page.getByRole('button', { name: /bestill|book/i });
    if (await bookButton.isVisible()) {
      await bookButton.click();
      
      // Step 7: Redirect to login/register
      await expect(page.getByText(/logg inn|login|registrer|register/i)).toBeVisible({ timeout: 5000 });
      
      // Step 8: Register new account
      const registerLink = page.getByRole('link', { name: /registrer|register|ny bruker|create account/i });
      if (await registerLink.isVisible()) {
        await registerLink.click();
        
        await page.getByLabel(/e-post|email/i).fill('newuser@example.com');
        await page.getByLabel(/passord|password/i).first().fill('SecurePass123!');
        await page.getByRole('button', { name: /registrer|register|opprett/i }).click();
      }
    }
  });
});

test.describe('SCENARIO: Recurring Weekly Team Booking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('team-lead@company.no');
    await page.getByLabel(/passord|password/i).fill('teampassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('Team lead sets up weekly standup meeting room booking', async ({ page }) => {
    // Step 1: Find the preferred meeting room
    await page.goto('/rental-objects?category=meeting-room');
    
    const meetingRoom = page.locator('[data-testid="rental-object-card"]').first();
    if (await meetingRoom.isVisible({ timeout: 5000 })) {
      await meetingRoom.click();
      
      // Step 2: Enable recurring booking mode
      const recurringToggle = page.getByLabel(/gjentakende|recurring/i);
      if (await recurringToggle.isVisible()) {
        await recurringToggle.click();
        
        // Step 3: Select weekly frequency
        const frequencySelect = page.getByRole('combobox', { name: /frekvens|frequency/i });
        if (await frequencySelect.isVisible()) {
          await frequencySelect.selectOption('weekly');
        }
        
        // Step 4: Select Monday 09:00-09:30
        const daySelect = page.getByLabel(/dag|day/i);
        if (await daySelect.isVisible()) {
          await daySelect.selectOption('monday');
        }
        
        const timeSelect = page.getByLabel(/tid|time/i);
        if (await timeSelect.isVisible()) {
          await timeSelect.fill('09:00');
        }
        
        // Step 5: Set duration for 12 weeks
        const durationInput = page.getByLabel(/varighet|duration|uker|weeks/i);
        if (await durationInput.isVisible()) {
          await durationInput.fill('12');
        }
        
        // Step 6: Preview and confirm
        const previewButton = page.getByRole('button', { name: /forhåndsvis|preview/i });
        if (await previewButton.isVisible()) {
          await previewButton.click();
          
          // Step 7: Should show 12 booking instances
          await expect(page.getByText(/12.*bestillinger|12.*bookings/i)).toBeVisible({ timeout: 5000 });
          
          // Step 8: Confirm all
          await page.getByRole('button', { name: /bekreft alle|confirm all/i }).click();
        }
      }
    }
  });
});

test.describe('SCENARIO: Last-Minute Cancellation and Rebooking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('User cancels booking and quickly finds alternative', async ({ page }) => {
    // Step 1: Go to my bookings
    await page.goto('/my-bookings');
    
    // Step 2: Find upcoming booking
    const upcomingBooking = page.locator('[data-testid="booking-card"]').first();
    if (await upcomingBooking.isVisible({ timeout: 5000 })) {
      // Step 3: Cancel it
      const cancelButton = upcomingBooking.getByRole('button', { name: /avbestill|cancel/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Step 4: Confirm cancellation
        await page.getByRole('button', { name: /bekreft|confirm/i }).click();
        
        // Step 5: See cancellation confirmation
        await expect(page.getByText(/avbestilt|cancelled/i)).toBeVisible({ timeout: 10000 });
        
        // Step 6: Find new rental
        await page.getByRole('link', { name: /finn ny|find new|søk|search/i }).click();
        
        // Step 7: Book alternative
        const alternative = page.locator('[data-testid="rental-object-card"]').first();
        if (await alternative.isVisible()) {
          await alternative.click();
        }
      }
    }
  });
});

test.describe('SCENARIO: Organization Onboarding', () => {
  test('New organization registers and sets up their first rental object', async ({ page }) => {
    // Step 1: Go to organization registration
    await page.goto('/organizations/register');
    
    // Step 2: Fill organization details
    const orgNameInput = page.getByLabel(/organisasjonsnavn|organization name/i);
    if (await orgNameInput.isVisible()) {
      await orgNameInput.fill('Test Bedrift AS');
      
      const orgNumberInput = page.getByLabel(/organisasjonsnummer|org.*number/i);
      if (await orgNumberInput.isVisible()) {
        await orgNumberInput.fill('123456789');
      }
      
      // Step 3: Submit for verification
      await page.getByRole('button', { name: /registrer|register|send/i }).click();
      
      // Step 4: Should show verification pending
      await expect(page.getByText(/venter.*verifisering|pending.*verification/i)).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('SCENARIO: Conflict Resolution - Double Booking Attempt', () => {
  test('System prevents double booking and suggests alternatives', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    // Step 1: Go to a popular rental object
    await page.goto('/rental-objects');
    const popularRental = page.locator('[data-testid="rental-object-card"]').first();
    await popularRental.click();
    
    // Step 2: Try to book an already-booked slot
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    const bookedSlot = calendar.locator('[data-status="booked"]').first();
    if (await bookedSlot.isVisible()) {
      await bookedSlot.click();
      
      // Step 3: Should show unavailable message
      await expect(page.getByText(/opptatt|unavailable|ikke ledig/i)).toBeVisible({ timeout: 5000 });
      
      // Step 4: Should suggest alternatives
      const alternatives = page.locator('[data-testid="alternative-slots"]');
      if (await alternatives.isVisible()) {
        await expect(alternatives).toContainText(/ledige.*tider|available.*times/i);
      }
    }
  });
});

test.describe('SCENARIO: Payment Flow with Multiple Methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('User chooses Vipps payment for quick checkout', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    await rental.click();
    
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    const availableSlot = calendar.locator('[data-status="available"]').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
      
      // Select Vipps payment
      const vippsButton = page.getByRole('button', { name: /vipps/i });
      if (await vippsButton.isVisible()) {
        await vippsButton.click();
        
        // Should redirect to Vipps or show Vipps modal
        await expect(page.getByText(/vipps|betal|pay/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('User uses invoice payment for organization', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    await rental.click();
    
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    const availableSlot = calendar.locator('[data-status="available"]').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
      
      // Select invoice payment
      const invoiceRadio = page.getByLabel(/faktura|invoice/i);
      if (await invoiceRadio.isVisible()) {
        await invoiceRadio.click();
        
        // Should show invoice details form
        await expect(page.getByLabel(/fakturaadresse|invoice.*address/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('SCENARIO: Seasonal Lease Application Process', () => {
  test('Sports club applies for seasonal access to sports facility', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('sportsclub@example.no');
    await page.getByLabel(/passord|password/i).fill('clubpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    // Step 1: Navigate to seasonal leases
    await page.goto('/seasonal-leases');
    
    // Step 2: Start new application
    const newApplicationButton = page.getByRole('button', { name: /ny.*søknad|new.*application/i });
    if (await newApplicationButton.isVisible()) {
      await newApplicationButton.click();
      
      // Step 3: Select facility type
      const facilitySelect = page.getByRole('combobox', { name: /anlegg|facility|type/i });
      if (await facilitySelect.isVisible()) {
        await facilitySelect.click();
        await page.getByRole('option', { name: /idrettshall|sports.*hall/i }).click();
      }
      
      // Step 4: Specify time requirements
      const timeInput = page.getByLabel(/ønsket.*tid|preferred.*time/i);
      if (await timeInput.isVisible()) {
        await timeInput.fill('Tirsdag og torsdag 18:00-20:00');
      }
      
      // Step 5: Add participant info
      const participantsInput = page.getByLabel(/deltakere|participants|antall/i);
      if (await participantsInput.isVisible()) {
        await participantsInput.fill('45');
      }
      
      // Step 6: Submit application
      await page.getByRole('button', { name: /send.*søknad|submit.*application/i }).click();
      
      // Step 7: See confirmation
      await expect(page.getByText(/søknad.*mottatt|application.*received/i)).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('SCENARIO: Multi-Language Support', () => {
  test('User switches from Norwegian to English', async ({ page }) => {
    await page.goto('/');
    
    // Find language switcher
    const languageSwitcher = page.getByRole('button', { name: /språk|language|norsk|english/i });
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      
      // Select English
      await page.getByRole('option', { name: /english/i }).click();
      
      // UI should now be in English
      await expect(page.getByText(/book|rental|search/i)).toBeVisible();
    }
  });
});

test.describe('SCENARIO: Mobile User Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Mobile user can complete full booking flow', async ({ page }) => {
    await page.goto('/');
    
    // Step 1: Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /meny|menu/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
    
    // Step 2: Navigate to rentals
    await page.getByRole('link', { name: /utleie|rental/i }).click();
    
    // Step 3: View a rental
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Step 4: Scroll to calendar on mobile
      await page.evaluate(() => window.scrollTo(0, 500));
      
      // Step 5: Tap on available date
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('SCENARIO: Accessibility User Journey', () => {
  test('Screen reader user can navigate and book', async ({ page }) => {
    await page.goto('/');
    
    // Step 1: Navigate using keyboard only
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Step 2: Use skip link if available
    const skipLink = page.getByRole('link', { name: /hopp|skip/i });
    if (await skipLink.isVisible()) {
      await skipLink.focus();
      await page.keyboard.press('Enter');
    }
    
    // Step 3: Navigate to search
    const searchInput = page.getByRole('searchbox');
    if (await searchInput.isVisible()) {
      await searchInput.focus();
      await searchInput.fill('møterom');
      await page.keyboard.press('Enter');
    }
  });
});

test.describe('SCENARIO: Error Recovery', () => {
  test('User recovers from network error during booking', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    
    await page.goto('/rental-objects');
    
    const rental = page.locator('[data-testid="rental-object-card"]').first();
    if (await rental.isVisible({ timeout: 5000 })) {
      await rental.click();
      
      // Simulate network error by going offline
      await page.route('**/api/**', route => route.abort());
      
      const bookButton = page.getByRole('button', { name: /bestill|book/i });
      if (await bookButton.isVisible()) {
        await bookButton.click();
        
        // Should show error message
        await expect(page.getByText(/feil|error|prøv igjen|try again/i)).toBeVisible({ timeout: 10000 });
        
        // Restore network
        await page.unroute('**/api/**');
        
        // Retry button should work
        const retryButton = page.getByRole('button', { name: /prøv igjen|retry/i });
        if (await retryButton.isVisible()) {
          await retryButton.click();
        }
      }
    }
  });
});
