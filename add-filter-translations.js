const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'packages/database-schema/seeds/platform/translations.json');

// Read existing translations
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// New translations to add
const newTranslations = [
  {
    tenantId: null,
    namespace: 'filter',
    key: 'showingResults',
    language: 'nb',
    value: 'Viser {{count}} resultater',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'filter',
    key: 'showingResults',
    language: 'en',
    value: 'Showing {{count}} results',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'filter',
    key: 'showResults',
    language: 'nb',
    value: 'Vis resultater',
    isSystemDefault: true
  },
  {
    tenantId: null,
    namespace: 'filter',
    key: 'showResults',
    language: 'en',
    value: 'Show results',
    isSystemDefault: true
  }
];

// Add new translations
translations.push(...newTranslations);

// Write back to file
fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2) + '\n');

console.log(`✅ Added ${newTranslations.length} new translation keys`);
console.log(`📊 Total translations: ${translations.length}`);
