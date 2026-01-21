/**
 * Scan all apps for translation keys and generate comprehensive seed
 * 
 * This script:
 * 1. Scans all apps for t('key') calls
 * 2. Reads existing locale JSON files
 * 3. Identifies missing keys
 * 4. Generates a comprehensive translation seed
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPS_DIR = path.resolve(__dirname, '../../../../apps');
const LOCALES_DIR = path.resolve(__dirname, '../../../i18n/src/locales');
const OUTPUT_FILE = path.resolve(__dirname, '../platform/translations.json');

// Namespace mapping based on key prefix
const NAMESPACE_MAP: Record<string, string> = {
  'auth': 'auth',
  'nav': 'nav',
  'dashboard': 'dashboard',
  'bookings': 'bookings',
  'calendar': 'calendar',
  'listings': 'listings',
  'rentalObjects': 'rentalObjects',
  'seasons': 'seasons',
  'settings': 'settings',
  'users': 'users',
  'organizations': 'organizations',
  'reports': 'reports',
  'messages': 'messages',
  'payment': 'payment',
  'validation': 'validation',
  'status': 'status',
  'form': 'form',
  'help': 'help',
  'docs': 'docs',
  'saasAdmin': 'saasAdmin',
  'tenantAdmin': 'tenantAdmin',
  'security': 'security',
  'integrations': 'integrations',
  'days': 'days',
  'requests': 'requests',
  'actions': 'common',
  'common': 'common',
  'errors': 'common',
  'wizard': 'common',
  'ui': 'common',
};

// Extract all t('key') calls from a file
function extractKeysFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys: string[] = [];
  
  // Match t('key') or t("key") patterns
  const regex = /\bt\(\s*['"]([a-zA-Z][a-zA-Z0-9_.]*)['"]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
}

// Recursively scan directory for .ts and .tsx files
function scanDirectory(dir: string): string[] {
  const allKeys: string[] = [];
  
  function walk(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        walk(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const keys = extractKeysFromFile(filePath);
        allKeys.push(...keys);
      }
    }
  }
  
  walk(dir);
  return allKeys;
}

// Load existing translations from locale files
function loadExistingTranslations(locale: string): Map<string, { namespace: string; value: string }> {
  const translations = new Map<string, { namespace: string; value: string }>();
  const localeDir = path.join(LOCALES_DIR, locale);
  
  if (!fs.existsSync(localeDir)) {
    console.error(`Locale directory not found: ${localeDir}`);
    return translations;
  }
  
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const namespace = file.replace('.json', '');
    const filePath = path.join(localeDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Flatten nested objects
    function flatten(obj: Record<string, unknown>, prefix = ''): void {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value as Record<string, unknown>, fullKey);
        } else if (typeof value === 'string') {
          translations.set(fullKey, { namespace, value });
        }
      }
    }
    
    flatten(content);
  }
  
  return translations;
}

// Determine namespace for a key
function getNamespace(key: string): string {
  const prefix = key.split('.')[0];
  return NAMESPACE_MAP[prefix] || 'common';
}

// Generate placeholder value for missing key
function generatePlaceholder(key: string, locale: string): string {
  // Convert key to readable text
  const lastPart = key.split('.').pop() || key;
  const readable = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/[._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (locale === 'nb') {
    return `[${readable}]`;
  }
  return `[${readable}]`;
}

interface TranslationEntry {
  tenantId: null;
  namespace: string;
  key: string;
  language: string;
  value: string;
  isSystemDefault: boolean;
}

async function main() {
  console.log('🔍 Scanning apps for translation keys...');
  
  // Scan all apps
  const appDirs = fs.readdirSync(APPS_DIR).filter(d => {
    const stat = fs.statSync(path.join(APPS_DIR, d));
    return stat.isDirectory() && !d.startsWith('.');
  });
  
  const allKeys = new Set<string>();
  
  for (const app of appDirs) {
    const appPath = path.join(APPS_DIR, app, 'src');
    if (fs.existsSync(appPath)) {
      console.log(`  Scanning ${app}...`);
      const keys = scanDirectory(appPath);
      keys.forEach(k => allKeys.add(k));
    }
  }
  
  console.log(`\n📊 Found ${allKeys.size} unique translation keys in apps`);
  
  // Load existing translations
  console.log('\n📚 Loading existing translations...');
  const nbTranslations = loadExistingTranslations('nb');
  const enTranslations = loadExistingTranslations('en');
  
  console.log(`  Norwegian (nb): ${nbTranslations.size} keys`);
  console.log(`  English (en): ${enTranslations.size} keys`);
  
  // Find missing keys
  const missingInNb: string[] = [];
  const missingInEn: string[] = [];
  
  for (const key of allKeys) {
    if (!nbTranslations.has(key)) {
      missingInNb.push(key);
    }
    if (!enTranslations.has(key)) {
      missingInEn.push(key);
    }
  }
  
  console.log(`\n⚠️  Missing keys:`);
  console.log(`  Norwegian (nb): ${missingInNb.length}`);
  console.log(`  English (en): ${missingInEn.length}`);
  
  // Generate seed entries
  console.log('\n🌱 Generating seed entries...');
  const entries: TranslationEntry[] = [];
  
  // Add existing Norwegian translations
  for (const [key, { namespace, value }] of nbTranslations) {
    entries.push({
      tenantId: null,
      namespace,
      key,
      language: 'nb',
      value,
      isSystemDefault: true,
    });
  }
  
  // Add existing English translations
  for (const [key, { namespace, value }] of enTranslations) {
    entries.push({
      tenantId: null,
      namespace,
      key,
      language: 'en',
      value,
      isSystemDefault: true,
    });
  }
  
  // Add missing keys with placeholders
  for (const key of missingInNb) {
    const namespace = getNamespace(key);
    entries.push({
      tenantId: null,
      namespace,
      key,
      language: 'nb',
      value: generatePlaceholder(key, 'nb'),
      isSystemDefault: true,
    });
  }
  
  for (const key of missingInEn) {
    const namespace = getNamespace(key);
    entries.push({
      tenantId: null,
      namespace,
      key,
      language: 'en',
      value: generatePlaceholder(key, 'en'),
      isSystemDefault: true,
    });
  }
  
  // Write output
  console.log(`\n💾 Writing ${entries.length} entries to ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
  
  // Summary
  console.log('\n✅ Done!');
  console.log(`\nSummary:`);
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Norwegian: ${entries.filter(e => e.language === 'nb').length}`);
  console.log(`  English: ${entries.filter(e => e.language === 'en').length}`);
  
  // List some of the missing keys for review
  if (missingInNb.length > 0) {
    console.log(`\n📋 Sample missing keys (first 20):`);
    missingInNb.slice(0, 20).forEach(k => console.log(`  - ${k}`));
    if (missingInNb.length > 20) {
      console.log(`  ... and ${missingInNb.length - 20} more`);
    }
  }
}

main().catch(console.error);
