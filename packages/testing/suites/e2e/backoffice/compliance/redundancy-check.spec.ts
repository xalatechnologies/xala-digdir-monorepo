// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@digilist/api/../mocks/api-server.mock';
import { test, expect } from '@digilist/api/fixtures/qa-expert.fixture';
import { config } from '@digilist/api/config/backoffice.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Redundancy Check Suite
 * 
 * Detects and reports duplicate sidebar items, routes, and page titles.
 * Produces a redundancy report artifact.
 */

interface SidebarItem {
  label: string;
  href: string;
  section?: string;

interface RedundancyReport {
  timestamp: string;
  duplicateLabels: { label: string; count: number; hrefs: string[] }[];
  duplicateRoutes: { route: string; count: number; labels: string[] }[];
  duplicatePageTitles: { title: string; routes: string[] }[];
  suggestions: string[];
  overall: 'pass' | 'warn' | 'fail';

test.describe('Redundancy & Menu Hygiene', () => {
  setupMockApi();
  test.use({ storageState: 'tests/e2e/backoffice/.auth/admin.json' });

  test('RC1. Detect duplicate sidebar items by route', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get all sidebar links
    const navItems = page.locator('nav[data-testid="sidebar-nav"] a[href]');
    const count = await navItems.count();
    
    const items: SidebarItem[] = [];
    const routeCounts = new Map<string, string[]>();
    
    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const label = (await item.textContent() || '').trim().split('\n')[0].trim();
      const href = await item.getAttribute('href') || '';
      
      items.push({ label, href });
      
      // Track route occurrences
      const labels = routeCounts.get(href) || [];
      labels.push(label);
      routeCounts.set(href, labels);
    }
    
    // Find duplicates
    const duplicateRoutes: { route: string; labels: string[] }[] = [];
    routeCounts.forEach((labels, route) => {
      if (labels.length > 1) {
        duplicateRoutes.push({ route, labels });
      }
    });
    
    console.log(`\nSidebar Analysis:`);
    console.log(`├─ Total items: ${count}`);
    console.log(`├─ Unique routes: ${routeCounts.size}`);
    console.log(`└─ Duplicate routes: ${duplicateRoutes.length}`);
    
    if (duplicateRoutes.length > 0) {
      console.log('\n⚠ Duplicate routes found:');
      duplicateRoutes.forEach(dup => {
        console.log(`  ${dup.route}: [${dup.labels.join(', ')}]`);
      });
    }
    
    // Store for report
    (test.info() as any).duplicateRoutes = duplicateRoutes;
    
    // Warn but don't fail immediately
    expect(duplicateRoutes.length).toBeLessThanOrEqual(2);
  });

  test('RC2. Detect duplicate sidebar items by label', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const navItems = page.locator('nav[data-testid="sidebar-nav"] a[href]');
    const count = await navItems.count();
    
    const labelCounts = new Map<string, string[]>();
    
    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const label = (await item.textContent() || '').trim().split('\n')[0].trim();
      const href = await item.getAttribute('href') || '';
      
      const hrefs = labelCounts.get(label) || [];
      hrefs.push(href);
      labelCounts.set(label, hrefs);
    }
    
    // Find duplicates
    const duplicateLabels: { label: string; hrefs: string[] }[] = [];
    labelCounts.forEach((hrefs, label) => {
      if (hrefs.length > 1 && label.length > 0) {
        duplicateLabels.push({ label, hrefs });
      }
    });
    
    console.log(`\nLabel Analysis:`);
    console.log(`├─ Unique labels: ${labelCounts.size}`);
    console.log(`└─ Duplicate labels: ${duplicateLabels.length}`);
    
    if (duplicateLabels.length > 0) {
      console.log('\n⚠ Duplicate labels found:');
      duplicateLabels.forEach(dup => {
        console.log(`  "${dup.label}": [${dup.hrefs.join(', ')}]`);
      });
    }
    
