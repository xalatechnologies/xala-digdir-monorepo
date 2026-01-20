#!/usr/bin/env node
/**
 * Add missing amenity and category translations
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const translationsPath = join(__dirname, 'packages/database-schema/seeds/platform/translations.json');
const translations = JSON.parse(readFileSync(translationsPath, 'utf-8'));

const tenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Default tenant

// Missing category translations (SCREAMING_SNAKE_CASE format)
const categoryTranslations = [
  {
    key: 'sdk.rentalObject.category.LOKALER_OG_BANER',
    nb: 'Lokaler og baner',
    en: 'Venues and Courts'
  },
  {
    key: 'sdk.rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT',
    nb: 'Opplevelser og arrangement',
    en: 'Experiences and Events'
  },
  {
    key: 'sdk.rentalObject.category.UTSTYR_OG_INVENTAR',
    nb: 'Utstyr og inventar',
    en: 'Equipment and Inventory'
  },
  {
    key: 'sdk.rentalObject.category.KJORETOY_OG_TRANSPORT',
    nb: 'Kjøretøy og transport',
    en: 'Vehicles and Transport'
  }
];

// Missing amenity translations (Norwegian names from seed data)
const amenityTranslations = [
  {
    key: 'amenity.Aircondition',
    nb: 'Aircondition',
    en: 'Air Conditioning'
  },
  {
    key: 'amenity.Dusjer',
    nb: 'Dusjer',
    en: 'Showers'
  },
  {
    key: 'amenity.Kaffe/te',
    nb: 'Kaffe/te',
    en: 'Coffee/Tea'
  },
  {
    key: 'amenity.Projektor',
    nb: 'Projektor',
    en: 'Projector'
  },
  {
    key: 'amenity.Tilgjengelig for rullestol',
    nb: 'Tilgjengelig for rullestol',
    en: 'Wheelchair Accessible'
  },
  {
    key: 'amenity.Whiteboard',
    nb: 'Whiteboard',
    en: 'Whiteboard'
  }
];

let added = 0;

// Add category translations
for (const cat of categoryTranslations) {
  const existsNb = translations.some(t => t.key === cat.key && t.language === 'nb');
  const existsEn = translations.some(t => t.key === cat.key && t.language === 'en');
  
  if (!existsNb) {
    translations.push({
      tenantId,
      namespace: 'common',
      key: cat.key,
      language: 'nb',
      value: cat.nb,
      isSystemDefault: true
    });
    added++;
  }
  
  if (!existsEn) {
    translations.push({
      tenantId,
      namespace: 'common',
      key: cat.key,
      language: 'en',
      value: cat.en,
      isSystemDefault: true
    });
    added++;
  }
}

// Add amenity translations
for (const amenity of amenityTranslations) {
  const existsNb = translations.some(t => t.key === amenity.key && t.language === 'nb');
  const existsEn = translations.some(t => t.key === amenity.key && t.language === 'en');
  
  if (!existsNb) {
    translations.push({
      tenantId,
      namespace: 'common',
      key: amenity.key,
      language: 'nb',
      value: amenity.nb,
      isSystemDefault: true
    });
    added++;
  }
  
  if (!existsEn) {
    translations.push({
      tenantId,
      namespace: 'common',
      key: amenity.key,
      language: 'en',
      value: amenity.en,
      isSystemDefault: true
    });
    added++;
  }
}

// Write back
writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf-8');

console.log(`✅ Added ${added} missing translations`);
console.log(`📦 Total translations: ${translations.length}`);
