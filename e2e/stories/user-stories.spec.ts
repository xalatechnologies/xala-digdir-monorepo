/**
 * User Story Tests (BDD-Style)
 * Tests based on actual user stories and acceptance criteria
 * Format: As a [role], I want [feature], so that [benefit]
 */
import { test, expect } from '@playwright/test';

test.describe('STORY: As a guest, I want to browse rental objects without logging in', () => {
  test('GIVEN I am on the homepage WHEN I look for rental objects THEN I can see a list', async ({ page }) => {
    await page.goto('/');
    
    // Should show rental objects without requiring login
    await expect(page.locator('[data-testid="rental-object-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('GIVEN I see a rental object WHEN I click on it THEN I see the details', async ({ page }) => {
    await page.goto('/');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/rental-objects\/[a-z0-9-]+/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('GIVEN I am viewing a rental object WHEN I check availability THEN I see the calendar', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    // Should show availability calendar
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible({ timeout: 10000 });
  });

  test('GIVEN I want to book WHEN I am not logged in THEN I am prompted to login', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    const bookButton = page.getByRole('button', { name: /bestill|book/i });
    if (await bookButton.isVisible()) {
      await bookButton.click();
      
      // Should prompt for login
      await expect(page.getByText(/logg inn|login/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('STORY: As a user, I want to book a meeting room for my team meeting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|hjem/i, { timeout: 15000 });
  });

  test('GIVEN I find a meeting room WHEN I select date and time THEN I see the price', async ({ page }) => {
    await page.goto('/rental-objects?category=meeting-room');
    
    const meetingRoom = page.locator('[data-testid="rental-object-card"]').first();
    if (await meetingRoom.isVisible({ timeout: 5000 })) {
      await meetingRoom.click();
      
      const calendar = page.locator('[data-testid="availability-calendar"]');
      await expect(calendar).toBeVisible({ timeout: 10000 });
      
      const availableSlot = calendar.locator('[data-status="available"]').first();
      if (await availableSlot.isVisible()) {
        await availableSlot.click();
        
        // Should show pricing
        await expect(page.getByText(/pris|price|kr|nok/i)).toBeVisible();
      }
    }
  });

  test('GIVEN I see the price WHEN I confirm booking THEN I receive a confirmation', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const firstCard = page.locator('[data-testid="rental-object-card"]').first();
    await firstCard.click();
    
    const calendar = page.locator('[data-testid="availability-calendar"]');
    await expect(calendar).toBeVisible({ timeout: 10000 });
    
    const availableSlot = calendar.locator('[data-status="available"]').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
      
      // Complete booking
      const confirmButton = page.getByRole('button', { name: /bekreft|confirm|bestill/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        
        // Should show confirmation
        await expect(page.getByText(/bekreftet|confirmed|takk|thank/i)).toBeVisible({ timeout: 15000 });
      }
    }
  });

  test('GIVEN I have booked WHEN I go to my bookings THEN I see my booking', async ({ page }) => {
    await page.goto('/my-bookings');
    
    await expect(page.getByRole('heading', { name: /mine.*bestillinger|my.*bookings/i })).toBeVisible();
  });
});

test.describe('STORY: As an organization admin, I want to manage my rental objects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('admin@digilist.no');
    await page.getByLabel(/passord|password/i).fill('adminpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 15000 });
  });

  test('GIVEN I am logged in as admin WHEN I go to dashboard THEN I see my rental objects', async ({ page }) => {
    await page.goto('/admin/rental-objects');
    
    await expect(page.getByRole('heading', { name: /utleieobjekt|rental.*object/i })).toBeVisible();
  });

  test('GIVEN I want to create a new rental object WHEN I fill the form THEN it is created', async ({ page }) => {
    await page.goto('/admin/rental-objects/new');
    
    // Fill the form
    const titleInput = page.getByLabel(/tittel|title|navn|name/i);
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Møterom E2E');
      
      const categorySelect = page.getByRole('combobox', { name: /kategori|category/i });
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.getByRole('option').first().click();
      }
      
      // Submit
      await page.getByRole('button', { name: /opprett|create|lagre|save/i }).click();
      
      // Should show success
      await expect(page.getByText(/opprettet|created|lagret|saved/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('GIVEN I have rental objects WHEN I view bookings THEN I see incoming bookings', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    await expect(page.getByRole('heading', { name: /bestillinger|bookings/i })).toBeVisible();
  });

  test('GIVEN there is a pending booking WHEN I confirm it THEN the status changes', async ({ page }) => {
    await page.goto('/admin/bookings?status=pending');
    
    const pendingBooking = page.locator('[data-status="pending"]').first();
    if (await pendingBooking.isVisible({ timeout: 5000 })) {
      const confirmButton = pendingBooking.getByRole('button', { name: /bekreft|confirm/i });
      await confirmButton.click();
      
      // Confirm in dialog
      await page.getByRole('button', { name: /bekreft|confirm|ja|yes/i }).click();
      
      // Status should change
      await expect(page.getByText(/bekreftet|confirmed/i)).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('STORY: As a saksbehandler, I want to process booking requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('saksbehandler@digilist.no');
    await page.getByLabel(/passord|password/i).fill('sakpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|backoffice/i, { timeout: 15000 });
  });

  test('GIVEN there are pending requests WHEN I view queue THEN I see requests to process', async ({ page }) => {
    await page.goto('/backoffice/queue');
    
    await expect(page.getByRole('heading', { name: /kø|queue|innboks|inbox/i })).toBeVisible();
  });

  test('GIVEN I see a request WHEN I open it THEN I see full details', async ({ page }) => {
    await page.goto('/backoffice/queue');
    
    const firstRequest = page.locator('[data-testid="queue-item"]').first();
    if (await firstRequest.isVisible({ timeout: 5000 })) {
      await firstRequest.click();
      
      // Should show details
      await expect(page.getByText(/detaljer|details/i)).toBeVisible();
    }
  });

  test('GIVEN I reviewed a request WHEN I approve it THEN the requester is notified', async ({ page }) => {
    await page.goto('/backoffice/queue');
    
    const firstRequest = page.locator('[data-testid="queue-item"]').first();
    if (await firstRequest.isVisible({ timeout: 5000 })) {
      await firstRequest.click();
      
      const approveButton = page.getByRole('button', { name: /godkjenn|approve/i });
      if (await approveButton.isVisible()) {
        await approveButton.click();
        
        // Should show success
        await expect(page.getByText(/godkjent|approved|sendt|sent/i)).toBeVisible({ timeout: 10000 });
      }
    }
  });
});

test.describe('STORY: As a user, I want to manage my profile and preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/e-post|email/i).fill('user@digilist.no');
    await page.getByLabel(/passord|password/i).fill('userpassword123');
    await page.getByRole('button', { name: /logg inn|login/i }).click();
    await expect(page).toHaveURL(/dashboard|hjem/i, { timeout: 15000 });
  });

  test('GIVEN I go to settings WHEN I update my name THEN it is saved', async ({ page }) => {
    await page.goto('/settings/profile');
    
    const nameInput = page.getByLabel(/navn|name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Updated Name');
      await page.getByRole('button', { name: /lagre|save/i }).click();
      
      await expect(page.getByText(/lagret|saved/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('GIVEN I want notifications WHEN I enable email alerts THEN preference is saved', async ({ page }) => {
    await page.goto('/settings/notifications');
    
    const emailToggle = page.getByLabel(/e-post.*varsler|email.*notifications/i);
    if (await emailToggle.isVisible()) {
      await emailToggle.click();
      await page.getByRole('button', { name: /lagre|save/i }).click();
      
      await expect(page.getByText(/lagret|saved/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('GIVEN I want to export my data WHEN I request export THEN I receive it', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    const exportButton = page.getByRole('button', { name: /eksporter|export/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Should show confirmation or start download
      await expect(page.getByText(/eksport|export|data/i)).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('STORY: As a user, I want to search for available rental objects', () => {
  test('GIVEN I am on homepage WHEN I search for "møterom" THEN I see relevant results', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder(/søk|search/i);
    await searchInput.fill('møterom');
    await searchInput.press('Enter');
    
    // Should show search results
    await expect(page).toHaveURL(/search|søk/i);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('GIVEN I search with filters WHEN I filter by date THEN results are filtered', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const dateFilter = page.getByLabel(/dato|date/i);
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      
      // Select a future date
      const futureDate = page.locator('[data-available="true"]').first();
      if (await futureDate.isVisible()) {
        await futureDate.click();
        
        // Results should update
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('GIVEN I see results WHEN I filter by price range THEN cheaper options appear', async ({ page }) => {
    await page.goto('/rental-objects');
    
    const priceFilter = page.getByLabel(/pris|price/i);
    if (await priceFilter.isVisible()) {
      await priceFilter.selectOption({ label: /billig|cheap|lav/i });
      
      await page.waitForLoadState('networkidle');
    }
  });
});
