#!/usr/bin/env node
/**
 * Generate translations seed from i18n package
 * Reads all JSON files from @xala/i18n and creates a comprehensive seed file
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const I18N_LOCALES_PATH = join(__dirname, '../../../i18n/src/locales');
const OUTPUT_PATH = join(__dirname, '../platform/translations.json');

interface TranslationEntry {
  tenantId: null;
  namespace: string;
  key: string;
  language: string;
  value: string;
  isSystemDefault: boolean;
}

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

function processLocale(localePath: string, language: string): TranslationEntry[] {
  const entries: TranslationEntry[] = [];
  const files = readdirSync(localePath).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const namespace = file.replace('.json', '');
    const content = JSON.parse(readFileSync(join(localePath, file), 'utf-8'));
    const flattened = flattenObject(content);
    
    for (const [key, value] of Object.entries(flattened)) {
      entries.push({
        tenantId: null,
        namespace,
        key,
        language,
        value,
        isSystemDefault: true,
      });
    }
  }
  
  return entries;
}

async function main() {
  console.log('🌐 Generating translations seed from @xala/i18n...\n');
  
  const translations: TranslationEntry[] = [];
  
  // Process Norwegian (nb)
  const nbPath = join(I18N_LOCALES_PATH, 'nb');
  const nbEntries = processLocale(nbPath, 'nb');
  translations.push(...nbEntries);
  console.log(`  ✅ Norwegian (nb): ${nbEntries.length} keys`);
  
  // Process English (en)
  const enPath = join(I18N_LOCALES_PATH, 'en');
  const enEntries = processLocale(enPath, 'en');
  translations.push(...enEntries);
  console.log(`  ✅ English (en): ${enEntries.length} keys`);
  
  // Write output
  const output = { translations };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  
  console.log(`\n📦 Total: ${translations.length} translation entries`);
  console.log(`📁 Output: ${OUTPUT_PATH}`);
}

main().catch(console.error);
