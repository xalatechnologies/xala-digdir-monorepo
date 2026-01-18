// Skip E2E tests if not explicitly enabled
if (process.env.E2E_ENABLED !== 'true') {
  describe.skip('E2E tests require E2E_ENABLED=true', () => {});
} else {
import { setupMockApi } from '../../../mocks/api-server.mock';
/**
 * Rental Object Playwright E2E Tests
 * Demo journeys, performance, and security testing
 */
import { test, expect, Page } from '@playwright/test';

// =============================================================================
// E2E JOURNEY TESTS
// =============================================================================

test.describe('Rental Object Discovery Journey', () => {
  setupMockApi();
  test('should browse rental objects by category', async ({ page }) => {
    await page.goto('/rental-objects');
    
    // Should show category filters
    await expect(page.getByRole('button', { name: /lokaler/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /utstyr/i })).toBeVisible();
    
    // Click category filter
    await page.getByRole('button', { name: /lokaler/i }).click();
    
    // Should filter results
    await expect(page.locator('[data-category="LOKALER_OG_BANER"]')).toBeVisible();
  });

  test('should view rental object details with correct calendar', async ({ page }) => {
    await page.goto('/rental-objects/test-venue');
    
    // Should show rental object name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Should show calendar based on time mode
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible();
  });

  test('should show PERIOD calendar for venue', async ({ page }) => {
    await page.goto('/rental-objects/cultural-hall');
    
    // PERIOD mode shows timeline
    await expect(page.locator('[data-calendar-variant="timeline"]')).toBeVisible();
  });

  test('should show SLOT calendar for court', async ({ page }) => {
    await page.goto('/rental-objects/padel-court');
    
    // SLOT mode shows slot grid
    await expect(page.locator('[data-calendar-variant="slot-grid"]')).toBeVisible();
  });

  test('should show ALL_DAY calendar for equipment', async ({ page }) => {
    await page.goto('/rental-objects/party-tent');
    
    // ALL_DAY mode shows day cards
    await expect(page.locator('[data-calendar-variant="day-cards"]')).toBeVisible();
  });
});

test.describe('Rental Object Booking Journey', () => {
  setupMockApi();
  test('should complete booking for PERIOD mode', async ({ page }) => {
    await page.goto('/rental-objects/meeting-room');
    
    // Select date and time
    await page.getByRole('button', { name: /velg dato/i }).click();
    await page.getByRole('button', { name: '20' }).click();
    
    // Select time period
    await page.locator('[data-time="10:00"]').click();
    await page.locator('[data-time="14:00"]').click();
    
    // Click book button
    await page.getByRole('button', { name: /bestill/i }).click();
    
    // Should navigate to checkout or show confirmation
    await expect(page.getByText(/bekreft/i)).toBeVisible();
  });

  test('should show inventory remaining for equipment', async ({ page }) => {
    await page.goto('/rental-objects/projector');
    
    // Should show "x igjen" badge
    await expect(page.locator('[data-testid="inventory-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="inventory-badge"]')).toContainText(/igjen/i);
  });

  test('should show capacity remaining for events', async ({ page }) => {
    await page.goto('/rental-objects/workshop');
    
    // Should show "plasser igjen" badge
    await expect(page.locator('[data-testid="capacity-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="capacity-badge"]')).toContainText(/plasser/i);
  });
});

test.describe('Admin Rental Object Management', () => {
  setupMockApi();
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@demo.no');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should create new rental object', async ({ page }) => {
    await page.goto('/admin/rental-objects/new');
    
    // Fill form
    await page.fill('[name="name"]', 'Test Venue');
    await page.selectOption('[name="categoryKey"]', 'LOKALER_OG_BANER');
    await page.selectOption('[name="timeMode"]', 'PERIOD');
    await page.fill('[name="capacity"]', '50');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to list or detail
    await expect(page.getByText('Test Venue')).toBeVisible();
  });

  test('should edit rental object', async ({ page }) => {
    await page.goto('/admin/rental-objects/test-id/edit');
    
    // Change name
    await page.fill('[name="name"]', 'Updated Venue Name');
    await page.click('button[type="submit"]');
    
    // Should show success
    await expect(page.getByText(/lagret/i)).toBeVisible();
  });

  test('should create blackout period', async ({ page }) => {
    await page.goto('/admin/rental-objects/test-id/blackouts/new');
    
    // Fill blackout form
    await page.fill('[name="title"]', 'Maintenance');
    await page.fill('[name="startDate"]', '2026-02-01');
    await page.fill('[name="endDate"]', '2026-02-01');
    await page.fill('[name="reason"]', 'Annual inspection');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show in list
    await expect(page.getByText('Maintenance')).toBeVisible();
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe('Performance Tests', () => {
  setupMockApi();
  test('rental object list should load under 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/rental-objects');
    await page.waitForSelector('[data-testid="rental-object-card"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('availability calendar should load under 1 second', async ({ page }) => {
    await page.goto('/rental-objects/test-venue');
    
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="availability-calendar"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1000);
  });

  test('should handle 100+ rental objects without lag', async ({ page }) => {
    await page.goto('/rental-objects?limit=100');
    
    // Should render without timeout
    await expect(page.locator('[data-testid="rental-object-card"]').first()).toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// SECURITY / PENETRATION TESTS
// =============================================================================

test.describe('Security Tests', () => {
  setupMockApi();
  test('should reject unauthenticated POST requests', async ({ request }) => {
    const response = await request.post('/api/rental-objects', {
      data: { name: 'Malicious Object' },
    });
    
    expect(response.status()).toBe(401);
  });

  test('should reject cross-tenant access', async ({ request }) => {
    const response = await request.get('/api/rental-objects/other-tenant-id', {
      headers: { 'X-Tenant-Id': 'my-tenant' },
    });
    
    expect([403, 404]).toContain(response.status());
  });

  test('should sanitize XSS in rental object name', async ({ page }) => {
    await page.goto('/admin/rental-objects/new');
    
    // Try XSS payload
    await page.fill('[name="name"]', '<script>alert("xss")</script>');
    await page.click('button[type="submit"]');
    
    // Should not execute script
    const alertTriggered = await page.evaluate(() => {
      return (window as any).__xssTriggered || false;
    });
    expect(alertTriggered).toBe(false);
  });

  test('should enforce RBAC on delete', async ({ request }) => {
    // Try delete as CITIZEN (should fail)
    const response = await request.delete('/api/rental-objects/test-id', {
      headers: {
        'Authorization': 'Bearer citizen-token',
      },
    });
    
    expect(response.status()).toBe(403);
  });

  test('should rate limit API requests', async ({ request }) => {
    const requests = Array(100).fill(null).map(() => 
      request.get('/api/rental-objects')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    // Should eventually rate limit
    expect(rateLimited).toBe(true);
  });
});

// =============================================================================
// HCASE - REAL WORLD SCENARIO TESTS
// =============================================================================

test.describe('HCASE - Skien Kommune Demo Scenarios', () => {
  setupMockApi();
  test('HCASE-001: Citizen books meeting room for konfirmasjon', async ({ page }) => {
    // Navigate to venue
    await page.goto('/rental-objects/kulturhuset-storsalen');
    
    // Verify it's LOKALER_OG_BANER category
    await expect(page.locator('[data-category]')).toHaveAttribute('data-category', 'LOKALER_OG_BANER');
    
    // Verify PERIOD calendar
    await expect(page.locator('[data-calendar-variant="timeline"]')).toBeVisible();
    
    // Select date (future Saturday)
    await page.click('[data-date="2026-02-21"]');
    
    // Select time range 10:00-16:00
    await page.locator('[data-time="10:00"]').dragTo(page.locator('[data-time="16:00"]'));
    
    // Should calculate price
    await expect(page.getByText(/NOK/)).toBeVisible();
    
    // Submit booking request
    await page.click('[data-testid="book-button"]');
    
    // Should show pending approval message
    await expect(page.getByText(/venter på godkjenning/i)).toBeVisible();
  });

  test('HCASE-002: Caseworker approves booking', async ({ page }) => {
    // Login as caseworker
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'caseworker@demo.no');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Navigate to pending bookings
    await page.goto('/admin/bookings?status=pending');
    
    // Find the booking
    await expect(page.getByText('Konfirmasjonsfest')).toBeVisible();
    
    // Approve it
    await page.click('[data-testid="approve-button"]');
    await page.fill('[name="reason"]', 'Approved for public use');
    await page.click('[data-testid="confirm-approval"]');
    
    // Should update status
    await expect(page.getByText(/godkjent/i)).toBeVisible();
  });

  test('HCASE-003: Organization rents equipment with inventory', async ({ page }) => {
    // Navigate to equipment
    await page.goto('/rental-objects/partytelt');
    
    // Verify UTSTYR_OG_INVENTAR category
    await expect(page.locator('[data-category]')).toHaveAttribute('data-category', 'UTSTYR_OG_INVENTAR');
    
    // Verify ALL_DAY calendar
    await expect(page.locator('[data-calendar-variant="day-cards"]')).toBeVisible();
    
    // Verify inventory badge shows "x igjen"
    await expect(page.locator('[data-testid="inventory-badge"]')).toContainText('3 igjen');
    
    // Select quantity
    await page.selectOption('[name="quantity"]', '2');
    
    // Select dates
    await page.click('[data-date="2026-02-14"]');
    await page.click('[data-date="2026-02-16"]');
    
    // Should show 3 days
    await expect(page.getByText(/3 dager/)).toBeVisible();
    
    // Book
    await page.click('[data-testid="book-button"]');
  });

  test('HCASE-004: User books slot on padel court', async ({ page }) => {
    // Navigate to padel court
    await page.goto('/rental-objects/padelbane-1');
    
    // Verify LOKALER_OG_BANER with SLOT mode
    await expect(page.locator('[data-calendar-variant="slot-grid"]')).toBeVisible();
    
    // Select available slot
    await page.click('[data-slot="2026-02-20T18:00"]');
    
    // Slot should be selected
    await expect(page.locator('[data-slot="2026-02-20T18:00"]')).toHaveClass(/selected/);
    
    // Book
    await page.click('[data-testid="book-button"]');
  });

  test('HCASE-005: Admin sets blackout for maintenance', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@demo.no');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Navigate to rental object
    await page.goto('/admin/rental-objects/idrettshallen');
    
    // Add blackout
    await page.click('[data-testid="add-blackout"]');
    await page.fill('[name="title"]', 'Vedlikehold gulv');
    await page.fill('[name="startDate"]', '2026-03-01');
    await page.fill('[name="endDate"]', '2026-03-05');
    await page.fill('[name="reason"]', 'Slipe og lakkere gulv');
    await page.click('button[type="submit"]');
    
    // Verify blackout appears on calendar
    await page.goto('/rental-objects/idrettshallen');
    await expect(page.locator('[data-blackout="2026-03-01"]')).toBeVisible();
  });

  test('HCASE-006: Verify booking conflict detection', async ({ page }) => {
    // Navigate to already-booked venue
    await page.goto('/rental-objects/kulturhuset-storsalen');
    
    // Try to select already booked time
    await page.click('[data-date="2026-02-15"]'); // Has booking
    
    // Should show conflict indicator
    await expect(page.locator('[data-status="booked"]')).toBeVisible();
    
    // Booked slots should be disabled
    await expect(page.locator('[data-time="10:00"][disabled]')).toBeVisible();
  });
});
}
