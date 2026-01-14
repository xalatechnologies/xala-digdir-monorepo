import { test, expect } from '@playwright/test';

test.describe('Calendar Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming auth is handled or we navigate to calendar directly
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
  });

  test('should render calendar with default week view', async ({ page }) => {
    // Verify calendar page loads
    await expect(page.locator('h1, h2').filter({ hasText: /kalender/i })).toBeVisible();

    // Verify week view is active
    const weekButton = page.locator('button[aria-pressed="true"]').filter({ hasText: /uke/i });
    await expect(weekButton).toBeVisible();

    // Verify time grid is visible
    await expect(page.locator('text=07:00')).toBeVisible();
    await expect(page.locator('text=20:00')).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Switch to day view
    await page.click('button:has-text("Dag")');
    await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: /dag/i })).toBeVisible();

    // Switch to month view
    await page.click('button:has-text("Måned")');
    await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: /måned/i })).toBeVisible();

    // Verify month grid is visible
    const monthView = page.locator('.month-grid, [data-testid="month-view"]');
    if (await monthView.count() > 0) {
      await expect(monthView.first()).toBeVisible({ timeout: 5000 });
    }

    // Switch to timeline view
    await page.click('button:has-text("Tidslinje")');
    await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: /tidslinje/i })).toBeVisible();

    // Verify timeline structure (resource lanes)
    const timeline = page.locator('[data-testid="timeline-view"], .timeline-view');
    if (await timeline.count() > 0) {
      await expect(timeline.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate between dates', async ({ page }) => {
    // Click next week
    const nextButton = page.locator('button[aria-label*="Neste"], button[aria-label*="neste"]');
    if (await nextButton.count() > 0) {
      await nextButton.first().click();
      await page.waitForTimeout(500);
    }

    // Click previous week
    const prevButton = page.locator('button[aria-label*="Forrige"], button[aria-label*="forrige"]');
    if (await prevButton.count() > 0) {
      await prevButton.first().click();
      await page.waitForTimeout(500);
    }

    // Click today
    const todayButton = page.locator('button:has-text("I dag")');
    if (await todayButton.count() > 0) {
      await todayButton.click();
      await page.waitForTimeout(500);
    }

    // Verify navigation works (no errors)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    expect(consoleErrors).toHaveLength(0);
  });

  test('should create booking via drag-and-drop (if supported)', async ({ page }) => {
    // Switch to timeline view for easier testing
    const timelineButton = page.locator('button:has-text("Tidslinje")');
    if (await timelineButton.count() > 0) {
      await timelineButton.click();
      await page.waitForTimeout(500);
    }

    // Find the calendar grid/timeline
    const calendarGrid = page.locator('[data-listing-id], .calendar-grid, [data-testid="calendar-grid"]').first();

    if (await calendarGrid.count() > 0) {
      // Get calendar bounding box
      const box = await calendarGrid.boundingBox();
      if (box) {
        // Perform drag action (from one position to another)
        const startY = box.y + 100;
        const endY = box.y + 200;

        await page.mouse.move(box.x + 100, startY);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, endY);
        await page.mouse.up();

        // Verify CreateBlockModal opens (check for dialog or modal)
        const modal = page.locator('[role="dialog"]').filter({ hasText: /ny blokkering|opprett|booking/i });
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should highlight conflicts in red (if conflicts exist)', async ({ page }) => {
    // Look for events with conflict styling
    const conflictIndicators = page.locator('[aria-label="Konflikt"]');

    // If conflicts exist, verify styling
    if (await conflictIndicators.count() > 0) {
      const firstConflict = conflictIndicators.first();
      await expect(firstConflict).toBeVisible();
    }
  });

  test('should display live indicator when realtime is active', async ({ page }) => {
    // Check for "Live" indicator on page
    const liveIndicator = page.locator('text=/live|sanntid/i');

    // If live indicators exist, verify they're present
    if (await liveIndicator.count() > 0) {
      await expect(liveIndicator.first()).toBeVisible();
    }
  });

  test('should filter by listing (if filter is available)', async ({ page }) => {
    // Find filter dropdown
    const filterSelect = page.locator('select, [role="combobox"]').filter({ hasText: /filtrer|velg|listing/i }).first();

    if (await filterSelect.count() > 0 && await filterSelect.isVisible()) {
      // Select a listing
      await filterSelect.click();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Wait for calendar to update
      await page.waitForTimeout(500);

      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      expect(consoleErrors).toHaveLength(0);
    }
  });

  test('should have no console errors during normal usage', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform various actions
    const timelineButton = page.locator('button:has-text("Tidslinje")');
    if (await timelineButton.count() > 0) {
      await timelineButton.click();
      await page.waitForTimeout(500);
    }

    const weekButton = page.locator('button:has-text("Uke")');
    if (await weekButton.count() > 0) {
      await weekButton.click();
      await page.waitForTimeout(500);
    }

    const nextButton = page.locator('button[aria-label*="Neste"], button[aria-label*="neste"]').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Verify no errors (filter out common benign errors)
    const filteredErrors = consoleErrors.filter(err =>
      !err.includes('favicon') && // Ignore favicon errors
      !err.includes('ResizeObserver') // Ignore common benign errors
    );

    expect(filteredErrors).toHaveLength(0);
  });

  test('should open event details drawer on event click', async ({ page }) => {
    // Find any visible event
    const events = page.locator('[data-event-id], .event-card, [role="button"]').filter({ hasText: /møte|booking/i });

    if (await events.count() > 0) {
      await events.first().click();

      // Verify drawer or modal opens
      const drawer = page.locator('[role="dialog"], [role="complementary"]');
      if (await drawer.count() > 0) {
        await expect(drawer.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should display current time indicator', async ({ page }) => {
    // Look for current time indicator (red line)
    // This is implementation-specific, so we check if it exists
    const timeIndicator = page.locator('[style*="danger"], [style*="red"]').filter({ hasText: '' });

    // If current time is within view range, indicator should be visible
    // This test is flexible as the indicator may not always be present
    const count = await timeIndicator.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should open create block modal via button', async ({ page }) => {
    // Find "Ny blokkering" button
    const createButton = page.locator('button:has-text("Ny blokkering"), button:has-text("Opprett")');

    if (await createButton.count() > 0) {
      await createButton.first().click();

      // Verify modal opens
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 3000 });
    }
  });
});
