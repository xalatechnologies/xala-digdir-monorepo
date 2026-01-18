#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Extracting ALL missing translations...\n');

// Read existing translations
const nbJsonPath = 'packages/i18n/locales/nb.json';
const enJsonPath = 'packages/i18n/locales/en.json';
const nbTranslations = JSON.parse(fs.readFileSync(nbJsonPath, 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

// Flatten to get all existing keys
function flattenKeys(obj, prefix = '') {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenKeys(value, fullKey).forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

const existingKeys = flattenKeys(nbTranslations);
console.log(`📊 Existing translation keys: ${existingKeys.size}\n`);

// Scan all apps for translation usage
const appsToScan = ['apps/web/src', 'apps/minside/src', 'apps/backoffice/src'];
const usedKeys = new Set();
const hardCodedStrings = [];

console.log('🔎 Scanning apps for translation keys...\n');

appsToScan.forEach(appPath => {
  try {
    // Find all t('key') usage
    const grepResult = execSync(
      `grep -r "t('" ${appPath} | grep -o "t('[^']*')" | sed "s/t('//g" | sed "s/')//g" | sort -u`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    grepResult.split('\n').filter(Boolean).forEach(key => {
      usedKeys.add(key);
    });
  } catch (e) {
    // Grep returns non-zero if no matches
  }
});

console.log(`📊 Translation keys used in apps: ${usedKeys.size}\n`);

// Find missing keys
const missingKeys = Array.from(usedKeys).filter(key => !existingKeys.has(key));
console.log(`❌ Missing translation keys: ${missingKeys.length}\n`);

if (missingKeys.length > 0) {
  console.log('Missing keys:');
  missingKeys.slice(0, 50).forEach(key => console.log(`  - ${key}`));
  if (missingKeys.length > 50) {
    console.log(`  ... and ${missingKeys.length - 50} more`);
  }
}

// Extract categories, enums, and amenities from code
console.log('\n🏷️  Extracting categories, enums, and amenities...\n');

const categories = new Set();
const amenities = new Set();
const enums = new Set();

// Scan for category definitions
try {
  const categoryFiles = execSync(
    `grep -r "LOKALER\\|UTSTYR\\|KJORETOY\\|OPPLEVELSER" apps/ --include="*.ts" --include="*.tsx" | grep -v node_modules`,
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
  
  const categoryMatches = categoryFiles.match(/[A-Z_]+_OG_[A-Z_]+/g);
  if (categoryMatches) {
    categoryMatches.forEach(cat => categories.add(cat));
  }
} catch (e) {}

console.log(`📦 Categories found: ${categories.size}`);
Array.from(categories).forEach(cat => console.log(`  - ${cat}`));

// Generate missing translations
const missingTranslations = {
  nb: {},
  en: {}
};

// Add missing keys with placeholder values
missingKeys.forEach(key => {
  const parts = key.split('.');
  let nbCurrent = missingTranslations.nb;
  let enCurrent = missingTranslations.en;
  
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      // Last part - add translation
      nbCurrent[part] = `[NB: ${key}]`;
      enCurrent[part] = `[EN: ${key}]`;
    } else {
      // Intermediate part - create nested object
      if (!nbCurrent[part]) nbCurrent[part] = {};
      if (!enCurrent[part]) enCurrent[part] = {};
      nbCurrent = nbCurrent[part];
      enCurrent = enCurrent[part];
    }
  });
});

// Add category translations
categories.forEach(cat => {
  const key = `sdk.rentalObject.category.${cat}`;
  const parts = key.split('.');
  let nbCurrent = missingTranslations.nb;
  let enCurrent = missingTranslations.en;
  
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      nbCurrent[part] = cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      enCurrent[part] = cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    } else {
      if (!nbCurrent[part]) nbCurrent[part] = {};
      if (!enCurrent[part]) enCurrent[part] = {};
      nbCurrent = nbCurrent[part];
      enCurrent = enCurrent[part];
    }
  });
});

// Save missing translations report
fs.writeFileSync('missing-translations-report.json', JSON.stringify({
  summary: {
    existingKeys: existingKeys.size,
    usedKeys: usedKeys.size,
    missingKeys: missingKeys.length,
    categories: categories.size
  },
  missingKeys: Array.from(missingKeys),
  categories: Array.from(categories),
  missingTranslations
}, null, 2));

console.log('\n✅ Report saved to: missing-translations-report.json');
console.log(`\n📊 Summary:`);
console.log(`   - Existing keys: ${existingKeys.size}`);
console.log(`   - Used keys: ${usedKeys.size}`);
console.log(`   - Missing keys: ${missingKeys.length}`);
console.log(`   - Categories: ${categories.size}`);
