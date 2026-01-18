import { Page, expect, Locator } from '@playwright/test';

/**
 * Blur-Eye Test Helpers
 * 
 * Reusable assertions for validating page structure according to
 * the Blur-Eye UX Standard.
 */

// Forbidden terminology that should never appear
const FORBIDDEN_TERMS = ['facility', 'facilities', 'Facility', 'Facilities'];

// I18n key patterns that indicate missing translations
const I18N_KEY_PATTERNS = [
  /\bnav\.[a-z]+\b/gi,
  /\bcommon\.[a-z]+\b/gi,
  /\berror\.[a-z]+\b/gi,
];

export interface BlurEyeResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];

export interface PageElements {
  title: Locator | null;
  titleText: string;
  primaryAction: Locator | null;
  search: Locator | null;
  filters: Locator[];
  dataTable: Locator | null;
  dataRows: number;
  emptyState: Locator | null;
  rowActions: Locator | null;
  pagination: Locator | null;

/**
 * Discover all page elements for blur-eye validation
 */
export async function discoverPageElements(page: Page): Promise<PageElements> {
  // Title
  const titleLocator = page.locator('h1, h2, [data-testid="page-title"]').first();
  const titleVisible = await titleLocator.isVisible().catch(() => false);
  const titleText = titleVisible ? (await titleLocator.textContent() || '').trim() : '';
  
  // Primary action
  const primaryActionLocator = page.locator(
    'button:has-text("Legg til"), button:has-text("Opprett"), a[href*="wizard"], a[href*="new"], [data-testid="primary-action"]'
  ).first();
  const primaryActionVisible = await primaryActionLocator.isVisible().catch(() => false);
  
  // Search
  const searchLocator = page.locator(
    'input[type="search"], input[placeholder*="søk" i], input[placeholder*="search" i], [data-testid="search-input"]'
  ).first();
  const searchVisible = await searchLocator.isVisible().catch(() => false);
  
  // Filters
  const filterLocators = page.locator(
    'select:not([hidden]), button:has-text("Filter"), [data-testid*="filter"], button[aria-haspopup="listbox"]'
  );
  const filterCount = await filterLocators.count();
  const filters: Locator[] = [];
  for (let i = 0; i < filterCount; i++) {
    filters.push(filterLocators.nth(i));
  }
  
  // Data table
  const tableLocator = page.locator('table, [data-testid="data-table"], [data-testid*="grid"]').first();
  const tableVisible = await tableLocator.isVisible().catch(() => false);
  
  // Data rows
  const rowLocator = page.locator('tbody tr, [data-testid*="row-"]');
  const dataRows = await rowLocator.count().catch(() => 0);
  
  // Empty state
  const emptyStateLocator = page.locator(
    '[data-testid="empty-state"], [class*="empty-state"], text=/ingen resultater|no results|ingen data/i'
  ).first();
  const emptyStateVisible = await emptyStateLocator.isVisible().catch(() => false);
  
  // Row actions
  const rowActionsLocator = page.locator(
    'tbody tr button, [data-testid*="row-action"], button[aria-label*="actions"]'
  ).first();
  const rowActionsVisible = await rowActionsLocator.isVisible().catch(() => false);
  
  // Pagination
  const paginationLocator = page.locator(
    '[data-testid="pagination"], nav[aria-label*="pagination" i], [class*="pagination"]'
  ).first();
  const paginationVisible = await paginationLocator.isVisible().catch(() => false);
  
  return {
    title: titleVisible ? titleLocator : null,
    titleText,
    primaryAction: primaryActionVisible ? primaryActionLocator : null,
    search: searchVisible ? searchLocator : null,
    filters,
    dataTable: tableVisible ? tableLocator : null,
    dataRows,
    emptyState: emptyStateVisible ? emptyStateLocator : null,
    rowActions: rowActionsVisible ? rowActionsLocator : null,
    pagination: paginationVisible ? paginationLocator : null,
  };

/**
 * Assert blur-eye structure for a list view page
 */
export async function assertBlurEyeListView(
  page: Page,
  options: {
    expectedTitleContains?: string[];
    requirePrimaryAction?: boolean;
    requireSearch?: boolean;
    requireFilters?: number;
    allowEmptyState?: boolean;
  } = {}
): Promise<BlurEyeResult> {
  const {
    expectedTitleContains = [],
    requirePrimaryAction = true,
    requireSearch = true,
    requireFilters = 1,
    allowEmptyState = true,
  } = options;
  
  const elements = await discoverPageElements(page);
  const checks: BlurEyeResult['checks'] = [];
  
  // 1. Page title exists
  const hasTitleCheck = {
    name: 'Page title visible',
    passed: elements.title !== null && elements.titleText.length > 0,
    details: elements.titleText || 'No title found',
  };
  checks.push(hasTitleCheck);
  
  // 2. Title contains expected text
  if (expectedTitleContains.length > 0) {
    const lowerTitle = elements.titleText.toLowerCase();
    const titleMatches = expectedTitleContains.some(t => lowerTitle.includes(t.toLowerCase()));
    checks.push({
      name: 'Page title contains expected text',
      passed: titleMatches,
      details: `Title: "${elements.titleText}", expected one of: ${expectedTitleContains.join(', ')}`,
    });
  }
  
  // 3. Primary action (if required)
  if (requirePrimaryAction) {
    checks.push({
      name: 'Primary action visible',
      passed: elements.primaryAction !== null,
      details: elements.primaryAction ? 'Found' : 'Not found',
    });
  }
  
  // 4. Search (if required)
  if (requireSearch) {
    checks.push({
      name: 'Search input visible',
      passed: elements.search !== null,
      details: elements.search ? 'Found' : 'Not found',
    });
  }
  
  // 5. Filters
  if (requireFilters > 0) {
    checks.push({
      name: `At least ${requireFilters} filter(s) visible`,
      passed: elements.filters.length >= requireFilters,
      details: `Found ${elements.filters.length} filter(s)`,
    });
  }
  
  // 6. Data table or empty state
  const hasDataView = elements.dataTable !== null || (allowEmptyState && elements.emptyState !== null);
  checks.push({
    name: 'Data table or empty state visible',
    passed: hasDataView,
    details: elements.dataTable 
      ? `Table with ${elements.dataRows} rows` 
      : elements.emptyState 
        ? 'Empty state shown' 
        : 'Neither found',
  });
  
  // 7. Row actions (if has data)
  if (elements.dataRows > 0) {
    checks.push({
      name: 'Row actions available',
      passed: elements.rowActions !== null,
      details: elements.rowActions ? 'Found' : 'Not found',
    });
  }
  
  const allPassed = checks.every(c => c.passed);
  
  return { passed: allPassed, checks };

/**
 * Assert blur-eye structure for a wizard/form view
 */
export async function assertBlurEyeWizardView(page: Page): Promise<BlurEyeResult> {
  const checks: BlurEyeResult['checks'] = [];
  
  // 1. Step indicator
  const stepIndicator = page.locator('[data-testid="wizard-steps"], [class*="stepper"], [role="tablist"]').first();
  const hasStepIndicator = await stepIndicator.isVisible().catch(() => false);
  checks.push({
    name: 'Step indicator visible',
    passed: hasStepIndicator,
  });
  
  // 2. Form fields
  const formFields = page.locator('input:not([type="hidden"]), textarea, select');
  const fieldCount = await formFields.count();
  checks.push({
    name: 'Form fields present',
    passed: fieldCount > 0,
    details: `Found ${fieldCount} field(s)`,
  });
  
  // 3. Navigation buttons
  const nextBtn = page.locator('button:has-text("Neste"), button:has-text("Next"), button:has-text("Fortsett")').first();
  const hasNext = await nextBtn.isVisible().catch(() => false);
  checks.push({
    name: 'Next/Continue button visible',
    passed: hasNext,
  });
  
  // 4. Cancel/Back option
  const cancelBtn = page.locator('button:has-text("Avbryt"), button:has-text("Tilbake"), a[href*="list"]').first();
  const hasCancel = await cancelBtn.isVisible().catch(() => false);
  checks.push({
    name: 'Cancel/Back option visible',
    passed: hasCancel,
  });
  
  // 5. Save draft (optional but desired)
  const saveDraftBtn = page.locator('button:has-text("Lagre utkast"), button:has-text("Save draft")').first();
  const hasSaveDraft = await saveDraftBtn.isVisible().catch(() => false);
  checks.push({
    name: 'Save draft option',
    passed: hasSaveDraft,
    details: hasSaveDraft ? 'Available' : 'Not available (optional)',
  });
  
  const allPassed = checks.filter(c => !c.name.includes('optional')).every(c => c.passed);
  
  return { passed: allPassed, checks };

/**
 * Assert blur-eye structure for a settings/form page
 */
export async function assertBlurEyeSettingsView(page: Page): Promise<BlurEyeResult> {
  const checks: BlurEyeResult['checks'] = [];
  
  // 1. Page title
  const title = page.locator('h1, h2, [data-testid="page-title"]').first();
  const hasTitle = await title.isVisible().catch(() => false);
  checks.push({
    name: 'Page title visible',
    passed: hasTitle,
    details: hasTitle ? await title.textContent() : 'Not found',
  });
  
  // 2. Form fields or toggles
  const formElements = page.locator('input, textarea, select, [role="switch"], button[role="checkbox"]');
  const elementCount = await formElements.count();
  checks.push({
    name: 'Settings controls present',
    passed: elementCount > 0,
    details: `Found ${elementCount} control(s)`,
  });
  
  // 3. Save button
  const saveBtn = page.locator('button:has-text("Lagre"), button:has-text("Save"), button[type="submit"]').first();
  const hasSave = await saveBtn.isVisible().catch(() => false);
  checks.push({
    name: 'Save button visible',
    passed: hasSave,
  });
  
  const allPassed = checks.every(c => c.passed);
  
  return { passed: allPassed, checks };

/**
 * Assert no forbidden terminology on page
 */
export async function assertNoForbiddenTerminology(page: Page): Promise<{ passed: boolean; terms: string[] }> {
  const bodyText = await page.locator('body').textContent() || '';
  const lowerText = bodyText.toLowerCase();
  
  const foundTerms: string[] = [];
  for (const term of FORBIDDEN_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }
  
  return {
    passed: foundTerms.length === 0,
    terms: foundTerms,
  };

/**
 * Assert no missing i18n keys on page
 */
export async function assertNoMissingI18nKeys(page: Page): Promise<{ passed: boolean; keys: string[] }> {
  const bodyText = await page.locator('body').textContent() || '';
  
  const foundKeys: string[] = [];
  for (const pattern of I18N_KEY_PATTERNS) {
    const matches = bodyText.match(pattern);
    if (matches) {
      // Filter out false positives
      const suspicious = matches.filter(m => 
        !m.includes('http') && 
        !m.includes('@') &&
        !m.includes('.com') &&
        !m.includes('.no')
      );
      foundKeys.push(...suspicious);
    }
  }
  
  return {
    passed: foundKeys.length === 0,
    keys: [...new Set(foundKeys)],
  };

/**
 * Assert page is ready (not stuck loading)
 */
export async function assertPageReady(page: Page, timeoutMs: number = 10000): Promise<boolean> {
  const readyMarkers = [
    'h1, h2, [data-testid="page-title"]',
    'table tbody tr, [data-testid*="row"]',
    '[data-testid="empty-state"]',
    'form input, form textarea',
  ];
  
  for (const marker of readyMarkers) {
    try {
      await page.locator(marker).first().waitFor({ timeout: timeoutMs });
      return true;
    } catch {
      // Try next marker
    }
  }
  
  // Check if still loading
  const loadingSpinner = page.locator('[data-testid="loading"], .loading, [aria-busy="true"]');
  const isLoading = await loadingSpinner.isVisible().catch(() => false);
  
  return !isLoading;

/**
 * Get current feature flags from the page context
 */
export async function getFeatureFlagsSnapshot(page: Page): Promise<Record<string, boolean>> {
  try {
    // Try to extract from window context or API response
    const flags = await page.evaluate(() => {
      // Check for common feature flag storage locations
      const win = window as any;
      if (win.__FEATURE_FLAGS__) return win.__FEATURE_FLAGS__;
      if (win.featureFlags) return win.featureFlags;
      
      // Check localStorage
      const stored = localStorage.getItem('featureFlags');
      if (stored) return JSON.parse(stored);
      
      return {};
    });
    
    return flags;
  } catch {
    return {};
  }

/**
 * Get current user capabilities from the page context
 */
export async function getCapabilitiesSnapshot(page: Page): Promise<string[]> {
  try {
    const capabilities = await page.evaluate(() => {
      const win = window as any;
      if (win.__USER_CAPABILITIES__) return win.__USER_CAPABILITIES__;
      if (win.userCapabilities) return win.userCapabilities;
      
      const stored = localStorage.getItem('capabilities');
      if (stored) return JSON.parse(stored);
      
      return [];
    });
    
    return Array.isArray(capabilities) ? capabilities : [];
  } catch {
    return [];
  }

/**
 * Log blur-eye check results in a formatted way
 */
export function logBlurEyeResults(results: BlurEyeResult, pageName: string): void {
  console.log(`\n📊 Blur-Eye Check: ${pageName}`);
  console.log('─'.repeat(50));
  
  for (const check of results.checks) {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}${check.details ? ` (${check.details})` : ''}`);
  }
  
  console.log('─'.repeat(50));
  console.log(`Overall: ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
