#!/usr/bin/env node
/**
 * Automated TypeScript Error Fixes
 * Fixes common patterns across the codebase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'apps/backoffice/src');

// Get all TypeScript files
const files = glob.sync(`${srcDir}/**/*.{ts,tsx}`);

let totalFixes = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: TextField → Textfield import
  if (content.includes("import { TextField }") || content.includes("TextField,")) {
    content = content.replace(/(\{[^}]*)\bTextField\b([^}]*\})/g, '$1Textfield$2');
    content = content.replace(/<TextField\b/g, '<Textfield');
    content = content.replace(/<\/TextField>/g, '</Textfield>');
    modified = true;
    totalFixes++;
  }

  // Fix 2: FormField error prop - add || undefined
  // Pattern: error={errors.something}
  const errorPropRegex = /(<FormField[^>]*\berror=\{)([a-zA-Z_.]+)(\}[^>]*>)/g;
  if (errorPropRegex.test(content)) {
    content = content.replace(errorPropRegex, '$1$2 || undefined$3');
    modified = true;
    totalFixes++;
  }

  // Fix 3: Remove error prop from Select components
  // Pattern: <Select ... error={...} ...>
  const selectErrorRegex = /(<Select[^>]*)\s+error=\{[^}]+\}([^>]*>)/g;
  if (selectErrorRegex.test(content)) {
    content = content.replace(selectErrorRegex, '$1$2');
    modified = true;
    totalFixes++;
  }

  // Fix 4: Add aria-label to Spinner without it
  // Pattern: <Spinner /> or <Spinner>
  const spinnerRegex = /<Spinner\s*(?!.*aria-label)([^>]*)\/>/g;
  if (spinnerRegex.test(content)) {
    content = content.replace(spinnerRegex, '<Spinner aria-label="Laster" $1/>');
    modified = true;
    totalFixes++;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\n✅ Total files fixed: ${totalFixes}`);
