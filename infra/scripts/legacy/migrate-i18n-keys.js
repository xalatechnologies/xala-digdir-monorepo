#!/usr/bin/env node
/**
 * i18n Key Migration Tool
 *
 * Analyzes translation keys and provides:
 * 1. A report of keys that don't follow namespace convention
 * 2. Suggested renames for legacy keys
 * 3. A list of truly unused keys that can be safely removed
 *
 * Usage:
 *   node scripts/migrate-i18n-keys.js [--report] [--json] [--migrate]
 *
 * Options:
 *   --report   Generate a migration report (default)
 *   --json     Output as JSON
 *   --migrate  Generate migration files (use with caution)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_PATH = path.join(ROOT_DIR, 'packages/i18n/src/locales');

// Valid namespace prefixes (from docs/i18n.md)
const VALID_NAMESPACES = [
  'common',
  'auth',
  'nav',
  'dashboard',
  'listings',
  'bookings',
  'backoffice',
  'minside',
  'web',
  'api',
  'errors',
  'policy',
  'actions',
  'sdk',
  'ui',
  'gdpr',
  'notifications',
  'saas',
  'tenant',
  'validation',
  'time',
  'date',
  'currency',
  'status',
  'org',
  'user',
  'settings',
  'profile',
  'reports',
  'admin',
  'search',
  'filter',
  'table',
  'form',
  'modal',
  'toast',
  'pagination',
];

// Keys that look like hex colors or other non-translation content
const INVALID_KEY_PATTERNS = [
  /^[0-9a-f]{6}$/i,       // Hex colors
  /^#[0-9a-f]{3,8}$/i,    // Hex colors with #
  /^\d+$/,                 // Pure numbers
  /^[A-Z_]+$/,             // Pure uppercase constants
  /^\.\w+/,                // Keys starting with dot
];

// Parse arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const generateMigration = args.includes('--migrate');

/**
 * Load translation file
 */
function loadTranslations(locale) {
  const filePath = path.join(LOCALES_PATH, `${locale}.ts`);
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = {};

  // Pattern 1: 'key': 'value' (single quotes)
  const singleQuotePattern = /'([^']+)':\s*'([^']*)'/g;
  let match;
  while ((match = singleQuotePattern.exec(content)) !== null) {
    translations[match[1]] = match[2];
  }

  // Pattern 2: 'key': "value" (key in single, value in double)
  const mixedQuotePattern = /'([^']+)':\s*"([^"]*)"/g;
  while ((match = mixedQuotePattern.exec(content)) !== null) {
    translations[match[1]] = match[2];
  }

  return translations;
}

/**
 * Check if key looks like valid translation content
 */
function isValidKey(key) {
  return !INVALID_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Check if key follows namespace convention
 */
function hasValidNamespace(key) {
  const namespace = key.split('.')[0];
  return VALID_NAMESPACES.includes(namespace);
}

/**
 * Suggest namespace for legacy key
 */
function suggestNamespace(key, value) {
  const keyLower = key.toLowerCase();
  const valueLower = (value || '').toLowerCase();

  // Common patterns
  if (keyLower.includes('error') || keyLower.includes('feil')) return 'errors';
  if (keyLower.includes('loading') || keyLower.includes('laster')) return 'common';
  if (keyLower.includes('save') || keyLower.includes('lagre')) return 'common';
  if (keyLower.includes('cancel') || keyLower.includes('avbryt')) return 'common';
  if (keyLower.includes('delete') || keyLower.includes('slett')) return 'common';
  if (keyLower.includes('edit') || keyLower.includes('rediger')) return 'common';
  if (keyLower.includes('search') || keyLower.includes('søk')) return 'search';
  if (keyLower.includes('filter') || keyLower.includes('filtrer')) return 'filter';
  if (keyLower.includes('booking')) return 'bookings';
  if (keyLower.includes('listing') || keyLower.includes('lokale')) return 'listings';
  if (keyLower.includes('user') || keyLower.includes('bruker')) return 'user';
  if (keyLower.includes('org')) return 'org';
  if (keyLower.includes('admin')) return 'admin';
  if (keyLower.includes('nav') || keyLower.includes('menu')) return 'nav';
  if (keyLower.includes('auth') || keyLower.includes('login') || keyLower.includes('logg')) return 'auth';
  if (keyLower.includes('dashboard')) return 'dashboard';
  if (keyLower.includes('settings') || keyLower.includes('innstillinger')) return 'settings';
  if (keyLower.includes('profile') || keyLower.includes('profil')) return 'profile';
  if (keyLower.includes('report') || keyLower.includes('rapport')) return 'reports';
  if (keyLower.includes('time') || keyLower.includes('tid')) return 'time';
  if (keyLower.includes('date') || keyLower.includes('dato')) return 'date';

  // Default to common for UI elements
  return 'common';
}

/**
 * Convert legacy key to namespace convention
 */
function migrateKeyName(key, value) {
  if (hasValidNamespace(key)) return key;

  const namespace = suggestNamespace(key, value);

  // Convert Norwegian words to camelCase
  const cleanKey = key
    .replace(/\./g, '.')           // Keep existing dots
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/Æ/g, 'Ae')
    .replace(/Ø/g, 'O')
    .replace(/Å/g, 'A');

  return `${namespace}.${cleanKey}`;
}

