#!/usr/bin/env node
/**
 * i18n Key Completeness Check
 *
 * Validates that:
 * 1. All keys in nb.ts exist in en.ts (and vice versa)
 * 2. All interpolation placeholders match between locales
 * 3. No empty translation values
 * 4. Key naming follows conventions
 *
 * Usage:
 *   node scripts/check-i18n-keys.js [--strict] [--json]
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Errors found
 *   2 - Warnings found (only in strict mode)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_PATH = path.join(__dirname, '../packages/i18n/src/locales');
const CANONICAL_LOCALE = 'nb';
const SUPPORTED_LOCALES = ['nb', 'en'];

// Parse arguments
const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const jsonOutput = args.includes('--json');

/**
 * Load translation file dynamically
 */
async function loadTranslations(locale) {
  const filePath = path.join(LOCALES_PATH, `${locale}.ts`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract the exported object using regex (simple parser)
  const translations = {};
  const keyValuePattern = /'([^']+)':\s*'([^']*)'/g;
  let match;

  while ((match = keyValuePattern.exec(content)) !== null) {
    translations[match[1]] = match[2];
  }

  return translations;
}

/**
 * Extract interpolation placeholders from a string
 */
function extractPlaceholders(str) {
  const matches = str.match(/\{\{(\w+)\}\}/g) || [];
  return matches.sort();
}

/**
 * Check key naming convention
 */
function checkKeyConvention(key) {
  const warnings = [];

  // Should use dot notation
  if (key.includes('_')) {
    warnings.push(`Key uses underscores instead of dots: ${key}`);
  }

  // Should be lowercase (except for acronyms)
  if (/[A-Z]/.test(key) && !/^[a-z]+\.[A-Z]{2,}/.test(key)) {
    // Allow patterns like 'api.URL' but warn on 'Common.Save'
    if (/\.[A-Z][a-z]/.test(key)) {
      warnings.push(`Key uses PascalCase: ${key}`);
    }
  }

  // Should have at least one namespace
  if (!key.includes('.')) {
    warnings.push(`Key has no namespace: ${key}`);
  }

  return warnings;
}

/**
 * Main validation function
 */
async function validate() {
  const results = {
    errors: [],
    warnings: [],
    stats: {
      totalKeys: {},
      missingInEn: 0,
      missingInNb: 0,
      emptyValues: 0,
      placeholderMismatches: 0,
      conventionViolations: 0,
    },
  };

  // Load translations
  const translations = {};
  for (const locale of SUPPORTED_LOCALES) {
    translations[locale] = await loadTranslations(locale);
    results.stats.totalKeys[locale] = Object.keys(translations[locale]).length;
  }

  const nbKeys = new Set(Object.keys(translations.nb));
  const enKeys = new Set(Object.keys(translations.en));

  // Check 1: Keys in nb missing from en
  for (const key of nbKeys) {
    if (!enKeys.has(key)) {
      results.errors.push({
        type: 'missing_key',
        locale: 'en',
        key,
        message: `Key "${key}" exists in nb but missing in en`,
      });
      results.stats.missingInEn++;
    }
  }

  // Check 2: Keys in en missing from nb
  for (const key of enKeys) {
    if (!nbKeys.has(key)) {
      results.errors.push({
        type: 'missing_key',
        locale: 'nb',
        key,
        message: `Key "${key}" exists in en but missing in nb`,
      });
      results.stats.missingInNb++;
    }
  }

  // Check 3: Empty values
  for (const locale of SUPPORTED_LOCALES) {
    for (const [key, value] of Object.entries(translations[locale])) {
      if (!value || value.trim() === '') {
        results.errors.push({
          type: 'empty_value',
          locale,
          key,
          message: `Key "${key}" has empty value in ${locale}`,
        });
        results.stats.emptyValues++;
      }
    }
  }

  // Check 4: Placeholder consistency
  for (const key of nbKeys) {
    if (!enKeys.has(key)) continue;

    const nbPlaceholders = extractPlaceholders(translations.nb[key] || '');
    const enPlaceholders = extractPlaceholders(translations.en[key] || '');

    if (JSON.stringify(nbPlaceholders) !== JSON.stringify(enPlaceholders)) {
      results.errors.push({
        type: 'placeholder_mismatch',
        key,
        nb: nbPlaceholders,
        en: enPlaceholders,
        message: `Placeholder mismatch in "${key}": nb=${nbPlaceholders.join(',')} vs en=${enPlaceholders.join(',')}`,
      });
      results.stats.placeholderMismatches++;
    }
  }

  // Check 5: Key naming conventions (warnings)
  for (const key of nbKeys) {
    const warnings = checkKeyConvention(key);
    for (const warning of warnings) {
      results.warnings.push({
        type: 'convention',
        key,
        message: warning,
      });
      results.stats.conventionViolations++;
    }
  }

  return results;
}

/**
 * Output results
 */
function outputResults(results) {
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log('\n========================================');
  console.log('i18n KEY COMPLETENESS CHECK');
  console.log('========================================\n');

  console.log('STATISTICS');
  console.log('----------------------------------------');
  console.log(`Total keys (nb): ${results.stats.totalKeys.nb}`);
  console.log(`Total keys (en): ${results.stats.totalKeys.en}`);
  console.log(`Missing in en: ${results.stats.missingInEn}`);
  console.log(`Missing in nb: ${results.stats.missingInNb}`);
  console.log(`Empty values: ${results.stats.emptyValues}`);
  console.log(`Placeholder mismatches: ${results.stats.placeholderMismatches}`);
  console.log(`Convention violations: ${results.stats.conventionViolations}`);

  if (results.errors.length > 0) {
    console.log('\n----------------------------------------');
    console.log('ERRORS');
    console.log('----------------------------------------\n');

    for (const error of results.errors) {
      console.log(`❌ ${error.message}`);
    }
  }

  if (results.warnings.length > 0 && strictMode) {
    console.log('\n----------------------------------------');
    console.log('WARNINGS (strict mode)');
    console.log('----------------------------------------\n');

    // Group by type to avoid spam
    const grouped = {};
    for (const warning of results.warnings) {
      if (!grouped[warning.type]) {
        grouped[warning.type] = [];
      }
      grouped[warning.type].push(warning);
    }

    for (const [type, warnings] of Object.entries(grouped)) {
      console.log(`\n${type.toUpperCase()} (${warnings.length} issues):`);
      // Show first 10
      const sample = warnings.slice(0, 10);
      for (const w of sample) {
        console.log(`  ⚠️  ${w.message}`);
      }
      if (warnings.length > 10) {
        console.log(`  ... and ${warnings.length - 10} more`);
      }
    }
  }

  console.log('\n========================================');

  if (results.errors.length === 0) {
    console.log('✅ All i18n checks passed!');
  } else {
    console.log(`❌ ${results.errors.length} errors found`);
  }

  if (results.warnings.length > 0) {
    console.log(`⚠️  ${results.warnings.length} warnings`);
  }

  console.log('========================================\n');
}

/**
 * Main entry point
 */
async function main() {
  try {
    const results = await validate();
    outputResults(results);

    // Exit codes
    if (results.errors.length > 0) {
      process.exit(1);
    }

    if (strictMode && results.warnings.length > 0) {
      process.exit(2);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error running i18n check:', error);
    process.exit(1);
  }
}

main();
