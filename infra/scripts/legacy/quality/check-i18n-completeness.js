#!/usr/bin/env node
/**
 * i18n Key Completeness Checker
 * 
 * Verifies that all i18n keys exist in both nb and en locales.
 * Fails CI if any missing keys are found.
 * 
 * Usage: node scripts/quality/check-i18n-completeness.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  localeDir: path.resolve(__dirname, '../../packages/i18n/src/locales'),
  requiredLocales: ['nb', 'en'],
  primaryLocale: 'nb',
  outputFormat: 'text', // 'text' or 'json'
  failOnMissing: true,
};

/**
 * Flatten nested object keys with dot notation
 */
function flattenKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Load locale file
 */
function loadLocale(localePath) {
  try {
    const content = fs.readFileSync(localePath, 'utf-8');
    
    // Handle both .ts and .json files
    if (localePath.endsWith('.json')) {
      return JSON.parse(content);
    } else if (localePath.endsWith('.ts')) {
      // Extract default export from TS file
      const match = content.match(/export\s+default\s+({[\s\S]*?})\s*;?\s*$/);
      if (match) {
        // Very basic TS to JSON conversion (for simple objects)
        const jsonLike = match[1]
          .replace(/\/\/.*$/gm, '') // Remove comments
          .replace(/'/g, '"')      // Single to double quotes
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']');
        
        return JSON.parse(jsonLike);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load ${localePath}:`, error.message);
    return null;
  }
}

/**
 * Find locale files
 */
function findLocaleFiles(localeDir) {
  const files = {};
  
  for (const locale of CONFIG.requiredLocales) {
    const possiblePaths = [
      path.join(localeDir, `${locale}.ts`),
      path.join(localeDir, `${locale}.json`),
      path.join(localeDir, locale, 'index.ts'),
      path.join(localeDir, locale, 'index.json'),
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        files[locale] = p;
        break;
      }
    }
  }
  
  return files;
}

/**
 * Main check
 */
function checkCompleteness() {
  console.log('🌐 Checking i18n key completeness...\n');
  
  const localeFiles = findLocaleFiles(CONFIG.localeDir);
  const locales = {};
  const allKeys = new Set();
  const missingByLocale = {};
  
  // Load all locales
  for (const [locale, filePath] of Object.entries(localeFiles)) {
    const data = loadLocale(filePath);
    if (data) {
      locales[locale] = flattenKeys(data);
      locales[locale].forEach(k => allKeys.add(k));
      console.log(`  ✓ Loaded ${locale}: ${locales[locale].length} keys`);
    } else {
      console.log(`  ✗ Failed to load ${locale}`);
    }
  }
  
  // Check missing locales
  for (const locale of CONFIG.requiredLocales) {
    if (!localeFiles[locale]) {
      console.log(`  ✗ Missing locale file: ${locale}`);
    }
  }
  
  console.log(`\n  Total unique keys: ${allKeys.size}\n`);
  
  // Find missing keys per locale
  for (const locale of CONFIG.requiredLocales) {
    if (!locales[locale]) continue;
    
    const localeKeys = new Set(locales[locale]);
    const missing = [...allKeys].filter(k => !localeKeys.has(k));
    
    if (missing.length > 0) {
      missingByLocale[locale] = missing;
    }
  }
  
  // Report results
  let hasErrors = false;
  
  for (const [locale, missing] of Object.entries(missingByLocale)) {
    if (missing.length > 0) {
      hasErrors = true;
      console.log(`❌ Missing keys in ${locale} (${missing.length}):`);
      
      // Show first 10
      missing.slice(0, 10).forEach(k => console.log(`     - ${k}`));
      
      if (missing.length > 10) {
        console.log(`     ... and ${missing.length - 10} more`);
      }
      console.log('');
    }
  }
  
  if (!hasErrors) {
    console.log('✅ All locales have complete key coverage!\n');
  }
  
  // Output summary
  const summary = {
    totalKeys: allKeys.size,
    locales: Object.fromEntries(
      Object.entries(locales).map(([k, v]) => [k, v.length])
    ),
    missing: missingByLocale,
    success: !hasErrors,
  };
  
  if (CONFIG.outputFormat === 'json') {
    console.log(JSON.stringify(summary, null, 2));
  }
  
  // Exit with error if missing keys
  if (hasErrors && CONFIG.failOnMissing) {
    process.exit(1);
  }
}

checkCompleteness();
