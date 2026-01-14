#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.tsx')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('src');

const gapToSpacing = {
  '4': 'var(--ds-spacing-1)',
  '5': 'var(--ds-spacing-1)',
  '8': 'var(--ds-spacing-1)',
  '12': 'var(--ds-spacing-2)',
  '16': 'var(--ds-spacing-2)',
  '20': 'var(--ds-spacing-3)',
  '24': 'var(--ds-spacing-3)',
  '32': 'var(--ds-spacing-4)',
};

files.forEach((file) => {
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  // Replace gap={number} with spacing="var(--ds-spacing-X)"
  Object.entries(gapToSpacing).forEach(([gap, spacing]) => {
    const regex = new RegExp(`gap={${gap}}`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `spacing="${spacing}"`);
      modified = true;
    }
  });

  // Replace direction="row" with direction="horizontal"
  if (content.includes('direction="row"')) {
    content = content.replace(/direction="row"/g, 'direction="horizontal"');
    modified = true;
  }

  // Replace direction="column" with direction="vertical"
  if (content.includes('direction="column"')) {
    content = content.replace(/direction="column"/g, 'direction="vertical"');
    modified = true;
  }

  if (modified) {
    writeFileSync(file, content, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done fixing Stack props');
