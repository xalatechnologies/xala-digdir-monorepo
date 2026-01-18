/**
 * E2E Smoke Tests
 * 
 * Basic tests to verify E2E infrastructure against Docker services
 */

import { test, expect } from '@playwright/test';

// Docker service URLs
const API_URL = process.env.API_URL || 'http://localhost:4000';
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

test.describe('API Health Checks', () => {
  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('API public cities endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/public/cities`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('API public rental-objects endpoint responds', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/public/rental-objects?limit=5`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
  });
});

test.describe('Web Frontend Smoke Tests', () => {
  test.setTimeout(30000);

  test('Web home page loads', async ({ page }) => {
    const response = await page.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
  });

  test('Web page has title', async ({ page }) => {
    await page.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title).toBeTruthy();
  });  // Note: "Web home page loads" and "Web page has title" already verify page renders
});
