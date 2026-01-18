#!/usr/bin/env node
/**
 * i18n Unused Keys Check
 *
 * Finds translation keys that are not referenced in the codebase.
 * Helps identify dead translations that can be removed.
 *
 * Usage:
 *   node scripts/check-unused-keys.js [--json] [--remove]
 *
 * Options:
 *   --json    Output as JSON
 *   --remove  Generate a file listing keys to remove (does not auto-delete)
 *
 * Exit codes:
 *   0 - No unused keys found
 *   1 - Unused keys found (informational, not a failure)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_PATH = path.join(ROOT_DIR, 'packages/i18n/src/locales');
const SCAN_DIRS = ['apps', 'packages'];
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const SKIP_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];
const SKIP_FILES = ['.test.', '.spec.', '.stories.'];

// Parse arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const generateRemoveFile = args.includes('--remove');

/**
 * Load translation keys from file
 */
function loadTranslationKeys(locale) {
  const filePath = path.join(LOCALES_PATH, `${locale}.ts`);
  const content = fs.readFileSync(filePath, 'utf8');

  const keys = new Set();
  const keyPattern = /'([^']+)':\s*'/g;
  let match;

  while ((match = keyPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return keys;
}

/**
 * Recursively get all source files
 */
function getSourceFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (!EXTENSIONS.includes(ext)) continue;
        if (SKIP_FILES.some((s) => entry.name.includes(s))) continue;
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Find all translation key usages in source files
 */
function findUsedKeys(files) {
  const usedKeys = new Set();

  // Patterns to match t('key') or t("key") or t(`key`)
  const patterns = [
    /t\s*\(\s*['"`]([^'"`]+)['"`]/g, // t('key'), t("key"), t(`key`)
    /useT\s*\(\s*\)\s*[^)]*['"`]([^'"`]+)['"`]/g, // useT() usage
    /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g, // i18n.t('key')
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex state
      let match;
      while ((match = pattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    }
  }

  return usedKeys;
}

/**
 * Main function
 */
async function main() {
  // Load all translation keys (canonical: nb)
  const allKeys = loadTranslationKeys('nb');

  // Get all source files
  const files = [];
  for (const dir of SCAN_DIRS) {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      files.push(...getSourceFiles(fullPath));
    }
  }

  // Find used keys
  const usedKeys = findUsedKeys(files);

  // Find unused keys
  const unusedKeys = [];
  for (const key of allKeys) {
    if (!usedKeys.has(key)) {
      unusedKeys.push(key);
    }
  }

  // Sort alphabetically
  unusedKeys.sort();

  // Group by namespace
  const byNamespace = {};
  for (const key of unusedKeys) {
    const ns = key.split('.')[0] || 'root';
    if (!byNamespace[ns]) {
      byNamespace[ns] = [];
    }
    byNamespace[ns].push(key);
  }

  // Output results
  const results = {
    totalKeys: allKeys.size,
    usedKeys: usedKeys.size,
    unusedKeys: unusedKeys.length,
    filesScanned: files.length,
    unusedByNamespace: byNamespace,
    unusedKeysList: unusedKeys,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('\n========================================');
    console.log('i18n UNUSED KEYS CHECK');
    console.log('========================================\n');

    console.log('STATISTICS');
    console.log('----------------------------------------');
    console.log(`Total keys: ${results.totalKeys}`);
    console.log(`Used keys: ${results.usedKeys}`);
    console.log(`Unused keys: ${results.unusedKeys}`);
    console.log(`Files scanned: ${results.filesScanned}`);

    if (unusedKeys.length > 0) {
      console.log('\n----------------------------------------');
      console.log('UNUSED KEYS BY NAMESPACE');
      console.log('----------------------------------------\n');

      for (const [ns, keys] of Object.entries(byNamespace)) {
        console.log(`\n${ns} (${keys.length} unused):`);
        const sample = keys.slice(0, 10);
        for (const key of sample) {
          console.log(`  - ${key}`);
        }
        if (keys.length > 10) {
          console.log(`  ... and ${keys.length - 10} more`);
        }
      }

      // Note: Many "unused" keys might be used dynamically
      console.log('\n⚠️  WARNING: Some keys may be used dynamically.');
      console.log('   Review carefully before removing.');
    }

    console.log('\n========================================');

    if (unusedKeys.length === 0) {
      console.log('✅ No unused keys found!');
    } else {
      console.log(`📋 ${unusedKeys.length} potentially unused keys found`);
    }

    console.log('========================================\n');
  }

  // Generate remove file if requested
  if (generateRemoveFile && unusedKeys.length > 0) {
    const removeFilePath = path.join(ROOT_DIR, 'unused-i18n-keys.txt');
    fs.writeFileSync(removeFilePath, unusedKeys.join('\n'));
    console.log(`📄 Unused keys list saved to: ${removeFilePath}`);
  }

  // Exit code (informational - unused keys are not necessarily an error)
  process.exit(unusedKeys.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
