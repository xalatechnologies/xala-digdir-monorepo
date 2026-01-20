#!/usr/bin/env node
/**
 * Test Migration Script
 * 
 * Migrates test files from manual QueryClientProvider wrappers
 * to renderWithRuntime() from @digilist/testing.
 * 
 * Usage:
 *   cd packages/testing && node scripts/migrate-tests.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// Files to migrate (relative to packages/testing)
const PATTERNS = [
  'suites/unit/apps/**/*.test.tsx',
  'suites/unit/apps/**/*.test.ts',
];

// Old imports to remove
const OLD_IMPORTS = [
  /import \{ render,?\s*/g,
  /import \{ QueryClient, QueryClientProvider \} from '@tanstack\/react-query';?\n?/g,
  /import \{ BrowserRouter \} from 'react-router-dom';?\n?/g,
  /import \{ I18nProvider \} from '@xala\/i18n';?\n?/g,
  /import \{ DesignsystemetProvider \} from '@xala\/ds';?\n?/g,
];

// New import to add
const NEW_IMPORT = "import { renderWithRuntime, screen, fireEvent, waitFor } from '@digilist/testing';\n";

// Pattern to match TestWrapper function
const TEST_WRAPPER_PATTERN = /\/\/ Test wrapper component\nfunction TestWrapper\(\{ children \}:.*?\n}\n/gs;

// Pattern to match render(<TestWrapper>...) calls
const RENDER_WITH_WRAPPER_PATTERN = /render\(\s*\n?\s*<TestWrapper>\s*\n?\s*<(\w+)([^>]*)\s*\/>\s*\n?\s*<\/TestWrapper>\s*\n?\s*\)/g;

async function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changes = [];

  // Skip if already using renderWithRuntime
  if (content.includes('renderWithRuntime')) {
    return { filePath, changes: [], skipped: true };
  }

  // Skip if no QueryClientProvider
  if (!content.includes('QueryClientProvider')) {
    return { filePath, changes: [], skipped: true };
  }

  // 1. Remove old imports
  for (const pattern of OLD_IMPORTS) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      changes.push(`Removed import: ${pattern.source}`);
    }
  }

  // 2. Remove TestWrapper function
  if (TEST_WRAPPER_PATTERN.test(content)) {
    content = content.replace(TEST_WRAPPER_PATTERN, '');
    changes.push('Removed TestWrapper function');
  }

  // 3. Replace render(<TestWrapper>...) with renderWithRuntime(...)
  const matches = content.matchAll(RENDER_WITH_WRAPPER_PATTERN);
  for (const match of [...matches]) {
    const componentName = match[1];
    const props = match[2] || '';
    const newRender = `renderWithRuntime(<${componentName}${props}/>, { user: 'admin' })`;
    content = content.replace(match[0], newRender);
    changes.push(`Replaced render with renderWithRuntime for ${componentName}`);
  }

  // 4. Add new import if changes were made
  if (changes.length > 0) {
    // Add import after first import statement
    const firstImportEnd = content.indexOf('\n', content.indexOf('import'));
    if (firstImportEnd > -1) {
      content = content.slice(0, firstImportEnd + 1) + NEW_IMPORT + content.slice(firstImportEnd + 1);
      changes.push('Added renderWithRuntime import');
    }
  }

  // 5. Clean up duplicate empty lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update: ${filePath}`);
    console.log(`  Changes: ${changes.join(', ')}`);
  } else if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
    console.log(`  Changes: ${changes.join(', ')}`);
  }

  return { filePath, changes, skipped: false };
}

async function main() {
  console.log('Starting test migration...\n');
  
  const files = [];
  for (const pattern of PATTERNS) {
    const matches = await glob(pattern, { cwd: process.cwd() });
    files.push(...matches);
  }

  console.log(`Found ${files.length} test files to analyze\n`);

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    const result = await migrateFile(file);
    if (result.skipped) {
      skipped++;
    } else if (result.changes.length > 0) {
      migrated++;
    }
  }

  console.log(`\n✅ Migration complete`);
  console.log(`   Migrated: ${migrated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${files.length}`);
}

main().catch(console.error);
