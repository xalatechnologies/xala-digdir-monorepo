const fs = require('fs');
const path = require('path');

// Read the database translations to convert to JSON format
const dbTranslationsPath = path.join(__dirname, 'packages/database-schema/seeds/platform/translations.json');
const dbTranslations = JSON.parse(fs.readFileSync(dbTranslationsPath, 'utf8'));

// Group translations by language and build nested structure
const nb = {};
const en = {};

dbTranslations.forEach(t => {
  const target = t.language === 'nb' ? nb : en;
  
  // Build nested object structure from namespace.key
  const fullKey = t.namespace ? `${t.namespace}.${t.key}` : t.key;
  const parts = fullKey.split('.');
  
  let current = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = t.value;
});

// Create locales directory structure
const localesDir = path.join(__dirname, 'packages/i18n/locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

// Write JSON files
fs.writeFileSync(path.join(localesDir, 'nb.json'), JSON.stringify(nb, null, 2));
fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(en, null, 2));

console.log('✅ Generated JSON translation files:');
console.log(`   - packages/i18n/locales/nb.json (${Object.keys(nb).length} top-level keys)`);
console.log(`   - packages/i18n/locales/en.json (${Object.keys(en).length} top-level keys)`);
console.log(`📊 Total translations: ${dbTranslations.length}`);