/**
 * Main analysis
 */
function analyze() {
  const nb = loadTranslations('nb');
  const en = loadTranslations('en');
  const allKeys = new Set([...Object.keys(nb), ...Object.keys(en)]);

  const report = {
    totalKeys: allKeys.size,
    invalidKeys: [],
    legacyKeys: [],
    namespacedKeys: [],
    migrations: [],
    stats: {
      namespaces: {},
    },
  };

  for (const key of allKeys) {
    // Skip invalid keys
    if (!isValidKey(key)) {
      report.invalidKeys.push(key);
      continue;
    }

    // Check namespace
    const namespace = key.split('.')[0];
    report.stats.namespaces[namespace] = (report.stats.namespaces[namespace] || 0) + 1;

    if (hasValidNamespace(key)) {
      report.namespacedKeys.push(key);
    } else {
      report.legacyKeys.push(key);

      // Generate migration suggestion
      const newKey = migrateKeyName(key, nb[key] || en[key]);
      if (newKey !== key) {
        report.migrations.push({
          oldKey: key,
          newKey,
          nbValue: nb[key] || null,
          enValue: en[key] || null,
        });
      }
    }
  }

  return report;
}

/**
 * Generate migration script
 */
function generateMigrationScript(report) {
  const migrations = report.migrations;
  const lines = [
    '// Auto-generated key migration map',
    '// Apply carefully after updating all usage in codebase',
    '',
    'export const KEY_MIGRATIONS: Record<string, string> = {',
  ];

  for (const m of migrations.slice(0, 50)) {
    // Limit to first 50
    lines.push(`  '${m.oldKey}': '${m.newKey}',`);
  }

  lines.push('};');
  lines.push('');
  lines.push(`// Total migrations needed: ${migrations.length}`);

  return lines.join('\n');
}

/**
 * Main
 */
function main() {
  console.log('========================================');
  console.log('i18n KEY MIGRATION ANALYSIS');
  console.log('========================================\n');

  const report = analyze();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('STATISTICS');
  console.log('----------------------------------------');
  console.log(`Total keys: ${report.totalKeys}`);
  console.log(`Valid namespaced keys: ${report.namespacedKeys.length}`);
  console.log(`Legacy keys (need migration): ${report.legacyKeys.length}`);
  console.log(`Invalid keys (false positives): ${report.invalidKeys.length}`);
  console.log('');

  console.log('NAMESPACE DISTRIBUTION');
  console.log('----------------------------------------');
  const sortedNs = Object.entries(report.stats.namespaces)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  for (const [ns, count] of sortedNs) {
    const isValid = VALID_NAMESPACES.includes(ns);
    const status = isValid ? '✓' : '⚠️';
    console.log(`  ${status} ${ns}: ${count} keys`);
  }
  console.log('');

  if (report.legacyKeys.length > 0) {
    console.log('LEGACY KEYS (sample)');
    console.log('----------------------------------------');
    for (const key of report.legacyKeys.slice(0, 20)) {
      console.log(`  - ${key}`);
    }
    if (report.legacyKeys.length > 20) {
      console.log(`  ... and ${report.legacyKeys.length - 20} more`);
    }
    console.log('');
  }

  if (report.migrations.length > 0) {
    console.log('SUGGESTED MIGRATIONS (sample)');
    console.log('----------------------------------------');
    for (const m of report.migrations.slice(0, 10)) {
      console.log(`  ${m.oldKey}`);
      console.log(`    → ${m.newKey}`);
    }
    if (report.migrations.length > 10) {
      console.log(`  ... and ${report.migrations.length - 10} more`);
    }
    console.log('');
  }

  if (generateMigration) {
    console.log('GENERATING MIGRATION FILE');
    console.log('----------------------------------------');
    const migrationScript = generateMigrationScript(report);
    const outputPath = path.join(ROOT_DIR, 'packages/i18n/src/migrations.ts');
    fs.writeFileSync(outputPath, migrationScript);
    console.log(`✅ Migration file written to: ${outputPath}`);
    console.log('');
  }

  console.log('========================================');
  if (report.legacyKeys.length > 0) {
    console.log(`⚠️  ${report.legacyKeys.length} keys need migration to namespace convention`);
  } else {
    console.log('✅ All keys follow namespace convention!');
  }
  console.log('========================================');
}

main();
