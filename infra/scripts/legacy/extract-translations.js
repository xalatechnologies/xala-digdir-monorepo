#!/usr/bin/env node
/**
 * Extract Translations to JSON
 * 
 * Converts the existing nb.ts/en.ts monolithic translations
 * into modular JSON files organized by namespace.
 * 
 * Usage: node scripts/extract-translations.js
 * 
 * Outputs:
 *   - packages/i18n/src/locales/nb/*.json (modular files)
 *   - packages/database-schema/seeds/platform/translations.json (for DB seeding)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Namespaces to extract into separate files
const NAMESPACES = [
  'common',
  'auth',
  'bookings',
  'calendar',
  'dashboard',
  'days',
  'docs',
  'form',
  'help',
  'integrations',
  'listings',
  'messages',
  'nav',
  'organizations',
  'payment',
  'reports',
  'rentalObjects',
  'requests',
  'saasAdmin',
  'seasons',
  'security',
  'settings',
  'status',
  'tenantAdmin',
  'users',
  'validation',
];

/**
 * Parse translations from source file
 */
function parseTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const translations = {};
  
  // Match key-value pairs: 'namespace.key': 'value',
  const regex = /^\s*'([^']+)':\s*'([^']*)',?\s*$/gm;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const value = match[2];
    translations[key] = value;
  }
  
  // Also match template literals: 'namespace.key': `value`,
  const templateRegex = /^\s*'([^']+)':\s*`([^`]*)`,?\s*$/gm;
  while ((match = templateRegex.exec(content)) !== null) {
    const key = match[1];
    const value = match[2];
    translations[key] = value;
  }
  
  return translations;
}

/**
 * Organize translations by namespace
 */
function organizeByNamespace(translations) {
  const namespaced = {};
  const misc = {}; // Keys that don't match known namespaces
  
  for (const [fullKey, value] of Object.entries(translations)) {
    const dotIndex = fullKey.indexOf('.');
    if (dotIndex === -1) {
      misc[fullKey] = value;
      continue;
    }
    
    const namespace = fullKey.substring(0, dotIndex);
    const key = fullKey.substring(dotIndex + 1);
    
    if (NAMESPACES.includes(namespace)) {
      if (!namespaced[namespace]) {
        namespaced[namespace] = {};
      }
      namespaced[namespace][key] = value;
    } else {
      misc[fullKey] = value;
    }
  }
  
  if (Object.keys(misc).length > 0) {
    namespaced['misc'] = misc;
  }
  
  return namespaced;
}

/**
 * Generate database seed format
 */
function generateDbSeed(translations, language) {
  const records = [];
  
  for (const [fullKey, value] of Object.entries(translations)) {
    const dotIndex = fullKey.indexOf('.');
    let namespace = 'misc';
    let key = fullKey;
    
    if (dotIndex !== -1) {
      const potentialNamespace = fullKey.substring(0, dotIndex);
      if (NAMESPACES.includes(potentialNamespace)) {
        namespace = potentialNamespace;
        key = fullKey.substring(dotIndex + 1);
      }
    }
    
    records.push({
      tenantId: null, // System default
      namespace,
      key,
      language,
      value,
      isSystemDefault: true,
    });
  }
  
  return records;
}

/**
 * Main extraction function
 */
async function extractTranslations() {
  console.log('🌍 Extracting translations...\n');
  
  const localesDir = path.join(rootDir, 'packages/i18n/src/locales');
  const nbSourcePath = path.join(localesDir, 'nb.ts');
  const enSourcePath = path.join(localesDir, 'en.ts');
  
  // Create output directories
  const nbOutputDir = path.join(localesDir, 'nb');
  const enOutputDir = path.join(localesDir, 'en');
  const seedOutputDir = path.join(rootDir, 'packages/database-schema/seeds/platform');
  
  [nbOutputDir, enOutputDir, seedOutputDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Parse source files
  console.log('📖 Parsing nb.ts...');
  const nbTranslations = parseTranslations(nbSourcePath);
  console.log(`   Found ${Object.keys(nbTranslations).length} translations\n`);
  
  console.log('📖 Parsing en.ts...');
  const enTranslations = parseTranslations(enSourcePath);
  console.log(`   Found ${Object.keys(enTranslations).length} translations\n`);
  
  // Organize by namespace
  const nbNamespaced = organizeByNamespace(nbTranslations);
  const enNamespaced = organizeByNamespace(enTranslations);
  
  // Write modular JSON files
  console.log('📝 Writing modular JSON files...');
  
  for (const [namespace, keys] of Object.entries(nbNamespaced)) {
    const filePath = path.join(nbOutputDir, `${namespace}.json`);
    fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
    console.log(`   ✅ nb/${namespace}.json (${Object.keys(keys).length} keys)`);
  }
  
  for (const [namespace, keys] of Object.entries(enNamespaced)) {
    const filePath = path.join(enOutputDir, `${namespace}.json`);
    fs.writeFileSync(filePath, JSON.stringify(keys, null, 2));
    console.log(`   ✅ en/${namespace}.json (${Object.keys(keys).length} keys)`);
  }
  
  // Generate index files for each language
  const indexContent = (lang, namespaces) => `/**
 * ${lang.toUpperCase()} Translations Index
 * Auto-generated - do not edit manually
 */
${Object.keys(namespaces).map(ns => `import ${ns} from './${ns}.json';`).join('\n')}

export const ${lang} = {
${Object.keys(namespaces).map(ns => `  ...Object.fromEntries(Object.entries(${ns}).map(([k, v]) => [\`${ns}.\${k}\`, v])),`).join('\n')}
};
`;
  
  fs.writeFileSync(path.join(nbOutputDir, 'index.ts'), indexContent('nb', nbNamespaced));
  fs.writeFileSync(path.join(enOutputDir, 'index.ts'), indexContent('en', enNamespaced));
  console.log('   ✅ Created index.ts files\n');
  
  // Generate database seed
  console.log('🗄️  Generating database seed...');
  const nbDbRecords = generateDbSeed(nbTranslations, 'nb');
  const enDbRecords = generateDbSeed(enTranslations, 'en');
  
  const dbSeed = {
    translations: [...nbDbRecords, ...enDbRecords],
  };
  
  fs.writeFileSync(
    path.join(seedOutputDir, 'translations.json'),
    JSON.stringify(dbSeed, null, 2)
  );
  console.log(`   ✅ translations.json (${dbSeed.translations.length} records)\n`);
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Norwegian (nb): ${Object.keys(nbNamespaced).length} namespaces, ${Object.keys(nbTranslations).length} keys`);
  console.log(`   English (en): ${Object.keys(enNamespaced).length} namespaces, ${Object.keys(enTranslations).length} keys`);
  console.log(`   Database seed: ${dbSeed.translations.length} records\n`);
  
  console.log('✅ Extraction complete!');
}

// Run
extractTranslations().catch(console.error);
