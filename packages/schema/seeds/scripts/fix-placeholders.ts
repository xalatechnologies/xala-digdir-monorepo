import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, '../platform/translations.json');
const rawData = fs.readFileSync(seedPath, 'utf-8');
const data = JSON.parse(rawData);
const entries = data.translations || data;

let fixed = 0;
for (const entry of entries) {
  if (entry.value && entry.value.startsWith('[') && entry.value.endsWith(']')) {
    const inner = entry.value.slice(1, -1);
    const readable = inner
      .replace(/_/g, ' ')
      .replace(/\./g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim();
    entry.value = readable;
    fixed++;
  }
}

if (data.translations) {
  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));
} else {
  fs.writeFileSync(seedPath, JSON.stringify(entries, null, 2));
}
console.log(`Fixed ${fixed} placeholder translations`);
console.log(`Total entries: ${entries.length}`);
