#!/usr/bin/env node

/**
 * Generate Translation Seeds from Hard-coded Strings
 * 
 * This script:
 * 1. Reads the i18n inventory JSON report
 * 2. Extracts all hard-coded strings
 * 3. Generates proper translation keys (English-only, no Norwegian)
 * 4. Creates translation seeds for nb and en locales
 * 5. Updates the database translation seeds
 * 
 * Usage:
 *   node infra/scripts/generate-translation-seeds.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../..');
const inventoryReportsDir = path.join(rootDir, 'i18n-inventory-reports');
const dbSeedsDir = path.join(rootDir, 'packages/database-schema/seeds/platform');
const i18nLocalesDir = path.join(rootDir, 'packages/i18n/src/locales');

console.log('🔧 Translation Seeds Generator');
console.log('==============================\n');

// Find the latest inventory report
const reportFiles = fs.readdirSync(inventoryReportsDir)
  .filter(f => f.endsWith('.json'))
  .sort()
  .reverse();

if (reportFiles.length === 0) {
  console.error('❌ No inventory reports found. Run scan-i18n-inventory.js first.');
  process.exit(1);
}

const latestReport = path.join(inventoryReportsDir, reportFiles[0]);
console.log(`📄 Reading report: ${reportFiles[0]}\n`);

const inventory = JSON.parse(fs.readFileSync(latestReport, 'utf8'));

// Helper: Convert Norwegian text to English key
function norwegianToEnglish(text) {
  const translations = {
    // Common words
    'Lagre': 'save',
    'Avbryt': 'cancel',
    'Slett': 'delete',
    'Rediger': 'edit',
    'Legg til': 'add',
    'Søk': 'search',
    'Filtrer': 'filter',
    'Lukk': 'close',
    'Åpne': 'open',
    'Ny': 'new',
    'Opprett': 'create',
    'Oppdater': 'update',
    'Vis': 'show',
    'Skjul': 'hide',
    'Aktiv': 'active',
    'Inaktiv': 'inactive',
    'Ja': 'yes',
    'Nei': 'no',
    'Navn': 'name',
    'Beskrivelse': 'description',
    'Adresse': 'address',
    'E-post': 'email',
    'Telefon': 'phone',
    'Dato': 'date',
    'Tid': 'time',
    'Status': 'status',
    'Type': 'type',
    'Kategori': 'category',
    'Detaljer': 'details',
    'Innstillinger': 'settings',
    'Profil': 'profile',
    'Organisasjon': 'organization',
    'Bruker': 'user',
    'Brukere': 'users',
    'Rolle': 'role',
    'Tilgang': 'access',
    'Rettigheter': 'permissions',
    'Integrasjoner': 'integrations',
    'Varsler': 'notifications',
    'Rapporter': 'reports',
    'Statistikk': 'statistics',
    'Dashboard': 'dashboard',
    'Kalender': 'calendar',
    'Booking': 'booking',
    'Bookinger': 'bookings',
    'Sesong': 'season',
    'Sesonger': 'seasons',
    'Tildeling': 'allocation',
    'Søknad': 'application',
    'Godkjenn': 'approve',
    'Avslå': 'reject',
    'Venter': 'pending',
    'Fullført': 'completed',
    'Feilet': 'failed',
    'Laster': 'loading',
    'Lagrer': 'saving',
  };
  
  // Try direct translation first
  if (translations[text]) {
    return translations[text];
  }
  
  // Try lowercase
  const lower = text.toLowerCase();
  for (const [no, en] of Object.entries(translations)) {
    if (no.toLowerCase() === lower) {
      return en;
    }
  }
  
  // Fallback: convert to camelCase English approximation
  return text
    .replace(/[æÆ]/g, 'ae')
    .replace(/[øØ]/g, 'o')
    .replace(/[åÅ]/g, 'a')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper: Generate translation key from hard-coded string
function generateTranslationKey(hardcodedString, context) {
  const { type, file } = context;
  
  // Determine namespace from file path
  let namespace = 'common';
  
  if (file.includes('/settings/')) namespace = 'settings';
  else if (file.includes('/organizations/')) namespace = 'organizations';
  else if (file.includes('/seasons/')) namespace = 'seasons';
  else if (file.includes('/bookings/')) namespace = 'bookings';
  else if (file.includes('/integrations/')) namespace = 'integrations';
  else if (file.includes('/users/')) namespace = 'users';
  else if (file.includes('/auth/')) namespace = 'auth';
  else if (file.includes('/gdpr/')) namespace = 'gdpr';
  else if (file.includes('/audit/')) namespace = 'audit';
  else if (file.includes('/monitoring/')) namespace = 'monitoring';
  else if (file.includes('/saas-admin/')) namespace = 'saasAdmin';
  else if (file.includes('/tenant-admin/')) namespace = 'tenantAdmin';
  else if (file.includes('/backoffice/')) namespace = 'backoffice';
  else if (file.includes('/minside/')) namespace = 'minside';
  
  // Determine sub-key based on type
  let subKey = '';
  if (type === 'placeholder') subKey = 'placeholder';
  else if (type === 'title') subKey = 'title';
  else if (type === 'aria-label') subKey = 'ariaLabel';
  else if (type === 'jsx-text') {
    // Infer from content
    if (/^(Lagre|Save|Oppdater|Update)/.test(hardcodedString)) subKey = 'action';
    else if (/^(Navn|Name|Beskrivelse|Description)/.test(hardcodedString)) subKey = 'label';
    else if (/^(Aktiv|Active|Inaktiv|Inactive)/.test(hardcodedString)) subKey = 'status';
    else subKey = 'text';
  }
  
  // Convert text to English key
  const textKey = norwegianToEnglish(hardcodedString.trim());
  
  // Build full key
  if (subKey) {
    return `${namespace}.${subKey}.${textKey}`;
  }
  return `${namespace}.${textKey}`;
}

// Helper: Translate Norwegian to English
function translateToEnglish(norwegianText) {
  const directTranslations = {
    'Lagre endringer': 'Save changes',
    'Avbryt': 'Cancel',
    'Slett': 'Delete',
    'Rediger': 'Edit',
    'Legg til': 'Add',
    'Søk': 'Search',
    'Filtrer': 'Filter',
    'Lukk': 'Close',
    'Åpne': 'Open',
    'Ny': 'New',
    'Opprett': 'Create',
    'Oppdater': 'Update',
    'Vis': 'Show',
    'Skjul': 'Hide',
    'Aktiv': 'Active',
    'Inaktiv': 'Inactive',
    'Ja': 'Yes',
    'Nei': 'No',
    'Navn': 'Name',
    'Beskrivelse': 'Description',
    'Adresse': 'Address',
    'E-post': 'Email',
    'Telefon': 'Phone',
    'Dato': 'Date',
    'Tid': 'Time',
    'Status': 'Status',
    'Type': 'Type',
    'Kategori': 'Category',
    'Detaljer': 'Details',
    'Innstillinger': 'Settings',
    'Profil': 'Profile',
    'Organisasjon': 'Organization',
    'Bruker': 'User',
    'Brukere': 'Users',
    'Rolle': 'Role',
    'Tilgang': 'Access',
    'Rettigheter': 'Permissions',
    'Integrasjoner': 'Integrations',
    'Integrasjonsnøkler': 'Integration Keys',
    'API-nøkler': 'API Keys',
    'Varsler': 'Notifications',
    'Rapporter': 'Reports',
    'Statistikk': 'Statistics',
    'Dashboard': 'Dashboard',
    'Kalender': 'Calendar',
    'Booking': 'Booking',
    'Bookinger': 'Bookings',
    'Sesong': 'Season',
    'Sesonger': 'Seasons',
    'Tildeling': 'Allocation',
    'Søknad': 'Application',
    'Godkjenn': 'Approve',
    'Avslå': 'Reject',
    'Venter': 'Pending',
    'Fullført': 'Completed',
    'Feilet': 'Failed',
    'Laster': 'Loading',
    'Lagrer': 'Saving',
    'Skriv inn': 'Enter',
    'Velg': 'Select',
    'Velg dato': 'Select date',
    'Velg tid': 'Select time',
    'Søk etter': 'Search for',
    'Filtrer etter': 'Filter by',
    'Sorter etter': 'Sort by',
    'Ingen resultater': 'No results',
    'Ingen data': 'No data',
    'Laster inn': 'Loading',
    'Vennligst vent': 'Please wait',
    'Er du sikker?': 'Are you sure?',
    'Bekreft': 'Confirm',
    'Tilbake': 'Back',
    'Neste': 'Next',
    'Forrige': 'Previous',
    'Ferdig': 'Done',
    'Fortsett': 'Continue',
  };
  
  // Check direct translation
  if (directTranslations[norwegianText]) {
    return directTranslations[norwegianText];
  }
  
  // If it's already English or mixed, return as-is
  if (!/[æøåÆØÅ]/.test(norwegianText)) {
    return norwegianText;
  }
  
  // Fallback: basic character replacement
  return norwegianText
    .replace(/æ/g, 'ae').replace(/Æ/g, 'Ae')
    .replace(/ø/g, 'o').replace(/Ø/g, 'O')
    .replace(/å/g, 'a').replace(/Å/g, 'A');
}

// Process hard-coded strings
console.log('📝 Processing hard-coded strings...\n');

const translationMap = new Map();
const keyUsageMap = new Map();

inventory.hardcodedStrings.forEach((item, index) => {
  const { text, file, line, type } = item;
  
  // Skip very short strings or numbers
  if (text.length < 3 || /^\d+$/.test(text)) {
    return;
  }
  
  // Generate translation key
  const key = generateTranslationKey(text, { type, file });
  
  // Store translation
  if (!translationMap.has(key)) {
    translationMap.set(key, {
      nb: text,
      en: translateToEnglish(text),
      usages: []
    });
  }
  
  // Track usage
  translationMap.get(key).usages.push({ file, line, type });
  
  // Track key usage count
  keyUsageMap.set(key, (keyUsageMap.get(key) || 0) + 1);
  
  if ((index + 1) % 50 === 0) {
    console.log(`  Processed ${index + 1}/${inventory.hardcodedStrings.length} strings...`);
  }
});

console.log(`\n✅ Processed ${inventory.hardcodedStrings.length} hard-coded strings`);
console.log(`📊 Generated ${translationMap.size} unique translation keys\n`);

// Generate database seeds
console.log('💾 Generating database translation seeds...\n');

const dbSeeds = [];

translationMap.forEach((translation, key) => {
  const [namespace, ...rest] = key.split('.');
  const keyName = rest.join('.');
  
  // Norwegian (nb) entry
  dbSeeds.push({
    tenantId: null,
    namespace,
    key: keyName,
    language: 'nb',
    value: translation.nb,
    isSystemDefault: true
  });
  
  // English (en) entry
  dbSeeds.push({
    tenantId: null,
    namespace,
    key: keyName,
    language: 'en',
    value: translation.en,
    isSystemDefault: true
  });
});

// Read existing translations
const existingTranslationsFile = path.join(dbSeedsDir, 'translations.json');
let existingTranslations = [];

if (fs.existsSync(existingTranslationsFile)) {
  existingTranslations = JSON.parse(fs.readFileSync(existingTranslationsFile, 'utf8'));
  console.log(`📖 Found ${existingTranslations.length} existing translations`);
}

// Merge with existing (avoid duplicates)
const existingKeys = new Set(
  existingTranslations.map(t => `${t.namespace}.${t.key}.${t.language}`)
);

const newSeeds = dbSeeds.filter(seed => {
  const seedKey = `${seed.namespace}.${seed.key}.${seed.language}`;
  return !existingKeys.has(seedKey);
});

console.log(`➕ Adding ${newSeeds.length} new translation entries`);

const mergedTranslations = [...existingTranslations, ...newSeeds].sort((a, b) => {
  if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace);
  if (a.key !== b.key) return a.key.localeCompare(b.key);
  return a.language.localeCompare(b.language);
});

// Write updated translations
fs.writeFileSync(
  existingTranslationsFile,
  JSON.stringify(mergedTranslations, null, 2),
  'utf8'
);

console.log(`✅ Updated ${existingTranslationsFile}`);
console.log(`📊 Total translations: ${mergedTranslations.length}\n`);

// Generate conversion guide
console.log('📋 Generating conversion guide...\n');

const conversionGuide = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalStrings: inventory.hardcodedStrings.length,
    uniqueKeys: translationMap.size,
    newKeys: newSeeds.length / 2, // Divide by 2 (nb + en)
  },
  conversions: []
};

translationMap.forEach((translation, key) => {
  conversionGuide.conversions.push({
    key,
    norwegianText: translation.nb,
    englishText: translation.en,
    usageCount: translation.usages.length,
    files: [...new Set(translation.usages.map(u => u.file))],
    examples: translation.usages.slice(0, 3).map(u => ({
      file: u.file,
      line: u.line,
      type: u.type
    }))
  });
});

// Sort by usage count (most used first)
conversionGuide.conversions.sort((a, b) => b.usageCount - a.usageCount);

const conversionGuideFile = path.join(rootDir, 'i18n-conversion-guide.json');
fs.writeFileSync(
  conversionGuideFile,
  JSON.stringify(conversionGuide, null, 2),
  'utf8'
);

console.log(`✅ Generated conversion guide: ${conversionGuideFile}\n`);

// Generate markdown summary
const markdownSummary = `# Translation Conversion Guide

**Generated:** ${new Date().toISOString()}  
**Total Hard-coded Strings:** ${inventory.hardcodedStrings.length}  
**Unique Translation Keys:** ${translationMap.size}  
**New Keys Added:** ${newSeeds.length / 2}

---

## Top 20 Most Used Keys

| Key | Norwegian | English | Usage Count | Files |
|-----|-----------|---------|-------------|-------|
${conversionGuide.conversions.slice(0, 20).map(c => 
  `| \`${c.key}\` | ${c.norwegianText} | ${c.englishText} | ${c.usageCount} | ${c.files.length} |`
).join('\n')}

---

## Conversion Instructions

### Step 1: Import Translation Hook

\`\`\`tsx
import { useT } from '@xala/i18n';

export function MyComponent() {
  const t = useT();
  // ...
}
\`\`\`

### Step 2: Replace Hard-coded Strings

Use the conversion guide to replace hard-coded strings with translation keys.

Example conversions:

${conversionGuide.conversions.slice(0, 10).map(c => `
**File:** \`${c.files[0]}\`
\`\`\`tsx
// ❌ Before
${c.examples[0]?.type === 'jsx-text' ? `<div>${c.norwegianText}</div>` : 
  c.examples[0]?.type === 'placeholder' ? `<input placeholder="${c.norwegianText}" />` :
  c.examples[0]?.type === 'title' ? `<button title="${c.norwegianText}">...</button>` :
  `<div aria-label="${c.norwegianText}">...</div>`}

// ✅ After
${c.examples[0]?.type === 'jsx-text' ? `<div>{t('${c.key}')}</div>` :
  c.examples[0]?.type === 'placeholder' ? `<input placeholder={t('${c.key}')} />` :
  c.examples[0]?.type === 'title' ? `<button title={t('${c.key}')}>...</button>` :
  `<div aria-label={t('${c.key}')}>...</div>`}
\`\`\`
`).join('\n')}

---

## Next Steps

1. **Rebuild i18n package:**
   \`\`\`bash
   pnpm -F @xala/i18n build
   \`\`\`

2. **Seed database:**
   \`\`\`bash
   pnpm db:seed
   \`\`\`

3. **Convert components:**
   Use the conversion guide to update components systematically

4. **Verify:**
   \`\`\`bash
   pnpm i18n:check
   node infra/scripts/scan-i18n-inventory.js --format markdown
   \`\`\`

---

*Generated by generate-translation-seeds.js*
`;

const markdownFile = path.join(rootDir, 'I18N_CONVERSION_GUIDE.md');
fs.writeFileSync(markdownFile, markdownSummary, 'utf8');

console.log(`✅ Generated markdown guide: ${markdownFile}\n`);

// Print summary
console.log('📊 Summary');
console.log('==========');
console.log(`Hard-coded strings processed: ${inventory.hardcodedStrings.length}`);
console.log(`Unique translation keys: ${translationMap.size}`);
console.log(`New database entries: ${newSeeds.length} (${newSeeds.length / 2} keys × 2 languages)`);
console.log(`Total database entries: ${mergedTranslations.length}`);
console.log('');
console.log('📁 Files Updated:');
console.log(`  - ${existingTranslationsFile}`);
console.log(`  - ${conversionGuideFile}`);
console.log(`  - ${markdownFile}`);
console.log('');
console.log('✅ Translation seeds generated successfully!');
console.log('');
console.log('🔄 Next Steps:');
console.log('  1. Review the conversion guide');
console.log('  2. Run: pnpm -F @xala/i18n build');
console.log('  3. Run: pnpm db:seed');
console.log('  4. Start converting components using the guide');
