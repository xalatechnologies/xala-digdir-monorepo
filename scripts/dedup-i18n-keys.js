#!/usr/bin/env node
/* eslint-disable */
/**
 * Deduplicate i18n Translation Keys
 * 
 * Removes duplicate keys from nb.ts keeping only the first occurrence
 */

const fs = require('fs');
const path = require('path');

const nbPath = path.join(__dirname, '..', 'packages/i18n/src/locales/nb.ts');
const content = fs.readFileSync(nbPath, 'utf8');

console.log('🔍 Scanning for duplicate keys in nb.ts...\n');

// Extract all keys
const keyPattern = /^\s*'([^']+)':\s*'([^']*(?:\\'[^']*)*)'/gm;
const keys = new Map();
let match;
let duplicates = 0;

while ((match = keyPattern.exec(content)) !== null) {
  const key = match[1];
  const value = match[2];
  
  if (keys.has(key)) {
    duplicates++;
    console.log(`❌ Duplicate: ${key}`);
  } else {
    keys.set(key, value);
  }
}

console.log(`\n📊 Total unique keys: ${keys.size}`);
console.log(`📊 Duplicates found: ${duplicates}`);

if (duplicates === 0) {
  console.log('\n✅ No duplicates found!');
  process.exit(0);
}

// Rebuild file without duplicates
console.log('\n🔧 Removing duplicates...');
const lines = content.split('\n');
const seenKeys = new Set();
const newLines = [];

lines.forEach(line => {
  const keyMatch = line.match(/^\s*'([^']+)':/);
  
  if (keyMatch) {
    const key = keyMatch[1];
    
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
});

fs.writeFileSync(nbPath, newLines.join('\n'), 'utf8');
console.log(`✅ Deduplicated file saved: ${seenKeys.size} unique keys remaining`);
console.log(`✅ Removed ${duplicates} duplicate keys`);
