#!/usr/bin/env node
/**
 * Comprehensive Test Config Migration Script
 * 
 * Migrates ALL test files to use centralized test-config.ts instead of hardcoded URLs.
 * This ensures tests work across local, staging, and production environments.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// Patterns to find and replace
const PATTERNS = [
  // API URL patterns
  {
    find: /const\s+(?:API_URL|API_BASE|API_BASE_URL)\s*=\s*(?:process\.env\.API_URL\s*\|\|\s*)?['"]https?:\/\/localhost:\d+(?:\/api)?['"];?/gi,
    addImport: true,
  },
  {
    find: /['"]http:\/\/localhost:\d+(?:\/api)?['"]/g,
    replace: 'testConfig.apiUrl',
    addImport: true,
  },
  // WebSocket URL patterns
  {
    find: /['"]ws:\/\/localhost:\d+['"]/g,
    replace: 'testConfig.wsUrl',
    addImport: true,
  },
  // Window location mocks with port
  {
    find: /origin:\s*['"]http:\/\/localhost:\d+['"]/g,
    replace: "origin: 'http://localhost:4000'",
    addImport: false,
  },
  {
    find: /href:\s*['"]http:\/\/localhost:\d+[^'"]*['"]/g,
    replace: (match) => match.replace(/localhost:\d+/, 'localhost:4000'),
    addImport: false,
  },
];

// Import statement to add
const CONFIG_IMPORT = "import { testConfig } from '@digilist/testing';";

async function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let needsImport = false;
  let modified = false;

  for (const pattern of PATTERNS) {
    if (pattern.find.test(content)) {
      if (pattern.replace) {
        if (typeof pattern.replace === 'function') {
          content = content.replace(pattern.find, pattern.replace);
        } else {
          content = content.replace(pattern.find, pattern.replace);
        }
        modified = true;
      }
      if (pattern.addImport) {
        needsImport = true;
      }
    }
    // Reset lastIndex for global regex
    pattern.find.lastIndex = 0;
  }

  // Add import if needed and not already present
  if (needsImport && !content.includes("from '@digilist/testing'")) {
    // Find the last import statement and add after it
    const importMatch = content.match(/^import\s+.*from\s+['"][^'"]+['"];?\s*$/gm);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, `${lastImport}\n${CONFIG_IMPORT}`);
      modified = true;
    } else {
      // No imports found, add at the top
      content = `${CONFIG_IMPORT}\n\n${content}`;
      modified = true;
    }
  }

  if (modified && content !== originalContent) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update: ${path.relative(PACKAGE_ROOT, filePath)}`);
      return true;
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${path.relative(PACKAGE_ROOT, filePath)}`);
    return true;
  }

  return false;
}

async function main() {
  console.log('🔧 Migrating all test files to centralized config...\n');

  // Find all test files
  const files = await glob([
    'suites/**/*.{test,spec}.{ts,tsx}',
    'contracts/**/*.{test,spec}.{ts,tsx}',
    'mocks/**/*.ts',
  ], {
    cwd: PACKAGE_ROOT,
    absolute: true,
  });

  console.log(`Found ${files.length} files to check\n`);

  let updatedCount = 0;
  for (const file of files) {
    try {
      const updated = await migrateFile(file);
      if (updated) updatedCount++;
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  console.log(`\n✅ Migration complete - Updated ${updatedCount} files`);
  if (DRY_RUN) {
    console.log('(Dry run - no files were actually modified)');
  }
}

main().catch(console.error);