    expect(duplicateLabels.length).toBe(0);
  });

  test('RC3. Detect duplicate page titles across routes', async ({ page }) => {
    const pageTitles = new Map<string, string[]>();
    
    // Sample key routes
    const routes = [
      '/',
      '/bookings',
      '/calendar',
      '/rental-objects',
      '/organizations',
      '/users',
      '/work-queue',
      '/settings',
    ];
    
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      
      if (page.url().includes('/login')) continue;
      
      const title = page.locator('h1, h2, [data-testid="page-title"]').first();
      if (await title.isVisible().catch(() => false)) {
        const titleText = (await title.textContent() || '').trim();
        
        const titleRoutes = pageTitles.get(titleText) || [];
        titleRoutes.push(route);
        pageTitles.set(titleText, titleRoutes);
      }
    }
    
    // Find duplicates
    const duplicateTitles: { title: string; routes: string[] }[] = [];
    pageTitles.forEach((routes, title) => {
      if (routes.length > 1 && title.length > 0) {
        duplicateTitles.push({ title, routes });
      }
    });
    
    console.log(`\nPage Title Analysis:`);
    console.log(`├─ Routes checked: ${routes.length}`);
    console.log(`├─ Unique titles: ${pageTitles.size}`);
    console.log(`└─ Duplicate titles: ${duplicateTitles.length}`);
    
    if (duplicateTitles.length > 0) {
      console.log('\n⚠ Duplicate page titles:');
      duplicateTitles.forEach(dup => {
        console.log(`  "${dup.title}": [${dup.routes.join(', ')}]`);
      });
    }
    
    expect(duplicateTitles.length).toBe(0);
  });

  test('RC4. Generate redundancy report artifact', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Collect all data
    const navItems = page.locator('nav[data-testid="sidebar-nav"] a[href]');
    const count = await navItems.count();
    
    const items: SidebarItem[] = [];
    const routeCounts = new Map<string, string[]>();
    const labelCounts = new Map<string, string[]>();
    
    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const label = (await item.textContent() || '').trim().split('\n')[0].trim();
      const href = await item.getAttribute('href') || '';
      
      items.push({ label, href });
      
      const routeLabels = routeCounts.get(href) || [];
      routeLabels.push(label);
      routeCounts.set(href, routeLabels);
      
      const labelHrefs = labelCounts.get(label) || [];
      labelHrefs.push(href);
      labelCounts.set(label, labelHrefs);
    }
    
    // Build report
    const duplicateLabels: RedundancyReport['duplicateLabels'] = [];
    labelCounts.forEach((hrefs, label) => {
      if (hrefs.length > 1 && label.length > 0) {
        duplicateLabels.push({ label, count: hrefs.length, hrefs });
      }
    });
    
    const duplicateRoutes: RedundancyReport['duplicateRoutes'] = [];
    routeCounts.forEach((labels, route) => {
      if (labels.length > 1) {
        duplicateRoutes.push({ route, count: labels.length, labels });
      }
    });
    
    const suggestions: string[] = [];
    if (duplicateRoutes.length > 0) {
      suggestions.push('Consolidate menu items pointing to the same route');
    }
    if (duplicateLabels.length > 0) {
      suggestions.push('Rename duplicate labels to be more specific');
    }
    if (duplicateRoutes.length === 0 && duplicateLabels.length === 0) {
      suggestions.push('No redundancy issues detected - menu is clean');
    }
    
    const report: RedundancyReport = {
      timestamp: new Date().toISOString(),
      duplicateLabels,
      duplicateRoutes,
      duplicatePageTitles: [],
      suggestions,
      overall: duplicateRoutes.length === 0 && duplicateLabels.length === 0 ? 'pass' : 'warn',
    };
    
    // Save report
    const reportDir = 'tests/e2e/backoffice/reports';
    try {
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // Markdown report
      const mdReport = `# Redundancy Report

Generated: ${report.timestamp}

## Overall Status: ${report.overall.toUpperCase()}

## Duplicate Routes (${report.duplicateRoutes.length})
${report.duplicateRoutes.length === 0 ? '_None detected_\n' : ''}
${report.duplicateRoutes.map(r => `- \`${r.route}\` (${r.count}x): ${r.labels.join(', ')}`).join('\n')}

## Duplicate Labels (${report.duplicateLabels.length})
${report.duplicateLabels.length === 0 ? '_None detected_\n' : ''}
${report.duplicateLabels.map(l => `- "${l.label}" (${l.count}x): ${l.hrefs.join(', ')}`).join('\n')}

## Suggestions
${report.suggestions.map(s => `- ${s}`).join('\n')}

## Menu Items Discovered
| Label | Route |
|-------|-------|
${items.map(i => `| ${i.label} | ${i.href} |`).join('\n')}
`;
      
      fs.writeFileSync(path.join(reportDir, 'redundancy-report.md'), mdReport);
      fs.writeFileSync(path.join(reportDir, 'menu-map-admin.json'), JSON.stringify(items, null, 2));
      
      console.log('\n✓ Reports saved to tests/e2e/backoffice/reports/');
    } catch (err) {
      console.warn('Could not save reports:', err);
    }
    
    console.log(`\n📊 Redundancy Report Summary:`);
    console.log(`├─ Duplicate routes: ${duplicateRoutes.length}`);
    console.log(`├─ Duplicate labels: ${duplicateLabels.length}`);
    console.log(`└─ Status: ${report.overall.toUpperCase()}`);
  });
});
