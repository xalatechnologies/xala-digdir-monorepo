const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'packages/database-schema/seeds/platform/translations.json');

// Read existing translations
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// New category translations with underscores to match the code
const newTranslations = [
  // LOKALER_OG_BANER
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.LOKALER_OG_BANER',
    language: 'nb',
    value: 'Lokaler og baner',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.LOKALER_OG_BANER',
    language: 'en',
    value: 'Venues & Courts',
    isSystemDefault: true
  },
  // UTSTYR_OG_INVENTAR
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.UTSTYR_OG_INVENTAR',
    language: 'nb',
    value: 'Utstyr og inventar',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.UTSTYR_OG_INVENTAR',
    language: 'en',
    value: 'Equipment & Inventory',
    isSystemDefault: true
  },
  // KJORETOY_OG_TRANSPORT
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.KJORETOY_OG_TRANSPORT',
    language: 'nb',
    value: 'Kjøretøy og transport',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.KJORETOY_OG_TRANSPORT',
    language: 'en',
    value: 'Vehicles & Transport',
    isSystemDefault: true
  },
  // OPPLEVELSER_OG_ARRANGEMENT
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT',
    language: 'nb',
    value: 'Opplevelser og arrangement',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'sdk',
    key: 'rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT',
    language: 'en',
    value: 'Experiences & Events',
    isSystemDefault: true
  }
];

// Add new translations
translations.push(...newTranslations);

// Write back to file
fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2) + '\n');

console.log(`✅ Added ${newTranslations.length} new category translation keys`);
console.log(`📊 Total translations: ${translations.length}`);
